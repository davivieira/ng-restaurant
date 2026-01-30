# Auth feature

Auth state (user + token) and guards/interceptors are shared by all login methods. To add a new provider (e.g. Google):

1. **AuthService** – Add a method that POSTs to the new API endpoint and returns the same `AuthResponse` (e.g. `loginWithGoogle(idToken: string)`).
2. **Actions** – Add an action for the new flow (e.g. `loginWithGoogle`) and a success/failure pair that reuse the same payload shape as login/register.
3. **Effects** – Add an effect that calls the new service method and dispatches the same success/failure actions (reuse storage and navigation; no extra logic).
4. **UI** – Add a button (e.g. “Sign in with Google”) that dispatches the new action.

State, guards, interceptor, and session restore stay unchanged; only the new service method, action, effect, and button are added.
