import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/data/auth.service';
import type { AuthUser } from '../../../auth/models/auth-user.model';
import { CardComponent, ButtonComponent } from '../../../../shared';

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [CardComponent, ButtonComponent, FormsModule],
  templateUrl: './team.page.html',
  styleUrl: './team.page.scss',
})
export class TeamPage implements OnInit {
  private readonly authService = inject(AuthService);

  name = signal('');
  email = signal('');
  loading = signal(false);
  loadingWaiters = signal(false);
  error = signal<string | null>(null);
  waiters = signal<AuthUser[]>([]);
  /** Set after successful create; shows one-time temporary password. */
  created = signal<{ email: string; temporaryPassword: string } | null>(null);

  ngOnInit() {
    this.loadWaiters();
  }

  loadWaiters() {
    this.loadingWaiters.set(true);
    this.authService.getWaiters().subscribe({
      next: (list) => {
        this.waiters.set(list);
        this.loadingWaiters.set(false);
      },
      error: () => this.loadingWaiters.set(false),
    });
  }

  onSubmit() {
    const name = this.name().trim();
    const email = this.email().trim();
    this.error.set(null);
    this.created.set(null);
    if (!name || !email) {
      this.error.set('Name and email are required.');
      return;
    }
    this.loading.set(true);
    this.authService.createWaiter(name, email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.created.set({ email: res.user.email, temporaryPassword: res.temporaryPassword });
        this.name.set('');
        this.email.set('');
        this.waiters.update((list) => [...list, res.user]);
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ??
          err?.message ??
          (err?.status === 409 ? 'Email already registered.' : 'Failed to add waiter.');
        this.error.set(msg);
      },
    });
  }

  copyPassword(password: string) {
    navigator.clipboard.writeText(password).then();
  }
}
