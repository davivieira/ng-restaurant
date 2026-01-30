import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectUserRole } from '../../features/auth/state/auth.selectors';

/**
 * Functional guard that allows access only when the user's role is in the allowed list.
 * Redirects to dashboard otherwise. Use after authGuard so the user is logged in.
 * Injection happens inside the returned function so it runs in the router's injection context.
 */
export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const store = inject(Store);
    const router = inject(Router);
    return store.select(selectUserRole).pipe(
      take(1),
      map((role) => {
        if (role && allowedRoles.includes(role)) return true;
        return router.createUrlTree(['/dashboard']);
      })
    );
  };
};
