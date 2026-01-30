import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { routes } from './app.routes';
import { authReducer } from './features/auth/state/auth.reducer';
import { AuthEffects } from './features/auth/state/auth.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { restoreSessionFactory } from './features/auth/state/restore-session.effect';
import { menuReducer } from './features/menu/state/menu.reducer';
import { MenuEffects } from './features/menu/state/menu.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({ auth: authReducer, menu: menuReducer }),
    provideEffects(AuthEffects, MenuEffects),
    provideRouterStore(),
    {
      provide: APP_INITIALIZER,
      useFactory: restoreSessionFactory,
      multi: true,
    },
  ],
};
