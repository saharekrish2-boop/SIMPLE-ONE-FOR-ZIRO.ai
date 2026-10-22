import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { createStore } from '../backend/store.mjs';
import { createApp, hashPassword, verifyPassword } from '../backend/server.mjs';
import { extractUrls, safeMessage, isPublicAddress, validNetworkHost, assess, buildReport, validatePlan, validateFollowUps } from '../backend/investigation.mjs';

const directory = mkdtempSync(join(tmpdir(), 'cypher-test-'));
const store = createStore(directory);
const probe = createServer();
probe.listen(0, '127.0.0.1');
await new Promise(resolve => probe.once('listening', resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const { app, shutdown } = createApp({ store, port });
const server = app.listen(port, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${port}`;
let cookie, caseId;
async function request(path, method = 'GET', body, token = cookie, origin = base) {
  const response = await fetch(`${base}${path}`, { method, headers: { Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Cookie: token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const contentType = response.headers.get('content-type') ?? '';
  const value = contentType.includes('json') ? await response.json() : Buffer.from(await response.arrayBuffer());
  return { response, value };
}

try {
  await test('Public-address and host safety filters block private/reserved targets', () => {
    for (const address of ['127.0.0.1', '10.1.2.3', '192.168.0.1', '169.254.169.254', '100.64.0.1', '::1', 'fc00::1', '::ffff:127.0.0.1', '203.0.113.4']) assert.equal(isPublicAddress(address), false, address);
    assert.equal(isPublicAddress('1.1.1.1'), true);
    for (const host of ['localhost', '127.0.0.1', '[::1]', 'evil.local', 'foo.invalid', 'foo.onion']) assert.equal(validNetworkHost(host), false, host);
    assert.equal(validNetworkHost('example.com'), true);
  });
  await test('Redacts sensitive message values and query tokens', () => {
    const text = 'OTP: 123456. Email person@example.com at https://example.com/login?token=superSecretValue';
    const safe = safeMessage(text);
    assert.ok(!safe.includes('123456')); assert.ok(!safe.includes('person@example.com')); assert.ok(!safe.includes('superSecretValue'));
    assert.ok(!safeMessage('password: aB!29@xy').includes('aB!29@xy'));
    assert.ok(!safeMessage('https://example.com/reset/averylongprivatesecrettoken123456789').includes('averylongprivatesecrettoken123456789'));
    assert.ok(safeMessage('Please use the password reset option.').includes('password reset'));
    const parsed = extractUrls('https://example.com/a https://example.com/a http://user:pass@example.com https://127.0.0.1:9000');
    assert.equal(parsed.valid.length, 1); assert.equal(parsed.invalid.length, 2);
  });
  await test('Passwords use salted scrypt hashes', async () => {
    const password = 'a-test-password-123';
    const hash = await hashPassword(password);
    assert.ok(await verifyPassword(password, hash)); assert.equal(await verifyPassword('incorrect-password', hash), false);
    assert.notEqual(await hashPassword(password), hash);
  });
  await test('Rejects foreign-origin account mutation and anonymous case access', async () => {
    assert.equal((await request('/api/auth/register', 'POST', { name: 'Test', email: 'test@example.com', password: 'testing-secure-password' }, null, 'https://untrusted.invalid')).response.status, 403);
    assert.equal((await request('/api/cases', 'GET', undefined, null)).response.status, 401);
  });
  await test('Registers an account and performs an honest batch investigation', async () => {
    const registered = await request('/api/auth/register', 'POST', { name: 'Test Analyst', email: 'test@example.com', password: 'testing-secure-password' }, null);
    assert.equal(registered.response.status, 201);
    cookie = registered.response.headers.get('set-cookie').split(';')[0];
    const created = await request('/api/cases', 'POST', { items: [{ text: 'Your bank account will be blocked today. Verify your OTP at https://example.com/login', action: 'Ignored' }, { text: 'आपका खाता आज बंद होगा। ओटीपी भेजें।', action: 'Unknown' }], language: 'en', consentNetwork: false, consentAI: false });
    assert.equal(created.response.status, 202); caseId = created.value.case.id;
    let current;
    for (let attempt = 0; attempt < 20; attempt++) { current = (await request(`/api/cases/${caseId}`)).value.case; if (current.status === 'complete') break; }
    assert.equal(current.status, 'complete'); assert.equal(current.items.length, 2); assert.equal(current.riskLevel, 'HIGH'); assert.equal(current.score, 70);
    assert.ok(current.evidence.some(entry => entry.type === 'Website inspection' && entry.status === 'unavailable'));
    assert.ok(current.evidence.every(entry => entry.type !== 'TLS certificate' || entry.status === 'unavailable'));
    assert.equal(current.caseReference, 'Pending'); assert.equal(current.aiAnalysis.status, 'not_requested');
    assert.ok(current.timeline.some(entry => entry.action === 'investigation_completed'));
    const bytes = readFileSync(join(directory, 'cypher.sqlite'));
    assert.ok(!bytes.includes(Buffer.from('Your bank account will be blocked today')));
  });
  await test('Planning loop stays off without AI consent and validatePlan enforces the safety allowlist', async () => {
    // Reuse the completed case from the prior test (consentAI:false): the planner must not have run.
    const existing = (await request(`/api/cases/${caseId}`)).value.case;
    assert.equal(existing.plan.status, 'not_requested');
    assert.equal(existing.plan.decisions.length, 0);

    // validatePlan must reject invented hosts, unknown checks, and force a known host even when the model omits checks.
    const hosts = ['example.com', 'bank-example.com'];
    const raw = { plan: [
      { host: 'example.com', checks: ['RDAP / WHOIS', 'TLS certificate', 'Domain reputation', 'Arbitrary shell', 'RDAP / WHOIS'], reason: 'Check registration age.' },
      { host: 'evil-attacker.example', checks: ['DNS'], reason: 'Not a permitted host — must be dropped.' },
      { host: 'bank-example.com', checks: 'not-an-array', reason: 'x'.repeat(500) },
    ] };
    const decisions = validatePlan(raw, hosts);
    assert.equal(decisions.length, 2, 'unknown host dropped');
    assert.deepEqual(decisions[0].checks, ['RDAP / WHOIS', 'TLS certificate', 'Domain reputation'], 'unknown check dropped, deduped');
    assert.ok(decisions.every(entry => ['example.com', 'bank-example.com'].includes(entry.host)));
    assert.ok(decisions[1].reason.length <= 300, 'reason truncated to limit');
    assert.equal(decisions[1].checks.length, 0, 'non-array checks become empty (DNS still runs in the pipeline)');
    assert.equal(validatePlan({ plan: 'malformed' }, hosts), null, 'no valid host returns null so the full suite is used');
    assert.equal(validatePlan({}, hosts), null);

    // validateFollowUps must accept only host/check pairs present in the candidate list.
    const candidates = [{ host: 'example.com', check: 'TLS certificate' }, { host: 'bank-example.com', check: 'Domain reputation' }];
    const follow = validateFollowUps({ followUps: [
      { host: 'example.com', check: 'TLS certificate', reason: 'Confirm expiry.' },
      { host: 'example.com', check: 'Domain reputation', reason: 'Not deferred for this host — dropped.' },
      { host: 'evil.example', check: 'TLS certificate', reason: 'Unknown host — dropped.' },
      { host: 'bank-example.com', check: 'Domain reputation', reason: 'y'.repeat(400) },
    ] }, candidates);
    assert.equal(follow.length, 2, 'only candidate host/check pairs accepted');
    assert.equal(follow[0].host, 'example.com'); assert.equal(follow[0].check, 'TLS certificate');
    assert.ok(follow[1].reason.length <= 300);
    assert.equal(validateFollowUps({}, candidates), null, 'missing array becomes null');
    assert.deepEqual(validateFollowUps({ followUps: [{ host: 'nope.example', check: 'DNS' }] }, candidates), [], 'all-invalid candidates yield no follow-ups');
  });
  await test('Drafts contain facts, exclude assumptions, and duplicate approval is idempotent', async () => {
    const result = await request(`/api/cases/${caseId}/report`, 'POST', { target: 'ncrp', language: 'en' });
    assert.equal(result.response.status, 200);
    const report = result.value.case.report;
    assert.ok(report.body.includes('DRAFT, NOT SUBMITTED'));
    assert.ok(!report.body.includes('Financial-themed domain')); assert.ok(!report.body.includes('AI analyst commentary'));
    const repeated = await request(`/api/cases/${caseId}/report`, 'POST', { target: 'ncrp', language: 'en' });
    assert.equal(repeated.value.case.report.id, report.id);
    assert.equal((await request(`/api/cases/${caseId}/report/approve`, 'POST', { reportId: 'stale-id' })).response.status, 409);
    for (let count = 0; count < 2; count++) assert.equal((await request(`/api/cases/${caseId}/report/approve`, 'POST', { reportId: report.id })).value.case.reportStatus, 'Approved');
    const current = (await request(`/api/cases/${caseId}`)).value.case;
    assert.equal(current.timeline.filter(entry => entry.action === 'report_review_approved').length, 1);
    assert.equal(current.caseReference, 'Pending');
    assert.equal((await request(`/api/cases/${caseId}/submit`, 'POST', {})).response.status, 404);
  });
  await test('JSON and PDF are real downloadable case files with audit records', async () => {
    const json = await request(`/api/cases/${caseId}/export.json`);
    assert.equal(json.response.status, 200); assert.ok(json.response.headers.get('content-disposition').includes('.json'));
    assert.ok(json.value.case.items[0].urls[0].url.startsWith('hxxps://'));
    const pdf = await request(`/api/cases/${caseId}/export.pdf`);
    assert.equal(pdf.response.status, 200); assert.ok(pdf.value.subarray(0, 4).toString() === '%PDF');
    const current = (await request(`/api/cases/${caseId}`)).value.case;
    assert.equal(current.timeline.filter(entry => entry.action === 'export_generated').length, 2);
  });
  await test('Private case ownership is enforced between accounts', async () => {
    const registered = await request('/api/auth/register', 'POST', { name: 'Other', email: 'other@example.com', password: 'another-secure-password' }, null);
    const other = registered.response.headers.get('set-cookie').split(';')[0];
    assert.equal((await request(`/api/cases/${caseId}`, 'GET', undefined, other)).response.status, 404);
    assert.equal((await request(`/api/cases/${caseId}/export.json`, 'GET', undefined, other)).response.status, 404);
    assert.equal((await request('/api/cases', 'GET', undefined, other)).value.cases.length, 0);
  });
  await test('Cases survive a fresh store connection with their verified audit history', () => {
    const reopened = createStore(directory);
    try {
      const owner = reopened.userByEmail('test@example.com').id;
      const restored = reopened.get(owner, caseId);
      assert.equal(restored.report.status, 'Approved'); assert.equal(restored.items.length, 2);
      assert.ok(restored.timeline.some(entry => entry.action === 'export_generated'));
    } finally { reopened.close(); }
  });
  await test('Missing indicators are UNCERTAIN, not a fabricated safe verdict', () => {
    const result = assess([{ id: 'item', text: 'Please visit this link.', urls: [{ url: 'https://example.com', hostname: 'example.com' }] }], []);
    assert.equal(result.score, null); assert.equal(result.riskLevel, 'UNCERTAIN');
  });
  await test('Encrypted case persistence and chained audit detect modifications', () => {
    const row = store.db.prepare('SELECT * FROM audits WHERE case_id=? ORDER BY id LIMIT 1').get(caseId);
    store.db.prepare('UPDATE audits SET action=? WHERE id=?').run('tampered', row.id);
    assert.throws(() => store.get(store.userByEmail('test@example.com').id, caseId), /integrity/);
    store.db.prepare('UPDATE audits SET action=? WHERE id=?').run(row.action, row.id);
    assert.ok(store.get(store.userByEmail('test@example.com').id, caseId));
    const tail = store.db.prepare('SELECT * FROM audits WHERE case_id=? ORDER BY id DESC LIMIT 1').get(caseId);
    store.db.prepare('DELETE FROM audits WHERE id=?').run(tail.id);
    assert.throws(() => store.get(store.userByEmail('test@example.com').id, caseId), /truncated/);
  });
  await test('Multiple paths on one financial-themed domain do not inflate the score', () => {
    const urls = Array.from({ length: 15 }, (_, index) => ({ url: `https://bank-example.com/${index}`, hostname: 'bank-example.com' }));
    const result = assess([{ id: 'dedup', text: 'Review these references.', urls }], []);
    assert.equal(result.score, 5); assert.equal(result.findings.length, 1);
  });
  await test('Redacted distinct links retain separate source hashes', () => {
    const { valid } = extractUrls('https://example.com/reset/privateA https://example.com/reset/privateB');
    assert.equal(valid.length, 2); assert.equal(valid[0].url, valid[1].url);
    assert.notEqual(valid[0].originalUrlHash, valid[1].originalUrlHash);
    assert.ok(valid.every(entry => !entry.url.includes('private')));
  });
} finally {
  await new Promise(resolve => server.close(resolve)); shutdown();
  rmSync(directory, { recursive: true, force: true });
}
