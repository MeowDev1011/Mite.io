import React, { useState } from 'react';
import { X, Sparkles, Check, ChevronUp, Magnet, Zap, Shield, Flame, Droplets, Info } from 'lucide-react';
import { profileStorage, PlayerProfile, UPGRADE_MAX_LEVEL, getUpgradeCost, getTotalUpgradeCost } from '../storage/profileStorage';
import { PlayerUpgrades } from '../game/types';
import { TranslationStrings } from '../i18n/languages';
import { CyteCoinSvg } from './BioSvgIcons';
import { soundEngine } from '../audio/soundEngine';

interface HomeUpgradesModalProps {
  onClose: () => void;
  t: TranslationStrings;
  onUpgraded?: () => void;
}

export const HomeUpgradesModal: React.FC<HomeUpgradesModalProps> = ({ onClose, t, onUpgraded }) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => profileStorage.getProfile());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number | 'max'>(1);

  const handleUpgrade = (stat: keyof PlayerUpgrades, requestedAmount?: number | 'max') => {
    const currentLvl = (profile.upgrades && profile.upgrades[stat]) || 0;
    if (currentLvl >= UPGRADE_MAX_LEVEL) {
      setFeedbackMsg(t.upgradeMaxReached);
      setTimeout(() => setFeedbackMsg(null), 2500);
      return;
    }

    let countToBuy = 1;
    const mult = requestedAmount !== undefined ? requestedAmount : selectedMultiplier;
    if (mult === 'max') {
      countToBuy = profileStorage.getMaxAffordableCount(stat);
    } else {
      countToBuy = mult;
    }

    const res = profileStorage.upgradeStat(stat, countToBuy);
    if (res.success) {
      setProfile(profileStorage.getProfile());
      soundEngine.playLevelUp();
      if (onUpgraded) onUpgraded();
      setFeedbackMsg(`¡${res.actualCount || 1} nivel(es) mejorado(s)! Nivel actual: ${res.newLevel} / 1500`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg(res.error || t.insufficientCytes);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const UPGRADES: {
    key: keyof PlayerUpgrades;
    name: string;
    desc: string;
    color: string;
    borderColor: string;
    bgGrad: string;
    icon: React.ReactNode;
    svgGraphic: React.ReactNode;
    getEffect: (lvl: number) => string;
  }[] = [
    {
      key: 'sporesFission',
      name: t.statSporesFissionTitle,
      desc: t.statSporesFissionDesc,
      color: '#a855f7',
      borderColor: 'border-purple-500/40',
      bgGrad: 'from-purple-950/40 via-neutral-900 to-purple-950/30',
      icon: <Droplets className="w-5 h-5 text-purple-400" />,
      svgGraphic: (
        <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
          <circle cx="28" cy="28" r="24" fill="#581c87" fillOpacity="0.4" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="21" cy="28" r="10" fill="#a855f7" />
          <circle cx="35" cy="28" r="8" fill="#c084fc" />
          <circle cx="28" cy="16" r="3.5" fill="#e9d5ff" />
          <circle cx="43" cy="35" r="3" fill="#e9d5ff" />
          <line x1="28" y1="20" x2="28" y2="36" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      ),
      getEffect: (lvl) => (lvl === 0 ? 'Fisión base' : `+${(Math.log10(1 + lvl) * 45).toFixed(0)}% Alcance de Esporas & Mitosis`),
    },
    {
      key: 'speed',
      name: t.statSpeedTitle,
      desc: t.statSpeedDesc,
      color: '#eab308',
      borderColor: 'border-amber-500/40',
      bgGrad: 'from-amber-950/40 via-neutral-900 to-amber-950/30',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      svgGraphic: (
        <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]">
          <circle cx="28" cy="28" r="24" fill="#713f12" fillOpacity="0.4" stroke="#eab308" strokeWidth="2" />
          <path d="M28 12 L38 28 L28 28 L32 44 L18 26 L26 26 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          <path d="M12 28 Q18 36 24 38" stroke="#fef08a" strokeWidth="2" fill="none" strokeDasharray="2 2" />
        </svg>
      ),
      getEffect: (lvl) => (lvl === 0 ? 'Velocidad base' : `+${(Math.log10(1 + lvl) * 48).toFixed(0)}% Aceleración en Plasma`),
    },
    {
      key: 'attraction',
      name: t.statAttractionTitle,
      desc: t.statAttractionDesc,
      color: '#06b6d4',
      borderColor: 'border-cyan-500/40',
      bgGrad: 'from-cyan-950/40 via-neutral-900 to-cyan-950/30',
      icon: <Magnet className="w-5 h-5 text-cyan-400" />,
      svgGraphic: (
        <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          <circle cx="28" cy="28" r="24" fill="#164e63" fillOpacity="0.4" stroke="#06b6d4" strokeWidth="2" />
          {/* Magnet horseshoe */}
          <path d="M18 16 V28 A10 10 0 0 0 38 28 V16" fill="none" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" />
          <rect x="15" y="14" width="6" height="6" fill="#ef4444" rx="1" />
          <rect x="35" y="14" width="6" height="6" fill="#3b82f6" rx="1" />
          {/* Gravitational suction rings */}
          <circle cx="28" cy="40" r="3" fill="#67e8f9" />
          <circle cx="22" cy="45" r="2" fill="#67e8f9" />
          <circle cx="34" cy="45" r="2" fill="#67e8f9" />
        </svg>
      ),
      getEffect: (lvl) => (lvl === 0 ? 'Succión base' : `+${(Math.min(750, lvl * 1.5 + Math.sqrt(lvl) * 12)).toFixed(0)}px Radio Gravitacional`),
    },
    {
      key: 'armor',
      name: t.statArmorTitle,
      desc: t.statArmorDesc,
      color: '#10b981',
      borderColor: 'border-emerald-500/40',
      bgGrad: 'from-emerald-950/40 via-neutral-900 to-emerald-950/30',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      svgGraphic: (
        <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
          <circle cx="28" cy="28" r="24" fill="#064e3b" fillOpacity="0.4" stroke="#10b981" strokeWidth="2" />
          <path d="M28 12 L40 18 V28 C40 37 34 43 28 46 C22 43 16 37 16 28 V18 Z" fill="#059669" stroke="#34d399" strokeWidth="2" />
          <circle cx="28" cy="28" r="5" fill="#a7f3d0" />
        </svg>
      ),
      getEffect: (lvl) => (lvl === 0 ? 'Sin blindaje' : `-${(Math.min(0.85, 1.0 - 1.0 / (1.0 + lvl * 0.008)) * 100).toFixed(0)}% Daño de Anticuerpos`),
    },
    {
      key: 'metabolism',
      name: t.statMetabolismTitle,
      desc: t.statMetabolismDesc,
      color: '#f43f5e',
      borderColor: 'border-rose-500/40',
      bgGrad: 'from-rose-950/40 via-neutral-900 to-rose-950/30',
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      svgGraphic: (
        <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">
          <circle cx="28" cy="28" r="24" fill="#881337" fillOpacity="0.4" stroke="#f43f5e" strokeWidth="2" />
          <path d="M28 14 Q36 22 36 32 A8 8 0 0 1 20 32 Q20 22 28 14 Z" fill="#fb7185" stroke="#f43f5e" strokeWidth="1.5" />
          <path d="M28 24 Q32 28 32 34 A4 4 0 0 1 24 34 Q24 28 28 24 Z" fill="#fef08a" />
        </svg>
      ),
      getEffect: (lvl) => (lvl === 0 ? 'Metabolismo estándar' : `+${(Math.log10(1 + lvl) * 55).toFixed(0)}% Masa por Eritrocito`),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md pointer-events-auto select-none animate-fade-in">
      <div className="relative w-full max-w-3xl p-5 sm:p-7 rounded-3xl bg-neutral-950/95 border border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.3)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

        {/* Header with Cytes Balance */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">{t.upgradesHeroTitle}</h3>
              <p className="text-xs text-neutral-400">{t.upgradesHeroSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Balance Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 shadow-[0_0_15px_rgba(239,68,68,0.35)] shrink-0">
              <CyteCoinSvg size={18} />
              <span className="text-base sm:text-lg font-black text-white font-mono tabular-nums leading-none">
                {profile.cytes}
              </span>
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">{t.cytes}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div className="my-2 p-2.5 rounded-2xl bg-purple-950/90 border border-purple-400/50 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in shrink-0">
            <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Global Multiplier Selector Bar */}
        <div className="py-2.5 px-3 rounded-2xl bg-white/5 border border-white/10 my-2 flex items-center justify-between gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
            <Info className="w-3.5 h-3.5 text-purple-400" />
            <span>Modo de Compra Rápida:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[1, 10, 50, 100].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedMultiplier(num)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedMultiplier === num
                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                +{num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedMultiplier('max')}
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedMultiplier === 'max'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-white/5 text-amber-300 hover:bg-white/10'
              }`}
            >
              {t.quickUpgradeMax}
            </button>
          </div>
        </div>

        {/* 5 Aspects Upgrades List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {UPGRADES.map((item) => {
            const currentLvl = (profile.upgrades && profile.upgrades[item.key]) || 0;
            const progressPercent = Math.min(100, (currentLvl / UPGRADE_MAX_LEVEL) * 100);
            const isMax = currentLvl >= UPGRADE_MAX_LEVEL;

            // Compute cost for current selection
            let countPreview = selectedMultiplier === 'max' ? profileStorage.getMaxAffordableCount(item.key) : selectedMultiplier;
            const costData = getTotalUpgradeCost(currentLvl, countPreview);
            const canAfford = profile.cytes >= costData.totalCost && costData.actualCount > 0;

            return (
              <div
                key={item.key}
                className={`p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r ${item.bgGrad} border ${item.borderColor} shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-3`}
              >
                {/* Left: SVG Image + Description */}
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  {item.svgGraphic}
                  <div className="space-y-1 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white">{item.name}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono border"
                        style={{
                          color: item.color,
                          borderColor: `${item.color}50`,
                          backgroundColor: `${item.color}15`,
                        }}
                      >
                        Nivel {currentLvl} / {UPGRADE_MAX_LEVEL}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-tight line-clamp-2 max-w-md">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[11px] font-bold" style={{ color: item.color }}>
                        {item.getEffect(currentLvl)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Progress bar & Buy Button */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-56 shrink-0 gap-2 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                  {/* Progress bar */}
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>Progreso Biológico</span>
                      <span>{progressPercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: item.color,
                          boxShadow: `0 0 8px ${item.color}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Buy Button */}
                  {isMax ? (
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.upgradeMaxReached}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(item.key)}
                      disabled={!canAfford}
                      className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                          : 'bg-white/10 text-neutral-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>
                        +{costData.actualCount} Nvl ({costData.totalCost} Cytes)
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
