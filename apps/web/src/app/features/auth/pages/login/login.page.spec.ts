import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { LoginPage } from './login.page';
import { authActions } from '../../state/auth.actions';

describe('LoginPage', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        {
          provide: Store,
          useValue: {
            dispatch: storeDispatch,
            selectSignal: vi.fn()
              .mockReturnValueOnce(() => false)
              .mockReturnValueOnce(() => null),
          },
        },
      ],
    });
  });

  it('dispatches clearError on init', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    expect(storeDispatch).toHaveBeenCalledWith(authActions.clearError());
  });

  it('dispatches login with email and password on submit', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.email.set('u@test.com');
    comp.password.set('pass123');
    comp.onSubmit();
    expect(storeDispatch).toHaveBeenCalledWith(
      authActions.login({ email: 'u@test.com', password: 'pass123' })
    );
  });
});
