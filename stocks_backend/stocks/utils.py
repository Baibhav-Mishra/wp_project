# stocks/utils.py

import yfinance as yf
from .models import Stock

def fetch_and_store_stock(symbol):
    data = yf.Ticker(symbol)
    info = data.info
    stock, _ = Stock.objects.update_or_create(
        symbol=symbol,
        defaults={
            'name': info.get('shortName', symbol),
            'current_price': info.get('currentPrice', 0),
            'volume': info.get('volume', 0),
            'previous_close': info.get('previousClose', 0),
        }
    )
    return stock
