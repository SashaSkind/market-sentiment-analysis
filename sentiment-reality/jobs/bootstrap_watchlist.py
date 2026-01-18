"""
Bootstrap default watchlist with 5 active tickers.

Usage: python bootstrap_watchlist.py

Sets TSLA, NVDA, JPM, PFE, GME as active.
All other tickers are set to is_active=false.
"""
from db import execute, fetch_all, is_configured

DEFAULT_TICKERS = ["TSLA", "NVDA", "JPM", "PFE", "GME"]


def bootstrap_watchlist():
    """
    Ensure default tickers exist and are active.
    Deactivate any other tickers.
    """
    if not is_configured():
        print("ERROR: Database not configured. Set DATABASE_URL in .env")
        return False

    print("Bootstrapping default watchlist...")
    print(f"Active tickers: {', '.join(DEFAULT_TICKERS)}")

    # First, deactivate all existing tickers
    deactivated = execute("UPDATE tracked_stocks SET is_active = false")
    print(f"  Deactivated {deactivated} existing tickers")

    # Upsert default tickers as active
    for ticker in DEFAULT_TICKERS:
        execute("""
            INSERT INTO tracked_stocks (ticker, is_active)
            VALUES (%s, true)
            ON CONFLICT (ticker) DO UPDATE SET is_active = true
        """, (ticker,))
        print(f"  ✓ {ticker} set to active")

    # Show final state
    active = fetch_all("SELECT ticker FROM tracked_stocks WHERE is_active = true ORDER BY ticker")
    print(f"\nActive tickers: {[r['ticker'] for r in active]}")

    return True


if __name__ == "__main__":
    success = bootstrap_watchlist()
    if success:
        print("\n✓ Watchlist bootstrap complete")
    else:
        print("\n✗ Watchlist bootstrap failed")
        exit(1)
