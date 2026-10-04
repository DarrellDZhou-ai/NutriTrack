import { ExerciseCategory, ExerciseIntensity } from '../types/nutrition';

export interface PresetExercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  baseMet: number; // Metabolic Equivalent of Task at moderate intensity
  defaultDurationMinutes: number;
  description: string;
}

export const PRESET_EXERCISES: PresetExercise[] = [
  // Running & Walking
  { id: 'run-moderate', name: 'Running (Moderate, ~6 mph / 10 km/h)', category: 'cardio', baseMet: 9.8, defaultDurationMinutes: 30, description: 'Steady pace outdoor or treadmill run' },
  { id: 'run-fast', name: 'Running (Vigorous, ~7.5 mph / 12 km/h)', category: 'cardio', baseMet: 11.5, defaultDurationMinutes: 25, description: 'High tempo endurance running' },
  { id: 'walk-brisk', name: 'Brisk Walking (3.5 mph / 5.6 km/h)', category: 'walking', baseMet: 4.3, defaultDurationMinutes: 45, description: 'Power walk outdoors or on treadmill' },
  { id: 'treadmill-incline', name: 'Incline Treadmill Walk (12-3-30 style)', category: 'walking', baseMet: 6.5, defaultDurationMinutes: 30, description: '10-12% incline at 3 mph' },
  { id: 'trail-hiking', name: 'Hiking with Incline', category: 'walking', baseMet: 7.3, defaultDurationMinutes: 60, description: 'Outdoor trail trekking with varied elevation' },

  // Cycling & Cardio
  { id: 'cycling-moderate', name: 'Cycling (Moderate, 12-14 mph)', category: 'cardio', baseMet: 8.0, defaultDurationMinutes: 40, description: 'Road cycling or outdoor bike ride' },
  { id: 'spin-class', name: 'Indoor Stationary / Spin Bike', category: 'cardio', baseMet: 8.5, defaultDurationMinutes: 45, description: 'Rhythm spin class or interval cycling' },
  { id: 'rowing-machine', name: 'Rowing Machine (Ergometer)', category: 'cardio', baseMet: 7.0, defaultDurationMinutes: 25, description: 'Full body pulling cardio' },
  { id: 'stair-climber', name: 'Stair Climber / StairMaster', category: 'cardio', baseMet: 9.0, defaultDurationMinutes: 20, description: 'High intensity glute and calf cardio' },
  { id: 'elliptical', name: 'Elliptical Trainer', category: 'cardio', baseMet: 6.8, defaultDurationMinutes: 30, description: 'Low impact cross-training cardio' },
  { id: 'jump-rope', name: 'Jump Rope / Skipping', category: 'cardio', baseMet: 11.8, defaultDurationMinutes: 15, description: 'Fast footwork plyometric cardio' },

  // Gym & Strength
  { id: 'weight-lifting', name: 'Strength & Weight Training', category: 'strength', baseMet: 5.5, defaultDurationMinutes: 45, description: 'Compound barbell, dumbbell, and machine lifting' },
  { id: 'heavy-powerlifting', name: 'Heavy Powerlifting / Squats & Deadlifts', category: 'strength', baseMet: 6.0, defaultDurationMinutes: 60, description: 'High intensity low rep strength work with rest' },
  { id: 'calisthenics', name: 'Bodyweight Calisthenics', category: 'strength', baseMet: 5.0, defaultDurationMinutes: 35, description: 'Pull-ups, dips, push-ups, and core gymnastics' },
  { id: 'kettlebell', name: 'Kettlebell Circuit Training', category: 'strength', baseMet: 7.8, defaultDurationMinutes: 30, description: 'Dynamic swings, cleans, and snatches' },

  // HIIT & Classes
  { id: 'hiit-training', name: 'HIIT (High Intensity Interval Training)', category: 'hiit', baseMet: 8.5, defaultDurationMinutes: 25, description: 'Alternating sprints, burpees, and active recovery' },
  { id: 'boxing-training', name: 'Boxing / Heavy Bag / Kickboxing', category: 'hiit', baseMet: 9.0, defaultDurationMinutes: 40, description: 'Punch combinations, pad work, and defense' },
  { id: 'crossfit-wod', name: 'CrossFit / Functional Fitness WOD', category: 'hiit', baseMet: 9.0, defaultDurationMinutes: 35, description: 'High power functional fitness' },

  // Sports
  { id: 'swimming-freestyle', name: 'Swimming (Freestyle Laps)', category: 'sports', baseMet: 7.0, defaultDurationMinutes: 30, description: 'Lap swimming in pool' },
  { id: 'basketball', name: 'Basketball (Full / Half Court Game)', category: 'sports', baseMet: 8.0, defaultDurationMinutes: 45, description: 'Agile sprints, jumping, and court play' },
  { id: 'tennis-match', name: 'Tennis (Singles / Doubles Match)', category: 'sports', baseMet: 7.5, defaultDurationMinutes: 60, description: 'Rallying, serving, and baseline movement' },
  { id: 'soccer', name: 'Soccer / Football Match', category: 'sports', baseMet: 8.5, defaultDurationMinutes: 50, description: 'Endurance field running and kicking' },

  // Flexibility & Recovery
  { id: 'vinyasa-yoga', name: 'Vinyasa / Power Flow Yoga', category: 'flexibility', baseMet: 4.0, defaultDurationMinutes: 45, description: 'Continuous flowing postures and breathwork' },
  { id: 'pilates-mat', name: 'Pilates (Mat / Reformer)', category: 'flexibility', baseMet: 3.8, defaultDurationMinutes: 40, description: 'Core stabilization and muscle toning' },
  { id: 'stretching-mobility', name: 'Stretching & Mobility Routine', category: 'flexibility', baseMet: 2.5, defaultDurationMinutes: 20, description: 'Joint mobility, foam rolling, and flexibility' },
];

/**
 * Calculate calories burned using standard exercise science formula:
 * Calories = MET * weightKg * (durationMinutes / 60) * intensityMultiplier
 */
export function calculateBurnedCalories(
  baseMet: number,
  weightKg: number,
  durationMinutes: number,
  intensity: ExerciseIntensity = 'moderate'
): number {
  let intensityMultiplier = 1.0;
  if (intensity === 'light') intensityMultiplier = 0.85;
  if (intensity === 'vigorous') intensityMultiplier = 1.2;

  const effectiveMet = baseMet * intensityMultiplier;
  const burned = effectiveMet * weightKg * (durationMinutes / 60);
  return Math.round(burned);
}
