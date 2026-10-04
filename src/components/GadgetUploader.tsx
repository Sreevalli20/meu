import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Sparkles, RefreshCw, X, CheckCircle2, Sliders, Wand2 } from 'lucide-react';
import { SampleFoodPreset, ImageAdjustment } from '../types/trace';
import { ImageAdjustmentStudio } from './ImageAdjustmentStudio';

export const SAMPLE_PRESETS: SampleFoodPreset[] = [];

interface GadgetUploaderProps {
  onTrace: (payload: {
    imageBase64?: string;
    mimeType?: string;
    filenameHint?: string;
    preset?: SampleFoodPreset;
  }) => void;
  isTracing: boolean;
}

export const GadgetUploader: React.FC<GadgetUploaderProps> = ({ onTrace, isTracing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [filenameHint, setFilenameHint] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [showAdjustmentStudio, setShowAdjustmentStudio] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64Content = result.split(',')[1];
      setSelectedImage(base64Content);
      setSelectedMimeType(file.type);
      setFilenameHint(file.name);
      setIsEnhanced(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access denied or unavailable in this browser.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedImage(dataUrl.split(',')[1]);
      setSelectedMimeType('image/jpeg');
      setFilenameHint('camera_capture.jpg');
      setIsEnhanced(false);
    }
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  const openAdjustmentForCurrent = async () => {
    if (selectedImage) {
      setShowAdjustmentStudio(true);
    }
  };

  const handleApplyAdjustment = (enhancedBase64: string, adjustment: ImageAdjustment) => {
    setSelectedImage(enhancedBase64);
    setIsEnhanced(true);
    setShowAdjustmentStudio(false);
  };

  const handleStartTrace = () => {
    if (selectedImage) {
      onTrace({
        imageBase64: selectedImage,
        mimeType: selectedMimeType,
        filenameHint: isEnhanced ? `enhanced_${filenameHint}` : filenameHint,
      });
    }
  };

  return (
    <div className="w-full">
      {/* Gadget Shell Box */}
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Futuristic Background Reticle & Glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title inside Gadget */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Multi-Agent Food Radar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
              "Show us the food. We'll find where it may actually exist."
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Upload an Instagram photo, friend's snapshot, or street food picture. Our vision agent extracts visual features, queries verified geospatial registries, and builds an audit-backed evidence chain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center space-x-2"
            >
              <UploadCloud className="w-4 h-4 text-amber-400" />
              <span>Upload Photo</span>
            </button>
            <button
              onClick={startCamera}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center space-x-2"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Use Camera</span>
            </button>
          </div>
        </div>

        {/* Live Camera View Modal/Area */}
        {showCamera && (
          <div className="mb-6 relative rounded-xl overflow-hidden border border-amber-500/40 bg-black aspect-video max-h-80 flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-4 flex items-center space-x-4">
              <button
                onClick={capturePhoto}
                className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm shadow-lg flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Snapshot</span>
              </button>
              <button
                onClick={() => {
                  const stream = videoRef.current?.srcObject as MediaStream;
                  if (stream) stream.getTracks().forEach((t) => t.stop());
                  setShowCamera(false);
                }}
                className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Drop Zone Area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !selectedImage && fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all duration-200 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[220px] cursor-pointer ${
            dragActive
              ? 'border-amber-400 bg-amber-500/10'
              : selectedImage
              ? 'border-slate-700 bg-slate-950/60'
              : 'border-slate-700/80 hover:border-amber-500/60 bg-slate-950/40'
          }`}
        >
          {/* Futuristic Corner Reticles */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500/80 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-500/80 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-500/80 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-500/80 pointer-events-none" />

          {selectedImage ? (
            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-slate-700 shadow-xl group">
              <img
                src={`data:${selectedMimeType};base64,${selectedImage}`}
                alt="Uploaded food"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="font-mono truncate max-w-[180px]">{filenameHint || 'custom_upload.jpg'}</span>
                <div className="flex items-center space-x-1.5">
                  {isEnhanced && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono">
                      ✨ Enhanced
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                    Ready to Trace
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                  setIsEnhanced(false);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-red-500/80 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400 mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="font-heading font-semibold text-slate-200 text-base">
                Drop your food photograph here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports JPG, PNG, WEBP (photos, reels screenshots, menu crops)
              </p>
            </div>
          )}
        </div>

        {/* Photo Enhancement Toolbar */}
        {selectedImage && (
          <div className="mt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={openAdjustmentForCurrent}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono border border-slate-700 hover:border-amber-500/40 transition flex items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEnhanced ? 'Adjust Filters (Active)' : 'Filter & Enhance Photo (Brightness, Contrast, Sharpness)'}</span>
            </button>
          </div>
        )}

        {/* Action Button: Trace This Food */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Verifies real OpenStreetMap businesses & physical addresses</span>
          </div>

          <button
            onClick={handleStartTrace}
            disabled={isTracing}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading font-bold text-sm tracking-wide transition flex items-center justify-center space-x-2.5 shadow-xl ${
              isTracing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/25 cursor-pointer transform hover:-translate-y-0.5'
            }`}
          >
            {isTracing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Agents Tracing Food...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Find This Food Near Me</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Image Filter Studio Modal */}
      {showAdjustmentStudio && selectedImage && (
        <ImageAdjustmentStudio
          originalImageBase64={selectedImage}
          mimeType={selectedMimeType}
          onApplyAdjustment={handleApplyAdjustment}
          onCancel={() => setShowAdjustmentStudio(false)}
        />
      )}
    </div>
  );
};
