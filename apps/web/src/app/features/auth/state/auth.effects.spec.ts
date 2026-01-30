import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { authActions } from './auth.actions';
import { login$, loginSuccess$, register$, registerSuccess$, logout$ } from './auth.effects';
import { AuthService } from '../data/auth.service';
import type { AuthUser } from '../models/auth-user.model';

const mockUser: AuthUser = {
  id: '1',
  email: 'u@test.com',
  name: 'User',
  role: 'admin',
  restaurantId: 'r1',
};

describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  let authService: { login: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { login: vi.fn(), register: vi.fn() };
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  describe('login$', () => {
    it('dispatches loginSuccess when login succeeds', async () => {
      actions$ = of(authActions.login({ email: 'u@test.com', password: 'p' }));
      authService.login.mockReturnValue(of({ accessToken: 'tok', user: mockUser }));

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          (login$ as () => Observable<unknown>)().subscribe({
            next: (action: unknown) => {
              const a = action as { type: string; user: AuthUser; token: string };
              expect(a.type).toBe('[Auth] Login Success');
              expect(a.user).toEqual(mockUser);
              expect(a.token).toBe('tok');
              resolve();
            },
            error: reject,
          });
        });
      });
    });

    it('dispatches loginFailure when login fails', async () => {
      actions$ = of(authActions.login({ email: 'u@test.com', password: 'p' }));
      authService.login.mockReturnValue(throwError(() => ({ status: 401, error: { message: 'Wrong password' } })));

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          (login$ as () => Observable<unknown>)().subscribe({
            next: (action: unknown) => {
              const a = action as { type: string; error: string };
              expect(a.type).toBe('[Auth] Login Failure');
              expect(a.error).toBe('Wrong password');
              resolve();
            },
            error: reject,
          });
        });
      });
    });
  });

  describe('loginSuccess$', () => {
    it('navigates to dashboard', async () => {
      actions$ = of(authActions.loginSuccess({ user: mockUser, token: 'tok' }));

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          (loginSuccess$ as () => Observable<unknown>)().subscribe({
            complete: () => {
              expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
              resolve();
            },
            error: reject,
          });
        });
      });
    });
  });

  describe('register$', () => {
    it('dispatches registerSuccess when register succeeds', async () => {
      actions$ = of(
        authActions.register({
          name: 'U',
          email: 'u@test.com',
          password: 'p',
          restaurantName: 'R',
        })
      );
      authService.register.mockReturnValue(of({ accessToken: 'tok', user: mockUser }));

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          (register$ as () => Observable<unknown>)().subscribe({
            next: (action: unknown) => {
              expect((action as { type: string }).type).toBe('[Auth] Register Success');
              resolve();
            },
            error: reject,
          });
        });
      });
    });

    it('dispatches registerFailure when register fails', async () => {
      actions$ = of(
        authActions.register({
          name: 'U',
          email: 'u@test.com',
          password: 'p',
          restaurantName: 'R',
        })
      );
      authService.register.mockReturnValue(
        throwError(() => ({ status: 409, error: { message: 'Email already registered' } }))
      );

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          (register$ as () => Observable<unknown>)().subscribe({
            next: (action: unknown) => {
              const a = action as { type: string; error: string };
              expect(a.type).toBe('[Auth] Register Failure');
              expect(a.error).toContain('Email');
              resolve();
            },
            error: reject,
          });
        });
      });
    });
  });

  describe('logout$', () => {
    it('navigates to login', async () => {
      actions$ = of(authActions.logout());

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          (logout$ as () => Observable<unknown>)().subscribe({
            complete: () => {
              expect(router.navigate).toHaveBeenCalledWith(['/login']);
              resolve();
            },
            error: reject,
          });
        });
      });
    });
  });
});
