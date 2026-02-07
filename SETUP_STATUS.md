# Setup Status

Check your setup status and resolve any issues.

## Quick Status Check

Run the app to see if everything is working:

```bash
npm run dev
```

Open http://localhost:3000

### What You Should See

✅ **If configured correctly:**
- App loads without errors
- Sidebar shows "Companies" and "Keywords" buttons
- Feed shows "No Intelligence Items" (with instructions)
- Settings button opens management dialogs

❌ **If database not configured:**
- Feed shows "Database Not Configured"
- Message directs you to configure `.env.local`

## Configuration Checklist

### 1. Environment Variables

Check `.env.local` file exists and has real values (not placeholders):

```bash
cat .env.local
```

**Required variables:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Should start with `https://` and end with `.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Long JWT token starting with `eyJhbGc`
- [ ] `DATABASE_URL` - PostgreSQL connection string with real password
- [ ] `INNGEST_EVENT_KEY` - Your Inngest event key
- [ ] `INNGEST_SIGNING_KEY` - Starts with `signkey-`
- [ ] `WEBHOOK_SECRET_TOKEN` - Any secure random string

### 2. Supabase Setup

**Check if you've created a Supabase project:**

1. Go to https://supabase.com/dashboard/projects
2. You should see at least one project
3. Click on your project
4. Go to Settings > API - verify your keys match `.env.local`
5. Go to Settings > Database - verify connection string

**Quick test:**
```bash
# This should connect to your database (replace with your DATABASE_URL)
psql "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres" -c "SELECT version();"
```

### 3. Database Migration Status

**Check if tables exist:**

```bash
npm run db:studio
```

Open http://localhost:4983 and verify you see:
- [ ] `competitors` table
- [ ] `keywords` table
- [ ] `intel_items` table

**If tables don't exist, run migrations:**

```bash
npm run db:generate
npm run db:migrate
```

### 4. Inngest Setup

**Check if Inngest account exists:**

1. Go to https://www.inngest.com/dashboard
2. You should see at least one app
3. Click on your app
4. Go to Settings - verify keys match `.env.local`

**Start Inngest dev server:**

```bash
npm run inngest
```

Open http://localhost:8288 and verify:
- [ ] Function `process-intel-item` is registered
- [ ] No connection errors

## Common Issues

### Issue: "Database Not Configured" in UI

**Cause:** DATABASE_URL is invalid or has placeholder values

**Fix:**
1. Create Supabase project if you haven't
2. Get real DATABASE_URL from Supabase dashboard
3. Update `.env.local`
4. Restart dev server

### Issue: Tables don't exist in Drizzle Studio

**Cause:** Migrations haven't been run

**Fix:**
```bash
npm run db:generate
npm run db:migrate
```

### Issue: Cannot connect to database

**Cause:** Network issue or wrong password

**Fix:**
1. Verify Supabase project is not paused
2. Check password in DATABASE_URL matches your Supabase password
3. Try resetting database password in Supabase dashboard

### Issue: Inngest function not registered

**Cause:** Environment variables missing or dev server not running

**Fix:**
1. Verify `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in `.env.local`
2. Make sure `npm run inngest` is running
3. Restart both dev servers (Inngest and Next.js)

### Issue: Webhook returns 401 Unauthorized

**Cause:** Wrong Bearer token

**Fix:**
Verify the token in your curl command matches `WEBHOOK_SECRET_TOKEN` in `.env.local`

## Setup Steps (If Starting Fresh)

Haven't configured anything yet? Follow these steps in order:

### Step 1: Supabase (5 minutes)

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - Name: `strategic-intel`
   - Database Password: (generate strong password, save it!)
   - Region: Choose closest to you
5. Wait for project to provision (~2 minutes)
6. Go to Settings > API:
   - Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Go to Settings > Database:
   - Copy "Connection string" under "URI" → `DATABASE_URL`
   - Replace `[YOUR-PASSWORD]` with your database password

### Step 2: Inngest (3 minutes)

1. Go to https://www.inngest.com
2. Sign up / Log in
3. Click "Create new app"
4. Name: `strategic-intel`
5. Go to Settings:
   - Copy "Event Key" → `INNGEST_EVENT_KEY`
   - Copy "Signing Key" → `INNGEST_SIGNING_KEY`

### Step 3: Update .env.local (1 minute)

Edit `.env.local` and paste all your values:

```bash
# Paste your actual values here
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.abcdefghijk:YourPassword123@aws-0-us-east-1.pooler.supabase.com:5432/postgres

INNGEST_EVENT_KEY=local_01234567890abcdef
INNGEST_SIGNING_KEY=signkey-prod-abcdef123456

# Generate a random token (or keep default for dev)
WEBHOOK_SECRET_TOKEN=dev-secret-token-change-in-production

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Run Migrations (1 minute)

```bash
npm run db:generate
npm run db:migrate
```

Verify with:
```bash
npm run db:studio
# Check tables exist at http://localhost:4983
```

### Step 5: Start Dev Servers (1 minute)

**Terminal 1:**
```bash
npm run inngest
# Should show function registered at http://localhost:8288
```

**Terminal 2:**
```bash
npm run dev
# App at http://localhost:3000
```

### Step 6: Verify (2 minutes)

1. Open http://localhost:3000
2. Should see clean UI (no errors)
3. Click Settings > Add Competitor
4. Add: Name: "Test Corp", Domain: "test.com"
5. Should see success

## Health Check Commands

Run these to verify everything:

```bash
# 1. Check environment variables
grep -v "^#" .env.local | grep "="

# 2. Test database connection (replace with your DATABASE_URL)
npx drizzle-kit studio
# Open http://localhost:4983 - should show tables

# 3. Test Next.js build
npm run build
# Should complete without errors

# 4. Check Inngest connection
curl http://localhost:8288/health
# Should return 200 OK when inngest dev server running
```

## Getting Help

Still stuck? Check these resources:

1. **QUICKSTART.md** - Step-by-step setup guide
2. **TESTING.md** - Comprehensive testing checklist
3. **README.md** - Full technical documentation
4. **Supabase Docs** - https://supabase.com/docs
5. **Inngest Docs** - https://www.inngest.com/docs

## Next Steps

Once everything is configured:

1. **Test webhook ingestion** - See TESTING.md section 5
2. **Add real competitors** - Click Settings > Add Competitor
3. **Add keywords** - Click Settings > Add Keyword
4. **Connect external services** - Set up changedetection.io or RSSHub
5. **Deploy to production** - See DEPLOYMENT.md

---

**Current Status:**
- If you can see the UI without "Database Not Configured" error → ✅ Ready to use
- If you see "Database Not Configured" → ⚠️ Follow setup steps above
