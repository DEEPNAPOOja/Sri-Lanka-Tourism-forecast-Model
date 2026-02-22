import { useState, useEffect } from 'react';
import axios from 'axios';
import { StatsCard } from './components/StatsCard';
import { ForecastChart } from './components/ForecastChart';
import { Users, Calendar, TrendingUp, Activity, MapPin, Globe, AlertTriangle, BarChart3, Bot, Plane } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api';

function App() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('Total'); 
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastParams, setForecastParams] = useState({
    startYear: new Date().getFullYear(),
    startMonth: new Date().getMonth() + 1,
    horizon: 12
  });
  const [stats, setStats] = useState({
    totalArrivals: 0,
    growth: 0,
    peakMonth: '-',
    avgMonthly: 0
  });

  // Fetch countries on load
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await axios.get(`${API_URL}/countries`);
        setCountries(['Total', ...res.data.countries]);
      } catch (err) {
        console.error("Failed to load countries", err);
      }
    }
    fetchCountries();
  }, []);

  // Fetch forecast when country changes or params change
  useEffect(() => {
    async function fetchForecast() {
      setLoading(true);
      setError(null);
      try {
        let res;
        
        if (selectedCountry === 'Total') {
          res = await axios.post(`${API_URL}/forecast`, {
            start_year: forecastParams.startYear,
            start_month: forecastParams.startMonth,
            horizon: forecastParams.horizon
          });
        } else {
          res = await axios.post(`${API_URL}/forecast_country`, {
            country: selectedCountry,
            start_year: forecastParams.startYear,
            start_month: forecastParams.startMonth,
            horizon: forecastParams.horizon
          });
        }

        if (res.data.error) {
          setError(`Error: ${res.data.error}`);
          return;
        }

        const data = res.data.forecast.map(item => ({
          name: `${item.year}-${String(item.month).padStart(2, '0')}`,
          arrivals: item.predicted_arrivals
        }));

        if (!Array.isArray(data) || data.length === 0) {
          console.warn("Forecast data is empty or invalid", data);
          setForecastData([]);
          setStats({
            totalArrivals: 0,
            growth: 0,
            peakMonth: '-',
            avgMonthly: 0
          });
        } else {
          // Normalize data
          const validData = data.map(item => ({
            ...item,
            arrivals: Number(item.arrivals) || 0
          }));

          setForecastData(validData);

          // Calculate stats
          const total = validData.reduce((sum, item) => sum + item.arrivals, 0);
          const avg = validData.length ? total / validData.length : 0;
          
          let peak = validData[0];
          let maxVal = -Infinity;
          
          validData.forEach(item => {
             if(item.arrivals > maxVal) {
               maxVal = item.arrivals;
               peak = item;
             }
          });

          // Simple growth calc (last vs first)
          const first = validData[0]?.arrivals || 0;
          const last = validData[validData.length - 1]?.arrivals || 0;
          const growth = first !== 0 ? ((last - first) / first) * 100 : 0;

          setStats({
            totalArrivals: Math.round(total),
            growth: !isNaN(growth) ? Math.round(growth * 10) / 10 : 0,
            peakMonth: peak?.name || '-',
            avgMonthly: Math.round(avg)
          });
        }

      } catch (err) {
        console.error("Failed to fetch forecast", err);
        setError(`Failed to load forecast data: ${err.response?.data?.detail || err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchForecast();
  }, [selectedCountry, forecastParams]);

  return (
    <div className="min-h-screen p-4 font-sans" style={{backgroundColor: '#020617', color: '#e2e8f0', minHeight: '100vh'}}>
      <div className="max-w-7xl mx-auto space-y-4">
 
        {/* Header Section */}
        <header className="mb-6 w-full flex flex-col items-center text-center">

          {/* ROW 1 — Main Title */}
          <div className="w-full flex flex-col items-center mb-3">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Plane className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                Sri Lanka Tourism Arrival Forecasting Model
              </h1>
            </div>
          </div>

          {/* ROW 2 — Description */}
          <div className="w-full max-w-4xl mb-6">
            <p className="text-slate-400 text-lg leading-relaxed">
              Advanced AI-powered forecasting & analytics dashboard for Sri Lanka Tourism.
              Explore historical trends, seasonal patterns, and generate intelligent
              future predictions using machine learning.
            </p>
          </div>

          {/* ROW 3 — Filters */}
          <div className="w-full max-w-6xl bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-4 shadow-lg">

            <div className="flex items-end justify-between gap-3">

              {/* Country */}
              <div className="flex flex-col w-[260px]">
                <label className="text-xs text-slate-400 mb-2 font-medium">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-md px-4 py-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition appearance-none"
                >
                  {countries.map(c => (
                    <option key={c} value={c} className="bg-slate-800">
                      {c === "Total" ? "🌐 All Countries" : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Year */}
              <div className="flex flex-col w-[140px]">
                <label className="text-xs text-slate-400 mb-2 font-medium">
                  Year
                </label>
                <input
                  type="number"
                  value={forecastParams.startYear}
                  onChange={(e) =>
                    setForecastParams(prev => ({
                      ...prev,
                      startYear: parseInt(e.target.value)
                    }))
                  }
                  className="bg-slate-800 border border-slate-600 rounded-md px-4 py-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  min="2020"
                  max="2035"
                />
              </div>

              {/* Start Month */}
              <div className="flex flex-col w-[180px]">
                <label className="text-xs text-slate-400 mb-2 font-medium">
                  Month
                </label>
                <select
                  value={forecastParams.startMonth}
                  onChange={(e) =>
                    setForecastParams(prev => ({
                      ...prev,
                      startMonth: parseInt(e.target.value)
                    }))
                  }
                  className="bg-slate-800 border border-slate-600 rounded-md px-4 py-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-slate-800">
                      {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Forecast Period */}
              <div className="flex flex-col w-[180px]">
                <label className="text-xs text-slate-400 mb-2 font-medium">
                  Forecast
                </label>
                <select
                  value={forecastParams.horizon}
                  onChange={(e) =>
                    setForecastParams(prev => ({
                      ...prev,
                      horizon: parseInt(e.target.value)
                    }))
                  }
                  className="bg-slate-800 border border-slate-600 rounded-md px-4 py-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                  <option value={18}>18 Months</option>
                  <option value={24}>24 Months</option>
                </select>
              </div>

              {/* Button */}
              <div className="flex items-end">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-semibold transition shadow-md"
                >
                  Refresh
                </button>
              </div>

            </div>
          </div>

        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64" style={{height: '16rem'}}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{width: '3rem', height: '3rem', borderBottomWidth: '2px', borderBottomColor: '#3b82f6'}}></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40 bg-slate-800 border border-red-500/20 rounded-xl">
            <div className="text-center">
              <AlertTriangle className="text-red-400 mx-auto mb-2" size={24} />
              <p className="text-red-400 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatsCard 
                title={`Total Forecast (${forecastParams.horizon}m)`} 
                value={stats.totalArrivals.toLocaleString()} 
                icon={Users}
                change={stats.growth}
                delay={0}
              />
              <StatsCard 
                title="Avg. Monthly Arrivals" 
                value={stats.avgMonthly.toLocaleString()} 
                icon={Activity}
                delay={0.1}
              />
              <StatsCard 
                title="Peak Month" 
                value={stats.peakMonth} 
                icon={Calendar}
                delay={0.2}
              />
              <StatsCard 
                title="Growth Trend" 
                value={`${stats.growth > 0 ? '+' : ''}${stats.growth}%`} 
                icon={TrendingUp}
                delay={0.3}
              />
            </div>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Chart Section */}
              <div className="lg:col-span-3 space-y-4">
                <ForecastChart data={forecastData} selectedCountry={selectedCountry} />
                
                {/* Detailed Results Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl" style={{backgroundColor: '#1e293b', borderColor: '#374151'}}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="text-blue-400" size={20} />
                      Detailed Forecast Results
                    </h3>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-medium">
                      {forecastParams.horizon} months projection
                    </span>
                  </div>
                  
                  {forecastData.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      <div className="space-y-2">
                        {forecastData.map((item, index) => {
                          const monthName = new Date(2024, (index + forecastParams.startMonth - 1) % 12).toLocaleDateString('en-US', { 
                            month: 'long'
                          });
                          const year = forecastParams.startYear + Math.floor((index + forecastParams.startMonth - 1) / 12);
                          
                          return (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-slate-300 font-medium">{monthName} {year}</span>
                              </div>
                              <span className="text-white font-bold text-lg">
                                {item.arrivals.toLocaleString()} 
                                <span className="text-slate-400 font-normal text-sm ml-1">arrivals</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <BarChart3 className="mx-auto mb-2 text-slate-500" size={32} />
                      <p>Generate a forecast to see detailed results</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Sidebar */}
              <div className="space-y-4">
                {/* Key Insights */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl" style={{backgroundColor: '#1e293b', borderColor: '#374151'}}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-400" />
                    Key Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-sm text-slate-300 mb-1">Peak Arrival Period</p>
                      <p className="text-blue-400 font-bold text-lg">{stats.peakMonth}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20">
                      <p className="text-sm text-slate-300 mb-1">Growth Trend</p>
                      <p className={`font-bold text-lg ${stats.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stats.growth >= 0 ? '+' : ''}{Math.abs(stats.growth).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-sm text-slate-300 mb-1">Total Forecast</p>
                      <p className="text-purple-400 font-bold text-lg">{stats.totalArrivals.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Model Information */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                      <Bot className="text-white" size={18} />
                      AI Model Info
                    </h3>
                    <div className="space-y-2 text-blue-100 text-sm mb-4">
                      <p>• Advanced Time Series Forecasting</p>
                      <p>• Multi-country Support</p>
                      <p>• Seasonal Pattern Recognition</p>
                      <p>• Real-time Predictions</p>
                    </div>
                    <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
                      Learn More
                    </button>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                    <Calendar size={120} />
                  </div>
                </div>

               
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
