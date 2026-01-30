import {
  selectAuthUser,
  selectAuthToken,
  selectAuthLoading,
  selectAuthError,
  selectIsLoggedIn,
  selectUserRole,
  selectRestaurantId,
} from './auth.selectors';
import type { AuthState } from './auth.state';
import type { AuthUser } from '../models/auth-user.model';

const mockUser: AuthUser = {
  id: '1',
  email: 'u@test.com',
  name: 'User',
  role: 'admin',
  restaurantId: 'r1',
};

describe('auth selectors', () => {
  const state: { auth: AuthState } = {
    auth: {
      user: mockUser,
      token: 'tok',
      loading: false,
      error: null,
    },
  };

  it('selectAuthUser returns user', () => {
    expect(selectAuthUser.projector(state.auth)).toBe(mockUser);
  });

  it('selectAuthToken returns token', () => {
    expect(selectAuthToken.projector(state.auth)).toBe('tok');
  });

  it('selectAuthLoading returns loading', () => {
    expect(selectAuthLoading.projector(state.auth)).toBe(false);
  });

  it('selectAuthError returns error', () => {
    expect(selectAuthError.projector(state.auth)).toBeNull();
    expect(selectAuthError.projector({ ...state.auth, error: 'err' })).toBe('err');
  });

  it('selectIsLoggedIn returns true when token exists', () => {
    expect(selectIsLoggedIn.projector('tok')).toBe(true);
    expect(selectIsLoggedIn.projector(null)).toBe(false);
  });

  it('selectUserRole returns role from user', () => {
    expect(selectUserRole.projector(mockUser)).toBe('admin');
    expect(selectUserRole.projector(null)).toBeNull();
  });

  it('selectRestaurantId returns restaurantId from user', () => {
    expect(selectRestaurantId.projector(mockUser)).toBe('r1');
    expect(selectRestaurantId.projector(null)).toBeNull();
  });
});
