import feedparser
from datetime import datetime, timedelta, timezone
from typing import List
import requests
import re
from newspaper import Article


def get_news_urls(stock_symbol: str) -> List[str]:
    """
    Fetch article URLs from Google News RSS feed for a given stock symbol
    from the last 7 days.
    
    Args:
        stock_symbol (str): Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
    
    Returns:
        List[str]: List of article URLs from the last 7 days
    """
    # Google News RSS feed URL for the stock symbol
    rss_url = f"https://news.google.com/rss/search?q={stock_symbol}&hl=en-US&gl=US&ceid=US:en"
    
    # Calculate the date threshold (7 days ago)
    seven_days_ago = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=7)
    
    urls = []
    
    try:
        # Parse the RSS feed
        feed = feedparser.parse(rss_url)
        
        # Iterate through feed entries
        for entry in feed.entries:
            try:
                # Try to get the published date
                published_date = None
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    published_date = datetime(*entry.published_parsed[:6])
                
                # If we have a date, check if it's within the last 7 days
                if published_date and published_date < seven_days_ago:
                    continue
                
                # Try to get the source publication URL
                url = None
                
                # First, try to extract from the summary (it may contain the source link)
                if hasattr(entry, 'summary') and entry.summary:
                    # Look for any http(s) URL in the summary that isn't a Google News URL
                    matches = re.findall(r'https?://(?!news\.google\.com)[^\s"<>]+', entry.summary)
                    if matches:
                        url = matches[0]
                
                # If not found in summary, check if there's a source href
                if not url and hasattr(entry, 'source') and hasattr(entry.source, 'href'):
                    url = entry.source.href
                
                # Fallback to Google News URL if nothing else works
                if not url and hasattr(entry, 'link') and entry.link:
                    url = entry.link
                
                if url:
                    urls.append(url)
                    
            except Exception:
                continue
        
    except Exception as e:
        print(f"Error fetching RSS feed for {stock_symbol}: {e}")
    
    return urls


def get_article_text(url: str) -> str:
    """
    Extract the article text content from a given URL using newspaper3k.
    
    Args:
        url (str): The URL of the article to extract text from
    
    Returns:
        str: The article text content as plain text, or empty string if extraction fails
    """
    try:
        # Create an Article object from newspaper3k
        article = Article(url, keep_article_html=False)
        
        # Download the article
        article.download()
        
        # Parse the article content
        article.parse()
        
        # Return the extracted text
        text = article.text
        
        return text if text else ""
    
    except Exception:
        return ""


if __name__ == "__main__":
    # Example usage
    symbol = "AAPL"
    urls = get_news_urls(symbol)
    print(f"Found {len(urls)} articles for {symbol}")
    print()
    
    # Test get_article_text with the first few URLs
    for i, url in enumerate(urls[:3]):
        print(f"Article {i + 1}:")
        print("-" * 80)
        text = get_article_text(url)
        if text:
            # Print first 300 characters of the article
            preview = text[:300] + "..." if len(text) > 300 else text
            print(preview)
        else:
            print("Could not extract article text")
        print()
        print("=" * 80)
        print()
