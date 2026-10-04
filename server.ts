import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsing with generous limit for photo base64
app.use(express.json({ limit: '15mb' }));

// Shared Gemini client utility initialized on the server
// Telemetry header User-Agent: 'aistudio-build' as required by gemini-api skill
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Fallback rule-based nutritional data for common foods if API key is not present or rate limited
const OFFLINE_FOOD_DATABASE: Record<string, { cal: number; p: number; c: number; f: number; fib: number; unit: string }> = {
  'egg': { cal: 72, p: 6.3, c: 0.4, f: 4.8, fib: 0, unit: '1 large' },
  'eggs': { cal: 144, p: 12.6, c: 0.8, f: 9.6, fib: 0, unit: '2 large' },
  'chicken breast': { cal: 165, p: 31, c: 0, f: 3.6, fib: 0, unit: '100g cooked' },
  'salmon': { cal: 208, p: 20, c: 0, f: 13, fib: 0, unit: '100g cooked' },
  'rice': { cal: 130, p: 2.7, c: 28, f: 0.3, fib: 0.4, unit: '100g cooked' },
  'brown rice': { cal: 123, p: 2.7, c: 25.6, f: 1.0, fib: 1.6, unit: '100g cooked' },
  'oats': { cal: 154, p: 5.3, c: 27, f: 2.6, fib: 4.0, unit: '40g dry' },
  'oatmeal': { cal: 154, p: 5.3, c: 27, f: 2.6, fib: 4.0, unit: '1 bowl' },
  'banana': { cal: 105, p: 1.3, c: 27, f: 0.3, fib: 3.1, unit: '1 medium (118g)' },
  'apple': { cal: 95, p: 0.5, c: 25, f: 0.3, fib: 4.4, unit: '1 medium' },
  'avocado': { cal: 160, p: 2.0, c: 8.5, f: 14.7, fib: 6.7, unit: 'half avocado (100g)' },
  'greek yogurt': { cal: 130, p: 17, c: 6, f: 4, fib: 0, unit: '170g (3/4 cup)' },
  'protein shake': { cal: 140, p: 25, c: 3, f: 2, fib: 1, unit: '1 scoop with water' },
  'whey protein': { cal: 120, p: 24, c: 2, f: 1.5, fib: 0.5, unit: '1 scoop (30g)' },
  'almonds': { cal: 164, p: 6, c: 6, f: 14, fib: 3.5, unit: '28g (1 oz / ~23 nuts)' },
  'peanut butter': { cal: 188, p: 8, c: 7, f: 16, fib: 2, unit: '2 tbsp (32g)' },
  'bread': { cal: 79, p: 3.9, c: 13.8, f: 1.0, fib: 1.9, unit: '1 slice whole wheat' },
  'olive oil': { cal: 119, p: 0, c: 0, f: 13.5, fib: 0, unit: '1 tbsp (14g)' },
  'broccoli': { cal: 35, p: 2.4, c: 7.2, f: 0.4, fib: 2.6, unit: '100g' },
  'spinach': { cal: 23, p: 2.9, c: 3.6, f: 0.4, fib: 2.2, unit: '100g' },
  'sweet potato': { cal: 103, p: 2.3, c: 23.6, f: 0.2, fib: 3.8, unit: '1 medium (130g)' },
  'beef': { cal: 250, p: 26, c: 0, f: 15, fib: 0, unit: '100g ground beef (85%)' },
  'pasta': { cal: 158, p: 5.8, c: 31, f: 0.9, fib: 1.8, unit: '100g cooked' },
  'pizza': { cal: 285, p: 12, c: 36, f: 10, fib: 2.5, unit: '1 regular slice' },
  'coffee with milk': { cal: 35, p: 2, c: 3, f: 1.5, fib: 0, unit: '1 cup' },
};

