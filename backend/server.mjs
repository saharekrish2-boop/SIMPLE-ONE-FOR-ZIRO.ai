import express from 'express';
import helmet from 'helmet';
import PDFDocument from 'pdfkit';
import { openSync as openFont } from 'fontkit';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { createStore } from './store.mjs';
import { now, capabilities, authorities, extractUrls, safeMessage, workflow, buildReport } from './investigation.mjs';

const derive = promisify(scrypt);
export async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const key = await derive(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [salt, key] = encoded.split(':');
  const actual = await derive(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(key, 'hex'));
}
const publicUser = user => ({ id: user.id, name: user.name, email: user.email });
const digest = value => createHash('sha256').update(value).digest('hex');
const defangValue = value => {
  if (typeof value === 'string') return value.replace(/https:\/\//gi, 'hxxps://').replace(/http:\/\//gi, 'hxxp://');
  if (Array.isArray(value)) return value.map(defangValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, defangValue(entry)]));
  return value;
};

export function createApp({ store = createStore(), port = Number(process.env.PORT ?? 8765) } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], objectSrc: ["'none'"], frameAncestors: ["'none'"] } } }));
  const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`, '127.0.0.1:5173', 'localhost:5173']);
  const allowedOrigins = new Set([...allowedHosts].map(host => `http://${host}`));
  app.use((req, res, next) => {
    if (!allowedHosts.has(req.headers.host)) return res.status(403).json({ error: 'Unrecognized host.' });
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !allowedOrigins.has(req.headers.origin)) return res.status(403).json({ error: 'Same-origin browser requests are required.' });
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '128kb' }));
  const sessions = new Map(), attempts = new Map(), active = new Map();
  const sessionLifetime = 8 * 60 * 60 * 1000;
  const purgeTimer = setInterval(() => {
    for (const [key, value] of sessions) if (value.expires <= Date.now()) sessions.delete(key);
    for (const [key, value] of attempts) if (value.until <= Date.now()) attempts.delete(key);
  }, 60000);
  purgeTimer.unref();
  function loginSession(res, user, req) {
    if (req.sessionKey) sessions.delete(req.sessionKey);
    const token = randomBytes(32).toString('hex');
    sessions.set(digest(token), { userId: user.id, expires: Date.now() + sessionLifetime });
    res.cookie('cypher_session', token, { httpOnly: true, sameSite: 'strict', secure: false, maxAge: sessionLifetime, path: '/' });
    return publicUser(user);
  }
  app.use((req, _res, next) => {
    const cookie = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith('cypher_session='))?.slice('cypher_session='.length);
    if (cookie && /^[a-f0-9]{64}$/.test(cookie)) {
      const key = digest(cookie), session = sessions.get(key);
      if (session && session.expires > Date.now()) { req.user = store.userById(session.userId); req.sessionKey = key; }
      else sessions.delete(key);
    }
    next();
  });
  const auth = (req, res, next) => req.user ? next() : res.status(401).json({ error: 'Please sign in to access private case history.' });
  const rateLimit = (req, res, next) => {
    const key = `${req.ip}:${String(req.body?.email ?? '').toLowerCase()}`;
    const current = attempts.get(key);
    const record = !current || current.until <= Date.now() ? { count: 0, until: Date.now() + 15 * 60000 } : current;
    record.count++; attempts.set(key, record);
    if (record.count > 12) return res.status(429).json({ error: 'Too many authentication attempts. Try again in 15 minutes.' });
    next();
  };
  const credentials = (req, res, next) => {
    if (typeof req.body?.email !== 'string' || typeof req.body?.password !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email) || req.body.email.length > 254 || req.body.password.length < 12 || req.body.password.length > 128) return res.status(400).json({ error: 'Use a valid email and a password between 12 and 128 characters.' });
    req.body.email = req.body.email.toLowerCase().trim(); next();
  };
  const loadCase = (req, res, next) => {
    req.current = store.get(req.user.id, req.params.id);
    if (!req.current) return res.status(404).json({ error: 'Case not found.' });
    next();
  };

  app.get('/api/health', (_req, res) => res.json({ status: 'ready', mode: 'local', capabilities: capabilities(), authorities, storage: 'AES-256-GCM encrypted case payloads; encryption key lives beside the local database.', framework: 'LangGraph', reportMode: 'draft_and_download_only' }));
  app.get('/api/auth/me', auth, (req, res) => res.json({ user: req.user }));
  app.post('/api/auth/register', rateLimit, credentials, async (req, res) => {
    const name = String(req.body.name ?? '').trim();
    if (!name || name.length > 80) return res.status(400).json({ error: 'Provide a name of up to 80 characters.' });
    if (store.userByEmail(req.body.email)) return res.status(409).json({ error: 'Unable to create an account with those details. Try signing in.' });
    const user = { id: randomUUID(), name, email: req.body.email, passwordHash: await hashPassword(req.body.password), createdAt: now() };
    try { store.createUser(user); }
    catch (error) { if (error.code?.includes('CONSTRAINT')) return res.status(409).json({ error: 'Unable to create an account with those details. Try signing in.' }); throw error; }
    res.status(201).json({ user: loginSession(res, user, req) });
  });
  app.post('/api/auth/login', rateLimit, credentials, async (req, res) => {
    const user = store.userByEmail(req.body.email);
    const hash = user?.password_hash ?? `${'0'.repeat(32)}:${'0'.repeat(128)}`;
    if (!await verifyPassword(req.body.password, hash) || !user) return res.status(401).json({ error: 'Email or password is incorrect.' });
    res.json({ user: loginSession(res, user, req) });
  });
  app.post('/api/auth/logout', auth, (req, res) => {
    sessions.delete(req.sessionKey); res.clearCookie('cypher_session', { path: '/', sameSite: 'strict' }); res.json({ ok: true });
  });

  app.get('/api/cases', auth, (req, res) => res.json({ cases: store.list(req.user.id).map(current => ({ id: current.id, title: current.title, createdAt: current.createdAt, updatedAt: current.updatedAt, status: current.status, score: current.score, riskLevel: current.riskLevel, itemCount: current.items.length, reportStatus: current.reportStatus })) }));
  app.post('/api/cases', auth, (req, res) => {
    const body = req.body;
    if (!Array.isArray(body?.items) || body.items.length < 1 || body.items.length > 10 || !['en', 'hi'].includes(body.language ?? 'en') || typeof body.consentNetwork !== 'boolean' || typeof body.consentAI !== 'boolean') return res.status(400).json({ error: 'Provide 1–10 messages, a supported language, and explicit consent choices.' });
    if ((active.get(req.user.id) ?? 0) >= 2) return res.status(429).json({ error: 'Two investigations are already running. Wait for a case to finish.' });
    const items = [], unresolved = []; let links = 0;
    for (const entry of body.items) {
      if (typeof entry?.text !== 'string' || !entry.text.trim() || entry.text.length > 5000 || !['Clicked', 'Opened', 'Ignored', 'Entered Information', 'Unknown'].includes(entry.action)) return res.status(400).json({ error: 'Each message needs text (up to 5,000 characters) and a valid user action.' });
      const extracted = extractUrls(entry.text); links += extracted.valid.length;
      if (links > 15) return res.status(400).json({ error: 'Limit each batch to 15 unique message/link associations.' });
      const item = { id: randomUUID(), text: safeMessage(entry.text), action: entry.action, urls: extracted.valid, originalTextHash: digest(entry.text) };
      items.push(item); unresolved.push(...extracted.invalid.map(reason => `Item ${item.id}: ${reason}`));
    }
    const current = { id: store.nextCaseId(), title: `${items.length} message${items.length === 1 ? '' : 's'} · ${items[0].text.slice(0, 55)}`, createdAt: now(), updatedAt: now(), status: 'queued', language: body.language ?? 'en', consentNetwork: body.consentNetwork, consentAI: body.consentAI, items, evidence: [], findings: [], itemAssessments: [], unresolved, score: null, riskLevel: 'UNCERTAIN', summary: 'Investigation queued.', nextSteps: [], plan: { status: 'pending', decisions: [] }, aiAnalysis: { status: 'not_requested' }, report: null, reportStatus: 'Not Generated', caseReference: 'Pending' };
    if (items.some(item => item.action === 'Entered Information')) {
      current.nextSteps = current.language === 'hi'
        ? ['विश्वसनीय ऐप से उजागर पासवर्ड बदलें और संबंधित बैंक से तुरंत संपर्क करें। लिंक पर कोई और OTP, लॉगिन या भुगतान न करें।']
        : ['Immediately change exposed passwords through a trusted app and contact the relevant bank. Do not enter another OTP, login, or payment through the link.'];
    }
    const owner = req.user.id;
    store.commit(owner, current, 'case_created', `Batch created with ${items.length} messages. Network consent: ${body.consentNetwork}; AI consent: ${body.consentAI}.`);
    active.set(owner, (active.get(owner) ?? 0) + 1);
    res.status(202).json({ case: store.get(owner, current.id) });
    setImmediate(async () => {
      current.status = 'investigating'; current.updatedAt = now();
      store.commit(owner, current, 'investigation_started', 'LangGraph read-only workflow started.');
      try {
        const result = await workflow.invoke({ current, update: async partial => store.save(owner, { ...partial, updatedAt: now() }), audit: (action, detail) => store.audit(owner, current.id, action, detail) });
        store.commit(owner, result.current, 'investigation_completed', `Assessment ${result.current.riskLevel}; ${result.current.evidence.filter(entry => entry.status === 'verified').length} verified records. Missing checks remain visible.`);
      } catch {
        const preserved = store.get(owner, current.id);
        preserved.status = 'failed'; preserved.updatedAt = now(); preserved.unresolved.push('Investigation failed. Partial evidence is preserved; no success is claimed.');
        store.commit(owner, preserved, 'investigation_failed', 'Failed; partial evidence preserved.');
      } finally { active.set(owner, Math.max(0, (active.get(owner) ?? 1) - 1)); }
    });
  });
  app.get('/api/cases/:id', auth, loadCase, (req, res) => res.json({ case: req.current }));
  app.post('/api/cases/:id/report', auth, loadCase, (req, res) => {
    if (req.current.status !== 'complete') return res.status(409).json({ error: 'Wait for the investigation to complete before drafting a report.' });
    if (!authorities.some(entry => entry.id === req.body?.target) || !['en', 'hi'].includes(req.body?.language)) return res.status(400).json({ error: 'Select a valid authority and report language.' });
    const old = req.current.report;
    if (old && old.target === req.body.target && old.language === req.body.language) return res.json({ case: req.current });
    req.current.report = buildReport(req.current, req.body.target, req.body.language); req.current.reportStatus = 'Awaiting Approval'; req.current.updatedAt = now();
    store.commit(req.user.id, req.current, 'report_drafted', `Draft ${req.current.report.id}; target ${req.body.target}; factual evidence only. No external submission.`);
    res.json({ case: store.get(req.user.id, req.current.id) });
  });
  app.post('/api/cases/:id/report/approve', auth, loadCase, (req, res) => {
    const report = req.current.report;
    if (!report || req.body?.reportId !== report.id || digest(report.body) !== report.hash) return res.status(409).json({ error: 'The report changed or is unavailable. Review the current draft before approving.' });
    if (report.status !== 'Approved') {
      report.status = 'Approved'; report.approvedAt = now(); req.current.reportStatus = 'Approved'; req.current.updatedAt = now();
      store.commit(req.user.id, req.current, 'report_review_approved', `Draft ${report.id}, SHA-256 ${report.hash}, approved for manual sharing. Not submitted.`);
    }
    res.json({ case: store.get(req.user.id, req.current.id) });
  });
  app.get('/api/cases/:id/export.json', auth, loadCase, (req, res) => {
    store.audit(req.user.id, req.current.id, 'export_requested', 'Redacted, defanged JSON export requested.');
    const value = { formatVersion: 1, exportedAt: now(), safety: 'Links are defanged; exports never imply an authority submission.', case: defangValue(store.get(req.user.id, req.current.id)) };
    const bytes = Buffer.from(JSON.stringify(value, null, 2));
    store.audit(req.user.id, req.current.id, 'export_generated', `JSON export generated; SHA-256 ${digest(bytes)}.`);
    res.set({ 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="${req.current.id}.json"`, 'X-Content-SHA256': digest(bytes) }).send(bytes);
  });
  app.get('/api/cases/:id/export.pdf', auth, loadCase, async (req, res) => {
    if (!req.current.report) return res.status(409).json({ error: 'Generate a report draft first.' });
    const packagedFont = fileURLToPath(new URL('../node_modules/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff', import.meta.url));
    const fonts = [process.env.HINDI_FONT_PATH, packagedFont, 'C:/Windows/Fonts/Nirmala.ttf', 'C:/Windows/Fonts/mangal.ttf'].filter(Boolean);
    const hindiCharacters = [...new Set(req.current.report.body.match(/[\u0900-\u097f]/g) ?? [])];
    const font = fonts.find(path => {
      if (!existsSync(path)) return false;
      try { const parsed = openFont(path); return hindiCharacters.every(character => parsed.hasGlyphForCodePoint(character.codePointAt(0))); } catch { return false; }
    });
    if (hindiCharacters.length && !font) {
      store.audit(req.user.id, req.current.id, 'export_failed', 'No font covers the required Devanagari glyphs. JSON remains available.');
      return res.status(409).json({ error: 'The installed fonts do not cover this Hindi text. Configure HINDI_FONT_PATH; JSON is available.' });
    }
    store.audit(req.user.id, req.current.id, 'export_requested', 'Redacted PDF case export requested.');
    const timeline = store.timeline(req.user.id, req.current.id);
    const document = new PDFDocument({ size: 'A4', margin: 45, info: { Title: `${req.current.id} — Cypher draft case report`, Author: 'Cypher' } });
    const parts = [];
    const ready = new Promise((resolve, reject) => { document.on('data', part => parts.push(part)); document.on('end', () => resolve(Buffer.concat(parts))); document.on('error', reject); });
    if (font) document.registerFont('Hindi', font);
    document.fontSize(10);
    for (const line of req.current.report.body.split('\n')) {
      const runs = line.match(/[\u0900-\u097f]+|[^\u0900-\u097f]+/g) ?? [];
      if (!runs.length) { document.moveDown(0.5); continue; }
      runs.forEach((run, index) => document.font(/[\u0900-\u097f]/.test(run) ? 'Hindi' : 'Helvetica').text(run, { continued: index < runs.length - 1, lineGap: 3 }));
    }
    document.addPage().font('Helvetica').fontSize(11).text('CASE AUDIT TIMELINE').moveDown().fontSize(8);
    for (const event of timeline) document.text(`${event.at} | ${event.action}\n${event.result}\nHash: ${event.hash}\n`, { lineGap: 2 }).moveDown();
    document.end();
    const bytes = await ready;
    store.audit(req.user.id, req.current.id, 'export_generated', `PDF export generated; SHA-256 ${digest(bytes)}. Draft/review only; not submitted.`);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${req.current.id}.pdf"`, 'X-Content-SHA256': digest(bytes) }).send(bytes);
  });
  const frontend = fileURLToPath(new URL('../frontend/dist/', import.meta.url));
  if (existsSync(frontend)) app.use(express.static(frontend));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown API operation. External report submission is not implemented.' }));
  app.use((error, _req, res, _next) => {
    const status = error.status === 413 ? 413 : error.type === 'entity.parse.failed' ? 400 : 500;
    res.status(status).json({ error: status === 500 ? 'The operation failed. No successful outcome is claimed; check local storage integrity and retry.' : 'Request body is invalid or exceeds the size limit.' });
  });
  return { app, store, shutdown: () => { clearInterval(purgeTimer); store.close(); } };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const host = process.env.HOST ?? '127.0.0.1';
  if (!['127.0.0.1', 'localhost'].includes(host)) throw new Error('This local-first build only binds to the loopback interface.');
  const port = Number(process.env.PORT ?? 8765);
  const instance = createApp({ port }); instance.store.recoverInterrupted();
  const server = instance.app.listen(port, host, () => console.log(`Cypher API ready at http://${host}:${port} · private local history · drafts only`));
  server.on('error', error => { console.error(`Cypher API could not start: ${error.code}`); process.exitCode = 1; instance.shutdown(); });
  const stop = () => server.close(() => { instance.shutdown(); process.exit(0); });
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
}
