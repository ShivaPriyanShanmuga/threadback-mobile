import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateKeyPair, SignJWT } from 'jose';
import worker, { createWorker } from '../worker.mjs';

const { privateKey, publicKey } = await generateKeyPair('RS256');
const env = { ACCESS_TEAM_DOMAIN: 'https://threadback-test.cloudflareaccess.com', ACCESS_AUD: 'test-app-audience', ACCESS_ALLOWED_EMAIL: 'owner@example.com' };
const sign = (claims = {}, options = {}) => new SignJWT({ email: 'owner@example.com', type: 'app', ...claims })
  .setProtectedHeader({ alg: 'RS256' }).setIssuer(options.issuer || env.ACCESS_TEAM_DOMAIN)
  .setAudience(options.audience || env.ACCESS_AUD).setSubject('test-user')
  .setIssuedAt().setExpirationTime(options.expires || '1h').sign(privateKey);
const request = (path, token, options = {}) => new Request('https://threadback.example.com' + path, {
  ...options, headers: { ...(token ? { 'Cf-Access-Jwt-Assertion': token } : {}), ...options.headers },
});
function harness(keys = publicKey) {
  const calls = [];
  return { calls, app: createWorker(() => keys), env: { ...env, ASSETS: { fetch: async req => {
    calls.push(new URL(req.url).pathname);
    return new Response('private asset', { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' } });
  } } } };
}

test('every static route runs authentication before asset serving', async () => {
  const { app, env, calls } = harness();
  for (const path of ['/', '/index.html', '/app.mjs', '/assets/icon.svg', '/sw.js', '/manifest.webmanifest']) {
    assert.equal((await app.fetch(request(path), env)).status, 403);
  }
  assert.deepEqual(calls, []);
  const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.assets.run_worker_first, true);
  assert.equal(config.preview_urls, false);
});

test('missing or unsafe configuration denies instead of exposing the bundle', async () => {
  const { app, calls, env: full } = harness();
  for (const partial of [{}, { ...full, ACCESS_ALLOWED_EMAIL: '' }, { ...full, ACCESS_AUD: '' }, { ...full, ACCESS_TEAM_DOMAIN: 'https://attacker.example' }]) {
    assert.equal((await app.fetch(request('/app.mjs'), partial)).status, 503);
  }
  assert.deepEqual(calls, []);
});

test('a verified owner token serves assets with private response headers', async () => {
  const { app, env, calls } = harness();
  const response = await app.fetch(request('/', await sign()), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'private asset');
  assert.deepEqual(calls, ['/index.html']);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(response.headers.get('Permissions-Policy'), 'camera=(self), microphone=(self), geolocation=()');
});

test('valid signature with the wrong email, issuer, audience, expiry, or token type is rejected', async () => {
  const { app, env, calls } = harness();
  const tokens = await Promise.all([
    sign({ email: 'someone-else@example.com' }), sign({ type: 'service' }),
    sign({}, { issuer: 'https://other-team.cloudflareaccess.com' }),
    sign({}, { audience: 'other-app' }), sign({}, { expires: '0s' }),
  ]);
  for (const token of tokens) assert.equal((await app.fetch(request('/app.mjs', token), env)).status, 403);
  assert.deepEqual(calls, []);
});

test('spoofed identity headers and an unsigned or tampered token cannot authorize access', async () => {
  const { app, env, calls } = harness();
  assert.equal((await app.fetch(request('/', null, { headers: { 'Cf-Access-Authenticated-User-Email': env.ACCESS_ALLOWED_EMAIL } }), env)).status, 403);
  const token = await sign();
  const parts = token.split('.');
  const originalClaims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  parts[1] = Buffer.from(JSON.stringify({ ...originalClaims, nonce: 'tampered-with-otherwise-valid-claims' })).toString('base64url');
  for (const invalid of [parts.join('.'), 'eyJhbGciOiJub25lIn0.eyJlbWFpbCI6Im93bmVyQGV4YW1wbGUuY29tIn0.', 'bad-token']) {
    assert.equal((await app.fetch(request('/index.html', invalid), env)).status, 403);
  }
  assert.deepEqual(calls, []);
});

test('key lookup failure denies access without calling assets or exposing the error', async () => {
  const app = createWorker(() => { throw new Error('private key lookup detail'); });
  const response = await app.fetch(request('/', await sign()), env);
  assert.equal(response.status, 403);
  assert.doesNotMatch(await response.text(), /private key/);
});

test('HEAD and unsupported methods keep authorization and body semantics', async () => {
  const { app, env } = harness();
  const token = await sign({ email: 'OWNER@example.com' });
  const head = await app.fetch(request('/', token, { method: 'HEAD' }), env);
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal((await app.fetch(request('/', token, { method: 'POST' }), env)).status, 405);
});

test('the production export denies anonymous access before remote key lookup', async () => {
  assert.equal((await worker.fetch(request('/app.mjs'), env)).status, 403);
});
