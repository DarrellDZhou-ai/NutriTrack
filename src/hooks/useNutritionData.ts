import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  DayLog,
  FoodItem,
  MealCategory,
  DietAdviceData,
  ExerciseItem,
} from '../types/nutrition';
import { calculateNutritionTargets } from '../utils/nutritionCalculator';

const PROFILE_KEY = 'nutritrack_profile_v1';
const LOGS_KEY = 'nutritrack_logs_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  age: 29,
  gender: 'male',
  heightCm: 178,
  weightKg: 78.5,
  targetWeightKg: 74.0,
  activityLevel: 'moderate',
  goal: 'lose',
  pace: 'moderate', // -500 kcal deficit
  dietType: 'high_protein',
  allergiesOrPreferences: 'High protein focus, mindful of refined sugars',
  unitSystem: 'metric',
  waterTargetMl: 2750,
};

function getDateOffsetString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// Sample preloaded initial logs for the past 7 days for rich consistency analysis
function generateInitialLogs(): Record<string, DayLog> {
  const d6 = getDateOffsetString(6);
  const d5 = getDateOffsetString(5);
  const d4 = getDateOffsetString(4);
  const d3 = getDateOffsetString(3);
  const d2 = getDateOffsetString(2);
  const d1 = getDateOffsetString(1);
  const d0 = getDateOffsetString(0);

  return {
    [d6]: {
      date: d6,
      waterMl: 2500,
      weightEntryKg: 79.4,
      items: [
        { id: 'item-d6-1', mealType: 'breakfast', name: 'Eggs & Whole Wheat Toast', servingSize: '3 eggs, 2 slices toast', calories: 420, protein: 26, carbs: 32, fat: 18, fiber: 4, loggedAt: '08:00', source: 'preset' },
        { id: 'item-d6-2', mealType: 'lunch', name: 'Chicken Rice Bowl', servingSize: '1 bowl', calories: 560, protein: 48, carbs: 54, fat: 12, fiber: 5, loggedAt: '12:30', source: 'ai' },
        { id: 'item-d6-3', mealType: 'snack', name: 'Greek Yogurt & Blueberries', servingSize: '1 cup + 100g berries', calories: 210, protein: 23, carbs: 22, fat: 1, fiber: 3, loggedAt: '16:00', source: 'preset' },
        { id: 'item-d6-4', mealType: 'dinner', name: 'Salmon with Steamed Vegetables', servingSize: '1 fillet + greens', calories: 580, protein: 42, carbs: 28, fat: 28, fiber: 6, loggedAt: '19:45', source: 'ai' },
      ],
    },
    [d5]: {
      date: d5,
      waterMl: 2800,
      weightEntryKg: 79.2,
      exercises: [
        { id: 'ex-d5-1', name: 'Cycling (Moderate, 12-14 mph)', category: 'cardio', durationMinutes: 45, caloriesBurned: 470, intensity: 'moderate', notes: 'Outdoor park loop', loggedAt: '17:30', source: 'preset' },
      ],
      items: [
        { id: 'item-d5-1', mealType: 'breakfast', name: 'Protein Oatmeal with Peanut Butter', servingSize: '1 bowl', calories: 440, protein: 34, carbs: 46, fat: 12, fiber: 6, loggedAt: '08:15', source: 'ai' },
        { id: 'item-d5-2', mealType: 'lunch', name: 'Turkey & Avocado Wrap', servingSize: '1 wrap', calories: 490, protein: 38, carbs: 36, fat: 19, fiber: 5, loggedAt: '13:00', source: 'preset' },
        { id: 'item-d5-3', mealType: 'snack', name: 'Whey Protein Shake & Apple', servingSize: '1 scoop + 1 apple', calories: 215, protein: 25, carbs: 26, fat: 2, fiber: 4.5, loggedAt: '16:30', source: 'preset' },
        { id: 'item-d5-4', mealType: 'dinner', name: 'Lean Beef Stir Fry & Brown Rice', servingSize: '1 large bowl', calories: 590, protein: 46, carbs: 52, fat: 16, fiber: 6, loggedAt: '20:00', source: 'ai' },
      ],
    },
    [d4]: {
      date: d4,
      waterMl: 2400,
      weightEntryKg: 79.1,
      items: [
        { id: 'item-d4-1', mealType: 'breakfast', name: 'Greek Yogurt Parfait with Granola', servingSize: '1 cup yogurt, 40g granola', calories: 380, protein: 25, carbs: 48, fat: 7, fiber: 4, loggedAt: '08:30', source: 'preset' },
        { id: 'item-d4-2', mealType: 'lunch', name: 'Tuna Salad on Sourdough', servingSize: '2 open-face slices', calories: 460, protein: 42, carbs: 38, fat: 12, fiber: 3, loggedAt: '12:45', source: 'ai' },
        { id: 'item-d4-3', mealType: 'snack', name: 'Handful of Mixed Almonds', servingSize: '35g', calories: 200, protein: 7, carbs: 7, fat: 17, fiber: 4, loggedAt: '15:45', source: 'preset' },
        { id: 'item-d4-4', mealType: 'dinner', name: 'Grilled Chicken & Sweet Potato Wedges', servingSize: '200g chicken, 200g potato', calories: 540, protein: 50, carbs: 48, fat: 10, fiber: 6, loggedAt: '19:15', source: 'ai' },
      ],
    },
    [d3]: {
      date: d3,
      waterMl: 2600,
      weightEntryKg: 78.9,
      exercises: [
        { id: 'ex-d3-1', name: 'HIIT (High Intensity Interval Training)', category: 'hiit', durationMinutes: 30, caloriesBurned: 335, intensity: 'vigorous', notes: 'Sprint intervals & kettlebells', loggedAt: '07:30', source: 'preset' },
      ],
      items: [
        { id: 'item-d3-1', mealType: 'breakfast', name: 'Scrambled Eggs with Avocado & Fruit', servingSize: '3 eggs, 1/2 avocado, berries', calories: 460, protein: 22, carbs: 24, fat: 28, fiber: 7, loggedAt: '09:00', source: 'preset' },
        { id: 'item-d3-2', mealType: 'lunch', name: 'Steak & Quinoa Power Bowl', servingSize: '1 bowl', calories: 620, protein: 48, carbs: 46, fat: 22, fiber: 5, loggedAt: '13:30', source: 'ai' },
        { id: 'item-d3-3', mealType: 'snack', name: 'Dark Chocolate & Protein Bar', servingSize: '1 bar + 2 squares', calories: 260, protein: 20, carbs: 22, fat: 9, fiber: 6, loggedAt: '17:00', source: 'preset' },
        { id: 'item-d3-4', mealType: 'dinner', name: 'Baked White Fish with Asparagus & Rice', servingSize: '1 plate', calories: 510, protein: 44, carbs: 45, fat: 12, fiber: 4, loggedAt: '20:15', source: 'ai' },
      ],
    },
    [d2]: {
      date: d2,
      waterMl: 2200,
      weightEntryKg: 79.0,
      items: [
        { id: 'item-d2-1', mealType: 'breakfast', name: 'Berry Smoothie Bowl with Chia Seeds', servingSize: '1 large bowl', calories: 370, protein: 28, carbs: 46, fat: 8, fiber: 8, loggedAt: '08:45', source: 'ai' },
        { id: 'item-d2-2', mealType: 'lunch', name: 'Chicken Burrito Bowl with Guacamole', servingSize: '1 bowl', calories: 650, protein: 46, carbs: 62, fat: 22, fiber: 8, loggedAt: '13:00', source: 'preset' },
        { id: 'item-d2-3', mealType: 'snack', name: 'Rice Cakes with Peanut Butter', servingSize: '2 cakes + 1.5 tbsp PB', calories: 210, protein: 7, carbs: 22, fat: 11, fiber: 2, loggedAt: '16:15', source: 'preset' },
        { id: 'item-d2-4', mealType: 'dinner', name: 'Grilled Shrimp Skewers with Couscous', servingSize: '200g shrimp, 1 cup couscous', calories: 480, protein: 40, carbs: 44, fat: 10, fiber: 4, loggedAt: '19:30', source: 'ai' },
      ],
    },
    [d1]: {
      date: d1,
      waterMl: 2500,
      weightEntryKg: 78.8,
      exercises: [
        { id: 'ex-d1-1', name: 'Strength & Weight Training', category: 'strength', durationMinutes: 45, caloriesBurned: 325, intensity: 'moderate', notes: 'Upper body hypertrophy', loggedAt: '17:45', source: 'preset' },
      ],
      items: [
        {
          id: 'item-y-1',
          mealType: 'breakfast',
          name: 'Rolled Oats with Whey & Blueberries',
          servingSize: '1 medium bowl (50g oats + 1 scoop whey + 80g berries)',
          calories: 360,
          protein: 32,
          carbs: 48,
          fat: 5,
          fiber: 6.5,
          loggedAt: '08:15',
          source: 'ai',
        },
        {
          id: 'item-y-2',
          mealType: 'lunch',
          name: 'Grilled Chicken Breast with Brown Rice & Broccoli',
          servingSize: '1 bowl (180g chicken, 1 cup rice, 100g broccoli)',
          calories: 520,
          protein: 52,
          carbs: 48,
          fat: 8,
          fiber: 5.8,
          loggedAt: '12:45',
          source: 'preset',
        },
        {
          id: 'item-y-3',
          mealType: 'snack',
          name: 'Raw Almonds & Green Apple',
          servingSize: '28g almonds + 1 medium apple',
          calories: 255,
          protein: 6.5,
          carbs: 31,
          fat: 14.3,
          fiber: 7.9,
          loggedAt: '16:00',
          source: 'preset',
        },
        {
          id: 'item-y-4',
          mealType: 'dinner',
          name: 'Baked Salmon with Sweet Potato & Asparagus',
          servingSize: '1 plate (160g salmon, 150g sweet potato)',
          calories: 530,
          protein: 36,
          carbs: 38,
          fat: 22,
          fiber: 6.2,
          loggedAt: '19:30',
          source: 'ai',
        },
      ],
    },
    [d0]: {
      date: d0,
      waterMl: 1750,
      weightEntryKg: 78.5,
      exercises: [
        { id: 'ex-t-1', name: 'Running (Moderate, ~6 mph / 10 km/h)', category: 'cardio', durationMinutes: 30, caloriesBurned: 385, intensity: 'moderate', notes: 'Morning neighborhood jog', loggedAt: '07:15', source: 'preset' },
      ],
      items: [
        {
          id: 'item-t-1',
          mealType: 'breakfast',
          name: 'Avocado Toast with 2 Poached Eggs',
          servingSize: '2 slices sourdough, 1/2 avocado, 2 eggs',
          calories: 450,
          protein: 22,
          carbs: 38,
          fat: 22,
          fiber: 7.5,
          loggedAt: '08:30',
          source: 'ai',
        },
        {
          id: 'item-t-2',
          mealType: 'breakfast',
          name: 'Black Coffee with splash of almond milk',
          servingSize: '1 large mug (300ml)',
          calories: 15,
          protein: 0.5,
          carbs: 1,
          fat: 0.8,
          fiber: 0.5,
          loggedAt: '08:45',
          source: 'preset',
        },
        {
          id: 'item-t-3',
          mealType: 'lunch',
          name: 'Mediterranean Chicken Quinoa Salad',
          servingSize: '1 large bowl (160g chicken, 1 cup quinoa, diced cucumber, feta, olive oil)',
          calories: 540,
          protein: 44,
          carbs: 42,
          fat: 18,
          fiber: 6,
          loggedAt: '13:00',
          source: 'ai',
        },
      ],
    },
  };
}

