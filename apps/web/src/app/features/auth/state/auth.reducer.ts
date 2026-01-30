import { createReducer, on } from '@ngrx/store';
import { authActions } from './auth.actions';
import { initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,
  on(authActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(authActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),
  on(authActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(authActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(authActions.registerSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),
  on(authActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(authActions.logout, () => initialAuthState),
  on(authActions.clearError, (state) => ({ ...state, error: null })),
  on(authActions.restoreSession, (state, { user, token }) => ({
    ...state,
    user,
    token,
  }))
);
