import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import type { AuthResponse } from '../models/auth-response.model';
import type { AuthUser } from '../models/auth-user.model';

export interface CreateWaiterResponse {
  user: AuthUser;
  temporaryPassword: string;
}

export type CreateStaffResponse = CreateWaiterResponse;

export type StaffRole = 'waiter' | 'kitchen';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password,
    });
  }

  register(name: string, email: string, password: string, restaurantName: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, {
      name,
      email,
      password,
      restaurantName,
    });
  }

  createWaiter(name: string, email: string) {
    return this.http.post<CreateWaiterResponse>(`${this.apiUrl}/auth/waiters`, {
      name,
      email,
    });
  }

  getWaiters() {
    return this.http.get<AuthUser[]>(`${this.apiUrl}/auth/waiters`);
  }

  createStaff(name: string, email: string, role: StaffRole) {
    return this.http.post<CreateStaffResponse>(`${this.apiUrl}/auth/staff`, {
      name,
      email,
      role,
    });
  }

  getStaff(role?: StaffRole) {
    if (role) {
      return this.http.get<AuthUser[]>(`${this.apiUrl}/auth/staff`, {
        params: { role },
      });
    }
    return this.http.get<AuthUser[]>(`${this.apiUrl}/auth/staff`);
  }
}
