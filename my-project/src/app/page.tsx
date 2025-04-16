"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const { username } = useParams(); // Get username from route
  const [symbol, setSymbol] = useState("");
  const [userStocks, setUserStocks] = useState([]);
  const [stockData, setStockData] = useState({});

  useEffect(() => {
    const fetchUserStocks = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/user/stocks/${username}/`);
        setUserStocks(res.data.stocks || []);
      } catch (err) {
        console.error("Error fetching stocks:", err);
      }
    };

    if (username) fetchUserStocks();
  }, [username]);

  const getStockData = async (symbol) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/stocks/${symbol}/`);
      setStockData((prev) => ({ ...prev, [symbol]: res.data }));
    } catch (err) {
      console.error("Error fetching stock data:", err);
    }
  };

  const postStock = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/user/stocks/${username}/`, { symbol });
      setUserStocks((prev) => [...prev, symbol]);
      setSymbol("");
    } catch (err) {
      console.error("Error posting stock:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white py-10 px-4">
      <h1 className="text-5xl font-extrabold text-center text-black mb-12 drop-shadow-sm">
        📊 {username}'s Stock Dashboard
      </h1>

      {/* Input for new stock symbol */}
      <div className="flex justify-center gap-4 mb-10">
        <input
          type="text"
          placeholder="Enter stock symbol (e.g., AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="px-4 py-2 border border-gray-300 text-black rounded-lg shadow w-full max-w-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <button
          onClick={postStock}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ➕ Add
        </button>
      </div>

      {/* User's Stocks */}
      <div className="max-w-7xl mx-auto space-y-8">
        {userStocks.map((stock) => (
          <div key={stock} className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">{stock}</h2>
              <button
                onClick={() => getStockData(stock)}
                className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
              >
                View Data
              </button>
            </div>

            {stockData[stock] && (
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stockData[stock]}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