function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function useNutritionData() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());

  const [allLogs, setAllLogs] = useState<Record<string, DayLog>>(() => {
    try {
      const stored = localStorage.getItem(LOGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return generateInitialLogs();
    } catch {
      return generateInitialLogs();
    }
  });

  const [dietAdvice, setDietAdvice] = useState<DietAdviceData | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Sync profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }, [profile]);

  // Sync logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));
    } catch (e) {
      console.error('Failed to save logs', e);
    }
  }, [allLogs]);

  // Calculated target stats
  const targets = useMemo(() => {
    return calculateNutritionTargets(profile);
  }, [profile]);

  // Current day log
  const todayLog = useMemo<DayLog>(() => {
    return allLogs[currentDate] || {
      date: currentDate,
      items: [],
      waterMl: 0,
    };
  }, [allLogs, currentDate]);

  // Day totals
  const dayTotals = useMemo(() => {
    const items = todayLog.items || [];
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + (Number(item.calories) || 0),
        protein: acc.protein + (Number(item.protein) || 0),
        carbs: acc.carbs + (Number(item.carbs) || 0),
        fat: acc.fat + (Number(item.fat) || 0),
        fiber: acc.fiber + (Number(item.fiber) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, [todayLog]);

  // Daily exercise calories burned
  const dayBurnedCalories = useMemo(() => {
    const exercises = todayLog.exercises || [];
    return exercises.reduce((acc, ex) => acc + (Number(ex.caloriesBurned) || 0), 0);
  }, [todayLog]);

  // Net calories consumed: Food consumed - Exercise burned
  const netCalories = useMemo(() => {
    return Math.max(0, dayTotals.calories - dayBurnedCalories);
  }, [dayTotals.calories, dayBurnedCalories]);

  // Remaining against targets (accounting for exercise burned calories!)
  // Remaining = Target Calories - Consumed Calories + Burned Calories
  const remaining = useMemo(() => {
    return {
      calories: targets.targetCalories - dayTotals.calories + dayBurnedCalories,
      rawDeficitOrSurplus: (dayTotals.calories - dayBurnedCalories) - targets.targetCalories,
      protein: Math.round((targets.targetProteinG - dayTotals.protein) * 10) / 10,
      carbs: Math.round((targets.targetCarbsG - dayTotals.carbs) * 10) / 10,
      fat: Math.round((targets.targetFatG - dayTotals.fat) * 10) / 10,
      fiber: Math.round((targets.targetFiberG - dayTotals.fiber) * 10) / 10,
    };
  }, [targets, dayTotals, dayBurnedCalories]);

  // 7-Day Trend Analysis for Recharts
  const last7DaysData = useMemo(() => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = allLogs[dateStr] || { date: dateStr, items: [], waterMl: 0 };

      const calories = (log.items || []).reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
      const burnedCalories = (log.exercises || []).reduce((sum, ex) => sum + (Number(ex.caloriesBurned) || 0), 0);
      const netCal = Math.max(0, calories - burnedCalories);
      const protein = (log.items || []).reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
      const carbs = (log.items || []).reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
      const fat = (log.items || []).reduce((sum, item) => sum + (Number(item.fat) || 0), 0);

      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      data.push({
        date: dateStr,
        dayLabel: i === 0 ? 'Today' : dayOfWeek,
        shortDate: monthDay,
        fullDate: `${dayOfWeek}, ${monthDay}`,
        calories: Math.round(calories),
        burnedCalories: Math.round(burnedCalories),
        netCalories: Math.round(netCal),
        targetCalories: targets.targetCalories,
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat),
        diff: Math.round(calories - targets.targetCalories),
        netDiff: Math.round(netCal - targets.targetCalories),
        isToday: i === 0,
        isSelected: dateStr === currentDate,
        itemCount: (log.items || []).length,
        exerciseCount: (log.exercises || []).length,
      });
    }

    return data;
  }, [allLogs, targets.targetCalories, currentDate]);

  const trendStats = useMemo(() => {
    const totalCals = last7DaysData.reduce((acc, d) => acc + d.calories, 0);
    const avgCalories = Math.round(totalCals / 7);
    const avgDiff = Math.round(avgCalories - targets.targetCalories);

    // Days within 10% of target budget
    const targetMin = targets.targetCalories * 0.9;
    const targetMax = targets.targetCalories * 1.1;
    const onTargetCount = last7DaysData.filter((d) => d.calories >= targetMin && d.calories <= targetMax).length;
    const adherenceRate = Math.round((onTargetCount / 7) * 100);

    const lowestDay = [...last7DaysData].sort((a, b) => a.calories - b.calories)[0];
    const highestDay = [...last7DaysData].sort((a, b) => b.calories - a.calories)[0];

    return {
      avgCalories,
      avgDiff,
      onTargetCount,
      adherenceRate,
      targetCalories: targets.targetCalories,
      lowestDay,
      highestDay,
    };
  }, [last7DaysData, targets.targetCalories]);

  // Update Profile
  const updateProfile = useCallback((updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  }, []);

  // Add a food item to current date
  const addFoodItem = useCallback(
    (item: Omit<FoodItem, 'id' | 'loggedAt'>) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newItem: FoodItem = {
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        loggedAt: timeStr,
      };

      setAllLogs((prev) => {
        const currentDay = prev[currentDate] || { date: currentDate, items: [], waterMl: 0 };
        return {
          ...prev,
          [currentDate]: {
            ...currentDay,
            items: [...currentDay.items, newItem],
          },
        };
      });
    },
    [currentDate]
  );

  // Add multiple food items at once (useful for multi-item AI meal scans)
  const addMultipleFoodItems = useCallback(
    (items: Omit<FoodItem, 'id' | 'loggedAt'>[]) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newItems: FoodItem[] = items.map((it, idx) => ({
        ...it,
        id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 6)}`,
        loggedAt: timeStr,
      }));

      setAllLogs((prev) => {
        const currentDay = prev[currentDate] || { date: currentDate, items: [], waterMl: 0 };
        return {
          ...prev,
          [currentDate]: {
            ...currentDay,
            items: [...currentDay.items, ...newItems],
          },
        };
      });
    },
    [currentDate]
  );

  // Update existing food item
  const updateFoodItem = useCallback(
    (itemId: string, updates: Partial<FoodItem>) => {
      setAllLogs((prev) => {
        const currentDay = prev[currentDate];
        if (!currentDay) return prev;
        return {
          ...prev,
          [currentDate]: {
            ...currentDay,
            items: currentDay.items.map((it) => (it.id === itemId ? { ...it, ...updates } : it)),
          },
        };
      });
    },
    [currentDate]
  );

  // Delete food item
  const deleteFoodItem = useCallback(
    (itemId: string) => {
      setAllLogs((prev) => {
        const currentDay = prev[currentDate];
        if (!currentDay) return prev;
        return {
          ...prev,
          [currentDate]: {
            ...currentDay,
            items: currentDay.items.filter((it) => it.id !== itemId),
          },
        };
      });
    },
    [currentDate]
  );

  // Water tracking
  const addWater = useCallback(
    (ml: number) => {
      setAllLogs((prev) => {
        const currentDay = prev[currentDate] || { date: currentDate, items: [], waterMl: 0 };
        return {
          ...prev,
          [currentDate]: {
            ...currentDay,
            waterMl: Math.max(0, (currentDay.waterMl || 0) + ml),
          },
        };
      });
    },
    [currentDate]
  );

  const setWater = useCallback(
    (ml: number) => {
      setAllLogs((prev) => {
        const currentDay = prev[currentDate] || { date: currentDate, items: [], waterMl: 0 };
        return {
          ...prev,
          [currentDate]: {
            ...currentDay,
            waterMl: Math.max(0, ml),
          },
        };
      });
    },
    [currentDate]
  );

  // Weight entry
  const logWeight = useCallback(
    (weightKg: number) => {
      setAllLogs((prev) => {
        const currentDay = prev[currentDate] || { date: currentDate, items: [], waterMl: 0 };
        return {
          ...prev,
          [currentDate]: {
            ...currentDay,
            weightEntryKg: weightKg,
          },
        };
      });
      // Also update current weight on profile
      setProfile((prev) => ({ ...prev, weightKg }));
    },
    [currentDate]
  );

  // AI Meal Analysis
  const analyzeFood = useCallback(
    async (payload: { query?: string; imageBase64?: string; mimeType?: string }) => {
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/analyze-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resData = await response.json();
        if (resData.success && resData.data) {
          return resData.data;
        }
        throw new Error(resData.error || 'Failed to analyze food');
      } catch (err) {
        console.error('AI food analysis error:', err);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  // Add Exercise Item to current date
  const addExerciseItem = useCallback(
    (exercise: Omit<ExerciseItem, 'id' | 'loggedAt'>) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newExercise: ExerciseItem = {
        ...exercise,
        id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        loggedAt: timeStr,
      };

      setAllLogs((prev) => {
        const currentDay = prev[currentDate] || { date: currentDate, items: [], waterMl: 0 };
        return {
          ...prev,
          [currentDate]: {
            ...currentDay,
            exercises: [...(currentDay.exercises || []), newExercise],
          },
        };
      });
    },
    [currentDate]
  );

  // Delete Exercise Item
  const deleteExerciseItem = useCallback(
    (exerciseId: string) => {
      setAllLogs((prev) => {
        const currentDay = prev[currentDate];
        if (!currentDay) return prev;
        return {
          ...prev,
          [currentDate]: {
            ...currentDay,
            exercises: (currentDay.exercises || []).filter((ex) => ex.id !== exerciseId),
          },
        };
      });
    },
    [currentDate]
  );

  // AI Exercise Analysis
  const analyzeExercise = useCallback(
    async (query: string) => {
      try {
        const response = await fetch('/api/analyze-exercise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, weightKg: profile.weightKg }),
        });
        const resData = await response.json();
        if (resData.success && resData.data) {
          return resData.data;
        }
        throw new Error(resData.error || 'Failed to estimate exercise burn');
      } catch (err) {
        console.error('AI exercise estimation error:', err);
        throw err;
      }
    },
    [profile.weightKg]
  );

  // Fetch Personalized Diet Advice
  const fetchDietAdvice = useCallback(async () => {
    setIsAdviceLoading(true);
    try {
      const recentFoodNames = (todayLog.items || []).map((i) => i.name);
      const response = await fetch('/api/diet-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          currentStats: {
            targetCalories: targets.targetCalories,
            consumedCalories: dayTotals.calories,
            targetProtein: targets.targetProteinG,
            consumedProtein: dayTotals.protein,
            targetCarbs: targets.targetCarbsG,
            consumedCarbs: dayTotals.carbs,
            targetFat: targets.targetFatG,
            consumedFat: dayTotals.fat,
            waterMl: todayLog.waterMl || 0,
            recentFoods: recentFoodNames,
          },
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setDietAdvice(data.data);
      }
    } catch (err) {
      console.error('Failed to get diet advice:', err);
    } finally {
      setIsAdviceLoading(false);
    }
  }, [profile, targets, dayTotals, todayLog]);

  // Reset to initial demo data
  const resetToSampleData = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    setAllLogs(generateInitialLogs());
    setCurrentDate(getTodayDateString());
    setDietAdvice(null);
  }, []);

  // Export JSON
  const exportData = useCallback(() => {
    const data = {
      profile,
      allLogs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutritrack-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [profile, allLogs]);

  // Import JSON
  const importData = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.allLogs) setAllLogs(parsed.allLogs);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid backup file' };
    }
  }, []);

  return {
    profile,
    updateProfile,
    targets,
    currentDate,
    setCurrentDate,
    todayLog,
    allLogs,
    dayTotals,
    dayBurnedCalories,
    netCalories,
    remaining,
    last7DaysData,
    trendStats,
    addFoodItem,
    addMultipleFoodItems,
    updateFoodItem,
    deleteFoodItem,
    addExerciseItem,
    deleteExerciseItem,
    analyzeExercise,
    addWater,
    setWater,
    logWeight,
    analyzeFood,
    isAnalyzing,
    dietAdvice,
    isAdviceLoading,
    fetchDietAdvice,
    resetToSampleData,
    exportData,
    importData,
  };
}
