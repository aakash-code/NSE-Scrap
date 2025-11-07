# Troubleshooting Guide: Data Not Displaying

If your NSE IPO data is not displaying in Google Sheets, follow this step-by-step guide to diagnose and fix the issue.

## Quick Fix Steps

### 1. Clear Cache and Retry
The most common issue is cached data or temporary API problems.

1. Open your Google Sheet
2. Go to **NSE IPO Automation** menu
3. Click **🗑️ Clear Cache**
4. Wait 10 seconds
5. Click **Fetch All IPOs** again

### 2. Test API Connection
Use the built-in test function to see what's happening:

1. Go to **NSE IPO Automation** menu
2. Click **🔧 Test API Connection**
3. Wait for the alert that says "Test Complete"
4. Go to **Extensions** > **Apps Script**
5. Click **Executions** (clock icon on left sidebar)
6. Click on the most recent execution
7. Review the logs to see what data was received

### 3. Check Execution Logs
The script now logs detailed information about what it's doing:

1. Go to **Extensions** > **Apps Script**
2. Click **Executions** (clock icon on left)
3. Find the most recent run of `fetchAllIPOs`
4. Click on it to see detailed logs
5. Look for these key indicators:

```
✅ Good signs:
- "NSE API response code: 200"
- "activeIpo count: X" (where X > 0)
- "Total IPOs combined: X" (where X > 0)

❌ Problem signs:
- "NSE API response code: 403" or "429" (blocked or rate limited)
- "activeIpo count: 0" and "closedIpo count: 0" (no data)
- "Error fetching NSE data"
```

## Common Issues and Solutions

### Issue 1: "No data available" in Sheet

**Symptoms:**
- Sheet shows only "No data available"
- No error messages

**Possible Causes:**
1. NSE API is returning empty arrays
2. NSE is blocking the requests
3. API response structure has changed

**Solutions:**

**A. Run the Test Function:**
```
1. Extensions > Apps Script
2. Select function dropdown > testNSEAPIResponse
3. Click Run (▶️)
4. Check the logs
```

**B. Check the logs for:**
- Response structure: Does it have `activeIpo`, `closedIpo`, `upcomingIpo` keys?
- Array lengths: Are they all 0?
- Error messages: Any errors in fetching?

**C. If arrays are empty:**
- NSE might not have any IPOs currently listed
- Try again in a few hours
- Check NSE website directly: https://www.nseindia.com/market-data/all-upcoming-issues-ipo

**D. If response structure is different:**
The API structure may have changed. Check the logs for actual field names and update the `parseIPOData` function accordingly.

### Issue 2: "Failed to fetch data from NSE India"

**Symptoms:**
- Error message popup
- Red toast notification

**Possible Causes:**
1. Rate limiting (HTTP 429)
2. Blocked by NSE (HTTP 403)
3. Network issues
4. NSE servers down

**Solutions:**

**A. Check the HTTP status code in logs:**
```
NSE API response code: 403  → You're blocked, wait 1-2 hours
NSE API response code: 429  → Rate limited, wait 30-60 minutes
NSE API response code: 500  → NSE server error, try later
NSE API response code: 200  → Success, different issue
```

**B. If blocked (403):**
1. Clear cache
2. Wait 1-2 hours
3. Don't run the script multiple times rapidly
4. Consider increasing `CACHE_DURATION_MINUTES` to 60 or 120

**C. If rate limited (429):**
1. You've made too many requests
2. Wait at least 1 hour
3. Increase cache duration
4. Avoid running script frequently

**D. Modify cache duration:**
```javascript
// In NSE_IPO_Scraper.gs, line 14:
const CACHE_DURATION_MINUTES = 120; // Increase from 30 to 120
```

### Issue 3: Data Shows But Fields Are Empty

**Symptoms:**
- Rows appear but many columns are empty
- Company names missing or other key fields blank

**Possible Causes:**
1. NSE changed their API field names
2. Field mapping is incorrect

**Solutions:**

**A. Run test function and check logs:**
```javascript
// Look for this in logs:
First IPO object keys: companyName, issueType, ...
```

**B. Compare with expected fields:**
Expected fields in code:
- `companyName`, `securityType`, `issueType`, `issuePrice`, etc.

If logs show different names (like `company_name` instead of `companyName`), the script already handles both formats, but you may need to add more variants.

