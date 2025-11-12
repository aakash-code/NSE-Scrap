# NSE Data Automation

Comprehensive solution for fetching IPO data and Stock Market data from NSE India with **dual implementation**:
- **Google Apps Script** for direct Google Sheets integration
- **Python Scripts** for advanced data processing and multiple export formats

## Features

### IPO Data
- **Fetch IPO Data**: Automatically retrieves Current, Past, and Upcoming IPOs from NSE India
- **Smart Filtering**: Filter by IPO status (Current/Past/Upcoming)
- **Auto-Sorting**: Automatically sorts data by Security Type

### Stock Market Data (NEW!)
- **Index-wise Stock Data**: Fetch all stocks organized by major indices (NIFTY 50, NIFTY BANK, etc.)
- **Sector-wise Stock Data**: Fetch all stocks organized by sectors (IT, Auto, Pharma, etc.)
- **Custom Index Query**: Fetch stocks for any specific index
- **All Indices List**: Get comprehensive list of all NSE indices with live data
- **Live Market Data**: Real-time stock prices, changes, highs, lows, and more

### General Features
- **Anti-Scraping Handling**: Properly configured headers to bypass NSE's security measures
- **Caching**: Caches data for 30 minutes to minimize API requests
- **Beautiful Formatting**: Auto-formatted tables with frozen headers and alternating row colors
- **Custom Menu**: Easy-to-use menu in Google Sheets
- **Auto-Refresh**: Optional daily automatic data refresh

## Why This Solution?

NSE India's website uses JavaScript to load IPO data and implements anti-scraping measures, making the standard `=IMPORTHTML()` function unreliable. This project provides two complementary solutions:

### Google Apps Script (For Google Sheets)
1. Uses proper HTTP headers to mimic browser requests
2. Accesses NSE's API directly for reliable data
3. Handles session management and cookies
4. Provides caching to avoid rate limiting
5. Offers a user-friendly interface with custom menus
6. **Best for**: Direct Google Sheets integration, real-time updates

### Python Scripts (For Advanced Use)
1. Uses modern `nse-python` library for robust API access
2. Supports multiple export formats (CSV, Excel, JSON)
3. Batch processing capabilities
4. Progress tracking and detailed logging
5. Can be scheduled for automated runs
6. **Best for**: Batch processing, data analysis, automated workflows

## Quick Start

### Option 1: Google Sheets (Recommended for Sheets Users)