// API: Analyze food from text description or image
app.post('/api/analyze-food', async (req: Request, res: Response) => {
  try {
    const { query, imageBase64, mimeType } = req.body;

    if (!query && !imageBase64) {
      return res.status(400).json({ error: 'Please provide a food description or meal image.' });
    }

    if (apiKey) {
      const contentsParts: any[] = [];

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
        contentsParts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const promptText = query
        ? `Analyze this food description/meal photo and accurately estimate the nutritional breakdown: "${query}". Identify all components with portions, calories, protein (g), carbs (g), fat (g), and fiber (g). Provide health insights and practical advice.`
        : `Analyze this meal photo and estimate what food items are on the plate, portion sizes, total calories, protein (g), carbs (g), fat (g), and dietary fiber (g).`;

      contentsParts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: contentsParts },
        config: {
          systemInstruction:
            'You are an expert sports and clinical dietitian. Break down meals accurately into identifiable items with realistic portion estimations, calories, and macros (protein, carbs, fat, fiber). Return valid JSON conforming to the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mealTitle: { type: Type.STRING, description: 'Short descriptive title of the dish or meal' },
              totalCalories: { type: Type.NUMBER, description: 'Sum of all item calories' },
              totalProtein: { type: Type.NUMBER, description: 'Total protein in grams' },
              totalCarbs: { type: Type.NUMBER, description: 'Total carbohydrates in grams' },
              totalFat: { type: Type.NUMBER, description: 'Total fat in grams' },
              totalFiber: { type: Type.NUMBER, description: 'Total dietary fiber in grams' },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: 'Name of the ingredient or component' },
                    servingSize: { type: Type.STRING, description: 'Estimated portion e.g. 150g, 1 cup, 2 slices' },
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fat: { type: Type.NUMBER },
                    fiber: { type: Type.NUMBER },
                    notes: { type: Type.STRING, description: 'Nutrient or prep note' },
                  },
                  required: ['name', 'servingSize', 'calories', 'protein', 'carbs', 'fat'],
                },
              },
              dietaryInsights: {
                type: Type.STRING,
                description: 'Key nutritional strengths or advice (e.g. high protein, rich in fiber, satiety score)',
              },
            },
            required: ['mealTitle', 'totalCalories', 'totalProtein', 'totalCarbs', 'totalFat', 'items', 'dietaryInsights'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed, source: 'gemini' });
    }

    // Fallback if no API key
    return fallbackAnalyze(query, res);
  } catch (err: any) {
    console.warn('Gemini analysis failed, falling back to local database:', err?.message);
    return fallbackAnalyze(req.body.query || 'Mixed Meal', res);
  }
});

function fallbackAnalyze(query: string, res: Response) {
  const qLower = (query || '').toLowerCase();
  const matchedItems: any[] = [];
  let totalCal = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;
  let totalFib = 0;

  for (const [key, data] of Object.entries(OFFLINE_FOOD_DATABASE)) {
    if (qLower.includes(key)) {
      matchedItems.push({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        servingSize: data.unit,
        calories: data.cal,
        protein: data.p,
        carbs: data.c,
        fat: data.f,
        fiber: data.fib,
        notes: 'Calculated from standard USDA reference',
      });
      totalCal += data.cal;
      totalP += data.p;
      totalC += data.c;
      totalF += data.f;
      totalFib += data.fib;
    }
  }

  if (matchedItems.length === 0) {
    // Generic fallback estimation
    matchedItems.push({
      name: query || 'Standard Meal Plate',
      servingSize: '1 portion (~350g)',
      calories: 450,
      protein: 28,
      carbs: 45,
      fat: 16,
      fiber: 5,
      notes: 'Estimated standard balanced portion',
    });
    totalCal = 450;
    totalP = 28;
    totalC = 45;
    totalF = 16;
    totalFib = 5;
  }

  return res.json({
    success: true,
    data: {
      mealTitle: query ? query.charAt(0).toUpperCase() + query.slice(1) : 'Quick Logged Meal',
      totalCalories: Math.round(totalCal),
      totalProtein: Math.round(totalP * 10) / 10,
      totalCarbs: Math.round(totalC * 10) / 10,
      totalFat: Math.round(totalF * 10) / 10,
      totalFiber: Math.round(totalFib * 10) / 10,
      items: matchedItems,
      dietaryInsights: 'Calculated using standard nutrition reference data.',
    },
    source: 'fallback',
  });
}

