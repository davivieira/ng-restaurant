import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let storeMock: { select: ReturnType<typeof vi.fn> };
  let routerMock: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    storeMock = { select: vi.fn() };
    routerMock = { createUrlTree: vi.fn().mockReturnValue('url-tree') };
    TestBed.configureTestingModule({
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should return true when user is logged in', async () => {
    storeMock.select.mockReturnValue(of(true));
    const guard = TestBed.runInInjectionContext(() => authGuard());
    await new Promise<void>((resolve, reject) => {
      guard.subscribe({
        next: (result) => {
          expect(result).toBe(true);
          expect(routerMock.createUrlTree).not.toHaveBeenCalled();
          resolve();
        },
        error: reject,
      });
    });
  });

  it('should return UrlTree to /login when user is not logged in', async () => {
    storeMock.select.mockReturnValue(of(false));
    const guard = TestBed.runInInjectionContext(() => authGuard());
    await new Promise<void>((resolve, reject) => {
      guard.subscribe({
        next: (result) => {
          expect(result).toBe('url-tree');
          expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
          resolve();
        },
        error: reject,
      });
    });
  });
});
