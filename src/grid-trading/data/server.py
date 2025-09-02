from datetime import date

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from yfinance import Ticker

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class KData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float


@app.get("/daily/{code}")
def get_daily(code: str) -> list[KData]:
    today = date.today()
    start = today.replace(year=today.year - 1)
    t = Ticker(code)
    data = t.history(period="1y", start=start.strftime("%Y-%m-%d"), auto_adjust=False)
    result: list[KData] = []
    for index, row in data.iterrows():
        result.append(KData(
            date=index.strftime("%Y-%m-%d"),
            open=round(row.Open, 4),
            high=round(row.High, 4),
            low=round(row.Low, 4),
            close=round(row.Close, 4),
        ))
    return result


class StockBasic(BaseModel):
    currency: str
    name: str


@app.get("/basic/{code}")
def get_basic(code: str) -> StockBasic:
    t = Ticker(code)
    return StockBasic(
        currency=t.info["currency"],
        name=t.info["longName"],
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
