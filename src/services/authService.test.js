import authService from './authService';
import supabase from './supabaseClient';

jest.mock('./supabaseClient', () => ({
  __esModule: true,
  default: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithIdToken: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Some accounts exist with no password set. The provider reports that
 * identically to a wrong password, and asking the two apart would mean an
 * endpoint that reveals which addresses have accounts — so both have to
 * produce one message that offers a way forward.
 */
describe('sign-in failures', () => {
  it('turns invalid credentials into an offer to set a new password', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { code: 'invalid_credentials', message: 'Invalid login credentials' },
    });

    await expect(authService.signIn('a@example.com', 'wrong')).rejects.toMatchObject({
      code: 'invalid_credentials',
      offerPasswordSetup: true,
    });
  });

  it('recognises the failure by message when no code is given', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' },
    });

    await expect(authService.signIn('a@example.com', 'wrong')).rejects.toMatchObject({
      code: 'invalid_credentials',
      offerPasswordSetup: true,
    });
  });

  it('does not offer a password reset for unrelated failures', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Email not confirmed' },
    });

    const failure = await authService.signIn('a@example.com', 'pw').catch((e) => e);

    expect(failure.code).toBe('email_not_confirmed');
    expect(failure.offerPasswordSetup).toBeUndefined();
  });

  it('surfaces rate limiting as something to wait out', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Request rate limit reached' },
    });

    await expect(authService.signIn('a@example.com', 'pw')).rejects.toMatchObject({
      code: 'rate_limited',
    });
  });

  it('returns the session when sign-in succeeds', async () => {
    const session = { access_token: 'token' };
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { session }, error: null });

    await expect(authService.signIn('a@example.com', 'pw')).resolves.toBe(session);
  });
});

describe('sign-up', () => {
  it('reports that confirmation is pending when no session comes back', async () => {
    supabase.auth.signUp.mockResolvedValue({ data: { session: null }, error: null });

    await expect(authService.signUp('a@example.com', 'pw', 'Ann')).resolves.toEqual({
      session: null,
      needsConfirmation: true,
    });
  });

  it('passes the display name through as user metadata', async () => {
    supabase.auth.signUp.mockResolvedValue({ data: { session: {} }, error: null });

    await authService.signUp('a@example.com', 'pw', 'Ann');

    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ options: { data: { display_name: 'Ann' } } }),
    );
  });

  it('marks an address that already has an account', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: {},
      error: { code: 'user_already_exists', message: 'User already registered' },
    });

    await expect(authService.signUp('a@example.com', 'pw', 'Ann')).rejects.toMatchObject({
      code: 'user_already_exists',
    });
  });
});

describe('Google sign-in', () => {
  /**
   * The page already holds a Google id token from the Identity Services SDK,
   * so this exchanges it directly rather than starting a redirect flow. Those
   * accounts have no password of their own, so nothing extra is asked of them.
   */
  it('exchanges the id token the page already has', async () => {
    const session = { access_token: 'token' };
    supabase.auth.signInWithIdToken.mockResolvedValue({ data: { session }, error: null });

    await expect(authService.signInWithGoogle('google-id-token')).resolves.toBe(session);
    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: 'google',
      token: 'google-id-token',
    });
  });
});

describe('password reset', () => {
  it('resolves the same way whether or not the address has an account', async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    await expect(authService.requestPasswordReset('nobody@example.com')).resolves.toEqual({
      sent: true,
    });
  });

  it('sends people back to the reset page to finish', async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    await authService.requestPasswordReset('a@example.com');

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'a@example.com',
      expect.objectContaining({ redirectTo: expect.stringContaining('/reset-password') }),
    );
  });

  it('confirms once the new password is set', async () => {
    supabase.auth.updateUser.mockResolvedValue({ error: null });

    await expect(authService.completePasswordReset('new-password')).resolves.toEqual({
      updated: true,
    });
  });
});