// API: Analyze workout / exercise from natural language description
app.post('/api/analyze-exercise', async (req: Request, res: Response) => {
  try {
    const { query, weightKg } = req.body;
    const userWeight = Number(weightKg) || 75;

    if (!query) {
      return res.status(400).json({ error: 'Please describe your exercise or physical activity.' });
    }

    if (apiKey) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `A user weighing ${userWeight} kg performed this exercise or workout: "${query}".
Break this workout into discrete physical activities. For each activity, estimate the duration in minutes, calories burned using exercise science MET principles, the intensity (light, moderate, vigorous), and category (cardio, strength, sports, walking, flexibility, hiit). Calculate the total calories burned and provide a brief workout recovery tip.`,
        config: {
          systemInstruction: 'You are an expert exercise physiologist. Return structured JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sessionTitle: { type: Type.STRING },
              totalDurationMinutes: { type: Type.NUMBER },
              totalCaloriesBurned: { type: Type.NUMBER },
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ['cardio', 'strength', 'sports', 'walking', 'flexibility', 'hiit'] },
                    durationMinutes: { type: Type.NUMBER },
                    caloriesBurned: { type: Type.NUMBER },
                    intensity: { type: Type.STRING, enum: ['light', 'moderate', 'vigorous'] },
                    notes: { type: Type.STRING },
                  },
                  required: ['name', 'category', 'durationMinutes', 'caloriesBurned', 'intensity'],
                },
              },
              recoveryAdvice: { type: Type.STRING },
            },
            required: ['sessionTitle', 'totalDurationMinutes', 'totalCaloriesBurned', 'activities'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed, source: 'gemini' });
    }

    // Fallback rule-based estimation
    return res.json({
      success: true,
      data: {
        sessionTitle: query,
        totalDurationMinutes: 30,
        totalCaloriesBurned: Math.round(userWeight * 4.5),
        activities: [
          {
            name: query,
            category: 'cardio',
            durationMinutes: 30,
            caloriesBurned: Math.round(userWeight * 4.5),
            intensity: 'moderate',
            notes: 'Calculated baseline',
          },
        ],
        recoveryAdvice: 'Hydrate well and replenish with water and protein.',
      },
      source: 'fallback',
    });
  } catch (err: any) {
    console.warn('Exercise analysis failed, fallback used:', err?.message);
    const userWeight = Number(req.body.weightKg) || 75;
    return res.json({
      success: true,
      data: {
        sessionTitle: req.body.query || 'Workout Session',
        totalDurationMinutes: 30,
        totalCaloriesBurned: Math.round(userWeight * 4.5),
        activities: [
          {
            name: req.body.query || 'Physical Exercise',
            category: 'cardio',
            durationMinutes: 30,
            caloriesBurned: Math.round(userWeight * 4.5),
            intensity: 'moderate',
            notes: 'Estimated standard exertion',
          },
        ],
        recoveryAdvice: 'Remember to stretch and hydrate.',
      },
      source: 'fallback',
    });
  }
});

