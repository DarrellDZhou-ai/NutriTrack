import React, { useState } from 'react';
import {
  UserProfile,
  NutritionTarget,
  DietAdviceData,
  GoalType,
} from '../types/nutrition';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Scale,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Flame,
  Shield,
  Loader2,
  X,
} from 'lucide-react';

interface DietStrategyHubProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  targets: NutritionTarget;
  dayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  dietAdvice: DietAdviceData | null;
  isAdviceLoading: boolean;
  onFetchDietAdvice: () => void;
  onUpdateGoal: (newGoal: GoalType) => void;
}

export const DietStrategyHub: React.FC<DietStrategyHubProps> = ({
  isOpen,
  onClose,
  profile,
  targets,
  dayTotals,
  remaining,
  dietAdvice,
  isAdviceLoading,
  onFetchDietAdvice,
  onUpdateGoal,
}) => {
  if (!isOpen) return null;

  // Active guide playbook tab
  const [guideTab, setGuideTab] = useState<GoalType>(profile.goal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-display">
                Diet Management & Nutrition Strategy Hub
              </h2>
              <p className="text-xs text-stone-500">
                Evidence-based dietary playbooks and real-time AI nutrition coaching for your goals.
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-7 flex-1">
          {/* SECTION 1: LIVE AI DIET COACH */}
          <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-stone-50 p-5 rounded-2xl border border-emerald-200/70 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Live Diet Coach Assessment
                </h3>
                <span className="text-[11px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {profile.goal.toUpperCase()} TRACKER
                </span>
              </div>

              <button
                onClick={onFetchDietAdvice}
                disabled={isAdviceLoading}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer disabled:bg-stone-300"
              >
                {isAdviceLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing your day...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{dietAdvice ? 'Refresh Coach Advice' : 'Get Real-Time Coach Review'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Coach Content */}
            {dietAdvice ? (
              <div className="pt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    {dietAdvice.statusHeadline}
                  </h4>
                  <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                    {dietAdvice.coachingSummary}
                  </p>
                </div>

                <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-200/80 text-xs">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Strategic Direction for Remaining Calories ({remaining.calories} kcal left):</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">
                    {dietAdvice.remainingStrategy}
                  </p>
                </div>

                {/* Recommended Meal Ideas */}
                {dietAdvice.recommendedMeals && dietAdvice.recommendedMeals.length > 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
                      Tailored Meal Recommendation to Hit Today’s Target
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dietAdvice.recommendedMeals.map((meal, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900">{meal.title}</span>
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              {meal.estCalories} kcal
                            </span>
                          </div>
                          <p className="text-stone-600 text-[11px] leading-relaxed">
                            {meal.description}
                          </p>
                          <div className="text-[11px] text-stone-500 font-medium pt-1 border-t border-stone-100 flex items-center justify-between">
                            <span>{meal.estProtein}g protein · {meal.estCarbs || 25}g carbs</span>
                            {meal.prepTime && <span>Prep: {meal.prepTime}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Rules */}
                {dietAdvice.keyRulesForGoal && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {dietAdvice.keyRulesForGoal.map((item, i) => (
                      <div key={i} className="p-2.5 bg-white/80 rounded-lg border border-stone-200 text-xs">
                        <div className="font-semibold text-stone-900">{item.title}</div>
                        <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">{item.rule}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-stone-600">
                  Click <strong>"Get Real-Time Coach Review"</strong> to generate personalized advice based on today's logged meals, remaining calories, and your target of <strong>{profile.goal}ing weight</strong>.
                </p>
              </div>
            )}
          </div>

          {/* SECTION 2: COMPREHENSIVE DIET MANAGEMENT GUIDE */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  How to Manage Your Diet
                </h3>
                <p className="text-xs text-stone-500">
                  Select a goal to learn the proven nutritional guidelines, macro distribution, and daily habits.
                </p>
              </div>

              {/* Goal tabs switcher */}
              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setGuideTab('lose')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    guideTab === 'lose'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lose Weight</span>
                </button>

                <button
                  onClick={() => setGuideTab('maintain')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    guideTab === 'maintain'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>Maintain Weight</span>
                </button>

                <button
                  onClick={() => setGuideTab('gain')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    guideTab === 'gain'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gain Weight</span>
                </button>
              </div>
            </div>

            {/* Active Guide Content */}
            {guideTab === 'lose' && (
              <div className="space-y-4 border border-stone-200 rounded-2xl p-5 bg-stone-50/40">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <h4 className="font-bold text-stone-900 text-sm font-display">
                      Fat Loss Playbook: Maximizing Fat Oxidation While Protecting Muscle
                    </h4>
                  </div>
                  {profile.goal !== 'lose' && (
                    <button
                      onClick={() => onUpdateGoal('lose')}
                      className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Set as my active goal →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                      1. The Caloric Deficit
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Aim for a controlled deficit of <strong>300 to 500 kcal/day</strong> below TDEE (~0.4 - 0.5 kg loss/week). Extreme deficits (&gt;1,000 kcal) cause metabolic down-regulation, muscle loss, and severe rebound hunger.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                      2. The Protein Shield
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Consume <strong>1.8g to 2.2g of protein per kg bodyweight</strong>. Protein possesses the highest Thermic Effect of Food (TEF ~25%), protects lean contractile tissue, and suppresses ghrelin (the hunger hormone).
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      3. Volume Eating
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Fill 50% of your lunch and dinner plate with fibrous, high-water vegetables (broccoli, spinach, zucchini, cauliflower). You can eat huge satisfying bowls for under 100 kcal.
                    </p>
                  </div>
                </div>

                {/* Practical Checklist */}
                <div className="bg-white rounded-xl p-4 border border-stone-200 space-y-2">
                  <h5 className="font-semibold text-xs text-stone-900">
                    Daily Fat Loss Execution Checklist:
                  </h5>
                  <ul className="text-xs text-stone-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Hydrate First:</strong> Drink 500ml of cold water immediately upon waking and 15 minutes prior to every meal.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Liquid Calorie Audit:</strong> Eliminate sugary beverages, sweetened coffees, and commercial juices. Switch to water, black coffee, and sparkling water.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Weigh Ingredients Raw:</strong> Calorie-dense items like cooking oil, peanut butter, and grains must be measured accurately—a single unmeasured tablespoon of oil adds 120 stealth calories.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Weekly Refeed Days:</strong> If dieting for &gt;4 weeks, maintain a 1-day maintenance refeed with higher carbohydrates to boost leptin and thyroid hormones.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {guideTab === 'maintain' && (
              <div className="space-y-4 border border-stone-200 rounded-2xl p-5 bg-stone-50/40">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <h4 className="font-bold text-stone-900 text-sm font-display">
                      Maintenance & Recomposition: Energetic Equilibrium
                    </h4>
                  </div>
                  {profile.goal !== 'maintain' && (
                    <button
                      onClick={() => onUpdateGoal('maintain')}
                      className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Set as my active goal →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                      1. True TDEE Neutrality
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Energy intake matches energy expenditure (+/- 100 kcal). Weight will fluctuate daily by 0.5-1.5 kg due to water and glycogen shifts; focus on your 7-day rolling average.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      2. The 80 / 20 Rule
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Get 80% of daily calories from nutrient-dense whole foods (lean meats, fish, legumes, oats, olive oil, berries) and 20% flexible treats to ensure permanent psychological sustainability.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
                      3. Body Recomposition
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Even with stable scale weight, keeping protein at 1.6-1.8g/kg combined with progressive resistance training allows simultaneous fat loss and muscle gain ("recomp").
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-stone-200 space-y-2">
                  <h5 className="font-semibold text-xs text-stone-900">
                    Daily Maintenance Execution Checklist:
                  </h5>
                  <ul className="text-xs text-stone-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Weekly Calorie Bank:</strong> If you enjoy dining out on weekends, budget a light 150 kcal daily buffer Monday through Thursday.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Micronutrient Density:</strong> Aim for 30+ grams of dietary fiber and eat colorful vegetables every single day for optimal gut microbiome health.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Reverse Dieting (if post-cut):</strong> If transitioning from a diet, raise daily calories by +100 to +150 kcal each week until maintenance is reached to prevent rapid fat regain.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {guideTab === 'gain' && (
              <div className="space-y-4 border border-stone-200 rounded-2xl p-5 bg-stone-50/40">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h4 className="font-bold text-stone-900 text-sm font-display">
                      Lean Bulking Playbook: Adding Muscle Mass Without Excessive Adipose
                    </h4>
                  </div>
                  {profile.goal !== 'gain' && (
                    <button
                      onClick={() => onUpdateGoal('gain')}
                      className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Set as my active goal →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      1. Lean Caloric Surplus
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Muscle synthesis has a physiological speed limit (~0.2 - 0.4 kg/week). Aim for a gentle surplus of <strong>+250 to +400 kcal/day</strong>. A massive surplus just leads to unnecessary body fat storage.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                      2. Clean Calorie Density
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      If feeling too full, consume energy-dense whole foods: 2 tbsp natural peanut butter (+190 kcal), 1 tbsp extra virgin olive oil (+120 kcal), avocados, whole eggs, and nuts.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-stone-200/80 space-y-1">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                      3. Peri-Workout Fueling
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Target 40-60g of easily digestible carbohydrates (banana, white rice, oats) 60 minutes pre-workout to maximize intra-muscular glycogen and power high-volume lifting sessions.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-stone-200 space-y-2">
                  <h5 className="font-semibold text-xs text-stone-900">
                    Daily Weight Gain Execution Checklist:
                  </h5>
                  <ul className="text-xs text-stone-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Liquid Nutrition Shortcut:</strong> If struggling with appetite, blend a shake with 1 cup milk, 1 scoop whey, 1 banana, 50g oats, and 2 tbsp peanut butter (~650 kcal).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Even Protein Distribution:</strong> Distribute protein across 4 to 5 meals (30-45g per meal) every 3-4 hours to trigger maximal Muscle Protein Synthesis (MPS).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Progressive Overload Requirement:</strong> The surplus calories only build muscle if paired with demanding resistance training with weekly weight/rep increases.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
