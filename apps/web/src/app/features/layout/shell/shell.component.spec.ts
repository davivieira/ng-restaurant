import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { ShellComponent } from './shell.component';
import { authActions } from '../../auth/state/auth.actions';

describe('ShellComponent', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([]),
        {
          provide: Store,
          useValue: {
            dispatch: storeDispatch,
            selectSignal: vi.fn().mockReturnValue(() => null),
          },
        },
      ],
    });
  });

  it('dispatches logout when logout is called', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    fixture.componentInstance.logout();
    expect(storeDispatch).toHaveBeenCalledWith(authActions.logout());
  });
});
