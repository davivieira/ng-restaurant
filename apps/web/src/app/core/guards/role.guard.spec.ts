import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
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

  it('returns true when user role is in allowed roles', async () => {
    storeMock.select.mockReturnValue(of('admin'));
    const guard = TestBed.runInInjectionContext(() => roleGuard(['admin'])());
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

  it('returns UrlTree to dashboard when user role is not allowed', async () => {
    storeMock.select.mockReturnValue(of('waiter'));
    const guard = TestBed.runInInjectionContext(() => roleGuard(['admin'])());
    await new Promise<void>((resolve, reject) => {
      guard.subscribe({
        next: (result) => {
          expect(result).toBe('url-tree');
          expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
          resolve();
        },
        error: reject,
      });
    });
  });

  it('returns UrlTree when user has no role (null)', async () => {
    storeMock.select.mockReturnValue(of(null));
    const guard = TestBed.runInInjectionContext(() => roleGuard(['admin'])());
    await new Promise<void>((resolve, reject) => {
      guard.subscribe({
        next: (result) => {
          expect(result).toBe('url-tree');
          expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
          resolve();
        },
        error: reject,
      });
    });
  });
});
