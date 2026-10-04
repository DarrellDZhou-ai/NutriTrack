export type GoalType = 'lose' | 'maintain' | 'gain';

export type GoalPace = 'slow' | 'moderate' | 'fast';

export type ActivityLevel =
  | 'sedentary'     // Desk job, little to no exercise (1.2)
  | 'light'         // 1-3 days/week light exercise (1.375)
  | 'moderate'      // 3-5 days/week moderate exercise (1.55)
  | 'very_active'   // 6-7 days/week hard exercise (1.725)
  | 'extra_active'; // Physical job + daily hard training (1.9)

export type DietType =
  | 'balanced'       // 30% P / 45% C / 25% F
  | 'high_protein'   // 35% P / 40% C / 25% F
  | 'low_carb'       // 30% P / 20% C / 50% F
  | 'keto'           // 25% P / 5% C / 70% F
  | 'mediterranean'  // 25% P / 45% C / 30% F
  | 'plant_based';   // 25% P / 55% C / 20% F

export type UnitSystem = 'metric' | 'imperial';

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
  pace: GoalPace;
  dietType: DietType;
  allergiesOrPreferences: string;
  unitSystem: UnitSystem;
  waterTargetMl: number;
}

export interface NutritionTarget {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetFiberG: number;
  calorieAdjustment: number; // e.g. -500 for loss, +400 for gain
  weeklyChangeEstimateKg: number; // e.g. -0.5 kg/week
}

export interface FoodItem {
  id: string;
  mealType: MealCategory;
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  notes?: string;
  loggedAt: string;
  source?: 'ai' | 'preset' | 'manual';
}

export type ExerciseCategory = 'cardio' | 'strength' | 'sports' | 'walking' | 'flexibility' | 'hiit';
export type ExerciseIntensity = 'light' | 'moderate' | 'vigorous';

export interface ExerciseItem {
  id: string;
  name: string;
  category: ExerciseCategory;
  durationMinutes: number;
  caloriesBurned: number;
  intensity: ExerciseIntensity;
  notes?: string;
  loggedAt: string;
  source?: 'preset' | 'ai' | 'manual';
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  items: FoodItem[];
  exercises?: ExerciseItem[];
  waterMl: number;
  weightEntryKg?: number;
  notes?: string;
}

export interface DietAdviceData {
  statusHeadline: string;
  coachingSummary: string;
  remainingStrategy: string;
  recommendedMeals: {
    title: string;
    description: string;
    estCalories: number;
    estProtein: number;
    estCarbs?: number;
    estFat?: number;
    prepTime?: string;
  }[];
  keyRulesForGoal: {
    title: string;
    rule: string;
  }[];
  hydrationAssessment?: string;
}

export interface WeightProjectionPoint {
  week: number;
  dateStr: string;
  projectedWeightKg: number;
  weightLossKg: number;
}
