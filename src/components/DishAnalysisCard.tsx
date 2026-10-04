import React from 'react';
import { Eye, Utensils, Tag, Sparkles, Check, Globe2 } from 'lucide-react';
import { FoodIdentification } from '../types/trace';

interface DishAnalysisCardProps {
  food: FoodIdentification;
}

export const DishAnalysisCard: React.FC<DishAnalysisCardProps> = ({ food }) => {
  const confidencePercent = Math.round(food.confidence * 100);

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Eye className="w-3.5 h-3.5" />
            <span>AI Food Vision Analysis</span>
          </div>
          <h3 className="text-2xl font-heading font-bold text-white mt-1">
            {food.dish_name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cuisine: <span className="text-amber-300 font-medium">{food.cuisine_category}</span>
          </p>
        </div>

        {/* Confidence Meter Badge */}
        <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="text-right">
            <p className="text-[10px] uppercase font-mono text-slate-400">Vision Confidence</p>
            <p className="text-lg font-heading font-bold text-emerald-400">{confidencePercent}%</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Visual Attributes & Regional Aliases */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Regional Aliases */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 mb-2.5">
            <Globe2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Regional & Alternate Names:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {food.alternate_names?.map((alias, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/60"
              >
                {alias}
              </span>
            ))}
          </div>
        </div>

        {/* Dietary & Cuisine Tags */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 mb-2.5">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dietary Attributes:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {food.dietary_tags?.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Attributes Observed in Image */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Multimodal Visual Features Extracted:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {food.visual_attributes?.map((attr, i) => (
            <div
              key={i}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{attr}</span>
            </div>
          ))}
        </div>
        {food.visual_description && (
          <p className="mt-3 text-xs text-slate-400 italic">
            "{food.visual_description}"
          </p>
        )}
      </div>
    </div>
  );
};
