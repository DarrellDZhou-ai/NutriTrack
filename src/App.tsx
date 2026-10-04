import React, { useState } from 'react';
import { useNutritionData } from './hooks/useNutritionData';
import { Header } from './components/Header';
import { CalorieMacroSummary } from './components/CalorieMacroSummary';
import { CalorieTrendChart } from './components/CalorieTrendChart';
import { MealSection } from './components/MealSection';
import { ExerciseSection } from './components/ExerciseSection';
import { FoodLoggerModal } from './components/FoodLoggerModal';
import { ExerciseLoggerModal } from './components/ExerciseLoggerModal';
import { DietStrategyHub } from './components/DietStrategyHub';
import { WeightProjectionModal } from './components/WeightProjectionModal';
import { ProfileModal } from './components/ProfileModal';
import { WaterTracker } from './components/WaterTracker';
import { MealCategory, GoalType, GoalPace } from './types/nutrition';
import {
  Sparkles,
  Plus,
  TrendingUp,
  Scale,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';

export default function App() {
  const {
    profile,
    updateProfile,
    targets,
    currentDate,
    setCurrentDate,
    todayLog,
    dayTotals,
    dayBurnedCalories,
    netCalories,
    remaining,
    last7DaysData,
    trendStats,
    addFoodItem,
    addMultipleFoodItems,
    deleteFoodItem,
    addExerciseItem,
    deleteExerciseItem,
    analyzeExercise,
    addWater,
    analyzeFood,
    isAnalyzing,
    dietAdvice,
    isAdviceLoading,
    fetchDietAdvice,
    resetToSampleData,
    exportData,
    importData,
  } = useNutritionData();

  // Modal states
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [isExerciseLoggerOpen, setIsExerciseLoggerOpen] = useState(false);
  const [selectedMealCategory, setSelectedMealCategory] = useState<MealCategory>('breakfast');
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isProjectionOpen, setIsProjectionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Group items by meal category
  const breakfastItems = (todayLog.items || []).filter((i) => i.mealType === 'breakfast');
  const lunchItems = (todayLog.items || []).filter((i) => i.mealType === 'lunch');
  const dinnerItems = (todayLog.items || []).filter((i) => i.mealType === 'dinner');
  const snackItems = (todayLog.items || []).filter((i) => i.mealType === 'snack');

  const handleOpenLogger = (cat: MealCategory) => {
    setSelectedMealCategory(cat);
    setIsLoggerOpen(true);
  };

  const handleToggleUnit = () => {
    updateProfile({
      unitSystem: profile.unitSystem === 'metric' ? 'imperial' : 'metric',
    });
  };

  const handleUpdateGoal = (newGoal: GoalType) => {
    updateProfile({ goal: newGoal });
  };

  const handleUpdatePace = (newPace: GoalPace) => {
    updateProfile({ pace: newPace });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col text-stone-900 font-sans">
      {/* Global Navigation Header */}
      <Header
        profile={profile}
        targets={targets}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCoach={() => {
          setIsCoachOpen(true);
          if (!dietAdvice) {
            fetchDietAdvice();
          }
        }}
        onOpenProjection={() => setIsProjectionOpen(true)}
        onToggleUnit={handleToggleUnit}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Dominant Visual Focal Anchor: Calorie & Macro Target Progress Card */}
        <section aria-label="Calorie and Macronutrient Target Progress">
          <CalorieMacroSummary
            profile={profile}
            targets={targets}
            dayTotals={dayTotals}
            dayBurnedCalories={dayBurnedCalories}
            netCalories={netCalories}
            remaining={remaining}
            onOpenCoach={() => {
              setIsCoachOpen(true);
              if (!dietAdvice) fetchDietAdvice();
            }}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenExerciseLogger={() => setIsExerciseLoggerOpen(true)}
          />
        </section>

        {/* 7-Day Caloric Intake Trend Line Chart (Recharts) */}
        <section aria-label="7-Day Caloric Intake Consistency Chart">
          <CalorieTrendChart
            data={last7DaysData}
            goal={profile.goal}
            targetCalories={targets.targetCalories}
            trendStats={trendStats}
            currentDate={currentDate}
            onSelectDate={setCurrentDate}
          />
        </section>

        {/* Quick Coach Advice Highlight Strip */}
        <section
          onClick={() => {
            setIsCoachOpen(true);
            if (!dietAdvice) fetchDietAdvice();
          }}
          className="p-4 bg-white hover:bg-emerald-50/40 rounded-2xl border border-stone-200/90 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">Diet Management Strategy</span>
                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded font-medium border border-emerald-200/60">
                  {profile.goal === 'lose' ? 'Fat Loss Protocol' : profile.goal === 'gain' ? 'Muscle Gain Protocol' : 'Equilibrium Protocol'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {profile.goal === 'lose'
                  ? `Maintain your ${Math.abs(targets.calorieAdjustment)} kcal deficit while hitting ${targets.targetProteinG}g protein to preserve muscle.`
                  : profile.goal === 'gain'
                  ? `Reach your +${targets.calorieAdjustment} kcal surplus with nutrient-dense foods to fuel clean hypertrophy.`
                  : `Balance daily expenditure with ${targets.targetCalories} kcal for stable energy and weight.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 shrink-0">
            <span>Explore Playbook & AI Advice</span>
            <span aria-hidden="true">→</span>
          </div>
        </section>

        {/* Daily Food Log: 4 Meal Sections */}
        <section aria-label="Daily Meal Logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-display">
                Meals Recorded
              </h2>
              <p className="text-xs text-stone-500">
                Logged items for {currentDate}. Tap "+ Add Food" to scan or search.
              </p>
            </div>

            <button
              onClick={() => handleOpenLogger('breakfast')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Food Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breakfast */}
            <MealSection
              category="breakfast"
              title="Breakfast"
              items={breakfastItems}
              onAddFood={handleOpenLogger}
              onDeleteItem={deleteFoodItem}
            />

            {/* Lunch */}
            <MealSection
              category="lunch"
              title="Lunch"
              items={lunchItems}
              onAddFood={handleOpenLogger}
              onDeleteItem={deleteFoodItem}
            />

            {/* Dinner */}
            <MealSection
              category="dinner"
              title="Dinner"
              items={dinnerItems}
              onAddFood={handleOpenLogger}
              onDeleteItem={deleteFoodItem}
            />

            {/* Snacks */}
            <MealSection
              category="snack"
              title="Snacks"
              items={snackItems}
              onAddFood={handleOpenLogger}
              onDeleteItem={deleteFoodItem}
            />
          </div>
        </section>

        {/* Physical Activities & Workouts Section */}
        <section aria-label="Physical Activities and Calorie Burn">
          <ExerciseSection
            exercises={todayLog.exercises || []}
            totalBurned={dayBurnedCalories}
            onOpenLogger={() => setIsExerciseLoggerOpen(true)}
            onDeleteExercise={deleteExerciseItem}
          />
        </section>

        {/* Hydration Tracker */}
        <section aria-label="Hydration Tracking">
          <WaterTracker
            currentMl={todayLog.waterMl || 0}
            targetMl={profile.waterTargetMl}
            onAddWater={addWater}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-6 mt-12 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800 font-display">NutriTrack</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent Nutrition & Calorie Tracking</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <button
              onClick={() => {
                setIsCoachOpen(true);
                if (!dietAdvice) fetchDietAdvice();
              }}
              className="hover:text-stone-900 transition-colors"
            >
              Diet Playbooks
            </button>
            <button
              onClick={() => setIsProjectionOpen(true)}
              className="hover:text-stone-900 transition-colors"
            >
              12-Week Projections
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-stone-900 transition-colors"
            >
              Preferences
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <FoodLoggerModal
        isOpen={isLoggerOpen}
        category={selectedMealCategory}
        onClose={() => setIsLoggerOpen(false)}
        onAddFood={addFoodItem}
        onAddMultipleFoods={addMultipleFoodItems}
        onAnalyzeFood={analyzeFood}
        isAnalyzing={isAnalyzing}
      />

      <ExerciseLoggerModal
        isOpen={isExerciseLoggerOpen}
        onClose={() => setIsExerciseLoggerOpen(false)}
        weightKg={profile.weightKg}
        onAddExercise={addExerciseItem}
        onAnalyzeExercise={analyzeExercise}
      />

      <DietStrategyHub
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        profile={profile}
        targets={targets}
        dayTotals={dayTotals}
        remaining={remaining}
        dietAdvice={dietAdvice}
        isAdviceLoading={isAdviceLoading}
        onFetchDietAdvice={fetchDietAdvice}
        onUpdateGoal={handleUpdateGoal}
      />

      <WeightProjectionModal
        isOpen={isProjectionOpen}
        onClose={() => setIsProjectionOpen(false)}
        profile={profile}
        onUpdatePace={handleUpdatePace}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={updateProfile}
        onExportData={exportData}
        onImportData={importData}
        onResetData={resetToSampleData}
      />
    </div>
  );
}
