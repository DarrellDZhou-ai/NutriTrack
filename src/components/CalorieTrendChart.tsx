import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { GoalType } from '../types/nutrition';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export interface DayTrendPoint {
  date: string;
  dayLabel: string;
  shortDate: string;
  fullDate: string;
  calories: number;
  burnedCalories?: number;
  netCalories?: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  diff: number;
  netDiff?: number;
  isToday: boolean;
  isSelected: boolean;
  itemCount: number;
  exerciseCount?: number;
}

interface CalorieTrendChartProps {
  data: DayTrendPoint[];
  goal: GoalType;
  targetCalories: number;
  trendStats: {
    avgCalories: number;
    avgDiff: number;
    onTargetCount: number;
    adherenceRate: number;
    targetCalories: number;
    lowestDay?: DayTrendPoint;
    highestDay?: DayTrendPoint;
  };
  currentDate: string;
  onSelectDate: (date: string) => void;
}

// Custom tooltip for hover
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: DayTrendPoint = payload[0].payload;
    const diff = data.diff;
    const isOver = diff > 0;
    const isExact = Math.abs(diff) <= Math.round(data.targetCalories * 0.05);
    const hasBurned = (data.burnedCalories || 0) > 0;

    return (
      <div className="bg-stone-900 text-white rounded-xl p-3 shadow-xl border border-stone-800 text-xs min-w-[210px] space-y-1.5 z-50">
        <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
          <span className="font-bold text-stone-200">
            {data.fullDate} {data.isToday && '(Today)'}
          </span>
          <span className="text-[10px] text-stone-400">
            {data.itemCount} food items {data.exerciseCount ? `· ${data.exerciseCount} workout` : ''}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-stone-400">Consumed:</span>
          <span className="font-bold text-base text-emerald-400 font-display">
            {data.calories.toLocaleString()} <span className="text-xs font-normal text-stone-400">kcal</span>
          </span>
        </div>

        {hasBurned && (
          <div className="flex items-center justify-between text-[11px] text-orange-400">
            <span>Exercise Burn:</span>
            <span className="font-bold">+{data.burnedCalories} kcal</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-stone-300">
          <span className="text-stone-400">Daily Target:</span>
          <span>{data.targetCalories.toLocaleString()} kcal</span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <span className="text-stone-400">Difference:</span>
          <span
            className={`font-semibold ${
              isExact ? 'text-emerald-400' : isOver ? 'text-amber-400' : 'text-blue-400'
            }`}
          >
            {diff === 0 ? 'Exact Budget' : diff > 0 ? `+${diff} kcal over` : `${diff} kcal under`}
          </span>
        </div>

        {data.calories > 0 && (
          <div className="pt-1.5 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between">
            <span>{data.protein}g P</span>
            <span aria-hidden="true">·</span>
            <span>{data.carbs}g C</span>
            <span aria-hidden="true">·</span>
            <span>{data.fat}g F</span>
          </div>
        )}

        <div className="pt-1 text-[10px] text-emerald-300/80 italic text-center">
          Click point to view or log this day
        </div>
      </div>
    );
  }
  return null;
};

