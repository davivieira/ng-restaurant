import {
  selectOrders,
  selectOrdersTableId,
  selectOrdersLoading,
  selectOrdersError,
  selectOrderById,
} from './orders.selectors';
import type { OrdersState } from './orders.state';
import type { Order } from '../models/order.model';

const mockOrder: Order = {
  id: 'o1',
  restaurantId: 'r1',
  tableId: 't1',
  waiterId: 'w1',
  status: 'pending',
  items: [],
};

describe('orders selectors', () => {
  const state: OrdersState = {
    orders: [mockOrder],
    tableId: 't1',
    loading: false,
    error: null,
  };

  it('selectOrders returns orders', () => {
    expect(selectOrders.projector(state)).toEqual([mockOrder]);
  });

  it('selectOrdersTableId returns tableId', () => {
    expect(selectOrdersTableId.projector(state)).toBe('t1');
  });

  it('selectOrdersLoading returns loading', () => {
    expect(selectOrdersLoading.projector(state)).toBe(false);
  });

  it('selectOrdersError returns error', () => {
    expect(selectOrdersError.projector(state)).toBeNull();
    expect(selectOrdersError.projector({ ...state, error: 'err' })).toBe('err');
  });

  it('selectOrderById returns order when id matches', () => {
    const selector = selectOrderById('o1');
    expect(selector.projector([mockOrder])).toEqual(mockOrder);
  });

  it('selectOrderById returns null when id not found', () => {
    const selector = selectOrderById('o2');
    expect(selector.projector([mockOrder])).toBeNull();
  });
});
