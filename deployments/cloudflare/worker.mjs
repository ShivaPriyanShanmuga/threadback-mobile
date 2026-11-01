import { createRemoteJWKSet, jwtVerify } from 'jose';

// Static Assets do not expose ctx.access to this Worker. Validate the Access
// JWT instead; never trust an email request header or an unsigned token.
const keySets = new Map();
function remoteKeys(issuer) {
  if (!keySets.has(issuer)) {
    if (keySets.size >= 4) keySets.clear();
    keySets.set(issuer, createRemoteJWKSet(new URL('/cdn-cgi/access/certs', issuer), {
      timeoutDuration: 5000,
      cooldownDuration: 30000,
      cacheMaxAge: 600000,
    }));
  }
  return keySets.get(issuer);
}

function configuration(env) {
  const issuer = env.ACCESS_TEAM_DOMAIN?.trim();
  const audience = env.ACCESS_AUD?.trim();
  const email = env.ACCESS_ALLOWED_EMAIL?.trim().toLowerCase();
  if (!/^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.cloudflareaccess\.com$/.test(issuer || '')
    || !audience || audience.length > 512
    || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }
  return { issuer, audience, email };
}

const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=()',
};
function deny(status = 403) {
  return new Response(status === 503 ? 'Private deployment is not configured.' : 'Sign in through Cloudflare Access to open Threadback.', {
    status,
    headers: { ...privateHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// Inject a key resolver only for offline signature-verification tests. The
// production export always obtains keys from the configured Cloudflare team.
export function createWorker(resolveKeys = remoteKeys) {
  return {
    async fetch(request, env) {
      const config = configuration(env);
      if (!config) return deny(503);
      const token = request.headers.get('Cf-Access-Jwt-Assertion');
      if (!token || token.length > 16384) return deny();
      try {
        const { payload } = await jwtVerify(token, resolveKeys(config.issuer), {
          issuer: config.issuer,
          audience: config.audience,
          algorithms: ['RS256'],
          requiredClaims: ['exp', 'iat', 'sub', 'email'],
          maxTokenAge: '24h',
        });
        if (payload.type !== 'app' || typeof payload.email !== 'string'
          || payload.email.toLowerCase() !== config.email) return deny();
      } catch {
        // A failed key fetch, malformed/expired token, or wrong claim all deny.
        // Do not expose token details, request headers, or identity in logs.
        return deny();
      }
      if (!['GET', 'HEAD'].includes(request.method)) {
        return new Response('Method not allowed', { status: 405, headers: { ...privateHeaders, Allow: 'GET, HEAD' } });
      }
      if (!env.ASSETS?.fetch) return deny(503);
      const url = new URL(request.url);
      if (url.pathname === '/') url.pathname = '/index.html';
      const asset = await env.ASSETS.fetch(new Request(url, request));
      const headers = new Headers(asset.headers);
      for (const [name, value] of Object.entries(privateHeaders)) headers.set(name, value);
      return new Response(request.method === 'HEAD' ? null : asset.body, { status: asset.status, statusText: asset.statusText, headers });
    },
  };
}

export default createWorker();
