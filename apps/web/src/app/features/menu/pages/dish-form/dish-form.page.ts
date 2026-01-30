import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CardComponent, ButtonComponent } from '../../../../shared';
import { menuActions } from '../../state/menu.actions';
import {
  selectMenuCategories,
  selectMenuDishes,
  selectMenuError,
  selectMenuLoading,
} from '../../state/menu.selectors';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dish-form-page',
  standalone: true,
  imports: [CardComponent, ButtonComponent, RouterLink, FormsModule],
  templateUrl: './dish-form.page.html',
  styleUrl: './dish-form.page.scss',
})
export class DishFormPage implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  categories = this.store.selectSignal(selectMenuCategories);
  dishes = this.store.selectSignal(selectMenuDishes);
  error = this.store.selectSignal(selectMenuError);
  loading = this.store.selectSignal(selectMenuLoading);

  routeId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), { initialValue: null });
  dish = computed(() => {
    const id = this.routeId();
    const list = this.dishes();
    if (!id || id === 'new') return null;
    return list.find((d) => d.id === id) ?? null;
  });
  private dishEffect = effect(() => {
    const d = this.dish();
    if (d) {
      this.name.set(d.name);
      this.description.set(d.description ?? '');
      this.price.set(parseFloat(d.price));
      this.categoryId.set(d.categoryId ?? null);
      this.isActive.set(d.isActive);
    }
  });

  name = signal('');
  description = signal('');
  price = signal<number>(0);
  categoryId = signal<string | null>(null);
  isActive = signal(true);

  isEdit = computed(() => {
    const id = this.routeId();
    return !!(id && id !== 'new');
  });

  ngOnInit() {
    this.store.dispatch(menuActions.clearMenuError());
    this.store.dispatch(menuActions.loadCategories());
    this.store.dispatch(menuActions.loadDishes({}));
  }

  save() {
    const name = this.name().trim();
    const price = this.price();
    if (!name || price < 0) return;
    const dto = {
      name,
      description: this.description().trim() || undefined,
      price,
      categoryId: this.categoryId() || null,
      isActive: this.isActive(),
    };
    const id = this.routeId();
    if (id && id !== 'new') {
      this.store.dispatch(menuActions.updateDish({ id, dto }));
    } else {
      this.store.dispatch(menuActions.createDish({ dto }));
    }
    this.router.navigate(['/menu/manage']);
  }

  cancel() {
    this.router.navigate(['/menu/manage']);
  }
}
