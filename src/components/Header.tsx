import React from 'react';
import { Compass, ShieldCheck, Award, Terminal, Bookmark, User, Radio, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/trace';

interface HeaderProps {
  activeTab: 'home' | 'discover' | 'saved' | 'about';
  onTabChange: (tab: 'home' | 'discover' | 'saved' | 'about') => void;
  savedCount: number;
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onOpenRubric: () => void;
  onOpenSystemLogs: () => void;
  serverStatus: 'healthy' | 'checking' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  savedCount,
  currentUser,
  onOpenAuth,
  onOpenRubric,
  onOpenSystemLogs,
  serverStatus,
}) => {
  const isGuest = currentUser.provider === 'guest';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('home')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-[1px] shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-amber-400 animate-pulse-subtle" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                PANI<span className="text-amber-400">-PATH</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Launchpad 30
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
              From a food photo to a real place.
            </p>
          </div>
        </div>

        {/* 4 Main Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition ${
              activeTab === 'home'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onTabChange('discover')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'discover'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Discover</span>
          </button>

          <button
            onClick={() => onTabChange('saved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'saved'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'saved'
                    ? 'bg-slate-950 text-amber-400 font-bold'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('about')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition ${
              activeTab === 'about'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            About
          </button>
        </nav>

        {/* Status Indicators & Hackathon Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* User Auth Button */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition ${
              !isGuest
                ? 'bg-slate-900 border-amber-500/40 text-amber-300 hover:bg-slate-800'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="User Profile & Preferences"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline truncate max-w-[100px]">
              {isGuest ? 'Sign In' : currentUser.name}
            </span>
          </button>

          {/* System Telemetry Button */}
          <button
            onClick={onOpenSystemLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition text-xs font-mono"
            title="Inspect Agent Architecture & Live Pipeline"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>

          {/* Judging Rubric Button */}
          <button
            onClick={onOpenRubric}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 transition text-xs font-medium shadow-sm"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Rubric</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex border-t border-slate-800/80 px-4 py-2 bg-slate-950/95 justify-around text-xs font-mono">
        <button
          onClick={() => onTabChange('home')}
          className={`py-1 px-3 rounded-lg ${
            activeTab === 'home' ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-400'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onTabChange('discover')}
          className={`py-1 px-3 rounded-lg ${
            activeTab === 'discover' ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-400'
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => onTabChange('saved')}
          className={`py-1 px-3 rounded-lg ${
            activeTab === 'saved' ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-400'
          }`}
        >
          Saved {savedCount > 0 && `(${savedCount})`}
        </button>
        <button
          onClick={() => onTabChange('about')}
          className={`py-1 px-3 rounded-lg ${
            activeTab === 'about' ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-400'
          }`}
        >
          About
        </button>
      </div>
    </header>
  );
};
