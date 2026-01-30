import { menuReducer } from './menu.reducer';
import { menuActions } from './menu.actions';
import { initialMenuState } from './menu.state';
import type { Category } from '../models/category.model';
import type { Dish } from '../models/dish.model';

const mockCategory: Category = { id: 'c1', restaurantId: 'r1', name: 'Starters' };
const mockDish: Dish = {
  id: 'd1',
  restaurantId: 'r1',
  name: 'Soup',
  description: null,
  price: '5',
  categoryId: 'c1',
  isActive: true,
};

describe('menuReducer', () => {
  it('should return initial state', () => {
    const state = menuReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialMenuState);
  });

  it('should set loading on loadMenu', () => {
    const state = menuReducer(initialMenuState, menuActions.loadMenu());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set dishes and categories on loadMenuSuccess', () => {
    const state = menuReducer(
      { ...initialMenuState, loading: true },
      menuActions.loadMenuSuccess({ dishes: [mockDish], categories: [mockCategory] })
    );
    expect(state.dishes).toEqual([mockDish]);
    expect(state.categories).toEqual([mockCategory]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set error on loadMenuFailure', () => {
    const state = menuReducer(
      { ...initialMenuState, loading: true },
      menuActions.loadMenuFailure({ error: 'Failed' })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed');
  });

  it('should add category on createCategorySuccess', () => {
    const state = menuReducer(
      { ...initialMenuState, categories: [mockCategory] },
      menuActions.createCategorySuccess({ category: { ...mockCategory, id: 'c2', name: 'Desserts' } })
    );
    expect(state.categories).toHaveLength(2);
    expect(state.categories[1].name).toBe('Desserts');
  });

  it('should add dish on createDishSuccess', () => {
    const state = menuReducer(
      { ...initialMenuState, dishes: [mockDish] },
      menuActions.createDishSuccess({ dish: { ...mockDish, id: 'd2', name: 'Salad' } })
    );
    expect(state.dishes).toHaveLength(2);
    expect(state.dishes[1].name).toBe('Salad');
  });

  it('should remove dish on deleteDishSuccess', () => {
    const state = menuReducer(
      { ...initialMenuState, dishes: [mockDish, { ...mockDish, id: 'd2' }] },
      menuActions.deleteDishSuccess({ id: 'd1' })
    );
    expect(state.dishes).toHaveLength(1);
    expect(state.dishes[0].id).toBe('d2');
  });

  it('should clear error on clearMenuError', () => {
    const state = menuReducer(
      { ...initialMenuState, error: 'err' },
      menuActions.clearMenuError()
    );
    expect(state.error).toBeNull();
  });
});
