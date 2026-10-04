import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Settings2,
  Scale,
  Flame,
} from 'lucide-react';
import { UserProfile, NutritionTarget } from '../types/nutrition';
import { kgToLbs } from '../utils/nutritionCalculator';

interface HeaderProps {
  profile: UserProfile;
  targets: NutritionTarget;
  currentDate: string;
  onDateChange: (date: string) => void;
  onOpenProfile: () => void;
  onOpenCoach: () => void;
  onOpenProjection: () => void;
  onToggleUnit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  targets,
  currentDate,
  onDateChange,
  onOpenProfile,
  onOpenCoach,
  onOpenProjection,
  onToggleUnit,
}) => {
  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return currentDate === today;
  };

  const shiftDate = (days: number) => {
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const formatDateDisplay = () => {
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(year, month - 1, day);
    checkDate.setHours(0, 0, 0, 0);

    const diffTime = checkDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (diffDays === -1) return 'Yesterday, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (diffDays === 1) return 'Tomorrow, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getGoalBadgeText = () => {
    if (profile.goal === 'lose') {
      return `Fat Loss · ${Math.abs(targets.calorieAdjustment)} kcal Deficit`;
    }
    if (profile.goal === 'gain') {
      return `Muscle Gain · +${targets.calorieAdjustment} kcal Surplus`;
    }
    return 'Weight Maintenance · Equilibrium';
  };

  const displayWeight = profile.unitSystem === 'metric'
    ? `${profile.weightKg} kg`
    : `${kgToLbs(profile.weightKg)} lbs`;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Goal context */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm text-white">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-stone-900 font-display">
                  NutriTrack
                </h1>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  {profile.goal === 'lose' ? 'Lose Weight' : profile.goal === 'gain' ? 'Gain Weight' : 'Maintain'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                <span>{getGoalBadgeText()}</span>
                <span aria-hidden="true">·</span>
                <button
                  onClick={onToggleUnit}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                  title="Click to toggle units"
                >
                  {displayWeight} ({profile.unitSystem.toUpperCase()})
                </button>
              </div>
            </div>
          </div>

          {/* Mobile date switcher shortcut */}
          <div className="flex md:hidden items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => shiftDate(-1)}
              className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-white transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-stone-800 px-2">
              {formatDateDisplay().split(',')[0]}
            </span>
            <button
              onClick={() => shiftDate(1)}
              className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-white transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Desktop Date Picker */}
        <div className="hidden md:flex items-center gap-2 bg-stone-100/90 p-1 rounded-xl border border-stone-200/60">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-white transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-xs text-xs font-semibold text-stone-800">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{formatDateDisplay()}</span>
          </div>

          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-white transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday() && (
            <button
              onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              Back to Today
            </button>
          )}
        </div>

        {/* Right actions: Diet Coach, Timeline, Settings */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onOpenCoach}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300/80 rounded-lg transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Diet Strategy & AI Coach</span>
          </button>

          <button
            onClick={onOpenProjection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200/80 rounded-lg transition-colors cursor-pointer"
            title="View weight projection timeline"
          >
            <TrendingUp className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Weight Timeline</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="p-2 text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200/80 rounded-lg transition-colors cursor-pointer"
            title="Edit profile & calorie targets"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
