import { Component, inject, OnInit, computed, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CardComponent, ButtonComponent } from '../../../../shared';
import { selectTables } from '../../../tables/state/tables.selectors';
import { tablesActions } from '../../../tables/state/tables.actions';
import { ordersActions } from '../../state/orders.actions';
import {
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
} from '../../state/orders.selectors';
import type { Order } from '../../models/order.model';

@Component({
  selector: 'app-orders-by-table-page',
  standalone: true,
  imports: [CardComponent, ButtonComponent, RouterLink, DatePipe],
  templateUrl: './orders-by-table.page.html',
  styleUrl: './orders-by-table.page.scss',
})
export class OrdersByTablePage implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  tableId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('tableId') ?? null)),
    { initialValue: null as string | null }
  );

  tables = this.store.selectSignal(selectTables);
  table = computed(() => {
    const id = this.tableId();
    const list = this.tables();
    return id ? list.find((t) => t.id === id) ?? null : null;
  });

  orders = this.store.selectSignal(selectOrders);
  loading = this.store.selectSignal(selectOrdersLoading);
  error = this.store.selectSignal(selectOrdersError);

  private loadEffect = effect(() => {
    const id = this.tableId();
    if (id) {
      this.store.dispatch(ordersActions.loadOrdersByTable({ tableId: id }));
    }
  });

  ngOnInit() {
    this.store.dispatch(tablesActions.loadTables());
  }

  canCancel(order: Order): boolean {
    return order.status !== 'in_progress';
  }

  cancelOrder(order: Order) {
    if (!this.canCancel(order)) return;
    if (confirm('Cancel this order?')) {
      this.store.dispatch(ordersActions.cancelOrder({ id: order.id }));
    }
  }

  goToNewOrder() {
    const id = this.tableId();
    if (id) this.router.navigate(['/tables', id, 'orders', 'new']);
  }

  markBillAsPaid() {
    const t = this.table();
    if (!t || t.status !== 'occupied') return;
    if (confirm('Mark bill as paid and set this table as free?')) {
      this.store.dispatch(
        tablesActions.updateTable({ id: t.id, dto: { status: 'free' } })
      );
    }
  }
}
