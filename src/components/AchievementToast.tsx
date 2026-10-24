import React from 'react';
import { Award, X } from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../game/achievements';
import { AchievementBadgeSvg, CyteCoinSvg } from './BioSvgIcons';
import { TranslationStrings } from '../i18n/languages';

interface AchievementToastProps {
  achievementId: string | null;
  onClose: () => void;
  t: TranslationStrings;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievementId, onClose, t }) => {
  if (!achievementId) return null;

  const achievement = ACHIEVEMENTS_LIST.find((a) => a.id === achievementId);
  if (!achievement) return null;

  return (
    <div
      className="fixed top-2 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-neutral-950/88 border border-amber-400/50 shadow-[0_2px_14px_rgba(245,158,11,0.25)] backdrop-blur-md pointer-events-none max-w-[250px] sm:max-w-[290px] animate-fade-in select-none"
    >
      {/* Compact SVG Badge */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border"
        style={{
          backgroundColor: `${achievement.badgeColor}25`,
          borderColor: `${achievement.badgeColor}80`,
        }}
      >
        <AchievementBadgeSvg icon={achievement.icon} size={13} />
      </div>

      <div className="flex flex-col text-left min-w-0 flex-1 leading-tight">
        <div className="flex items-center gap-1">
          <Award className="w-2.5 h-2.5 text-amber-400 shrink-0" />
          <span className="text-[8px] uppercase tracking-wider text-amber-300 font-black truncate">
            #{achievement.number} · {t.achievementUnlockedLabel}
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-black text-white truncate">
          {achievement.title}
        </span>
        <div className="flex items-center gap-1">
          <CyteCoinSvg size={9} />
          <span className="text-[8.5px] text-emerald-400 font-bold truncate">
            {achievement.rewardText}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-neutral-400 hover:text-white p-0.5 rounded-full transition-colors cursor-pointer pointer-events-auto shrink-0"
        aria-label="Cerrar"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
