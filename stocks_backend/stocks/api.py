# stocks/api.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
import yfinance as yf
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

@api_view(["GET"])
def stock_data(request, symbol):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info

        # Get last 30 days of price history
        hist = ticker.history(period="1mo")
        history = [
            {"date": date.strftime("%Y-%m-%d"), "close": round(row["Close"], 2)}
            for date, row in hist.iterrows()
        ]

        # Monte Carlo simulation for future stock price prediction
        # Calculate daily returns and volatility
        daily_returns = hist["Close"].pct_change().dropna()
        volatility = daily_returns.std()  # standard deviation (volatility)
        mean_return = daily_returns.mean()  # mean return

        # Parameters for the simulation
        num_simulations = 1000
        num_days = 10  # Predicting the next 10 days
        last_price = hist["Close"][-1]  # Last known price

        # Monte Carlo simulation
        simulations = np.zeros((num_simulations, num_days))

        for i in range(num_simulations):
            price_path = [last_price]
            for j in range(num_days):
                # Simulate the next price using the geometric Brownian motion model
                next_price = price_path[-1] * (1 + np.random.normal(mean_return, volatility))
                price_path.append(next_price)
            simulations[i, :] = price_path[1:]  # Exclude the initial price

        # Calculate mean and 95% confidence interval for the predicted prices
        future_prices_mean = simulations.mean(axis=0)
        future_prices_lower = np.percentile(simulations, 2.5, axis=0)
        future_prices_upper = np.percentile(simulations, 97.5, axis=0)

        # Prepare future price data
        future_prices = [
            {"date": (datetime.now() + timedelta(days=i+1)).strftime("%Y-%m-%d"),
             "predictedClose": round(future_prices_mean[i], 2),
             "lower": round(future_prices_lower[i], 2),
             "upper": round(future_prices_upper[i], 2)}
            for i in range(num_days)
        ]

        # Return the stock info and history along with the future predictions
        return Response({
            "info": {
                "shortName": info.get("shortName", symbol),
                "symbol": symbol.upper(),
                "currentPrice": info.get("currentPrice", 0),
                "previousClose": info.get("previousClose", 0),
                "volume": info.get("volume", 0),
            },
            "history": history,
            "future_predictions": future_prices  # Added future predictions
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)
