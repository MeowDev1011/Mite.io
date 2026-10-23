import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, ShieldAlert, Zap, Dna, BookOpen, Award, Palette, Globe, Smartphone, Monitor, Tablet, Users, Shield, Skull, Crown, Download, Check, Share2, Sparkles, X, Flag } from 'lucide-react';
import { SUPPORTED_LANGUAGES, TranslationStrings } from '../i18n/languages';
import { profileStorage, getDefaultLocalizedName } from '../storage/profileStorage';
import { BACTERIA_STRAINS, BacteriaStrain } from '../game/bacteria';
import { GameMode, Faction } from '../game/types';
import { BacteriaIllustrationSvg, CyteCoinSvg } from './BioSvgIcons';
import { InsufficientPlayersModal } from './InsufficientPlayersModal';
import { DevBadge } from './DevBadge';

interface TitleScreenProps {
  onStartGame: (name: string, mode: GameMode, faction: Faction, humansOnly: boolean) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentLang: string;
  onSelectLanguage: (lang: string) => void;
  t: TranslationStrings;
  onOpenTutorial: () => void;
  onOpenAchievements: () => void;
  onOpenSkins: () => void;
  onOpenShop: () => void;
  onOpenHomeUpgrades?: () => void;
  onOpenBattleTutorial?: () => void;
  onOpenShare?: () => void;
  onOpenActivePlayers?: () => void;
  onOpenReport?: () => void;
  onOpenDevPanel?: () => void;
  activePlayerCount?: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
  currentLang,
  onSelectLanguage,
  t,
  onOpenTutorial,
  onOpenAchievements,
  onOpenSkins,
  onOpenShop,
  onOpenHomeUpgrades,
  onOpenBattleTutorial,
  onOpenShare,
  onOpenActivePlayers,
  onOpenReport,
  onOpenDevPanel,
  activePlayerCount = 9,
}) => {
  const [profile, setProfile] = useState(() => profileStorage.getProfile());
  const [playerName, setPlayerName] = useState(() => profile.name || getDefaultLocalizedName(currentLang));
  const [selectedMode, setSelectedMode] = useState<GameMode>('ffa');
  const [selectedFaction, setSelectedFaction] = useState<Faction>('immune');
  const [humansOnly, setHumansOnly] = useState<boolean>(true); // Default true for Real Multiplayer
  const [showInsufficientModal, setShowInsufficientModal] = useState<boolean>(false);

  // Sync default name if user switches language without custom name
  useEffect(() => {
    const isGenericDefault = /^(Microbio|Microbe|Micróbio|Mikrobe|Microbo|Микроб|微生物|微细胞|미생물|ميكروب|रोगाणु)-/i.test(playerName);
    if (!profile.name || isGenericDefault) {
      setPlayerName(getDefaultLocalizedName(currentLang));
    }
  }, [currentLang]);
  const [selectedBacteriaId, setSelectedBacteriaId] = useState<string>(
    profile.selectedBacteriaId || 'bacillus_subtilis'
  );

  // PWA Install prompt handler
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [showPwaGuideModal, setShowPwaGuideModal] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowPwaGuideModal(true);
    }
  };

  const handleSelectBacteria = (bacteria: BacteriaStrain) => {
    const isUnlocked = profile.unlockedBacteriaIds.includes(bacteria.id) || bacteria.isFreeStarter;
    if (isUnlocked) {
      profileStorage.selectBacteria(bacteria.id);
      setSelectedBacteriaId(bacteria.id);
      setProfile(profileStorage.getProfile());
    } else {
      onOpenShop();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileStorage.setPlayerName(playerName);

    // If Human-Only multiplayer is selected, enforce min 3 players for FFA or min 4 for Team Battle (2 per bando)
    if (humansOnly) {
      const minRequired = selectedMode === 'team' ? 4 : 3;
      if (activePlayerCount < minRequired) {
        setShowInsufficientModal(true);
        return;
      }
    }

    onStartGame(playerName, selectedMode, selectedFaction, humansOnly);
  };

  const getDeviceIcon = () => {
    if (profile.deviceType === 'Móvil') return <Smartphone className="w-3.5 h-3.5 text-cyan-400" />;
    if (profile.deviceType === 'Tablet') return <Tablet className="w-3.5 h-3.5 text-cyan-400" />;
    return <Monitor className="w-3.5 h-3.5 text-cyan-400" />;
  };

  const currentBacteria = BACTERIA_STRAINS.find((b) => b.id === selectedBacteriaId) || BACTERIA_STRAINS[0];

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-3 sm:p-6 pointer-events-auto select-none bg-gradient-to-b from-black/75 via-black/40 to-black/90 overflow-y-auto">
      {/* Top Bar Zone: Language dropdown, device tag, and Audio toggle */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-2 flex-wrap shrink-0">
        {/* Device & Biosphere Info */}
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300/80 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="hidden sm:inline">{t.bioZone}</span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1 text-cyan-300" title={profile.deviceId}>
            {getDeviceIcon()}
            <span className="font-mono">ID: {profile.deviceId}</span>
          </span>
        </div>

        {/* Right header controls: Active Players, Cytes Balance, Languages & Sound & PWA */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Players & Invite Hub Button */}
          {onOpenActivePlayers && (
            <button
              onClick={onOpenActivePlayers}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_12px_rgba(6,182,212,0.3)] text-xs font-bold"
              title={t.viewActiveAndInviteBtn}
            >
              <Users className="w-3.5 h-3.5 text-cyan-300" />
              <span>{t.onlineBadge} ({activePlayerCount})</span>
            </button>
          )}

          {/* PWA Install Button */}
          {!isAppInstalled && (
            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/50 cursor-pointer transition-all"
              title={t.installPwaTitle}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.installPwaBtn}</span>
            </button>
          )}

          {/* Cytes Red Blood Cell Balance Pill */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/70 hover:bg-red-900/80 border border-red-500/40 text-rose-200 transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_12px_rgba(239,68,68,0.25)]"
            title={t.shopTitle}
          >
            <CyteCoinSvg size={16} />
            <span className="text-xs sm:text-sm font-black text-white font-mono tabular-nums">
              {profile.cytes}
            </span>
            <span className="text-[10px] uppercase font-bold text-rose-300">{t.cytes}</span>
          </button>

          {/* User Report Button */}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-200 transition-all cursor-pointer backdrop-blur-sm text-xs font-bold"
              title={t.reportBtn}
            >
              <Flag className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">{t.reportBtn}</span>
            </button>
          )}

          {/* Official DEV Panel Button & Customizable Tag */}
          {onOpenDevPanel && (
            <div className="flex items-center gap-1.5">
              <DevBadge onClick={onOpenDevPanel} size="md" tooltip={t.devBadgeTooltip} />
              <button
                onClick={onOpenDevPanel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 transition-all cursor-pointer backdrop-blur-sm text-xs font-black shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                title={t.devPanelTitle}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.devOpenPanelBtn}</span>
              </button>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors backdrop-blur-sm cursor-pointer"
            title={isMuted ? t.soundOff : t.soundOn}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Title Lockup with Official Mite.io Logo */}
      <div className="flex flex-col items-center text-center max-w-2xl px-4 my-auto py-3">
        <div className="flex items-center justify-center mb-1.5">
          <img
            src="/mite_io_logo.png"
            alt="Mite.io"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]"
          />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-1 font-sans">
          Mite<span className="text-emerald-400">.io</span>
        </h1>
        <p className="text-xs sm:text-sm text-rose-200/90 font-medium max-w-lg mb-3 leading-relaxed">
          {t.subtitle}
        </p>

        {/* OPPONENT TYPE: Multijugador Real (Solo Humanos) vs Con BOTs */}
        <div className="w-full max-w-md p-1 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md mb-2 flex gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setHumansOnly(true)}
            className={`flex-1 py-1.5 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              humansOnly
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-neutral-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.realMultiplayerToggle}</span>
          </button>

          <button
            type="button"
            onClick={() => setHumansOnly(false)}
            className={`flex-1 py-1.5 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              !humansOnly
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t.modeBots}</span>
          </button>
        </div>

        {/* Status Notice for Multiplayer Mode (Honest Real Device Count) */}
        {humansOnly && (
          <div className="w-full max-w-md px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-[10px] text-cyan-200 mb-2 flex items-center justify-between gap-1 backdrop-blur-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className={`w-2 h-2 rounded-full ${activePlayerCount >= (selectedMode === 'team' ? 4 : 3) ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>{activePlayerCount} {t.realMultiplayerDesc}</span>
            </span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${activePlayerCount >= (selectedMode === 'team' ? 4 : 3) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {activePlayerCount >= (selectedMode === 'team' ? 4 : 3) ? 'OK' : `Min: ${selectedMode === 'team' ? 4 : 3}`}
            </span>
          </div>
        )}

        {/* GAME MODE SELECTOR: FFA vs Team Battle */}
        <div className="w-full max-w-md p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md mb-3 flex gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedMode('ffa')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMode === 'ffa'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{t.modeFfa}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('team')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMode === 'team'
                ? 'bg-gradient-to-r from-cyan-500 to-rose-500 text-neutral-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.modeTeam}</span>
          </button>
        </div>

        {/* TEAM BATTLE FACTION SELECTION (When Team Battle is Active) */}
        {selectedMode === 'team' && (
          <div className="w-full max-w-md grid grid-cols-2 gap-2 mb-3 animate-fade-in text-left">
            {/* Faction 1: Sistema Inmune */}
            <button
              type="button"
              onClick={() => setSelectedFaction('immune')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedFaction === 'immune'
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-black/40 border-white/10 text-neutral-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-white uppercase">{t.factionImmuneTitle}</span>
              </div>
              <p className="text-[10px] text-neutral-300 leading-tight">
                {t.factionImmuneDesc}
              </p>
            </button>

            {/* Faction 2: Infección / Patógenos */}
            <button
              type="button"
              onClick={() => setSelectedFaction('pathogen')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedFaction === 'pathogen'
                  ? 'bg-rose-950/60 border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-black/40 border-white/10 text-neutral-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Skull className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-black text-white uppercase">{t.factionPathogenTitle}</span>
              </div>
              <p className="text-[10px] text-neutral-300 leading-tight">
                {t.factionPathogenDesc}
              </p>
            </button>
          </div>
        )}

        {/* QUICK BACTERIA SELECTION CAROUSEL */}
        <div className="w-full max-w-md p-2.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md mb-3 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${currentBacteria.primaryColor}15`,
                borderColor: `${currentBacteria.primaryColor}40`,
              }}
            >
              <BacteriaIllustrationSvg
                type={currentBacteria.svgIconName}
                size={40}
                primaryColor={currentBacteria.primaryColor}
                secondaryColor={currentBacteria.secondaryColor}
                accentColor={currentBacteria.accentColor}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">{currentBacteria.name}</span>
                {currentBacteria.isFreeStarter ? (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                    {t.freeLabel}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                    {currentBacteria.priceCytes} {t.cytes}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                {currentBacteria.perkTitle}: {currentBacteria.perkDescription}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenShop}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
          >
            {t.changeBacteriaBtn}
          </button>
        </div>

        {/* Hub Action Buttons: Shop, Upgrades (Nivel 1500), Tutorial, Battle Tutorial, Share, Achievements, Skins */}
        <div className="flex items-center justify-center gap-2 mb-4 w-full flex-wrap">
          {/* Shop */}
          <button
            type="button"
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.25)]"
          >
            <CyteCoinSvg size={14} />
            <span>{t.shopTitle}</span>
          </button>

          {/* Upgrades up to Level 1500 */}
          {onOpenHomeUpgrades && (
            <button
              type="button"
              onClick={onOpenHomeUpgrades}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-black transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-pulse"
            >
              <Zap className="w-3.5 h-3.5 text-purple-300" />
              <span>{t.homeUpgradesBtn}</span>
            </button>
          )}

          {/* Tutorial */}
          <button
            type="button"
            onClick={onOpenTutorial}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.tutorialBtn}</span>
          </button>

          {/* Battle Mode Dedicated Tutorial */}
          {onOpenBattleTutorial && (
            <button
              type="button"
              onClick={onOpenBattleTutorial}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-300 text-xs font-bold transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.battleTutorialBtn}</span>
            </button>
          )}

          {/* Rich Social & Device Share */}
          {onOpenShare && (
            <button
              type="button"
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/30 text-pink-300 text-xs font-bold transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-pink-400" />
              <span>{t.shareBtn}</span>
            </button>
          )}

          {/* Achievements */}
          <button
            type="button"
            onClick={onOpenAchievements}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{t.achievementsBtn}</span>
          </button>

          {/* Skins */}
          <button
            type="button"
            onClick={onOpenSkins}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{t.skinsBtn}</span>
          </button>
        </div>

        {/* Name Input & Play Form with Official DEV Oval Badge */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-md">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={16}
              placeholder={t.inputPlaceholder}
              className="w-full pl-4 pr-24 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium text-center sm:text-left transition-all"
            />
            {/* First user customizable DEV oval badge right beside the player's name */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              <DevBadge onClick={onOpenDevPanel} size="sm" tooltip={t.devBadgeTooltip} />
            </div>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.invadeBtn}</span>
          </button>
        </form>
      </div>

      {/* Flat Control Hints Bar */}
      <div className="text-xs text-neutral-400 font-medium tracking-wide flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2 border-t border-white/10 w-full max-w-3xl text-center shrink-0">
        <span><strong className="text-neutral-200">{t.controlMove}</strong></span>
        <span>·</span>
        <span><strong className="text-neutral-200">{t.controlSplit}</strong></span>
        <span>·</span>
        <span><strong className="text-neutral-200">{t.controlEject}</strong></span>
        <span>·</span>
        <span><strong className="text-neutral-200">{t.controlPause}</strong></span>
      </div>

      {/* Insufficient Players & Viral Social Promotion Modal */}
      {showInsufficientModal && (
        <InsufficientPlayersModal
          mode={selectedMode}
          faction={selectedFaction}
          activeCount={activePlayerCount}
          minRequired={selectedMode === 'team' ? 4 : 3}
          onClose={() => setShowInsufficientModal(false)}
          onPlayWithBots={() => {
            setShowInsufficientModal(false);
            onStartGame(playerName, selectedMode, selectedFaction, false);
          }}
          onOpenInvite={() => {
            setShowInsufficientModal(false);
            if (onOpenActivePlayers) onOpenActivePlayers();
          }}
          currentLang={currentLang}
          t={t}
        />
      )}

      {/* PWA Install Guide Modal */}
      {showPwaGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-neutral-900 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{t.installPwaTitle}</h3>
                  <p className="text-[11px] text-neutral-400">{t.installPwaSubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPwaGuideModal(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>{t.installAndroidTitle}</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  {t.installAndroidDesc}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>{t.installIosTitle}</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  {t.installIosDesc}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span>{t.installDesktopTitle}</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  {t.installDesktopDesc}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPwaGuideModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
            >
              {t.understoodBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
