import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { OrdersService } from '../data/orders.service';
import { ordersActions } from './orders.actions';

export const OrdersEffects = {
  loadOrdersByTable$: createEffect(
    () => {
      const actions = inject(Actions);
      const ordersService = inject(OrdersService);
      return actions.pipe(
        ofType(ordersActions.loadOrdersByTable),
        mergeMap(({ tableId }) =>
          ordersService.getOrdersByTable(tableId).pipe(
            map((orders) => ordersActions.loadOrdersByTableSuccess({ tableId, orders })),
            catchError((err) =>
              of(
                ordersActions.loadOrdersByTableFailure({
                  error: err?.message ?? 'Failed to load orders',
                })
              )
            )
          )
        )
      );
    },
    { functional: true }
  ),

  createOrder$: createEffect(
    () => {
      const actions = inject(Actions);
      const ordersService = inject(OrdersService);
      return actions.pipe(
        ofType(ordersActions.createOrder),
        mergeMap(({ dto }) =>
          ordersService.createOrder(dto).pipe(
            map((order) => ordersActions.createOrderSuccess({ order })),
            catchError((err) =>
              of(ordersActions.createOrderFailure({ error: err?.message ?? 'Failed to create order' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),

  cancelOrder$: createEffect(
    () => {
      const actions = inject(Actions);
      const ordersService = inject(OrdersService);
      return actions.pipe(
        ofType(ordersActions.cancelOrder),
        mergeMap(({ id }) =>
          ordersService.cancelOrder(id).pipe(
            map((order) => ordersActions.cancelOrderSuccess({ order })),
            catchError((err) =>
              of(ordersActions.cancelOrderFailure({ error: err?.message ?? 'Failed to cancel order' }))
            )
          )
        )
      );
    },
    { functional: true }
  ),
};
