/**
 * NSE India IPO Data Fetcher for Google Sheets
 *
 * This script fetches IPO data from NSE India's website and populates
 * it into your Google Sheet, with filtering and sorting capabilities.
 *
 * Author: Claude Code
 * Last Updated: 2025-11-07
 */

// Configuration Constants
const NSE_IPO_URL = 'https://www.nseindia.com/api/ipo-detail';
const NSE_MAIN_URL = 'https://www.nseindia.com';
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
    .addItem('Clear Data', 'clearSheet')
    .addItem('About', 'showAbout')
    .addToUi();
}

/**
 * Show information about the script
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'NSE IPO Automation',
    'This script automatically fetches IPO data from NSE India.\n\n' +
    'Features:\n' +
    '• Fetch Current, Past, and Upcoming IPOs\n' +
    '• Auto-sort by Security Type\n' +
    '• Handles NSE anti-scraping measures\n' +
    '• Caches data to minimize requests\n\n' +
    'Version: 1.0.0',
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

    if (responseCode !== 200) {
      throw new Error(`NSE API returned status code: ${responseCode}`);
    }

    const jsonData = JSON.parse(response.getContentText());

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
  if (!ipoArray || ipoArray.length === 0) {
    return [['No data available']];
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
      ipo.companyName || '',
      ipo.securityType || '',
      ipo.issueType || '',
      ipo.issuePrice || '',
      ipo.issueSize || '',
      ipo.issueStartDate || '',
      ipo.issueEndDate || '',
      ipo.allotmentDate || '',
      ipo.listingDate || '',
      ipo.status || '',
      ipo.symbol || ''
    ];
    rows.push(row);
  });

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
    const allIPOs = [
      ...(data.activeIpo || []),
      ...(data.closedIpo || []),
      ...(data.upcomingIpo || [])
    ];

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
