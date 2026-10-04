export interface PresetFood {
  name: string;
  category: 'Proteins' | 'Carbohydrates' | 'Healthy Fats' | 'Fruits & Vegetables' | 'Meals & Snacks' | 'Drinks';
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  icon?: string;
  popularMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export const PRESET_FOODS: PresetFood[] = [
  // Proteins
  { name: 'Eggs (Whole)', category: 'Proteins', servingSize: '2 large (100g)', calories: 144, protein: 12.6, carbs: 0.8, fat: 9.6, fiber: 0, popularMealType: 'breakfast' },
  { name: 'Egg Whites', category: 'Proteins', servingSize: '100g (~3 whites)', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0, popularMealType: 'breakfast' },
  { name: 'Chicken Breast (Skinless)', category: 'Proteins', servingSize: '150g grilled', calories: 247, protein: 46.5, carbs: 0, fat: 5.4, fiber: 0, popularMealType: 'lunch' },
  { name: 'Atlantic Salmon Fillet', category: 'Proteins', servingSize: '150g cooked', calories: 312, protein: 30, carbs: 0, fat: 19.5, fiber: 0, popularMealType: 'dinner' },
  { name: 'Lean Ground Beef (90/10)', category: 'Proteins', servingSize: '150g cooked', calories: 315, protein: 39, carbs: 0, fat: 15, fiber: 0, popularMealType: 'dinner' },
  { name: 'Greek Yogurt (0% Non-Fat)', category: 'Proteins', servingSize: '1 cup (225g)', calories: 130, protein: 22, carbs: 8, fat: 0, fiber: 0, popularMealType: 'breakfast' },
  { name: 'Whey Protein Powder', category: 'Proteins', servingSize: '1 scoop (30g)', calories: 120, protein: 24, carbs: 2, fat: 1.5, fiber: 0.5, popularMealType: 'snack' },
  { name: 'Tofu (Extra Firm)', category: 'Proteins', servingSize: '150g', calories: 140, protein: 15, carbs: 3, fat: 8, fiber: 2, popularMealType: 'lunch' },
  { name: 'Canned Tuna (in Spring Water)', category: 'Proteins', servingSize: '1 can drained (120g)', calories: 132, protein: 29, carbs: 0, fat: 1.2, fiber: 0, popularMealType: 'lunch' },
  { name: 'Cottage Cheese (Low Fat)', category: 'Proteins', servingSize: '1 cup (225g)', calories: 163, protein: 28, carbs: 6, fat: 2.5, fiber: 0, popularMealType: 'snack' },
  { name: 'Plant Protein Shake', category: 'Proteins', servingSize: '1 scoop (35g)', calories: 130, protein: 21, carbs: 5, fat: 2.5, fiber: 3, popularMealType: 'snack' },

  // Carbohydrates
  { name: 'Rolled Oats (Dry)', category: 'Carbohydrates', servingSize: '1/2 cup (40g)', calories: 154, protein: 5.3, carbs: 27, fat: 2.6, fiber: 4, popularMealType: 'breakfast' },
  { name: 'Jasmine White Rice', category: 'Carbohydrates', servingSize: '1 cup cooked (158g)', calories: 205, protein: 4.2, carbs: 45, fat: 0.4, fiber: 0.6, popularMealType: 'lunch' },
  { name: 'Brown Rice', category: 'Carbohydrates', servingSize: '1 cup cooked (195g)', calories: 218, protein: 4.5, carbs: 46, fat: 1.6, fiber: 3.5, popularMealType: 'dinner' },
  { name: 'Sweet Potato (Baked)', category: 'Carbohydrates', servingSize: '1 medium (130g)', calories: 112, protein: 2, carbs: 26, fat: 0.1, fiber: 3.9, popularMealType: 'dinner' },
  { name: 'Quinoa (Cooked)', category: 'Carbohydrates', servingSize: '1 cup (185g)', calories: 222, protein: 8.1, carbs: 39, fat: 3.6, fiber: 5.2, popularMealType: 'lunch' },
  { name: 'Whole Wheat Bread', category: 'Carbohydrates', servingSize: '2 slices (64g)', calories: 160, protein: 8, carbs: 28, fat: 2, fiber: 4, popularMealType: 'breakfast' },
  { name: 'Sourdough Bread', category: 'Carbohydrates', servingSize: '1 large slice (50g)', calories: 120, protein: 4.5, carbs: 24, fat: 0.8, fiber: 1.2, popularMealType: 'breakfast' },
  { name: 'Whole Wheat Pasta', category: 'Carbohydrates', servingSize: '100g cooked', calories: 140, protein: 6, carbs: 30, fat: 1, fiber: 4, popularMealType: 'dinner' },
  { name: 'Black Beans (Cooked)', category: 'Carbohydrates', servingSize: '1/2 cup (86g)', calories: 114, protein: 7.6, carbs: 20.4, fat: 0.5, fiber: 7.5, popularMealType: 'lunch' },

  // Healthy Fats
  { name: 'Avocado', category: 'Healthy Fats', servingSize: '1/2 medium (100g)', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, popularMealType: 'lunch' },
  { name: 'Extra Virgin Olive Oil', category: 'Healthy Fats', servingSize: '1 tbsp (14ml)', calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0, popularMealType: 'dinner' },
  { name: 'Almonds (Raw)', category: 'Healthy Fats', servingSize: '1 oz (28g / ~23 nuts)', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, popularMealType: 'snack' },
  { name: 'Natural Peanut Butter', category: 'Healthy Fats', servingSize: '2 tbsp (32g)', calories: 188, protein: 8, carbs: 7, fat: 16, fiber: 2, popularMealType: 'snack' },
  { name: 'Walnuts', category: 'Healthy Fats', servingSize: '1 oz (28g)', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, popularMealType: 'snack' },
  { name: 'Chia Seeds', category: 'Healthy Fats', servingSize: '1 tbsp (12g)', calories: 58, protein: 2, carbs: 5, fat: 3.6, fiber: 4.1, popularMealType: 'breakfast' },
  { name: 'Flaxseeds (Ground)', category: 'Healthy Fats', servingSize: '1 tbsp (10g)', calories: 55, protein: 1.9, carbs: 3, fat: 4.2, fiber: 2.8, popularMealType: 'breakfast' },

  // Fruits & Vegetables
  { name: 'Banana', category: 'Fruits & Vegetables', servingSize: '1 medium (118g)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1, popularMealType: 'snack' },
  { name: 'Apple (Gala/Honeycrisp)', category: 'Fruits & Vegetables', servingSize: '1 medium (182g)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, popularMealType: 'snack' },
  { name: 'Blueberries (Fresh)', category: 'Fruits & Vegetables', servingSize: '1 cup (148g)', calories: 84, protein: 1.1, carbs: 21.4, fat: 0.5, fiber: 3.6, popularMealType: 'breakfast' },
  { name: 'Strawberries', category: 'Fruits & Vegetables', servingSize: '1 cup halves (152g)', calories: 49, protein: 1, carbs: 11.7, fat: 0.5, fiber: 3, popularMealType: 'snack' },
  { name: 'Broccoli (Steamed)', category: 'Fruits & Vegetables', servingSize: '1 cup florets (150g)', calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, fiber: 5.1, popularMealType: 'dinner' },
  { name: 'Baby Spinach', category: 'Fruits & Vegetables', servingSize: '2 cups raw (60g)', calories: 14, protein: 1.7, carbs: 2.2, fat: 0.2, fiber: 1.3, popularMealType: 'lunch' },
  { name: 'Mixed Salad Greens', category: 'Fruits & Vegetables', servingSize: '3 cups (85g)', calories: 18, protein: 1.5, carbs: 3, fat: 0.2, fiber: 1.8, popularMealType: 'lunch' },
  { name: 'Carrots (Baby)', category: 'Fruits & Vegetables', servingSize: '1 cup (100g)', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, popularMealType: 'snack' },

  // Meals & Popular Plates
  { name: 'Avocado Toast with Poached Egg', category: 'Meals & Snacks', servingSize: '1 slice sourdough + egg', calories: 290, protein: 12, carbs: 26, fat: 16, fiber: 5, popularMealType: 'breakfast' },
  { name: 'Chicken & Rice Power Bowl', category: 'Meals & Snacks', servingSize: '1 large bowl (380g)', calories: 510, protein: 42, carbs: 55, fat: 12, fiber: 4.5, popularMealType: 'lunch' },
  { name: 'Grilled Salmon with Quinoa & Asparagus', category: 'Meals & Snacks', servingSize: '1 plate (350g)', calories: 480, protein: 36, carbs: 32, fat: 22, fiber: 6, popularMealType: 'dinner' },
  { name: 'Berry Protein Smoothie Bowl', category: 'Meals & Snacks', servingSize: '1 bowl (400ml)', calories: 340, protein: 28, carbs: 42, fat: 6, fiber: 7, popularMealType: 'breakfast' },
  { name: 'Beef Stir Fry with Broccoli & Brown Rice', category: 'Meals & Snacks', servingSize: '1 bowl (420g)', calories: 540, protein: 38, carbs: 52, fat: 18, fiber: 5.5, popularMealType: 'dinner' },
  { name: 'Turkey & Hummus Wrap', category: 'Meals & Snacks', servingSize: '1 whole wrap (220g)', calories: 390, protein: 28, carbs: 38, fat: 14, fiber: 4, popularMealType: 'lunch' },

  // Drinks
  { name: 'Black Coffee', category: 'Drinks', servingSize: '1 mug (240ml)', calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, popularMealType: 'breakfast' },
  { name: 'Oat Milk Latte (Unsweetened)', category: 'Drinks', servingSize: '1 tall cup (350ml)', calories: 120, protein: 3, carbs: 16, fat: 5, fiber: 1.5, popularMealType: 'breakfast' },
  { name: 'Green Tea (Unsweetened)', category: 'Drinks', servingSize: '1 mug (240ml)', calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0, popularMealType: 'snack' },
  { name: 'Whole Cow Milk', category: 'Drinks', servingSize: '1 cup (244ml)', calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, popularMealType: 'breakfast' },
  { name: 'Almond Milk (Unsweetened)', category: 'Drinks', servingSize: '1 cup (240ml)', calories: 30, protein: 1, carbs: 1, fat: 2.5, fiber: 1, popularMealType: 'breakfast' },
];
