#!/usr/bin/env python3
"""
NSE Stock Data Scraper for Google Colab → Google Sheets
Fetches NSE data and automatically uploads to Google Sheets

Usage:
1. Open this in Google Colab
2. Run all cells
3. Authenticate with Google when prompted
4. Data will be automatically uploaded to your Google Sheet

Author: NSE-Scrap Project
Version: 1.2.0
"""

# ============================================================================
# INSTALLATION (Run this cell first in Colab)
# ============================================================================
"""
!pip install -q nse-python gspread google-auth google-auth-oauthlib google-auth-httplib2 pandas tqdm
"""

# ============================================================================
# IMPORTS
# ============================================================================
import pandas as pd
from datetime import datetime
from tqdm.notebook import tqdm
import sys

try:
    from nse import NSE
    from google.colab import auth
    import gspread
    from google.auth import default
except ImportError as e:
    print("Error importing libraries. Please run the installation cell first:")
    print("!pip install -q nse-python gspread google-auth google-auth-oauthlib google-auth-httplib2 pandas tqdm")
    sys.exit(1)


# ============================================================================
# CONFIGURATION
# ============================================================================
class Config:
    """Configuration for NSE Scraper"""

    # Your Google Sheet details
    SHEET_NAME = "NSE Stock Data"  # Change this to your Google Sheet name

    # Major NSE Indices
    MAJOR_INDICES = [
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
        'NIFTY 500',
    ]

    # Sector Indices
    SECTOR_INDICES = [
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
        'NIFTY OIL & GAS',
    ]


# ============================================================================
# NSE DATA SCRAPER
# ============================================================================
class NSEColab:
    """NSE Stock Data Scraper for Google Colab"""

    def __init__(self):
        """Initialize NSE Scraper"""
        print("🔄 Initializing NSE Scraper...")
        try:
            self.nse = NSE()
            print("✅ NSE Scraper initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize NSE: {e}")
            raise

    def get_all_indices(self):
        """Fetch all NSE indices data"""
        try:
            print("📊 Fetching all indices data...")
            indices_data = self.nse.get_indices()

            if not indices_data:
                print("⚠️ No indices data received")
                return pd.DataFrame()

            df = pd.DataFrame(indices_data)
            print(f"✅ Successfully fetched {len(df)} indices")
            return df

        except Exception as e:
            print(f"❌ Error fetching indices: {e}")
            return pd.DataFrame()

    def get_index_stocks(self, index_name):
        """Fetch stocks for a specific index"""
        try:
            stocks_data = self.nse.get_index_stocks(index_name)

            if not stocks_data:
                return pd.DataFrame()

            df = pd.DataFrame(stocks_data)
            df['Index'] = index_name
            return df

        except Exception as e:
            print(f"❌ Error fetching {index_name}: {e}")
            return pd.DataFrame()

    def fetch_all_stocks_by_indices(self, indices=None):
        """Fetch stocks from multiple indices"""
        if indices is None:
            indices = Config.MAJOR_INDICES

        all_stocks = []

        print(f"📈 Fetching stocks from {len(indices)} indices...")

        for index_name in tqdm(indices, desc="Fetching indices"):
            df = self.get_index_stocks(index_name)
            if not df.empty:
                all_stocks.append(df)

        if not all_stocks:
            print("⚠️ No stock data collected")
            return pd.DataFrame()

        combined_df = pd.concat(all_stocks, ignore_index=True)
        print(f"✅ Total stocks fetched: {len(combined_df)}")

        return combined_df

    def fetch_all_stocks_by_sectors(self):
        """Fetch stocks organized by sectors"""
        all_stocks = []

        print(f"🏭 Fetching stocks from {len(Config.SECTOR_INDICES)} sectors...")

        for sector in tqdm(Config.SECTOR_INDICES, desc="Fetching sectors"):
            df = self.get_index_stocks(sector)
            if not df.empty:
                df['Sector'] = sector
                all_stocks.append(df)

        if not all_stocks:
            print("⚠️ No sector data collected")
            return pd.DataFrame()

        combined_df = pd.concat(all_stocks, ignore_index=True)
        print(f"✅ Total stocks fetched from sectors: {len(combined_df)}")

        return combined_df


