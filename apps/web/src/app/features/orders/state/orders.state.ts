import type { Order } from '../models/order.model';

export interface OrdersState {
  /** Orders for the last loaded table */
  orders: Order[];
  /** Table id for which orders are currently loaded */
  tableId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialOrdersState: OrdersState = {
  orders: [],
  tableId: null,
  loading: false,
  error: null,
};
