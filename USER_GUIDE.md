# Strategic Intel App - User Guide

Complete guide to using your Strategic Intel & Market Sensing Platform.

## Table of Contents

1. [Overview](#overview)
2. [Daily Workflow](#daily-workflow)
3. [Adding Competitors & Keywords](#adding-competitors--keywords)
4. [Setting Up Automated Monitoring](#setting-up-automated-monitoring)
5. [Understanding the Interface](#understanding-the-interface)
6. [Exporting Data](#exporting-data)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Your Strategic Intel App automatically monitors competitor websites and market trends, delivering intelligence items directly to your dashboard.

**What it does:**
- Monitors competitor web pages for changes (via GitHub Actions)
- Receives intelligence from external sources (via webhooks)
- Organizes intelligence by company or keyword
- Exports data for analysis

**What it doesn't do:**
- It doesn't actively scrape websites itself (it receives webhooks)
- It doesn't analyze content with AI (export to CSV for offline analysis)

---

## Daily Workflow

### Morning Routine (5 minutes)

1. **Open the app**: https://strategic-intel-app.vercel.app
2. **Check Companies view**:
   - Click "Companies" in sidebar
   - Scan grouped intelligence by competitor
   - Click items to read full details
   - Click source URLs to investigate further
3. **Check Keywords view**:
   - Click "Keywords" in sidebar
   - Review trends and market signals
4. **Export if needed**:
   - Click "CSV" or "JSON" to download data
   - Analyze in Excel/Google Sheets
   - Share with team

### When to Refresh

**The "Refresh" button:**
- Re-fetches intelligence items from database
- Use after receiving webhook notifications
- Use if you think new items should have appeared

**Automatic monitoring:**
- GitHub Actions checks monitored pages every 6 hours
- No manual refresh needed - just check the app daily

---

## Adding Competitors & Keywords

### Add a Competitor

1. Click **Settings** icon (⚙️) in sidebar
2. Click **"Add Competitor"**
3. Fill in:
   - **Name**: Company name (e.g., "Red Hat")
   - **Domain**: Website domain (e.g., "redhat.com")
4. Click **"Add Competitor"**

**Note:** Competitors won't appear in the feed until they have intelligence items.

### Add a Keyword

1. Click **Settings** icon (⚙️)
2. Click **"Add Keyword"**
3. Fill in:
   - **Term**: Keyword or phrase (e.g., "kubernetes management")
   - **Category**: Group it (e.g., "Technology", "Market Trends")
4. Click **"Add Keyword"**

**Note:** Keywords won't appear in the feed until they have intelligence items.

---

## Setting Up Automated Monitoring

### Add a Monitored Page

1. Click **Settings** icon (⚙️)
2. Click **"Add Monitored Page"**
3. Fill in:
   - **Page URL**: Full URL (e.g., "https://www.suse.com/c/blog/")
   - **Page Name**: Descriptive name (e.g., "Suse Blog")
   - **Competitor**: Select from dropdown (optional)
   - **Signal Type**: What type of intel this page provides
4. Click **"Add Page"**

### How Monitoring Works

**GitHub Actions automatically:**
1. Checks all monitored pages every 6 hours
2. Calculates a hash of the page content
3. Compares to previous hash
4. If changed → Sends webhook → Intelligence item appears in feed

**Schedule:**
- Runs at: 0:00, 6:00, 12:00, 18:00 UTC
- Completely free (GitHub Actions free tier: 2,000 minutes/month)

### Manual Trigger

Want to check now instead of waiting 6 hours?

1. Go to: https://github.com/grigz/strategic-intel-app/actions/workflows/monitor-pages.yml
2. Click **"Run workflow"** button
3. Click green **"Run workflow"** in dropdown
4. Wait ~1 minute for results

### Best Pages to Monitor

**For Competitors:**
- Blog/news pages (frequent updates)
- Product pages (feature announcements)
- Pricing pages (pricing changes)
- Job boards (hiring signals)
- Press releases

**For Market Trends:**
- Industry news sites
- Technology vendor blogs
- Analyst reports
- Conference schedules

---

## Understanding the Interface

### Sidebar (Left Column)

**Navigation:**
- **Companies**: View intelligence grouped by competitor
- **Keywords**: View intelligence grouped by keyword

**Actions:**
- **Settings** (⚙️): Add competitors, keywords, monitored pages

### Master Feed (Middle Column)

**Header:**
- **Refresh**: Re-fetch latest intelligence items
- **CSV**: Download current view as CSV
- **JSON**: Download current view as JSON

**Grouped View:**
- Intelligence items are grouped by company or keyword
- Each group shows item count
- Click any item to view full details

**Each Intelligence Card Shows:**
- Title
- Clickable source URL (opens in new tab)
- Signal badge (Hiring, Product Launch, Market Shift, etc.)
- Timestamp

### Reader Pane (Right Column)

**When you click an item:**
- Full sanitized HTML content
- "View Original" button to open source
- Safe rendering (DOMPurify protection)

---

## Exporting Data

### Quick Export

1. Navigate to Companies or Keywords view
2. Click **CSV** or **JSON** button
3. File downloads automatically

**File naming:**
- `companies-intelligence-2026-02-08.csv`
- `keywords-intelligence-2026-02-08.json`

### CSV Format

**Columns:**
- id, title, rawContent, sourceUrl, sourcePlatform, signalType, createdAt
- competitorName, competitorDomain (if company intelligence)
- keywordTerm, keywordCategory (if keyword intelligence)

**Use for:**
- Excel/Google Sheets analysis
- Filtering and sorting
- Sharing with team
- Historical tracking

### JSON Format

**Use for:**
- Programmatic analysis
- Integration with other tools
- Data processing scripts
- Backup

---

## Troubleshooting

### "No intelligence items shown"

**Possible reasons:**
1. **No intelligence yet**: Competitors/keywords exist but no intel about them
2. **Monitoring not active**: GitHub Actions hasn't run yet
3. **No changes detected**: Monitored pages haven't changed

**Solutions:**
- Send a test webhook (see TESTING.md)
- Manually trigger GitHub Actions
- Wait for scheduled monitoring run

### "Monitored page not generating intelligence"

**Check:**
1. Is the page enabled? (should be by default)
2. Has GitHub Actions run since adding it?
3. Did the page actually change? (first run just saves hash)

**Debug:**
1. Go to GitHub Actions workflow runs
2. Check the logs for your page
3. Look for "No changes detected" or errors

### "GitHub Actions failing"

**Common issues:**
1. **Secrets not set**: Add APP_URL and WEBHOOK_SECRET_TOKEN to GitHub
2. **URL encoding error**: Make sure signal types are URL-safe
3. **Network timeout**: Some pages may be slow to load

**Fix:**
1. Check GitHub repository secrets
2. View workflow run logs for specific errors
3. Contact support if needed

### "Refresh button not showing new items"

**Remember:**
- Refresh only reloads intelligence items from database
- If GitHub Actions detected a change, refresh will show it
- If no webhook was sent yet, refresh won't help

**Instead:**
1. Check if GitHub Actions actually ran
2. Check workflow logs to see if webhook was sent
3. Manually trigger workflow if needed

---

## Tips for Success

### 1. Start Small
- Add 2-3 competitors initially
- Add 3-5 high-value keywords
- Monitor 3-5 key pages
- Expand once you have a workflow

### 2. Choose Signal Types Carefully
- **Product Launch**: Product pages, feature announcements
- **Market Shift**: Industry news, analyst reports
- **Hiring**: Job boards, careers pages
- **Culture**: Company blogs, leadership posts
- **Customer Pain**: Support forums, review sites

### 3. Review Regularly
- Check app daily (or weekly for slower-moving industries)
- Export weekly for analysis
- Adjust monitored pages based on what's valuable

### 4. Optimize Monitored Pages
- Remove pages that change too often (noise)
- Remove pages that never change (no signal)
- Focus on pages with high-value updates

### 5. Use Grouping
- Companies view: Track competitor activity
- Keywords view: Spot market trends
- Both provide different insights

---

## Getting Help

**Documentation:**
- README.md - Setup instructions
- QUICKSTART.md - Quick start guide
- TESTING.md - Testing webhooks
- DEPLOYMENT.md - Deployment guide

**Support:**
- Check GitHub Issues: https://github.com/grigz/strategic-intel-app/issues
- Review workflow logs for errors
- Verify environment variables are set correctly

---

## Next Steps

1. **Add your real competitors** (not just test data)
2. **Add relevant keywords** for your industry
3. **Set up 5-10 monitored pages** for key competitor sites
4. **Establish a routine** (daily or weekly review)
5. **Export and analyze** patterns over time

Your Strategic Intel App is now your competitive intelligence command center!
