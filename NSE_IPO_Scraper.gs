/**
 * NSE India Data Fetcher for Google Sheets
 *
 * This script fetches IPO data and Stock Market data from NSE India's website
 * and populates it into your Google Sheet, with filtering and sorting capabilities.
 *
 * Features:
 * - IPO Data: Current, Past, and Upcoming IPOs
 * - Stock Market Data: Index-wise and Sector-wise stocks
 * - Live market data with prices, changes, and year ranges
 *
 * Author: Claude Code
 * Version: 1.2.0
 * Last Updated: 2025-11-12
 */

// Configuration Constants
const NSE_IPO_URL = 'https://www.nseindia.com/api/ipo-detail';
const NSE_MAIN_URL = 'https://www.nseindia.com';
const NSE_ALL_INDICES_URL = 'https://www.nseindia.com/api/allIndices';
const NSE_EQUITY_STOCKS_URL = 'https://www.nseindia.com/api/equity-stockIndices';
const NSE_MASTER_QUOTE_URL = 'https://www.nseindia.com/api/master-quote';
const CACHE_DURATION_MINUTES = 30; // Cache data for 30 minutes to avoid excessive requests

/**
 * Custom menu to add to Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('NSE IPO Automation')
    .addItem('Fetch All IPOs', 'fetchAllIPOs')
    .addItem('Fetch Past Issues Only', 'fetchPastIssuesOnly')
    .addItem('Fetch Current Issues Only', 'fetchCurrentIssuesOnly')
    .addItem('Fetch Upcoming Issues Only', 'fetchUpcomingIssuesOnly')
    .addSeparator()
    .addSubMenu(ui.createMenu('Stock Market Data')
      .addItem('Fetch All Stocks (Index-wise)', 'fetchAllStocksIndexWise')
      .addItem('Fetch All Stocks (Sector-wise)', 'fetchAllStocksSectorWise')
      .addItem('Fetch Stocks by Index...', 'fetchStocksByIndexPrompt')
      .addItem('Fetch All Indices List', 'fetchAllIndicesList'))
    .addSeparator()
    .addItem('Clear Data', 'clearSheet')
    .addSeparator()
    .addItem('🔧 Test API Connection', 'testNSEAPIResponse')
    .addItem('🗑️ Clear Cache', 'clearCache')
    .addItem('About', 'showAbout')
    .addToUi();
}

/**
 * Show information about the script
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'NSE Data Automation',
    'This script automatically fetches IPO and Stock Market data from NSE India.\n\n' +
    'IPO Features:\n' +
    '• Fetch Current, Past, and Upcoming IPOs\n' +
    '• Auto-sort by Security Type\n\n' +
    'Stock Market Features:\n' +
    '• Fetch stocks by Index (NIFTY 50, NIFTY BANK, etc.)\n' +
    '• Fetch stocks by Sector (IT, Auto, Pharma, etc.)\n' +
    '• Get all NSE indices with live data\n' +
    '• Real-time prices, changes, and year ranges\n\n' +
    'Technical:\n' +
    '• Handles NSE anti-scraping measures\n' +
    '• Caches data to minimize requests\n' +
    '• Debug tools for troubleshooting\n\n' +
    'Version: 1.2.0\n' +
    'GitHub: aakash-code/NSE-Scrap',
    ui.ButtonSet.OK
  );
}

/**
 * Fetches IPO data from NSE India API
 * Uses proper headers to bypass anti-scraping measures
 *
 * @param {string} category - 'all', 'current', 'past', or 'upcoming'
 * @return {Object} Parsed JSON data from NSE
 */
