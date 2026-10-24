import React, { useState, useMemo } from 'react';
import { Award, CheckCircle, Lock, X, Gift, Flame, Sparkles, Shield, Zap } from 'lucide-react';
import { profileStorage } from '../storage/profileStorage';
import { Achievement, AchievementDifficulty } from '../game/achievements';
import { AchievementBadgeSvg } from './BioSvgIcons';
import { TranslationStrings } from '../i18n/languages';

interface AchievementsModalProps {
  onClose: () => void;
  t: TranslationStrings;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose, t }) => {
  const [achievements] = useState<Achievement[]>(() => profileStorage.getAchievements());
  const [selectedTier, setSelectedTier] = useState<'all' | AchievementDifficulty>('all');

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const filteredAchievements = useMemo(() => {
    if (selectedTier === 'all') return achievements;
    return achievements.filter((a) => a.difficulty === selectedTier);
  }, [achievements, selectedTier]);

  const counts = useMemo(() => {
    const countTier = (tier: AchievementDifficulty) => {
      const all = achievements.filter((a) => a.difficulty === tier);
      const unl = all.filter((a) => a.unlocked).length;
      return { total: all.length, unlocked: unl };
    };
    return {
      easy: countTier('easy'),
      normal: countTier('normal'),
      hard: countTier('hard'),
      super_hard: countTier('super_hard'),
    };
  }, [achievements]);

  const getDifficultyBadge = (difficulty: AchievementDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return {
          label: 'FÁCIL',
          className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'normal':
        return {
          label: 'NORMAL',
          className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
      case 'hard':
        return {
          label: 'DIFÍCIL',
          className: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'super_hard':
        return {
          label: 'SÚPER DIFÍCIL',
          className: 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md pointer-events-auto select-none font-sans">
      <div className="w-full max-w-3xl max-h-[90vh] p-4 sm:p-6 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black text-white truncate">{t.achievementsModalTitle}</h2>
              <p className="text-xs text-neutral-400">
                {t.achievementsProgress}{' '}
                <span className="font-bold text-amber-400 font-mono tabular-nums">
                  {unlockedCount} / {achievements.length}
                </span>{' '}
                {t.unlockedPlural}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Tier Filter Tabs (20 Easy, 40 Normal, 30 Hard, 10 Super Hard = 100 Total) */}
        <div className="flex items-center gap-1.5 pt-3 pb-2 overflow-x-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedTier('all')}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
              selectedTier === 'all'
                ? 'bg-white text-neutral-950 border-white shadow-sm'
                : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
            }`}
          >
            Todos ({unlockedCount}/100)
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier('easy')}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 ${
              selectedTier === 'easy'
                ? 'bg-emerald-500 text-neutral-950 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Fáciles ({counts.easy.unlocked}/{counts.easy.total})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier('normal')}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 ${
              selectedTier === 'normal'
                ? 'bg-cyan-500 text-neutral-950 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30 hover:bg-cyan-900/50'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Normales ({counts.normal.unlocked}/{counts.normal.total})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier('hard')}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 ${
              selectedTier === 'hard'
                ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/50'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Difíciles ({counts.hard.unlocked}/{counts.hard.total})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTier('super_hard')}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 ${
              selectedTier === 'super_hard'
                ? 'bg-rose-500 text-white border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/50'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Súper Difíciles ({counts.super_hard.unlocked}/{counts.super_hard.total})</span>
          </button>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-3 overflow-y-auto pr-1 flex-1">
          {filteredAchievements.map((ach) => {
            const diffBadge = getDifficultyBadge(ach.difficulty);
            return (
              <div
                key={ach.id}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                  ach.unlocked
                    ? 'bg-white/[0.07] border-white/20 shadow-md'
                    : 'bg-black/45 border-white/5 opacity-70'
                }`}
              >
                {/* Badge Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md border"
                  style={{
                    backgroundColor: ach.unlocked ? `${ach.badgeColor}25` : 'rgba(255,255,255,0.04)',
                    borderColor: ach.unlocked ? `${ach.badgeColor}60` : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {ach.unlocked ? (
                    <AchievementBadgeSvg icon={ach.icon} size={22} />
                  ) : (
                    <Lock className="w-4 h-4 text-neutral-500" />
                  )}
                </div>

                {/* Text Info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-black font-mono border ${diffBadge.className}`}>
                      #{ach.number} · {diffBadge.label}
                    </span>
                    {ach.unlocked && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>

                  <span className={`text-xs sm:text-sm font-bold truncate ${ach.unlocked ? 'text-white' : 'text-neutral-300'}`}>
                    {ach.title}
                  </span>

                  <p className="text-[10.5px] text-neutral-400 leading-snug mt-0.5">
                    {ach.description}
                  </p>

                  {/* Gifted reward info (Skins, Spores, Cytes) */}
                  <div
                    className={`mt-1.5 flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9.5px] font-bold ${
                      ach.unlocked
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/5 text-amber-300/80 border border-white/5'
                    }`}
                  >
                    {ach.unlocked ? (
                      <Gift className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                    )}
                    <span>{ach.unlocked ? t.rewardGiftedLabel : t.rewardLockedLabel}</span>
                    <span className="truncate">{ach.rewardText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
