# Quick Start Guide

Get the Strategic Intel Platform running in minutes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- An Inngest account (free tier works)

## 5-Minute Setup

### 1. Install Dependencies (30 seconds)

```bash
npm install
```

### 2. Set Up Supabase (2 minutes)

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details (choose a strong password)
4. Wait for project to be created
5. Go to Project Settings > API
   - Copy "Project URL"
   - Copy "anon public" key
6. Go to Project Settings > Database
   - Copy the connection string under "Connection string" > "URI"
   - Replace `[YOUR-PASSWORD]` with your database password

### 3. Set Up Inngest (1 minute)

1. Go to https://www.inngest.com and sign up/login
2. Create a new app
3. Go to your app settings
4. Copy the "Event Key"
5. Copy the "Signing Key"

### 4. Configure Environment (1 minute)

Create `.env.local` file in the project root:

```bash
# Supabase (paste your values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.your-project-id:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Inngest (paste your values)
INNGEST_EVENT_KEY=your-event-key-here
INNGEST_SIGNING_KEY=signkey-prod-xxxxx

# Security (generate a random string)
WEBHOOK_SECRET_TOKEN=my-super-secret-token-123

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Initialize Database (30 seconds)

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 6. Start the App (30 seconds)

Open TWO terminal windows:

**Terminal 1 - Inngest:**
```bash
npx inngest-cli@latest dev
```

**Terminal 2 - Next.js:**
```bash
npm run dev
```

Open http://localhost:3000

## First Steps

### Add a Competitor

1. Click "Settings" in the sidebar
2. Click "Add Competitor"
3. Enter name (e.g., "Acme Corp") and domain (e.g., "acme.com")
4. Click "Add Competitor"

### Add a Keyword

1. Click "Settings" in the sidebar
2. Click "Add Keyword"
3. Enter term (e.g., "AI automation") and category (e.g., "Technology")
4. Click "Add Keyword"

### Send a Test Webhook

Get your competitor ID from Drizzle Studio:

```bash
npx drizzle-kit studio
```

Open http://localhost:4983, click on "competitors" table, and copy an ID.

Then send a test webhook:

```bash
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Hiring&comp_id=YOUR-COMPETITOR-ID&platform=Reddit" \
  -H "Authorization: Bearer my-super-secret-token-123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Engineer - Remote",
    "content": "<p>We are looking for a talented senior software engineer to join our team. This is a fully remote position with competitive compensation.</p>",
    "url": "https://reddit.com/r/forhire/example"
  }'
```

You should see the item appear in the UI under "Companies" view!

### Verify Inngest Processing

1. Open http://localhost:8288 (Inngest Dev Server UI)
2. Check that your function `process-intel-item` is registered
3. After sending a webhook, you should see the event appear in the Inngest UI

## Testing the Export API

### JSON Export

```bash
curl "http://localhost:3000/api/export?scope=all&format=json" | jq .
```

### CSV Export

```bash
curl "http://localhost:3000/api/export?scope=companies&format=csv" > export.csv
open export.csv
```

## Common Issues

### "Database connection failed"

- Double-check your `DATABASE_URL` is correct
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Verify your Supabase project is active (not paused)

### "Inngest function not found"

- Make sure Inngest Dev Server is running on http://localhost:8288
- Check that both `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` are set
- Restart both terminal windows

### "Unauthorized" on webhook

- Verify the `Authorization` header matches your `WEBHOOK_SECRET_TOKEN`
- Check there's a space after "Bearer"

## Next Steps

1. Connect changedetection.io to send webhooks when competitor sites change
2. Connect RSSHub to monitor RSS feeds and social media
3. Export data weekly for offline analysis
4. Deploy to Vercel for 24/7 availability

See [README.md](README.md) for full documentation.
