import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuListPage } from './menu-list.page';
import { menuActions } from '../../state/menu.actions';

describe('MenuListPage', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;
  let selectSignalMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    selectSignalMock = vi.fn();
    TestBed.configureTestingModule({
      imports: [MenuListPage],
      providers: [
        provideRouter([]),
        {
          provide: Store,
          useValue: { dispatch: storeDispatch, selectSignal: selectSignalMock },
        },
      ],
    });
  });

  it('should create', () => {
    selectSignalMock
      .mockReturnValueOnce(() => 'admin')
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(MenuListPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('dispatches loadMenu on init', () => {
    selectSignalMock
      .mockReturnValueOnce(() => 'admin')
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(MenuListPage);
    fixture.detectChanges();
    expect(storeDispatch).toHaveBeenCalledWith(menuActions.loadMenu());
  });
});
