import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { ordersActions } from './orders.actions';
import { OrdersEffects } from './orders.effects';
import { OrdersService } from '../data/orders.service';
import type { Order } from '../models/order.model';

const mockOrder: Order = {
  id: 'o1',
  restaurantId: 'r1',
  tableId: 't1',
  waiterId: 'w1',
  status: 'pending',
  items: [],
};

describe('OrdersEffects', () => {
  let actions$: Observable<Action>;
  let ordersService: {
    getOrdersByTable: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    ordersService = { getOrdersByTable: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        { provide: OrdersService, useValue: ordersService },
      ],
    });
  });

  describe('loadOrdersByTable$', () => {
    it('dispatches loadOrdersByTableSuccess when getOrdersByTable succeeds', async () => {
      actions$ = of(ordersActions.loadOrdersByTable({ tableId: 't1' }));
      ordersService.getOrdersByTable.mockReturnValue(of([mockOrder]));

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          const effect = (OrdersEffects.loadOrdersByTable$ as unknown as () => import('rxjs').Observable<Action>)();
          effect.subscribe({
            next: (action: Action) => {
              expect(action.type).toBe(ordersActions.loadOrdersByTableSuccess.type);
              expect((action as ReturnType<typeof ordersActions.loadOrdersByTableSuccess>).orders).toEqual([mockOrder]);
              expect((action as ReturnType<typeof ordersActions.loadOrdersByTableSuccess>).tableId).toBe('t1');
              resolve();
            },
            error: reject,
          });
        });
      });
    });

    it('dispatches loadOrdersByTableFailure when getOrdersByTable fails', async () => {
      actions$ = of(ordersActions.loadOrdersByTable({ tableId: 't1' }));
      ordersService.getOrdersByTable.mockReturnValue(throwError(() => new Error('Failed')));

      await new Promise<void>((resolve, reject) => {
        TestBed.runInInjectionContext(() => {
          const effect = (OrdersEffects.loadOrdersByTable$ as unknown as () => import('rxjs').Observable<Action>)();
          effect.subscribe({
            next: (action: Action) => {
              expect(action.type).toBe(ordersActions.loadOrdersByTableFailure.type);
              resolve();
            },
            error: reject,
          });
        });
      });
    });
  });
});
