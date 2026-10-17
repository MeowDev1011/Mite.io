import React from 'react';
import { Award, X } from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../game/achievements';
import { AchievementBadgeSvg, CyteCoinSvg } from './BioSvgIcons';

interface AchievementToastProps {
  achievementId: string | null;
  onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievementId, onClose }) => {
  if (!achievementId) return null;

  const achievement = ACHIEVEMENTS_LIST.find((a) => a.id === achievementId);
  if (!achievement) return null;

  return (
    <div
      onClick={onClose}
      className="fixed top-4 right-4 z-50 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-neutral-950/90 border border-amber-400/60 shadow-[0_4px_24px_rgba(245,158,11,0.3)] backdrop-blur-md cursor-pointer transition-all hover:scale-105 pointer-events-auto max-w-sm animate-fade-in select-none"
    >
      {/* SVG Badge with biological glow (0 emojis) */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-inner"
        style={{
          backgroundColor: `${achievement.badgeColor}20`,
          borderColor: `${achievement.badgeColor}80`,
        }}
      >
        <AchievementBadgeSvg icon={achievement.icon} size={20} />
      </div>

      <div className="flex flex-col text-left pr-1">
        <div className="flex items-center gap-1">
          <Award className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] uppercase tracking-wider text-amber-300 font-extrabold">
            ¡Logro Desbloqueado!
          </span>
        </div>
        <span className="text-xs font-black text-white leading-tight">
          {achievement.title}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <CyteCoinSvg size={12} />
          <span className="text-[10px] text-emerald-400 font-semibold truncate">
            {achievement.rewardText}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        aria-label="Cerrar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
