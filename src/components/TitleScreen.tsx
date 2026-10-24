import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, ShieldAlert, Zap, Dna, BookOpen, Award, Palette, Globe, Smartphone, Monitor, Tablet, Users, Shield, Skull, Crown, Download, Check, Share2, Sparkles, X, Flag, Trophy } from 'lucide-react';
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
  onOpenDailyLeaderboard?: () => void;
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
  onOpenDailyLeaderboard,
  onOpenReport,
  onOpenDevPanel,
  activePlayerCount = 1,
}) => {
  const [profile, setProfile] = useState(() => profileStorage.getProfile());
  const [playerName, setPlayerName] = useState(() => profile.name || getDefaultLocalizedName(currentLang));
  const [hasTypedCustomName, setHasTypedCustomName] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('ffa');
  const [selectedFaction, setSelectedFaction] = useState<Faction>('immune');
  const [humansOnly, setHumansOnly] = useState<boolean>(true); // Default true for Real Multiplayer
  const [showInsufficientModal, setShowInsufficientModal] = useState<boolean>(false);

  // Subscribe to profileStorage updates from Firestore / Server
  useEffect(() => {
    const unsub = profileStorage.subscribe((updated) => {
      setProfile(updated);
      if (!hasTypedCustomName && updated.name) {
        setPlayerName(updated.name);
      }
    });
    return unsub;
  }, [hasTypedCustomName]);

  // Sync default name if user switches language without custom name
  useEffect(() => {
    const isGenericDefault = /^(Microbio|Microbe|Micróbio|Mikrobe|Microbo|Микроб|微生物|微细胞|미생물|ميكروب|रोगाणु)-/i.test(playerName);
    if (!hasTypedCustomName && (!profile.name || isGenericDefault)) {
      setPlayerName(getDefaultLocalizedName(currentLang));
    }
  }, [currentLang, hasTypedCustomName, profile.name, playerName]);
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
    <div className="absolute inset-0 z-20 w-full max-w-[100vw] h-[100dvh] flex flex-col items-center justify-start sm:justify-between gap-2 p-2 sm:p-5 pointer-events-auto select-none bg-gradient-to-b from-black/80 via-black/45 to-black/90 overflow-x-hidden overflow-y-auto">
      {/* Top Bar Zone: Device tag, Active Players, Cytes, Report, DEV, and Audio toggle */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-1 sm:gap-2 flex-wrap shrink-0">
        {/* Device & Biosphere Info */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-rose-300/80 bg-white/5 border border-white/10 px-2 py-1 rounded-xl backdrop-blur-sm max-w-full overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span className="hidden md:inline truncate">{t.bioZone}</span>
          <span className="hidden md:inline text-white/20">|</span>
          <span className="flex items-center gap-1 text-cyan-300 truncate max-w-[145px] sm:max-w-none" title={profile.deviceId}>
            {getDeviceIcon()}
            <span className="font-mono truncate">ID: {profile.deviceId}</span>
          </span>
        </div>

        {/* Right header controls: Active Players, Cytes Balance, Sound & PWA */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end max-w-full">
          {/* Active Players & Invite Hub Button */}
          {onOpenActivePlayers && (
            <button
              onClick={onOpenActivePlayers}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_12px_rgba(6,182,212,0.3)] text-[10px] sm:text-xs font-bold shrink-0"
              title={t.viewActiveAndInviteBtn}
            >
              <Users className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>{t.onlineBadge} ({activePlayerCount})</span>
            </button>
          )}

          {/* 24-Hour Daily Leaderboard SVG Trophy Icon Button (No Emoji) */}
          {onOpenDailyLeaderboard && (
            <button
              type="button"
              onClick={onOpenDailyLeaderboard}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 border border-amber-400/60 text-amber-200 transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_14px_rgba(245,158,11,0.35)] text-[10px] sm:text-xs font-black shrink-0"
              title={t.dailyLeaderboardTitle}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t.dailyLeaderboardBtn}</span>
            </button>
          )}

          {/* PWA Install Button */}
          {!isAppInstalled && (
            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] sm:text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/50 cursor-pointer transition-all"
              title={t.installPwaTitle}
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>{t.installPwaBtn}</span>
            </button>
          )}

          {/* Cytes Red Blood Cell Balance Pill */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-950/70 hover:bg-red-900/80 border border-red-500/40 text-rose-200 transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_12px_rgba(239,68,68,0.25)]"
            title={t.shopTitle}
          >
            <CyteCoinSvg size={15} />
            <span className="text-xs font-black text-white font-mono tabular-nums">
              {profile.cytes}
            </span>
            <span className="text-[10px] uppercase font-bold text-rose-300">{t.cytes}</span>
          </button>

          {/* User Report Button */}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-200 transition-all cursor-pointer backdrop-blur-sm text-[11px] sm:text-xs font-bold"
              title={t.reportBtn}
            >
              <Flag className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="hidden sm:inline">{t.reportBtn}</span>
            </button>
          )}

          {/* Official DEV Panel Button & Customizable Tag */}
          {onOpenDevPanel && (
            <div className="flex items-center gap-1">
              <DevBadge onClick={onOpenDevPanel} size="sm" tooltip={t.devBadgeTooltip} />
              <button
                onClick={onOpenDevPanel}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 transition-all cursor-pointer backdrop-blur-sm text-[11px] sm:text-xs font-black shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                title={t.devPanelTitle}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{t.devOpenPanelBtn}</span>
              </button>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors backdrop-blur-sm cursor-pointer"
            title={isMuted ? t.soundOff : t.soundOn}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Official Mite.io Transparent Logo (/mite_io_logo.png) */}
      <div className="flex flex-col items-center text-center w-full max-w-xl px-1.5 sm:px-4 my-auto py-1 sm:py-2 shrink-0">
        <div className="flex items-center justify-center mb-1 bg-transparent">
          <img
            src="/mite_io_logo.png"
            alt="Mite.io"
            className="w-32 sm:w-52 h-auto max-h-20 sm:max-h-32 object-contain bg-transparent drop-shadow-[0_0_24px_rgba(16,185,129,0.5)] select-none pointer-events-none"
          />
        </div>
        <p className="text-[11px] sm:text-xs text-rose-200/90 font-medium max-w-md mb-2 leading-snug">
          {t.subtitle}
        </p>

        {/* OPPONENT TYPE: Multijugador Real (Solo Humanos) vs Con BOTs */}
        <div className="w-full max-w-md p-1 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md mb-2 flex gap-1 text-[10px] sm:text-[11px]">
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
        <div className="w-full max-w-md p-2 sm:p-2.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md mb-2.5 flex items-center justify-between gap-2 text-left overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${currentBacteria.primaryColor}15`,
                borderColor: `${currentBacteria.primaryColor}40`,
              }}
            >
              <BacteriaIllustrationSvg
                type={currentBacteria.svgIconName}
                size={34}
                primaryColor={currentBacteria.primaryColor}
                secondaryColor={currentBacteria.secondaryColor}
                accentColor={currentBacteria.accentColor}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-white truncate">{currentBacteria.name}</span>
                {currentBacteria.isFreeStarter ? (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold shrink-0">
                    {t.freeLabel}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold shrink-0">
                    {currentBacteria.priceCytes} {t.cytes}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 truncate">
                {currentBacteria.perkTitle}: {currentBacteria.perkDescription}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenShop}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
          >
            {t.changeBacteriaBtn}
          </button>
        </div>

        {/* Hub Action Buttons: Shop, Upgrades, Tutorial, Battle Tutorial, Share, Achievements, Skins */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 w-full max-w-md flex-wrap">
          {/* Shop */}
          <button
            type="button"
            onClick={onOpenShop}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.25)] max-w-full"
          >
            <CyteCoinSvg size={13} />
            <span className="truncate">{t.shopTitle}</span>
          </button>

          {/* Upgrades */}
          {onOpenHomeUpgrades && (
            <button
              type="button"
              onClick={onOpenHomeUpgrades}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.3)] max-w-full"
            >
              <Zap className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <span className="truncate">{t.homeUpgradesBtn}</span>
            </button>
          )}

          {/* Tutorial */}
          <button
            type="button"
            onClick={onOpenTutorial}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer max-w-full"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.tutorialBtn}</span>
          </button>

          {/* Battle Mode Dedicated Tutorial */}
          {onOpenBattleTutorial && (
            <button
              type="button"
              onClick={onOpenBattleTutorial}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer max-w-full"
            >
              <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{t.battleTutorialBtn}</span>
            </button>
          )}

          {/* Rich Social & Device Share */}
          {onOpenShare && (
            <button
              type="button"
              onClick={onOpenShare}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/30 text-pink-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer max-w-full"
            >
              <Share2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="truncate">{t.shareBtn}</span>
            </button>
          )}

          {/* Achievements */}
          <button
            type="button"
            onClick={onOpenAchievements}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer max-w-full"
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.achievementsBtn}</span>
          </button>

          {/* Daily 24h Trophy Leaderboard */}
          {onOpenDailyLeaderboard && (
            <button
              type="button"
              onClick={onOpenDailyLeaderboard}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/40 text-yellow-200 text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-[0_0_12px_rgba(234,179,8,0.28)] max-w-full"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="truncate">{t.dailyLeaderboardBtn}</span>
            </button>
          )}

          {/* Skins */}
          <button
            type="button"
            onClick={onOpenSkins}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer max-w-full"
          >
            <Palette className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.skinsBtn}</span>
          </button>
        </div>

        {/* Name Input & Play Form with Official DEV Oval Badge */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full max-w-md">
          <div className="flex items-center gap-1.5 flex-1 w-full px-3 py-2 sm:py-2.5 rounded-2xl bg-white/10 border border-white/20 focus-within:ring-2 focus-within:ring-emerald-400 transition-all overflow-hidden">
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                const val = e.target.value;
                setHasTypedCustomName(true);
                setPlayerName(val);
                if (val.trim()) {
                  profileStorage.setPlayerName(val);
                }
              }}
              onBlur={() => {
                if (playerName.trim()) {
                  profileStorage.setPlayerName(playerName);
                }
              }}
              maxLength={16}
              placeholder={t.inputPlaceholder}
              className="flex-1 min-w-0 bg-transparent text-white placeholder-neutral-400 focus:outline-none font-medium text-sm text-left"
            />
            {/* First user customizable DEV oval badge cleanly flexed next to the input */}
            <div className="shrink-0 flex items-center">
              <DevBadge onClick={onOpenDevPanel} size="sm" tooltip={t.devBadgeTooltip} />
            </div>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
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
            profileStorage.setPlayerName(playerName);
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
