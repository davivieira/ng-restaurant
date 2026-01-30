import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { switchMap, take } from 'rxjs';
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
      return next(cloned);
    })
  );
};
