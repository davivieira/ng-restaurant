import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { DishFormPage } from './dish-form.page';
import { menuActions } from '../../state/menu.actions';

describe('DishFormPage', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;
  let selectSignalMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    selectSignalMock = vi.fn();
    TestBed.configureTestingModule({
      imports: [DishFormPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(new Map([['id', 'new']])) },
        },
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
      .mockReturnValueOnce(() => null)
      .mockReturnValueOnce(() => false);
    const fixture = TestBed.createComponent(DishFormPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('dispatches clearMenuError, loadCategories, loadDishes on init', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => null)
      .mockReturnValueOnce(() => false);
    const fixture = TestBed.createComponent(DishFormPage);
    fixture.detectChanges();
    expect(storeDispatch).toHaveBeenCalledWith(menuActions.clearMenuError());
    expect(storeDispatch).toHaveBeenCalledWith(menuActions.loadCategories());
    expect(storeDispatch).toHaveBeenCalledWith(menuActions.loadDishes({}));
  });

  it('save dispatches createDish for new dish', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    selectSignalMock
      .mockReturnValueOnce(() => [{ id: 'c1', name: 'Mains' }])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => null)
      .mockReturnValueOnce(() => false);
    const fixture = TestBed.createComponent(DishFormPage);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.name.set('Pasta');
    comp.price.set(12.5);
    comp.save();
    expect(storeDispatch).toHaveBeenCalledWith(
      menuActions.createDish({
        dto: {
          name: 'Pasta',
          description: undefined,
          price: 12.5,
          categoryId: null,
          isActive: true,
        },
      })
    );
  });

  it('cancel navigates to menu manage', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate');
    selectSignalMock
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => null)
      .mockReturnValueOnce(() => false);
    const fixture = TestBed.createComponent(DishFormPage);
    fixture.detectChanges();
    fixture.componentInstance.cancel();
    expect(navSpy).toHaveBeenCalledWith(['/menu/manage']);
  });
});
