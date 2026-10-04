import React, { useState } from 'react';
import { UserProfile, GoalPace } from '../types/nutrition';
import {
  generateWeightProjections,
  calculateNutritionTargets,
  kgToLbs,
} from '../utils/nutritionCalculator';
import { X, TrendingDown, TrendingUp, Calendar, Target, Award, ArrowRight } from 'lucide-react';

interface WeightProjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdatePace: (newPace: GoalPace) => void;
}

export const WeightProjectionModal: React.FC<WeightProjectionModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdatePace,
}) => {
  if (!isOpen) return null;

  const [previewPace, setPreviewPace] = useState<GoalPace>(profile.pace);

  // Generate projections with selected preview pace
  const simulatedProfile = { ...profile, pace: previewPace };
  const projections = generateWeightProjections(simulatedProfile, 12);
  const targets = calculateNutritionTargets(simulatedProfile);

  const formatWeight = (kg: number) => {
    return profile.unitSystem === 'metric' ? `${kg} kg` : `${kgToLbs(kg)} lbs`;
  };

  const finalWeight = projections[projections.length - 1].projectedWeightKg;
  const totalChangeKg = Math.round((finalWeight - profile.weightKg) * 10) / 10;

  // Find approximate week target weight is reached
  const targetWeight = profile.targetWeightKg;
  let targetWeekReached: number | null = null;
  if (targetWeight) {
    if (profile.goal === 'lose' && targetWeight < profile.weightKg) {
      const idx = projections.findIndex((p) => p.projectedWeightKg <= targetWeight);
      if (idx !== -1) targetWeekReached = idx;
    } else if (profile.goal === 'gain' && targetWeight > profile.weightKg) {
      const idx = projections.findIndex((p) => p.projectedWeightKg >= targetWeight);
      if (idx !== -1) targetWeekReached = idx;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-display">
                12-Week Weight Projection Simulator
              </h2>
              <p className="text-xs text-stone-500">
                Mathematical modeling based on thermodynamic energy balance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top summary card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <span className="text-stone-500 block">Starting Weight</span>
              <span className="text-lg font-bold text-stone-900 font-display mt-0.5 block">
                {formatWeight(profile.weightKg)}
              </span>
              <span className="text-[11px] text-stone-400">Recorded baseline</span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <span className="text-stone-500 block">12-Week Projection</span>
              <span className="text-lg font-bold text-stone-900 font-display mt-0.5 block">
                {formatWeight(finalWeight)}
              </span>
              <span className={`text-[11px] font-semibold ${totalChangeKg <= 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {totalChangeKg > 0 ? `+${totalChangeKg} kg` : `${totalChangeKg} kg`} total
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <span className="text-stone-500 block">Weekly Pace</span>
              <span className="text-lg font-bold text-stone-900 font-display mt-0.5 block">
                {targets.weeklyChangeEstimateKg > 0 ? `+${targets.weeklyChangeEstimateKg}` : targets.weeklyChangeEstimateKg} kg/wk
              </span>
              <span className="text-[11px] text-stone-400">
                {targets.calorieAdjustment > 0 ? `+${targets.calorieAdjustment}` : targets.calorieAdjustment} kcal/day
              </span>
            </div>
          </div>

          {/* Pace Selection Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700">
                Simulate Caloric Pace
              </label>
              {previewPace !== profile.pace && (
                <button
                  onClick={() => onUpdatePace(previewPace)}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  Apply this pace to my profile →
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'slow' as GoalPace, label: 'Gentle', sub: profile.goal === 'lose' ? '-250 kcal (~0.25kg/wk)' : '+250 kcal' },
                { id: 'moderate' as GoalPace, label: 'Standard (Recommended)', sub: profile.goal === 'lose' ? '-500 kcal (~0.5kg/wk)' : '+400 kcal' },
                { id: 'fast' as GoalPace, label: 'Aggressive', sub: profile.goal === 'lose' ? '-750 kcal (~0.75kg/wk)' : '+600 kcal' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPreviewPace(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    previewPace === p.id
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className={`text-[10px] mt-0.5 ${previewPace === p.id ? 'text-stone-300' : 'text-stone-500'}`}>
                    {p.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Goal milestone callout if reached */}
          {targetWeekReached !== null && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Target Weight Reached!</span>
                <p className="mt-0.5 text-stone-700">
                  At this pace, you are projected to reach your goal of <strong>{formatWeight(targetWeight)}</strong> around <strong>Week {targetWeekReached} ({projections[targetWeekReached].dateStr})</strong>.
                </p>
              </div>
            </div>
          )}

          {/* 12-Week Milestone Table */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Timeline Milestones
            </span>
            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
              {projections
                .filter((p) => [0, 2, 4, 6, 8, 10, 12].includes(p.week))
                .map((point) => (
                  <div key={point.week} className="p-3 bg-white flex items-center justify-between hover:bg-stone-50">
                    <div className="flex items-center gap-3">
                      <span className="w-16 font-semibold text-stone-800">
                        {point.week === 0 ? 'Baseline' : `Week ${point.week}`}
                      </span>
                      <span className="text-stone-400">{point.dateStr}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-stone-900 font-display">
                        {formatWeight(point.projectedWeightKg)}
                      </span>
                      <span className={`w-16 text-right font-medium ${point.weightLossKg < 0 ? 'text-amber-700' : point.weightLossKg > 0 ? 'text-emerald-700' : 'text-stone-400'}`}>
                        {point.weightLossKg === 0 ? '—' : `${point.weightLossKg > 0 ? '+' : ''}${point.weightLossKg} kg`}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
