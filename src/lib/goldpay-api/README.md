# GoldPay API client & real-time

## Setup

1. In `.env.local` (create from `.env.example` if needed):

   ```env
   NEXT_PUBLIC_GOLDPAY_API_URL=http://localhost:4000
   NEXT_PUBLIC_GOLDPAY_API_PREFIX=api/v1
   ```

2. Ensure the GoldPay NestJS server is running and CORS allows the admin origin.

## Auth

- **Login**: `goldpayApi.auth.login(email, password)` → returns `{ access_token }`. Token is stored in `localStorage` and sent as `Authorization: Bearer <token>` on all requests.
- **Logout**: Call `clearAuthToken()` from `@/lib/goldpay-api` or `useAuth().logout()`.
- **401**: Token is cleared and `goldpay-unauthorized` is dispatched; `AuthProvider` redirects to `/auth/sign-in`.

## API modules

- `goldpayApi.auth` — login
- `goldpayApi.merchants` — list, get, create, update, API keys, assign/remove provider
- `goldpayApi.providers` — list, get
- `goldpayApi.transactions` — get(id); list by merchant (backend may add admin list later)
- `goldpayApi.reconciliation` — list, get, run merchant/provider/daily, resolve discrepancy

## Real-time updates

The GoldPay server currently exposes REST only (no WebSockets/SSE). The admin uses **polling** for near–real-time updates:

- **`useRealtimeQuery`** (`@/hooks/use-realtime-query`): generic hook that runs a fetcher once and then on an interval (e.g. every 10–15s).
- **`useDashboardStats`** (`@/hooks/use-dashboard-stats`): fetches merchant and provider counts and refetches every 15s.

Example:

```tsx
const { data, error, isLoading, refetch } = useRealtimeQuery(
  "merchants",
  () => goldpayApi.merchants.list(),
  { refetchIntervalMs: 10_000, enabled: isAuthenticated }
);
```

When the backend adds WebSockets or Server-Sent Events, you can replace the polling in `useRealtimeQuery` with a subscription and keep the same component API.
