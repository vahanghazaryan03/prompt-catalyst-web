import tokenService from './tokenService';

/**
 * The bridge between two identity providers.
 *
 * Every authenticated request in the app takes its bearer token from here, and
 * for the duration of the migration two kinds of session can exist: a Supabase
 * session written by the SDK, and a WordPress token issued before the cutover.
 * Choosing wrong signs someone out, so the fallback behaviour is worth pinning.
 */

const SUPABASE_KEY = 'pc-auth';
const LEGACY_KEY = 'authToken';

const nowInSeconds = () => Math.floor(Date.now() / 1000);

const writeSupabaseSession = (session) =>
  localStorage.setItem(SUPABASE_KEY, JSON.stringify(session));

beforeEach(() => {
  localStorage.clear();
});

describe('token selection', () => {
  it('uses the legacy token when there is no Supabase session', () => {
    localStorage.setItem(LEGACY_KEY, 'legacy-wordpress-token');

    expect(tokenService.getToken()).toBe('legacy-wordpress-token');
    expect(tokenService.isSupabaseSession()).toBe(false);
  });

  it('prefers a live Supabase session over the legacy token', () => {
    localStorage.setItem(LEGACY_KEY, 'legacy-wordpress-token');
    writeSupabaseSession({ access_token: 'supabase-token', expires_at: nowInSeconds() + 3600 });

    expect(tokenService.getToken()).toBe('supabase-token');
    expect(tokenService.isSupabaseSession()).toBe(true);
  });

  it('returns null when nobody is signed in', () => {
    expect(tokenService.getToken()).toBeNull();
  });

  it('serves a Supabase session even with no legacy token present', () => {
    writeSupabaseSession({ access_token: 'supabase-only', expires_at: nowInSeconds() + 3600 });

    expect(tokenService.getToken()).toBe('supabase-only');
  });
});

describe('falling back rather than sending a dead token', () => {
  it('ignores an expired Supabase session', () => {
    localStorage.setItem(LEGACY_KEY, 'legacy-wordpress-token');
    writeSupabaseSession({ access_token: 'stale', expires_at: nowInSeconds() - 10 });

    expect(tokenService.getToken()).toBe('legacy-wordpress-token');
  });

  it('ignores a session inside the expiry skew, so it is not sent mid-flight', () => {
    localStorage.setItem(LEGACY_KEY, 'legacy-wordpress-token');
    writeSupabaseSession({ access_token: 'nearly-expired', expires_at: nowInSeconds() + 30 });

    expect(tokenService.getToken()).toBe('legacy-wordpress-token');
  });

  it('survives a corrupt session entry instead of breaking every request', () => {
    localStorage.setItem(LEGACY_KEY, 'legacy-wordpress-token');
    localStorage.setItem(SUPABASE_KEY, '{ not json');

    expect(tokenService.getToken()).toBe('legacy-wordpress-token');
  });

  it('ignores a session object with no access token', () => {
    localStorage.setItem(LEGACY_KEY, 'legacy-wordpress-token');
    writeSupabaseSession({ refresh_token: 'only-a-refresh-token' });

    expect(tokenService.getToken()).toBe('legacy-wordpress-token');
  });
});

describe('refreshing', () => {
  it('leaves a Supabase session to the SDK and returns its current token', async () => {
    writeSupabaseSession({ access_token: 'supabase-token', expires_at: nowInSeconds() + 3600 });

    await expect(tokenService.refreshToken()).resolves.toBe('supabase-token');
  });

  it('does not run the legacy refresh timer for a Supabase session', () => {
    writeSupabaseSession({ access_token: 'supabase-token', expires_at: nowInSeconds() + 3600 });

    expect(tokenService.needsRefresh()).toBe(false);
  });

  it('returns null rather than throwing when nothing is signed in', async () => {
    await expect(tokenService.refreshToken()).resolves.toBeNull();
  });

  /**
   * The server that issued and refreshed these no longer exists, so the only
   * correct outcome is to drop the session and let the user sign in again.
   */
  it('drops a legacy session it can no longer refresh and announces it', async () => {
    localStorage.setItem(LEGACY_KEY, 'legacy-wordpress-token');
    const expired = jest.fn();
    window.addEventListener('tokenExpired', expired);

    await expect(tokenService.refreshToken()).rejects.toThrow(/no longer be refreshed/i);

    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);
    window.removeEventListener('tokenExpired', expired);
  });
});

describe('clearing', () => {
  it('removes the legacy token', () => {
    localStorage.setItem(LEGACY_KEY, 'legacy-wordpress-token');

    tokenService.clearToken();

    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });
});
