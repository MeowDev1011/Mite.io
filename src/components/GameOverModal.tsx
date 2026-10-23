import React from 'react';
import { RotateCcw, Skull, Award, Clock, Heart, Sparkles, Swords, Droplets, Home, Share2 } from 'lucide-react';
import { GameStats } from '../game/types';
import { profileStorage, CytesRewardBreakdown } from '../storage/profileStorage';
import { CyteCoinSvg } from './BioSvgIcons';
import { TranslationStrings, getTranslations } from '../i18n/languages';

interface GameOverModalProps {
  stats: GameStats | null;
  onRestart: () => void;
  onReturnToHome: () => void;
  t?: TranslationStrings;
  rewardBreakdown?: CytesRewardBreakdown | null;
  onOpenShop?: () => void;
  onOpenShare?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onReturnToHome,
  t: propT,
  rewardBreakdown,
  onOpenShop,
  onOpenShare,
}) => {
  const t = propT || getTranslations('es');
  const profile = profileStorage.getProfile();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If breakdown not passed directly, fallback calculation
  const reward =
    rewardBreakdown ||
    profileStorage.calculateGameReward(
      stats?.timeAliveSec || 0,
      stats?.peakMass || 18,
      stats?.redCellsEaten || 0,
      stats?.rivalsEaten || 0
    );

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto select-none animate-fade-in">
      <div className="w-full max-w-md p-5 sm:p-7 rounded-3xl bg-neutral-900 border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.3)] flex flex-col items-center text-center">
        {/* Skull Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-2.5 text-rose-400">
          <Skull className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
          {t.gameOverTitle}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-rose-300 mb-4">
          {stats?.causeOfDeath || t.gameOverTitle}
        </p>

        {/* Cytes Reward Banner */}
        <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-rose-900/60 to-red-950/80 border border-rose-500/40 shadow-lg mb-3 flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-rose-300 font-bold mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.cytesEarned}</span>
          </div>

          <div className="flex items-center gap-2.5 my-1">
            <CyteCoinSvg size={28} />
            <span className="text-3xl font-black text-white font-mono tabular-nums leading-none">
              +{reward.totalEarned}
            </span>
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">{t.cytes}</span>
          </div>

          {/* Reward Breakdown Line */}
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] text-neutral-300 font-mono mt-1 border-t border-white/10 pt-1.5 w-full justify-center flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> +{reward.timeReward} {t.survivalTime.toLowerCase()}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> +{reward.massReward} {t.cellularMass.toLowerCase()}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-rose-400" /> +{reward.territoryReward} {t.cells}
            </span>
          </div>

          <div className="text-[10px] text-rose-300/80 mt-1.5 font-medium">
            {t.cytes}: <strong className="text-white font-mono">{profile.cytes} {t.cytes}</strong>
          </div>
        </div>

        {/* Action button to spend Cytes immediately */}
        {onOpenShop && (
          <button
            onClick={onOpenShop}
            className="w-full py-2 mb-3 rounded-xl bg-red-950/70 hover:bg-red-900/90 border border-rose-500/40 text-rose-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(244,63,94,0.2)] cursor-pointer"
          >
            <CyteCoinSvg size={14} />
            <span>{t.shopTitle} ({t.bacteriaTab}, {t.skinsBtn})</span>
          </button>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 w-full mb-4 text-left text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium mb-0.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.peakMass}</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-white font-mono tabular-nums">
              {stats?.peakMass || 18}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium mb-0.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.survivalTime}</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-white font-mono tabular-nums">
              {stats ? formatTime(stats.timeAliveSec) : '0:00'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium mb-0.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.erythrocytes}</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-white font-mono tabular-nums">
              {stats?.redCellsEaten || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium mb-0.5">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.knockouts}</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-white font-mono tabular-nums">
              {stats?.rivalsEaten || 0}
            </span>
          </div>
        </div>

        {/* Action Buttons: Revivir, Regresar al Inicio, Compartir */}
        <div className="w-full space-y-2">
          {/* Primary: Revivir */}
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.reviveBtn}</span>
          </button>

          {/* Secondary Row: Regresar al Inicio & Compartir */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={onReturnToHome}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-white/30 active:scale-95"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              <span className="truncate">{t.backToHome}</span>
            </button>

            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-rose-500/50 active:scale-95"
              >
                <Share2 className="w-4 h-4 text-rose-400" />
                <span className="truncate">{t.shareBtn}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
