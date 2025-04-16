"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Dashboard() {
  const { username } = useParams();
  const [userStocks, setUserStocks] = useState([]);
  const [stockData, setStockData] = useState({});
  const [newSymbol, setNewSymbol] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newBuyingPrice, setNewBuyingPrice] = useState("");
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [expandedSymbol, setExpandedSymbol] = useState(null);
  const [cursor, setCursor] = useState("default");

  useEffect(() => {
    fetchUserStocks();
  }, [username]);

  useEffect(() => {
    calculatePortfolioValue();
  }, [stockData, userStocks]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".stock-card")) {
        setExpandedSymbol(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    // Auto-fill buying price when stock symbol is entered
    if (newSymbol) {
      fetchStockPrice(newSymbol);
    } else {
      setNewBuyingPrice("");
    }
  }, [newSymbol]);

  const fetchStockPrice = async (symbol) => {
    if (!symbol) return;
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/stocks/${symbol.toUpperCase()}/?format=json`);
      if (res.data && res.data.info && res.data.info.currentPrice) {
        setNewBuyingPrice(res.data.info.currentPrice);
      }
    } catch (err) {
      console.error("Error fetching stock price for auto-fill:", err);
    }
  };

  const fetchUserStocks = async () => {
    if (!username) return;
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/user/stocks/${username}/`);
      const stocks = res.data.stocks || [];
      setUserStocks(stocks);
  
      // 🔥 Automatically fetch stock data for each
      stocks.forEach(({ symbol }) => {
        getStockData(symbol);
      });
    } catch (err) {
      console.error("Error fetching user stocks:", err);
    }
  };
  
  const getStockData = async (symbol) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/stocks/${symbol}/?format=json`);
      setStockData((prev) => ({ ...prev, [symbol]: res.data }));
    } catch (err) {
      console.error("Error fetching stock data:", err);
    }
  };

  const addStock = async () => {
    if (!newSymbol || !newQuantity || !newBuyingPrice) return;
    const symbol = newSymbol.toUpperCase();
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/user/stocks/post/${username}/`,
        { 
          symbol, 
          quantity: Number(newQuantity),
          buyingPrice: Number(newBuyingPrice)
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      setNewSymbol("");
      setNewQuantity("");
      setNewBuyingPrice("");
  
      // Refetch all user stocks
      await fetchUserStocks();
  
      // Fetch data for the new stock
      await getStockData(symbol);
  
      // Auto-expand newly added stock
      setExpandedSymbol(symbol);
  
    } catch (err) {
      console.error("Error adding stock:", err);
    }
  };
  
  const deleteStock = async (symbol) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/user/stocks/delete/${username}/${symbol}/`);
      const updated = userStocks.filter((s) => s.symbol !== symbol);
      setUserStocks(updated);
      const updatedData = { ...stockData };
      delete updatedData[symbol];
      setStockData(updatedData);
      setExpandedSymbol(null);
    } catch (err) {
      console.error("Error deleting stock:", err);
    }
  };

  const handleCardClick = async (symbol) => {
    setCursor("wait");
    if (!stockData[symbol]) await getStockData(symbol);
    setExpandedSymbol(symbol);
    setCursor("default");
  };

  const calculatePortfolioValue = () => {
    let total = 0;
    let profitLoss = 0;
    
    for (let stock of userStocks) {
      const symbol = stock.symbol;
      const quantity = Number(stock.quantity || 0);
      const buyingPrice = Number(stock.buyingPrice || 0);
      const currentPrice = stockData[symbol]?.info?.currentPrice || 0;
      
      total += quantity * currentPrice;
      profitLoss += quantity * (currentPrice - buyingPrice);
    }
    
    setPortfolioValue(total);
    setTotalProfitLoss(profitLoss);
  };

  const calculateProfitLoss = (currentPrice, buyingPrice, quantity) => {
    return (currentPrice - buyingPrice) * quantity;
  };

  return (
    <main className="min-h-screen bg-gray-50 p-10 text-black" style={{ cursor }}>
      <h1 className="text-4xl font-bold mb-8 text-center">
        📈 Stock Dashboard for {username}
      </h1>

      {/* Add Stock Input */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        <input
          type="text"
          placeholder="Stock symbol (e.g., AAPL)"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg w-48 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg w-36 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          placeholder="Buying price"
          value={newBuyingPrice}
          onChange={(e) => setNewBuyingPrice(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg w-36 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          step="0.01"
        />
        <button
          onClick={addStock}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
        >
          ➕ Add Stock
        </button>
      </div>

      {userStocks.length === 0 ? (
        <p className="text-center">No stocks found for this user.</p>
      ) : (
        <div className="space-y-10 max-w-6xl mx-auto">
          {userStocks.map(({ symbol, quantity, buyingPrice }) => {
            const isExpanded = expandedSymbol === symbol;
            const data = stockData[symbol];
            const info = data?.info;
            const currentPrice = info?.currentPrice || 0;
            const profitLoss = calculateProfitLoss(currentPrice, buyingPrice, quantity);
            const isProfitable = profitLoss >= 0;

            return (
              <div
                key={symbol}
                className="stock-card bg-white p-6 rounded-xl shadow border text-black cursor-pointer"
                onClick={() => handleCardClick(symbol)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-semibold">{symbol}</h2>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded z-10 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStock(symbol);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>

                {info && (
                  <>
                    <p><strong>Name:</strong> {info.shortName}</p>
                    <p><strong>Quantity:</strong> {quantity}</p>
                    <p><strong>Buying Price:</strong> ${Number(buyingPrice).toFixed(2)}</p>
                    <p><strong>Current Price:</strong> ${info.currentPrice}</p>
                    <p><strong>Total Value:</strong> ${(quantity * info.currentPrice).toFixed(2)}</p>
                    <p className={`font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                      <strong>Profit/Loss:</strong> {isProfitable ? '+' : ''}${profitLoss.toFixed(2)}
                      {' '}({isProfitable ? '+' : ''}
                      {((profitLoss / (buyingPrice * quantity)) * 100).toFixed(2)}%)
                    </p>
                  </>
                )}

                {isExpanded && data && (
                  <>
                    <p><strong>Previous Close:</strong> ${info.previousClose}</p>
                    <p><strong>Volume:</strong> {(info.volume / 1_000_000).toFixed(2)}M</p>
                    <div className="mt-3 p-3 bg-gray-100 rounded">
                      <p className="font-medium">
                        📊 Summary:{" "}
                        {info.currentPrice > info.previousClose
                          ? "Price is up 📈"
                          : info.currentPrice < info.previousClose
                          ? "Price is down 📉"
                          : "No change"}
                      </p>
                    </div>

                    <h3 className="text-xl font-bold mb-2 mt-6">Historical Closing Prices</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data.history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="close" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>

                    <h3 className="text-xl font-bold mt-8 mb-2">Future Predictions</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={data.future_predictions}>
                        <defs>
                          <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="predictedClose" stroke="#8884d8" />
                        <Area type="monotone" dataKey="upper" stroke="#82ca9d" fillOpacity={0.2} fill="#82ca9d" />
                        <Area type="monotone" dataKey="lower" stroke="#ff7300" fillOpacity={0.2} fill="#ff7300" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Portfolio Total */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold">💰 Total Portfolio Value</h2>
        <p className="text-3xl font-semibold mt-2">${portfolioValue.toFixed(2)}</p>
        <p className={`text-2xl font-semibold mt-2 ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          Total Profit/Loss: {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toFixed(2)}
        </p>
      </div>
    </main>
  );
}