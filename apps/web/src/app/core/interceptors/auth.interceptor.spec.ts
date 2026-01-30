import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { authActions } from '../../features/auth/state/auth.actions';

describe('authInterceptor', () => {
  let storeMock: { select: ReturnType<typeof vi.fn>; dispatch: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    storeMock = { select: vi.fn(), dispatch: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: Store, useValue: storeMock }],
    });
  });

  it('should add Authorization header when token exists', async () => {
    storeMock.select.mockReturnValue(of('jwt-token'));
    const req = new HttpRequest('GET', '/api/foo');
    const next = vi.fn().mockImplementation((r: HttpRequest<unknown>) => {
      expect(r.headers.has('Authorization')).toBe(true);
      expect(r.headers.get('Authorization')).toBe('Bearer jwt-token');
      return of({});
    });
    const interceptor = TestBed.runInInjectionContext(() => authInterceptor(req, next));
    await new Promise<void>((resolve, reject) => {
      interceptor.subscribe({
        complete: () => {
          expect(next).toHaveBeenCalled();
          resolve();
        },
        error: reject,
      });
    });
  });

  it('should not add Authorization header when token is null', async () => {
    storeMock.select.mockReturnValue(of(null));
    const req = new HttpRequest('GET', '/api/foo');
    const next = vi.fn().mockImplementation((r: HttpRequest<unknown>) => {
      expect(r.headers.has('Authorization')).toBe(false);
      expect(r).toBe(req);
      return of({});
    });
    const interceptor = TestBed.runInInjectionContext(() => authInterceptor(req, next));
    await new Promise<void>((resolve, reject) => {
      interceptor.subscribe({
        complete: () => {
          expect(next).toHaveBeenCalledWith(req);
          resolve();
        },
        error: reject,
      });
    });
  });

  it('should dispatch logout and complete without error on 401 for non-auth endpoints', async () => {
    storeMock.select.mockReturnValue(of('jwt-token'));
    const req = new HttpRequest('GET', '/api/tables');
    const next = vi.fn().mockReturnValue(
      throwError(() => ({ status: 401, message: 'Unauthorized' }))
    );
    const interceptor = TestBed.runInInjectionContext(() => authInterceptor(req, next));
    await new Promise<void>((resolve, reject) => {
      interceptor.subscribe({
        next: () => {},
        complete: () => {
          expect(storeMock.dispatch).toHaveBeenCalledWith(authActions.logout());
          resolve();
        },
        error: reject,
      });
    });
  });

  it('should rethrow 401 for auth/login so login page can show message', async () => {
    storeMock.select.mockReturnValue(of(null));
    const req = new HttpRequest('POST', '/api/auth/login', { email: 'a@b.com', password: 'x' });
    const next = vi.fn().mockReturnValue(
      throwError(() => ({ status: 401, error: { message: 'Invalid credentials' } }))
    );
    const interceptor = TestBed.runInInjectionContext(() => authInterceptor(req, next));
    await new Promise<void>((resolve, reject) => {
      interceptor.subscribe({
        error: (err) => {
          expect(err.status).toBe(401);
          expect(storeMock.dispatch).not.toHaveBeenCalled();
          resolve();
        },
        complete: () => reject(new Error('expected error')),
      });
    });
  });
});
