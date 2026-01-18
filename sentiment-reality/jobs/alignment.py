import numpy as np
import query_db.py as qdb
from db import fetch_all

def normalize(num1,num2):
    normalized = np.log(num1 / num2)
    normalized = np.tanh(5*normalized)
    return normalized

#WORK ON THIS FUNCTION
'''def aggregate(ticker,time_series):
    #  Σ(alignment_raw × weight) / Σ(weight)
    alignment_raws 
    weights = []
    
    pass
'''

'''
Returns a dictionary with:
    - today_close: float or None
    - today_volume: int or None
    - yesterday_close: float or None
    - yesterday_volume: int or None
    - avg_sentiment: float or None
    - article_count: int

'''
def alignment(info:dict):
    todays_close = info.get("today_close")
    yesterdays_close = info.get("yesterday_close")
    s = info.get("avg_sentiment")
    yesterdays_volume = info.get("yesterday_volume")
    today_volume = info.get("today_volume")
    today_article_count = info.get("today_article_count")
    yesterday_article_count = info.get("yesterday_article_count")

    # returns daily_alignment_raw and daily_alignment_weight
    p = normalize(todays_close, yesterdays_close)
    av_norm = normalize(today_article_count, yesterday_article_count)
    v_norm = normalize(today_volume, yesterdays_volume)
    dirr = 1 if sign(p) == sign(s) else -1
    mag = 1 - abs(abs(p) - abs(s))  # 1 - | |p| - |s| |
    alignment_raw = dirr * mag

    alignment_weight = np.sqrt(av_norm * v_norm)

    return {"alignment_raw": alignment_raw, "alignment_weight": alignment_weight}

def score_alignment(ticker, date):
    alignment_dict = alignment(qdb.get_daily_summary(ticker, date)) #dict 
    # import the dict into supabase
    