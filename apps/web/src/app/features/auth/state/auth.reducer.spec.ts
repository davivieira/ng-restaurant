import { authReducer } from './auth.reducer';
import { authActions } from './auth.actions';
import { initialAuthState } from './auth.state';
import type { AuthUser } from '../models/auth-user.model';

const mockUser: AuthUser = {
  id: '1',
  email: 'u@test.com',
  name: 'User',
  role: 'admin',
  restaurantId: 'r1',
};

describe('authReducer', () => {
  it('should return initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialAuthState);
  });

  it('should set loading and clear error on login', () => {
    const state = authReducer(initialAuthState, authActions.login({ email: 'u@test.com', password: 'p' }));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set user and token on loginSuccess', () => {
    const state = authReducer(
      { ...initialAuthState, loading: true },
      authActions.loginSuccess({ user: mockUser, token: 'tok' })
    );
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('tok');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set error on loginFailure', () => {
    const state = authReducer(
      { ...initialAuthState, loading: true },
      authActions.loginFailure({ error: 'Wrong password' })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Wrong password');
  });

  it('should set loading on register', () => {
    const state = authReducer(
      initialAuthState,
      authActions.register({
        name: 'U',
        email: 'u@test.com',
        password: 'pass',
        restaurantName: 'R',
      })
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set user and token on registerSuccess', () => {
    const state = authReducer(
      { ...initialAuthState, loading: true },
      authActions.registerSuccess({ user: mockUser, token: 'tok' })
    );
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('tok');
    expect(state.loading).toBe(false);
  });

  it('should set error on registerFailure', () => {
    const state = authReducer(
      { ...initialAuthState, loading: true },
      authActions.registerFailure({ error: 'Email taken' })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Email taken');
  });

  it('should reset to initial state on logout', () => {
    const state = authReducer(
      { ...initialAuthState, user: mockUser, token: 'tok' },
      authActions.logout()
    );
    expect(state).toEqual(initialAuthState);
  });

  it('should clear error on clearError', () => {
    const state = authReducer(
      { ...initialAuthState, error: 'Some error' },
      authActions.clearError()
    );
    expect(state.error).toBeNull();
  });

  it('should set user and token on restoreSession', () => {
    const state = authReducer(
      initialAuthState,
      authActions.restoreSession({ user: mockUser, token: 'tok' })
    );
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('tok');
  });
});