function fetchNSEData(category = 'all') {
  const cache = CacheService.getScriptCache();
  const cacheKey = `nse_ipo_data_${category}`;

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    Logger.log('Using cached data for ' + category);
    return JSON.parse(cachedData);
  }

  try {
    // First, visit the main page to get cookies
    const mainPageOptions = {
      'method': 'get',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      'muteHttpExceptions': true,
      'followRedirects': true
    };

    // Initial request to establish session
    UrlFetchApp.fetch(NSE_MAIN_URL, mainPageOptions);

    // Now fetch the IPO data
    const apiOptions = {
      'method': 'get',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo',
        'X-Requested-With': 'XMLHttpRequest'
      },
      'muteHttpExceptions': true,
      'followRedirects': true
    };

    const response = UrlFetchApp.fetch(NSE_IPO_URL, apiOptions);
    const responseCode = response.getResponseCode();

    Logger.log('NSE API response code: ' + responseCode);

    if (responseCode !== 200) {
      const responseText = response.getContentText();
      Logger.log('Non-200 response body: ' + responseText);
      throw new Error(`NSE API returned status code: ${responseCode}`);
    }

    const responseText = response.getContentText();
    Logger.log('Response length: ' + responseText.length + ' characters');
    Logger.log('First 500 chars of response: ' + responseText.substring(0, 500));

    const jsonData = JSON.parse(responseText);
    Logger.log('Successfully parsed JSON data');
    Logger.log('JSON root keys: ' + Object.keys(jsonData).join(', '));

    // Cache the data
    cache.put(cacheKey, JSON.stringify(jsonData), CACHE_DURATION_MINUTES * 60);

    return jsonData;

  } catch (error) {
    Logger.log('Error fetching NSE data: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error', 'Failed to fetch data from NSE India. Error: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Parses and formats IPO data into a 2D array for Google Sheets
 *
 * @param {Array} ipoArray - Array of IPO objects from NSE
 * @return {Array} 2D array formatted for Google Sheets
 */
function parseIPOData(ipoArray) {
  Logger.log('parseIPOData called with array length: ' + (ipoArray ? ipoArray.length : 0));

  if (!ipoArray || ipoArray.length === 0) {
    Logger.log('No IPO data to parse');
    return [['No data available']];
  }

  // Log first IPO object structure for debugging
  if (ipoArray.length > 0) {
    Logger.log('First IPO object keys: ' + Object.keys(ipoArray[0]).join(', '));
    Logger.log('First IPO sample data: ' + JSON.stringify(ipoArray[0]));
  }

  // Header row
  const headers = [
    'Company Name',
    'Security Type',
    'Issue Type',
    'Issue Price',
    'Issue Size (Cr)',
    'Open Date',
    'Close Date',
    'Allotment Date',
    'Listing Date',
    'Status',
    'Symbol'
  ];

  const rows = [headers];

  // Parse each IPO
  ipoArray.forEach(ipo => {
    const row = [
      ipo.companyName || ipo.company_name || '',
      ipo.securityType || ipo.security_type || '',
      ipo.issueType || ipo.issue_type || '',
      ipo.issuePrice || ipo.issue_price || '',
      ipo.issueSize || ipo.issue_size || '',
      ipo.issueStartDate || ipo.issue_start_date || ipo.openDate || '',
      ipo.issueEndDate || ipo.issue_end_date || ipo.closeDate || '',
      ipo.allotmentDate || ipo.allotment_date || '',
      ipo.listingDate || ipo.listing_date || '',
      ipo.status || '',
      ipo.symbol || ''
    ];
    rows.push(row);
  });

  Logger.log('Parsed ' + (rows.length - 1) + ' IPO records');
  return rows;
}

/**
 * Sorts data by Security Type (column B)
 *
 * @param {Array} data - 2D array of data
 * @return {Array} Sorted 2D array
 */
function sortBySecurityType(data) {
  if (data.length <= 1) return data;

  const headers = data[0];
  const dataRows = data.slice(1);

  // Sort by Security Type (index 1)
  dataRows.sort((a, b) => {
    const typeA = (a[1] || '').toString().toUpperCase();
    const typeB = (b[1] || '').toString().toUpperCase();
    return typeA.localeCompare(typeB);
  });

  return [headers, ...dataRows];
}

/**
 * Writes data to the active sheet with formatting
 *
 * @param {Array} data - 2D array of data to write
 * @param {string} sheetName - Name of the sheet (optional)
 */
function writeToSheet(data, sheetName = null) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet;

  if (sheetName) {
    sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }
  } else {
    sheet = spreadsheet.getActiveSheet();
  }

  // Clear existing data
  sheet.clear();

  // Write data
  if (data.length > 0) {
    const range = sheet.getRange(1, 1, data.length, data[0].length);
    range.setValues(data);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, data[0].length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setHorizontalAlignment('center');

    // Auto-resize columns
    for (let i = 1; i <= data[0].length; i++) {
      sheet.autoResizeColumn(i);
    }

    // Freeze header row
    sheet.setFrozenRows(1);

    // Add alternating row colors for better readability
    if (data.length > 1) {
      const dataRange = sheet.getRange(2, 1, data.length - 1, data[0].length);
      dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
    }
  }

  SpreadsheetApp.flush();
}

