# Oura security and deployment

The Oura dashboard reads cached statistics from Supabase. It does not contact
Oura or read stored credentials during page rendering.

## Required server secrets

- `SUPABASE_SERVICE_ROLE_KEY`: server-only database access; never prefix it with `NEXT_PUBLIC_`.
- `OURA_JOIN_SECRET`: invite code required by the join form.
- `OURA_TOKEN_ENCRYPTION_KEY`: a base64-encoded 32-byte AES key.
- `CRON_SECRET`: bearer token accepted by the sync route. Vercel supplies this to cron requests.

For distributed rate limiting, also configure `KV_REST_API_URL` and
`KV_REST_API_TOKEN` (or their `UPSTASH_REDIS_REST_*` equivalents). Local
development falls back to a process-local limiter.

Generate the encryption key once and keep it stable:

```sh
openssl rand -base64 32
```

Changing or losing this key makes existing encrypted Oura tokens unreadable.

## Deployment order

1. Add all four secrets to the deployment environment.
2. Apply `supabase/migrations/007_oura_security.sql`.
3. Deploy the application.
4. Have existing dashboard members join once more. Migration 007 removes the
   legacy plaintext `oura_pat` column, so old credentials are intentionally not retained.

The scheduled route accepts only requests with
`Authorization: Bearer <CRON_SECRET>`. The join route is invite-gated, validates
input, and rate-limits repeated attempts through Redis when configured.

Both Oura tables have forced Row Level Security and no client policies. All
reads and writes go through the server-side Supabase service role.
