import { createAction, props } from '@ngrx/store';
import type { AuthUser } from '../models/auth-user.model';

export const authActions = {
  login: createAction(
    '[Auth] Login',
    props<{ email: string; password: string }>()
  ),
  loginSuccess: createAction(
    '[Auth] Login Success',
    props<{ user: AuthUser; token: string }>()
  ),
  loginFailure: createAction(
    '[Auth] Login Failure',
    props<{ error: string }>()
  ),
  register: createAction(
    '[Auth] Register',
    props<{
      name: string;
      email: string;
      password: string;
      restaurantName: string;
    }>()
  ),
  registerSuccess: createAction(
    '[Auth] Register Success',
    props<{ user: AuthUser; token: string }>()
  ),
  registerFailure: createAction(
    '[Auth] Register Failure',
    props<{ error: string }>()
  ),
  logout: createAction('[Auth] Logout'),
  clearError: createAction('[Auth] Clear Error'),
  restoreSession: createAction(
    '[Auth] Restore Session',
    props<{ user: AuthUser; token: string }>()
  ),
};
