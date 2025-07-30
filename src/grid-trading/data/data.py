import json
import os
from datetime import date

from yfinance import Ticker, set_config


def proxy():
    return os.environ.get("STOCK_PROXY")


def save_daily_kline(code: str):
    today = date.today()
    start = today.replace(year=today.year - 1)
    t = Ticker(code)
    print("Downloading", code, start)
    data = t.history(period="1y", start=start.strftime("%Y-%m-%d"), auto_adjust=False)
    print("Downloaded", code, start)
    result = []
    for index, row in data.iterrows():
        result.append({
            "date": index.strftime("%Y-%m-%d"),
            "open": round(row.Open, 4),
            "high": round(row.High, 4),
            "low": round(row.Low, 4),
            "close": round(row.Close, 4),
        })
    print("Load meta", code)
    meta = {
        "currency": t.info["currency"],
    }
    with open(f"{code}.json", "w") as f:
        json.dump({"daily": result, "meta": meta}, f, indent=2)


if __name__ == '__main__':
    proxy = os.environ.get("STOCK_PROXY")
    if proxy:
        print("Using proxy", proxy)
        set_config(proxy=proxy)
    save_daily_kline("0011.HK")
    save_daily_kline("0386.HK")
    save_daily_kline("0598.HK")
    save_daily_kline("0857.HK")
    save_daily_kline("0883.HK")
    save_daily_kline("1398.HK")
    save_daily_kline("1448.HK")
    save_daily_kline("1810.HK")
    save_daily_kline("1919.HK")
    save_daily_kline("3988.HK")
