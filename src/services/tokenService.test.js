import tokenService from './tokenService';

/**
 * Where every authenticated request gets its bearer token.
 *
 * A Supabase session written by the SDK takes precedence; a token left over
 * from a previous provider is recognised only so it can be retired cleanly.
 * Choosing wrong signs someone out, so the fallback behaviour is pinned here.
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
  it('falls back to a stored token when there is no Supabase session', () => {
    localStorage.setItem(LEGACY_KEY, 'previous-provider-token');

    expect(tokenService.getToken()).toBe('previous-provider-token');
    expect(tokenService.isSupabaseSession()).toBe(false);
  });

  it('prefers a live Supabase session over a stored token', () => {
    localStorage.setItem(LEGACY_KEY, 'previous-provider-token');
    writeSupabaseSession({ access_token: 'supabase-token', expires_at: nowInSeconds() + 3600 });

    expect(tokenService.getToken()).toBe('supabase-token');
    expect(tokenService.isSupabaseSession()).toBe(true);
  });

  it('returns null when nobody is signed in', () => {
    expect(tokenService.getToken()).toBeNull();
  });

  it('serves a Supabase session with nothing else stored', () => {
    writeSupabaseSession({ access_token: 'supabase-only', expires_at: nowInSeconds() + 3600 });

    expect(tokenService.getToken()).toBe('supabase-only');
  });
});

describe('falling back rather than sending a dead token', () => {
  it('ignores an expired Supabase session', () => {
    localStorage.setItem(LEGACY_KEY, 'previous-provider-token');
    writeSupabaseSession({ access_token: 'stale', expires_at: nowInSeconds() - 10 });

    expect(tokenService.getToken()).toBe('previous-provider-token');
  });

  it('ignores a session inside the expiry skew, so it is not sent mid-flight', () => {
    localStorage.setItem(LEGACY_KEY, 'previous-provider-token');
    writeSupabaseSession({ access_token: 'nearly-expired', expires_at: nowInSeconds() + 30 });

    expect(tokenService.getToken()).toBe('previous-provider-token');
  });

  it('survives a corrupt session entry instead of breaking every request', () => {
    localStorage.setItem(LEGACY_KEY, 'previous-provider-token');
    localStorage.setItem(SUPABASE_KEY, '{ not json');

    expect(tokenService.getToken()).toBe('previous-provider-token');
  });

  it('ignores a session object with no access token', () => {
    localStorage.setItem(LEGACY_KEY, 'previous-provider-token');
    writeSupabaseSession({ refresh_token: 'only-a-refresh-token' });

    expect(tokenService.getToken()).toBe('previous-provider-token');
  });
});

describe('refreshing', () => {
  it('leaves a Supabase session to the SDK and returns its current token', async () => {
    writeSupabaseSession({ access_token: 'supabase-token', expires_at: nowInSeconds() + 3600 });

    await expect(tokenService.refreshToken()).resolves.toBe('supabase-token');
  });

  it('does not run the fallback refresh timer for a Supabase session', () => {
    writeSupabaseSession({ access_token: 'supabase-token', expires_at: nowInSeconds() + 3600 });

    expect(tokenService.needsRefresh()).toBe(false);
  });

  it('returns null rather than throwing when nothing is signed in', async () => {
    await expect(tokenService.refreshToken()).resolves.toBeNull();
  });

  /**
   * The endpoint that issued these no longer exists, so the only correct
   * outcome is to drop the session and let the user sign in again.
   */
  it('drops a session it can no longer refresh and announces it', async () => {
    localStorage.setItem(LEGACY_KEY, 'previous-provider-token');
    const expired = jest.fn();
    window.addEventListener('tokenExpired', expired);

    await expect(tokenService.refreshToken()).rejects.toThrow(/no longer be refreshed/i);

    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);
    window.removeEventListener('tokenExpired', expired);
  });
});

describe('clearing', () => {
  it('removes the stored token', () => {
    localStorage.setItem(LEGACY_KEY, 'previous-provider-token');

    tokenService.clearToken();

    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });
});
