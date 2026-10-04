import React, { useState } from 'react';
import {
  UserProfile,
  GoalType,
  GoalPace,
  ActivityLevel,
  DietType,
  UnitSystem,
} from '../types/nutrition';
import {
  calculateBMR,
  calculateTDEE,
  calculateNutritionTargets,
  kgToLbs,
  lbsToKg,
} from '../utils/nutritionCalculator';
import {
  X,
  Settings2,
  Check,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => { success: boolean; error?: string };
  onResetData: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onExportData,
  onImportData,
  onResetData,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<UserProfile>({ ...profile });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Live calculation of preview targets
  const previewTargets = calculateNutritionTargets(form);

  const handleWeightChange = (valStr: string) => {
    const val = parseFloat(valStr) || 0;
    if (form.unitSystem === 'metric') {
      setForm((p) => ({ ...p, weightKg: val }));
    } else {
      setForm((p) => ({ ...p, weightKg: lbsToKg(val) }));
    }
  };

  const handleTargetWeightChange = (valStr: string) => {
    const val = parseFloat(valStr) || 0;
    if (form.unitSystem === 'metric') {
      setForm((p) => ({ ...p, targetWeightKg: val }));
    } else {
      setForm((p) => ({ ...p, targetWeightKg: lbsToKg(val) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(form);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = onImportData(text);
      if (res.success) {
        setImportStatus('Data imported successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setImportStatus(`Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-display">
                Profile & Nutrition Target Calculator
              </h2>
              <p className="text-xs text-stone-500">
                Adjust your physiology parameters and dietary preferences.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Target Summary Preview Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Calculated Daily Calorie Target
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {form.goal.toUpperCase()}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900 font-display">
                {previewTargets.targetCalories.toLocaleString()}
              </span>
              <span className="text-xs text-stone-500 font-medium">kcal / day</span>
              <span className="text-xs text-emerald-800 ml-auto font-medium">
                TDEE: {previewTargets.tdee} kcal · BMR: {previewTargets.bmr} kcal
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-emerald-200/60 text-xs text-stone-700 font-medium">
              <span>Protein: <strong>{previewTargets.targetProteinG}g</strong></span>
              <span aria-hidden="true">·</span>
              <span>Carbs: <strong>{previewTargets.targetCarbsG}g</strong></span>
              <span aria-hidden="true">·</span>
              <span>Fat: <strong>{previewTargets.targetFatG}g</strong></span>
              <span aria-hidden="true">·</span>
              <span>Rate: <strong>{previewTargets.weeklyChangeEstimateKg > 0 ? `+${previewTargets.weeklyChangeEstimateKg}` : previewTargets.weeklyChangeEstimateKg} kg/wk</strong></span>
            </div>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Primary Weight Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lose' as GoalType, label: 'Lose Weight', sub: 'Caloric Deficit' },
                { id: 'maintain' as GoalType, label: 'Maintain Weight', sub: 'Energy Equilibrium' },
                { id: 'gain' as GoalType, label: 'Gain Weight', sub: 'Lean Muscle Surplus' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, goal: g.id }))}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    form.goal === g.id
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs font-semibold'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="text-xs font-bold">{g.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{g.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Caloric Pace */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Pace / Aggressiveness
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'slow' as GoalPace, label: 'Gentle', desc: form.goal === 'lose' ? '-250 kcal/day' : '+250 kcal/day' },
                { id: 'moderate' as GoalPace, label: 'Standard (Optimal)', desc: form.goal === 'lose' ? '-500 kcal/day' : '+400 kcal/day' },
                { id: 'fast' as GoalPace, label: 'Aggressive', desc: form.goal === 'lose' ? '-750 kcal/day' : '+600 kcal/day' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, pace: p.id }))}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    form.pace === p.id
                      ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className={`text-[10px] mt-0.5 ${form.pace === p.id ? 'text-stone-300' : 'text-stone-500'}`}>
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Biometrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as 'male' | 'female' }))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Age (years)
              </label>
              <input
                type="number"
                min="14"
                max="100"
                value={form.age}
                onChange={(e) => setForm((p) => ({ ...p, age: parseInt(e.target.value) || 25 }))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                min="100"
                max="250"
                value={form.heightCm}
                onChange={(e) => setForm((p) => ({ ...p, heightCm: parseInt(e.target.value) || 170 }))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Current Weight ({form.unitSystem === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                step="0.1"
                value={form.unitSystem === 'metric' ? form.weightKg : kgToLbs(form.weightKg)}
                onChange={(e) => handleWeightChange(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Goal Weight ({form.unitSystem === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                step="0.1"
                value={form.unitSystem === 'metric' ? form.targetWeightKg : kgToLbs(form.targetWeightKg)}
                onChange={(e) => handleTargetWeightChange(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Daily Activity Level
              </label>
              <select
                value={form.activityLevel}
                onChange={(e) => setForm((p) => ({ ...p, activityLevel: e.target.value as ActivityLevel }))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="sedentary">Sedentary (Desk job, little exercise · 1.2x)</option>
                <option value="light">Lightly Active (1-3 days exercise/week · 1.375x)</option>
                <option value="moderate">Moderately Active (3-5 days workout/week · 1.55x)</option>
                <option value="very_active">Very Active (6-7 days hard training · 1.725x)</option>
                <option value="extra_active">Extra Active (Athlete / Physical labor · 1.9x)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Dietary Strategy Type
              </label>
              <select
                value={form.dietType}
                onChange={(e) => setForm((p) => ({ ...p, dietType: e.target.value as DietType }))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="high_protein">High Protein (35% P, 40% C, 25% F) - Recommended</option>
                <option value="balanced">Balanced Macro Split (28% P, 47% C, 25% F)</option>
                <option value="low_carb">Low Carbohydrate (30% P, 20% C, 50% F)</option>
                <option value="mediterranean">Mediterranean Diet (25% P, 45% C, 30% F)</option>
                <option value="plant_based">Plant-Based / Vegan (22% P, 58% C, 20% F)</option>
                <option value="keto">Ketogenic (25% P, 5% C, 70% F)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Display Unit System
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, unitSystem: 'metric' }))}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    form.unitSystem === 'metric'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  Metric (kg / cm)
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, unitSystem: 'imperial' }))}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    form.unitSystem === 'imperial'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  Imperial (lbs / in)
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Dietary Notes, Allergies, or Preferences
            </label>
            <input
              type="text"
              value={form.allergiesOrPreferences}
              onChange={(e) => setForm((p) => ({ ...p, allergiesOrPreferences: e.target.value }))}
              placeholder="e.g. Gluten-sensitive, dairy-conscious, vegetarian, no shellfish"
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Backup & Data Management */}
          <div className="pt-4 border-t border-stone-200">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Data Management & Backup
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import Backup</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset your profile and data back to initial demo state?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Sample Data</span>
              </button>
            </div>
            {importStatus && (
              <p className="text-xs text-emerald-700 mt-2 font-medium">{importStatus}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Update Calorie Targets</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
