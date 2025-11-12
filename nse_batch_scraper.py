#!/usr/bin/env python3
"""
NSE Batch Stock Data Scraper
Automatically fetches all NSE data and exports to multiple formats

Usage:
    python nse_batch_scraper.py [options]

Options:
    --indices-only    Fetch only indices data
    --stocks-only     Fetch only stocks data
    --sector          Fetch sector-wise data (default: index-wise)
    --output-dir DIR  Output directory (default: output)
    --format FORMAT   Export format: csv, excel, json, all (default: all)

Author: NSE-Scrap Project
Version: 1.2.0
"""

import argparse
import sys
from datetime import datetime
from nse_scraper import NSEScraper


def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description='NSE Batch Stock Data Scraper',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        '--indices-only',
        action='store_true',
        help='Fetch only indices data'
    )

    parser.add_argument(
        '--stocks-only',
        action='store_true',
        help='Fetch only stocks data'
    )

    parser.add_argument(
        '--sector',
        action='store_true',
        help='Fetch sector-wise data instead of index-wise'
    )

    parser.add_argument(
        '--output-dir',
        type=str,
        default='output',
        help='Output directory (default: output)'
    )

    parser.add_argument(
        '--format',
        type=str,
        choices=['csv', 'excel', 'json', 'all'],
        default='all',
        help='Export format (default: all)'
    )

    return parser.parse_args()


def export_data(scraper, df, filename, output_dir, export_format):
    """
    Export data in specified format(s)

    Args:
        scraper: NSEScraper instance
        df: DataFrame to export
        filename: Base filename
        output_dir: Output directory
        export_format: Format to export (csv, excel, json, all)
    """
    if df.empty:
        print(f"⚠ No data to export for {filename}")
        return

    if export_format in ['csv', 'all']:
        scraper.export_to_csv(df, filename, output_dir)

    if export_format in ['excel', 'all']:
        scraper.export_to_excel(df, filename, output_dir)

    if export_format in ['json', 'all']:
        scraper.export_to_json(df, filename, output_dir)


def main():
    """Main execution function"""
    args = parse_arguments()

    print("=" * 70)
    print("NSE Batch Stock Data Scraper")
    print("=" * 70)
    print(f"Output Directory: {args.output_dir}")
    print(f"Export Format: {args.format}")
    print("=" * 70)
    print()

    # Initialize scraper
    try:
        scraper = NSEScraper()
    except Exception as e:
        print(f"Failed to initialize scraper: {e}")
        sys.exit(1)

    # Get timestamp for filenames
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Fetch indices data
    if not args.stocks_only:
        print("\n📊 Fetching All Indices Data...")
        print("-" * 70)
        indices_df = scraper.get_all_indices()

        if not indices_df.empty:
            print(f"✓ Fetched {len(indices_df)} indices")
            filename = f"nse_indices_{timestamp}"
            export_data(scraper, indices_df, filename, args.output_dir, args.format)
        else:
            print("⚠ No indices data available")

    # Fetch stocks data
    if not args.indices_only:
        if args.sector:
            print("\n📈 Fetching Stocks Data (Sector-wise)...")
            print("-" * 70)
            stocks_df = scraper.fetch_all_stocks_by_sectors()
            file_suffix = "by_sector"
        else:
            print("\n📈 Fetching Stocks Data (Index-wise)...")
            print("-" * 70)
            stocks_df = scraper.fetch_all_stocks_by_indices()
            file_suffix = "by_index"

        if not stocks_df.empty:
            print(f"✓ Fetched {len(stocks_df)} stock entries")
            if 'symbol' in stocks_df.columns:
                print(f"✓ Unique stocks: {stocks_df['symbol'].nunique()}")

            filename = f"nse_stocks_{file_suffix}_{timestamp}"
            export_data(scraper, stocks_df, filename, args.output_dir, args.format)
        else:
            print("⚠ No stocks data available")

    print("\n" + "=" * 70)
    print("✓ Batch scraping completed successfully!")
    print("=" * 70)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Interrupted by user. Exiting...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
