import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { AuthState } from './auth.state';

const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectAuthToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectIsLoggedIn = createSelector(
  selectAuthToken,
  (token) => !!token
);

/** For future role-based UI (e.g. waiter vs admin). */
export const selectUserRole = createSelector(
  selectAuthUser,
  (user) => user?.role ?? null
);

/** For future restaurant-scoped features. */
export const selectRestaurantId = createSelector(
  selectAuthUser,
  (user) => user?.restaurantId ?? null
);
