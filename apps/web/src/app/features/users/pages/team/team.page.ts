import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/data/auth.service';
import type { AuthUser } from '../../../auth/models/auth-user.model';
import type { StaffRole } from '../../../auth/data/auth.service';
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
  role = signal<StaffRole>('waiter');
  loading = signal(false);
  loadingWaiters = signal(false);
  loadingKitchen = signal(false);
  error = signal<string | null>(null);
  waiters = signal<AuthUser[]>([]);
  kitchen = signal<AuthUser[]>([]);
  /** Set after successful create; shows one-time temporary password. */
  created = signal<{ email: string; role: string; temporaryPassword: string } | null>(null);

  ngOnInit() {
    this.loadWaiters();
    this.loadKitchen();
  }

  loadWaiters() {
    this.loadingWaiters.set(true);
    this.authService.getStaff('waiter').subscribe({
      next: (list: AuthUser[]) => {
        this.waiters.set(list);
        this.loadingWaiters.set(false);
      },
      error: () => this.loadingWaiters.set(false),
    });
  }

  loadKitchen() {
    this.loadingKitchen.set(true);
    this.authService.getStaff('kitchen').subscribe({
      next: (list: AuthUser[]) => {
        this.kitchen.set(list);
        this.loadingKitchen.set(false);
      },
      error: () => this.loadingKitchen.set(false),
    });
  }

  onSubmit() {
    const name = this.name().trim();
    const email = this.email().trim();
    const staffRole = this.role();
    this.error.set(null);
    this.created.set(null);
    if (!name || !email) {
      this.error.set('Name and email are required.');
      return;
    }
    this.loading.set(true);
    this.authService.createStaff(name, email, staffRole).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.created.set({
          email: res.user.email,
          role: res.user.role,
          temporaryPassword: res.temporaryPassword,
        });
        this.name.set('');
        this.email.set('');
        if (res.user.role === 'waiter') {
          this.waiters.update((list) => [...list, res.user]);
        } else {
          this.kitchen.update((list) => [...list, res.user]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ??
          err?.message ??
          (err?.status === 409 ? 'Email already registered.' : 'Failed to add member.');
        this.error.set(msg);
      },
    });
  }

  copyPassword(password: string) {
    navigator.clipboard.writeText(password).then();
  }
}
