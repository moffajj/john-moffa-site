# Oura security and deployment

The Oura dashboard reads cached statistics from Supabase. It does not contact
Oura or read stored credentials during page rendering.

## Required server secrets

- `SUPABASE_URL`: URL of the dedicated Oura Supabase project.
- `OURA_SUPABASE_SERVICE_ROLE_KEY`: server-only key for the Oura Supabase project; never prefix it with `NEXT_PUBLIC_`.
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

1. Add the Oura service-role key and all three application secrets to the deployment environment.
2. Apply `supabase/migrations/007_oura_security.sql`.
3. Deploy the application.
4. Have existing dashboard members join once more. Migration 007 removes the
   legacy plaintext `oura_pat` column, so old credentials are intentionally not retained.

The scheduled route accepts only requests with
`Authorization: Bearer <CRON_SECRET>`. The join route is invite-gated, validates
input, and rate-limits repeated attempts through Redis when configured.

GitHub Actions invokes the sync route hourly, at 15 minutes past each hour.
Vercel also invokes it once daily as a fallback.

Both Oura tables have forced Row Level Security and no client policies. All
reads and writes go through the server-side Supabase service role.

For migration compatibility, the application temporarily falls back to
`SUPABASE_ANON_KEY` when `OURA_SUPABASE_SERVICE_ROLE_KEY` is absent. Remove that
fallback after the dedicated service-role key is configured and migration 007
has been applied to the Oura Supabase project.

Until migration 007 is applied, the sync route can read legacy `oura_pat`
credentials for existing members. This compatibility path should be removed
after all members have rejoined and encrypted credentials are present.
