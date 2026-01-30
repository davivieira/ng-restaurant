import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { OrdersState } from './orders.state';
import type { Order } from '../models/order.model';

const selectOrdersState = createFeatureSelector<OrdersState>('orders');

export const selectOrders = createSelector(selectOrdersState, (state) => state.orders);
export const selectOrdersTableId = createSelector(selectOrdersState, (state) => state.tableId);
export const selectOrdersLoading = createSelector(selectOrdersState, (state) => state.loading);
export const selectOrdersError = createSelector(selectOrdersState, (state) => state.error);

export const selectOrderById = (id: string | null) =>
  createSelector(selectOrders, (orders: Order[]) =>
    id ? orders.find((o) => o.id === id) ?? null : null
  );
