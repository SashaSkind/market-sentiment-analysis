"""Stock management endpoints - add stocks and trigger refresh tasks."""
import re
import json
from fastapi import APIRouter, HTTPException
from schemas import AddStockRequest, RefreshStockRequest, TaskResponse
from db import execute, execute_returning, is_configured

router = APIRouter()

# Payload parameters for REFRESH_STOCK
REFRESH_PAYLOAD = {
    "news_hours": 48,
    "score_limit": 50,
    "prices_days": 180,
    "agg_days": 30,
    "metrics_days": 30,
    "window_days": 7,
}


def validate_ticker(ticker: str) -> str:
    """Validate and normalize ticker symbol."""
    ticker = ticker.upper().strip()
    if not re.match(r'^[A-Z0-9]{1,6}$', ticker):
        raise HTTPException(status_code=400, detail="Ticker must be 1-6 alphanumeric characters")
    return ticker


@router.post("/api/stocks", response_model=TaskResponse)
@router.post("/stocks", response_model=TaskResponse, include_in_schema=False)
def add_stock(request: AddStockRequest):
    """
    Add a stock to track.
    - Upserts into tracked_stocks
    - Creates a BACKFILL_STOCK task
    """
    ticker = validate_ticker(request.ticker)

    if not is_configured():
        return TaskResponse(queued=True, task_type="BACKFILL_STOCK", ticker=ticker)

    # Upsert into tracked_stocks
    execute("""
        INSERT INTO tracked_stocks (ticker, is_active)
        VALUES (%s, true)
        ON CONFLICT (ticker) DO UPDATE SET is_active = true
    """, (ticker,))

    # Create backfill task with payload
    result = execute_returning("""
        INSERT INTO tasks (task_type, ticker, priority, status, payload)
        VALUES ('BACKFILL_STOCK', %s, 10, 'PENDING', %s)
        RETURNING id
    """, (ticker, json.dumps(REFRESH_PAYLOAD)))

    task_id = str(result["id"]) if result else None
    return TaskResponse(queued=True, task_type="BACKFILL_STOCK", ticker=ticker, task_id=task_id)


@router.post("/api/stocks/refresh", response_model=TaskResponse)
@router.post("/stocks/refresh", response_model=TaskResponse, include_in_schema=False)
def refresh_stock(request: RefreshStockRequest):
    """
    Trigger a refresh for a stock.
    - Creates a REFRESH_STOCK task with high priority
    - Includes payload with pipeline parameters
    """
    ticker = validate_ticker(request.ticker)

    if not is_configured():
        return TaskResponse(queued=True, task_type="REFRESH_STOCK", ticker=ticker)

    # Create refresh task with payload
    result = execute_returning("""
        INSERT INTO tasks (task_type, ticker, priority, status, payload)
        VALUES ('REFRESH_STOCK', %s, 50, 'PENDING', %s)
        RETURNING id
    """, (ticker, json.dumps(REFRESH_PAYLOAD)))

    task_id = str(result["id"]) if result else None
    return TaskResponse(queued=True, task_type="REFRESH_STOCK", ticker=ticker, task_id=task_id)
