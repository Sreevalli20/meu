import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Sun, Contrast, Eye, Sparkles, RotateCcw, Check, X } from 'lucide-react';
import { ImageAdjustment } from '../types/trace';

interface ImageAdjustmentStudioProps {
  originalImageBase64: string;
  mimeType: string;
  onApplyAdjustment: (enhancedBase64: string, adjustment: ImageAdjustment) => void;
  onCancel: () => void;
}

export const ImageAdjustmentStudio: React.FC<ImageAdjustmentStudioProps> = ({
  originalImageBase64,
  mimeType,
  onApplyAdjustment,
  onCancel,
}) => {
  const [adjustment, setAdjustment] = useState<ImageAdjustment>({
    brightness: 105,
    contrast: 110,
    sharpness: 25,
    saturation: 110,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      renderAdjustedImage();
    };
    img.src = `data:${mimeType};base64,${originalImageBase64}`;
  }, [originalImageBase64, mimeType]);

  // Re-render canvas when adjustments change
  useEffect(() => {
    if (imageObjRef.current) {
      renderAdjustedImage();
    }
  }, [adjustment]);

  const renderAdjustedImage = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth || 600;
    canvas.height = img.naturalHeight || 400;

    // Apply CSS filter pipeline onto canvas
    const filterString = `brightness(${adjustment.brightness}%) contrast(${adjustment.contrast}%) saturate(${adjustment.saturation}%)`;
    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply digital convolution sharpening if sharpness > 0
    if (adjustment.sharpness > 0) {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const factor = (adjustment.sharpness / 100) * 0.6; // gentle kernel
        const weights = [0, -factor, 0, -factor, 1 + 4 * factor, -factor, 0, -factor, 0];
        const side = Math.round(Math.sqrt(weights.length));
        const halfSide = Math.floor(side / 2);
        const src = imgData.data;
        const sw = imgData.width;
        const sh = imgData.height;
        const output = ctx.createImageData(sw, sh);
        const dst = output.data;

        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const dstOff = (y * sw + x) * 4;
            let r = 0, g = 0, b = 0;
            for (let cy = 0; cy < side; cy++) {
              for (let cx = 0; cx < side; cx++) {
                const scy = Math.min(sh - 1, Math.max(0, y + cy - halfSide));
                const scx = Math.min(sw - 1, Math.max(0, x + cx - halfSide));
                const srcOff = (scy * sw + scx) * 4;
                const wt = weights[cy * side + cx];
                r += src[srcOff] * wt;
                g += src[srcOff + 1] * wt;
                b += src[srcOff + 2] * wt;
              }
            }
            dst[dstOff] = Math.min(255, Math.max(0, r));
            dst[dstOff + 1] = Math.min(255, Math.max(0, g));
            dst[dstOff + 2] = Math.min(255, Math.max(0, b));
            dst[dstOff + 3] = src[dstOff + 3];
          }
        }
        ctx.putImageData(output, 0, 0);
      } catch (e) {
        // Fallback to css filter only if getImageData blocked
      }
    }
  };

  const handleApplyPreset = (presetName: 'street' | 'lowlight' | 'vivid' | 'reset') => {
    switch (presetName) {
      case 'street':
        setAdjustment({ brightness: 108, contrast: 115, sharpness: 40, saturation: 115 });
        break;
      case 'lowlight':
        setAdjustment({ brightness: 125, contrast: 120, sharpness: 30, saturation: 105 });
        break;
      case 'vivid':
        setAdjustment({ brightness: 100, contrast: 125, sharpness: 35, saturation: 135 });
        break;
      case 'reset':
        setAdjustment({ brightness: 100, contrast: 100, sharpness: 0, saturation: 100 });
        break;
    }
  };

  const handleSaveAndConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL(mimeType || 'image/jpeg', 0.92);
    const base64Content = dataUrl.split(',')[1];
    onApplyAdjustment(base64Content, adjustment);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Food Image Filter & Enhancement Studio
              </h3>
              <p className="text-xs text-slate-400">
                Optimize lighting, clarity, and contrast to maximize AI vision recognition accuracy.
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div className="mt-4 relative rounded-xl overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center min-h-[260px] max-h-[380px]">
          <canvas ref={canvasRef} className="max-w-full max-h-[360px] object-contain shadow-lg" />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-amber-400 border border-slate-800">
            Preview Enhanced
          </div>
        </div>

        {/* Preset Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Quick Presets:</span>
          <button
            onClick={() => handleApplyPreset('street')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-xs text-slate-200 hover:text-amber-300 border border-slate-700 transition"
          >
            Crisp Street Food
          </button>
          <button
            onClick={() => handleApplyPreset('lowlight')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-xs text-slate-200 hover:text-amber-300 border border-slate-700 transition"
          >
            Low Light Boost
          </button>
          <button
            onClick={() => handleApplyPreset('vivid')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-xs text-slate-200 hover:text-amber-300 border border-slate-700 transition"
          >
            Vivid Colors
          </button>
          <button
            onClick={() => handleApplyPreset('reset')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 hover:text-white border border-slate-700 transition flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          {/* Brightness */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Brightness</span>
              </span>
              <span className="text-amber-400 font-bold">{adjustment.brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="160"
              value={adjustment.brightness}
              onChange={(e) => setAdjustment({ ...adjustment, brightness: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Contrast className="w-3.5 h-3.5 text-cyan-400" />
                <span>Contrast</span>
              </span>
              <span className="text-cyan-400 font-bold">{adjustment.contrast}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="160"
              value={adjustment.contrast}
              onChange={(e) => setAdjustment({ ...adjustment, contrast: Number(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Sharpness */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edge Sharpness</span>
              </span>
              <span className="text-emerald-400 font-bold">{adjustment.sharpness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={adjustment.sharpness}
              onChange={(e) => setAdjustment({ ...adjustment, sharpness: Number(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>Color Richness</span>
              </span>
              <span className="text-purple-400 font-bold">{adjustment.saturation}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="160"
              value={adjustment.saturation}
              onChange={(e) => setAdjustment({ ...adjustment, saturation: Number(e.target.value) })}
              className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndConfirm}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-heading font-bold text-xs shadow-lg transition flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply Enhancement to AI Trace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