See [Installation - Google Sheets](#installation-google-sheets) section below.

### Option 2: Python Scripts (Recommended for Data Analysis)

```bash
# Install dependencies
pip install -r requirements.txt

# Run interactive scraper
python nse_scraper.py

# Or run batch scraper
python nse_batch_scraper.py
```

See [PYTHON_USAGE.md](PYTHON_USAGE.md) for detailed Python documentation.

## Installation - Google Sheets

### Step 1: Open Google Sheets

1. Create a new Google Sheet or open an existing one
2. Click on **Extensions** > **Apps Script**

### Step 2: Add the Script

1. Delete any existing code in the script editor
2. Copy the entire contents of `NSE_IPO_Scraper.gs` from this repository
3. Paste it into the script editor
4. Click the **Save** icon (or press `Ctrl+S` / `Cmd+S`)
5. Name your project (e.g., "NSE IPO Automation")

### Step 3: Authorize the Script

1. Close the Apps Script editor
2. Refresh your Google Sheet
3. You'll see a new menu: **NSE IPO Automation**
4. Click on any menu item (e.g., "Fetch All IPOs")
5. You'll be prompted to authorize the script
6. Click **Continue** and grant the necessary permissions

## Usage

### Using the Custom Menu

After installation, you'll see the **NSE IPO Automation** menu in your Google Sheet:

#### IPO Functions:

1. **Fetch All IPOs**: Retrieves Current, Past, and Upcoming IPOs in one sheet
2. **Fetch Past Issues Only**: Shows only closed/past IPOs
3. **Fetch Current Issues Only**: Shows only currently active IPOs
4. **Fetch Upcoming Issues Only**: Shows only upcoming IPOs

#### Stock Market Data Functions (NEW!):

1. **Fetch All Stocks (Index-wise)**: Retrieves stocks from all major indices including:
   - NIFTY 50, NIFTY 100, NIFTY 200, NIFTY 500
   - NIFTY BANK, NIFTY IT, NIFTY AUTO, NIFTY PHARMA
   - NIFTY FMCG, NIFTY METAL, NIFTY REALTY, NIFTY ENERGY
   - NIFTY MIDCAP 50, NIFTY SMALLCAP 50

2. **Fetch All Stocks (Sector-wise)**: Retrieves stocks organized by sectors:
   - Banking, IT, Auto, Pharma, FMCG, Metal
   - Realty, Energy, Financial Services, Media
   - Healthcare, Consumer Durables, Oil & Gas, and more

3. **Fetch Stocks by Index...**: Enter any specific index name to fetch its stocks
   - Example: Enter "NIFTY 50" to get all NIFTY 50 stocks
   - Example: Enter "NIFTY BANK" to get all banking stocks

4. **Fetch All Indices List**: Shows all NSE indices with live market data

#### Utility Functions:

5. **Clear Data**: Clears all data from the active sheet
6. **🔧 Test API Connection**: Tests NSE API connectivity
7. **🗑️ Clear Cache**: Clears cached data to force fresh fetch
8. **About**: Shows information about the script

### Data Columns

#### IPO Data Columns

The script fetches the following information for each IPO:

| Column | Description |
|--------|-------------|
| Company Name | Name of the company |
| Security Type | Type of security (Equity, Debt, etc.) |
| Issue Type | Type of issue (IPO, FPO, Rights Issue, etc.) |
| Issue Price | Price per share |
| Issue Size (Cr) | Total issue size in Crores |
| Open Date | Issue opening date |
| Close Date | Issue closing date |
| Allotment Date | Date of allotment |
| Listing Date | Date of listing on exchange |
| Status | Current status (Open, Closed, Upcoming) |
| Symbol | Trading symbol |

#### Stock Market Data Columns (NEW!)

For stock market data, the following columns are fetched:

| Column | Description |
|--------|-------------|
| Symbol | Trading symbol of the stock |
| Company Name | Full name of the company |
| Last Price | Current/Last traded price |
| Change | Absolute price change |
| % Change | Percentage price change |
| Open | Opening price |
| High | Day's high price |
| Low | Day's low price |
| Previous Close | Previous day's closing price |
| Year High | 52-week high price |
| Year Low | 52-week low price |
| Index/Sector | Associated index or sector name |

### Automatic Sorting

All data is automatically sorted by **Security Type** for easier analysis.

### Data Refresh

The script automatically caches data for 30 minutes to avoid excessive requests to NSE. To force a refresh, simply run the fetch function again after 30 minutes, or clear your cache:

```javascript
// Run this in the Apps Script editor to clear cache
CacheService.getScriptCache().removeAll(['nse_ipo_data_all', 'nse_ipo_data_past', 'nse_ipo_data_current', 'nse_ipo_data_upcoming']);
```

## Advanced Features

### Setting Up Daily Auto-Refresh

To automatically refresh your IPO data every day at 9 AM:

1. Open the Apps Script editor
2. Find the function `setupDailyTrigger()`
3. Click on it and run it
4. Authorize the trigger when prompted

Your data will now refresh automatically every day at 9 AM.

### Removing Auto-Refresh

To remove the automatic refresh:

1. Open the Apps Script editor
2. Find the function `removeDailyTrigger()`
3. Click on it and run it

### Customization Options

You can customize the script by modifying these constants at the top of the code:

```javascript
const NSE_IPO_URL = 'https://www.nseindia.com/api/ipo-detail';
const CACHE_DURATION_MINUTES = 30; // Change cache duration
```

You can also customize:
- Header colors (line 213: `headerRange.setBackground('#4285F4')`)
- Auto-refresh time (line 422: `.atHour(9)`)
- Data fields and columns (modify the `parseIPOData` function)

## Troubleshooting

### ⚠️ Data Not Displaying?

If your IPO data isn't showing up, **[see the detailed TROUBLESHOOTING.md guide](TROUBLESHOOTING.md)** for step-by-step solutions.

**Quick fixes:**
1. Use the **🔧 Test API Connection** menu item to diagnose issues
2. Use the **🗑️ Clear Cache** menu item and try again
3. Check the execution logs in Apps Script (Extensions > Apps Script > Executions)

### Common Issues

For detailed solutions to these issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md):

