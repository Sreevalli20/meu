import React, { useState } from 'react';
import { Globe2, Edit3, Check, RefreshCw } from 'lucide-react';
import { FoodIdentification } from '../types/trace';

interface DishSynonymBarProps {
  food: FoodIdentification;
  onCorrectDish: (newDishName: string) => void;
  isUpdating: boolean;
}

export const DishSynonymBar: React.FC<DishSynonymBarProps> = ({
  food,
  onCorrectDish,
  isUpdating,
}) => {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Extract clean primary dish tokens
  const synonyms = Array.from(
    new Set([
      food.dish_name.split('/')[0].trim(),
      ...(food.alternate_names || []).map((a) => a.split('/')[0].trim()),
    ])
  ).slice(0, 5);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onCorrectDish(customInput.trim());
      setIsEditingCustom(false);
      setCustomInput('');
    }
  };

  return (
    <div className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Globe2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-mono font-medium text-slate-300">
            Regional Synonyms & Human Verification:
          </span>
        </div>

        {/* Quick Correction Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {synonyms.map((synonym) => {
            const isCurrent =
              food.dish_name.toLowerCase().includes(synonym.toLowerCase()) ||
              synonym.toLowerCase().includes(food.dish_name.toLowerCase());

            return (
              <button
                key={synonym}
                onClick={() => onCorrectDish(synonym)}
                disabled={isUpdating}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                {isCurrent && <span className="mr-1">✓</span>}
                {synonym}
              </button>
            );
          })}

          {/* Custom Dish Correction Input Button */}
          {isEditingCustom ? (
            <form onSubmit={handleCustomSubmit} className="flex items-center space-x-1">
              <input
                type="text"
                autoFocus
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Specific dish name..."
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-400 text-xs text-white placeholder-slate-500 focus:outline-none font-mono w-36"
              />
              <button
                type="submit"
                className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingCustom(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingCustom(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono border border-slate-800 transition flex items-center space-x-1"
            >
              <Edit3 className="w-3 h-3 text-amber-400" />
              <span>Other...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
