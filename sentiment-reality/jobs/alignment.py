"""Alignment helpers."""
from typing import Any, Optional


def alignment(payload: dict) -> dict:
    """
    Normalize an input payload into the alignment summary shape.

    Returns:
        - today_close: float or None
        - today_volume: int or None
        - yesterday_close: float or None
        - yesterday_volume: int or None
        - avg_sentiment: float or None
        - article_count: int
    """
    # Keep as a skeleton for future enrichment/validation logic.
    return {
        "today_close": _as_float(payload.get("today_close")),
        "today_volume": _as_int(payload.get("today_volume")),
        "yesterday_close": _as_float(payload.get("yesterday_close")),
        "yesterday_volume": _as_int(payload.get("yesterday_volume")),
        "avg_sentiment": _as_float(payload.get("avg_sentiment")),
        "article_count": _as_int(payload.get("article_count")) or 0,
    }


def _as_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _as_int(value: Any) -> Optional[int]:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
