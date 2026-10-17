import React, { useState } from 'react';
import { Volume2, VolumeX, Play, ShieldAlert, Zap, Dna, BookOpen, Award, Palette, Globe, Smartphone, Monitor, Tablet } from 'lucide-react';
import { SUPPORTED_LANGUAGES, TranslationStrings } from '../i18n/languages';
import { profileStorage } from '../storage/profileStorage';

interface TitleScreenProps {
  onStartGame: (name: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentLang: string;
  onSelectLanguage: (lang: string) => void;
  t: TranslationStrings;
  onOpenTutorial: () => void;
  onOpenAchievements: () => void;
  onOpenSkins: () => void;
  onOpenShop: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
  currentLang,
  onSelectLanguage,
  t,
  onOpenTutorial,
  onOpenAchievements,
  onOpenSkins,
  onOpenShop,
}) => {
  const [profile, setProfile] = useState(() => profileStorage.getProfile());
  const [playerName, setPlayerName] = useState(profile.name || 'Mite-Alfa');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileStorage.setPlayerName(playerName);
    onStartGame(playerName);
  };

  const getDeviceIcon = () => {
    if (profile.deviceType === 'Móvil') return <Smartphone className="w-3.5 h-3.5 text-cyan-400" />;
    if (profile.deviceType === 'Tablet') return <Tablet className="w-3.5 h-3.5 text-cyan-400" />;
    return <Monitor className="w-3.5 h-3.5 text-cyan-400" />;
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-4 sm:p-8 pointer-events-auto select-none bg-gradient-to-b from-black/60 via-transparent to-black/90 overflow-y-auto">
      {/* Top Bar Zone: Language dropdown, device tag, and Audio toggle */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-2 flex-wrap">
        {/* Device & Biosphere Info */}
        <div className="flex items-center gap-2.5 text-xs font-semibold text-rose-300/80 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="hidden sm:inline">{t.bioZone}</span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1 text-cyan-300">
            {getDeviceIcon()}
            <span>{profile.deviceType}</span>
          </span>
        </div>

        {/* Right header controls: Cytes Balance, Languages & Sound */}
        <div className="flex items-center gap-2">
          {/* Cytes Red Blood Cell Balance Pill */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/70 hover:bg-red-900/80 border border-red-500/40 text-rose-200 transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_12px_rgba(239,68,68,0.25)]"
            title="Abrir Tienda de Cytes"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-red-800 via-red-500 to-red-400 border border-rose-300 shadow-sm flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-red-950/70" />
            </div>
            <span className="text-xs sm:text-sm font-black text-white font-mono tabular-nums">
              {profile.cytes}
            </span>
            <span className="text-[10px] uppercase font-bold text-rose-300">Cytes</span>
          </button>

          {/* 35 Languages Selector */}
          <div className="relative flex items-center bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-2.5 py-1 text-xs text-white backdrop-blur-sm">
            <Globe className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
            <select
              value={currentLang}
              onChange={(e) => onSelectLanguage(e.target.value)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer pr-1"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors backdrop-blur-sm cursor-pointer"
            title={t.soundOn}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden md:inline">{isMuted ? t.soundOff : t.soundOn}</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Title Lockup with Bespoke SVG */}
      <div className="flex flex-col items-center text-center max-w-2xl px-4 my-auto py-4">
        {/* Bespoke Biological Title Lockup SVG */}
        <div className="flex items-center justify-center mb-2">
          <svg className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.6" />
            <path
              d="M50 16 C68 16, 84 32, 84 50 C84 68, 68 84, 50 84 C32 84, 16 68, 16 50 C16 32, 32 16, 50 16 Z"
              fill="url(#microbeGrad)"
              stroke="#34d399"
              strokeWidth="3"
            />
            <circle cx="50" cy="46" r="14" fill="#10b981" />
            <circle cx="47" cy="43" r="5" fill="#ffffff" opacity="0.75" />
            <path d="M42 82 Q38 94 30 96" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M50 84 Q50 97 54 99" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M58 82 Q62 94 70 96" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />

            <defs>
              <linearGradient id="microbeGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#064e3b" />
                <stop offset="0.6" stopColor="#059669" />
                <stop offset="1" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-1.5 font-sans">
          Mite<span className="text-emerald-400">.io</span>
        </h1>
        <p className="text-xs sm:text-sm text-rose-200/90 font-medium max-w-lg mb-5 leading-relaxed">
          {t.subtitle}
        </p>

        {/* Core Rules Triad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full mb-5 text-left text-xs">
          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{t.massDilemma}</span>
            </div>
            <p className="text-neutral-300 leading-snug">{t.massDilemmaDesc}</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
              <Dna className="w-3.5 h-3.5" />
              <span>{t.sporeFission}</span>
            </div>
            <p className="text-neutral-300 leading-snug">{t.sporeFissionDesc}</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t.antibodies}</span>
            </div>
            <p className="text-neutral-300 leading-snug">{t.antibodiesDesc}</p>
          </div>
        </div>

        {/* Hub Action Buttons: Shop, Tutorial, Achievements, Skins */}
        <div className="flex items-center justify-center gap-2 mb-5 w-full flex-wrap">
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.25)]"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-red-300" />
            <span>{t.shopBtn}</span>
          </button>

          <button
            onClick={onOpenTutorial}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.tutorialBtn}</span>
          </button>

          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{t.achievementsBtn}</span>
          </button>

          <button
            onClick={onOpenSkins}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{t.skinsBtn}</span>
          </button>
        </div>

        {/* Name Input & Play Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-md">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={16}
            placeholder={t.inputPlaceholder}
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium text-center sm:text-left transition-all"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.invadeBtn}</span>
          </button>
        </form>
      </div>

      {/* Flat Control Hints Bar */}
      <div className="text-xs text-neutral-400 font-medium tracking-wide flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2 border-t border-white/10 w-full max-w-3xl text-center">
        <span><strong className="text-neutral-200">{t.controlMove}</strong></span>
        <span>·</span>
        <span><strong className="text-neutral-200">{t.controlSplit}</strong></span>
        <span>·</span>
        <span><strong className="text-neutral-200">{t.controlEject}</strong></span>
        <span>·</span>
        <span><strong className="text-neutral-200">{t.controlPause}</strong></span>
      </div>
    </div>
  );
};
