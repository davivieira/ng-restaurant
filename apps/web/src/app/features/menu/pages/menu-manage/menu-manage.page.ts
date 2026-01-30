import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { CardComponent, ButtonComponent } from '../../../../shared';
import { menuActions } from '../../state/menu.actions';
import {
  selectMenuCategories,
  selectMenuDishes,
  selectMenuLoading,
  selectMenuError,
} from '../../state/menu.selectors';
import { MenuService } from '../../data/menu.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-manage-page',
  standalone: true,
  imports: [CardComponent, ButtonComponent, RouterLink, FormsModule],
  templateUrl: './menu-manage.page.html',
  styleUrl: './menu-manage.page.scss',
})
export class MenuManagePage implements OnInit {
  private readonly store = inject(Store);
  private readonly menuService = inject(MenuService);

  categories = this.store.selectSignal(selectMenuCategories);
  dishes = this.store.selectSignal(selectMenuDishes);
  loading = this.store.selectSignal(selectMenuLoading);
  error = this.store.selectSignal(selectMenuError);

  categoryFilter = signal<string | undefined>(undefined);
  showAddCategory = signal(false);
  newCategoryName = signal('');
  editingCategoryId = signal<string | null>(null);
  editingCategoryName = signal('');

  ngOnInit() {
    this.store.dispatch(menuActions.clearMenuError());
    this.store.dispatch(menuActions.loadCategories());
    this.store.dispatch(menuActions.loadDishes({}));
  }

  filteredDishes() {
    const all = this.dishes();
    const catId = this.categoryFilter();
    if (!catId) return all;
    return all.filter((d) => d.categoryId === catId);
  }

  categoryName(id: string | null): string {
    if (!id) return '—';
    return this.categories().find((c) => c.id === id)?.name ?? '—';
  }

  addCategory() {
    this.showAddCategory.set(true);
  }

  saveNewCategory() {
    const name = this.newCategoryName().trim();
    if (!name) return;
    this.store.dispatch(menuActions.createCategory({ dto: { name } }));
    this.newCategoryName.set('');
    this.showAddCategory.set(false);
  }

  cancelNewCategory() {
    this.showAddCategory.set(false);
    this.newCategoryName.set('');
  }

  startEditCategory(cat: { id: string; name: string }) {
    this.editingCategoryId.set(cat.id);
    this.editingCategoryName.set(cat.name);
  }

  saveEditCategory() {
    const id = this.editingCategoryId();
    const name = this.editingCategoryName().trim();
    if (!id || !name) return;
    this.store.dispatch(menuActions.updateCategory({ id, dto: { name } }));
    this.editingCategoryId.set(null);
    this.editingCategoryName.set('');
  }

  cancelEditCategory() {
    this.editingCategoryId.set(null);
    this.editingCategoryName.set('');
  }

  deleteCategory(id: string) {
    if (confirm('Delete this category? Dishes in it will become uncategorized.')) {
      this.store.dispatch(menuActions.deleteCategory({ id }));
    }
  }

  deleteDish(dish: { id: string; name: string }) {
    if (confirm(`Delete "${dish.name}"?`)) {
      this.store.dispatch(menuActions.deleteDish({ id: dish.id }));
    }
  }
}
