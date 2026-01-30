import {
  selectTables,
  selectTablesLoading,
  selectTablesError,
  selectTableById,
} from './tables.selectors';
import type { TablesState } from './tables.state';
import type { Table } from '../models/table.model';

const mockTable: Table = {
  id: 't1',
  restaurantId: 'r1',
  name: 'Table 1',
  status: 'free',
  currentWaiterId: null,
};

describe('tables selectors', () => {
  const state: TablesState = {
    tables: [mockTable],
    loading: false,
    error: null,
  };

  it('selectTables returns tables', () => {
    expect(selectTables.projector(state)).toEqual([mockTable]);
  });

  it('selectTablesLoading returns loading', () => {
    expect(selectTablesLoading.projector(state)).toBe(false);
  });

  it('selectTablesError returns error', () => {
    expect(selectTablesError.projector(state)).toBeNull();
    expect(selectTablesError.projector({ ...state, error: 'err' })).toBe('err');
  });

  it('selectTableById returns table when id matches', () => {
    const selector = selectTableById('t1');
    expect(selector.projector([mockTable])).toEqual(mockTable);
  });

  it('selectTableById returns null when id not found', () => {
    const selector = selectTableById('t2');
    expect(selector.projector([mockTable])).toBeNull();
  });
});
