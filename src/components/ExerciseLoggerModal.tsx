import React, { useState } from 'react';
import {
  ExerciseItem,
  ExerciseCategory,
  ExerciseIntensity,
} from '../types/nutrition';
import {
  PRESET_EXERCISES,
  PresetExercise,
  calculateBurnedCalories,
} from '../data/presetExercises';
import {
  X,
  Flame,
  Search,
  Plus,
  Sparkles,
  Loader2,
  Check,
  Activity,
  Dumbbell,
  Timer,
  ChevronRight,
} from 'lucide-react';

interface ExerciseLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  weightKg: number;
  onAddExercise: (exercise: Omit<ExerciseItem, 'id' | 'loggedAt'>) => void;
  onAnalyzeExercise: (query: string) => Promise<any>;
}

type TabType = 'preset' | 'ai' | 'manual';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Activities' },
  { id: 'cardio', label: 'Cardio & Running' },
  { id: 'strength', label: 'Gym & Strength' },
  { id: 'hiit', label: 'HIIT & Boxing' },
  { id: 'walking', label: 'Walking & Hiking' },
  { id: 'sports', label: 'Sports & Swimming' },
  { id: 'flexibility', label: 'Yoga & Mobility' },
];

export const ExerciseLoggerModal: React.FC<ExerciseLoggerModalProps> = ({
  isOpen,
  onClose,
  weightKg,
  onAddExercise,
  onAnalyzeExercise,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<TabType>('preset');

  // Preset tab state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<PresetExercise | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [intensity, setIntensity] = useState<ExerciseIntensity>('moderate');
  const [presetNotes, setPresetNotes] = useState('');

  // AI tab state
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual tab state
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState<ExerciseCategory>('cardio');
  const [manualDuration, setManualDuration] = useState('30');
  const [manualCalories, setManualCalories] = useState('');
  const [manualIntensity, setManualIntensity] = useState<ExerciseIntensity>('moderate');

  // Calculate live preview calories for preset
  const calculatedBurnedCalories = selectedPreset
    ? calculateBurnedCalories(selectedPreset.baseMet, weightKg, durationMinutes, intensity)
    : 0;

  // Filter presets
  const filteredPresets = PRESET_EXERCISES.filter((ex) => {
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectPreset = (preset: PresetExercise) => {
    setSelectedPreset(preset);
    setDurationMinutes(preset.defaultDurationMinutes);
    setIntensity('moderate');
    setPresetNotes('');
  };

  const handleConfirmPreset = () => {
    if (!selectedPreset) return;
    onAddExercise({
      name: selectedPreset.name,
      category: selectedPreset.category,
      durationMinutes: Number(durationMinutes) || 30,
      caloriesBurned: calculatedBurnedCalories,
      intensity,
      notes: presetNotes.trim() || undefined,
      source: 'preset',
    });
    handleClose();
  };

  const handleRunAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const data = await onAnalyzeExercise(aiQuery.trim());
      setAiResult(data);
    } catch (err: any) {
      setAiError(err?.message || 'Failed to estimate workout. Try standard presets.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleConfirmAiActivities = () => {
    if (!aiResult || !aiResult.activities) return;

    aiResult.activities.forEach((act: any) => {
      onAddExercise({
        name: act.name,
        category: (act.category as ExerciseCategory) || 'cardio',
        durationMinutes: Number(act.durationMinutes) || 30,
        caloriesBurned: Number(act.caloriesBurned) || 150,
        intensity: (act.intensity as ExerciseIntensity) || 'moderate',
        notes: act.notes || aiResult.sessionTitle,
        source: 'ai',
      });
    });

    handleClose();
  };

  const handleConfirmManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualCalories) return;

    onAddExercise({
      name: manualName.trim(),
      category: manualCategory,
      durationMinutes: Number(manualDuration) || 30,
      caloriesBurned: Number(manualCalories) || 0,
      intensity: manualIntensity,
      source: 'manual',
    });

    handleClose();
  };

  const handleClose = () => {
    setSelectedPreset(null);
    setAiResult(null);
    setAiError(null);
    setAiQuery('');
    setManualName('');
    setManualCalories('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-display">
                Log Physical Activity & Calorie Burn
              </h2>
              <p className="text-xs text-stone-500">
                Exercise calories automatically expand your remaining budget for the day.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-stone-100 bg-white">
          <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('preset')}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'preset'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-orange-600" />
              <span>Standard Activities</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Workout Estimator</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-stone-600" />
              <span>Custom Entry</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: PRESET EXERCISES */}
          {activeTab === 'preset' && (
            <div className="space-y-4">
              {selectedPreset ? (
                /* Selected Preset Customization View */
                <div className="p-4 bg-orange-50/60 border border-orange-200/80 rounded-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-orange-200/60">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm font-display">
                        {selectedPreset.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {selectedPreset.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPreset(null)}
                      className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    >
                      Change activity
                    </button>
                  </div>

                  {/* Duration Slider & Inputs */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                      <span>Duration (Minutes)</span>
                      <span className="font-bold text-stone-900 font-display text-sm">
                        {durationMinutes} mins
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="180"
                        step="5"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="flex-1 accent-orange-600 cursor-pointer"
                      />
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                        className="w-16 px-2 py-1 text-xs border border-stone-300 rounded-lg text-center font-bold"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[15, 30, 45, 60, 90].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDurationMinutes(mins)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            durationMinutes === mins
                              ? 'bg-orange-600 text-white'
                              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intensity Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-700">
                      Intensity Level
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'light' as ExerciseIntensity, label: 'Light', desc: 'Gentle, conversational' },
                        { id: 'moderate' as ExerciseIntensity, label: 'Moderate', desc: 'Noticeable sweat & breathing' },
                        { id: 'vigorous' as ExerciseIntensity, label: 'Vigorous', desc: 'High heart rate, breathless' },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setIntensity(lvl.id)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            intensity === lvl.id
                              ? 'bg-white border-orange-600 ring-2 ring-orange-500/20 text-stone-900 font-semibold shadow-xs'
                              : 'bg-white/80 border-stone-200 text-stone-600 hover:bg-white'
                          }`}
                        >
                          <div className="font-bold text-xs">{lvl.label}</div>
                          <div className="text-[10px] text-stone-400 mt-0.5 leading-tight">{lvl.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Workout Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={presetNotes}
                      onChange={(e) => setPresetNotes(e.target.value)}
                      placeholder="e.g. 5.2 km distance, feeling strong"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  {/* Calculated Result Card */}
                  <div className="p-3.5 bg-white rounded-xl border border-orange-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-500 block">Personalized Energy Burn ({weightKg} kg):</span>
                      <span className="text-xl font-bold text-orange-600 font-display flex items-center gap-1.5 mt-0.5">
                        <Flame className="w-5 h-5 text-orange-600" />
                        +{calculatedBurnedCalories.toLocaleString()} kcal burned
                      </span>
                    </div>
                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md font-medium">
                      + Added to Remaining
                    </span>
                  </div>

                  {/* Action */}
                  <button
                    onClick={handleConfirmPreset}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Log {durationMinutes} mins · +{calculatedBurnedCalories} kcal</span>
                  </button>
                </div>
              ) : (
                /* Preset Selection List */
                <div className="space-y-3">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search activities (running, cycling, lifting, swimming, yoga...)"
                      className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Preset items list */}
                  <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto border border-stone-200 rounded-xl">
                    {filteredPresets.length === 0 ? (
                      <div className="p-5 text-center text-xs text-stone-400">
                        No activities found matching "{searchQuery}".
                      </div>
                    ) : (
                      filteredPresets.map((ex) => {
                        const estBurn = calculateBurnedCalories(ex.baseMet, weightKg, ex.defaultDurationMinutes, 'moderate');
                        return (
                          <div
                            key={ex.id}
                            onClick={() => handleSelectPreset(ex)}
                            className="p-3 hover:bg-stone-50 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="font-semibold text-stone-900 text-xs">{ex.name}</div>
                              <div className="text-[11px] text-stone-500 mt-0.5">
                                {ex.defaultDurationMinutes} mins · {ex.description}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="font-bold text-orange-600 text-xs font-display">
                                  ~{estBurn} kcal
                                </span>
                                <div className="text-[10px] text-stone-400">at {weightKg} kg</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-stone-300" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI WORKOUT ESTIMATOR */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {!aiResult ? (
                <form onSubmit={handleRunAi} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Describe your workout or physical activity
                    </label>
                    <textarea
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="e.g. 5k outdoor run in 28 minutes, followed by 20 minutes of core abs and pull-ups"
                      rows={3}
                      className="w-full text-xs rounded-xl border border-stone-300 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:text-stone-400"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '30 min incline treadmill walk at 12% incline',
                      '1 hour heavy leg workout with squats and lunges',
                      '45 mins energetic tennis match',
                      '20 min HIIT sprint interval session',
                    ].map((example, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAiQuery(example)}
                        className="text-[11px] text-stone-600 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md transition-colors text-left"
                      >
                        {example}
                      </button>
                    ))}
                  </div>

                  {aiError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                      {aiError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAiLoading || !aiQuery.trim()}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Estimating calorie expenditure...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Estimate Workout Calories Burned</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* AI RESULT REVIEW */
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-sm font-display">
                        {aiResult.sessionTitle}
                      </h4>
                      <span className="text-xs font-bold text-orange-700 bg-white px-2.5 py-0.5 rounded-md border border-orange-200 font-display">
                        +{aiResult.totalCaloriesBurned} kcal Burned
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 font-medium">
                      Total Duration: {aiResult.totalDurationMinutes} mins · {aiResult.activities?.length || 0} activities identified
                    </div>

                    {aiResult.recoveryAdvice && (
                      <p className="text-xs text-stone-600 italic pt-1 border-t border-orange-200/60">
                        "{aiResult.recoveryAdvice}"
                      </p>
                    )}
                  </div>

                  <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden text-xs">
                    {aiResult.activities?.map((act: any, idx: number) => (
                      <div key={idx} className="p-3 flex items-center justify-between bg-white">
                        <div>
                          <div className="font-semibold text-stone-900">{act.name}</div>
                          <div className="text-stone-500 text-[11px]">
                            {act.durationMinutes} mins · {act.intensity} intensity · {act.category}
                          </div>
                        </div>
                        <span className="font-bold text-orange-600 font-display text-sm">
                          +{act.caloriesBurned} kcal
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAiResult(null)}
                      className="w-1/3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      Re-estimate
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAiActivities}
                      className="w-2/3 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Log Activities (+{aiResult.totalCaloriesBurned} kcal)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUICK CUSTOM */}
          {activeTab === 'manual' && (
            <form onSubmit={handleConfirmManual} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Exercise / Activity Name*
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Boxing Sparring, Yard Work, Mountain Biking"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as ExerciseCategory)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="cardio">Cardio & Running</option>
                    <option value="strength">Gym & Strength</option>
                    <option value="hiit">HIIT & Circuits</option>
                    <option value="sports">Sports & Swimming</option>
                    <option value="walking">Walking & Hiking</option>
                    <option value="flexibility">Yoga & Mobility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Intensity
                  </label>
                  <select
                    value={manualIntensity}
                    onChange={(e) => setManualIntensity(e.target.value as ExerciseIntensity)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="vigorous">Vigorous</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Duration (Minutes)*
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    placeholder="30"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Calories Burned (kcal)*
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    placeholder="250"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold text-orange-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Log Activity</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
