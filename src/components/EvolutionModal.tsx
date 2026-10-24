import React from 'react';
import { Dna, X } from 'lucide-react';
import { Mutation, MutationId } from '../game/types';
import { MUTATION_DEFINITIONS } from '../game/constants';
import { TranslationStrings } from '../i18n/languages';
import { AchievementBadgeSvg } from './BioSvgIcons';

interface EvolutionModalProps {
  milestone: number;
  currentMutations: Set<MutationId>;
  onSelectMutation: (id: MutationId) => void;
  onDismiss: () => void;
  t: TranslationStrings;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  milestone,
  currentMutations,
  onSelectMutation,
  onDismiss,
  t,
}) => {
  const available = MUTATION_DEFINITIONS.filter((m) => !currentMutations.has(m.id));
  const options = available.slice(0, 3);

  if (options.length === 0) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92vw] max-w-md pointer-events-none select-none font-sans animate-fade-in">
      <div className="p-2.5 sm:p-3 rounded-2xl bg-neutral-950/90 border border-emerald-500/50 shadow-[0_4px_24px_rgba(16,185,129,0.3)] backdrop-blur-md pointer-events-auto">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Dna className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider truncate">
              {t.cellularEvolutionTitle} ({milestone})
            </span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title={t.skipForNowBtn}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact Horizontal Mutation Choices (Renders Vector SVG Icon instead of raw icon ID text) */}
        <div className="grid grid-cols-3 gap-1.5">
          {options.map((mut: Mutation) => (
            <button
              key={mut.id}
              type="button"
              onClick={() => onSelectMutation(mut.id)}
              className="group flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.06] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/50 transition-all active:scale-95 cursor-pointer min-w-0"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-1 shrink-0">
                <AchievementBadgeSvg icon={mut.icon} size={18} />
              </div>
              <span className="text-[9.5px] sm:text-[10.5px] font-black text-white group-hover:text-emerald-300 truncate w-full">
                {mut.name}
              </span>
              <span className="text-[8px] sm:text-[9px] text-neutral-400 line-clamp-1 w-full">
                {mut.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

