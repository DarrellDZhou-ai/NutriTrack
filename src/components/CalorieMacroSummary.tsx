import React from 'react';
import { UserProfile, NutritionTarget } from '../types/nutrition';
import { Flame, Activity, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface CalorieMacroSummaryProps {
  profile: UserProfile;
  targets: NutritionTarget;
  dayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  dayBurnedCalories: number;
  netCalories: number;
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  onOpenCoach: () => void;
  onOpenProfile: () => void;
  onOpenExerciseLogger: () => void;
}

export const CalorieMacroSummary: React.FC<CalorieMacroSummaryProps> = ({
  profile,
  targets,
  dayTotals,
  dayBurnedCalories,
  netCalories,
  remaining,
  onOpenCoach,
  onOpenProfile,
  onOpenExerciseLogger,
}) => {
  // Effective calorie allowance = Base target + Exercise burned
  const effectiveCalorieBudget = targets.targetCalories + dayBurnedCalories;
  const percentCalories = Math.min(100, Math.round((dayTotals.calories / effectiveCalorieBudget) * 100));
  const isOverCalories = remaining.calories < 0;

  // Macro percentages
  const pPercent = Math.min(100, Math.round((dayTotals.protein / targets.targetProteinG) * 100));
  const cPercent = Math.min(100, Math.round((dayTotals.carbs / targets.targetCarbsG) * 100));
  const fPercent = Math.min(100, Math.round((dayTotals.fat / targets.targetFatG) * 100));
  const fibPercent = Math.min(100, Math.round((dayTotals.fiber / targets.targetFiberG) * 100));

  // Goal descriptive message
  const getGoalExplanation = () => {
    if (profile.goal === 'lose') {
      return {
        title: 'Caloric Deficit for Fat Loss',
        body: `Your body burns ~${targets.tdee} kcal/day (TDEE). With a ${Math.abs(targets.calorieAdjustment)} kcal daily deficit, your target is ${targets.targetCalories} kcal. This projects to ~${Math.abs(targets.weeklyChangeEstimateKg)} kg lost per week while high protein protects muscle.`,
        theme: 'text-amber-800 bg-amber-50/70 border-amber-200/80',
      };
    }
    if (profile.goal === 'gain') {
      return {
        title: 'Caloric Surplus for Lean Muscle Growth',
        body: `Your maintenance TDEE is ~${targets.tdee} kcal/day. Consuming ${targets.targetCalories} kcal (+${targets.calorieAdjustment} kcal surplus) supplies the metabolic energy needed for hypertrophy and tissue synthesis without excessive fat gain.`,
        theme: 'text-emerald-900 bg-emerald-50/70 border-emerald-200/80',
      };
    }
    return {
      title: 'Energy Balance for Weight Maintenance',
      body: `Your target of ${targets.targetCalories} kcal precisely matches your Total Daily Energy Expenditure (~${targets.tdee} kcal). This keeps your weight stable at ~${profile.weightKg} kg and maintains peak hormonal balance.`,
      theme: 'text-blue-900 bg-blue-50/70 border-blue-200/80',
    };
  };

  const goalInfo = getGoalExplanation();

  // SVG Radial Gauge parameters
  const strokeWidth = 10;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, percentCalories) / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-5 sm:p-6 lg:p-7">
      {/* Top row: Goal overview & Quick strategy link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Daily Target · {profile.goal.toUpperCase()}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-xs text-stone-600 font-medium">
              Diet: {profile.dietType.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 font-display mt-0.5">
            {targets.targetCalories.toLocaleString()} <span className="text-base font-normal text-stone-500">kcal budget</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right text-xs text-stone-500">
            <div>BMR: <span className="font-semibold text-stone-700">{targets.bmr}</span> kcal</div>
            <div>TDEE: <span className="font-semibold text-stone-700">{targets.tdee}</span> kcal</div>
          </div>
          <button
            onClick={onOpenCoach}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-200/60 transition-colors cursor-pointer"
          >
            <span>Strategy Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Calorie Ring on left, Macro bars on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pt-6">
        {/* Left: Calorie Ring / Gauge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-6 bg-stone-50/70 p-5 rounded-xl border border-stone-100">
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-stone-200"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`transition-all duration-700 ease-out ${
                  isOverCalories ? 'stroke-rose-500' : 'stroke-emerald-500'
                }`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs uppercase font-medium text-stone-500">
                {isOverCalories ? 'Over by' : 'Remaining'}
              </span>
              <span
                className={`text-2xl font-bold font-display ${
                  isOverCalories ? 'text-rose-600' : 'text-stone-900'
                }`}
              >
                {Math.abs(remaining.calories).toLocaleString()}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">kcal</span>
            </div>
          </div>

          {/* Breakdown numbers */}
          <div className="flex flex-col gap-2 text-xs w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <span className="text-stone-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-800 shrink-0" />
                Food Consumed
              </span>
              <span className="font-bold text-stone-900 font-display">
                {dayTotals.calories.toLocaleString()} kcal
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-4">
              <span className="text-stone-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                Exercise Burned
              </span>
              <span className="font-bold text-orange-600 font-display">
                +{dayBurnedCalories.toLocaleString()} kcal
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-4">
              <span className="text-stone-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300 shrink-0" />
                Base Target
              </span>
              <span className="font-semibold text-stone-700 font-display">
                {targets.targetCalories.toLocaleString()} kcal
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-4 pt-1 border-t border-stone-200">
              <span className="text-stone-500">Net Calories</span>
              <span className="font-bold text-stone-800 font-display">
                {netCalories.toLocaleString()} kcal
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-4">
              <span className="text-stone-500">Allowance Used</span>
              <span className={`font-semibold ${isOverCalories ? 'text-rose-600' : 'text-emerald-700'}`}>
                {percentCalories}%
              </span>
            </div>

            <button
              onClick={onOpenExerciseLogger}
              className="mt-1 flex items-center justify-center gap-1 py-1 px-2 text-[11px] font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100/80 rounded-lg border border-orange-200/60 transition-colors cursor-pointer"
            >
              <Flame className="w-3 h-3 text-orange-600" />
              <span>+ Log Exercise Burn</span>
            </button>
          </div>
        </div>

        {/* Right: Macronutrient Bars (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          {/* Protein */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                Protein
                <span className="text-stone-400 font-normal">
                  ({targets.targetProteinG}g target)
                </span>
              </span>
              <div className="text-stone-600">
                <span className="font-bold text-stone-900">{Math.round(dayTotals.protein)}g</span>
                <span className="text-stone-400"> / {targets.targetProteinG}g</span>
                <span className="text-stone-400 font-light ml-1.5">
                  ({remaining.protein > 0 ? `${remaining.protein}g left` : 'Goal met'})
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${pPercent}%` }}
              />
            </div>
          </div>

          {/* Carbohydrates */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                Carbohydrates
                <span className="text-stone-400 font-normal">
                  ({targets.targetCarbsG}g target)
                </span>
              </span>
              <div className="text-stone-600">
                <span className="font-bold text-stone-900">{Math.round(dayTotals.carbs)}g</span>
                <span className="text-stone-400"> / {targets.targetCarbsG}g</span>
                <span className="text-stone-400 font-light ml-1.5">
                  ({remaining.carbs > 0 ? `${remaining.carbs}g left` : 'Met'})
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${cPercent}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                Healthy Fats
                <span className="text-stone-400 font-normal">
                  ({targets.targetFatG}g target)
                </span>
              </span>
              <div className="text-stone-600">
                <span className="font-bold text-stone-900">{Math.round(dayTotals.fat)}g</span>
                <span className="text-stone-400"> / {targets.targetFatG}g</span>
                <span className="text-stone-400 font-light ml-1.5">
                  ({remaining.fat > 0 ? `${remaining.fat}g left` : 'Met'})
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${fPercent}%` }}
              />
            </div>
          </div>

          {/* Fiber & Ratio indicators */}
          <div className="flex flex-wrap items-center justify-between pt-2 text-[11px] text-stone-500 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <span className="font-medium text-stone-700">Fiber:</span>
              <span>{Math.round(dayTotals.fiber)}g of {targets.targetFiberG}g goal ({fibPercent}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Ratio eaten:</span>
              <span className="font-medium text-stone-700">
                {dayTotals.calories > 0
                  ? `${Math.round(((dayTotals.protein * 4) / dayTotals.calories) * 100)}% P · ${Math.round(((dayTotals.carbs * 4) / dayTotals.calories) * 100)}% C · ${Math.round(((dayTotals.fat * 9) / dayTotals.calories) * 100)}% F`
                  : '0% P · 0% C · 0% F'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Energy Balance Formula Strip */}
      <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-stone-600 font-medium">
          <span className="font-semibold text-stone-900">Energy Equation:</span>
          <span>{targets.targetCalories.toLocaleString()} Base</span>
          <span className="text-stone-400">−</span>
          <span>{dayTotals.calories.toLocaleString()} Eaten</span>
          <span className="text-orange-500 font-bold">+</span>
          <span className="text-orange-600 font-semibold">{dayBurnedCalories.toLocaleString()} Burned</span>
          <span className="text-stone-400">=</span>
          <span className={`font-bold font-display ${remaining.calories >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {remaining.calories.toLocaleString()} kcal Remaining
          </span>
        </div>
        {dayBurnedCalories > 0 && (
          <span className="text-[11px] text-orange-800 bg-orange-50 px-2 py-0.5 rounded border border-orange-200/60 font-medium flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-600" />
            <span>+{dayBurnedCalories} kcal active workout buffer</span>
          </span>
        )}
      </div>

      {/* Goal Strategic Callout */}
      <div className={`mt-5 p-3.5 rounded-xl border text-xs flex items-start gap-3 ${goalInfo.theme}`}>
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-current opacity-80" />
        <div className="flex-1">
          <div className="font-semibold text-stone-900">{goalInfo.title}</div>
          <p className="mt-0.5 text-stone-700 leading-relaxed">{goalInfo.body}</p>
        </div>
        <button
          onClick={onOpenProfile}
          className="text-stone-600 hover:text-stone-900 underline text-[11px] shrink-0 font-medium cursor-pointer"
        >
          Adjust Target
        </button>
      </div>
    </div>
  );
};
