# Meeting Intelligence Engine

A Next.js application with AI-powered meeting prep and support triage agents.

## Deploying a fresh instance for a new customer

### 1. Required environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key — powers meeting prep and support triage |
| `APP_ACCESS_TOKEN` | Yes | Shared secret for the access gate (see below) |
| `KV_REST_API_URL` | Yes | Upstash Redis REST URL — used for rate limiting and ticket storage |
| `KV_REST_API_TOKEN` | Yes | Upstash Redis REST token |
| `RATE_LIMIT_DAILY` | No | Max meeting-prep requests per day (default: `50`) |
| `SUPPORT_WEBHOOK_SECRET` | No | Shared secret for the inbound support triage webhook |

### 2. Setting APP_ACCESS_TOKEN

`APP_ACCESS_TOKEN` is a simple shared secret that gates the entire app — no user accounts needed.

**Generate a token:**
```bash
openssl rand -base64 32
```

**Add it to Vercel:**
```bash
vercel env add APP_ACCESS_TOKEN production
# paste the generated value when prompted
```

**Share access with the customer** by sending them the URL with `?token=<value>` appended. On first visit, the token is stored in a cookie valid for 30 days. Direct URL visits without the token show a password page where they can enter the code manually.

To revoke access, change `APP_ACCESS_TOKEN` and redeploy.

### 3. HubSpot integration (optional)

HubSpot is fully optional. If `HUBSPOT_ACCESS_TOKEN` is not set, all HubSpot calls are skipped and the CRM sync UI is hidden.

To enable it:
1. Create a HubSpot Private App with `crm.objects.contacts.write` and `crm.objects.contacts.read` scopes
2. Add the token to Vercel:
   ```bash
   vercel env add HUBSPOT_ACCESS_TOKEN production
   ```
3. Set the build-time flag so the UI shows:
   ```bash
   echo "true" | vercel env add NEXT_PUBLIC_HUBSPOT_ENABLED production
   ```
4. Redeploy for the UI change to take effect

### 4. Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### 5. Local development

```bash
npm install
vercel env pull .env.local   # pulls all env vars from your linked Vercel project
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** `APP_ACCESS_TOKEN` is not enforced locally unless the env var is present in `.env.local`. Leave it unset during development to skip the access gate.
