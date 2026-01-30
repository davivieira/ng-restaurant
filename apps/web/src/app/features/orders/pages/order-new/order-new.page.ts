import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CardComponent, ButtonComponent, QuantityInputComponent } from '../../../../shared';
import { selectTables } from '../../../tables/state/tables.selectors';
import { tablesActions } from '../../../tables/state/tables.actions';
import { selectMenuGroupedByCategory } from '../../../menu/state/menu.selectors';
import { menuActions } from '../../../menu/state/menu.actions';
import { ordersActions } from '../../state/orders.actions';
import {
  selectOrdersLoading,
  selectOrdersError,
} from '../../state/orders.selectors';
import type { CreateOrderItemDto } from '../../data/orders.service';
import type { Dish } from '../../../menu/models/dish.model';

@Component({
  selector: 'app-order-new-page',
  standalone: true,
  imports: [CardComponent, ButtonComponent, QuantityInputComponent, RouterLink, FormsModule],
  templateUrl: './order-new.page.html',
  styleUrl: './order-new.page.scss',
})
export class OrderNewPage implements OnInit {
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

  grouped = this.store.selectSignal(selectMenuGroupedByCategory);
  loading = this.store.selectSignal(selectOrdersLoading);
  error = this.store.selectSignal(selectOrdersError);

  /** Map dishId -> { quantity, observations } for form */
  lineItems = signal<Record<string, { quantity: number; observations: string }>>({});

  ngOnInit() {
    this.store.dispatch(tablesActions.loadTables());
    this.store.dispatch(menuActions.loadMenu());
  }

  getLine(dishId: string) {
    const items = this.lineItems();
    if (!items[dishId]) {
      return { quantity: 0, observations: '' };
    }
    return items[dishId];
  }

  setQuantity(dishId: string, quantity: number) {
    const q = Math.max(0, Math.floor(quantity));
    this.lineItems.update((prev) => ({
      ...prev,
      [dishId]: { ...(prev[dishId] ?? { quantity: 0, observations: '' }), quantity: q },
    }));
  }

  setObservations(dishId: string, observations: string) {
    this.lineItems.update((prev) => ({
      ...prev,
      [dishId]: { ...(prev[dishId] ?? { quantity: 0, observations: '' }), observations },
    }));
  }

  hasItems(): boolean {
    const items = this.lineItems();
    return Object.values(items).some((l) => l.quantity > 0);
  }

  submit() {
    const tableId = this.tableId();
    if (!tableId) return;
    const itemsObj = this.lineItems();
    const items: CreateOrderItemDto[] = [];
    for (const [dishId, line] of Object.entries(itemsObj)) {
      if (line.quantity > 0) {
        items.push({
          dishId,
          quantity: line.quantity,
          observations: line.observations.trim() || undefined,
        });
      }
    }
    if (items.length === 0) return;
    this.store.dispatch(ordersActions.createOrder({ dto: { tableId, items } }));
    this.router.navigate(['/tables', tableId, 'orders']);
  }

  trackDish(dish: Dish) {
    return dish.id;
  }
}
