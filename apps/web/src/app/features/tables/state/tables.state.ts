import type { Table } from '../models/table.model';

export interface TablesState {
  tables: Table[];
  loading: boolean;
  error: string | null;
}

export const initialTablesState: TablesState = {
  tables: [],
  loading: false,
  error: null,
};
