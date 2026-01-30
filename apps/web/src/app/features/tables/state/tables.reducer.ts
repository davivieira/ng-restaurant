import { createReducer, on } from '@ngrx/store';
import { tablesActions } from './tables.actions';
import { initialTablesState } from './tables.state';

export const tablesReducer = createReducer(
  initialTablesState,
  on(tablesActions.loadTables, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(tablesActions.loadTablesSuccess, (state, { tables }) => ({
    ...state,
    tables,
    loading: false,
    error: null,
  })),
  on(tablesActions.loadTablesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(tablesActions.createTable, (state) => ({
    ...state,
    error: null,
  })),
  on(tablesActions.createTableSuccess, (state, { table }) => ({
    ...state,
    tables: [...state.tables, table],
    error: null,
  })),
  on(tablesActions.createTableFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(tablesActions.updateTableSuccess, (state, { table }) => ({
    ...state,
    tables: state.tables.map((t) => (t.id === table.id ? table : t)),
    error: null,
  })),
  on(tablesActions.updateTableFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(tablesActions.deleteTableSuccess, (state, { id }) => ({
    ...state,
    tables: state.tables.filter((t) => t.id !== id),
    error: null,
  })),
  on(tablesActions.deleteTableFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(tablesActions.clearTablesError, (state) => ({
    ...state,
    error: null,
  }))
);
