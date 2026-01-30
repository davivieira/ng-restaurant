import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuManagePage } from './menu-manage.page';
import { menuActions } from '../../state/menu.actions';

describe('MenuManagePage', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;
  let selectSignalMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    selectSignalMock = vi.fn();
    TestBed.configureTestingModule({
      imports: [MenuManagePage],
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
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(MenuManagePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('dispatches clearMenuError, loadCategories, loadDishes on init', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(MenuManagePage);
    fixture.detectChanges();
    expect(storeDispatch).toHaveBeenCalledWith(menuActions.clearMenuError());
    expect(storeDispatch).toHaveBeenCalledWith(menuActions.loadCategories());
    expect(storeDispatch).toHaveBeenCalledWith(menuActions.loadDishes({}));
  });

  it('addCategory sets showAddCategory to true', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(MenuManagePage);
    fixture.detectChanges();
    fixture.componentInstance.addCategory();
    expect(fixture.componentInstance.showAddCategory()).toBe(true);
  });

  it('saveNewCategory dispatches createCategory with name', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(MenuManagePage);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.showAddCategory.set(true);
    comp.newCategoryName.set('Desserts');
    comp.saveNewCategory();
    expect(storeDispatch).toHaveBeenCalledWith(
      menuActions.createCategory({ dto: { name: 'Desserts' } })
    );
  });

  it('deleteDish dispatches deleteDish when confirm returns true', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    vi.stubGlobal('confirm', () => true);
    const fixture = TestBed.createComponent(MenuManagePage);
    fixture.detectChanges();
    fixture.componentInstance.deleteDish({ id: 'd1', name: 'Soup' });
    expect(storeDispatch).toHaveBeenCalledWith(menuActions.deleteDish({ id: 'd1' }));
    vi.unstubAllGlobals();
  });
});