- **"No data available" in sheet** - API might be returning empty data or structure changed
- **"Failed to fetch data from NSE India"** - Rate limited or blocked by NSE
- **Empty fields/columns** - API field names may have changed
- **"Service invoked too many times"** - Exceeded Google's quotas
- **Authorization errors** - Need to re-authorize the script

### New Debugging Tools (v1.1.0)

The script now includes enhanced debugging features:

1. **Test API Connection**: Menu item that logs full API response structure
2. **Clear Cache**: Force fresh data fetch from NSE
3. **Detailed Logging**: Automatic logging of API responses and data processing
4. **Better Error Messages**: More informative error messages with solutions

To use these tools:
- Open **NSE IPO Automation** menu in your Google Sheet
- Click **🔧 Test API Connection** to see what NSE is returning
- Check **Extensions > Apps Script > Executions** to view detailed logs

## Technical Details

### API Endpoints

The script uses NSE India's official API endpoints:

#### IPO Data:
```
https://www.nseindia.com/api/ipo-detail
```

#### Stock Market Data:
```
https://www.nseindia.com/api/allIndices
https://www.nseindia.com/api/equity-stockIndices?index=[INDEX_NAME]
```

### HTTP Headers

To bypass anti-scraping measures, the script uses:
- Proper User-Agent string
- Referer header
- Accept headers for JSON
- Session management via initial page visit

### Rate Limiting

