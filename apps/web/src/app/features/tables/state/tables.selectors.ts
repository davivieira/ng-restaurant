import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { TablesState } from './tables.state';
import type { Table } from '../models/table.model';

const selectTablesState = createFeatureSelector<TablesState>('tables');

export const selectTables = createSelector(selectTablesState, (state) => state.tables);
export const selectTablesLoading = createSelector(selectTablesState, (state) => state.loading);
export const selectTablesError = createSelector(selectTablesState, (state) => state.error);

export const selectTableById = (id: string | null) =>
  createSelector(selectTables, (tables: Table[]) =>
    id ? tables.find((t) => t.id === id) ?? null : null
  );
