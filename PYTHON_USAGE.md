# Python Scripts for NSE Data Scraping

This directory contains Python scripts for advanced NSE stock market data scraping using the `nse-python` library.

## Features

- **Modern NSE API**: Uses the `nse-python` library for reliable data access
- **Multiple Export Formats**: CSV, Excel (with formatting), and JSON
- **Batch Processing**: Fetch all data with a single command
- **Sector & Index Organization**: Get stocks organized by sectors or indices
- **Progress Tracking**: Visual progress bars for long operations
- **Logging**: Comprehensive logging for debugging and monitoring
- **Error Handling**: Robust error handling with detailed error messages

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or install specific packages:

```bash
pip install nse-python pandas openpyxl xlsxwriter tqdm
```

### 2. Verify Installation

```bash
python -c "from nse import NSE; print('NSE library installed successfully!')"
```

## Usage

### Interactive Mode

Run the main scraper in interactive mode:

```bash
python nse_scraper.py
```

You'll see a menu with options:
```
1. Fetch All Indices
2. Fetch Stocks by Index
3. Fetch All Stocks (Index-wise)
4. Fetch All Stocks (Sector-wise)
5. Fetch Stock Quote
6. Exit
```

### Batch Mode

Fetch all data automatically:

```bash
# Fetch everything (indices + stocks)
python nse_batch_scraper.py

# Fetch only indices
python nse_batch_scraper.py --indices-only

# Fetch only stocks
python nse_batch_scraper.py --stocks-only

# Fetch stocks organized by sector
python nse_batch_scraper.py --sector

# Export only to CSV
python nse_batch_scraper.py --format csv

# Export only to Excel
python nse_batch_scraper.py --format excel

# Custom output directory
python nse_batch_scraper.py --output-dir my_data
```

## Examples

### Example 1: Fetch All Indices

```bash
python nse_batch_scraper.py --indices-only
```

Output:
```
📊 Fetching All Indices Data...
✓ Fetched 50 indices
✓ Saved: output/nse_indices_20251112_143022.csv
✓ Saved: output/nse_indices_20251112_143022.xlsx
✓ Saved: output/nse_indices_20251112_143022.json
```

### Example 2: Fetch All Stocks by Index

```bash
python nse_batch_scraper.py --stocks-only
```

Output:
```
📈 Fetching Stocks Data (Index-wise)...
Fetching indices: 100%|████████████| 14/14 [00:42<00:00]
✓ Fetched 1547 stock entries
✓ Unique stocks: 823
✓ Saved: output/nse_stocks_by_index_20251112_143122.csv
✓ Saved: output/nse_stocks_by_index_20251112_143122.xlsx
✓ Saved: output/nse_stocks_by_index_20251112_143122.json
```

### Example 3: Fetch Stocks by Sector

```bash
python nse_batch_scraper.py --stocks-only --sector
```

### Example 4: Use as Python Library

```python
from nse_scraper import NSEScraper

# Initialize scraper
scraper = NSEScraper()

# Get all indices
indices_df = scraper.get_all_indices()
print(indices_df.head())

# Get stocks from NIFTY 50
nifty50_df = scraper.get_index_stocks('NIFTY 50')
print(nifty50_df.head())

# Get all stocks organized by indices
all_stocks_df = scraper.fetch_all_stocks_by_indices()

# Export to Excel
scraper.export_to_excel(all_stocks_df, 'my_stocks')
```

## Available Indices

### Major Indices
- NIFTY 50
- NIFTY 100
- NIFTY 200
- NIFTY 500
- NIFTY MIDCAP 50
- NIFTY SMALLCAP 50

### Sector Indices
- NIFTY BANK
- NIFTY IT
- NIFTY AUTO
- NIFTY PHARMA
- NIFTY FMCG
- NIFTY METAL
- NIFTY REALTY
- NIFTY ENERGY
- NIFTY FINANCIAL SERVICES
- NIFTY MEDIA
- NIFTY PSU BANK
- NIFTY PRIVATE BANK
- NIFTY HEALTHCARE INDEX
- NIFTY CONSUMER DURABLES
- NIFTY OIL & GAS

## Data Columns

