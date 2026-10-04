import React, { useState } from 'react';
import { X, Star, CheckCircle2, MessageSquare, Utensils, DollarSign, Calendar, ShieldCheck } from 'lucide-react';
import { VerifiedCandidate, UserReview } from '../types/trace';

interface ReviewModalProps {
  candidate: VerifiedCandidate;
  onClose: () => void;
  onSubmitReview: (payload: {
    candidateId: string;
    candidateName: string;
    rating: number;
    reviewText: string;
    exactDishFound: 'yes' | 'no' | 'seasonal';
    pricePaid?: string;
    visitDate?: string;
  }) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  candidate,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [exactDishFound, setExactDishFound] = useState<'yes' | 'no' | 'seasonal'>('yes');
  const [pricePaid, setPricePaid] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      alert('Please enter your review text.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmitReview({
        candidateId: candidate.id,
        candidateName: candidate.name,
        rating,
        reviewText,
        exactDishFound,
        pricePaid: pricePaid.trim() || undefined,
        visitDate,
      });
      onClose();
    } catch (err: any) {
      alert(`Review submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
              Community Food Trace Audit
            </span>
            <h3 className="font-heading font-bold text-lg text-white">
              Review: {candidate.name}
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">
              Overall Experience Rating:
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(rating)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-mono font-bold text-amber-400 text-sm">
                {rating} / 5
              </span>
            </div>
          </div>

          {/* Exact Dish Availability Check */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="text-xs font-mono text-slate-300 block">
              Did you find the exact dish from the photo here?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'yes', label: '✓ Yes, Exact Match' },
                { val: 'no', label: '✕ Not Available' },
                { val: 'seasonal', label: '~ Seasonal / Varied' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setExactDishFound(opt.val as any)}
                  className={`py-2 px-2 rounded-lg text-xs font-mono border text-center transition ${
                    exactDishFound === opt.val
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Paid & Visit Date */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-mono text-slate-400 block mb-1">
                Price Paid (Optional)
              </label>
              <input
                type="text"
                value={pricePaid}
                onChange={(e) => setPricePaid(e.target.value)}
                placeholder="e.g. ₹40 / $5.50"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div>
              <label className="font-mono text-slate-400 block mb-1">
                Date of Visit
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Review Description */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">
              Your Review & Taste Observations:
            </label>
            <textarea
              rows={3}
              required
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="How was the taste, crispiness, and preparation compared to the photo? Was it served fresh?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none font-sans"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real community audit</span>
            </span>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-heading font-bold text-xs shadow-md transition"
              >
                {isSubmitting ? 'Posting...' : 'Post Verified Review'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
