import React, { useState } from 'react';
import { X, User, Lock, Mail, ShieldCheck, Check, Sparkles, LogOut } from 'lucide-react';
import { UserProfile } from '../types/trace';

interface AuthModalProps {
  currentUser: UserProfile;
  onLogin: (payload: {
    email: string;
    name?: string;
    provider?: 'google' | 'email';
    dietaryPreferences?: string[];
    favoriteRadiusKm?: number;
  }) => Promise<void>;
  onLogout: () => Promise<void>;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onClose,
}) => {
  const isGuest = currentUser.provider === 'guest';
  const [email, setEmail] = useState(isGuest ? '' : currentUser.email);
  const [name, setName] = useState(isGuest ? '' : currentUser.name);
  const [password, setPassword] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(
    currentUser.dietaryPreferences || ['Vegetarian']
  );
  const [favoriteRadiusKm, setFavoriteRadiusKm] = useState<number>(
    currentUser.favoriteRadiusKm || 5
  );
  const [isLoading, setIsLoading] = useState(false);

  const toggleDietary = (pref: string) => {
    if (dietaryPreferences.includes(pref)) {
      setDietaryPreferences(dietaryPreferences.filter((p) => p !== pref));
    } else {
      setDietaryPreferences([...dietaryPreferences, pref]);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await onLogin({
        email: 'aarav.patel@wcc.io',
        name: 'Aarav Patel',
        provider: 'google',
        dietaryPreferences,
        favoriteRadiusKm,
      });
      onClose();
    } catch (e: any) {
      alert(`Login failed: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await onLogin({
        email,
        name: name || email.split('@')[0],
        provider: 'email',
        dietaryPreferences,
        favoriteRadiusKm,
      });
      onClose();
    } catch (e: any) {
      alert(`Login failed: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAction = async () => {
    setIsLoading(true);
    try {
      await onLogout();
      onClose();
    } catch (e: any) {
      alert(`Logout error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              {isGuest ? 'Sign In to Pani-Path' : 'Your Food Explorer Profile'}
            </h3>
            <p className="text-xs text-slate-400">
              Save your food traces, bookmark verified places, and save food preferences.
            </p>
          </div>
        </div>

        {/* Active Session Info if already signed in */}
        {!isGuest && (
          <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center border border-amber-500/40">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogoutAction}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-xs border border-slate-700 transition flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* 1-Click Google OAuth simulation */}
        {isGuest && (
          <div className="space-y-4 mb-6">
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 font-medium text-xs text-slate-200 transition flex items-center justify-center space-x-2.5 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-2 text-[10px] uppercase font-mono text-slate-500 absolute">
                or with email
              </span>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs shadow-md transition"
              >
                Sign In / Register
              </button>
            </form>
          </div>
        )}

        {/* Dietary Preferences and Search Settings */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            Food Preferences:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {['Vegetarian', 'Vegan', 'Halal', 'Jain', 'Gluten-Free', 'Spicy Food Lover'].map((pref) => {
              const active = dietaryPreferences.includes(pref);
              return (
                <button
                  key={pref}
                  type="button"
                  onClick={() => toggleDietary(pref)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    active
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {active ? `✓ ${pref}` : `+ ${pref}`}
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Preferred Search Radius:</span>
            <div className="flex space-x-1">
              {[2, 5, 10, 20].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFavoriteRadiusKm(r)}
                  className={`px-2 py-0.5 rounded text-xs font-mono ${
                    favoriteRadiusKm === r
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trust disclaimer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
          Pani-Path stores only your trace history & preferences. No personal tracking.
        </div>
      </div>
    </div>
  );
};
