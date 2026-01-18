"""
Ingest news data into database.

Functions:
- ingest_news_to_db(): Fetch and store article metadata with stock price data
- Query helpers: get_article_by_url(), get_articles_by_ticker(), etc.
"""
import sys
from ingest_news import get_news_data, get_article_text
from db import execute, query


def ingest_news_to_db(stock_symbol: str, hours: int = 168) -> dict:
    """
    Fetch and store article metadata with stock price data.
    
    Returns:
        {
            'total_articles': int,
            'inserted_count': int,
            'skipped_count': int,
            'errors': list[str]
        }
    """
    print(f"\n📥 Fetching news for {stock_symbol} (last {hours}h)...")
    
    articles = get_news_data(stock_symbol, hours=hours)
    total = len(articles)
    print(f"Found {total} articles\n")
    
    if not articles:
        return {
            'total_articles': 0,
            'inserted_count': 0,
            'skipped_count': 0,
            'errors': []
        }
    
    inserted = 0
    skipped = 0
    errors = []
    
    for i, article in enumerate(articles, 1):
        try:
            # Check if URL already exists
            existing = query(
                "SELECT id FROM items WHERE url = %s",
                (article['url'],)
            )
            
            if existing:
                skipped += 1
                print(f"  [{i}/{total}] ⏭️  SKIPPED (duplicate): {article['headline'][:60]}...")
                continue
            
            # Insert article metadata with price data
            execute("""
                INSERT INTO items 
                (ticker, source, published_at, title, url, snippet,
                 current_price, price_timestamp, price_change, price_direction, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
                ON CONFLICT (source, url) DO NOTHING
            """, (
                stock_symbol.upper(),
                article.get('source', 'Unknown'),
                article.get('published_at'),
                article.get('headline', 'No title'),
                article['url'],
                article.get('snippet', ''),
                article.get('price'),
                article.get('price_timestamp'),
                article.get('price_change'),
                article.get('price_direction')
            ))
            
            inserted += 1
            print(f"  [{i}/{total}] ✓ INSERTED: {article['headline'][:60]}...")
            
        except Exception as e:
            error_msg = str(e)[:200]
            errors.append(error_msg)
            print(f"  [{i}/{total}] ❌ ERROR: {error_msg}")
    
    result = {
        'total_articles': total,
        'inserted_count': inserted,
        'skipped_count': skipped,
        'errors': errors
    }
    
    print(f"\n📊 Results: {inserted} inserted, {skipped} skipped")
    if errors:
        print(f"⚠️  {len(errors)} errors encountered")
    
    return result


# ========== Query Helpers ==========

def get_article_by_url(url: str) -> dict:
    """Get a single article by URL."""
    results = query(
        "SELECT * FROM items WHERE url = %s LIMIT 1",
        (url,)
    )
    return results[0] if results else None


def get_articles_by_ticker(ticker: str, limit: int = 100) -> list:
    """Get all articles for a ticker, ordered by most recent first."""
    return query("""
        SELECT * FROM items
        WHERE ticker = %s
        ORDER BY published_at DESC
        LIMIT %s
    """, (ticker.upper(), limit))


def get_unscored_articles(ticker: str, limit: int = 50) -> list:
    """Get articles without sentiment scores (for scoring pipeline)."""
    return query("""
        SELECT i.* FROM items i
        LEFT JOIN item_scores s ON i.id = s.item_id AND s.model = 'hf_fin_v1'
        WHERE i.ticker = %s AND s.item_id IS NULL
        ORDER BY i.published_at DESC
        LIMIT %s
    """, (ticker.upper(), limit))


def count_articles_by_ticker(ticker: str) -> int:
    """Get total article count for a ticker."""
    results = query(
        "SELECT COUNT(*) as count FROM items WHERE ticker = %s",
        (ticker.upper(),)
    )
    return results[0]['count'] if results else 0


# ========== CLI Interface ==========

def main():
    """CLI interface for ingestion."""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python ingest_to_db.py AAPL    # Fetch and store articles")
        sys.exit(1)
    
    ticker = sys.argv[1]
    
    try:
        result = ingest_news_to_db(ticker)
        
        # Show final stats
        print("\n" + "="*50)
        print(f"✓ Ingestion complete for {ticker}")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

