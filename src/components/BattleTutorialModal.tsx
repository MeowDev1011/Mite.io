import React, { useState } from 'react';
import { Swords, Shield, Skull, HeartPulse, Flame, Droplets, Thermometer, Check, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { TranslationStrings } from '../i18n/languages';

interface BattleTutorialModalProps {
  onClose: () => void;
  t: TranslationStrings;
}

export const BattleTutorialModal: React.FC<BattleTutorialModalProps> = ({ onClose, t }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: t.battleStep1Title,
      desc: t.battleStep1Desc,
      icon: <Swords className="w-8 h-8 text-rose-400" />,
      badge: t.factionsConflictBadge,
      badgeColor: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      illustration: (
        <div className="grid grid-cols-2 gap-3 w-full py-2">
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 mb-1.5">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-cyan-200 uppercase">{t.factionImmuneTitle}</span>
            <span className="text-[10px] text-cyan-300/80 mt-1">
              {t.immuneFactionTutorial}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-400/40 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300 mb-1.5">
              <Skull className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-rose-200 uppercase">{t.factionPathogenTitle}</span>
            <span className="text-[10px] text-rose-300/80 mt-1">
              {t.pathogenFactionTutorial}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: t.battleStep2Title,
      desc: t.battleHostModalDesc,
      icon: <HeartPulse className="w-8 h-8 text-amber-400" />,
      badge: t.hostBiometricsBadge,
      badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      illustration: (
        <div className="w-full p-3 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
            <span className="flex items-center gap-1.5 text-rose-300">
              <HeartPulse className="w-3.5 h-3.5" /> {t.hostHealthLabel}
            </span>
            <span className="font-mono text-emerald-400">100% → 0%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 w-3/4 rounded-full" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 text-amber-300">
              <Thermometer className="w-3 h-3" />
              <span>37.0°C - 41.2°C</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 text-cyan-300">
              <Droplets className="w-3 h-3" />
              <span>{t.hostHydrationLabel}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 text-yellow-300">
              <Flame className="w-3 h-3" />
              <span>{t.hostEnergyLabel}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t.battleStep3Title,
      desc: t.battlePusModalDesc,
      icon: <Droplets className="w-8 h-8 text-lime-400" />,
      badge: t.pusPustules,
      badgeColor: 'border-lime-500/40 bg-lime-500/10 text-lime-300',
      illustration: (
        <div className="p-4 rounded-2xl bg-neutral-900 border border-lime-500/30 flex items-center justify-around gap-2">
          {/* Animated Pus Bubble SVG */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-lime-500/20 border-2 border-lime-400 flex items-center justify-center shadow-[0_0_20px_rgba(163,230,53,0.5)] animate-bounce">
              <div className="w-6 h-6 rounded-full bg-yellow-400/80 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-lime-300 mt-1.5">{t.pusTitle}</span>
          </div>

          <div className="text-left text-xs space-y-1.5 max-w-[200px]">
            <div className="flex items-center gap-1 text-rose-300 font-bold text-[11px]">
              <span>{t.pusPathogenEffect}</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-300 font-bold text-[11px]">
              <span>{t.pusImmuneEffect}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t.battleStep4Title,
      desc: t.battleStep4Desc,
      icon: <Sparkles className="w-8 h-8 text-amber-400" />,
      badge: t.battleWinConditionTitle,
      badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      illustration: (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-rose-950/40 border border-white/10 text-center">
          <p className="text-xs text-neutral-200 leading-relaxed">
            {t.battleWinConditionDesc}
          </p>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md pointer-events-auto select-none animate-fade-in">
      <div className="relative w-full max-w-lg p-5 sm:p-7 rounded-3xl bg-neutral-950/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Glowing top line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">{t.battleTutorialTitle}</h3>
              <p className="text-xs text-neutral-400">{t.battleTacticalGuide}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-4 text-center">
          {/* Badge & Icon */}
          <div className="flex flex-col items-center">
            <span className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider mb-3 ${step.badgeColor}`}>
              {step.badge}
            </span>
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
              {step.icon}
            </div>
          </div>

          <h4 className="text-base sm:text-lg font-black text-white">{step.title}</h4>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto">
            {step.desc}
          </p>

          {/* Visual Illustration */}
          <div className="pt-2">{step.illustration}</div>
        </div>

        {/* Stepper Dots & Navigation Buttons */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx ? 'w-6 bg-cyan-400' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.tutorialPrev}</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md transition-all cursor-pointer"
              >
                <span>{t.tutorialNext}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{t.tutorialGotIt}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