export const CalorieTrendChart: React.FC<CalorieTrendChartProps> = ({
  data,
  goal,
  targetCalories,
  trendStats,
  currentDate,
  onSelectDate,
}) => {
  // Determine min and max Y for optimal chart scaling
  const allCalValues = data.map((d) => d.calories).concat([targetCalories]);
  const minCal = Math.max(0, Math.min(...allCalValues) - 250);
  const maxCal = Math.max(...allCalValues) + 250;

  // Custom active dot renderer
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isSelected = payload.date === currentDate;
    const isToday = payload.isToday;

    return (
      <g key={payload.date} onClick={() => onSelectDate(payload.date)} className="cursor-pointer">
        {/* Glow halo if selected */}
        {isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r={11}
            fill="#10b981"
            fillOpacity={0.25}
            className="animate-pulse"
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 6 : isToday ? 5 : 4}
          fill={isSelected ? '#059669' : '#10b981'}
          stroke="#ffffff"
          strokeWidth={2}
          className="transition-all hover:r-6"
        />
      </g>
    );
  };

  const getConsistencyAssessment = () => {
    if (trendStats.adherenceRate >= 70) {
      return {
        headline: 'Exceptional Consistency',
        sub: `${trendStats.onTargetCount} of 7 days landed within your target calorie threshold. Steady consistency drives reliable ${goal === 'lose' ? 'fat loss' : goal === 'gain' ? 'muscle gain' : 'maintenance'}.`,
        badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200/80',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
      };
    }
    if (trendStats.adherenceRate >= 40) {
      return {
        headline: 'Moderate Consistency',
        sub: `${trendStats.onTargetCount} of 7 days on target. 7-day average intake is ${trendStats.avgCalories} kcal (${trendStats.avgDiff >= 0 ? `+${trendStats.avgDiff}` : trendStats.avgDiff} kcal vs target).`,
        badgeColor: 'text-amber-800 bg-amber-50 border-amber-200/80',
        icon: <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
      };
    }
    return {
      headline: 'Variable Pattern Detected',
      sub: `Caloric intake fluctuated across the week. Focus on planning pre-portioned meals to maintain the target ${targetCalories} kcal budget.`,
      badgeColor: 'text-stone-800 bg-stone-100 border-stone-200',
      icon: <AlertCircle className="w-3.5 h-3.5 text-stone-600 shrink-0" />,
    };
  };

  const assessment = getConsistencyAssessment();

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5 sm:p-6 lg:p-7 space-y-5">
      {/* Top Header & Consistency Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              7-Day Trend Analysis
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-xs text-stone-600 font-medium">
              Daily Caloric Intake vs Target
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-stone-900 font-display mt-0.5">
            Calorie Intake Consistency Pattern
          </h3>
        </div>

        {/* 3 Quick Stat Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
          <div className="p-2 sm:p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-left">
            <span className="text-[11px] text-stone-500 block">7-Day Avg</span>
            <span className="text-sm sm:text-base font-bold text-stone-900 font-display block">
              {trendStats.avgCalories.toLocaleString()}
            </span>
            <span className={`text-[10px] font-medium ${trendStats.avgDiff <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {trendStats.avgDiff === 0 ? 'On target' : trendStats.avgDiff > 0 ? `+${trendStats.avgDiff} kcal` : `${trendStats.avgDiff} kcal`}
            </span>
          </div>

          <div className="p-2 sm:p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-left">
            <span className="text-[11px] text-stone-500 block">Daily Target</span>
            <span className="text-sm sm:text-base font-bold text-stone-900 font-display block">
              {targetCalories.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-400 font-medium">
              {goal.toUpperCase()}
            </span>
          </div>

          <div className="p-2 sm:p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-left">
            <span className="text-[11px] text-stone-500 block">Adherence</span>
            <span className="text-sm sm:text-base font-bold text-emerald-700 font-display block">
              {trendStats.adherenceRate}%
            </span>
            <span className="text-[10px] text-stone-500 font-medium">
              {trendStats.onTargetCount} / 7 days
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Line / Area Chart */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 18, right: 12, left: -16, bottom: 4 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload.length) {
                onSelectDate(e.activePayload[0].payload.date);
              }
            }}
          >
            <defs>
              <linearGradient id="calorieAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="dayLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#78716c', fontSize: 12, fontWeight: 500 }}
              dy={6}
            />

            <YAxis
              domain={[minCal, maxCal]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a8a29e', fontSize: 11 }}
              tickFormatter={(val) => `${val}`}
              dx={-4}
            />

            {/* Target Budget Reference Line */}
            <ReferenceLine
              y={targetCalories}
              stroke="#64748b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Target: ${targetCalories} kcal`,
                position: 'top',
                fill: '#64748b',
                fontSize: 11,
                fontWeight: 600,
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Subtle Gradient Area Fill under the line */}
            <Area
              type="monotone"
              dataKey="calories"
              stroke="none"
              fill="url(#calorieAreaGradient)"
            />

            {/* Main Calorie Trajectory Line */}
            <Line
              type="monotone"
              dataKey="calories"
              stroke="#10b981"
              strokeWidth={3}
              dot={renderCustomDot}
              activeDot={{ r: 7, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Day Switcher Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
        <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
          Inspect Day:
        </span>
        {data.map((day) => {
          const isSelected = day.date === currentDate;
          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`flex flex-col items-center px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-stone-900 border-stone-900 text-white shadow-xs font-semibold'
                  : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200/80 text-stone-700'
              }`}
            >
              <span className="text-[10px] uppercase font-bold">{day.dayLabel}</span>
              <span className={`text-[11px] font-display font-bold ${isSelected ? 'text-emerald-400' : 'text-stone-900'}`}>
                {day.calories}
              </span>
            </button>
          );
        })}
      </div>

      {/* Consistency Pattern Insight Banner */}
      <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${assessment.badgeColor}`}>
        {assessment.icon}
        <div className="flex-1">
          <div className="font-semibold text-stone-900 flex items-center gap-2">
            <span>{assessment.headline}</span>
            <span className="text-[10px] text-stone-500 font-normal">
              (Current selection: {data.find((d) => d.date === currentDate)?.fullDate || currentDate})
            </span>
          </div>
          <p className="mt-0.5 text-stone-700 leading-relaxed">
            {assessment.sub}
          </p>
        </div>
      </div>
    </div>
  );
};
