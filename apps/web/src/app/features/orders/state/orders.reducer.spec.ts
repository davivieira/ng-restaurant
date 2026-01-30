import { ordersReducer } from './orders.reducer';
import { ordersActions } from './orders.actions';
import { initialOrdersState } from './orders.state';
import type { Order } from '../models/order.model';

const mockOrder: Order = {
  id: 'o1',
  restaurantId: 'r1',
  tableId: 't1',
  waiterId: 'w1',
  status: 'pending',
  items: [],
};

describe('ordersReducer', () => {
  it('should return initial state', () => {
    const state = ordersReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialOrdersState);
  });

  it('should set loading on loadOrdersByTable', () => {
    const state = ordersReducer(initialOrdersState, ordersActions.loadOrdersByTable({ tableId: 't1' }));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set orders and tableId on loadOrdersByTableSuccess', () => {
    const state = ordersReducer(
      { ...initialOrdersState, loading: true },
      ordersActions.loadOrdersByTableSuccess({ tableId: 't1', orders: [mockOrder] })
    );
    expect(state.orders).toEqual([mockOrder]);
    expect(state.tableId).toBe('t1');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set error on loadOrdersByTableFailure', () => {
    const state = ordersReducer(
      { ...initialOrdersState, loading: true },
      ordersActions.loadOrdersByTableFailure({ error: 'Failed' })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed');
  });

  it('should add order on createOrderSuccess', () => {
    const state = ordersReducer(
      { ...initialOrdersState, orders: [mockOrder], tableId: 't1' },
      ordersActions.createOrderSuccess({ order: { ...mockOrder, id: 'o2' } })
    );
    expect(state.orders).toHaveLength(2);
    expect(state.orders[0].id).toBe('o2');
  });

  it('should update order on cancelOrderSuccess', () => {
    const state = ordersReducer(
      { ...initialOrdersState, orders: [mockOrder] },
      ordersActions.cancelOrderSuccess({ order: { ...mockOrder, status: 'cancelled' } })
    );
    expect(state.orders[0].status).toBe('cancelled');
  });

  it('should clear error on clearOrdersError', () => {
    const state = ordersReducer(
      { ...initialOrdersState, error: 'err' },
      ordersActions.clearOrdersError()
    );
    expect(state.error).toBeNull();
  });
});
