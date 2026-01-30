import { createReducer, on } from '@ngrx/store';
import { menuActions } from './menu.actions';
import { initialMenuState } from './menu.state';

export const menuReducer = createReducer(
  initialMenuState,
  on(menuActions.loadMenu, menuActions.loadDishes, menuActions.loadCategories, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(menuActions.loadMenuSuccess, (state, { dishes, categories }) => ({
    ...state,
    dishes,
    categories,
    loading: false,
    error: null,
  })),
  on(menuActions.loadDishesSuccess, (state, { dishes }) => ({
    ...state,
    dishes,
    loading: false,
    error: null,
  })),
  on(menuActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    loading: false,
    error: null,
  })),
  on(
    menuActions.loadMenuFailure,
    menuActions.loadDishesFailure,
    menuActions.loadCategoriesFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })
  ),
  on(menuActions.createCategorySuccess, (state, { category }) => ({
    ...state,
    categories: [...state.categories, category],
    error: null,
  })),
  on(menuActions.updateCategorySuccess, (state, { category }) => ({
    ...state,
    categories: state.categories.map((c) => (c.id === category.id ? category : c)),
    error: null,
  })),
  on(menuActions.deleteCategorySuccess, (state, { id }) => ({
    ...state,
    categories: state.categories.filter((c) => c.id !== id),
    dishes: state.dishes.map((d) => (d.categoryId === id ? { ...d, categoryId: null } : d)),
    error: null,
  })),
  on(menuActions.createDishSuccess, (state, { dish }) => ({
    ...state,
    dishes: [...state.dishes, dish],
    error: null,
  })),
  on(menuActions.updateDishSuccess, (state, { dish }) => ({
    ...state,
    dishes: state.dishes.map((d) => (d.id === dish.id ? dish : d)),
    error: null,
  })),
  on(menuActions.deleteDishSuccess, (state, { id }) => ({
    ...state,
    dishes: state.dishes.filter((d) => d.id !== id),
    error: null,
  })),
  on(
    menuActions.createCategoryFailure,
    menuActions.updateCategoryFailure,
    menuActions.deleteCategoryFailure,
    menuActions.createDishFailure,
    menuActions.updateDishFailure,
    menuActions.deleteDishFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  ),
  on(menuActions.clearMenuError, (state) => ({
    ...state,
    error: null,
  }))
);
