import { UserProfile, NutritionTarget, WeightProjectionPoint } from '../types/nutrition';

// Activity multipliers based on evidence-based sports nutrition
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,       // Little or no exercise, desk job
  light: 1.375,         // Light exercise 1-3 days/week
  moderate: 1.55,       // Moderate exercise 3-5 days/week
  very_active: 1.725,   // Hard exercise 6-7 days/week
  extra_active: 1.9,    // Very hard daily training or physical job
};

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation
 * Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 * Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'male' ? base + 5 : base - 161;
  return Math.round(bmr);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: keyof typeof ACTIVITY_MULTIPLIERS): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate daily calorie target and macronutrient distribution
 */
export function calculateNutritionTargets(profile: UserProfile): NutritionTarget {
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  let calorieAdjustment = 0;
  let weeklyChangeEstimateKg = 0;

  if (profile.goal === 'lose') {
    if (profile.pace === 'slow') {
      calorieAdjustment = -250;
      weeklyChangeEstimateKg = -0.25;
    } else if (profile.pace === 'moderate') {
      calorieAdjustment = -500;
      weeklyChangeEstimateKg = -0.5;
    } else {
      calorieAdjustment = -750;
      weeklyChangeEstimateKg = -0.75;
    }
  } else if (profile.goal === 'gain') {
    if (profile.pace === 'slow') {
      calorieAdjustment = 250;
      weeklyChangeEstimateKg = 0.25;
    } else if (profile.pace === 'moderate') {
      calorieAdjustment = 400;
      weeklyChangeEstimateKg = 0.4;
    } else {
      calorieAdjustment = 600;
      weeklyChangeEstimateKg = 0.6;
    }
  } else {
    calorieAdjustment = 0;
    weeklyChangeEstimateKg = 0;
  }

  // Safety floor enforcement (1200 kcal for female, 1500 kcal for male)
  const minSafeFloor = profile.gender === 'female' ? 1200 : 1500;
  const rawTarget = tdee + calorieAdjustment;
  const targetCalories = Math.max(minSafeFloor, rawTarget);

  // Macronutrient split based on DietType
  // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
  let pRatio = 0.25;
  let cRatio = 0.50;
  let fRatio = 0.25;

  switch (profile.dietType) {
    case 'high_protein':
      pRatio = 0.35;
      cRatio = 0.40;
      fRatio = 0.25;
      break;
    case 'low_carb':
      pRatio = 0.30;
      cRatio = 0.20;
      fRatio = 0.50;
      break;
    case 'keto':
      pRatio = 0.25;
      cRatio = 0.05;
      fRatio = 0.70;
      break;
    case 'mediterranean':
      pRatio = 0.25;
      cRatio = 0.45;
      fRatio = 0.30;
      break;
    case 'plant_based':
      pRatio = 0.22;
      cRatio = 0.58;
      fRatio = 0.20;
      break;
    case 'balanced':
    default:
      pRatio = 0.28;
      cRatio = 0.47;
      fRatio = 0.25;
      break;
  }

  // If user is losing weight or high protein, guarantee at least 1.6 - 2.0g per kg bodyweight
  let targetProteinG = Math.round((targetCalories * pRatio) / 4);
  const minAthleticProtein = Math.round(profile.weightKg * 1.6);
  if (profile.goal === 'lose' && targetProteinG < minAthleticProtein) {
    targetProteinG = minAthleticProtein;
  }

  const remainingKcalAfterProtein = Math.max(0, targetCalories - targetProteinG * 4);
  const relativeNonProteinSum = cRatio + fRatio;
  const normalizedCRatio = cRatio / relativeNonProteinSum;
  const normalizedFRatio = fRatio / relativeNonProteinSum;

  const targetCarbsG = Math.max(15, Math.round((remainingKcalAfterProtein * normalizedCRatio) / 4));
  const targetFatG = Math.max(25, Math.round((remainingKcalAfterProtein * normalizedFRatio) / 9));

  // Recommended dietary fiber: 14g per 1000 kcal (USDA guideline)
  const targetFiberG = Math.round((targetCalories / 1000) * 14);

  return {
    bmr,
    tdee,
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    targetFiberG,
    calorieAdjustment,
    weeklyChangeEstimateKg,
  };
}

/**
 * Generate 12-week weight projection timeline
 */
export function generateWeightProjections(profile: UserProfile, weeks = 12): WeightProjectionPoint[] {
  const { weeklyChangeEstimateKg } = calculateNutritionTargets(profile);
  const points: WeightProjectionPoint[] = [];
  const now = new Date();

  for (let w = 0; w <= weeks; w++) {
    const futureDate = new Date(now.getTime() + w * 7 * 24 * 60 * 60 * 1000);
    const dateStr = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const projectedWeightKg = Math.round((profile.weightKg + w * weeklyChangeEstimateKg) * 10) / 10;
    const diff = Math.round((projectedWeightKg - profile.weightKg) * 10) / 10;

    points.push({
      week: w,
      dateStr: w === 0 ? 'Today' : dateStr,
      projectedWeightKg,
      weightLossKg: diff,
    });
  }

  return points;
}

// Unit conversion helpers
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}
