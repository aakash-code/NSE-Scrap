# Quick Setup Guide - NSE IPO Automation

This guide will walk you through setting up the NSE IPO automation in your Google Sheet in under 5 minutes.

## Prerequisites

- A Google account
- Access to Google Sheets

## Step-by-Step Setup

### Step 1: Create or Open a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Give it a name (e.g., "NSE IPO Tracker")

### Step 2: Open the Apps Script Editor

1. In your Google Sheet, click on **Extensions** in the top menu
2. Click **Apps Script** from the dropdown menu
3. A new tab will open with the Apps Script editor

### Step 3: Copy the Script Code

1. In the Apps Script editor, you'll see a default `function myFunction() { }`
2. **Delete all the existing code**
3. Open the file `NSE_IPO_Scraper.gs` from this repository
4. **Copy all the code** (Ctrl+A, then Ctrl+C)
5. **Paste it** into the Apps Script editor (Ctrl+V)

### Step 4: Save the Project

1. Click the **Save** icon (💾) or press `Ctrl+S` (Windows) / `Cmd+S` (Mac)
2. You'll be prompted to name the project
3. Enter a name like "NSE IPO Automation"
4. Click **OK**

### Step 5: Return to Your Sheet

1. Close the Apps Script editor tab
2. Return to your Google Sheet tab
3. **Refresh the page** (press F5 or click the refresh button)
4. Wait a few seconds for the page to reload

### Step 6: Authorize the Script

1. After refreshing, you should see a new menu called **NSE IPO Automation** in the menu bar
   - If you don't see it, wait 10-15 seconds and refresh again
2. Click on **NSE IPO Automation** > **Fetch All IPOs**
3. A dialog box will appear saying **Authorization required**
4. Click **Continue**
5. Choose your Google account
6. You may see a warning that says "Google hasn't verified this app"
   - Click **Advanced**
   - Click **Go to [Your Project Name] (unsafe)**
   - This is safe because it's YOUR script running in YOUR account
7. Click **Allow** to grant the necessary permissions

### Step 7: Fetch Your First IPO Data

1. The script will now run
2. You'll see a small notification at the bottom right: "Fetching IPO data from NSE India..."
3. Wait 10-30 seconds for the data to load
4. Your sheet will be populated with IPO data automatically!
5. You'll see a success message: "Successfully fetched X IPOs"

## What You'll See

After running the script, your sheet will contain:

- **Header Row** (Blue background with white text):
  - Company Name, Security Type, Issue Type, Issue Price, Issue Size, Dates, Status, Symbol

- **Data Rows** with alternating colors for easy reading
- **Auto-sorted** by Security Type
- **Frozen header row** so it stays visible when scrolling

## Using Different Fetch Options

Try the different menu options:

### Fetch All IPOs
- Click **NSE IPO Automation** > **Fetch All IPOs**
- Gets Current, Past, and Upcoming IPOs in one sheet

### Fetch Past Issues Only
- Click **NSE IPO Automation** > **Fetch Past Issues Only**
- Creates a new sheet called "Past Issues" with only closed IPOs

### Fetch Current Issues Only
- Click **NSE IPO Automation** > **Fetch Current Issues Only**
- Creates a new sheet called "Current Issues" with only active IPOs

### Fetch Upcoming Issues Only
- Click **NSE IPO Automation** > **Fetch Upcoming Issues Only**
- Creates a new sheet called "Upcoming Issues" with only upcoming IPOs

## Setting Up Auto-Refresh (Optional)

To automatically update your data every day:

1. Go back to the Apps Script editor (**Extensions** > **Apps Script**)
2. Find the function dropdown at the top (it says "Select function")
3. Select **setupDailyTrigger** from the dropdown
4. Click the **Run** button (▶️)
5. Authorize the trigger if prompted
6. You'll see a message: "Daily auto-refresh has been set up for 9 AM"

Now your data will automatically refresh every day at 9 AM!

### To Remove Auto-Refresh:

1. In the Apps Script editor, select **removeDailyTrigger** from the function dropdown
2. Click **Run**
3. You'll see: "Daily auto-refresh has been removed"

## Common Issues & Solutions

### Issue: Menu doesn't appear after refreshing

**Solution:**
1. Wait 15-20 seconds after refreshing
2. If still not visible, close the entire browser tab and reopen the sheet
3. Check that you saved the script properly

### Issue: "Authorization required" keeps appearing

**Solution:**
1. Clear your browser cache
2. Sign out and sign back into Google
3. Try using an incognito/private window

### Issue: "Failed to fetch data from NSE India"

**Solution:**
1. Check your internet connection
2. Try again in 5-10 minutes (NSE servers might be busy)
3. Clear the cache by waiting 30 minutes

### Issue: Data looks wrong or incomplete

**Solution:**
1. Check the NSE website directly: https://www.nseindia.com/market-data/all-upcoming-issues-ipo
2. If NSE's website is down or changed, wait for an update to the script
3. Try using "Clear Data" and fetching again

### Issue: "Service invoked too many times"

**Solution:**
1. You've hit Google's quota limit
2. Wait 1-2 hours before running again
3. Don't run the script too frequently (recommended: max once per hour)

## Tips & Best Practices

1. **Don't run too frequently**: The script caches data for 30 minutes, so running it more often won't give you newer data

2. **Use specific fetch options**: Instead of always fetching all IPOs, use "Fetch Past Issues Only" if that's what you need

3. **Keep your sheet organized**: The script creates separate sheets for different categories - keep them organized

4. **Check NSE directly for important decisions**: Always verify IPO data from the official NSE website before making investment decisions

5. **Share carefully**: If sharing the sheet, be aware that others can see the data but won't be able to run the script unless you share the Apps Script project too

## Advanced: Editing the Script

If you want to customize the script:

1. Open **Extensions** > **Apps Script**
2. Modify the code as needed
3. Key things you might want to change:
   - `CACHE_DURATION_MINUTES = 30` - Change how long data is cached
   - `.atHour(9)` in `setupDailyTrigger()` - Change auto-refresh time
   - Header colors and formatting in the `writeToSheet()` function

4. Save your changes
5. Run the script again to test

## Need More Help?

- Check the main [README.md](README.md) for detailed documentation
- Review the [Troubleshooting section](README.md#troubleshooting) in the README
- Look at Google Apps Script documentation: https://developers.google.com/apps-script

## Video Tutorial (Coming Soon)

A video walkthrough of this setup process will be available soon.

---

**Time to Complete**: 5 minutes
**Difficulty**: Beginner-friendly
**Cost**: Free (uses Google Apps Script free tier)

Enjoy automated IPO tracking!
