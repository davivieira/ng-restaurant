import { createAction, props } from '@ngrx/store';
import type { Table } from '../models/table.model';
import type { CreateTableDto, UpdateTableDto } from '../data/tables.service';

export const tablesActions = {
  loadTables: createAction('[Tables] Load tables'),
  loadTablesSuccess: createAction('[Tables] Load tables success', props<{ tables: Table[] }>()),
  loadTablesFailure: createAction('[Tables] Load tables failure', props<{ error: string }>()),

  createTable: createAction('[Tables] Create table', props<{ dto: CreateTableDto }>()),
  createTableSuccess: createAction('[Tables] Create table success', props<{ table: Table }>()),
  createTableFailure: createAction('[Tables] Create table failure', props<{ error: string }>()),

  updateTable: createAction('[Tables] Update table', props<{ id: string; dto: UpdateTableDto }>()),
  updateTableSuccess: createAction('[Tables] Update table success', props<{ table: Table }>()),
  updateTableFailure: createAction('[Tables] Update table failure', props<{ error: string }>()),

  deleteTable: createAction('[Tables] Delete table', props<{ id: string }>()),
  deleteTableSuccess: createAction('[Tables] Delete table success', props<{ id: string }>()),
  deleteTableFailure: createAction('[Tables] Delete table failure', props<{ error: string }>()),

  clearTablesError: createAction('[Tables] Clear error'),
} as const;