- Data is cached for 30 minutes by default
- Maximum script execution time: 6 minutes (Google's limit)
- Recommended: Don't run more than once every 30 minutes

### Data Sources

All data is fetched directly from NSE India's official API, ensuring:
- Real-time accuracy
- Official data integrity
- Reliable updates

## Limitations

### Google Apps Script Limitations
1. **Execution Time**: Maximum 6 minutes per execution
2. **Daily Quota**: Google limits the number of UrlFetch calls per day
3. **NSE API Changes**: NSE may change their API structure without notice
4. **Rate Limiting**: NSE may throttle or block excessive requests

### Python Scripts Limitations
1. **NSE API Availability**: Dependent on NSE website accessibility
2. **nse-python Library**: May need updates if NSE changes their API
3. **Network**: Requires stable internet connection

## Python Scripts for Advanced Usage

In addition to the Google Apps Script solution, this project includes Python scripts using the modern `nse-python` library for advanced data fetching and analysis.

### Features

- **Modern NSE API Wrapper**: Uses `nse-python` library
- **Multiple Export Formats**: CSV, Excel (with formatting), JSON
- **Batch Processing**: Fetch all data with single command
- **Progress Tracking**: Visual progress bars
- **Comprehensive Logging**: Detailed logs for debugging
- **Automation Ready**: Can be scheduled with cron/Task Scheduler

### Installation

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### Quick Usage

```bash
# Interactive mode
python nse_scraper.py

# Batch mode - fetch everything
python nse_batch_scraper.py

# Fetch only indices
python nse_batch_scraper.py --indices-only

# Fetch stocks organized by sector
python nse_batch_scraper.py --sector

# Export only to CSV
python nse_batch_scraper.py --format csv
```

### Python vs Google Apps Script

| Feature | Python Scripts | Google Apps Script |
|---------|---------------|-------------------|
| **Integration** | Export to files | Direct to Google Sheets |
| **Speed** | Fast (parallel possible) | Moderate |
| **Export Formats** | CSV, Excel, JSON | Sheets only |
| **Automation** | cron, Task Scheduler | Time-based triggers |
| **Setup** | Requires Python | No setup needed |
| **Best For** | Batch jobs, analysis | Real-time Sheets updates |

### Detailed Documentation

See **[PYTHON_USAGE.md](PYTHON_USAGE.md)** for:
- Complete installation guide
- Usage examples
- API reference
- Scheduling automation
- Troubleshooting
- Advanced usage patterns

## Security & Privacy

- The script runs entirely within your Google account
- No data is sent to third-party servers
- Only fetches publicly available data from NSE India
- No personal information is collected or stored

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is provided as-is for educational and personal use. Please respect NSE India's terms of service and avoid excessive API requests.

## Support

For issues, questions, or feature requests:
1. Check the Troubleshooting section first
2. Review the NSE India website to ensure the API is still accessible
3. Open an issue on GitHub with detailed error messages

## Changelog

### Version 1.2.0 (2025-11-12)
- **NEW: Python Scripts with nse-python Library**:
  - `nse_scraper.py` - Interactive scraper with menu interface
  - `nse_batch_scraper.py` - Automated batch processing
  - Export to CSV, Excel (with formatting), and JSON
  - Progress bars and comprehensive logging
  - Support for scheduling with cron/Task Scheduler
  - See [PYTHON_USAGE.md](PYTHON_USAGE.md) for details
- **NEW: Stock Market Data Features (Google Apps Script)**:
  - Fetch all stocks organized by major indices (NIFTY 50, NIFTY BANK, etc.)
  - Fetch all stocks organized by sectors (Banking, IT, Pharma, etc.)
  - Custom index query support for any NSE index
  - Fetch comprehensive list of all NSE indices with live data
  - Real-time stock prices, changes, highs, lows, and year ranges
- **New API Endpoints**:
  - `https://www.nseindia.com/api/allIndices` - All indices data
  - `https://www.nseindia.com/api/equity-stockIndices` - Index-wise stocks
- **New Menu Items (Google Sheets)**:
  - Stock Market Data submenu with 4 new options
  - Fetch All Stocks (Index-wise)
  - Fetch All Stocks (Sector-wise)
  - Fetch Stocks by Index (custom query)
  - Fetch All Indices List
- **New Files**:
  - `requirements.txt` - Python dependencies
  - `nse_scraper.py` - Main Python scraper
  - `nse_batch_scraper.py` - Batch processing script
  - `PYTHON_USAGE.md` - Complete Python documentation
- **Enhanced Caching**: Added caching for indices and stock data
- **Updated Documentation**: README updated with dual implementation approach

### Version 1.1.0 (2025-11-07)
- **Enhanced Debugging**: Added comprehensive logging throughout the script
- **New Menu Items**:
  - 🔧 Test API Connection - Diagnose API issues
  - 🗑️ Clear Cache - Force fresh data fetch
- **Better Error Handling**: More detailed error messages and stack traces
- **Improved Data Parsing**: Handle multiple field name formats (camelCase and snake_case)
- **New Test Function**: `testNSEAPIResponse()` for detailed API inspection
- **Troubleshooting Guide**: Added TROUBLESHOOTING.md with step-by-step solutions
- **Enhanced Logging**: Log API response codes, data structure, and parsing steps

### Version 1.0.0 (2025-11-07)
- Initial release
- Fetch Current, Past, and Upcoming IPOs
- Auto-sort by Security Type
- Anti-scraping header handling
- 30-minute data caching
- Custom menu integration
- Auto-refresh trigger support
- Beautiful table formatting

## Acknowledgments

- NSE India for providing public IPO data
- Google Apps Script for the automation platform
- The open-source community for inspiration

---

**Disclaimer**: This tool is for informational purposes only. Always verify IPO data from official sources before making investment decisions. The maintainers are not responsible for any data inaccuracies or financial decisions made based on this tool.
