import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { TablesService } from '../data/tables.service';
import { tablesActions } from './tables.actions';

export const TablesEffects = {
  loadTables$: createEffect(
    () => {
      const actions = inject(Actions);
      const tablesService = inject(TablesService);
      return actions.pipe(
        ofType(tablesActions.loadTables),
        mergeMap(() =>
          tablesService.getTables().pipe(
            map((tables) => tablesActions.loadTablesSuccess({ tables })),
            catchError((err) =>
              of(tablesActions.loadTablesFailure({ error: err?.message ?? 'Failed to load tables' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),

  createTable$: createEffect(
    () => {
      const actions = inject(Actions);
      const tablesService = inject(TablesService);
      return actions.pipe(
        ofType(tablesActions.createTable),
        mergeMap(({ dto }) =>
          tablesService.createTable(dto).pipe(
            map((table) => tablesActions.createTableSuccess({ table })),
            catchError((err) =>
              of(tablesActions.createTableFailure({ error: err?.message ?? 'Failed to create table' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),

  updateTable$: createEffect(
    () => {
      const actions = inject(Actions);
      const tablesService = inject(TablesService);
      return actions.pipe(
        ofType(tablesActions.updateTable),
        mergeMap(({ id, dto }) =>
          tablesService.updateTable(id, dto).pipe(
            map((table) => tablesActions.updateTableSuccess({ table })),
            catchError((err) =>
              of(tablesActions.updateTableFailure({ error: err?.message ?? 'Failed to update table' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),

  deleteTable$: createEffect(
    () => {
      const actions = inject(Actions);
      const tablesService = inject(TablesService);
      return actions.pipe(
        ofType(tablesActions.deleteTable),
        mergeMap(({ id }) =>
          tablesService.deleteTable(id).pipe(
            map(() => tablesActions.deleteTableSuccess({ id })),
            catchError((err) =>
              of(tablesActions.deleteTableFailure({ error: err?.message ?? 'Failed to delete table' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),
};
