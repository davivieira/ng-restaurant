# Auth module

This module handles authentication for the API. All auth flows (email/password, and future providers like Google) return the same **AuthResponse** (JWT + user) and use the same JWT strategy for protected routes.

## Adding a new auth provider (e.g. Google)

1. **Resolve or create a User** from the provider’s data (e.g. verify Google token, find or create user by email).
2. **Issue the same auth response** by calling the single token-issuance path. In `AuthService`, `issueAuthResponse(user)` is used by `register`, `login`, and should be used by any new provider so the response shape stays consistent.
3. **Add an endpoint** (e.g. `POST /auth/google` with body `{ idToken: string }`) that:
   - Validates the provider token
   - Finds or creates a `User` (with `passwordHash: null` for OAuth-only users)
   - Returns `issueAuthResponse(user)` (or a thin wrapper that calls it).

No need to change guards, JWT strategy, or front-end state shape; only add the new route and the logic to get a `User` from the provider.
