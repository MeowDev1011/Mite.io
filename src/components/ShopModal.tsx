import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Check, Lock, X, Zap, Shield, Target, Compass, Award, Magnet, Flame, HeartPulse, Droplets, ChevronUp } from 'lucide-react';
import { profileStorage, PlayerProfile, UPGRADE_MAX_LEVEL, getTotalUpgradeCost, getUpgradeCost } from '../storage/profileStorage';
import { PlayerUpgrades } from '../game/types';
import { MICROBE_SKINS, SPORE_STYLES, BUNDLE_PACKS, MicrobeSkin, SporeStyle, SkinBundle } from '../game/skins';
import { BACTERIA_STRAINS, BacteriaStrain } from '../game/bacteria';
import { ANATOMICAL_ORGANS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { BacteriaIllustrationSvg, CyteCoinSvg, ConqueredFlagSvg } from './BioSvgIcons';
import { TranslationStrings } from '../i18n/languages';

interface ShopModalProps {
  onClose: () => void;
  onSkinChanged: () => void;
  t?: TranslationStrings;
}

export const ShopModal: React.FC<ShopModalProps> = ({ onClose, onSkinChanged, t }) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => profileStorage.getProfile());
  const [activeTab, setActiveTab] = useState<'bacteria' | 'bundles' | 'upgrades' | 'skins' | 'spores' | 'territory'>('bacteria');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [upgradeMultiplier, setUpgradeMultiplier] = useState<number | 'max'>(1);

  const handleSelectOrBuyBacteria = (bacteria: BacteriaStrain) => {
    const isUnlocked = profile.unlockedBacteriaIds.includes(bacteria.id) || bacteria.isFreeStarter;

    if (isUnlocked) {
      profileStorage.selectBacteria(bacteria.id);
      setProfile(profileStorage.getProfile());
      onSkinChanged();
      setFeedbackMsg(`¡Bacteriófago / Cepa equipada: ${bacteria.name}!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    if (profile.cytes < bacteria.priceCytes) {
      setFeedbackMsg(`¡Cytes insuficientes! Cuesta ${bacteria.priceCytes} Cytes. Devorá eritrocitos o conquistá órganos.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
      return;
    }

    const ok = profileStorage.spendCytes(bacteria.priceCytes);
    if (ok) {
      profileStorage.unlockBacteria(bacteria.id);
      profileStorage.selectBacteria(bacteria.id);
      setProfile(profileStorage.getProfile());
      soundEngine.playLevelUp();
      onSkinChanged();
      setFeedbackMsg(`¡Adquiriste la cepa ${bacteria.name}!`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleBuySkin = (skin: MicrobeSkin) => {
    if (profile.unlockedSkinIds.includes(skin.id)) {
      profileStorage.selectSkin(skin.id);
      setProfile(profileStorage.getProfile());
      onSkinChanged();
      return;
    }

    if (profile.cytes < skin.priceCytes) {
      setFeedbackMsg('¡Cytes insuficientes! Devorá glóbulos rojos o conquistá órganos con 100 de masa.');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    const ok = profileStorage.spendCytes(skin.priceCytes);
    if (ok) {
      profileStorage.unlockSkin(skin.id);
      profileStorage.selectSkin(skin.id);
      setProfile(profileStorage.getProfile());
      soundEngine.playLevelUp();
      onSkinChanged();
      setFeedbackMsg(`¡Has adquirido ${skin.name}!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleBuySpore = (spore: SporeStyle) => {
    if (profile.unlockedSporeIds.includes(spore.id)) {
      profileStorage.selectSpore(spore.id);
      setProfile(profileStorage.getProfile());
      onSkinChanged();
      return;
    }

    if (profile.cytes < spore.priceCytes) {
      setFeedbackMsg('¡Cytes insuficientes!');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    const ok = profileStorage.spendCytes(spore.priceCytes);
    if (ok) {
      profileStorage.unlockSpore(spore.id);
      profileStorage.selectSpore(spore.id);
      setProfile(profileStorage.getProfile());
      soundEngine.playLevelUp();
      onSkinChanged();
      setFeedbackMsg(`¡Has adquirido ${spore.name}!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleBuyBundle = (bundle: SkinBundle) => {
    const hasSkin = profile.unlockedSkinIds.includes(bundle.skinId);
    const hasSpore = profile.unlockedSporeIds.includes(bundle.sporeId);
    const hasBacteria = profile.unlockedBacteriaIds.includes(bundle.bacteriaId);

    if (hasSkin && hasSpore && hasBacteria) {
      profileStorage.selectSkin(bundle.skinId);
      profileStorage.selectSpore(bundle.sporeId);
      profileStorage.selectBacteria(bundle.bacteriaId);
      setProfile(profileStorage.getProfile());
      onSkinChanged();
      setFeedbackMsg(`¡Conjunto ${bundle.name} equipado al completo!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    if (profile.cytes < bundle.priceCytes) {
      setFeedbackMsg(`¡Cytes insuficientes! Este conjunto cuesta ${bundle.priceCytes} Cytes.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    const ok = profileStorage.spendCytes(bundle.priceCytes);
    if (ok) {
      profileStorage.unlockSkin(bundle.skinId);
      profileStorage.unlockSpore(bundle.sporeId);
      profileStorage.unlockBacteria(bundle.bacteriaId);
      profileStorage.selectSkin(bundle.skinId);
      profileStorage.selectSpore(bundle.sporeId);
      profileStorage.selectBacteria(bundle.bacteriaId);
      setProfile(profileStorage.getProfile());
      soundEngine.playLevelUp();
      onSkinChanged();
      setFeedbackMsg(`¡Has adquirido y equipado el ${bundle.name}!`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleUpgradeStat = (stat: keyof PlayerUpgrades, count: number | 'max' = 1) => {
    const buyCount = count === 'max' ? profileStorage.getMaxAffordableCount(stat) : count;
    const res = profileStorage.upgradeStat(stat, buyCount);
    if (res.success) {
      setProfile(profileStorage.getProfile());
      soundEngine.playLevelUp();
      setFeedbackMsg(`¡Mejora aplicada con éxito! Nivel ${res.newLevel} / ${UPGRADE_MAX_LEVEL} activo.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      setFeedbackMsg(res.error || 'Cytes insuficientes para mejorar');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const UPGRADES_LIST: {
    key: keyof PlayerUpgrades;
    name: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    effectLabel: (level: number) => string;
  }[] = [
    {
      key: 'sporesFission',
      name: 'Esporas y Fisión Mitótica',
      desc: 'Incrementa el alcance, masa retenida y velocidad balística al disparar esporas [W] e impulso de división [Espacio].',
      icon: <Droplets className="w-5 h-5 text-purple-400" />,
      color: '#a855f7',
      effectLabel: (lvl) => (lvl === 0 ? 'Fisión base' : `+${(Math.log10(1 + lvl) * 45).toFixed(0)}% Alcance & Mitosis`),
    },
    {
      key: 'attraction',
      name: 'Bio-Atracción Magnética',
      desc: 'Amplía el radio gravitacional para absorber proteínas, glucosa y esporas desde mayor distancia.',
      icon: <Magnet className="w-5 h-5 text-cyan-400" />,
      color: '#06b6d4',
      effectLabel: (lvl) => (lvl === 0 ? 'Rango base' : `+${(Math.min(750, lvl * 1.5 + Math.sqrt(lvl) * 12)).toFixed(0)}px Succión`),
    },
    {
      key: 'speed',
      name: 'Velocidad e Hidrodinámica',
      desc: 'Optimiza la movilidad flagelar en el plasma sanguíneo con mayor aceleración y velocidad punta.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: '#f59e0b',
      effectLabel: (lvl) => (lvl === 0 ? 'Velocidad base' : `+${(Math.log10(1 + lvl) * 48).toFixed(0)}% Velocidad Plasma`),
    },
    {
      key: 'armor',
      name: 'Armadura Inmunológica',
      desc: 'Refuerza la pared celular reduciendo la pérdida de masa por anticuerpos patrulla y toxinas.',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      color: '#10b981',
      effectLabel: (lvl) => (lvl === 0 ? 'Blindaje normal' : `-${(Math.min(0.85, 1.0 - 1.0 / (1.0 + lvl * 0.008)) * 100).toFixed(0)}% Daño`),
    },
    {
      key: 'metabolism',
      name: 'Metabolismo & Fisión Rápida',
      desc: 'Aumenta la ganancia de masa por eritrocito devorado y reduce el tiempo de recombinación.',
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      color: '#f43f5e',
      effectLabel: (lvl) => (lvl === 0 ? 'Metabolismo estándar' : `+${(Math.log10(1 + lvl) * 55).toFixed(0)}% Masa Extra`),
    },
  ];

  const conqueredCount = profile.conqueredOrgans.length;
  const totalOrgans = ANATOMICAL_ORGANS.length;
  const conquestPercent = Math.round((conqueredCount / totalOrgans) * 100);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md pointer-events-auto select-none">
      <div className="w-full max-w-4xl max-h-[92vh] p-5 sm:p-7 rounded-3xl bg-neutral-900 border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.2)] flex flex-col overflow-hidden">
        {/* Header with Cytes Balance */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Mercado Biológico</h2>
              <p className="text-xs text-neutral-400">Canjeá tus Cytes por cepas bacterianas, aspectos y esporas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Balance Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 shadow-[0_0_15px_rgba(239,68,68,0.35)] shrink-0">
              <CyteCoinSvg size={18} />
              <span className="text-base sm:text-lg font-black text-white font-mono tabular-nums leading-none">
                {profile.cytes}
              </span>
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Cytes</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="mt-2.5 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-semibold text-center animate-fade-in shrink-0">
            {feedbackMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-3 pb-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('bacteria')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'bacteria'
                ? 'bg-rose-500 text-neutral-950 shadow-md font-black'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cepas de Bacteria</span>
          </button>

          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'bundles'
                ? 'bg-rose-500 text-neutral-950 shadow-md font-black'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Conjuntos / Packs</span>
          </button>

          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'upgrades'
                ? 'bg-rose-500 text-neutral-950 shadow-md font-black'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Mejoras con Cytes</span>
          </button>

          <button
            onClick={() => setActiveTab('skins')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'skins'
                ? 'bg-rose-500 text-neutral-950 shadow-md font-black'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            Skins de Membrana
          </button>

          <button
            onClick={() => setActiveTab('spores')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'spores'
                ? 'bg-rose-500 text-neutral-950 shadow-md font-black'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            Estilos de Espora [W]
          </button>

          <button
            onClick={() => setActiveTab('territory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'territory'
                ? 'bg-rose-500 text-neutral-950 shadow-md font-black'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Colonias Anatómicas ({conquestPercent}%)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto py-2 flex-1 pr-1">
          {/* TAB 1: BACTERIA STRAINS */}
          {activeTab === 'bacteria' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {BACTERIA_STRAINS.map((b) => {
                const isUnlocked = profile.unlockedBacteriaIds.includes(b.id) || b.isFreeStarter;
                const isSelected = profile.selectedBacteriaId === b.id;

                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                        : isUnlocked
                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                        : 'bg-black/40 border-white/5 opacity-85'
                    }`}
                  >
                    <div>
                      {/* Top Row: SVG Image & Name */}
                      <div className="flex items-start gap-3 mb-2.5">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner"
                          style={{
                            backgroundColor: `${b.primaryColor}15`,
                            borderColor: `${b.primaryColor}40`,
                          }}
                        >
                          <BacteriaIllustrationSvg
                            type={b.svgIconName}
                            size={52}
                            primaryColor={b.primaryColor}
                            secondaryColor={b.secondaryColor}
                            accentColor={b.accentColor}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-white truncate">{b.name}</h3>
                            {b.isFreeStarter && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                                Gratis
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400 italic block">{b.species}</span>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-300 font-bold">
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>{b.perkTitle}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-300 leading-snug mb-2">{b.description}</p>
                      <p className="text-[10px] text-emerald-300/90 font-mono bg-black/30 p-2 rounded-xl mb-3 border border-white/5">
                        Perk: {b.perkDescription}
                      </p>

                      {/* Stat multipliers */}
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-neutral-400 mb-3 text-center">
                        <div className="p-1 rounded-lg bg-white/5">
                          <span>Velocidad</span>
                          <span className="block font-bold text-white">x{b.speedBonus}</span>
                        </div>
                        <div className="p-1 rounded-lg bg-white/5">
                          <span>Blindaje</span>
                          <span className="block font-bold text-white">x{b.armorBonus}</span>
                        </div>
                        <div className="p-1 rounded-lg bg-white/5">
                          <span>Conquista</span>
                          <span className="block font-bold text-white">x{b.conquestCytesMultiplier}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectOrBuyBacteria(b)}
                      className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-neutral-950 shadow-md'
                          : isUnlocked
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Equipada Actualmente</span>
                        </>
                      ) : isUnlocked ? (
                        <span>Equipar Esta Cepa</span>
                      ) : (
                        <>
                          <CyteCoinSvg size={14} />
                          <span>Desbloquear por {b.priceCytes} Cytes</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: BUNDLES / CONJUNTOS */}
          {activeTab === 'bundles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {BUNDLE_PACKS.map((bundle) => {
                const hasSkin = profile.unlockedSkinIds.includes(bundle.skinId);
                const hasSpore = profile.unlockedSporeIds.includes(bundle.sporeId);
                const hasBacteria = profile.unlockedBacteriaIds.includes(bundle.bacteriaId);
                const isFullyOwned = hasSkin && hasSpore && hasBacteria;
                const isEquipped =
                  profile.selectedSkinId === bundle.skinId &&
                  profile.selectedSporeId === bundle.sporeId &&
                  profile.selectedBacteriaId === bundle.bacteriaId;

                const skinObj = MICROBE_SKINS.find((s) => s.id === bundle.skinId);
                const sporeObj = SPORE_STYLES.find((s) => s.id === bundle.sporeId);
                const bacObj = BACTERIA_STRAINS.find((b) => b.id === bundle.bacteriaId);

                return (
                  <div
                    key={bundle.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-emerald-950/40 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : isFullyOwned
                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                        : 'bg-black/50 border-rose-500/20 hover:border-rose-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: `${bundle.themeColor}25`,
                            color: bundle.themeColor,
                            border: `1px solid ${bundle.themeColor}50`,
                          }}
                        >
                          {bundle.badge}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-neutral-400 line-through font-mono">
                            {bundle.originalPrice} Cytes
                          </span>
                          <span className="text-xs font-black text-rose-300 font-mono">
                            {bundle.priceCytes} Cytes
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-black text-white mb-1">{bundle.name}</h3>
                      <p className="text-xs text-neutral-300 mb-3">{bundle.description}</p>

                      {/* Items Included Preview Pills */}
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400 text-[11px]">Skin:</span>
                          <span className="font-semibold text-white truncate max-w-[170px]">
                            {skinObj?.name || bundle.skinId}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400 text-[11px]">Espora [W]:</span>
                          <span className="font-semibold text-white truncate max-w-[170px]">
                            {sporeObj?.name || bundle.sporeId}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400 text-[11px]">Cepa:</span>
                          <span className="font-semibold text-white truncate max-w-[170px]">
                            {bacObj?.name || bundle.bacteriaId}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyBundle(bundle)}
                      className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isEquipped
                          ? 'bg-emerald-500 text-neutral-950 shadow-md font-black'
                          : isFullyOwned
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Conjunto Equipado</span>
                        </>
                      ) : isFullyOwned ? (
                        <span>Equipar Conjunto</span>
                      ) : (
                        <>
                          <CyteCoinSvg size={14} />
                          <span>Adquirir Conjunto ({bundle.priceCytes} Cytes)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: UPGRADES / MEJORAS CELULARES */}
          {activeTab === 'upgrades' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-cyan-500/10 border border-white/10 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Funciones de Mejora Biológica</span>
                  </h3>
                  <p className="text-xs text-neutral-300">
                    Aumentá la atracción de nutrientes, velocidad, resistencia y metabolismo permanente con tus Cytes.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-neutral-400 block uppercase font-bold">Total Invertido</span>
                  <span className="text-xs font-black text-amber-300 font-mono">
                    {((profile.upgrades?.attraction || 0) + (profile.upgrades?.speed || 0) + (profile.upgrades?.armor || 0) + (profile.upgrades?.metabolism || 0))} / 20 Niveles
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {UPGRADES_LIST.map((stat) => {
                  const currentLvl = profile.upgrades?.[stat.key] || 0;
                  const isMax = currentLvl >= 5;
                  const nextTier = !isMax ? UPGRADE_TIERS[currentLvl] : null;
                  const canAfford = nextTier ? profile.cytes >= nextTier.costCytes : false;

                  return (
                    <div
                      key={stat.key}
                      className="p-4 rounded-2xl bg-black/50 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center border"
                              style={{
                                backgroundColor: `${stat.color}20`,
                                borderColor: `${stat.color}50`,
                              }}
                            >
                              {stat.icon}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white">{stat.name}</h4>
                              <span className="text-[10px] font-bold" style={{ color: stat.color }}>
                                {stat.effectLabel(currentLvl)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <div
                                key={lvl}
                                className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[8px] font-black border transition-all ${
                                  lvl <= currentLvl
                                    ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                                    : 'bg-white/5 border-white/10 text-neutral-500'
                                }`}
                              >
                                {lvl}
                              </div>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-neutral-300 mb-3.5 leading-relaxed">{stat.desc}</p>
                      </div>

                      <div>
                        {isMax ? (
                          <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4" />
                            <span>Nivel Máximo (5/5)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpgradeStat(stat.key)}
                            disabled={!canAfford}
                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              canAfford
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                                : 'bg-white/5 border border-white/10 text-neutral-500 cursor-not-allowed'
                            }`}
                          >
                            <CyteCoinSvg size={14} />
                            <span>
                              Mejorar a Nivel {currentLvl + 1} ({nextTier?.costCytes} Cytes)
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SKINS */}
          {activeTab === 'skins' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MICROBE_SKINS.map((skin) => {
                const isUnlocked = profile.unlockedSkinIds.includes(skin.id);
                const isSelected = profile.selectedSkinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                        : isUnlocked
                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                        : 'bg-black/40 border-white/5 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-12 h-12 rounded-full border-2 shadow-md relative flex items-center justify-center"
                          style={{
                            backgroundColor: skin.color,
                            borderColor: skin.ciliaColor,
                            boxShadow: `0 0 16px ${skin.secondaryColor}`,
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: skin.nucleusColor }}
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{skin.name}</h3>
                          <span className="text-[10px] text-neutral-400">{skin.unlockRequirement}</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300 mb-3">{skin.description}</p>
                    </div>

                    <button
                      onClick={() => handleBuySkin(skin)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-neutral-950 shadow-md font-black'
                          : isUnlocked
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Equipado</span>
                        </>
                      ) : isUnlocked ? (
                        <span>Equipar</span>
                      ) : (
                        <>
                          <CyteCoinSvg size={14} />
                          <span>Desbloquear ({skin.priceCytes} Cytes)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: SPORES */}
          {activeTab === 'spores' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPORE_STYLES.map((spore) => {
                const isUnlocked = profile.unlockedSporeIds.includes(spore.id);
                const isSelected = profile.selectedSporeId === spore.id;

                return (
                  <div
                    key={spore.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                        : isUnlocked
                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                        : 'bg-black/40 border-white/5 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-9 h-9 rounded-full border-2 shadow-md flex items-center justify-center animate-pulse"
                          style={{
                            backgroundColor: spore.color,
                            borderColor: spore.glowColor,
                            boxShadow: `0 0 12px ${spore.glowColor}`,
                          }}
                        />
                        <div>
                          <h3 className="text-sm font-bold text-white">{spore.name}</h3>
                          <span className="text-[10px] text-neutral-400">Rastro: {spore.trailType}</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 mb-3">{spore.unlockRequirement}</p>
                    </div>

                    <button
                      onClick={() => handleBuySpore(spore)}
                      className={`w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-neutral-950 font-black'
                          : isUnlocked
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>En Uso</span>
                        </>
                      ) : isUnlocked ? (
                        <span>Equipar</span>
                      ) : (
                        <>
                          <CyteCoinSvg size={14} />
                          <span>{spore.priceCytes} Cytes</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: TERRITORY & ORGAN COLONIES */}
          {activeTab === 'territory' && (
            <div className="space-y-3">
              {/* Progress Summary Card */}
              <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/30 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Dominio del Cuerpo Humano</h3>
                    <p className="text-xs text-neutral-400">
                      Alcanzá <strong className="text-emerald-400">100 de Masa</strong> durante una partida para activar el botón de <strong className="text-rose-400">Conquistar Territorio</strong>.
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-2xl font-black text-rose-400">{conqueredCount} / {totalOrgans}</span>
                  <span className="text-xs text-neutral-400 block font-sans">Órganos Colonizados</span>
                </div>
              </div>

              {/* Organs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ANATOMICAL_ORGANS.map((organ) => {
                  const isConquered = profile.conqueredOrgans.includes(organ.id);

                  return (
                    <div
                      key={organ.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isConquered
                          ? 'bg-emerald-950/30 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                            style={{
                              backgroundColor: organ.color,
                              boxShadow: `0 0 8px ${organ.glowColor}`,
                            }}
                          />
                          <h4 className="text-sm font-black text-white">{organ.name}</h4>
                        </div>

                        {isConquered ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-400/30">
                            <ConqueredFlagSvg size={12} color="#34d399" />
                            <span>Colonizado</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-neutral-400 text-[10px] font-bold">
                            Sin Conquistar
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-300 mb-2 leading-relaxed">{organ.description}</p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-2 border-t border-white/5">
                        <span>Recompensa de Conquista:</span>
                        <span className="text-emerald-400 font-bold">+80 Cytes & Impulso</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