**C. Update parseIPOData function:**
The function already checks multiple field name formats:
```javascript
ipo.companyName || ipo.company_name || ''
```

Add more variants if needed based on what you see in logs.

### Issue 4: "Service invoked too many times"

**Symptoms:**
- Error about quota exceeded
- Script won't run

**Solutions:**

**A. Immediate fix:**
1. Wait 24 hours for quota to reset
2. Use cached data in the meantime

**B. Prevention:**
1. Increase `CACHE_DURATION_MINUTES` to 120 or higher
2. Don't run the script more than once per hour
3. Avoid setting up auto-refresh with short intervals
4. Consider using triggers only for once-daily updates

### Issue 5: Script Authorization Issues

**Symptoms:**
- "Authorization required" messages
- Script won't run after authorization

**Solutions:**

**A. Re-authorize:**
1. Extensions > Apps Script
2. Run any function
3. Click "Review Permissions"
4. Choose your Google account
5. Click "Advanced" > "Go to [Project Name]"
6. Click "Allow"

**B. If authorization keeps failing:**
1. Close Apps Script editor
2. Close Google Sheet
3. Open Sheet again
4. Try authorization again

## Advanced Debugging

### Enable Maximum Logging

Add this at the start of `fetchNSEData` function:
```javascript
Logger.log('Cache key: ' + cacheKey);
Logger.log('Cached data exists: ' + (cachedData !== null));
```

### Inspect Raw API Response

In Apps Script editor, run this code directly:
```javascript
function debugRawResponse() {
  const url = 'https://www.nseindia.com/api/ipo-detail';
  const options = {
    'method': 'get',
    'headers': {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    },
    'muteHttpExceptions': true
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log('Status: ' + response.getResponseCode());
  Logger.log('Response: ' + response.getContentText());
}
```

### Check NSE Website Directly

1. Visit: https://www.nseindia.com/market-data/all-upcoming-issues-ipo
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Find request to `/api/ipo-detail`
6. Check if it returns data
7. Compare structure with script expectations

## Getting Help

If none of these solutions work:

1. **Gather Information:**
   - Run `testNSEAPIResponse` function
   - Copy all logs from Executions view
   - Note exact error messages
   - Check NSE website to see if data exists there

2. **Report Issue:**
   - Include logs from test function
   - Include screenshots of errors
   - Include execution logs
   - Describe what you've already tried

3. **Temporary Workaround:**
   - Visit NSE website directly
   - Manually copy data
   - Use `=IMPORTHTML()` if NSE structure allows it

## Prevention Tips

1. **Don't over-use the script:**
   - Fetch data at most once per hour
   - Use cache effectively
   - Set up auto-refresh for once daily only

2. **Monitor quota:**
   - Check Apps Script quotas: https://script.google.com/home/executions
   - Stay well under daily limits

3. **Keep script updated:**
   - Check repository for updates
   - NSE may change API structure
   - Update field mappings as needed

4. **Use appropriate cache duration:**
   - For manual use: 30 minutes is fine
   - For auto-refresh: Use 120+ minutes
   - For daily updates: Use 1440 minutes (24 hours)

## Understanding the Logs

### Normal Successful Run:
```
NSE API response code: 200
Response length: 15234 characters
Successfully parsed JSON data
JSON root keys: activeIpo, closedIpo, upcomingIpo
Received data keys: activeIpo, closedIpo, upcomingIpo
activeIpo count: 5
closedIpo count: 120
upcomingIpo count: 3
Total IPOs combined: 128
parseIPOData called with array length: 128
Parsed 128 IPO records
```

### Failed Run (Blocked):
```
NSE API response code: 403
Non-200 response body: <html>Access Denied</html>
Error fetching NSE data: NSE API returned status code: 403
```

### Failed Run (No Data):
```
NSE API response code: 200
Response length: 89 characters
Successfully parsed JSON data
JSON root keys: activeIpo, closedIpo, upcomingIpo
activeIpo count: 0
closedIpo count: 0
upcomingIpo count: 0
Total IPOs combined: 0
parseIPOData called with array length: 0
No IPO data to parse
```

## Last Resort

If nothing works and you suspect NSE has completely changed their API:

1. Visit the GitHub repository
2. Check for updates or issues
3. Consider using alternative data sources
4. Report the API change with details from logs

---

**Remember:** NSE India actively prevents automated scraping. Be patient, use caching wisely, and don't run the script too frequently.
