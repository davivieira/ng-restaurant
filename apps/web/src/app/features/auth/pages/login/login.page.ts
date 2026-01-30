import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../../state/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth.selectors';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage implements OnInit {
  private readonly store = inject(Store);

  email = signal('');
  password = signal('');

  loading = this.store.selectSignal(selectAuthLoading);
  error = this.store.selectSignal(selectAuthError);

  ngOnInit() {
    this.store.dispatch(authActions.clearError());
  }

  onSubmit() {
    this.store.dispatch(
      authActions.login({
        email: this.email(),
        password: this.password(),
      })
    );
  }
}