# ============================================================================
# GOOGLE SHEETS INTEGRATION
# ============================================================================
class GoogleSheetsUploader:
    """Upload data to Google Sheets"""

    def __init__(self, sheet_name=None):
        """Initialize Google Sheets connection"""
        print("🔐 Authenticating with Google...")

        # Authenticate
        auth.authenticate_user()
        creds, _ = default()

        # Initialize gspread
        self.gc = gspread.authorize(creds)

        # Get or create spreadsheet
        self.sheet_name = sheet_name or Config.SHEET_NAME

        try:
            self.spreadsheet = self.gc.open(self.sheet_name)
            print(f"✅ Connected to existing sheet: {self.sheet_name}")
        except gspread.SpreadsheetNotFound:
            print(f"📄 Creating new spreadsheet: {self.sheet_name}")
            self.spreadsheet = self.gc.create(self.sheet_name)
            # Share with yourself
            print(f"✅ Created new sheet: {self.sheet_name}")

        print(f"🔗 Sheet URL: {self.spreadsheet.url}")

    def upload_dataframe(self, df, worksheet_name, clear_existing=True):
        """
        Upload DataFrame to a worksheet

        Args:
            df: pandas DataFrame to upload
            worksheet_name: Name of the worksheet
            clear_existing: Clear existing data before uploading
        """
        if df.empty:
            print(f"⚠️ No data to upload for {worksheet_name}")
            return

        try:
            # Get or create worksheet
            try:
                worksheet = self.spreadsheet.worksheet(worksheet_name)
                if clear_existing:
                    worksheet.clear()
            except gspread.WorksheetNotFound:
                worksheet = self.spreadsheet.add_worksheet(
                    title=worksheet_name,
                    rows=len(df) + 100,
                    cols=len(df.columns) + 5
                )

            # Convert DataFrame to list of lists
            data = [df.columns.tolist()] + df.values.tolist()

            # Upload data
            worksheet.update('A1', data)

            # Format header row
            worksheet.format('A1:Z1', {
                'backgroundColor': {'red': 0.26, 'green': 0.52, 'blue': 0.96},
                'textFormat': {'bold': True, 'foregroundColor': {'red': 1, 'green': 1, 'blue': 1}},
                'horizontalAlignment': 'CENTER'
            })

            # Freeze header row
            worksheet.freeze(rows=1)

            print(f"✅ Uploaded {len(df)} rows to '{worksheet_name}'")

        except Exception as e:
            print(f"❌ Error uploading to {worksheet_name}: {e}")

    def get_sheet_url(self):
        """Get the URL of the Google Sheet"""
        return self.spreadsheet.url


# ============================================================================
# MAIN EXECUTION FUNCTIONS
# ============================================================================
def fetch_and_upload_indices():
    """Fetch all indices and upload to Google Sheets"""
    print("\n" + "="*70)
    print("FETCHING NSE INDICES")
    print("="*70 + "\n")

    # Initialize scraper
    scraper = NSEColab()

    # Fetch indices
    indices_df = scraper.get_all_indices()

    if indices_df.empty:
        print("❌ No indices data to upload")
        return None

    # Upload to Google Sheets
    print("\n📤 Uploading to Google Sheets...")
    uploader = GoogleSheetsUploader()
    uploader.upload_dataframe(indices_df, "All Indices")

    print("\n✅ Done! Check your Google Sheet:")
    print(f"🔗 {uploader.get_sheet_url()}")

    return indices_df


