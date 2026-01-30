import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../../state/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../state/auth.selectors';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage implements OnInit {
  private readonly store = inject(Store);

  name = signal('');
  email = signal('');
  password = signal('');
  restaurantName = signal('');

  loading = this.store.selectSignal(selectAuthLoading);
  error = this.store.selectSignal(selectAuthError);

  ngOnInit() {
    this.store.dispatch(authActions.clearError());
  }

  onSubmit() {
    this.store.dispatch(
      authActions.register({
        name: this.name(),
        email: this.email(),
        password: this.password(),
        restaurantName: this.restaurantName(),
      })
    );
  }
}
