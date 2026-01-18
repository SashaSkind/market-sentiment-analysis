"""
Update current stock prices every hour.

This script fetches the current price for all tracked stocks
and stores them in the current_prices table.
"""
import sys
from datetime import datetime, timezone
import yfinance as yf
from db import query, execute


def get_current_price(ticker: str) -> dict:
    """
    Fetch current stock price and related data.
    
    Args:
        ticker: Stock ticker symbol
    
    Returns:
        Dict with price, price_change, and price_direction
    """
    try:
        ticker_obj = yf.Ticker(ticker)
        info = ticker_obj.info
        
        current_price = info.get('currentPrice') or info.get('regularMarketPrice')
        previous_close = info.get('previousClose')
        
        if not current_price:
            return {
                'price': None,
                'price_change': None,
                'price_direction': 'unknown'
            }
        
        # Calculate price change
        price_change = None
        price_direction = 'neutral'
        
        if previous_close:
            price_change = round(current_price - previous_close, 2)
            if price_change > 0:
                price_direction = 'up'
            elif price_change < 0:
                price_direction = 'down'
        
        return {
            'price': round(current_price, 2),
            'price_change': price_change,
            'price_direction': price_direction
        }
    
    except Exception as e:
        print(f"  Error fetching current price for {ticker}: {e}")
        return {
            'price': None,
            'price_change': None,
            'price_direction': 'unknown'
        }


def update_current_prices():
    """Update current prices for all tracked stocks."""
    print("\n⏰ Updating current stock prices...\n")
    
    try:
        # Get all tracked stocks
        stocks = query("SELECT ticker FROM tracked_stocks WHERE is_active = true")
        
        if not stocks:
            print("No active tracked stocks found.")
            return {
                'total': 0,
                'updated': 0,
                'errors': 0
            }
        
        total = len(stocks)
        updated = 0
        errors = 0
        timestamp = datetime.now(timezone.utc).isoformat()
        
        print(f"Found {total} tracked stocks\n")
        
        for i, stock in enumerate(stocks, 1):
            ticker = stock['ticker']
            
            # Fetch current price
            price_data = get_current_price(ticker)
            
            if price_data['price'] is None:
                errors += 1
                print(f"  [{i}/{total}] ❌ ERROR: No price data for {ticker}")
                continue
            
            try:
                # Insert or update current price
                execute("""
                    INSERT INTO current_prices 
                    (ticker, current_price, price_change, price_direction, price_timestamp)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (ticker) DO UPDATE SET
                        current_price = EXCLUDED.current_price,
                        price_change = EXCLUDED.price_change,
                        price_direction = EXCLUDED.price_direction,
                        price_timestamp = EXCLUDED.price_timestamp,
                        updated_at = now()
                """, (
                    ticker,
                    price_data['price'],
                    price_data['price_change'],
                    price_data['price_direction'],
                    timestamp
                ))
                
                updated += 1
                direction_symbol = "📈" if price_data['price_direction'] == 'up' else "📉" if price_data['price_direction'] == 'down' else "→"
                print(f"  [{i}/{total}] ✓ {ticker}: ${price_data['price']} {direction_symbol} ({price_data['price_change']})")
            
            except Exception as e:
                errors += 1
                print(f"  [{i}/{total}] ❌ ERROR updating {ticker}: {str(e)[:100]}")
        
        result = {
            'total': total,
            'updated': updated,
            'errors': errors
        }
        
        print(f"\n📊 Results:")
        print(f"  ✓ Updated: {updated}")
        print(f"  ❌ Errors: {errors}")
        print(f"  Total: {total}\n")
        
        return result
    
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    update_current_prices()
