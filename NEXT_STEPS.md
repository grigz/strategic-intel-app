# Next Steps

Your Strategic Intel Platform is now fully implemented. Follow these steps to get it running.

## Immediate Actions (Required)

### 1. Set Up Supabase Database (5 minutes)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Wait for provisioning to complete
4. Go to Project Settings > API
   - Copy "Project URL"
   - Copy "anon public" key
5. Go to Project Settings > Database
   - Copy connection string (replace `[YOUR-PASSWORD]` with your DB password)

### 2. Set Up Inngest (3 minutes)

1. Go to https://www.inngest.com and create a free account
2. Create a new app (name it "Strategic Intel")
3. Go to app settings
4. Copy "Event Key"
5. Copy "Signing Key"

### 3. Configure Environment Variables (2 minutes)

Edit `.env.local` file and replace all placeholder values:

```bash
# Replace these with your actual Supabase values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Replace these with your actual Inngest values
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=signkey-prod-xxxxx

# Keep this or generate a new random token
WEBHOOK_SECRET_TOKEN=dev-secret-token-change-in-production
```

### 4. Initialize Database (1 minute)

```bash
npm run db:generate
npm run db:migrate
```

Verify with Drizzle Studio:
```bash
npm run db:studio
# Open http://localhost:4983 and check tables exist
```

### 5. Start Development Servers (1 minute)

**Terminal 1 - Inngest:**
```bash
npm run inngest
```

**Terminal 2 - Next.js:**
```bash
npm run dev
```

Open http://localhost:3000

## Testing Your Setup (10 minutes)

Follow the step-by-step guide in [TESTING.md](TESTING.md)

Quick smoke test:

1. **Add a competitor**:
   - Click Settings > Add Competitor
   - Name: "Acme Corp", Domain: "acme.com"

2. **Send a test webhook**:
   ```bash
   # Get competitor ID from http://localhost:4983
   curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Hiring&comp_id=COMPETITOR_ID&platform=Reddit" \
     -H "Authorization: Bearer dev-secret-token-change-in-production" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Intelligence Item",
       "content": "<p>This is a test</p>",
       "url": "https://example.com"
     }'
   ```

3. **Verify in UI**:
   - Click "Companies" in sidebar
   - See your test item appear
   - Click it to view details

## Production Deployment (30 minutes)

See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions.

Quick path to production:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git remote add origin https://github.com/YOUR_USERNAME/strategic-intel-app.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Import GitHub repository
   - Add environment variables (production values!)
   - Deploy

3. **Run production migrations**:
   ```bash
   export DATABASE_URL="your-production-database-url"
   npm run db:migrate
   ```

4. **Configure Inngest**:
   - Add your Vercel URL to Inngest: `https://your-app.vercel.app/api/inngest`

## Connecting External Services

### changedetection.io Setup

1. Create account at https://changedetection.io
2. Add a URL to monitor (competitor website)
3. Configure webhook:
   - URL: `https://your-app.vercel.app/api/webhooks/ingest?type=Market%20Shift&comp_id=COMPETITOR_ID&platform=Website`
   - Header: `Authorization: Bearer YOUR_WEBHOOK_TOKEN`
   - Payload format:
     ```json
     {
       "title": "{{watched_url}}",
       "content": "{{diff}}",
       "url": "{{watch_url}}"
     }
     ```

### RSSHub Integration

1. Set up RSSHub instance or use public instance
2. Configure webhook forwarding to your ingest endpoint
3. Map RSS fields to expected format (title, content, url)
4. Include appropriate query params (type, platform, keyword_id)

## Recommended Workflow

### Daily Use

1. **Morning**: Check new intelligence items in "Companies" and "Keywords" views
2. **Review**: Read through items, click "View Original" for deep dives
3. **Weekly**: Export data for offline analysis:
   ```bash
   curl "https://your-app.vercel.app/api/export?format=csv" -o intel-$(date +%Y%m%d).csv
   ```

### Weekly Maintenance

1. **Export data**: Download CSV/JSON for archival
2. **Review signal types**: Adjust changedetection.io/RSSHub configurations
3. **Add new competitors/keywords**: As you discover new entities to track
4. **Check Inngest dashboard**: Verify all webhooks processing successfully

### Monthly Tasks

1. **Rotate webhook token**: Generate new WEBHOOK_SECRET_TOKEN
2. **Review storage**: Check Supabase database size (free tier: 500MB)
3. **Archive old data**: Export and delete items older than 30 days if needed
4. **Update dependencies**: `npm update`

## Customization Ideas

### Signal Types

Current types are hardcoded. To customize:

1. Edit `components/features/intel/signal-badge.tsx`
2. Add new signal types to `signalColors` object
3. Update webhook senders to use new types

### Platform Icons

Add more platforms:

1. Edit `components/features/intel/source-icon.tsx`
2. Import new Lucide icons
3. Add cases to switch statement

### Color Scheme

Change colors in `components/features/intel/signal-badge.tsx`:
```tsx
const signalColors: Record<string, string> = {
  Hiring: "bg-emerald-100 text-emerald-800",  // Changed from green
  // ... etc
};
```

## Getting Help

- **Setup issues**: See [QUICKSTART.md](QUICKSTART.md) troubleshooting section
- **Testing problems**: Follow [TESTING.md](TESTING.md) step-by-step
- **Deployment issues**: Check [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting
- **Technical details**: Review [README.md](README.md) full documentation

## Success Metrics

Track these to measure value:

- **Intelligence items collected**: Aim for 50+ per week
- **Signal distribution**: Balance across Hiring/Market Shift/Culture/Customer Pain
- **Source diversity**: Mix of Reddit/X/LinkedIn/Website sources
- **Export frequency**: Weekly CSV exports for analysis
- **Actionable insights**: Document competitive insights discovered

## Future Enhancements

Consider building (in order of priority):

1. **Search functionality**: Full-text search across all items
2. **Date range filtering**: Custom date ranges in export
3. **Real-time updates**: WebSocket connection for live feed
4. **Tagging system**: Custom tags for items
5. **Dashboard analytics**: Charts and trends
6. **Multi-user support**: Team collaboration features
7. **AI summarization**: Automated summaries using local LLM (Ollama)

See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for full roadmap.

## Documentation Index

- **README.md**: Complete technical documentation
- **QUICKSTART.md**: 5-minute setup guide
- **TESTING.md**: Testing instructions and checklist
- **DEPLOYMENT.md**: Production deployment guide
- **PROJECT_SUMMARY.md**: Implementation overview
- **NEXT_STEPS.md**: This file - getting started guide
- **FILES_CREATED.txt**: Complete file manifest

---

**Ready to Start?**

1. Set up Supabase ✓
2. Set up Inngest ✓
3. Configure .env.local ✓
4. Run migrations ✓
5. Start dev servers ✓
6. Send test webhook ✓

**You're all set!** Open http://localhost:3000 and start monitoring your competitive intelligence.
