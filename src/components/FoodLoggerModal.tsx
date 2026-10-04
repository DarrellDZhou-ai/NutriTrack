import React, { useState, useRef } from 'react';
import { MealCategory, FoodItem } from '../types/nutrition';
import { PRESET_FOODS, PresetFood } from '../data/presetFoods';
import {
  X,
  Sparkles,
  Search,
  Plus,
  Camera,
  Upload,
  Loader2,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';

interface FoodLoggerModalProps {
  isOpen: boolean;
  category: MealCategory;
  onClose: () => void;
  onAddFood: (item: Omit<FoodItem, 'id' | 'loggedAt'>) => void;
  onAddMultipleFoods: (items: Omit<FoodItem, 'id' | 'loggedAt'>[]) => void;
  onAnalyzeFood: (payload: { query?: string; imageBase64?: string; mimeType?: string }) => Promise<any>;
  isAnalyzing: boolean;
}

type TabType = 'ai' | 'search' | 'manual';

export const FoodLoggerModal: React.FC<FoodLoggerModalProps> = ({
  isOpen,
  category,
  onClose,
  onAddFood,
  onAddMultipleFoods,
  onAnalyzeFood,
  isAnalyzing,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<TabType>('ai');

  // AI Tab State
  const [aiText, setAiText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search Tab State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedPreset, setSelectedPreset] = useState<PresetFood | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);

  // Manual Tab State
  const [manualName, setManualName] = useState('');
  const [manualServing, setManualServing] = useState('1 serving');
  const [manualCal, setManualCal] = useState('');
  const [manualP, setManualP] = useState('');
  const [manualC, setManualC] = useState('');
  const [manualF, setManualF] = useState('');
  const [manualFib, setManualFib] = useState('');

  // Handle Photo Selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit AI Request
  const handleRunAiAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiText.trim() && !selectedImage) {
      setAiError('Please enter a description or upload a meal photo.');
      return;
    }

    setAiError(null);
    setAiAnalysisResult(null);

    try {
      const data = await onAnalyzeFood({
        query: aiText.trim() || undefined,
        imageBase64: selectedImage || undefined,
        mimeType: imageMime,
      });
      setAiAnalysisResult(data);
    } catch (err: any) {
      setAiError(err?.message || 'Failed to analyze food. Please check your inputs or try manual entry.');
    }
  };

  // Add AI Analyzed Items to Log
  const handleConfirmAiItems = () => {
    if (!aiAnalysisResult || !aiAnalysisResult.items) return;

    const itemsToAdd = aiAnalysisResult.items.map((item: any) => ({
      mealType: category,
      name: item.name,
      servingSize: item.servingSize || '1 portion',
      calories: Number(item.calories) || 0,
      protein: Number(item.protein) || 0,
      carbs: Number(item.carbs) || 0,
      fat: Number(item.fat) || 0,
      fiber: Number(item.fiber) || 0,
      notes: item.notes || aiAnalysisResult.mealTitle,
      source: 'ai' as const,
    }));

    onAddMultipleFoods(itemsToAdd);
    onClose();
    resetModalState();
  };

  // Add Preset Food
  const handleAddPreset = () => {
    if (!selectedPreset) return;

    const mult = portionMultiplier || 1;
    const itemToAdd: Omit<FoodItem, 'id' | 'loggedAt'> = {
      mealType: category,
      name: selectedPreset.name,
      servingSize: mult === 1 ? selectedPreset.servingSize : `${mult}x (${selectedPreset.servingSize})`,
      calories: Math.round(selectedPreset.calories * mult),
      protein: Math.round(selectedPreset.protein * mult * 10) / 10,
      carbs: Math.round(selectedPreset.carbs * mult * 10) / 10,
      fat: Math.round(selectedPreset.fat * mult * 10) / 10,
      fiber: Math.round(selectedPreset.fiber * mult * 10) / 10,
      notes: `${selectedPreset.category}`,
      source: 'preset',
    };

    onAddFood(itemToAdd);
    onClose();
    resetModalState();
  };

  // Add Manual Food
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const itemToAdd: Omit<FoodItem, 'id' | 'loggedAt'> = {
      mealType: category,
      name: manualName.trim(),
      servingSize: manualServing.trim() || '1 serving',
      calories: Math.max(0, Number(manualCal) || 0),
      protein: Math.max(0, Number(manualP) || 0),
      carbs: Math.max(0, Number(manualC) || 0),
      fat: Math.max(0, Number(manualF) || 0),
      fiber: Math.max(0, Number(manualFib) || 0),
      source: 'manual',
    };

    onAddFood(itemToAdd);
    onClose();
    resetModalState();
  };

  const resetModalState = () => {
    setAiText('');
    setSelectedImage(null);
    setAiAnalysisResult(null);
    setAiError(null);
    setSelectedPreset(null);
    setPortionMultiplier(1);
    setManualName('');
    setManualServing('1 serving');
    setManualCal('');
    setManualP('');
    setManualC('');
    setManualF('');
    setManualFib('');
  };

  // Filter Presets
  const filteredPresets = PRESET_FOODS.filter((f) => {
    const matchesQuery =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'All' || f.category === selectedCategoryFilter;
    return matchesQuery && matchesCategory;
  });

  const CATEGORY_TABS = ['All', 'Proteins', 'Carbohydrates', 'Healthy Fats', 'Fruits & Vegetables', 'Meals & Snacks', 'Drinks'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-display">
              Add Food to {category.charAt(0).toUpperCase() + category.slice(1)}
            </h2>
            <p className="text-xs text-stone-500">
              Use Gemini AI scanner, search standard database, or type manually.
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              resetModalState();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Controls for Tabs */}
        <div className="px-6 pt-3 pb-1 border-b border-stone-100 bg-white">
          <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Meal Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-stone-600" />
              <span>Search Database</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-stone-600" />
              <span>Quick Custom</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: AI SCANNER */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              {!aiAnalysisResult ? (
                <form onSubmit={handleRunAiAnalysis} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Describe your meal or plate in natural language
                    </label>
                    <textarea
                      value={aiText}
                      onChange={(e) => setAiText(e.target.value)}
                      placeholder="e.g. 2 scrambled eggs with spinach, 2 slices whole grain toast with butter, and a cup of black coffee"
                      rows={3}
                      className="w-full text-sm rounded-xl border border-stone-300 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-stone-400"
                    />
                  </div>

                  {/* Photo Upload / Camera Option */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Or snap / attach a photo of your food plate
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {selectedImage ? (
                      <div className="relative rounded-xl border border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center max-h-48 group">
                        <img
                          src={selectedImage}
                          alt="Meal Preview"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImage(null)}
                          className="absolute top-2 right-2 p-1.5 bg-stone-900/70 hover:bg-stone-900 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-200 hover:border-emerald-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-emerald-50/20"
                      >
                        <div className="flex justify-center items-center gap-2 text-stone-500 text-xs font-medium">
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span>Click to upload food photo or take a picture</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">
                          Gemini will visually estimate ingredients, portions & macros
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Example prompt suggestions */}
                  <div className="pt-1">
                    <span className="text-[11px] text-stone-400 font-medium block mb-1.5">
                      Quick ideas to try:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Oatmeal with whey, banana and 1 tbsp peanut butter',
                        'Grilled salmon 180g with sweet potato and steamed asparagus',
                        'Chicken breast 150g, 1 cup brown rice and broccoli',
                        'Turkey bacon sandwich with avocado and fried egg',
                      ].map((promptIdea, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAiText(promptIdea)}
                          className="text-[11px] text-stone-600 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-md transition-colors text-left"
                        >
                          {promptIdea}
                        </button>
                      ))}
                    </div>
                  </div>

                  {aiError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                      {aiError}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isAnalyzing || (!aiText.trim() && !selectedImage)}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing nutritional composition...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Estimate Calories & Macros</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* AI RESULT REVIEW */
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-stone-900 text-base font-display">
                        {aiAnalysisResult.mealTitle}
                      </h3>
                      <span className="text-xs font-semibold text-emerald-800 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {aiAnalysisResult.totalCalories} kcal Total
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-700 mt-2 font-medium">
                      <span>Protein: <strong className="text-blue-700">{aiAnalysisResult.totalProtein}g</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Carbs: <strong className="text-amber-700">{aiAnalysisResult.totalCarbs}g</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Fat: <strong className="text-emerald-700">{aiAnalysisResult.totalFat}g</strong></span>
                      {aiAnalysisResult.totalFiber > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Fiber: <strong>{aiAnalysisResult.totalFiber}g</strong></span>
                        </>
                      )}
                    </div>

                    {aiAnalysisResult.dietaryInsights && (
                      <p className="mt-2 text-xs text-stone-600 italic">
                        "{aiAnalysisResult.dietaryInsights}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Identified Components ({aiAnalysisResult.items?.length || 0})
                    </span>
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                      {aiAnalysisResult.items?.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-stone-900">{item.name}</div>
                            <div className="text-stone-500">{item.servingSize}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-stone-900">{item.calories} kcal</span>
                            <div className="text-[11px] text-stone-500">
                              {item.protein}g P · {item.carbs}g C · {item.fat}g F
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAiAnalysisResult(null)}
                      className="w-1/3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      Re-scan / Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAiItems}
                      className="w-2/3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Log All Items to {category}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SEARCH DATABASE */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staples (chicken, oats, eggs, rice, salmon, apple...)"
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {CATEGORY_TABS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Item selection details if selected */}
              {selectedPreset ? (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm font-display">
                        {selectedPreset.name}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Base Serving: {selectedPreset.servingSize}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPreset(null)}
                      className="text-xs text-stone-500 hover:text-stone-800 underline"
                    >
                      Change item
                    </button>
                  </div>

                  {/* Portion multipliers */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Portion Multiplier
                    </label>
                    <div className="flex items-center gap-2">
                      {[0.5, 1, 1.5, 2].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPortionMultiplier(m)}
                          className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                            portionMultiplier === m
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {m}x
                        </button>
                      ))}
                      <div className="flex items-center gap-1 ml-auto">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10"
                          value={portionMultiplier}
                          onChange={(e) => setPortionMultiplier(Math.max(0.1, Number(e.target.value)))}
                          className="w-16 px-2 py-1 text-xs border border-stone-300 rounded-lg text-center"
                        />
                        <span className="text-xs text-stone-500">x</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculated result preview */}
                  <div className="p-3 bg-white rounded-lg border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-900 text-sm">
                        {Math.round(selectedPreset.calories * portionMultiplier)} kcal
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600 font-medium">
                      <span>{Math.round(selectedPreset.protein * portionMultiplier * 10) / 10}g P</span>
                      <span aria-hidden="true">·</span>
                      <span>{Math.round(selectedPreset.carbs * portionMultiplier * 10) / 10}g C</span>
                      <span aria-hidden="true">·</span>
                      <span>{Math.round(selectedPreset.fat * portionMultiplier * 10) / 10}g F</span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddPreset}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Add to {category}</span>
                  </button>
                </div>
              ) : (
                /* Preset List */
                <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto border border-stone-200 rounded-xl">
                  {filteredPresets.length === 0 ? (
                    <div className="p-5 text-center text-xs text-stone-400">
                      No foods found matching "{searchQuery}".
                    </div>
                  ) : (
                    filteredPresets.map((f, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedPreset(f)}
                        className="p-3 hover:bg-stone-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-stone-900 text-xs">{f.name}</div>
                          <div className="text-[11px] text-stone-500">
                            {f.servingSize} · {f.category}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-bold text-stone-900 text-xs">
                              {f.calories} kcal
                            </span>
                            <div className="text-[11px] text-stone-500">
                              {f.protein}g P · {f.carbs}g C · {f.fat}g F
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-300" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANUAL QUICK CUSTOM */}
          {activeTab === 'manual' && (
            <form onSubmit={handleAddManual} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Food or Dish Name
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Homemade Turkey Chili"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Serving Size / Quantity
                </label>
                <input
                  type="text"
                  value={manualServing}
                  onChange={(e) => setManualServing(e.target.value)}
                  placeholder="e.g. 1 bowl (300g)"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Calories (kcal)*
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={manualCal}
                    onChange={(e) => setManualCal(e.target.value)}
                    placeholder="350"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={manualP}
                    onChange={(e) => setManualP(e.target.value)}
                    placeholder="25"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={manualC}
                    onChange={(e) => setManualC(e.target.value)}
                    placeholder="30"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={manualF}
                    onChange={(e) => setManualF(e.target.value)}
                    placeholder="10"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Fiber (g, optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={manualFib}
                  onChange={(e) => setManualFib(e.target.value)}
                  placeholder="5"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Log Food Item</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
