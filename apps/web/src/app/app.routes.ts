import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { LoginPage } from './features/auth/pages/login/login.page';
import { RegisterPage } from './features/auth/pages/register/register.page';
import { ShellComponent } from './features/layout/shell/shell.component';
import { MenuListPage } from './features/menu/pages/menu-list/menu-list.page';
import { MenuManagePage } from './features/menu/pages/menu-manage/menu-manage.page';
import { DishFormPage } from './features/menu/pages/dish-form/dish-form.page';
import { TeamPage } from './features/users/pages/team/team.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'menu', component: MenuListPage },
      {
        path: 'users',
        component: TeamPage,
        canActivate: [roleGuard(['admin'])],
      },
      {
        path: 'menu/manage',
        component: MenuManagePage,
        canActivate: [roleGuard(['admin'])],
      },
      {
        path: 'menu/manage/dishes/new',
        component: DishFormPage,
        canActivate: [roleGuard(['admin'])],
      },
      {
        path: 'menu/manage/dishes/:id/edit',
        component: DishFormPage,
        canActivate: [roleGuard(['admin'])],
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
