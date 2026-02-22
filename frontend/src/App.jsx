import { useState, useEffect } from 'react';
import axios from 'axios';
import { StatsCard } from './components/StatsCard';
import { ForecastChart } from './components/ForecastChart';
import { Users, Calendar, TrendingUp, Activity, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:8000';

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
    <div className="min-h-screen p-8 font-sans" style={{backgroundColor: '#020617', color: '#e2e8f0', minHeight: '100vh'}}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <span className="text-2xl">🌴</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Sri Lanka Tourism Arrival Forecasting Model
              </h1>
            </div>
            <p className="text-slate-400 text-lg">
              Advanced AI-powered forecasting & analytics for Sri Lanka Tourism Board
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                API Connected
              </span>
              <span>Last Updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Country Selection */}
            <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-lg p-1 pr-4 hover:border-blue-500/50 transition-colors">
              <div className="p-2 text-blue-400">
                <MapPin size={20} />
              </div>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-200 min-w-[180px] cursor-pointer font-medium"
              >
                {countries.map(c => (
                  <option key={c} value={c} className="bg-slate-800 text-slate-200">
                    {c === 'Total' ? '🌍 All Countries' : `🏴󐁧󐁢󐁥󐁮󐁧󐁿 ${c}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Forecast Parameters */}
            <div className="flex gap-3 items-end bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
              <div className="flex flex-col">
                <label className="text-xs text-slate-400 mb-2 font-medium">Start Year</label>
                <input
                  type="number"
                  value={forecastParams.startYear}
                  onChange={(e) => setForecastParams(prev => ({...prev, startYear: parseInt(e.target.value)}))}
                  className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 w-24 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  min="2020"
                  max="2030"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-400 mb-2 font-medium">Start Month</label>
                <select
                  value={forecastParams.startMonth}
                  onChange={(e) => setForecastParams(prev => ({...prev, startMonth: parseInt(e.target.value)}))}
                  className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1} className="bg-slate-800">
                      {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-400 mb-2 font-medium">Forecast Period</label>
                <select
                  value={forecastParams.horizon}
                  onChange={(e) => setForecastParams(prev => ({...prev, horizon: parseInt(e.target.value)}))}
                  className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value={6} className="bg-slate-800">6 months</option>
                  <option value={12} className="bg-slate-800">12 months</option>
                  <option value={18} className="bg-slate-800">18 months</option>
                  <option value={24} className="bg-slate-800">24 months</option>
                </select>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-lg"
              >
                <span>🔄</span>
                Refresh Data
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64" style={{height: '16rem'}}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{width: '3rem', height: '3rem', borderBottomWidth: '2px', borderBottomColor: '#3b82f6'}}></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 bg-slate-800 border border-red-500/20 rounded-xl">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-2">⚠️</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Chart Section */}
              <div className="lg:col-span-3 space-y-6">
                <ForecastChart data={forecastData} selectedCountry={selectedCountry} />
                
                {/* Detailed Results Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl" style={{backgroundColor: '#1e293b', borderColor: '#374151'}}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>📈</span>
                      Detailed Forecast Results
                    </h3>
                    <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-medium">
                      {forecastParams.horizon} months projection
                    </span>
                  </div>
                  
                  {forecastData.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
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
                    <div className="text-center py-8 text-slate-400">
                      <span className="text-4xl block mb-2">📊</span>
                      <p>Generate a forecast to see detailed results</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Key Insights */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl" style={{backgroundColor: '#1e293b', borderColor: '#374151'}}>
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
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <span>🤖</span>
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

                {/* Export Options */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl" style={{backgroundColor: '#1e293b', borderColor: '#374151'}}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>📄</span>
                    Export Data
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <span>📊</span>
                      Export to CSV
                    </button>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <span>📄</span>
                      Download PDF Report
                    </button>
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
