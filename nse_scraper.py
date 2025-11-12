#!/usr/bin/env python3
"""
NSE Stock Data Scraper
Fetches stock market data from NSE India using nse-python library
Exports data to CSV, Excel, and optionally to Google Sheets

Features:
- Fetch stocks by index (NIFTY 50, NIFTY BANK, etc.)
- Fetch stocks by sector
- Get all indices data
- Export to multiple formats
- Real-time market data

Author: NSE-Scrap Project
Version: 1.2.0
"""

import os
import sys
import json
import logging
from datetime import datetime
from typing import List, Dict, Optional
import pandas as pd
from tqdm import tqdm

try:
    from nse import NSE
except ImportError:
    print("ERROR: nse-python library not installed!")
    print("Install it using: pip install nse-python")
    sys.exit(1)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('nse_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class NSEScraper:
    """NSE Stock Data Scraper using nse-python library"""

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

    def __init__(self):
        """Initialize NSE Scraper"""
        try:
            self.nse = NSE()
            logger.info("NSE Scraper initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize NSE: {e}")
            raise

    def get_all_indices(self) -> pd.DataFrame:
        """
        Fetch all NSE indices data

        Returns:
            pd.DataFrame: DataFrame with all indices data
        """
        try:
            logger.info("Fetching all indices data...")
            indices_data = self.nse.get_indices()

            if not indices_data:
                logger.warning("No indices data received")
                return pd.DataFrame()

            df = pd.DataFrame(indices_data)
            logger.info(f"Successfully fetched {len(df)} indices")
            return df

        except Exception as e:
            logger.error(f"Error fetching indices: {e}")
            return pd.DataFrame()

    def get_index_stocks(self, index_name: str) -> pd.DataFrame:
        """
        Fetch all stocks for a specific index

        Args:
            index_name: Name of the index (e.g., 'NIFTY 50')

        Returns:
            pd.DataFrame: DataFrame with stock data
        """
        try:
            logger.info(f"Fetching stocks for index: {index_name}")
            stocks_data = self.nse.get_index_stocks(index_name)

            if not stocks_data:
                logger.warning(f"No stocks data received for {index_name}")
                return pd.DataFrame()

            df = pd.DataFrame(stocks_data)
            df['Index'] = index_name
            logger.info(f"Successfully fetched {len(df)} stocks for {index_name}")
            return df

        except Exception as e:
            logger.error(f"Error fetching stocks for {index_name}: {e}")
            return pd.DataFrame()

    def get_stock_quote(self, symbol: str) -> Dict:
        """
        Get detailed quote for a specific stock

        Args:
            symbol: Stock symbol (e.g., 'RELIANCE')

        Returns:
            Dict: Stock quote data
        """
        try:
            logger.info(f"Fetching quote for: {symbol}")
            quote = self.nse.get_quote(symbol)
            return quote if quote else {}

        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {e}")
            return {}

    def fetch_all_stocks_by_indices(self, indices: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Fetch stocks from multiple indices

        Args:
            indices: List of index names (defaults to MAJOR_INDICES)

        Returns:
            pd.DataFrame: Combined DataFrame with all stocks
        """
        if indices is None:
            indices = self.MAJOR_INDICES

        all_stocks = []

        logger.info(f"Fetching stocks from {len(indices)} indices...")

        for index_name in tqdm(indices, desc="Fetching indices"):
            df = self.get_index_stocks(index_name)
            if not df.empty:
                all_stocks.append(df)

        if not all_stocks:
            logger.warning("No stock data collected")
            return pd.DataFrame()

        combined_df = pd.concat(all_stocks, ignore_index=True)
        logger.info(f"Total stocks fetched: {len(combined_df)}")

        return combined_df

    def fetch_all_stocks_by_sectors(self) -> pd.DataFrame:
        """
        Fetch stocks organized by sectors

        Returns:
            pd.DataFrame: DataFrame with stocks organized by sectors
        """
        all_stocks = []

        logger.info(f"Fetching stocks from {len(self.SECTOR_INDICES)} sectors...")

        for sector in tqdm(self.SECTOR_INDICES, desc="Fetching sectors"):
            df = self.get_index_stocks(sector)
            if not df.empty:
                df['Sector'] = sector
                all_stocks.append(df)

        if not all_stocks:
            logger.warning("No sector data collected")
            return pd.DataFrame()

        combined_df = pd.concat(all_stocks, ignore_index=True)
        logger.info(f"Total stocks fetched from sectors: {len(combined_df)}")

        return combined_df

    def export_to_csv(self, df: pd.DataFrame, filename: str, output_dir: str = 'output'):
        """
        Export DataFrame to CSV

        Args:
            df: DataFrame to export
            filename: Output filename (without extension)
            output_dir: Output directory path
        """
        try:
            os.makedirs(output_dir, exist_ok=True)
            filepath = os.path.join(output_dir, f"{filename}.csv")
            df.to_csv(filepath, index=False)
            logger.info(f"Data exported to CSV: {filepath}")
            print(f"✓ Saved: {filepath}")

        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")

    def export_to_excel(self, df: pd.DataFrame, filename: str, output_dir: str = 'output'):
        """
        Export DataFrame to Excel with formatting

        Args:
            df: DataFrame to export
            filename: Output filename (without extension)
            output_dir: Output directory path
        """
        try:
            os.makedirs(output_dir, exist_ok=True)
            filepath = os.path.join(output_dir, f"{filename}.xlsx")

            with pd.ExcelWriter(filepath, engine='xlsxwriter') as writer:
                df.to_excel(writer, sheet_name='Data', index=False)

                # Get workbook and worksheet objects
                workbook = writer.book
                worksheet = writer.sheets['Data']

                # Add header format
                header_format = workbook.add_format({
                    'bold': True,
                    'bg_color': '#4285F4',
                    'font_color': 'white',
                    'border': 1
                })

                # Write headers with formatting
                for col_num, value in enumerate(df.columns.values):
                    worksheet.write(0, col_num, value, header_format)

                # Auto-fit columns
                for i, col in enumerate(df.columns):
                    max_len = max(
                        df[col].astype(str).apply(len).max(),
                        len(str(col))
                    ) + 2
                    worksheet.set_column(i, i, max_len)

            logger.info(f"Data exported to Excel: {filepath}")
            print(f"✓ Saved: {filepath}")

        except Exception as e:
            logger.error(f"Error exporting to Excel: {e}")

    def export_to_json(self, df: pd.DataFrame, filename: str, output_dir: str = 'output'):
        """
        Export DataFrame to JSON

        Args:
            df: DataFrame to export
            filename: Output filename (without extension)
            output_dir: Output directory path
        """
        try:
            os.makedirs(output_dir, exist_ok=True)
            filepath = os.path.join(output_dir, f"{filename}.json")
            df.to_json(filepath, orient='records', indent=2)
            logger.info(f"Data exported to JSON: {filepath}")
            print(f"✓ Saved: {filepath}")

        except Exception as e:
            logger.error(f"Error exporting to JSON: {e}")


def main():
    """Main execution function"""
    print("=" * 70)
    print("NSE Stock Data Scraper")
    print("=" * 70)
    print()

    # Initialize scraper
    scraper = NSEScraper()

    # Get timestamp for filenames
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Menu
    print("Select an option:")
    print("1. Fetch All Indices")
    print("2. Fetch Stocks by Index")
    print("3. Fetch All Stocks (Index-wise)")
    print("4. Fetch All Stocks (Sector-wise)")
    print("5. Fetch Stock Quote")
    print("6. Exit")
    print()

    choice = input("Enter your choice (1-6): ").strip()

    if choice == '1':
        # Fetch all indices
        print("\nFetching all indices...")
        df = scraper.get_all_indices()

        if not df.empty:
            print(f"\nFetched {len(df)} indices")
            print("\nPreview:")
            print(df.head())

            filename = f"nse_indices_{timestamp}"
            scraper.export_to_csv(df, filename)
            scraper.export_to_excel(df, filename)
            scraper.export_to_json(df, filename)

    elif choice == '2':
        # Fetch stocks by specific index
        print("\nAvailable indices:")
        for i, idx in enumerate(scraper.MAJOR_INDICES, 1):
            print(f"{i}. {idx}")

        idx_choice = input("\nEnter index number or name: ").strip()

        try:
            if idx_choice.isdigit():
                index_name = scraper.MAJOR_INDICES[int(idx_choice) - 1]
            else:
                index_name = idx_choice.upper()

            df = scraper.get_index_stocks(index_name)

            if not df.empty:
                print(f"\nFetched {len(df)} stocks from {index_name}")
                print("\nPreview:")
                print(df.head())

                filename = f"nse_stocks_{index_name.replace(' ', '_')}_{timestamp}"
                scraper.export_to_csv(df, filename)
                scraper.export_to_excel(df, filename)
                scraper.export_to_json(df, filename)

        except Exception as e:
            print(f"Error: {e}")

    elif choice == '3':
        # Fetch all stocks index-wise
        print("\nFetching all stocks organized by indices...")
        df = scraper.fetch_all_stocks_by_indices()

        if not df.empty:
            print(f"\nTotal stocks fetched: {len(df)}")
            print(f"Unique stocks: {df['symbol'].nunique() if 'symbol' in df.columns else 'N/A'}")
            print("\nPreview:")
            print(df.head())

            filename = f"nse_stocks_by_index_{timestamp}"
            scraper.export_to_csv(df, filename)
            scraper.export_to_excel(df, filename)
            scraper.export_to_json(df, filename)

    elif choice == '4':
        # Fetch all stocks sector-wise
        print("\nFetching all stocks organized by sectors...")
        df = scraper.fetch_all_stocks_by_sectors()

        if not df.empty:
            print(f"\nTotal stocks fetched: {len(df)}")
            print(f"Unique stocks: {df['symbol'].nunique() if 'symbol' in df.columns else 'N/A'}")
            print("\nPreview:")
            print(df.head())

            filename = f"nse_stocks_by_sector_{timestamp}"
            scraper.export_to_csv(df, filename)
            scraper.export_to_excel(df, filename)
            scraper.export_to_json(df, filename)

    elif choice == '5':
        # Fetch stock quote
        symbol = input("\nEnter stock symbol (e.g., RELIANCE, TCS, INFY): ").strip().upper()

        quote = scraper.get_stock_quote(symbol)

        if quote:
            print(f"\nQuote for {symbol}:")
            print(json.dumps(quote, indent=2))

            # Save to file
            filename = f"nse_quote_{symbol}_{timestamp}"
            os.makedirs('output', exist_ok=True)
            filepath = os.path.join('output', f"{filename}.json")
            with open(filepath, 'w') as f:
                json.dump(quote, f, indent=2)
            print(f"\n✓ Saved: {filepath}")
        else:
            print(f"No data found for {symbol}")

    elif choice == '6':
        print("\nExiting...")
        sys.exit(0)

    else:
        print("Invalid choice!")

    print("\n" + "=" * 70)
    print("Done!")
    print("=" * 70)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user. Exiting...")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        print(f"\nError: {e}")
        sys.exit(1)
