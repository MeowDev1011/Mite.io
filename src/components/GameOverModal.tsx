import React from 'react';
import { RotateCcw, Skull, Award, Clock, Heart, Sparkles, Swords, Droplets } from 'lucide-react';
import { GameStats } from '../game/types';
import { profileStorage, CytesRewardBreakdown } from '../storage/profileStorage';
import { CyteCoinSvg } from './BioSvgIcons';

interface GameOverModalProps {
  stats: GameStats | null;
  onRestart: () => void;
  rewardBreakdown?: CytesRewardBreakdown | null;
  onOpenShop?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart, rewardBreakdown, onOpenShop }) => {
  const profile = profileStorage.getProfile();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If breakdown not passed directly, fallback calculation
  const reward = rewardBreakdown || profileStorage.calculateGameReward(
    stats?.timeAliveSec || 0,
    stats?.peakMass || 18,
    stats?.redCellsEaten || 0,
    stats?.rivalsEaten || 0
  );

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto select-none">
      <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-neutral-900 border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.25)] flex flex-col items-center text-center">
        {/* Skull Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3 text-rose-400">
          <Skull className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">Célula Destruida</h2>
        <p className="text-xs sm:text-sm font-medium text-rose-300 mb-5">
          {stats?.causeOfDeath || 'Lisis celular en el torrente sanguíneo'}
        </p>

        {/* Cytes Reward Banner */}
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-rose-900/60 to-red-950/80 border border-rose-500/40 shadow-lg mb-4 flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-rose-300 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Recompensa de la Partida</span>
          </div>

          <div className="flex items-center gap-2.5 my-1">
            <CyteCoinSvg size={30} />
            <span className="text-3xl font-black text-white font-mono tabular-nums">
              +{reward.totalEarned}
            </span>
            <span className="text-sm font-bold text-rose-300 uppercase tracking-wider">Cytes</span>
          </div>

          {/* Reward Breakdown Line (0 emojis) */}
          <div className="flex items-center gap-3 text-[10px] text-neutral-300 font-mono mt-1 border-t border-white/10 pt-1.5 w-full justify-center">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400" /> +{reward.timeReward} tiempo</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" /> +{reward.massReward} masa</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-rose-400" /> +{reward.territoryReward} esporas</span>
          </div>

          <div className="text-[10px] text-rose-300/80 mt-1.5 font-medium">
            Saldo acumulado: <strong className="text-white font-mono">{profile.cytes} Cytes</strong>
          </div>
        </div>

        {/* Action button to spend Cytes immediately */}
        {onOpenShop && (
          <button
            onClick={onOpenShop}
            className="w-full py-2.5 mb-4 rounded-xl bg-red-950/70 hover:bg-red-900/90 border border-rose-500/40 text-rose-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(244,63,94,0.2)] cursor-pointer"
          >
            <CyteCoinSvg size={16} />
            <span>Canjear Cytes en el Mercado (Bacterias, Skins y Esporas)</span>
          </button>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-5 text-left text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium mb-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Masa Máxima</span>
            </div>
            <span className="text-xl font-black text-white font-mono tabular-nums">
              {stats?.peakMass || 18}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium mb-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Supervivencia</span>
            </div>
            <span className="text-xl font-black text-white font-mono tabular-nums">
              {stats ? formatTime(stats.timeAliveSec) : '0:00'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Glóbulos Rojos</span>
            </div>
            <span className="text-xl font-black text-white font-mono tabular-nums">
              {stats?.redCellsEaten || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium mb-1">
              <span className="text-yellow-400 font-bold">⚔️</span>
              <span>Microbios K.O.</span>
            </div>
            <span className="text-xl font-black text-white font-mono tabular-nums">
              {stats?.rivalsEaten || 0}
            </span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all transform active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Revivir en el Torrente</span>
        </button>
      </div>
    </div>
  );
};
