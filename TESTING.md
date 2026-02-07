# Testing Guide

Step-by-step testing instructions for the Strategic Intel Platform.

## Prerequisites

Before testing, ensure:
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created and configured
- [ ] Inngest account created and configured
- [ ] `.env.local` file configured with all required variables
- [ ] Database migrations run (`npm run db:migrate`)
- [ ] Inngest dev server running (`npm run inngest`)
- [ ] Next.js dev server running (`npm run dev`)

## Test Suite

### 1. Database Schema Verification

**Expected Result**: All tables exist with correct schema

```bash
npm run db:studio
```

1. Open http://localhost:4983
2. Verify three tables exist:
   - `competitors` (id, name, domain, created_at)
   - `keywords` (id, term, category, created_at)
   - `intel_items` (id, title, raw_content, source_url, source_platform, signal_type, competitor_id, keyword_id, created_at)
3. Check indexes on `intel_items.created_at`

### 2. UI Load Test

**Expected Result**: Dashboard loads with 3-column layout

1. Open http://localhost:3000
2. Verify layout:
   - Left sidebar (width: 256px) with "Strategic Intel" header
   - Center feed (flexible width) with "Company Intelligence" or "Keyword Intelligence"
   - Right reader pane (width: 384px) with "Select an item to view details"
3. Verify sidebar buttons:
   - "Companies" button (blue background when active)
   - "Keywords" button
   - "Settings" button at bottom

### 3. Add Competitor Test

**Expected Result**: Competitor added successfully

1. Click "Settings" button in sidebar
2. Click "Add Competitor"
3. Fill in form:
   - Name: `Test Corp`
   - Domain: `testcorp.com`
4. Click "Add Competitor"
5. Dialog should close
6. Verify in Drizzle Studio:
   ```sql
   SELECT * FROM competitors WHERE name = 'Test Corp';
   ```
7. Note the competitor ID for next tests

### 4. Add Keyword Test

**Expected Result**: Keyword added successfully

1. Click "Settings" button in sidebar
2. Click "Add Keyword"
3. Fill in form:
   - Term: `AI automation`
   - Category: `Technology`
4. Click "Add Keyword"
5. Dialog should close
6. Verify in Drizzle Studio:
   ```sql
   SELECT * FROM keywords WHERE term = 'AI automation';
   ```
7. Note the keyword ID for next tests

### 5. Webhook Ingestion Test (Company Intel)

**Expected Result**: Intelligence item created and linked to competitor

**Get Competitor ID** from Drizzle Studio or test #3

```bash
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Hiring&comp_id=COMPETITOR_ID_HERE&platform=Reddit" \
  -H "Authorization: Bearer dev-secret-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Engineer - Remote",
    "content": "<p>We are looking for a <strong>talented senior software engineer</strong> to join our team.</p><p>Requirements:<ul><li>5+ years experience</li><li>Python/Django</li><li>Remote OK</li></ul></p>",
    "url": "https://reddit.com/r/forhire/12345"
  }'
```