/**
 * Main function to fetch all IPOs
 */
function fetchAllIPOs() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Fetching IPO data from NSE India...', 'Please Wait', -1);

    const data = fetchNSEData('all');

    // Log the structure of received data
    Logger.log('Received data keys: ' + Object.keys(data).join(', '));
    Logger.log('activeIpo count: ' + (data.activeIpo ? data.activeIpo.length : 0));
    Logger.log('closedIpo count: ' + (data.closedIpo ? data.closedIpo.length : 0));
    Logger.log('upcomingIpo count: ' + (data.upcomingIpo ? data.upcomingIpo.length : 0));

    const allIPOs = [
      ...(data.activeIpo || []),
      ...(data.closedIpo || []),
      ...(data.upcomingIpo || [])
    ];

    Logger.log('Total IPOs combined: ' + allIPOs.length);

    if (allIPOs.length === 0) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'No IPO data received from NSE. Check logs for details.',
        'Warning',
        10
      );
    }

    let parsedData = parseIPOData(allIPOs);
    parsedData = sortBySecurityType(parsedData);

    writeToSheet(parsedData, 'All IPOs');

    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Successfully fetched ${allIPOs.length} IPOs`,
      'Success',
      5
    );

  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Error: ' + error.toString(), 'Failed', 5);
    Logger.log('Error in fetchAllIPOs: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
  }
}

/**
 * Fetch only Past Issues (Closed IPOs)
 */
function fetchPastIssuesOnly() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Fetching Past Issues from NSE India...', 'Please Wait', -1);

    const data = fetchNSEData('past');
    const pastIPOs = data.closedIpo || [];

    let parsedData = parseIPOData(pastIPOs);
    parsedData = sortBySecurityType(parsedData);

    writeToSheet(parsedData, 'Past Issues');

    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Successfully fetched ${pastIPOs.length} Past Issues`,
      'Success',
      5
    );

  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Error: ' + error.toString(), 'Failed', 5);
    Logger.log('Error in fetchPastIssuesOnly: ' + error.toString());
  }
}

/**
 * Fetch only Current Issues (Active IPOs)
 */
function fetchCurrentIssuesOnly() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Fetching Current Issues from NSE India...', 'Please Wait', -1);

    const data = fetchNSEData('current');
    const currentIPOs = data.activeIpo || [];

    let parsedData = parseIPOData(currentIPOs);
    parsedData = sortBySecurityType(parsedData);

    writeToSheet(parsedData, 'Current Issues');

    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Successfully fetched ${currentIPOs.length} Current Issues`,
      'Success',
      5
    );

  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Error: ' + error.toString(), 'Failed', 5);
    Logger.log('Error in fetchCurrentIssuesOnly: ' + error.toString());
  }
}

/**
 * Fetch only Upcoming Issues
 */
function fetchUpcomingIssuesOnly() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Fetching Upcoming Issues from NSE India...', 'Please Wait', -1);

    const data = fetchNSEData('upcoming');
    const upcomingIPOs = data.upcomingIpo || [];

    let parsedData = parseIPOData(upcomingIPOs);
    parsedData = sortBySecurityType(parsedData);

    writeToSheet(parsedData, 'Upcoming Issues');

    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Successfully fetched ${upcomingIPOs.length} Upcoming Issues`,
      'Success',
      5
    );

  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Error: ' + error.toString(), 'Failed', 5);
    Logger.log('Error in fetchUpcomingIssuesOnly: ' + error.toString());
  }
}

