import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../data/auth.service';
import { authActions } from './auth.actions';

const TOKEN_KEY = 'ngr_token';
const USER_KEY = 'ngr_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: unknown) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getLoginErrorMessage(err: { status?: number; error?: { message?: string }; message?: string }): string {
  if (err?.status === 0 || (typeof err?.message === 'string' && err.message.includes('Unknown Error'))) {
    return 'Unable to connect to the server. Please check that the API is running.';
  }
  if (err?.status === 401) {
    return err?.error?.message ?? 'Invalid email or password.';
  }
  return err?.error?.message ?? err?.message ?? 'Login failed.';
}

function getRegisterErrorMessage(err: { status?: number; error?: { message?: string }; message?: string }): string {
  if (err?.status === 0) {
    return 'Unable to connect to the server. Please check that the API is running.';
  }
  if (err?.status === 401 || err?.status === 409) {
    return err?.error?.message ?? (err?.status === 409 ? 'Email already registered.' : 'Invalid email or password.');
  }
  return err?.error?.message ?? err?.message ?? 'Registration failed.';
}

export const login$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) =>
    actions$.pipe(
      ofType(authActions.login),
      switchMap(({ email, password }) =>
        authService.login(email, password).pipe(
          map((res) =>
            authActions.loginSuccess({ user: res.user, token: res.accessToken })
          ),
          catchError((err) =>
            of(
              authActions.loginFailure({
                error: getLoginErrorMessage(err),
              })
            )
          )
        )
      )
    ),
  { functional: true }
);

export const loginSuccess$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(authActions.loginSuccess),
      tap(({ user, token }) => setStoredAuth(token, user)),
      tap(() => router.navigate(['/dashboard']))
    ),
  { functional: true, dispatch: false }
);

export const register$ = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) =>
    actions$.pipe(
      ofType(authActions.register),
      switchMap(({ name, email, password, restaurantName }) =>
        authService.register(name, email, password, restaurantName).pipe(
          map((res) =>
            authActions.registerSuccess({
              user: res.user,
              token: res.accessToken,
            })
          ),
          catchError((err) =>
            of(
              authActions.registerFailure({
                error: getRegisterErrorMessage(err),
              })
            )
          )
        )
      )
    ),
  { functional: true }
);

export const registerSuccess$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(authActions.registerSuccess),
      tap(({ user, token }) => setStoredAuth(token, user)),
      tap(() => router.navigate(['/dashboard']))
    ),
  { functional: true, dispatch: false }
);

export const logout$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(authActions.logout),
      tap(clearStoredAuth),
      tap(() => router.navigate(['/login']))
    ),
  { functional: true, dispatch: false }
);

export const AuthEffects = {
  login$,
  loginSuccess$,
  register$,
  registerSuccess$,
  logout$,
};
