import React from 'react';
import { ExerciseItem } from '../types/nutrition';
import {
  Flame,
  Plus,
  Trash2,
  Activity,
  Dumbbell,
  Timer,
  Zap,
} from 'lucide-react';

interface ExerciseSectionProps {
  exercises: ExerciseItem[];
  totalBurned: number;
  onOpenLogger: () => void;
  onDeleteExercise: (id: string) => void;
}

export const ExerciseSection: React.FC<ExerciseSectionProps> = ({
  exercises,
  totalBurned,
  onOpenLogger,
  onDeleteExercise,
}) => {
  const totalMinutes = exercises.reduce((acc, ex) => acc + (Number(ex.durationMinutes) || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden transition-all hover:border-stone-300/80">
      {/* Header */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 bg-orange-50/30 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs shrink-0">
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-stone-900 font-display">
                Physical Activities & Workouts
              </h3>
              <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200/60 font-display">
                +{totalBurned.toLocaleString()} kcal Burned
              </span>
            </div>
            {/* Clean unboxed metadata per constitution */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
              <span>{exercises.length} {exercises.length === 1 ? 'activity' : 'activities'} logged</span>
              <span aria-hidden="true">·</span>
              <span>{totalMinutes} active minutes</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">Expands daily calorie budget</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenLogger}
          className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 hover:text-orange-800 bg-white hover:bg-orange-50/80 border border-orange-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Exercise</span>
        </button>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-stone-100">
        {exercises.length === 0 ? (
          <div className="py-7 px-5 text-center">
            <p className="text-xs text-stone-400">
              No exercise activities logged for today yet.
            </p>
            <button
              onClick={onOpenLogger}
              className="mt-2 text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
            >
              + Log a run, gym workout, walk, or sport
            </button>
          </div>
        ) : (
          exercises.map((ex) => (
            <div
              key={ex.id}
              className="px-5 py-3.5 flex items-center justify-between group hover:bg-stone-50/60 transition-colors"
            >
              <div className="space-y-0.5 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-900 leading-snug">
                    {ex.name}
                  </span>
                  <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded capitalize">
                    {ex.intensity}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500">
                  <span className="text-stone-700 font-medium">{ex.durationMinutes} mins</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-orange-600 font-display">
                    +{ex.caloriesBurned} kcal burned
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-400 capitalize">{ex.category}</span>
                  {ex.loggedAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-400">{ex.loggedAt}</span>
                    </>
                  )}
                </div>

                {ex.notes && (
                  <p className="text-[11px] text-stone-400 italic">{ex.notes}</p>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDeleteExercise(ex.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Delete exercise entry"
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
