import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { RegisterPage } from './register.page';
import { authActions } from '../../state/auth.actions';

describe('RegisterPage', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    TestBed.configureTestingModule({
      imports: [RegisterPage],
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
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
    expect(storeDispatch).toHaveBeenCalledWith(authActions.clearError());
  });

  it('dispatches register with form values on submit', () => {
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.name.set('Name');
    comp.email.set('u@test.com');
    comp.password.set('pass123');
    comp.restaurantName.set('Restaurant');
    comp.onSubmit();
    expect(storeDispatch).toHaveBeenCalledWith(
      authActions.register({
        name: 'Name',
        email: 'u@test.com',
        password: 'pass123',
        restaurantName: 'Restaurant',
      })
    );
  });
});
