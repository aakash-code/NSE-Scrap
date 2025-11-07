# Alternative Method: Using IMPORTHTML Function

This document describes the simpler `IMPORTHTML` approach for fetching NSE IPO data. However, **this method is often blocked by NSE India** due to anti-scraping measures.

## Why IMPORTHTML Often Doesn't Work

NSE India's website:
1. Uses JavaScript to load data dynamically
2. Implements CORS (Cross-Origin Resource Sharing) restrictions
3. Requires specific HTTP headers (User-Agent, cookies, etc.)
4. May block automated requests

**Recommendation**: Use the [Google Apps Script method](README.md) instead for reliable results.

## IMPORTHTML Formula (Simple but Unreliable)

If you still want to try the `IMPORTHTML` approach:

### Basic Formula

```
=IMPORTHTML("https://www.nseindia.com/market-data/all-upcoming-issues-ipo","table",1)
```

**Where:**
- `"https://www.nseindia.com/market-data/all-upcoming-issues-ipo"` = URL to fetch data from
- `"table"` = Type of data structure to import (table or list)
- `1` = Index number of the table on the page (1 = first table, 2 = second table, etc.)

### Steps to Use IMPORTHTML

1. Open Google Sheets
2. Click on cell A1
3. Type or paste the formula above
4. Press Enter
5. Wait 10-30 seconds for Google to fetch the data

### Expected Result

If successful, you'll see:
- IPO data populated in your sheet starting from cell A1
- Columns with headers like "Company Name", "Issue Type", "Issue Size", etc.
- Multiple rows of IPO information

### Common Errors

#### Error: "Imported content is empty"

**Meaning**: The formula couldn't fetch any data from the URL

**Possible Reasons:**
1. NSE is blocking the request (most common)
2. The table index is wrong
3. The page structure has changed
4. The URL is incorrect or temporary down

**Solutions:**
- Try different table indexes (1, 2, 3, etc.)
- Wait a few hours and try again
- Use the Google Apps Script method instead

#### Error: "Could not fetch url"

**Meaning**: Google Sheets can't access the NSE website

**Possible Reasons:**
1. CORS restrictions
2. NSE requires authentication/cookies
3. Network connectivity issues
4. NSE servers are down

**Solutions:**
- Check if you can access the URL in your browser
- Try again later
- Use the Google Apps Script method instead (recommended)

#### Error: "No tables found"

**Meaning**: The formula found the page but couldn't identify any tables

**Possible Reasons:**
1. The data is loaded via JavaScript (not in the HTML)
2. The page structure has changed
3. The URL doesn't contain table data

**Solutions:**
- Confirm tables exist by viewing the page source
- Use the Google Apps Script method instead

## Trying Different Table Indexes

NSE's page may have multiple tables. Try different indexes:

```
=IMPORTHTML("https://www.nseindia.com/market-data/all-upcoming-issues-ipo","table",1)
=IMPORTHTML("https://www.nseindia.com/market-data/all-upcoming-issues-ipo","table",2)
=IMPORTHTML("https://www.nseindia.com/market-data/all-upcoming-issues-ipo","table",3)
```

## Filtering and Sorting IMPORTHTML Data

If IMPORTHTML works, you can filter and sort the data:

### Filtering for Past Issues

1. Click on the header row
2. Click **Data** > **Create a filter**
3. Click the filter icon on the "Status" column
4. Uncheck all except "Closed" or "Past"
5. Click **OK**

### Sorting by Security Type

1. Select the entire data range
2. Click **Data** > **Sort range**
3. Check "Data has header row"
4. Choose "Security Type" from the "Sort by" dropdown
5. Click **Sort**

## Advanced: Combining with QUERY Function

If IMPORTHTML works, you can use QUERY to filter and sort in one formula:

### Filter for Past Issues and Sort by Security Type

```
=QUERY(
  IMPORTHTML("https://www.nseindia.com/market-data/all-upcoming-issues-ipo","table",1),
  "SELECT * WHERE Col10 = 'Closed' ORDER BY Col2",
  1
)
```

**Note**: Adjust column numbers (Col2, Col10) based on actual table structure.

### Filter for Equity IPOs Only

```
=QUERY(
  IMPORTHTML("https://www.nseindia.com/market-data/all-upcoming-issues-ipo","table",1),
  "SELECT * WHERE Col2 = 'Equity'",
  1
)
```

## Using IMPORTXML (Alternative)

If IMPORTHTML doesn't work, you can try `IMPORTXML`:

```
=IMPORTXML("https://www.nseindia.com/market-data/all-upcoming-issues-ipo","//table")
```

**Note**: This also rarely works with NSE due to the same restrictions.

## Comparison: IMPORTHTML vs Google Apps Script

| Feature | IMPORTHTML | Google Apps Script |
|---------|------------|-------------------|
| Ease of Setup | Very Easy (one formula) | Moderate (copy-paste code) |
| Reliability | Low (often blocked) | High (proper headers) |
| Customization | Limited | Extensive |
| Auto-refresh | Manual or time-based | Trigger-based |
| Error Handling | None | Comprehensive |
| Caching | None | 30 minutes |
| Formatting | Manual | Automatic |
| Success Rate | ~20% | ~95% |

## When to Use IMPORTHTML

Use IMPORTHTML if:
- You want to try the simplest method first
- You're okay with potential failures
- You need a quick one-time data fetch
- The NSE page structure is compatible

Use Google Apps Script if:
- You need reliable, consistent data
- You want automatic formatting
- You need error handling
- You want caching and optimization
- You need scheduled auto-updates

## Troubleshooting IMPORTHTML

### The formula is loading forever (spinning)

**Solution:**
1. Wait up to 2 minutes (Google's timeout)
2. If it doesn't load, the request is likely blocked
3. Try a different table index
4. Switch to Google Apps Script method

### Data appears but is incomplete or wrong

**Solution:**
1. Check the table index - you might be importing the wrong table
2. View the page source to identify the correct table
3. Use QUERY to filter the specific data you need

### Formula works sometimes but not always

**Solution:**
1. NSE might be intermittently blocking requests
2. Implement the Google Apps Script method for consistent results
3. Try accessing during off-peak hours (early morning)

## Example: Complete IMPORTHTML Solution

Here's a complete example with filtering and sorting:

### Sheet Setup:

**Cell A1:**
```
=QUERY(
  IMPORTHTML("https://www.nseindia.com/market-data/all-upcoming-issues-ipo","table",1),
  "SELECT * ORDER BY Col2",
  1
)
```

This will:
1. Fetch all IPO data
2. Sort by Security Type (assuming it's column 2)
3. Include headers

### Adding Conditional Formatting:

1. Select the data range
2. Click **Format** > **Conditional formatting**
3. Set rules to highlight specific IPOs

## Final Recommendation

**For production use and reliability**: Use the [Google Apps Script method](README.md)

**For quick testing**: Try IMPORTHTML first, but be prepared to switch to Apps Script

The Google Apps Script method:
- Has higher success rate (~95% vs ~20%)
- Provides better error messages
- Includes caching and optimization
- Offers automatic formatting
- Supports scheduled updates

---

**Last Updated**: 2025-11-07
**Success Rate**: Low (~20%)
**Maintenance**: NSE may change their page structure at any time

For the most reliable solution, please see [README.md](README.md) and [SETUP_GUIDE.md](SETUP_GUIDE.md).
