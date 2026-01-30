import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { OrderNewPage } from './order-new.page';
import { ordersActions } from '../../state/orders.actions';
import { tablesActions } from '../../../tables/state/tables.actions';
import { menuActions } from '../../../menu/state/menu.actions';

describe('OrderNewPage', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;
  let selectSignalMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    selectSignalMock = vi.fn();
    TestBed.configureTestingModule({
      imports: [OrderNewPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['tableId', 't1']])),
          },
        },
        {
          provide: Store,
          useValue: {
            dispatch: storeDispatch,
            selectSignal: selectSignalMock,
          },
        },
      ],
    });
  });

  const defaultSelectSignals = () =>
    selectSignalMock
      .mockReturnValueOnce(() => []) // tables
      .mockReturnValueOnce(() => []) // grouped
      .mockReturnValueOnce(() => false) // loading
      .mockReturnValueOnce(() => null); // error

  it('should create', () => {
    defaultSelectSignals();
    const fixture = TestBed.createComponent(OrderNewPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('dispatches loadTables and loadMenu on init', () => {
    defaultSelectSignals();
    const fixture = TestBed.createComponent(OrderNewPage);
    fixture.detectChanges();
    expect(storeDispatch).toHaveBeenCalledWith(tablesActions.loadTables());
    expect(storeDispatch).toHaveBeenCalledWith(menuActions.loadMenu());
  });

  it('hasItems returns false when no quantities set', () => {
    defaultSelectSignals();
    const fixture = TestBed.createComponent(OrderNewPage);
    fixture.detectChanges();
    expect(fixture.componentInstance.hasItems()).toBe(false);
  });

  it('hasItems returns true when quantity > 0', () => {
    defaultSelectSignals();
    const fixture = TestBed.createComponent(OrderNewPage);
    fixture.detectChanges();
    fixture.componentInstance.setQuantity('d1', 2);
    expect(fixture.componentInstance.hasItems()).toBe(true);
  });

  it('submit dispatches createOrder and navigates when has items', () => {
    const router = TestBed.inject(Router);
    const routerSpy = vi.spyOn(router, 'navigate');
    defaultSelectSignals();
    const fixture = TestBed.createComponent(OrderNewPage);
    fixture.detectChanges();
    fixture.componentInstance.setQuantity('d1', 1);
    fixture.componentInstance.submit();
    expect(storeDispatch).toHaveBeenCalledWith(
      ordersActions.createOrder({
        dto: { tableId: 't1', items: [{ dishId: 'd1', quantity: 1, observations: undefined }] },
      })
    );
    expect(routerSpy).toHaveBeenCalledWith(['/tables', 't1', 'orders']);
  });
});
