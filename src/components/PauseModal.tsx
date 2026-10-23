import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { TranslationStrings } from '../i18n/languages';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  t: TranslationStrings;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
  t,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto select-none font-sans">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl font-extrabold text-white mb-1">{t.pauseTitle}</h2>
        <p className="text-xs text-rose-300/80 mb-6 font-medium">{t.pauseSubtitle}</p>

        <div className="w-full space-y-2.5 mb-6">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.resumeBtn}</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? t.soundOn : t.soundOff}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.restartBtn}</span>
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 border-t border-white/10 pt-3 w-full">
          <span>
            {t.controlsTitle}: <strong>{t.controlMove}</strong> · <strong>{t.controlSplit}</strong> · <strong>{t.controlEject}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
