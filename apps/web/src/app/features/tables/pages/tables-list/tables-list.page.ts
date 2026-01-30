import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { CardComponent, ButtonComponent } from '../../../../shared';
import { selectUserRole } from '../../../auth/state/auth.selectors';
import { tablesActions } from '../../state/tables.actions';
import {
  selectTables,
  selectTablesLoading,
  selectTablesError,
} from '../../state/tables.selectors';

@Component({
  selector: 'app-tables-list-page',
  standalone: true,
  imports: [CardComponent, ButtonComponent, RouterLink],
  templateUrl: './tables-list.page.html',
  styleUrl: './tables-list.page.scss',
})
export class TablesListPage implements OnInit {
  private readonly store = inject(Store);

  role = this.store.selectSignal(selectUserRole);
  tables = this.store.selectSignal(selectTables);
  loading = this.store.selectSignal(selectTablesLoading);
  error = this.store.selectSignal(selectTablesError);

  ngOnInit() {
    this.store.dispatch(tablesActions.loadTables());
  }

  setOccupied(table: { id: string }) {
    this.store.dispatch(
      tablesActions.updateTable({ id: table.id, dto: { status: 'occupied' } })
    );
  }
}
