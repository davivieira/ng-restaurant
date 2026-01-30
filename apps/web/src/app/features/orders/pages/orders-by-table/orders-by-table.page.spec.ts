import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { OrdersByTablePage } from './orders-by-table.page';
import { ordersActions } from '../../state/orders.actions';
import { tablesActions } from '../../../tables/state/tables.actions';

describe('OrdersByTablePage', () => {
  let storeDispatch: ReturnType<typeof vi.fn>;
  let selectSignalMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeDispatch = vi.fn();
    selectSignalMock = vi.fn();
    TestBed.configureTestingModule({
      imports: [OrdersByTablePage],
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

  it('should create', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [{ id: 't1', name: 'Table 1', status: 'occupied' }])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(OrdersByTablePage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('dispatches loadTables on init and loadOrdersByTable when tableId is set', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [{ id: 't1', name: 'Table 1', status: 'occupied' }])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(OrdersByTablePage);
    fixture.detectChanges();
    expect(storeDispatch).toHaveBeenCalledWith(tablesActions.loadTables());
    expect(storeDispatch).toHaveBeenCalledWith(
      ordersActions.loadOrdersByTable({ tableId: 't1' })
    );
  });

  it('canCancel returns false for in_progress order', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(OrdersByTablePage);
    fixture.detectChanges();
    expect(fixture.componentInstance.canCancel({ id: 'o1', status: 'in_progress' } as any)).toBe(
      false
    );
  });

  it('canCancel returns true for pending order', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    const fixture = TestBed.createComponent(OrdersByTablePage);
    fixture.detectChanges();
    expect(fixture.componentInstance.canCancel({ id: 'o1', status: 'pending' } as any)).toBe(true);
  });

  it('cancelOrder dispatches cancelOrder when confirm is true', () => {
    selectSignalMock
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => [])
      .mockReturnValueOnce(() => false)
      .mockReturnValueOnce(() => null);
    vi.stubGlobal('confirm', () => true);
    const fixture = TestBed.createComponent(OrdersByTablePage);
    fixture.detectChanges();
    fixture.componentInstance.cancelOrder({ id: 'o1', status: 'pending' } as any);
    expect(storeDispatch).toHaveBeenCalledWith(ordersActions.cancelOrder({ id: 'o1' }));
    vi.unstubAllGlobals();
  });
});
