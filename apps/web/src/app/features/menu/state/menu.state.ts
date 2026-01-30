import type { Category } from '../models/category.model';
import type { Dish } from '../models/dish.model';

export interface MenuState {
  dishes: Dish[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const initialMenuState: MenuState = {
  dishes: [],
  categories: [],
  loading: false,
  error: null,
};