/**
 * Clear all data from the active sheet
 */
function clearSheet() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Clear Data',
    'Are you sure you want to clear all data from the active sheet?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    SpreadsheetApp.getActiveSheet().clear();
    SpreadsheetApp.getActiveSpreadsheet().toast('Sheet cleared successfully', 'Success', 3);
  }
}

/**
 * Set up automatic data refresh (optional)
 * Run this once to set up daily auto-refresh at 9 AM IST
 */
function setupDailyTrigger() {
  // Delete existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'fetchAllIPOs') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new trigger for 9 AM daily
  ScriptApp.newTrigger('fetchAllIPOs')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();

  SpreadsheetApp.getUi().alert('Daily auto-refresh has been set up for 9 AM');
}

/**
 * Remove automatic triggers
 */
function removeDailyTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'fetchAllIPOs') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  SpreadsheetApp.getUi().alert('Daily auto-refresh has been removed');
}

/**
 * Clear all cached data to force fresh fetch from NSE
 */
function clearCache() {
  const cache = CacheService.getScriptCache();
  const keys = [
    'nse_ipo_data_all',
    'nse_ipo_data_past',
    'nse_ipo_data_current',
    'nse_ipo_data_upcoming',
    'nse_all_indices'
  ];
  cache.removeAll(keys);

  // Note: Stock index cache keys are dynamic (nse_stocks_[INDEX_NAME])
  // They will expire after 30 minutes automatically

  SpreadsheetApp.getUi().alert('Cache cleared successfully! Next fetch will get fresh data from NSE.');
  Logger.log('Cache cleared for all categories');
}

/**
 * DEBUG FUNCTION: Test NSE API response
 * Run this function from Apps Script editor to see what data NSE is returning
 */
