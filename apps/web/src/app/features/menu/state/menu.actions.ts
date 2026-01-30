import { createAction, props } from '@ngrx/store';
import type { Category } from '../models/category.model';
import type { Dish } from '../models/dish.model';
import type {
  CreateCategoryDto,
  CreateDishDto,
  UpdateCategoryDto,
  UpdateDishDto,
} from '../data/menu.service';

export const menuActions = {
  loadDishes: createAction('[Menu] Load dishes', props<{ categoryId?: string }>()),
  loadDishesSuccess: createAction('[Menu] Load dishes success', props<{ dishes: Dish[] }>()),
  loadDishesFailure: createAction('[Menu] Load dishes failure', props<{ error: string }>()),

  loadCategories: createAction('[Menu] Load categories'),
  loadCategoriesSuccess: createAction('[Menu] Load categories success', props<{ categories: Category[] }>()),
  loadCategoriesFailure: createAction('[Menu] Load categories failure', props<{ error: string }>()),

  loadMenu: createAction('[Menu] Load menu'),
  loadMenuSuccess: createAction(
    '[Menu] Load menu success',
    props<{ dishes: Dish[]; categories: Category[] }>()
  ),
  loadMenuFailure: createAction('[Menu] Load menu failure', props<{ error: string }>()),

  createCategory: createAction('[Menu] Create category', props<{ dto: CreateCategoryDto }>()),
  createCategorySuccess: createAction('[Menu] Create category success', props<{ category: Category }>()),
  createCategoryFailure: createAction('[Menu] Create category failure', props<{ error: string }>()),

  updateCategory: createAction('[Menu] Update category', props<{ id: string; dto: UpdateCategoryDto }>()),
  updateCategorySuccess: createAction('[Menu] Update category success', props<{ category: Category }>()),
  updateCategoryFailure: createAction('[Menu] Update category failure', props<{ error: string }>()),

  deleteCategory: createAction('[Menu] Delete category', props<{ id: string }>()),
  deleteCategorySuccess: createAction('[Menu] Delete category success', props<{ id: string }>()),
  deleteCategoryFailure: createAction('[Menu] Delete category failure', props<{ error: string }>()),

  createDish: createAction('[Menu] Create dish', props<{ dto: CreateDishDto }>()),
  createDishSuccess: createAction('[Menu] Create dish success', props<{ dish: Dish }>()),
  createDishFailure: createAction('[Menu] Create dish failure', props<{ error: string }>()),

  updateDish: createAction('[Menu] Update dish', props<{ id: string; dto: UpdateDishDto }>()),
  updateDishSuccess: createAction('[Menu] Update dish success', props<{ dish: Dish }>()),
  updateDishFailure: createAction('[Menu] Update dish failure', props<{ error: string }>()),

  deleteDish: createAction('[Menu] Delete dish', props<{ id: string }>()),
  deleteDishSuccess: createAction('[Menu] Delete dish success', props<{ id: string }>()),
  deleteDishFailure: createAction('[Menu] Delete dish failure', props<{ error: string }>()),

  clearMenuError: createAction('[Menu] Clear error'),
} as const;
