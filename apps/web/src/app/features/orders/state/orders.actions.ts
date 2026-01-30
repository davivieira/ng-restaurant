import { createAction, props } from '@ngrx/store';
import type { Order } from '../models/order.model';
import type { CreateOrderDto } from '../data/orders.service';

export const ordersActions = {
  loadOrdersByTable: createAction('[Orders] Load orders by table', props<{ tableId: string }>()),
  loadOrdersByTableSuccess: createAction(
    '[Orders] Load orders by table success',
    props<{ tableId: string; orders: Order[] }>()
  ),
  loadOrdersByTableFailure: createAction(
    '[Orders] Load orders by table failure',
    props<{ error: string }>()
  ),

  createOrder: createAction('[Orders] Create order', props<{ dto: CreateOrderDto }>()),
  createOrderSuccess: createAction('[Orders] Create order success', props<{ order: Order }>()),
  createOrderFailure: createAction('[Orders] Create order failure', props<{ error: string }>()),

  cancelOrder: createAction('[Orders] Cancel order', props<{ id: string }>()),
  cancelOrderSuccess: createAction('[Orders] Cancel order success', props<{ order: Order }>()),
  cancelOrderFailure: createAction('[Orders] Cancel order failure', props<{ error: string }>()),

  clearOrdersError: createAction('[Orders] Clear error'),
} as const;
