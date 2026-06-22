import * as crypto from 'crypto';
import { verifyJwt, parseCookieToken } from './jwt.util';

const SECRET = 'test-secret-key';

function makeToken(payload: object, secret = SECRET, expiresInSec?: number) {
  const p = expiresInSec !== undefined
    ? { ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSec }
    : payload;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body   = Buffer.from(JSON.stringify(p)).toString('base64url');
  const sig    = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('verifyJwt', () => {
  it('returns sub and role for a valid token', () => {
    const token = makeToken({ sub: 'user-1', role: 'restaurant_owner' }, SECRET, 300);
    const result = verifyJwt(token, SECRET);
    expect(result).toEqual({ sub: 'user-1', role: 'restaurant_owner' });
  });

  it('returns null when the signature does not match', () => {
    const token = makeToken({ sub: 'user-1', role: 'restaurant_owner' }, 'wrong-secret', 300);
    expect(verifyJwt(token, SECRET)).toBeNull();
  });

  it('returns null for an expired token', () => {
    const token = makeToken({ sub: 'user-1', role: 'admin' }, SECRET, -1);
    expect(verifyJwt(token, SECRET)).toBeNull();
  });

  it('returns null for a malformed token', () => {
    expect(verifyJwt('not.a.valid.jwt.parts', SECRET)).toBeNull();
    expect(verifyJwt('', SECRET)).toBeNull();
    expect(verifyJwt('only-one-part', SECRET)).toBeNull();
  });

  it('treats missing exp as non-expiring', () => {
    const token = makeToken({ sub: 'user-2', role: 'admin' }); // no exp
    expect(verifyJwt(token, SECRET)).toEqual({ sub: 'user-2', role: 'admin' });
  });
});

describe('parseCookieToken', () => {
  it('extracts a named cookie from a cookie header', () => {
    expect(parseCookieToken('access_token=abc123; other=xyz', 'access_token')).toBe('abc123');
  });

  it('returns undefined when the cookie is absent', () => {
    expect(parseCookieToken('other=xyz', 'access_token')).toBeUndefined();
  });

  it('returns undefined for an empty or missing header', () => {
    expect(parseCookieToken(undefined, 'access_token')).toBeUndefined();
    expect(parseCookieToken('', 'access_token')).toBeUndefined();
  });

  it('URL-decodes cookie values', () => {
    expect(parseCookieToken('access_token=hello%20world', 'access_token')).toBe('hello world');
  });
});
