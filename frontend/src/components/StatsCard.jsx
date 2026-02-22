import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

export function StatsCard({ title, value, change, icon: Icon, delay = 0 }) {
  const isPositive = change >= 0;
  
  if (!title || value === undefined) return null;

  return (
    <div 
      className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 group transform hover:-translate-y-1" 
      style={{
        backgroundColor: '#1e293b', 
        borderColor: '#374151', 
        color: '#e2e8f0',
        animationDelay: `${delay}s`
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-700/50 rounded-lg group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all duration-300 transform group-hover:scale-110">
          <Icon size={24} />
        </div>
        {change !== undefined && (
          <div className={clsx(
            "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full transition-all duration-300",
            isPositive 
              ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20" 
              : "bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20"
          )}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      
      <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wide">{title}</h3>
      <div className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300" style={{color: '#ffffff'}}>
        {value}
      </div>
      
      {/* Subtle animation bar */}
      <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transform transition-transform duration-1000 group-hover:translate-x-0"
          style={{transform: 'translateX(-100%)'}}
        ></div>
      </div>
    </div>
  );
}
