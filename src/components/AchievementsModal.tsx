import React, { useState } from 'react';
import { Award, CheckCircle, Lock, X, Gift } from 'lucide-react';
import { profileStorage } from '../storage/profileStorage';
import { Achievement } from '../game/achievements';
import { AchievementBadgeSvg } from './BioSvgIcons';
import { TranslationStrings } from '../i18n/languages';

interface AchievementsModalProps {
  onClose: () => void;
  t: TranslationStrings;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose, t }) => {
  const [achievements] = useState<Achievement[]>(() => profileStorage.getAchievements());
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md pointer-events-auto select-none font-sans">
      <div className="w-full max-w-2xl max-h-[88vh] p-4 sm:p-7 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white">{t.achievementsModalTitle}</h2>
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
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 overflow-y-auto pr-1 flex-1">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all ${
                ach.unlocked
                  ? 'bg-white/[0.06] border-white/15'
                  : 'bg-black/40 border-white/5 opacity-60'
              }`}
            >
              {/* Badge Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md border"
                style={{
                  backgroundColor: ach.unlocked ? `${ach.badgeColor}25` : 'rgba(255,255,255,0.05)',
                  borderColor: ach.unlocked ? `${ach.badgeColor}50` : 'rgba(255,255,255,0.1)',
                }}
              >
                {ach.unlocked ? (
                  <AchievementBadgeSvg icon={ach.icon} size={24} />
                ) : (
                  <Lock className="w-5 h-5 text-neutral-500" />
                )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs sm:text-sm font-bold truncate ${ach.unlocked ? 'text-white' : 'text-neutral-400'}`}>
                    {ach.title}
                  </span>
                  {ach.unlocked && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                  {ach.description}
                </p>

                {/* Gifted reward info (Skins, Spores, Cytes) */}
                <div
                  className={`mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
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

                {ach.unlocked && ach.unlockedAt && (
                  <span className="text-[9px] text-neutral-500 font-mono mt-1">
                    {t.unlockedDateLabel} {new Date(ach.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
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
