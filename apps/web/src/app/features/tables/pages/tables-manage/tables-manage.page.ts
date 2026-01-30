import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { CardComponent, ButtonComponent } from '../../../../shared';
import { tablesActions } from '../../state/tables.actions';
import {
  selectTables,
  selectTablesLoading,
  selectTablesError,
} from '../../state/tables.selectors';
import type { CreateTableDto } from '../../data/tables.service';
import type { TableStatus } from '../../models/table.model';

@Component({
  selector: 'app-tables-manage-page',
  standalone: true,
  imports: [CardComponent, ButtonComponent, RouterLink, FormsModule],
  templateUrl: './tables-manage.page.html',
  styleUrl: './tables-manage.page.scss',
})
export class TablesManagePage implements OnInit {
  private readonly store = inject(Store);

  tables = this.store.selectSignal(selectTables);
  loading = this.store.selectSignal(selectTablesLoading);
  error = this.store.selectSignal(selectTablesError);

  name = signal('');
  status = signal<TableStatus>('free');
  editingId = signal<string | null>(null);
  editingName = signal('');
  editingStatus = signal<TableStatus>('free');

  ngOnInit() {
    this.store.dispatch(tablesActions.clearTablesError());
    this.store.dispatch(tablesActions.loadTables());
  }

  onSubmit() {
    const name = this.name().trim();
    if (!name) return;
    const dto: CreateTableDto = { name, status: this.status() };
    this.store.dispatch(tablesActions.createTable({ dto }));
    this.name.set('');
    this.status.set('free');
  }

  startEdit(table: { id: string; name: string; status: TableStatus }) {
    this.editingId.set(table.id);
    this.editingName.set(table.name);
    this.editingStatus.set(table.status);
  }

  saveEdit() {
    const id = this.editingId();
    const name = this.editingName().trim();
    if (!id || !name) return;
    this.store.dispatch(
      tablesActions.updateTable({
        id,
        dto: { name, status: this.editingStatus() },
      })
    );
    this.editingId.set(null);
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  deleteTable(table: { id: string; name: string }) {
    if (confirm(`Delete table "${table.name}"? This cannot be undone.`)) {
      this.store.dispatch(tablesActions.deleteTable({ id: table.id }));
    }
  }
}
