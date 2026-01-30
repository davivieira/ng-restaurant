import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { MenuService } from '../data/menu.service';
import { menuActions } from './menu.actions';

export const MenuEffects = {
  loadMenu$: createEffect(
    () => {
      const actions = inject(Actions);
      const menuService = inject(MenuService);
      return actions.pipe(
        ofType(menuActions.loadMenu),
        mergeMap(() =>
          menuService.getCategories().pipe(
            switchMap((categories) =>
              menuService.getDishes().pipe(
                map((dishes) => menuActions.loadMenuSuccess({ dishes, categories })),
                catchError((err) => of(menuActions.loadMenuFailure({ error: err?.message ?? 'Failed to load menu' })))
              )
            ),
            catchError((err) => of(menuActions.loadMenuFailure({ error: err?.message ?? 'Failed to load menu' })))
          )
        )
      );
    },
    { functional: true }
  ),

  loadDishes$: createEffect(
    () => {
      const actions = inject(Actions);
      const menuService = inject(MenuService);
      return actions.pipe(
        ofType(menuActions.loadDishes),
        mergeMap(({ categoryId }) =>
          menuService.getDishes(categoryId).pipe(
            map((dishes) => menuActions.loadDishesSuccess({ dishes })),
            catchError((err) => of(menuActions.loadDishesFailure({ error: err?.message ?? 'Failed to load dishes' })))
          )
        )
      );
    },
    { functional: true }
  ),

  loadCategories$: createEffect(
    () => {
      const actions = inject(Actions);
      const menuService = inject(MenuService);
      return actions.pipe(
        ofType(menuActions.loadCategories),
        mergeMap(() =>
          menuService.getCategories().pipe(
            map((categories) => menuActions.loadCategoriesSuccess({ categories })),
            catchError((err) =>
              of(menuActions.loadCategoriesFailure({ error: err?.message ?? 'Failed to load categories' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),

  createCategory$: createEffect(
    () => {
      const actions = inject(Actions);
      const menuService = inject(MenuService);
      return actions.pipe(
        ofType(menuActions.createCategory),
        mergeMap(({ dto }) =>
          menuService.createCategory(dto).pipe(
            map((category) => menuActions.createCategorySuccess({ category })),
            catchError((err) =>
              of(menuActions.createCategoryFailure({ error: err?.message ?? 'Failed to create category' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),

  updateCategory$: createEffect(
    () => {
      const actions = inject(Actions);
      const menuService = inject(MenuService);
      return actions.pipe(
        ofType(menuActions.updateCategory),
        mergeMap(({ id, dto }) =>
          menuService.updateCategory(id, dto).pipe(
            map((category) => menuActions.updateCategorySuccess({ category })),
            catchError((err) =>
              of(menuActions.updateCategoryFailure({ error: err?.message ?? 'Failed to update category' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),

  deleteCategory$: createEffect(
    () => {
      const actions = inject(Actions);
      const menuService = inject(MenuService);
      return actions.pipe(
        ofType(menuActions.deleteCategory),
        mergeMap(({ id }) =>
          menuService.deleteCategory(id).pipe(
            map(() => menuActions.deleteCategorySuccess({ id })),
            catchError((err) =>
              of(menuActions.deleteCategoryFailure({ error: err?.message ?? 'Failed to delete category' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),

  createDish$: createEffect(
    () => {
      const actions = inject(Actions);
      const menuService = inject(MenuService);
      return actions.pipe(
        ofType(menuActions.createDish),
        mergeMap(({ dto }) =>
          menuService.createDish(dto).pipe(
            map((dish) => menuActions.createDishSuccess({ dish })),
            catchError((err) =>
              of(menuActions.createDishFailure({ error: err?.message ?? 'Failed to create dish' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),

  updateDish$: createEffect(
    () => {
      const actions = inject(Actions);
      const menuService = inject(MenuService);
      return actions.pipe(
        ofType(menuActions.updateDish),
        mergeMap(({ id, dto }) =>
          menuService.updateDish(id, dto).pipe(
            map((dish) => menuActions.updateDishSuccess({ dish })),
            catchError((err) =>
              of(menuActions.updateDishFailure({ error: err?.message ?? 'Failed to update dish' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),

  deleteDish$: createEffect(
    () => {
      const actions = inject(Actions);
      const menuService = inject(MenuService);
      return actions.pipe(
        ofType(menuActions.deleteDish),
        mergeMap(({ id }) =>
          menuService.deleteDish(id).pipe(
            map(() => menuActions.deleteDishSuccess({ id })),
            catchError((err) =>
              of(menuActions.deleteDishFailure({ error: err?.message ?? 'Failed to delete dish' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),
};
