import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomBytes, createCipheriv, createDecipheriv, createHmac, timingSafeEqual } from 'node:crypto';

export function createStore(directory = fileURLToPath(new URL('./data/', import.meta.url))) {
  mkdirSync(directory, { recursive: true });
  const keyPath = `${directory}/encryption.key`;
  if (!existsSync(keyPath)) {
    if (existsSync(`${directory}/cypher.sqlite`)) throw new Error('Case encryption key is missing. Restore the original key; do not replace it.');
    writeFileSync(keyPath, randomBytes(32), { mode: 0o600, flag: 'wx' });
  }
  const key = readFileSync(keyPath);
  if (key.length !== 32) throw new Error('Invalid case encryption key. Restore the original key from a trusted backup.');
  const db = new DatabaseSync(`${directory}/cypher.sqlite`);
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES users(id), payload TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audits (id INTEGER PRIMARY KEY AUTOINCREMENT, case_id TEXT NOT NULL REFERENCES cases(id), owner TEXT NOT NULL, at TEXT NOT NULL, action TEXT NOT NULL, payload TEXT NOT NULL, previous_hash TEXT NOT NULL, hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS case_counters (day TEXT PRIMARY KEY, value INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS cases_owner ON cases(owner, updated_at);
    CREATE INDEX IF NOT EXISTS audits_case ON audits(case_id, id);
  `);
  const sign = value => createHmac('sha256', key).update(value).digest('hex');
  function encrypt(value, aad) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from(aad));
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
    return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join('.');
  }
  function decrypt(value, aad) {
    const [iv, tag, payload] = value.split('.').map(part => Buffer.from(part, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(Buffer.from(aad)); decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(payload), decipher.final()]).toString());
  }
  let depth = 0;
  function transaction(callback) {
    if (depth) return callback();
    db.exec('BEGIN IMMEDIATE'); depth++;
    try { const value = callback(); db.exec('COMMIT'); return value; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
    finally { depth--; }
  }
  const store = {
    db,
    createUser(user) { db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(user.id, user.name, user.email, user.passwordHash, user.createdAt); },
    userByEmail(email) { return db.prepare('SELECT * FROM users WHERE email=?').get(email); },
    userById(id) { return db.prepare('SELECT id,name,email FROM users WHERE id=?').get(id); },
    nextCaseId() {
      const day = new Date().toISOString().slice(0, 10).replaceAll('-', '');
      const row = db.prepare('INSERT INTO case_counters VALUES (?,1) ON CONFLICT(day) DO UPDATE SET value=value+1 RETURNING value').get(day);
      return `CYPR-${day}-${String(row.value).padStart(4, '0')}`;
    },
    save(owner, current) {
      const value = { ...current }; delete value.timeline;
      const existing = db.prepare('SELECT owner,payload FROM cases WHERE id=?').get(current.id);
      if (existing && existing.owner !== owner) throw new Error('Case ownership mismatch.');
      value.auditHead = existing ? decrypt(existing.payload, `${owner}:${current.id}`).auditHead : 'GENESIS';
      db.prepare('INSERT INTO cases VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at').run(current.id, owner, encrypt(value, `${owner}:${current.id}`), current.createdAt, current.updatedAt);
    },
    commit(owner, current, action, result) {
      transaction(() => { this.save(owner, current); this.audit(owner, current.id, action, result); });
    },
    list(owner) {
      return db.prepare('SELECT * FROM cases WHERE owner=? ORDER BY updated_at DESC').all(owner).map(row => decrypt(row.payload, `${owner}:${row.id}`));
    },
    get(owner, id) {
      const row = db.prepare('SELECT payload FROM cases WHERE id=? AND owner=?').get(id, owner);
      if (!row) return null;
      const current = decrypt(row.payload, `${owner}:${id}`);
      return { ...current, timeline: this.timeline(owner, id) };
    },
    audit(owner, caseId, action, result) {
      transaction(() => {
        const row = db.prepare('SELECT payload FROM cases WHERE id=? AND owner=?').get(caseId, owner);
        if (!row) throw new Error('Case not found.');
        this.timeline(owner, caseId);
        const current = decrypt(row.payload, `${owner}:${caseId}`);
        const at = new Date().toISOString(), previous = current.auditHead;
        const payload = encrypt({ result, actor: owner }, `${owner}:${caseId}:${at}:${action}`);
        const hash = sign(`${caseId}|${owner}|${at}|${action}|${payload}|${previous}`);
        db.prepare('INSERT INTO audits(case_id,owner,at,action,payload,previous_hash,hash) VALUES (?,?,?,?,?,?,?)').run(caseId, owner, at, action, payload, previous, hash);
        current.auditHead = hash;
        db.prepare('UPDATE cases SET payload=? WHERE id=? AND owner=?').run(encrypt(current, `${owner}:${caseId}`), caseId, owner);
      });
    },
    timeline(owner, caseId) {
      const row = db.prepare('SELECT payload FROM cases WHERE id=? AND owner=?').get(caseId, owner);
      if (!row) return [];
      const expectedHead = decrypt(row.payload, `${owner}:${caseId}`).auditHead;
      const rows = db.prepare('SELECT * FROM audits WHERE case_id=? AND owner=? ORDER BY id').all(caseId, owner);
      let previous = 'GENESIS';
      const events = rows.map(entry => {
        const expected = sign(`${caseId}|${owner}|${entry.at}|${entry.action}|${entry.payload}|${previous}`);
        const actualBytes = Buffer.from(entry.hash), expectedBytes = Buffer.from(expected);
        if (entry.previous_hash !== previous || actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) throw new Error('Audit integrity verification failed.');
        previous = entry.hash;
        const details = decrypt(entry.payload, `${owner}:${caseId}:${entry.at}:${entry.action}`);
        return { id: entry.id, at: entry.at, action: entry.action, result: details.result, actor: details.actor, hash: entry.hash };
      });
      if (previous !== expectedHead) throw new Error('Audit integrity verification failed: the audit chain was truncated.');
      return events;
    },
    recoverInterrupted() {
      for (const row of db.prepare('SELECT * FROM cases').all()) {
        const current = decrypt(row.payload, `${row.owner}:${row.id}`);
        if (['queued', 'investigating'].includes(current.status)) {
          current.status = 'failed'; current.updatedAt = new Date().toISOString();
          current.unresolved.push('Investigation was interrupted by a server restart. Preserved evidence is incomplete; start a new investigation to retry.');
          this.commit(row.owner, current, 'investigation_interrupted', 'Failed; partial evidence retained.');
        }
      }
    },
    close() { db.close(); },
  };
  return store;
}
