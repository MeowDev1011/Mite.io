import React from 'react';
import { Dna, Sparkles } from 'lucide-react';
import { Mutation, MutationId } from '../game/types';
import { MUTATION_DEFINITIONS } from '../game/constants';
import { TranslationStrings } from '../i18n/languages';

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
  // Available mutations not yet unlocked
  const available = MUTATION_DEFINITIONS.filter((m) => !currentMutations.has(m.id));
  const options = available.slice(0, 3);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto select-none font-sans">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-neutral-900 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3 text-emerald-400">
          <Dna className="w-6 h-6 animate-pulse" />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.massMilestoneReached} {milestone}</span>
        </div>

        <h2 className="text-2xl font-black text-white mb-2">{t.cellularEvolutionTitle}</h2>
        <p className="text-xs text-neutral-300 max-w-sm mb-6">
          {t.cellularEvolutionDesc}
        </p>

        {/* Mutation Choices */}
        <div className="grid grid-cols-1 gap-3 w-full mb-6">
          {options.map((mut: Mutation) => (
            <button
              key={mut.id}
              onClick={() => onSelectMutation(mut.id)}
              className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.06] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-left transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="text-2xl p-2 rounded-xl bg-white/10 group-hover:bg-emerald-500/20 shrink-0">
                {mut.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {mut.name}
                </span>
                <span className="text-xs text-neutral-400 leading-relaxed mt-0.5">
                  {mut.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onDismiss}
          className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {t.skipForNowBtn}
        </button>
      </div>
    </div>
  );
};
