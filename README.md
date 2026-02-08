# Strategic Intel & Market Sensing Platform

A single-user platform for monitoring competitors and market trends with automated web monitoring and webhook integrations.

**🚀 Live App:** https://strategic-intel-app.vercel.app

## Quick Links

- **[User Guide](USER_GUIDE.md)** - Complete guide to using the app
- **[Quick Start](QUICKSTART.md)** - Get started in 15 minutes
- **[Testing Guide](TESTING.md)** - Test webhooks and features
- **[Deployment Guide](DEPLOYMENT.md)** - Deploy to production

## Features

### Intelligence Gathering
- **Automated Web Monitoring**: GitHub Actions checks competitor pages every 6 hours (free!)
- **Webhook Ingestion**: Receive intelligence from external sources
- **Async Processing**: Inngest-powered queue with automatic retries
- **Change Detection**: Hash-based monitoring detects page updates

### User Interface
- **3-Column Master-Detail UI**: Rapid scanning with sidebar, feed, and detail pane
- **Grouped Intelligence**: Items organized by company or keyword
- **Clickable Source URLs**: Direct links to original content
- **Refresh Button**: Update feed with latest intelligence

### Data Management
- **CSV/JSON Export**: Download intelligence for offline analysis
- **Competitor Tracking**: Manage companies to monitor
- **Keyword Tracking**: Track market trends and technologies
- **Monitored Pages**: Add/remove pages through the UI

### Security
- **Safe HTML Rendering**: DOMPurify sanitization
- **Bearer Token Auth**: Webhook authentication
- **Deployment Protection**: Vercel bypass tokens

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **Queue**: Inngest (backed by Upstash Redis)
- **UI**: Tailwind CSS + shadcn/ui + Lucide icons
- **Sanitization**: isomorphic-dompurify

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Copy the project URL and anon key
4. Copy the database connection string from Settings > Database

### 3. Set Up Inngest

1. Create an Inngest account at https://www.inngest.com
2. Create a new app
3. Copy the Event Key and Signing Key

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# Inngest
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key

# Security
WEBHOOK_SECRET_TOKEN=generate-strong-random-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Database Migrations

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Or use Drizzle Studio to inspect the schema:

```bash
npx drizzle-kit studio
```

### 6. Start Development Servers

Open two terminal windows:

**Terminal 1 - Inngest Dev Server:**
```bash
npx inngest-cli@latest dev
```

**Terminal 2 - Next.js:**
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Usage

### Adding Competitors and Keywords

1. Click the Settings button in the sidebar
2. Choose "Add Competitor" or "Add Keyword"
3. Fill in the details and submit

### Sending Test Webhooks

```bash
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Hiring&comp_id=YOUR_COMPETITOR_ID&platform=Reddit" \
  -H "Authorization: Bearer dev-secret-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer Opening",
    "content": "<p>We are hiring for a senior software engineer position...</p>",
    "url": "https://reddit.com/r/jobs/example"
  }'
```

### Exporting Data

**JSON Export (All Data):**
```bash
curl "http://localhost:3000/api/export?scope=all&format=json"
```

**CSV Export (Companies Only):**
```bash
curl "http://localhost:3000/api/export?scope=companies&format=csv" -o intel-export.csv
```

**CSV Export (Keywords Only):**
```bash
curl "http://localhost:3000/api/export?scope=keywords&format=csv" -o keywords-export.csv
```

## API Reference

### Webhook Ingestion

**Endpoint:** `POST /api/webhooks/ingest`

**Query Parameters:**
- `type` (required): Signal type - `Hiring`, `Market Shift`, `Culture`, or `Customer Pain`
- `platform` (required): Source platform - `Reddit`, `X`, `LinkedIn`, or `Website`
- `comp_id` (optional): Competitor UUID
- `keyword_id` (optional): Keyword UUID

**Headers:**
- `Authorization: Bearer <WEBHOOK_SECRET_TOKEN>`
- `Content-Type: application/json`

**Body:**
```json
{
  "title": "Intelligence item title",
  "content": "<p>HTML content</p>",
  "url": "https://source-url.com"
}
```

### Export API

**Endpoint:** `GET /api/export`

**Query Parameters:**
- `scope`: `all`, `companies`, or `keywords` (default: `all`)
- `format`: `json` or `csv` (default: `json`)

## Database Schema

### Tables

**competitors**
- `id` (UUID, PK)
- `name` (text)
- `domain` (text)
- `created_at` (timestamp)

**keywords**
- `id` (UUID, PK)
- `term` (text)
- `category` (text)
- `created_at` (timestamp)

**intel_items**
- `id` (UUID, PK)
- `title` (text)
- `raw_content` (text)
- `source_url` (text)
- `source_platform` (text)
- `signal_type` (text)
- `competitor_id` (UUID, FK, nullable)
- `keyword_id` (UUID, FK, nullable)
- `created_at` (timestamp, indexed)

## Architecture

### Webhook Flow

1. External service (changedetection.io/RSSHub) sends POST to `/api/webhooks/ingest`
2. Route validates Bearer token and required fields
3. Event queued to Inngest with `intel/webhook.received`
4. Inngest function `process-intel-item` inserts to database
5. UI polls `/api/export` for updated feed

### UI State Management

- Client-side React state (useState) for active view and selected item
- No URL routing in MVP (future enhancement)
- Feed refreshes on view change and after management actions

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `DATABASE_URL`
- [ ] `INNGEST_EVENT_KEY`
- [ ] `INNGEST_SIGNING_KEY`
- [ ] `WEBHOOK_SECRET_TOKEN` (generate strong random value)
- [ ] `NEXT_PUBLIC_APP_URL` (your production URL)

## Security Notes

1. **Always use HTTPS in production**
2. **Rotate `WEBHOOK_SECRET_TOKEN` regularly**
3. **Restrict Supabase RLS policies** if using auth later
4. **DOMPurify sanitizes all HTML** before rendering
5. **No cloud AI processing** - all analysis via offline exports

## Troubleshooting

### Database Connection Errors

Verify `DATABASE_URL` format:
```
postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

### Inngest Not Processing

1. Check Inngest Dev Server is running on http://localhost:8288
2. Verify `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
3. Check function registration in http://localhost:8288

### Webhook Failures

1. Verify Bearer token matches `WEBHOOK_SECRET_TOKEN`
2. Check required query params: `type` and `platform`
3. Ensure body contains `title`, `content`, and `url`

## Future Enhancements

- [ ] URL-based routing for deep linking
- [ ] Server Actions for better caching
- [ ] Real-time updates via Supabase subscriptions
- [ ] Signal type customization in database
- [ ] Bulk import/export tools
- [ ] Advanced filtering and search
