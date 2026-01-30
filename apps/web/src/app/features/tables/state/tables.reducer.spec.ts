import { tablesReducer } from './tables.reducer';
import { tablesActions } from './tables.actions';
import { initialTablesState } from './tables.state';
import type { Table } from '../models/table.model';

const mockTable: Table = {
  id: 't1',
  restaurantId: 'r1',
  name: 'Table 1',
  status: 'free',
  currentWaiterId: null,
};

describe('tablesReducer', () => {
  it('should return initial state', () => {
    const state = tablesReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialTablesState);
  });

  it('should set loading on loadTables', () => {
    const state = tablesReducer(initialTablesState, tablesActions.loadTables());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set tables on loadTablesSuccess', () => {
    const state = tablesReducer(
      { ...initialTablesState, loading: true },
      tablesActions.loadTablesSuccess({ tables: [mockTable] })
    );
    expect(state.tables).toEqual([mockTable]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set error on loadTablesFailure', () => {
    const state = tablesReducer(
      { ...initialTablesState, loading: true },
      tablesActions.loadTablesFailure({ error: 'Failed' })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed');
  });

  it('should add table on createTableSuccess', () => {
    const state = tablesReducer(
      { ...initialTablesState, tables: [mockTable] },
      tablesActions.createTableSuccess({ table: { ...mockTable, id: 't2', name: 'Table 2' } })
    );
    expect(state.tables).toHaveLength(2);
    expect(state.tables[1].name).toBe('Table 2');
  });

  it('should update table on updateTableSuccess', () => {
    const state = tablesReducer(
      { ...initialTablesState, tables: [mockTable] },
      tablesActions.updateTableSuccess({ table: { ...mockTable, status: 'occupied' } })
    );
    expect(state.tables[0].status).toBe('occupied');
  });

  it('should remove table on deleteTableSuccess', () => {
    const state = tablesReducer(
      { ...initialTablesState, tables: [mockTable, { ...mockTable, id: 't2' }] },
      tablesActions.deleteTableSuccess({ id: 't1' })
    );
    expect(state.tables).toHaveLength(1);
    expect(state.tables[0].id).toBe('t2');
  });

  it('should clear error on clearTablesError', () => {
    const state = tablesReducer(
      { ...initialTablesState, error: 'err' },
      tablesActions.clearTablesError()
    );
    expect(state.error).toBeNull();
  });
});