function testNSEAPIResponse() {
  try {
    Logger.log('=== Testing NSE API Response ===');

    const data = fetchNSEData('all');

    Logger.log('\n--- Full Response Structure ---');
    Logger.log('Response keys: ' + Object.keys(data).join(', '));
    Logger.log('Full response: ' + JSON.stringify(data, null, 2));

    Logger.log('\n--- Active IPOs ---');
    Logger.log('activeIpo exists: ' + (data.activeIpo !== undefined));
    Logger.log('activeIpo length: ' + (data.activeIpo ? data.activeIpo.length : 0));
    if (data.activeIpo && data.activeIpo.length > 0) {
      Logger.log('First active IPO: ' + JSON.stringify(data.activeIpo[0], null, 2));
    }

    Logger.log('\n--- Closed IPOs ---');
    Logger.log('closedIpo exists: ' + (data.closedIpo !== undefined));
    Logger.log('closedIpo length: ' + (data.closedIpo ? data.closedIpo.length : 0));
    if (data.closedIpo && data.closedIpo.length > 0) {
      Logger.log('First closed IPO: ' + JSON.stringify(data.closedIpo[0], null, 2));
    }

    Logger.log('\n--- Upcoming IPOs ---');
    Logger.log('upcomingIpo exists: ' + (data.upcomingIpo !== undefined));
    Logger.log('upcomingIpo length: ' + (data.upcomingIpo ? data.upcomingIpo.length : 0));
    if (data.upcomingIpo && data.upcomingIpo.length > 0) {
      Logger.log('First upcoming IPO: ' + JSON.stringify(data.upcomingIpo[0], null, 2));
    }

    SpreadsheetApp.getUi().alert(
      'Test Complete',
      'Check the execution log (View > Logs) to see the full API response structure.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch (error) {
    Logger.log('ERROR in testNSEAPIResponse: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

// ============================================================================
// STOCK MARKET DATA FUNCTIONS
// ============================================================================

/**
 * Fetches all indices from NSE India
 * @return {Object} JSON data containing all indices information
 */
function fetchAllIndices() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'nse_all_indices';

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    Logger.log('Using cached indices data');
    return JSON.parse(cachedData);
  }

  try {
    // First, visit the main page to get cookies
    const mainPageOptions = {
      'method': 'get',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      'muteHttpExceptions': true,
      'followRedirects': true
    };

    UrlFetchApp.fetch(NSE_MAIN_URL, mainPageOptions);

    // Now fetch the indices data
    const apiOptions = {
      'method': 'get',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.nseindia.com/market-data/live-equity-market',
        'X-Requested-With': 'XMLHttpRequest'
      },
      'muteHttpExceptions': true,
      'followRedirects': true
    };

    const response = UrlFetchApp.fetch(NSE_ALL_INDICES_URL, apiOptions);
    const responseCode = response.getResponseCode();

    Logger.log('NSE All Indices API response code: ' + responseCode);

    if (responseCode !== 200) {
      throw new Error(`NSE API returned status code: ${responseCode}`);
    }

    const responseText = response.getContentText();
    const jsonData = JSON.parse(responseText);

    // Cache the data
    cache.put(cacheKey, JSON.stringify(jsonData), CACHE_DURATION_MINUTES * 60);

    return jsonData;

  } catch (error) {
    Logger.log('Error fetching NSE indices: ' + error.toString());
    throw error;
  }
}

/**
 * Fetches stocks for a specific index
 * @param {string} indexName - Name of the index (e.g., 'NIFTY 50', 'NIFTY BANK')
 * @return {Object} JSON data containing stocks in the index
 */
function fetchStocksByIndex(indexName) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `nse_stocks_${indexName}`;

  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    Logger.log('Using cached data for index: ' + indexName);
    return JSON.parse(cachedData);
  }

  try {
    // First, visit the main page to get cookies
    const mainPageOptions = {
      'method': 'get',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      'muteHttpExceptions': true,
      'followRedirects': true
    };

    UrlFetchApp.fetch(NSE_MAIN_URL, mainPageOptions);

    // Now fetch the stocks data for the index
    const url = `${NSE_EQUITY_STOCKS_URL}?index=${encodeURIComponent(indexName)}`;

    const apiOptions = {
      'method': 'get',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.nseindia.com/market-data/live-equity-market',
        'X-Requested-With': 'XMLHttpRequest'
      },
      'muteHttpExceptions': true,
      'followRedirects': true
    };

    const response = UrlFetchApp.fetch(url, apiOptions);
    const responseCode = response.getResponseCode();

    Logger.log(`NSE Stocks API response code for ${indexName}: ${responseCode}`);

    if (responseCode !== 200) {
      throw new Error(`NSE API returned status code: ${responseCode} for index: ${indexName}`);
    }

    const responseText = response.getContentText();
    const jsonData = JSON.parse(responseText);

    // Cache the data
    cache.put(cacheKey, JSON.stringify(jsonData), CACHE_DURATION_MINUTES * 60);

    return jsonData;

  } catch (error) {
    Logger.log(`Error fetching stocks for index ${indexName}: ` + error.toString());
    throw error;
  }
}

/**
 * Parses stock data into a 2D array for Google Sheets
 * @param {Array} stocksArray - Array of stock objects
 * @param {string} indexOrSector - Index or sector name (optional)
 * @return {Array} 2D array formatted for Google Sheets
 */