**Verify**:
1. Response: `{"success":true,"message":"Webhook queued for processing"}`
2. Check Inngest UI (http://localhost:8288):
   - Event `intel/webhook.received` appears
   - Function `process-intel-item` executes successfully
3. Check Drizzle Studio:
   ```sql
   SELECT * FROM intel_items WHERE title LIKE '%Senior Software Engineer%';
   ```
4. Verify fields:
   - `competitor_id` matches the ID you used
   - `signal_type` = "Hiring"
   - `source_platform` = "Reddit"

### 6. Webhook Ingestion Test (Keyword Intel)

**Expected Result**: Intelligence item created and linked to keyword

**Get Keyword ID** from Drizzle Studio or test #4

```bash
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Market%20Shift&keyword_id=KEYWORD_ID_HERE&platform=X" \
  -H "Authorization: Bearer dev-secret-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New AI Automation Trends in 2026",
    "content": "<p>The market is shifting towards <em>agentic AI systems</em> that can perform complex tasks autonomously.</p><blockquote>AI agents are the future of work automation.</blockquote>",
    "url": "https://x.com/techtrends/status/12345"
  }'
```

**Verify**:
1. Response: `{"success":true,"message":"Webhook queued for processing"}`
2. Check Inngest UI for successful processing
3. Check Drizzle Studio:
   ```sql
   SELECT * FROM intel_items WHERE title LIKE '%AI Automation%';
   ```

### 7. Feed Display Test

**Expected Result**: Items appear in correct feeds

1. Navigate to http://localhost:3000
2. Click "Companies" in sidebar
3. Verify feed shows:
   - "Senior Software Engineer - Remote" item
   - Green "Hiring" badge
   - Reddit icon (globe)
   - Timestamp ("X seconds/minutes ago")
4. Click "Keywords" in sidebar
5. Verify feed shows:
   - "New AI Automation Trends in 2026" item
   - Blue "Market Shift" badge
   - X/Twitter icon

### 8. Reader Pane Test

**Expected Result**: Selected item displays with sanitized HTML

1. In "Companies" view, click on "Senior Software Engineer" item
2. Verify reader pane shows:
   - Item card has blue ring (selected state)
   - Reader pane displays full title
   - Green "Hiring" badge
   - Reddit icon
   - Timestamp
   - Company name: "Test Corp"
   - Sanitized HTML content (bold text preserved, bullet list preserved)
   - "View Original" button at bottom
3. Click "View Original" button
4. Verify it opens https://reddit.com/r/forhire/12345 in new tab

### 9. HTML Sanitization Test

**Expected Result**: Dangerous HTML is stripped

```bash
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Customer%20Pain&platform=Website" \
  -H "Authorization: Bearer dev-secret-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "XSS Test - Should Be Safe",
    "content": "<p>Safe content</p><script>alert(\"XSS\")</script><p>More safe content</p><img src=x onerror=alert(1)>",
    "url": "https://example.com/test"
  }'
```

**Verify**:
1. Item appears in feed
2. Click to view in reader pane
3. Verify:
   - `<script>` tag is removed
   - `onerror` attribute is removed
   - Safe content remains
   - No JavaScript executes

### 10. Export API Test (JSON)

**Expected Result**: JSON export with all items from last 5 days

```bash
curl "http://localhost:3000/api/export?scope=all&format=json" | jq .
```

**Verify**:
- Response is JSON array
- Contains all 3 test items
- Each item has all fields including joined data:
  - `competitorName` and `competitorDomain` for company intel
  - `keywordTerm` and `keywordCategory` for keyword intel

### 11. Export API Test (CSV)

**Expected Result**: CSV export with headers and data

```bash
curl "http://localhost:3000/api/export?scope=companies&format=csv" -o test-export.csv
cat test-export.csv
```

**Verify**:
- File contains CSV with headers
- First row is header row (id,title,rawContent,...)
- Data rows contain company intelligence items only
- HTML content is properly escaped (quotes, commas)
- Open in spreadsheet app to verify formatting

### 12. Scope Filtering Test

**Expected Result**: Exports filter by scope correctly

```bash
# Companies only
curl "http://localhost:3000/api/export?scope=companies&format=json" | jq 'length'
# Should return 1 (only the Hiring item)

# Keywords only
curl "http://localhost:3000/api/export?scope=keywords&format=json" | jq 'length'
# Should return 1 (only the Market Shift item)

# All (unlinked items too)
curl "http://localhost:3000/api/export?scope=all&format=json" | jq 'length'
# Should return 3 (all items)
```

### 13. Authentication Test

**Expected Result**: Webhook rejects invalid tokens

```bash
# Wrong token
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Hiring&platform=Reddit" \
  -H "Authorization: Bearer wrong-token" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"<p>Test</p>","url":"https://example.com"}'
```

**Verify**:
- Response: `{"error":"Unauthorized"}` with status 401

```bash
# Missing Authorization header
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Hiring&platform=Reddit" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"<p>Test</p>","url":"https://example.com"}'
```

**Verify**:
- Response: `{"error":"Unauthorized"}` with status 401

### 14. Validation Test

**Expected Result**: Webhook validates required fields

```bash
# Missing query params
curl -X POST "http://localhost:3000/api/webhooks/ingest" \
  -H "Authorization: Bearer dev-secret-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"<p>Test</p>","url":"https://example.com"}'
```

**Verify**:
- Response: `{"error":"Missing required query parameters: type, platform"}` with status 400

```bash
# Missing body fields
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Hiring&platform=Reddit" \
  -H "Authorization: Bearer dev-secret-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
```

**Verify**:
- Response: `{"error":"Missing required fields: title, content, url"}` with status 400

### 15. Inngest Retry Test

**Expected Result**: Failed events retry automatically

1. Temporarily break database connection:
   - Stop Supabase project OR
   - Change DATABASE_URL to invalid value
2. Send webhook:
   ```bash
   curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Hiring&platform=Reddit" \
     -H "Authorization: Bearer dev-secret-token-change-in-production" \
     -H "Content-Type: application/json" \
     -d '{"title":"Retry Test","content":"<p>Test</p>","url":"https://example.com"}'
   ```
3. Check Inngest UI (http://localhost:8288)
4. Verify:
   - Event queued successfully
   - Function execution fails
   - Inngest schedules retry (up to 3 attempts)
5. Restore database connection
6. Verify Inngest retries and succeeds

### 16. 5-Day Filter Test

**Expected Result**: Export only includes last 5 days

1. Manually insert old data via Drizzle Studio:
   ```sql
   INSERT INTO intel_items (title, raw_content, source_url, source_platform, signal_type, created_at)
   VALUES ('Old Item', '<p>Old</p>', 'https://example.com', 'Website', 'Hiring', NOW() - INTERVAL '7 days');
   ```
2. Export data:
   ```bash
   curl "http://localhost:3000/api/export?scope=all&format=json" | jq 'map(.title)'
   ```
3. Verify "Old Item" is NOT in results

### 17. Production Build Test

**Expected Result**: Build succeeds with no errors

```bash
npm run build
```

**Verify**:
- Build completes successfully
- No TypeScript errors
- No ESLint errors
- Output shows route list with all API routes

### 18. Signal Type Colors Test

**Expected Result**: Each signal type has correct color

Send one webhook for each signal type:

```bash
# Hiring (Green)
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Hiring&platform=LinkedIn" \
  -H "Authorization: Bearer dev-secret-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hiring Signal","content":"<p>Test</p>","url":"https://example.com"}'

# Market Shift (Blue)
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Market%20Shift&platform=X" \
  -H "Authorization: Bearer dev-secret-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"title":"Market Signal","content":"<p>Test</p>","url":"https://example.com"}'

# Culture (Purple)
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Culture&platform=Reddit" \
  -H "Authorization: Bearer dev-secret-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"title":"Culture Signal","content":"<p>Test</p>","url":"https://example.com"}'

# Customer Pain (Red)
curl -X POST "http://localhost:3000/api/webhooks/ingest?type=Customer%20Pain&platform=Website" \
  -H "Authorization: Bearer dev-secret-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"title":"Customer Signal","content":"<p>Test</p>","url":"https://example.com"}'
```

**Verify in UI**:
- Hiring badge: green background, green text
- Market Shift badge: blue background, blue text
- Culture badge: purple background, purple text
- Customer Pain badge: red background, red text

## Test Results Template

Copy this template to track your test results:

```markdown
## Test Results - [Date]

- [ ] 1. Database Schema Verification
- [ ] 2. UI Load Test
- [ ] 3. Add Competitor Test
- [ ] 4. Add Keyword Test
- [ ] 5. Webhook Ingestion Test (Company)
- [ ] 6. Webhook Ingestion Test (Keyword)
- [ ] 7. Feed Display Test
- [ ] 8. Reader Pane Test
- [ ] 9. HTML Sanitization Test
- [ ] 10. Export API Test (JSON)
- [ ] 11. Export API Test (CSV)
- [ ] 12. Scope Filtering Test
- [ ] 13. Authentication Test
- [ ] 14. Validation Test
- [ ] 15. Inngest Retry Test
- [ ] 16. 5-Day Filter Test
- [ ] 17. Production Build Test
- [ ] 18. Signal Type Colors Test

### Issues Found

[List any issues discovered during testing]

### Notes

[Any additional observations]
```

## Cleanup After Testing

To reset the database for fresh testing:

```sql
-- In Drizzle Studio, run:
TRUNCATE TABLE intel_items CASCADE;
TRUNCATE TABLE competitors CASCADE;
TRUNCATE TABLE keywords CASCADE;
```

Or drop and recreate tables:

```bash
npm run db:generate
npm run db:migrate
```

## Performance Testing

For load testing (optional):

```bash
# Install Apache Bench
brew install httpd  # macOS

# Send 100 requests, 10 concurrent
ab -n 100 -c 10 -T 'application/json' -H 'Authorization: Bearer dev-secret-token-change-in-production' \
  -p test-payload.json \
  http://localhost:3000/api/webhooks/ingest?type=Hiring&platform=Reddit
```

Create `test-payload.json`:
```json
{"title":"Load Test","content":"<p>Test</p>","url":"https://example.com"}
```

## Troubleshooting Common Test Failures

### "Database connection failed"
- Verify DATABASE_URL in `.env.local`
- Check Supabase project is not paused
- Verify migrations have run

### "Unauthorized" on webhook
- Check WEBHOOK_SECRET_TOKEN matches
- Verify Authorization header format: `Bearer <token>`

### "Inngest function not found"
- Ensure Inngest dev server is running
- Check INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY
- Restart both dev servers

### Items not appearing in feed
- Check Inngest UI for processing errors
- Verify database has items: `SELECT * FROM intel_items;`
- Try changing views (Companies <-> Keywords) to refresh

### HTML content appears broken
- Check browser console for errors
- Verify DOMPurify is sanitizing (not stripping all HTML)
- Check `raw_content` field in database for original HTML
