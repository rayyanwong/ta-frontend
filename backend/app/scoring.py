from __future__ import annotations
import math
import pandas as pd

def compute_plan(
    price: float,
    atr: float,
    risk_dollars: float,
) -> dict:
    # Simple execution-ready plan:
    # Entry zone: +/- 0.5 ATR around current price
    entry_low = max(0.01, price - 0.5 * atr)
    entry_high = price + 0.5 * atr

    # Stop: 1.5 ATR below entry_high (conservative)
    stop = max(0.01, entry_high - 1.5 * atr)

    risk_per_share = max(0.01, entry_high - stop)
    shares = int(max(0, math.floor(risk_dollars / risk_per_share)))

    target = entry_high + 2.0 * risk_per_share  # 2R target
    reward_per_share = max(0.01, target - entry_high)
    rr = reward_per_share / risk_per_share if risk_per_share > 0 else 0.0

    return {
        "entry_low": round(entry_low, 2),
        "entry_high": round(entry_high, 2),
        "stop": round(stop, 2),
        "target": round(target, 2),
        "shares": shares,
        "risk_per_share": round(risk_per_share, 2),
        "reward_per_share": round(reward_per_share, 2),
        "rr": round(rr, 2),
    }

def score_candidate(row: dict) -> tuple[float, dict]:
    """
    Deterministic, interpretable scoring (0-100-ish).
    Assumes row contains: close, sma50, sma200, rsi14, macd_hist, vol_ratio, atrp
    """
    close = row["close"]
    sma50 = row["sma50"]
    sma200 = row["sma200"]
    rsi = row["rsi14"]
    macd_hist = row["macd_hist"]
    vol_ratio = row["vol_ratio"]
    atrp = row["atrp"]

    trend = 0.0
    if close > sma50:
        trend += 20
    if sma50 > sma200:
        trend += 10
    # pullback bonus: close near sma50 (within 3%)
    if sma50 > 0 and (close - sma50) / sma50 <= 0.03:
        trend += 5
    trend = min(trend, 35)

    momentum = 0.0
    # RSI sweet spot 45-60
    if 45 <= rsi <= 60:
        momentum += 15
    elif 60 < rsi <= 70:
        momentum += 8
    elif 35 <= rsi < 45:
        momentum += 8
    # MACD histogram positive
    if macd_hist > 0:
        momentum += 10
    # extra if strongly positive
    if macd_hist > 0.5:
        momentum += 5
    momentum = min(momentum, 35)

    volume = 0.0
    # Scale volume ratio: 1.0 -> 0, 1.5 -> ~15
    volume = max(0.0, min(15.0, (vol_ratio - 1.0) * 30.0))

    risk = 0.0
    # Prefer atr% (volatility) not too wide: <6% gets full marks
    if atrp <= 0.06:
        risk = 15.0
    elif atrp <= 0.10:
        risk = 10.0
    elif atrp <= 0.14:
        risk = 6.0
    else:
        risk = 2.0

    total = trend + momentum + volume + risk
    breakdown = {
        "trend": round(trend, 2),
        "momentum": round(momentum, 2),
        "volume": round(volume, 2),
        "risk": round(risk, 2),
    }
    return round(total, 2), breakdown