function parseStockData(stocksArray, indexOrSector = '') {
  if (!stocksArray || stocksArray.length === 0) {
    return [['No data available']];
  }

  // Header row
  const headers = [
    'Symbol',
    'Company Name',
    'Last Price',
    'Change',
    '% Change',
    'Open',
    'High',
    'Low',
    'Previous Close',
    'Year High',
    'Year Low',
    'Index/Sector'
  ];

  const rows = [headers];

  // Parse each stock
  stocksArray.forEach(stock => {
    const row = [
      stock.symbol || '',
      stock.meta?.companyName || stock.companyName || '',
      stock.lastPrice || stock.last || '',
      stock.change || '',
      stock.pChange || '',
      stock.open || '',
      stock.dayHigh || stock.high || '',
      stock.dayLow || stock.low || '',
      stock.previousClose || stock.prevClose || '',
      stock.yearHigh || '',
      stock.yearLow || '',
      indexOrSector
    ];
    rows.push(row);
  });

  return rows;
}

/**
 * Fetches and displays all indices list
 */
function fetchAllIndicesList() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Fetching all indices from NSE India...', 'Please Wait', -1);

    const data = fetchAllIndices();

    // Parse indices data
    const indicesData = data.data || [];

    const headers = [
      'Index Name',
      'Last Price',
      'Change',
      '% Change',
      'Open',
      'High',
      'Low',
      'Previous Close',
      'Year High',
      'Year Low'
    ];

    const rows = [headers];

    indicesData.forEach(index => {
      const row = [
        index.index || index.indexSymbol || '',
        index.last || '',
        index.change || '',
        index.pChange || index.percentChange || '',
        index.open || '',
        index.high || '',
        index.low || '',
        index.previousClose || '',
        index.yearHigh || '',
        index.yearLow || ''
      ];
      rows.push(row);
    });

    writeToSheet(rows, 'All Indices');

    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Successfully fetched ${indicesData.length} indices`,
      'Success',
      5
    );

  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Error: ' + error.toString(), 'Failed', 5);
    Logger.log('Error in fetchAllIndicesList: ' + error.toString());
  }
}

/**
 * Fetches stocks organized by index
 */
function fetchAllStocksIndexWise() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Fetching stock data from NSE India...', 'Please Wait', -1);

    // Major indices to fetch
    const indices = [
      'NIFTY 50',
      'NIFTY BANK',
      'NIFTY IT',
      'NIFTY AUTO',
      'NIFTY PHARMA',
      'NIFTY FMCG',
      'NIFTY METAL',
      'NIFTY REALTY',
      'NIFTY ENERGY',
      'NIFTY MIDCAP 50',
      'NIFTY SMALLCAP 50',
      'NIFTY 100',
      'NIFTY 200',
      'NIFTY 500'
    ];

    let allStocks = [];
    let successCount = 0;

    indices.forEach(indexName => {
      try {
        SpreadsheetApp.getActiveSpreadsheet().toast(`Fetching ${indexName}...`, 'Please Wait', -1);

        const data = fetchStocksByIndex(indexName);
        const stocks = data.data || [];

        // Add index name to each stock
        stocks.forEach(stock => {
          const stockWithIndex = parseStockData([stock], indexName);
          if (stockWithIndex.length > 1) {
            allStocks.push(stockWithIndex[1]); // Skip header
          }
        });

        successCount++;
        Logger.log(`Successfully fetched ${stocks.length} stocks for ${indexName}`);

        // Add a small delay to avoid rate limiting
        Utilities.sleep(1000);

      } catch (error) {
        Logger.log(`Error fetching ${indexName}: ${error.toString()}`);
      }
    });

    if (allStocks.length > 0) {
      // Add header
      const headers = [
        'Symbol',
        'Company Name',
        'Last Price',
        'Change',
        '% Change',
        'Open',
        'High',
        'Low',
        'Previous Close',
        'Year High',
        'Year Low',
        'Index'
      ];

      const finalData = [headers, ...allStocks];
      writeToSheet(finalData, 'Stocks by Index');

      SpreadsheetApp.getActiveSpreadsheet().toast(
        `Successfully fetched stocks from ${successCount} indices. Total: ${allStocks.length} stocks`,
        'Success',
        5
      );
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast('No stock data retrieved', 'Warning', 5);
    }

  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Error: ' + error.toString(), 'Failed', 5);
    Logger.log('Error in fetchAllStocksIndexWise: ' + error.toString());
  }
}

/**
 * Fetches stocks organized by sector
 */
function fetchAllStocksSectorWise() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('Fetching sector-wise stock data from NSE India...', 'Please Wait', -1);

    // Sector indices
    const sectors = [
      'NIFTY BANK',
      'NIFTY IT',
      'NIFTY AUTO',
      'NIFTY PHARMA',
      'NIFTY FMCG',
      'NIFTY METAL',
      'NIFTY REALTY',
      'NIFTY ENERGY',
      'NIFTY FINANCIAL SERVICES',
      'NIFTY MEDIA',
      'NIFTY PSU BANK',
      'NIFTY PRIVATE BANK',
      'NIFTY HEALTHCARE INDEX',
      'NIFTY CONSUMER DURABLES',
      'NIFTY OIL & GAS'
    ];

    let allStocks = [];
    let successCount = 0;

    sectors.forEach(sector => {
      try {
        SpreadsheetApp.getActiveSpreadsheet().toast(`Fetching ${sector}...`, 'Please Wait', -1);

        const data = fetchStocksByIndex(sector);
        const stocks = data.data || [];

        // Add sector name to each stock
        stocks.forEach(stock => {
          const stockWithSector = parseStockData([stock], sector);
          if (stockWithSector.length > 1) {
            allStocks.push(stockWithSector[1]); // Skip header
          }
        });

        successCount++;
        Logger.log(`Successfully fetched ${stocks.length} stocks for ${sector}`);

        // Add a small delay to avoid rate limiting
        Utilities.sleep(1000);

      } catch (error) {
        Logger.log(`Error fetching ${sector}: ${error.toString()}`);
      }
    });

    if (allStocks.length > 0) {
      // Add header
      const headers = [
        'Symbol',
        'Company Name',
        'Last Price',
        'Change',
        '% Change',
        'Open',
        'High',
        'Low',
        'Previous Close',
        'Year High',
        'Year Low',
        'Sector'
      ];

      const finalData = [headers, ...allStocks];
      writeToSheet(finalData, 'Stocks by Sector');

      SpreadsheetApp.getActiveSpreadsheet().toast(
        `Successfully fetched stocks from ${successCount} sectors. Total: ${allStocks.length} stocks`,
        'Success',
        5
      );
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast('No stock data retrieved', 'Warning', 5);
    }

  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Error: ' + error.toString(), 'Failed', 5);
    Logger.log('Error in fetchAllStocksSectorWise: ' + error.toString());
  }
}

/**
 * Prompts user to enter an index name and fetches stocks for that index
 */
function fetchStocksByIndexPrompt() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.prompt(
    'Fetch Stocks by Index',
    'Enter the index name (e.g., NIFTY 50, NIFTY BANK, NIFTY IT):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const indexName = response.getResponseText().trim().toUpperCase();

    if (indexName) {
      try {
        SpreadsheetApp.getActiveSpreadsheet().toast(`Fetching stocks for ${indexName}...`, 'Please Wait', -1);

        const data = fetchStocksByIndex(indexName);
        const stocks = data.data || [];

        if (stocks.length > 0) {
          const parsedData = parseStockData(stocks, indexName);
          writeToSheet(parsedData, indexName);

          SpreadsheetApp.getActiveSpreadsheet().toast(
            `Successfully fetched ${stocks.length} stocks for ${indexName}`,
            'Success',
            5
          );
        } else {
          SpreadsheetApp.getActiveSpreadsheet().toast(
            `No stocks found for ${indexName}. Please check the index name.`,
            'Warning',
            5
          );
        }

      } catch (error) {
        SpreadsheetApp.getActiveSpreadsheet().toast('Error: ' + error.toString(), 'Failed', 5);
        Logger.log('Error in fetchStocksByIndexPrompt: ' + error.toString());
      }
    }
  }
}
