import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { MenuState } from './menu.state';
import type { Category } from '../models/category.model';
import type { Dish } from '../models/dish.model';

const selectMenuState = createFeatureSelector<MenuState>('menu');

export const selectMenuDishes = createSelector(selectMenuState, (state) => state.dishes);
export const selectMenuCategories = createSelector(selectMenuState, (state) => state.categories);
export const selectMenuLoading = createSelector(selectMenuState, (state) => state.loading);
export const selectMenuError = createSelector(selectMenuState, (state) => state.error);

/** Dishes grouped by category (category id -> dishes). Uncategorized dishes under null. */
export const selectDishesByCategory = createSelector(
  selectMenuDishes,
  selectMenuCategories,
  (dishes: Dish[], categories: Category[]) => {
    const byCategory = new Map<string | null, Dish[]>();
    byCategory.set(null, []);
    for (const c of categories) byCategory.set(c.id, []);
    for (const d of dishes) {
      const key = d.categoryId ?? null;
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key)!.push(d);
    }
    return byCategory;
  }
);

export const selectDishById = (id: string | null) =>
  createSelector(selectMenuDishes, (dishes) => (id ? dishes.find((d) => d.id === id) ?? null : null));

/** Categories in order with their dishes (for read-only menu view). */
export const selectMenuGroupedByCategory = createSelector(
  selectMenuCategories,
  selectDishesByCategory,
  (categories: Category[], byCategory: Map<string | null, Dish[]>) =>
    categories.map((cat) => ({ category: cat, dishes: byCategory.get(cat.id) ?? [] })).concat(
      (byCategory.get(null)?.length ?? 0) > 0
        ? [{ category: { id: '', restaurantId: '', name: 'Other' } as Category, dishes: byCategory.get(null)! }]
        : []
    )
);
