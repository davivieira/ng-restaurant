import type { AuthUser } from '../models/auth-user.model';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};