// API: Personalized Diet Advice & Strategy
app.post('/api/diet-advice', async (req: Request, res: Response) => {
  try {
    const { profile, currentStats } = req.body;

    if (!profile) {
      return res.status(400).json({ error: 'User profile is required.' });
    }

    if (apiKey) {
      const prompt = `You are a world-class evidence-based sports nutritionist and registered dietitian.
User Profile:
- Goal: ${profile.goal} weight (${profile.rate || 'moderate'} pace)
- Current Weight: ${profile.weightKg} kg, Target Weight: ${profile.targetWeightKg || 'Not specified'} kg, Height: ${profile.heightCm} cm, Age: ${profile.age}, Gender: ${profile.gender}
- Activity Level: ${profile.activityLevel}
- Dietary Preference: ${profile.dietType || 'balanced'}
- Allergies/Notes: ${profile.allergiesOrPreferences || 'None'}

Today's Progress:
- Calorie Budget: ${currentStats.targetCalories} kcal (Consumed: ${currentStats.consumedCalories} kcal, Remaining: ${currentStats.targetCalories - currentStats.consumedCalories} kcal)
- Protein: ${currentStats.consumedProtein}g / ${currentStats.targetProtein}g target
- Carbs: ${currentStats.consumedCarbs}g / ${currentStats.targetCarbs}g target
- Fat: ${currentStats.consumedFat}g / ${currentStats.targetFat}g target
- Water: ${currentStats.waterMl || 0} ml
- Recent Foods Logged: ${JSON.stringify(currentStats.recentFoods || [])}

Provide comprehensive, highly actionable coaching tailored to their specific goal (whether they want to gain, lose, or maintain weight).
Include:
1. Status Assessment: How they are tracking today and what their priority is right now.
2. Next Meal / Snack Recommendation: Precise food ideas to hit their remaining calories and protein without overshooting.
3. Strategic Diet Guide: 3 clear, goal-specific management rules (e.g. for fat loss: satiety, protein leverage, NEAT; for weight gain: calorie density, liquid nutrition, pre/post workout; for maintain: energy balance, metabolic flexibility).
4. Hydration & Micronutrient Tip.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Provide encouraging, scientific, practical nutrition coaching. Return structured JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              statusHeadline: { type: Type.STRING, description: 'Short 1-sentence punchy status headline' },
              coachingSummary: { type: Type.STRING, description: '2-3 sentences assessing their day so far' },
              remainingStrategy: { type: Type.STRING, description: 'Clear guidance on what to consume for remaining calories/macros' },
              recommendedMeals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    estCalories: { type: Type.NUMBER },
                    estProtein: { type: Type.NUMBER },
                    estCarbs: { type: Type.NUMBER },
                    estFat: { type: Type.NUMBER },
                    prepTime: { type: Type.STRING },
                  },
                  required: ['title', 'description', 'estCalories', 'estProtein'],
                },
              },
              keyRulesForGoal: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    rule: { type: Type.STRING },
                  },
                  required: ['title', 'rule'],
                },
              },
              hydrationAssessment: { type: Type.STRING },
            },
            required: ['statusHeadline', 'coachingSummary', 'remainingStrategy', 'recommendedMeals', 'keyRulesForGoal'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed, source: 'gemini' });
    }

    // Fallback rule-based advice
    const remainingCal = currentStats.targetCalories - currentStats.consumedCalories;
    const remainingP = Math.max(0, currentStats.targetProtein - currentStats.consumedProtein);

    let headline = 'On Track with Today’s Budget';
    let summary = `You have ${Math.abs(remainingCal)} kcal ${remainingCal >= 0 ? 'remaining' : 'over budget'} and need about ${remainingP}g of protein to hit your daily goal.`;
    const rules = [];

    if (profile.goal === 'lose') {
      headline = remainingCal >= 0 ? 'Consistent Caloric Deficit Maintained' : 'Slight Surplus Today — Refocus on Volume';
      rules.push(
        { title: 'Prioritize Protein Leverage', rule: 'Consume 1.8g to 2.2g of protein per kg bodyweight to preserve lean muscle and trigger maximal satiety.' },
        { title: 'High-Volume, Low-Calorie Density', rule: 'Fill half your plate with leafy greens, broccoli, zucchini, or berries to keep stomach stretch receptors satisfied.' },
        { title: 'Hydrate Before Meals', rule: 'Drink 500ml of cold water 15 minutes before lunch and dinner to naturally curb appetite.' }
      );
    } else if (profile.goal === 'gain') {
      headline = remainingCal <= 0 ? 'Caloric Surplus Achieved for Muscle Growth' : 'Calorie Intake Lagging — Need Dense Fuel';
      rules.push(
        { title: 'Clean Calorie Density', rule: 'Add healthy fats like nut butters, olive oil, avocado, and full-fat dairy to boost calories without extreme stomach fullness.' },
        { title: 'Liquid Nutrition', rule: 'Drink a shake with whey/plant protein, oats, banana, peanut butter, and milk for 500-700 easy-to-digest surplus calories.' },
        { title: 'Progressive Overload', rule: 'Combine your caloric surplus with consistent resistance training so surplus energy turns into lean tissue rather than excess adipose.' }
      );
    } else {
      headline = 'Balanced Energy Expenditure';
      rules.push(
        { title: 'Equilibrium & Flexibility', rule: 'Aim to stay within +/- 100 kcal of your TDEE for stable body weight and sustained hormonal health.' },
        { title: 'Diverse Micronutrients', rule: 'Eat the rainbow: include varied colorful vegetables, healthy fats, and fiber sources every day.' },
        { title: 'Monitor Weekly Averages', rule: 'Daily water fluctuations occur; track 7-day average weight to confirm true maintenance.' }
      );
    }

    return res.json({
      success: true,
      data: {
        statusHeadline: headline,
        coachingSummary: summary,
        remainingStrategy: remainingCal > 0
          ? `Allocate your remaining ${remainingCal} kcal towards a lean protein source (chicken, tofu, Greek yogurt) paired with complex carbs or greens.`
          : 'You have reached your target calories today. Sip herbal tea or water and prepare for a restful sleep.',
        recommendedMeals: [
          {
            title: profile.goal === 'lose' ? 'Greek Yogurt & Berry High-Protein Bowl' : 'Power Peanut Butter & Banana Protein Oatmeal',
            description: profile.goal === 'lose' ? '200g 0% Greek yogurt with fresh berries and cinnamon' : 'Steel cut oats with 2 tbsp peanut butter, sliced banana, and whey',
            estCalories: profile.goal === 'lose' ? 180 : 480,
            estProtein: profile.goal === 'lose' ? 22 : 32,
            estCarbs: profile.goal === 'lose' ? 18 : 55,
            estFat: profile.goal === 'lose' ? 2 : 16,
            prepTime: '5 mins',
          },
        ],
        keyRulesForGoal: rules,
        hydrationAssessment: 'Aim for at least 2.5 - 3.0 liters of fluids daily.',
      },
      source: 'fallback',
    });
  } catch (err: any) {
    console.error('Diet advice error:', err);
    return res.status(500).json({ error: 'Failed to generate diet advice' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`NutriTrack server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer();
