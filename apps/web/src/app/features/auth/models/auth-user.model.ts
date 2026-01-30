export type UserRole = 'admin' | 'waiter' | 'kitchen';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId: string;
}
