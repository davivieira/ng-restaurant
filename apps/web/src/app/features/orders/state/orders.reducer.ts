import { createReducer, on } from '@ngrx/store';
import { ordersActions } from './orders.actions';
import { initialOrdersState } from './orders.state';

export const ordersReducer = createReducer(
  initialOrdersState,
  on(ordersActions.loadOrdersByTable, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ordersActions.loadOrdersByTableSuccess, (state, { tableId, orders }) => ({
    ...state,
    orders,
    tableId,
    loading: false,
    error: null,
  })),
  on(ordersActions.loadOrdersByTableFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(ordersActions.createOrder, (state) => ({
    ...state,
    error: null,
  })),
  on(ordersActions.createOrderSuccess, (state, { order }) => ({
    ...state,
    orders: [order, ...state.orders],
    error: null,
  })),
  on(ordersActions.createOrderFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ordersActions.cancelOrderSuccess, (state, { order }) => ({
    ...state,
    orders: state.orders.map((o) => (o.id === order.id ? order : o)),
    error: null,
  })),
  on(ordersActions.cancelOrderFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(ordersActions.clearOrdersError, (state) => ({
    ...state,
    error: null,
  }))
);
