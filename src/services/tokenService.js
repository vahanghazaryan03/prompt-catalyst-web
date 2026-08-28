// tokenService.js

/**
 * Supplies the bearer token every API call carries.
 *
 * Two issuers are live during the migration. A Supabase session takes
 * precedence when one exists; otherwise the legacy WordPress token in
 * `authToken` is used exactly as before. The API accepts both, so a user signed
 * in under either keeps working, and nobody is signed out by the switch.
 *
 * Reading the Supabase session straight out of localStorage rather than through
 * the SDK is deliberate: getToken is called synchronously all over the app, and
 * the SDK's accessor is async. The SDK owns writing that entry and refreshing
 * it; this only ever reads it.
 */

const SUPABASE_STORAGE_KEY = 'pc-auth';
const LEGACY_TOKEN_KEY = 'authToken';

/** Treat a token expiring within this window as already stale. */
const EXPIRY_SKEW_SECONDS = 60;

function readSupabaseSession() {
  try {
    const raw = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.access_token) return null;
    if (typeof session.expires_at === 'number') {
      const secondsLeft = session.expires_at - Math.floor(Date.now() / 1000);
      if (secondsLeft <= EXPIRY_SKEW_SECONDS) return null;
    }
    return session;
  } catch {
    // Malformed entry: fall back rather than breaking every request.
    return null;
  }
}

class TokenService {
  constructor() {
    this.REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes
    this.lastRefreshTime = null;
  }

  /** True once the user is signed in through Supabase rather than WordPress. */
  isSupabaseSession() {
    return readSupabaseSession() !== null;
  }

  getToken() {
    const session = readSupabaseSession();
    if (session) return session.access_token;
    return localStorage.getItem(LEGACY_TOKEN_KEY);
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(LEGACY_TOKEN_KEY, token);
      this.lastRefreshTime = Date.now();
    } else {
      this.clearToken();
    }
  }

  clearToken() {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    this.lastRefreshTime = null;
  }

  needsRefresh() {
    // Supabase refreshes its own session; only the legacy token needs a timer.
    if (this.isSupabaseSession()) return false;
    return this.lastRefreshTime && Date.now() - this.lastRefreshTime >= this.REFRESH_INTERVAL;
  }

  async refreshToken() {
    /**
     * A Supabase session is refreshed by the SDK. Asking it to refresh here
     * would race the SDK's own timer and can invalidate the refresh token, so
     * the current access token is returned instead.
     */
    const session = readSupabaseSession();
    if (session) return session.access_token;

    const currentToken = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (!currentToken) return null;

    try {
      const response = await fetch('https://catalystmedia.ai/promptcatalystfreedemo/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: currentToken })
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      if (data.token) {
        this.setToken(data.token);
        return data.token;
      }

      throw new Error('No token in refresh response');
    } catch (error) {
      this.clearToken();
      window.dispatchEvent(new Event('tokenExpired'));
      throw error;
    }
  }

  async ensureFreshToken() {
    if (this.needsRefresh()) {
      return this.refreshToken();
    }
    return this.getToken();
  }
}

export const tokenService = new TokenService();
export default tokenService;
