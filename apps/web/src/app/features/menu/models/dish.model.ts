export interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  /** API returns decimal as string */
  price: string;
  categoryId: string | null;
  isActive: boolean;
  createdAt?: string;
}
