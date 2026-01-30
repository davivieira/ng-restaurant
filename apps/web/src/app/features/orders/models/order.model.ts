export type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'cancelled';

export interface OrderItemDish {
  id: string;
  name: string;
  description: string | null;
  price: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  dishId: string;
  quantity: number;
  observations: string | null;
  dish?: OrderItemDish;
}

export interface OrderWaiter {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  waiterId: string;
  status: OrderStatus;
  items: OrderItem[];
  waiter?: OrderWaiter;
  createdAt?: string;
}
