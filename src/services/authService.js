// authService.js
import supabase from './supabaseClient';
import { logger } from '../utils/logger';

/**
 * Authentication against Supabase.
 *
 * Replaces the WordPress simple-jwt-login flows. The service accepts tokens
 * from either issuer while the migration runs, so a session obtained here works
 * against the same API as an existing WordPress session.
 *
 * The one behaviour that genuinely changes for users: passwords did not come
 * across. WordPress stores phpass hashes and Supabase cannot accept them, so
 * every account imported from WordPress exists with no password set. Signing in
 * with an old password fails, and the fix is to set a new one.
 *
 * Google users are unaffected. Their accounts never had a password, and Supabase
 * is configured with the same Google client id the site already uses, so they
 * sign in exactly as before.
 */

/** Supabase returns this for both a wrong password and an account with none. */
const INVALID_CREDENTIALS = 'invalid_credentials';

function describe(error) {
  if (!error) return null;
  const code = error.code ?? error.error_code ?? '';
  const message = error.message ?? '';

  if (code === INVALID_CREDENTIALS || /invalid login credentials/i.test(message)) {
    /**
     * Deliberately one message for two causes. Supabase cannot tell us which,
     * and asking it separately would mean an endpoint that reveals whether an
     * email has an account.
     */
    return {
      code: 'invalid_credentials',
      message:
        'That email and password did not match. If you had an account before we upgraded sign-in, set a new password to continue.',
      offerPasswordSetup: true,
    };
  }

  if (/email not confirmed/i.test(message)) {
    return { code: 'email_not_confirmed', message: 'Please confirm your email address first.' };
  }

  if (code === 'user_already_exists' || /already registered/i.test(message)) {
    return { code: 'user_already_exists', message: 'An account already exists for that email.' };
  }

  if (/rate limit|too many/i.test(message)) {
    return { code: 'rate_limited', message: 'Too many attempts. Please wait a moment and try again.' };
  }

  return { code: code || 'auth_error', message: message || 'Something went wrong. Please try again.' };
}

function fail(error) {
  const described = describe(error);
  const err = new Error(described.message);
  err.code = described.code;
  if (described.offerPasswordSetup) err.offerPasswordSetup = true;
  return err;
}

const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.error('Sign-in failed:', error.message);
      throw fail(error);
    }
    return data.session;
  },

  async signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: username } },
    });
    if (error) {
      logger.error('Sign-up failed:', error.message);
      throw fail(error);
    }
    // With confirmations on, there is no session until the email is confirmed.
    return { session: data.session, needsConfirmation: !data.session };
  },

  /**
   * Google sign-in.
   *
   * Uses the id token the Google Identity Services SDK already produces on the
   * page, rather than a redirect flow. That keeps the existing button and popup
   * exactly as they are, and needs no new redirect URI registered with Google.
   */
  async signInWithGoogle(idToken) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) {
      logger.error('Google sign-in failed:', error.message);
      throw fail(error);
    }
    return data.session;
  },

  /**
   * Sends the email that lets someone set a password.
   *
   * The same call serves a forgotten password and an account migrated from
   * WordPress that never had one. It resolves the same way whether or not the
   * address has an account, so it cannot be used to discover who is registered.
   */
  async requestPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      logger.error('Password reset request failed:', error.message);
      throw fail(error);
    }
    return { sent: true };
  },

  /**
   * Sets the new password once the user has followed the emailed link.
   *
   * The link puts a recovery session in the URL, which the client picks up
   * because detectSessionInUrl is on, so this is an ordinary authenticated
   * update by the time it runs.
   */
  async completePasswordReset(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      logger.error('Password update failed:', error.message);
      throw fail(error);
    }
    return { updated: true };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) logger.error('Sign-out failed:', error.message);
  },

  /** The current access token, or null. Refreshed by the SDK as needed. */
  async getAccessToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  },

  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  },

  /** Fires on sign-in, sign-out and token refresh. */
  onAuthStateChange(handler) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => handler(event, session));
    return () => data.subscription.unsubscribe();
  },
};

export default authService;
