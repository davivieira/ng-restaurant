import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { restoreSessionFactory } from './restore-session.effect';

const TOKEN_KEY = 'ngr_token';
const USER_KEY = 'ngr_user';
const mockUser = { id: '1', email: 'u@test.com', name: 'U', role: 'admin', restaurantId: 'r1' };

describe('restoreSessionFactory', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    TestBed.configureTestingModule({
      providers: [{ provide: Store, useValue: { dispatch: storeDispatch } }],
    });
  });

  afterEach(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  });

  it('dispatches restoreSession when token and valid user exist', () => {
    localStorage.setItem(TOKEN_KEY, 'tok');
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

    const init = TestBed.runInInjectionContext(() => restoreSessionFactory());
    expect(init).toBeDefined();
    expect(storeDispatch).toHaveBeenCalledWith({
      type: '[Auth] Restore Session',
      token: 'tok',
      user: mockUser,
    });
  });

  it('does not dispatch when token is null', () => {
    localStorage.setItem(USER_KEY, JSON.stringify(mockUser));

    TestBed.runInInjectionContext(() => restoreSessionFactory());
    expect(storeDispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch when user is null', () => {
    localStorage.setItem(TOKEN_KEY, 'tok');

    TestBed.runInInjectionContext(() => restoreSessionFactory());
    expect(storeDispatch).not.toHaveBeenCalled();
  });

  it('does not dispatch when user is missing required fields', () => {
    localStorage.setItem(TOKEN_KEY, 'tok');
    localStorage.setItem(USER_KEY, JSON.stringify({ id: '1' }));

    TestBed.runInInjectionContext(() => restoreSessionFactory());
    expect(storeDispatch).not.toHaveBeenCalled();
  });
});
