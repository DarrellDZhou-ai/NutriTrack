import React from 'react';
import { FoodItem, MealCategory } from '../types/nutrition';
import { Plus, Trash2, Coffee, Utensils, Moon, Apple, Sparkles } from 'lucide-react';

interface MealSectionProps {
  category: MealCategory;
  title: string;
  items: FoodItem[];
  onAddFood: (category: MealCategory) => void;
  onDeleteItem: (id: string) => void;
}

const MEAL_ICONS: Record<MealCategory, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4 text-amber-600" />,
  lunch: <Utensils className="w-4 h-4 text-emerald-600" />,
  dinner: <Moon className="w-4 h-4 text-indigo-600" />,
  snack: <Apple className="w-4 h-4 text-rose-500" />,
};

export const MealSection: React.FC<MealSectionProps> = ({
  category,
  title,
  items,
  onAddFood,
  onDeleteItem,
}) => {
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + (Number(item.calories) || 0),
      protein: acc.protein + (Number(item.protein) || 0),
      carbs: acc.carbs + (Number(item.carbs) || 0),
      fat: acc.fat + (Number(item.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden transition-all hover:border-stone-300/80">
      {/* Meal Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-stone-100 bg-stone-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-stone-200/80 flex items-center justify-center shadow-2xs">
            {MEAL_ICONS[category]}
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900 font-display">
              {title}
            </h3>
            {/* Clean unboxed metadata with typographic separators */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
              <span>{Math.round(totals.calories)} kcal</span>
              <span aria-hidden="true">·</span>
              <span className="text-blue-700">{Math.round(totals.protein)}g P</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700">{Math.round(totals.carbs)}g C</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700">{Math.round(totals.fat)}g F</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onAddFood(category)}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50/80 border border-stone-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Food</span>
        </button>
      </div>

      {/* Items List */}
      <div className="divide-y divide-stone-100">
        {items.length === 0 ? (
          <div className="py-7 px-5 text-center">
            <p className="text-xs text-stone-400">No foods logged for {title.toLowerCase()} yet.</p>
            <button
              onClick={() => onAddFood(category)}
              className="mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
            >
              + Log with AI or search presets
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="px-5 py-3.5 flex items-center justify-between group hover:bg-stone-50/60 transition-colors"
            >
              <div className="space-y-0.5 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-900 leading-snug">
                    {item.name}
                  </span>
                  {item.source === 'ai' && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Scan
                    </span>
                  )}
                </div>

                {/* Unboxed clean metadata per constitution */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500">
                  <span className="text-stone-600 font-medium">{item.servingSize}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-stone-900">{Math.round(item.calories)} kcal</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-600">{Math.round(item.protein)}g P</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-600">{Math.round(item.carbs)}g C</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-600">{Math.round(item.fat)}g F</span>
                  {item.fiber > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-400">{Math.round(item.fiber)}g fiber</span>
                    </>
                  )}
                </div>

                {item.notes && (
                  <p className="text-[11px] text-stone-400 italic">{item.notes}</p>
                )}
              </div>

              {/* Item Actions */}
              <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Delete food entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
