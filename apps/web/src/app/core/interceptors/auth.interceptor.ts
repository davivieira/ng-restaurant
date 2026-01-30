import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, switchMap, take, throwError } from 'rxjs';
import { authActions } from '../../features/auth/state/auth.actions';
import { selectAuthToken } from '../../features/auth/state/auth.selectors';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return store.select(selectAuthToken).pipe(
    take(1),
    switchMap((token) => {
      const cloned = token
        ? req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          })
        : req;
      return next(cloned).pipe(
        catchError((err) => {
          // On 401 (e.g. expired token), log the user out instead of showing the raw error.
          // Skip for auth endpoints where 401 means "wrong credentials" and we show a message.
          const isAuthEndpoint =
            req.url.includes('/auth/login') || req.url.includes('/auth/register');
          if (err?.status === 401 && !isAuthEndpoint) {
            store.dispatch(authActions.logout());
            return EMPTY;
          }
          return throwError(() => err);
        })
      );
    })
  );
};
