import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { authActions } from './auth.actions';
import {
  getStoredToken,
  getStoredUser,
} from './auth.effects';

export function restoreSessionFactory() {
  const store = inject(Store);
  const token = getStoredToken();
  const user = getStoredUser();
  if (token && user?.id && user?.email && user?.role && user?.restaurantId) {
    store.dispatch(authActions.restoreSession({ token, user }));
  }
  return () => Promise.resolve();
}
