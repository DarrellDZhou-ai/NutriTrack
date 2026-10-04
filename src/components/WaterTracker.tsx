import React from 'react';
import { Droplet, Plus, Minus } from 'lucide-react';

interface WaterTrackerProps {
  currentMl: number;
  targetMl: number;
  onAddWater: (ml: number) => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  currentMl,
  targetMl,
  onAddWater,
}) => {
  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100));

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 font-display">
              Hydration Tracker
            </h4>
            <div className="text-xs text-stone-500 font-medium">
              <span>{currentMl.toLocaleString()} ml</span>
              <span aria-hidden="true"> · </span>
              <span>{targetMl.toLocaleString()} ml goal ({percent}%)</span>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddWater(-250)}
            disabled={currentMl <= 0}
            className="p-1.5 text-stone-400 hover:text-stone-700 disabled:opacity-30 rounded-lg hover:bg-stone-100 transition-colors"
            title="Remove 250ml"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onAddWater(250)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg border border-blue-200/60 transition-colors cursor-pointer active:scale-98"
          >
            <Plus className="w-3 h-3" />
            <span>+250ml Glass</span>
          </button>

          <button
            onClick={() => onAddWater(500)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg border border-blue-200/60 transition-colors cursor-pointer active:scale-98"
          >
            <Plus className="w-3 h-3" />
            <span>+500ml Bottle</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
