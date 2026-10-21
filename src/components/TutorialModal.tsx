import React, { useState } from 'react';
import { Sparkles, Dna, ShieldAlert, Heart, Zap, ChevronRight, ChevronLeft, Check, RefreshCw } from 'lucide-react';
import { TranslationStrings } from '../i18n/languages';

interface TutorialModalProps {
  t: TranslationStrings;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ t, onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: t.tutorialStep1Title,
      desc: t.tutorialStep1Desc,
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      color: '#f59e0b',
      visual: (
        <div className="relative w-48 h-32 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
          {/* Animated small cell seeking protein dots */}
          <div className="absolute w-6 h-6 rounded-full bg-emerald-500 animate-pulse border border-white flex items-center justify-center text-[8px] font-bold text-black">
            Mite
          </div>
          <div className="absolute w-2 h-2 rounded-full bg-cyan-400 top-6 left-8 animate-ping" />
          <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 bottom-8 right-12 animate-ping" />
          <div className="absolute w-2 h-2 rounded-full bg-rose-400 top-12 right-8 animate-ping" />
          <div className="absolute text-[10px] text-neutral-400 bottom-2 font-mono">Nutrientes +1 a +3</div>
        </div>
      ),
    },
    {
      title: t.tutorialStep2Title,
      desc: t.tutorialStep2Desc,
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      color: '#ef4444',
      visual: (
        <div className="relative w-48 h-32 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
          {/* Red blood cell disk */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-700 via-red-500 to-red-800 border-2 border-red-400 shadow-[0_0_15px_#ef4444] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-red-900/60" />
          </div>
          <div className="absolute text-[10px] text-rose-300 bottom-2 font-mono">Eritrocito (+18 a +32 Masa)</div>
        </div>
      ),
    },
    {
      title: t.tutorialStep3Title,
      desc: t.tutorialStep3Desc,
      icon: <Dna className="w-8 h-8 text-emerald-400" />,
      color: '#10b981',
      visual: (
        <div className="relative w-56 h-32 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
          {/* Split cells with connecting mitosis spindle and countdown ring */}
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded-full bg-emerald-600 border border-emerald-300 flex items-center justify-center text-[9px] font-bold text-white shadow-md">
              50%
              <div className="absolute -top-4 text-[9px] font-mono text-emerald-300 flex items-center gap-0.5">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>12s</span>
              </div>
            </div>
            {/* Connecting spindle filament */}
            <div className="w-10 h-0.5 bg-emerald-400/80 dashed animate-pulse" />
            <div className="relative w-10 h-10 rounded-full bg-emerald-500 border border-emerald-200 flex items-center justify-center text-[9px] font-bold text-neutral-950 shadow-[0_0_10px_#34d399] translate-x-2">
              50%
              <div className="absolute -bottom-4 text-[9px] font-mono text-cyan-300">¡IMPULSO!</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t.tutorialStep4Title,
      desc: t.tutorialStep4Desc,
      icon: <ShieldAlert className="w-8 h-8 text-rose-400" />,
      color: '#f43f5e',
      visual: (
        <div className="relative w-48 h-32 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
          {/* Spiked antibody with alarm */}
          <div className="relative w-14 h-14 rounded-full bg-slate-800 border-2 border-rose-500 shadow-[0_0_20px_#ef4444] flex items-center justify-center animate-spin-slow">
            <div className="w-4 h-4 rounded-full bg-red-600 animate-ping" />
            <div className="absolute -top-2 w-2 h-4 bg-red-500 rounded" />
            <div className="absolute -bottom-2 w-2 h-4 bg-red-500 rounded" />
            <div className="absolute -left-2 w-4 h-2 bg-red-500 rounded" />
            <div className="absolute -right-2 w-4 h-2 bg-red-500 rounded" />
          </div>
          <div className="absolute text-[10px] text-rose-400 bottom-1.5 font-mono">Caza si Masa &gt; 160</div>
        </div>
      ),
    },
    {
      title: t.tutorialStep5Title,
      desc: t.tutorialStep5Desc,
      icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
      color: '#06b6d4',
      visual: (
        <div className="relative w-48 h-32 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-cyan-600/30 border border-cyan-400 shadow-[0_0_25px_#06b6d4] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
          </div>
          <div className="absolute text-[10px] text-cyan-300 bottom-2 font-mono">Nódulo Linfático Oculto</div>
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto select-none">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl flex flex-col items-center text-center">
        {/* Step dots */}
        <div className="flex items-center gap-1.5 mb-5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === step ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Visual Showcase Card */}
        <div className="mb-4">{current.visual}</div>

        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{current.title}</h3>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6 max-w-md">
          {current.desc}
        </p>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between w-full gap-3 pt-3 border-t border-white/10">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              step === 0 ? 'text-neutral-600 cursor-not-allowed' : 'text-neutral-300 hover:text-white bg-white/5'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.tutorialPrev}</span>
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>{t.tutorialNext}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t.tutorialGotIt}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
