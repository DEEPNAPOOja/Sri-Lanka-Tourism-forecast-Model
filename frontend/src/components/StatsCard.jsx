import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import clsx from "clsx";

export function StatsCard({ title, value, change, icon: Icon, delay = 0 }) {
  if (!title || value === undefined) return null;

  const isPositive = change >= 0;

  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 shadow-md hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 group"
      style={{
        backgroundColor: "#1e293b",
        borderColor: "#374151",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-700/50 rounded-md group-hover:bg-blue-500/10 transition-all duration-300">
            <Icon size={18} className="text-slate-300 group-hover:text-blue-400 transition-colors duration-300" />
          </div>

          <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            {title}
          </h3>
        </div>

        {change !== undefined && (
          <div
            className={clsx(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            )}
          >
            {isPositive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
        {value}
      </div>
    </div>
  );
}