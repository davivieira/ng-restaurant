import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { CardComponent, ButtonComponent } from '../../../../shared';
import { selectUserRole } from '../../../auth/state/auth.selectors';
import { menuActions } from '../../state/menu.actions';
import { selectMenuGroupedByCategory, selectMenuLoading, selectMenuError } from '../../state/menu.selectors';

@Component({
  selector: 'app-menu-list-page',
  standalone: true,
  imports: [CardComponent, ButtonComponent, RouterLink],
  templateUrl: './menu-list.page.html',
  styleUrl: './menu-list.page.scss',
})
export class MenuListPage implements OnInit {
  private readonly store = inject(Store);

  role = this.store.selectSignal(selectUserRole);
  grouped = this.store.selectSignal(selectMenuGroupedByCategory);
  loading = this.store.selectSignal(selectMenuLoading);
  error = this.store.selectSignal(selectMenuError);

  ngOnInit() {
    this.store.dispatch(menuActions.loadMenu());
  }
}
