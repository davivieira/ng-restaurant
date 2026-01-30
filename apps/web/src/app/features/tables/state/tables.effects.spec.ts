import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { tablesActions } from './tables.actions';
import { TablesEffects } from './tables.effects';
import { TablesService } from '../data/tables.service';
import type { Table } from '../models/table.model';

const mockTable: Table = {
  id: 't1',
  restaurantId: 'r1',
  name: 'Table 1',
  status: 'free',
  currentWaiterId: null,
};

describe('TablesEffects', () => {
  let actions$: Observable<Action>;
  let tablesService: { getTables: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    tablesService = { getTables: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        { provide: TablesService, useValue: tablesService },
      ],
    });
  });

  describe('loadTables$', () => {
    it('dispatches loadTablesSuccess when getTables succeeds', async () => {
      actions$ = of(tablesActions.loadTables());
      tablesService.getTables.mockReturnValue(of([mockTable]));

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          const effect = (TablesEffects.loadTables$ as unknown as () => import('rxjs').Observable<Action>)();
          effect.subscribe({
            next: (action: Action) => {
              expect(action.type).toBe(tablesActions.loadTablesSuccess.type);
              expect((action as ReturnType<typeof tablesActions.loadTablesSuccess>).tables).toEqual([mockTable]);
              resolve();
            },
            error: reject,
          });
        });
      });
    });

    it('dispatches loadTablesFailure when getTables fails', async () => {
      actions$ = of(tablesActions.loadTables());
      tablesService.getTables.mockReturnValue(throwError(() => new Error('Failed')));

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          const effect = (TablesEffects.loadTables$ as unknown as () => import('rxjs').Observable<Action>)();
          effect.subscribe({
            next: (action: Action) => {
              expect(action.type).toBe(tablesActions.loadTablesFailure.type);
              resolve();
            },
            error: reject,
          });
        });
      });
    });
  });
});