def fetch_and_upload_stocks_by_index():
    """Fetch stocks by index and upload to Google Sheets"""
    print("\n" + "="*70)
    print("FETCHING STOCKS BY INDEX")
    print("="*70 + "\n")

    # Initialize scraper
    scraper = NSEColab()

    # Fetch stocks
    stocks_df = scraper.fetch_all_stocks_by_indices()

    if stocks_df.empty:
        print("❌ No stocks data to upload")
        return None

    # Upload to Google Sheets
    print("\n📤 Uploading to Google Sheets...")
    uploader = GoogleSheetsUploader()
    uploader.upload_dataframe(stocks_df, "Stocks by Index")

    print("\n✅ Done! Check your Google Sheet:")
    print(f"🔗 {uploader.get_sheet_url()}")

    return stocks_df


def fetch_and_upload_stocks_by_sector():
    """Fetch stocks by sector and upload to Google Sheets"""
    print("\n" + "="*70)
    print("FETCHING STOCKS BY SECTOR")
    print("="*70 + "\n")

    # Initialize scraper
    scraper = NSEColab()

    # Fetch stocks
    stocks_df = scraper.fetch_all_stocks_by_sectors()

    if stocks_df.empty:
        print("❌ No stocks data to upload")
        return None

    # Upload to Google Sheets
    print("\n📤 Uploading to Google Sheets...")
    uploader = GoogleSheetsUploader()
    uploader.upload_dataframe(stocks_df, "Stocks by Sector")

    print("\n✅ Done! Check your Google Sheet:")
    print(f"🔗 {uploader.get_sheet_url()}")

    return stocks_df


def fetch_and_upload_all():
    """Fetch everything and upload to Google Sheets"""
    print("\n" + "="*70)
    print("FETCHING ALL NSE DATA")
    print("="*70 + "\n")

    # Initialize
    scraper = NSEColab()
    uploader = GoogleSheetsUploader()

    # Fetch all data
    print("\n1️⃣ Fetching Indices...")
    indices_df = scraper.get_all_indices()
    if not indices_df.empty:
        uploader.upload_dataframe(indices_df, "All Indices")

    print("\n2️⃣ Fetching Stocks by Index...")
    stocks_index_df = scraper.fetch_all_stocks_by_indices()
    if not stocks_index_df.empty:
        uploader.upload_dataframe(stocks_index_df, "Stocks by Index")

    print("\n3️⃣ Fetching Stocks by Sector...")
    stocks_sector_df = scraper.fetch_all_stocks_by_sectors()
    if not stocks_sector_df.empty:
        uploader.upload_dataframe(stocks_sector_df, "Stocks by Sector")

    print("\n" + "="*70)
    print("✅ ALL DATA UPLOADED SUCCESSFULLY!")
    print("="*70)
    print(f"\n🔗 Open your Google Sheet: {uploader.get_sheet_url()}")


# ============================================================================
# INTERACTIVE MENU (For Colab)
# ============================================================================
def show_menu():
    """Display interactive menu"""
    print("\n" + "="*70)
    print("NSE STOCK DATA SCRAPER - GOOGLE COLAB TO SHEETS")
    print("="*70)
    print("\nSelect an option:")
    print("1. Fetch All Indices")
    print("2. Fetch Stocks by Index")
    print("3. Fetch Stocks by Sector")
    print("4. Fetch Everything (All Data)")
    print("\n" + "="*70)


# ============================================================================
# MAIN EXECUTION
# ============================================================================
if __name__ == "__main__":
    # This runs when executed as a script
    # In Colab, call the functions directly from cells

    print("""
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║     NSE STOCK DATA SCRAPER - GOOGLE COLAB → GOOGLE SHEETS          ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

INSTRUCTIONS:
1. This script fetches NSE stock data and uploads to Google Sheets
2. You will be prompted to authenticate with Google
3. Data will be automatically uploaded to your Google Sheet

USAGE IN GOOGLE COLAB:
Run one of these functions:
  - fetch_and_upload_indices()         # Fetch only indices
  - fetch_and_upload_stocks_by_index() # Fetch stocks by index
  - fetch_and_upload_stocks_by_sector()# Fetch stocks by sector
  - fetch_and_upload_all()             # Fetch everything

Example:
  fetch_and_upload_all()
    """)
