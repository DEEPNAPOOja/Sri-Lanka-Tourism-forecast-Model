import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length && payload[0].value != null) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-xl" style={{backgroundColor: '#1e293b', borderColor: '#374151'}}>
        <p className="text-slate-300 text-sm mb-1" style={{color: '#cbd5e1'}}>{label}</p>
        <p className="text-blue-400 font-bold text-lg" style={{color: '#60a5fa'}}>
          {Number(payload[0].value).toLocaleString()} Arrivals
        </p>
      </div>
    );
  }
  return null;
};

export function ForecastChart({ data, selectedCountry = 'Total' }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl h-[320px] flex items-center justify-center" style={{backgroundColor: '#1e293b', borderColor: '#374151', height: '320px'}}>
        <div className="text-center">
          <TrendingUp className="mx-auto mb-3 text-slate-500" size={48} />
          <p className="text-slate-400 text-base font-medium" style={{color: '#94a3b8'}}>No forecast data available</p>
          <p className="text-slate-500 text-sm" style={{color: '#64748b'}}>Adjust your parameters and generate a forecast</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl h-[320px] hover:shadow-2xl transition-shadow duration-300" style={{backgroundColor: '#1e293b', borderColor: '#374151', height: '320px'}}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-blue-400" size={20} />
            Tourism Arrivals Forecast
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Predictions for <span className="text-blue-400 font-semibold">{selectedCountry}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-slate-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            AI Predicted
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="arrivals"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorArrivals)"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#60a5fa' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
