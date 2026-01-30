export type TableStatus = 'free' | 'occupied';

export interface Table {
  id: string;
  restaurantId: string;
  name: string;
  status: TableStatus;
  currentWaiterId: string | null;
  createdAt?: string;
}
