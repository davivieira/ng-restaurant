import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { authActions } from '../../auth/state/auth.actions';
import { selectAuthUser, selectUserRole } from '../../auth/state/auth.selectors';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  menuOpen = signal(false);
  user = this.store.selectSignal(selectAuthUser);
  role = this.store.selectSignal(selectUserRole);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.closeMenu());
  }

  openMenu() {
    this.menuOpen.set(true);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout() {
    this.closeMenu();
    this.store.dispatch(authActions.logout());
  }
}