### Stock Data Columns
- **symbol**: Stock symbol/ticker
- **companyName**: Full company name
- **lastPrice**: Current/Last traded price
- **change**: Absolute price change
- **pChange**: Percentage price change
- **open**: Opening price
- **dayHigh**: Day's high price
- **dayLow**: Day's low price
- **previousClose**: Previous day's closing price
- **yearHigh**: 52-week high
- **yearLow**: 52-week low
- **Index/Sector**: Associated index or sector

### Indices Data Columns
- **index**: Index name
- **last**: Last traded value
- **change**: Absolute change
- **pChange**: Percentage change
- **open**: Opening value
- **high**: Day's high
- **low**: Day's low
- **previousClose**: Previous close
- **yearHigh**: Year high
- **yearLow**: Year low

## Output Files

All output files are saved in the `output/` directory (configurable) with timestamps:

```
output/
├── nse_indices_20251112_143022.csv
├── nse_indices_20251112_143022.xlsx
├── nse_indices_20251112_143022.json
├── nse_stocks_by_index_20251112_143122.csv
├── nse_stocks_by_index_20251112_143122.xlsx
└── nse_stocks_by_index_20251112_143122.json
```

## Excel Features

Excel exports include:
- **Formatted headers** (blue background, white text, bold)
- **Auto-sized columns** for better readability
- **Borders** on all cells
- **Professional appearance** ready for presentations

## Logging

All operations are logged to `nse_scraper.log`:

```
2025-11-12 14:30:22 - INFO - NSE Scraper initialized successfully
2025-11-12 14:30:23 - INFO - Fetching stocks for index: NIFTY 50
2025-11-12 14:30:25 - INFO - Successfully fetched 50 stocks for NIFTY 50
2025-11-12 14:30:25 - INFO - Data exported to CSV: output/nse_stocks_NIFTY_50_20251112_143022.csv
```

## Troubleshooting

### Import Error: nse-python not found

```bash
pip install nse-python
```

### Network Errors

The NSE API may be temporarily unavailable or rate-limited. Try:
1. Wait a few minutes and retry
2. Check your internet connection
3. Verify NSE website is accessible

### Empty Data

If no data is returned:
1. Check the index name spelling (must be exact)
2. Verify NSE API is operational
3. Check logs in `nse_scraper.log`

### Permission Errors

If you get permission errors when saving files:
```bash
# Create output directory manually
mkdir output
chmod 755 output
```

## Scheduling Automated Runs

### Linux/Mac (cron)

Add to crontab (`crontab -e`):

```bash
# Run every day at 4 PM IST (after market close)
0 16 * * * cd /path/to/NSE-Scrap && python nse_batch_scraper.py
```

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 4 PM)
4. Action: Start a program
5. Program: `python`
6. Arguments: `nse_batch_scraper.py`
7. Start in: `C:\path\to\NSE-Scrap`

## Advanced Usage

### Custom Index List

```python
from nse_scraper import NSEScraper

scraper = NSEScraper()

# Fetch specific indices
my_indices = ['NIFTY 50', 'NIFTY BANK', 'NIFTY IT']
df = scraper.fetch_all_stocks_by_indices(my_indices)

scraper.export_to_excel(df, 'my_custom_stocks')
```

### Get Individual Stock Quote

```python
scraper = NSEScraper()

# Get detailed quote
quote = scraper.get_stock_quote('RELIANCE')
print(quote)
```

## Comparison: Python vs Google Apps Script

| Feature | Python Scripts | Google Apps Script |
|---------|---------------|-------------------|
| **Speed** | Fast (parallel processing possible) | Moderate (sequential) |
| **Data Export** | CSV, Excel, JSON | Google Sheets only |
| **Automation** | cron, Task Scheduler | Time-based triggers |
| **Customization** | Highly flexible | Limited by GAS environment |
| **Dependencies** | Requires Python setup | No setup needed |
| **Best For** | Batch processing, analysis | Direct Sheets integration |

## License

Same as the main NSE-Scrap project.

## Support

For issues or questions:
1. Check the logs in `nse_scraper.log`
2. Verify nse-python library is up to date: `pip install --upgrade nse-python`
3. Open an issue on GitHub

---

**Note**: This tool is for informational purposes only. Always verify data from official sources before making investment decisions.
