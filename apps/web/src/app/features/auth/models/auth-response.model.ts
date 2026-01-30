import type { AuthUser } from './auth-user.model';

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
