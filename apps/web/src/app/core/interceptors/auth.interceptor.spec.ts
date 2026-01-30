import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let storeMock: { select: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    storeMock = { select: vi.fn() };
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
});
