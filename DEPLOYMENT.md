# Deployment Guide

Deploy the Strategic Intel Platform to production.

## Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Build succeeds (`npm run build`)
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Webhook secret token generated (strong random value)
- [ ] Supabase project created (production)
- [ ] Inngest account configured (production)

## Deployment to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit: Strategic Intel Platform"
git branch -M main
git remote add origin https://github.com/your-username/strategic-intel-app.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### Step 3: Add Environment Variables

In Vercel project settings, add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
INNGEST_EVENT_KEY=your-production-event-key
INNGEST_SIGNING_KEY=signkey-prod-xxxxx
WEBHOOK_SECRET_TOKEN=generate-new-strong-random-token-for-production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**IMPORTANT:** Use production credentials, not development ones!

### Step 4: Deploy

Click "Deploy" and wait for build to complete.

### Step 5: Run Migrations

After first deployment, run migrations:

```bash
# Set DATABASE_URL environment variable locally with production credentials
export DATABASE_URL="postgresql://postgres.your-project:password@..."

# Run migrations
npm run db:migrate
```

Or use Drizzle Studio to verify schema:

```bash
npm run db:studio
```

### Step 6: Configure Inngest Production

1. Go to https://www.inngest.com
2. Navigate to your production app
3. Add your Vercel deployment URL to "Event API URLs"
4. URL format: `https://your-app.vercel.app/api/inngest`
5. Inngest will verify the endpoint

### Step 7: Test Production Webhook

```bash
curl -X POST "https://your-app.vercel.app/api/webhooks/ingest?type=Hiring&platform=Reddit" \
  -H "Authorization: Bearer your-production-webhook-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Production Test",
    "content": "<p>Testing production webhook</p>",
    "url": "https://example.com/test"
  }'
```

Check Inngest dashboard to verify processing.

## Alternative Deployment Options

### Railway

1. Create Railway account
2. Create new project from GitHub
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

### Fly.io

```bash
# Install flyctl
brew install flyctl

# Login
flyctl auth login

# Launch app
flyctl launch

# Set secrets
flyctl secrets set DATABASE_URL=postgresql://...
flyctl secrets set INNGEST_EVENT_KEY=...
flyctl secrets set INNGEST_SIGNING_KEY=...
flyctl secrets set WEBHOOK_SECRET_TOKEN=...

# Deploy
flyctl deploy
```

### Self-Hosted (VPS)

Requirements:
- Ubuntu 22.04+ or similar
- Node.js 18+
- PostgreSQL 14+
- Nginx (reverse proxy)
- PM2 (process manager)

```bash
# Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql nginx

# Clone repository
git clone https://github.com/your-username/strategic-intel-app.git
cd strategic-intel-app

# Install
npm install

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "strategic-intel" -- start

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/strategic-intel

# Add configuration:
# server {
#     listen 80;
#     server_name your-domain.com;
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }

# Enable site
sudo ln -s /etc/nginx/sites-available/strategic-intel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment

### Monitor Inngest Functions

1. Go to Inngest dashboard
2. Check function execution logs
3. Verify retry behavior
4. Set up alerts for failures

### Set Up Monitoring

Consider adding:
- **Sentry** for error tracking
- **Vercel Analytics** for performance
- **Uptime monitoring** (UptimeRobot, Pingdom)

### Configure Webhooks from External Services

#### changedetection.io

1. Go to your monitored page settings
2. Add webhook URL: `https://your-app.vercel.app/api/webhooks/ingest?type=Market%20Shift&platform=Website`
3. Add custom header: `Authorization: Bearer your-production-webhook-token`
4. Set payload format:
   ```json
   {
     "title": "{{watched_url}}",
     "content": "{{diff}}",
     "url": "{{watch_url}}"
   }
   ```

#### RSSHub

Configure webhook forwarding from your RSS aggregator to:
- URL: `https://your-app.vercel.app/api/webhooks/ingest`
- Include query params for type/platform
- Include Authorization header

### Security Hardening

- [ ] Rotate webhook secret token monthly
- [ ] Enable Supabase Row Level Security (RLS) if adding auth
- [ ] Set up rate limiting on webhook endpoint
- [ ] Enable CORS only for trusted origins
- [ ] Review Vercel security headers
- [ ] Enable HTTPS only (disable HTTP)

### Backup Strategy

1. **Database Backups**: Supabase automatically backs up daily
2. **Manual Exports**: Run weekly export to local storage
   ```bash
   curl "https://your-app.vercel.app/api/export?format=json" > backup-$(date +%Y%m%d).json
   ```
3. **Code Backups**: Git repository on GitHub

### Scaling Considerations

- **Database**: Upgrade Supabase plan if needed
- **Inngest**: Free tier handles 50k events/month
- **Vercel**: Free tier handles 100GB bandwidth/month
- **Storage**: Export and archive old data monthly

## Rollback Plan

If deployment fails:

1. Revert in Vercel (use previous deployment)
2. Or revert Git commit:
   ```bash
   git revert HEAD
   git push
   ```
3. Redeploy from Vercel dashboard

## Troubleshooting

### Build Fails

- Check TypeScript errors: `npm run build` locally
- Verify all environment variables are set
- Check build logs in Vercel dashboard

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check Supabase project is not paused
- Test connection with `npm run db:studio`

### Inngest Not Processing

- Verify Inngest signing key is correct
- Check Inngest dashboard for errors
- Ensure `/api/inngest` endpoint is accessible
- Verify event key in webhook route

### Webhooks Failing

- Check Authorization header format
- Verify WEBHOOK_SECRET_TOKEN matches
- Check webhook payload matches expected format
- Review API route logs in Vercel

## Support

- Vercel Docs: https://vercel.com/docs
- Inngest Docs: https://www.inngest.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
