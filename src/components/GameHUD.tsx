import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, ShieldAlert, Sparkles, Award, BookOpen, Globe, ShoppingBag, MapPin, Crown, Flag, Compass, Zap, ChevronDown, ChevronUp, Map, Eye, EyeOff, HeartPulse, Thermometer, Droplets, Flame, HelpCircle, Share2, X, Clock } from 'lucide-react';
import { GameStats, LeaderboardEntry } from '../game/types';
import { SECRET_ZONE_X, SECRET_ZONE_Y, ANATOMICAL_ORGANS } from '../game/constants';
import { TranslationStrings, SUPPORTED_LANGUAGES } from '../i18n/languages';
import { profileStorage } from '../storage/profileStorage';

interface GameHUDProps {
  stats: GameStats | null;
  leaderboard: LeaderboardEntry[];
  antibodyAlert: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onSplit: () => void;
  onEject: () => void;
  onOpenTutorial: () => void;
  onOpenShop: () => void;
  onConquerTerritory?: () => void;
  onOpenBattleTutorial?: () => void;
  onOpenShare?: () => void;
  currentLang: string;
  onSelectLanguage: (lang: string) => void;
  t: TranslationStrings;
  currentOrgan?: string;
  cytesBalance?: number;
  playerPos?: { x: number; y: number };
  antibodies?: { x: number; y: number; alert: number }[];
  otherMicrobes?: { x: number; y: number; isBig: boolean }[];
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  leaderboard,
  antibodyAlert,
  isMuted,
  onToggleMute,
  onPause,
  onSplit,
  onEject,
  onOpenTutorial,
  onOpenShop,
  onConquerTerritory,
  onOpenBattleTutorial,
  onOpenShare,
  currentLang,
  onSelectLanguage,
  t,
  currentOrgan = 'Corazón (Aorta)',
  cytesBalance = 0,
  playerPos = { x: 0, y: 0 },
  antibodies = [],
  otherMicrobes = [],
}) => {
  // Mobile responsiveness check
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Minimap scaling: Dual human body world coordinates span approx [-2200, 2200] x [-2600, 2800]
  // On mobile screens, scale down significantly so it never blocks gameplay
  const mapWidth = isMobile ? 135 : 190;
  const mapHeight = isMobile ? 112 : 160;
  const mapCenterX = mapWidth / 2;
  const mapCenterY = mapHeight / 2;
  const mapScaleX = mapWidth / 4800;
  const mapScaleY = mapHeight / 5600;

  const playerMapX = Math.max(6, Math.min(mapWidth - 6, mapCenterX + playerPos.x * mapScaleX));
  const playerMapY = Math.max(6, Math.min(mapHeight - 6, mapCenterY + playerPos.y * mapScaleY));

  const canConquer = stats ? stats.currentMass >= 100 || stats.canConquer : false;
  const isTeamMode = stats?.gameMode === 'team';
  const immuneScore = stats?.immunePercentage ?? 50;
  const pathogenScore = stats?.pathogenPercentage ?? 50;

  // On mobile, default radar to minimized so it never covers the screen or joystick!
  const [isRadarOpen, setIsRadarOpen] = useState<boolean>(!isMobile);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(!isMobile);
  const [isHostStatusOpen, setIsHostStatusOpen] = useState<boolean>(true);

  const hostStatus = stats?.hostStatus;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-2 sm:p-5 flex flex-col justify-between select-none z-10 font-sans">
      {/* Top Section: Team Battle Dominance Bar (if in team mode) */}
      {isTeamMode && (
        <div className="w-full max-w-xl mx-auto pointer-events-auto mb-1 sm:mb-2 animate-fade-in">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1 px-1">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Crown className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.immuneDefenders} ({immuneScore}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-300">
              <span>{t.pathogenInfection} ({pathogenScore}%)</span>
              <Crown className="w-3.5 h-3.5 text-rose-400" />
            </span>
          </div>
          {/* Dual Faction Progress Bar */}
          <div className="w-full h-2.5 sm:h-3 rounded-full bg-black/70 border border-white/20 p-0.5 flex overflow-hidden shadow-lg backdrop-blur-md">
            <div
              className="h-full rounded-l-full bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-400 shadow-[0_0_12px_#38bdf8] transition-all duration-500"
              style={{ width: `${immuneScore}%` }}
            />
            <div
              className="h-full rounded-r-full bg-gradient-to-l from-rose-600 via-red-500 to-purple-600 shadow-[0_0_12px_#f43f5e] transition-all duration-500"
              style={{ width: `${pathogenScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Top Header: Left Status, Center Alerts, Right Controls & Leaderboard */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* Left: Player Mass & Biometrics */}
        <div className="flex flex-col gap-1.5 sm:gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-md shadow-xl">
            {/* Mass Counter Pill */}
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                {t.cellularMass}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-3xl font-black text-white font-mono tabular-nums leading-none">
                  {stats ? Math.round(stats.currentMass) : 18}
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono">
                  / Max {stats ? Math.round(stats.peakMass) : 18}
                </span>
              </div>
            </div>

            <div className="h-7 sm:h-8 w-px bg-white/15 mx-0.5 sm:mx-1" />

            {/* Cytes Red Blood Cell Coin Pill */}
            <button
              onClick={onOpenShop}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900/80 border border-red-500/40 text-rose-200 transition-all cursor-pointer"
              title={t.shopTitle}
            >
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-tr from-red-800 via-red-500 to-red-400 border border-rose-300 shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-950/70" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-white font-mono tabular-nums">
                {cytesBalance}
              </span>
            </button>
          </div>

          {/* Current Anatomical Organ & Submetrics */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-neutral-300 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-sm self-start flex-wrap">
            <span className="text-rose-300 font-bold flex items-center gap-1 sm:gap-1.5">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" />
              <span className="font-sans font-semibold">{currentOrgan}</span>
            </span>
            <span className="text-neutral-500">·</span>
            <span className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold">{stats ? stats.cellsCount : 1}</span> {t.cells}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="flex items-center gap-1">
              <span className="text-rose-400 font-bold">{stats ? stats.redCellsEaten : 0}</span> {t.erythrocytes}
            </span>
          </div>

          {/* CONQUISTAR TERRITORIO Button */}
          {canConquer && (
            <button
              onClick={onConquerTerritory}
              className="mt-1 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.8)] border border-emerald-300 animate-pulse transition-all transform active:scale-95 cursor-pointer pointer-events-auto"
              title={t.conquerDesc}
            >
              <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-neutral-950" />
              <div className="flex flex-col text-left leading-tight">
                <span>{t.conquerBtn}</span>
                <span className="text-[9px] text-neutral-900 font-mono font-bold lowercase">
                  {t.conquerExtraCytes}
                </span>
              </div>
            </button>
          )}

          {/* BATTLE MODE: Estado del Humano (Human Host Status in upper corner) */}
          {isTeamMode && hostStatus && (
            <div className="mt-1 p-2.5 sm:p-3 rounded-2xl bg-black/80 border border-rose-500/40 backdrop-blur-md shadow-2xl max-w-[240px] sm:max-w-xs animate-fade-in text-left pointer-events-auto">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 gap-1">
                <div className="flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">
                    {t.hostStatusBadge}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {onOpenBattleTutorial && (
                    <button
                      onClick={onOpenBattleTutorial}
                      className="p-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                      title={t.battleTutorialBtn}
                    >
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsHostStatusOpen(!isHostStatusOpen)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                  >
                    {isHostStatusOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Host Status Details */}
              {isHostStatusOpen && (
                <div className="space-y-1.5 text-[10px]">
                  {/* Health Bar */}
                  <div>
                    <div className="flex items-center justify-between font-mono font-bold text-neutral-300 mb-0.5">
                      <span className="text-rose-300">{t.humanHealth}:</span>
                      <span className={hostStatus.health < 35 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}>
                        {hostStatus.health.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
                        style={{ width: `${Math.max(0, Math.min(100, hostStatus.health))}%` }}
                      />
                    </div>
                  </div>

                  {/* Biometric Row: Temp, Hydration, Energy */}
                  <div className="grid grid-cols-3 gap-1 pt-0.5 font-mono text-[9px]">
                    <div className="p-1 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center">
                      <span className="text-neutral-400 flex items-center gap-0.5"><Thermometer className="w-2.5 h-2.5 text-amber-400" /> {t.humanTemperature.slice(0, 4)}</span>
                      <span className={`font-black ${hostStatus.temperature >= 38.5 ? 'text-rose-400' : 'text-amber-300'}`}>
                        {hostStatus.temperature}°C
                      </span>
                    </div>
                    <div className="p-1 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center">
                      <span className="text-neutral-400 flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5 text-cyan-400" /> {t.humanHydration.slice(0, 4)}</span>
                      <span className="font-black text-cyan-300">{hostStatus.hydration}%</span>
                    </div>
                    <div className="p-1 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center">
                      <span className="text-neutral-400 flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-yellow-400" /> ATP</span>
                      <span className="font-black text-yellow-300">{hostStatus.energyATP}%</span>
                    </div>
                  </div>

                  {/* Pus Bar */}
                  <div>
                    <div className="flex items-center justify-between font-mono font-bold text-neutral-300 mb-0.5">
                      <span className="text-lime-300 flex items-center gap-1">
                        <Droplets className="w-2.5 h-2.5 text-lime-400" /> {t.pusLevelLabel}:
                      </span>
                      <span className="text-lime-400">{hostStatus.pusLevel.toFixed(0)} ml</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-yellow-400 to-lime-500 shadow-[0_0_8px_#a3e635]"
                        style={{ width: `${Math.max(0, Math.min(100, hostStatus.pusLevel))}%` }}
                      />
                    </div>
                  </div>

                  {/* Dynamic Symptom Badges */}
                  {hostStatus.activeSymptoms && hostStatus.activeSymptoms.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {hostStatus.activeSymptoms.map((symKey) => (
                        <span
                          key={symKey}
                          className="px-1.5 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[8px] font-bold uppercase tracking-wider animate-pulse"
                        >
                          {(t as any)[symKey] || symKey}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Top Dashboard: Survival Timer, Superpower Countdown, Antibody Warning */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto shrink-0 mx-auto">
          {/* Match Survival Time Counter */}
          <div className="flex items-center gap-1.5 px-3.5 py-1 sm:py-1.5 rounded-xl bg-black/80 border border-white/15 backdrop-blur-md text-white font-mono text-xs sm:text-sm font-bold shadow-lg">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wider">{formatTime(stats?.timeAliveSec || 0)}</span>
          </div>

          {/* Active Superpower Pill */}
          {stats?.activeSuperpower && (
            <div className="flex flex-col items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-black/85 border border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.45)] backdrop-blur-md animate-pulse max-w-[220px] sm:max-w-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full animate-ping shrink-0"
                  style={{ backgroundColor: stats.activeSuperpower.color }}
                />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white truncate">
                  {stats.activeSuperpower.name}
                </span>
                <span
                  className="text-[10px] sm:text-xs font-mono font-black px-1.5 py-0.2 rounded-md text-neutral-950 shrink-0"
                  style={{ backgroundColor: stats.activeSuperpower.color }}
                >
                  {Math.max(0, stats.activeSuperpower.remainingTime).toFixed(1)}s
                </span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${Math.max(0, Math.min(100, (stats.activeSuperpower.remainingTime / stats.activeSuperpower.totalDuration) * 100))}%`,
                    backgroundColor: stats.activeSuperpower.color,
                  }}
                />
              </div>
            </div>
          )}

          {/* Center Alert: Antibody Detection Warning */}
          {antibodyAlert && (
            <div className="animate-bounce flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-2xl bg-rose-600/90 text-white font-bold text-xs sm:text-sm border border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.7)]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-md">{t.antibodyWarning}</span>
            </div>
          )}
        </div>

        {/* Right: Quick Controls, Language & Leaderboard */}
        <div className="flex flex-col items-end gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Quick HUD Navigation Header */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
            {/* Share Button */}
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 text-rose-300 transition-colors backdrop-blur-md cursor-pointer"
                title={t.shareBtn}
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Shop Button */}
            <button
              onClick={onOpenShop}
              className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 text-rose-300 transition-colors backdrop-blur-md cursor-pointer"
              title={t.shopBtn}
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Tutorial Button */}
            <button
              onClick={onOpenTutorial}
              className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 text-neutral-200 transition-colors backdrop-blur-md cursor-pointer"
              title={t.tutorialBtn}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative flex items-center bg-black/60 border border-white/10 rounded-xl px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs text-neutral-200 backdrop-blur-md">
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 mr-1 shrink-0" />
              <select
                value={currentLang}
                onChange={(e) => onSelectLanguage(e.target.value)}
                className="bg-transparent text-white text-[11px] sm:text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Mute Button */}
            <button
              onClick={onToggleMute}
              className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 text-neutral-200 transition-colors backdrop-blur-md cursor-pointer"
              title={isMuted ? t.soundOff : t.soundOn}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
            </button>

            {/* Pause Button */}
            <button
              onClick={onPause}
              className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 text-neutral-200 transition-colors backdrop-blur-md cursor-pointer"
              title={t.controlPause}
            >
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Top 10 Leaderboard Panel */}
          <div className="w-40 sm:w-60 p-2 sm:p-2.5 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-md shadow-xl text-xs">
            <div
              onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
              className="flex items-center justify-between pb-1 mb-1 border-b border-white/10 font-bold text-neutral-300 cursor-pointer select-none"
              title={t.foldTable}
            >
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs truncate">
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span>{isTeamMode ? t.leaderboardFaction : t.leadersTitle}</span>
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {isLeaderboardOpen ? (
                  <ChevronUp className="w-3 h-3 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                )}
              </div>
            </div>

            {isLeaderboardOpen && (
              <div className="space-y-0.5 sm:space-y-1 max-h-32 sm:max-h-44 overflow-hidden">
                {leaderboard.map((entry, idx) => {
                  const isLeader = entry.hasCrown || idx === 0;
                  let crownColor = 'text-amber-400';
                  if (entry.crownType === 'immune' || (isTeamMode && entry.faction === 'immune' && idx === 0)) {
                    crownColor = 'text-cyan-400';
                  } else if (entry.crownType === 'pathogen' || (isTeamMode && entry.faction === 'pathogen')) {
                    crownColor = 'text-rose-400';
                  }

                  return (
                    <div
                      key={entry.id || idx}
                      className={`flex items-center justify-between px-1.5 py-0.5 rounded-lg ${
                        entry.isPlayer
                          ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/30'
                          : 'text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate pr-1">
                        {isLeader ? (
                          <Crown className={`w-3 h-3 ${crownColor} shrink-0 animate-pulse`} />
                        ) : (
                          <span className="font-mono text-[9px] text-neutral-500 w-3 text-right">{idx + 1}.</span>
                        )}
                        <span className="truncate text-[10px] sm:text-xs">{entry.name}</span>
                      </div>
                      <span className="font-mono tabular-nums text-neutral-400 text-[10px] shrink-0">
                        {entry.mass}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Anatomical Dual Body Radar */}
      {/* Positioned cleanly on upper-left below mass pill, compact on mobile, collapsible */}
      <div className="fixed top-28 sm:top-36 left-3 sm:left-6 z-30 pointer-events-auto flex flex-col items-start gap-1">
        {/* Toggle / Minimize Button */}
        <button
          onClick={() => setIsRadarOpen(!isRadarOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/85 hover:bg-black/95 border border-rose-500/40 text-rose-300 text-[10px] font-bold backdrop-blur-md cursor-pointer transition-all shadow-md active:scale-95"
          title={isRadarOpen ? t.radarMinimizeBtn : t.radarToggleBtn}
        >
          <Compass className="w-3.5 h-3.5 text-rose-400" />
          <span>{isRadarOpen ? t.radarMinimizeBtn : t.radarToggleBtn}</span>
          {isRadarOpen ? (
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          ) : (
            <ChevronUp className="w-3 h-3 text-neutral-400" />
          )}
        </button>

        {isRadarOpen && (
          <div className="p-1.5 sm:p-2 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center animate-fade-in relative">
            <div className="relative" style={{ width: mapWidth, height: mapHeight }}>
              {/* SVG Dual 2D Human Body Silhouette */}
              <svg width={mapWidth} height={mapHeight} className="absolute inset-0">
                <defs>
                  <linearGradient id="bodyAntGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4c0519" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#881337" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#2e050e" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="bodyPostGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2e1065" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#3b0764" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.7" />
                  </linearGradient>
                </defs>

                {/* Background Plate */}
                <rect width={mapWidth} height={mapHeight} rx="10" fill="#060103" stroke="#3b0712" strokeWidth="1.2" />

                {/* Connecting Vascular Transverse Conduits */}
                <line x1={mapWidth * 0.28} y1={mapHeight * 0.16} x2={mapWidth * 0.72} y2={mapHeight * 0.16} stroke="#dc2626" strokeWidth="2" opacity="0.6" />
                <line x1={mapWidth * 0.28} y1={mapHeight * 0.42} x2={mapWidth * 0.72} y2={mapHeight * 0.42} stroke="#ef4444" strokeWidth="3" opacity="0.7" />
                <line x1={mapWidth * 0.28} y1={mapHeight * 0.72} x2={mapWidth * 0.72} y2={mapHeight * 0.72} stroke="#9333ea" strokeWidth="2.5" opacity="0.6" />

                {/* BODY 1: Anterior Human Silhouette */}
                <g transform={`translate(${mapWidth * 0.28}, ${mapHeight * 0.5}) scale(${isMobile ? 0.35 : 0.48})`}>
                  <ellipse cx="0" cy="-85" rx="20" ry="24" fill="url(#bodyAntGrad)" stroke="#f43f5e" strokeWidth="1.2" />
                  <ellipse cx="0" cy="-22" rx="36" ry="34" fill="url(#bodyAntGrad)" stroke="#f43f5e" strokeWidth="1.2" />
                  <ellipse cx="0" cy="28" rx="30" ry="26" fill="url(#bodyAntGrad)" stroke="#f43f5e" strokeWidth="1.2" />
                  <path d="M-34 -36 Q-64 -10 -72 32" stroke="#be123c" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.8" />
                  <path d="M34 -36 Q64 -10 72 32" stroke="#be123c" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.8" />
                  <path d="M-15 48 Q-22 90 -20 125" stroke="#be123c" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.8" />
                  <path d="M15 48 Q22 90 20 125" stroke="#be123c" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.8" />
                  <line x1="0" y1="-85" x2="0" y2="48" stroke="#ef4444" strokeWidth="3" />
                </g>

                {/* BODY 2: Posterior Human Silhouette */}
                <g transform={`translate(${mapWidth * 0.72}, ${mapHeight * 0.5}) scale(${isMobile ? 0.35 : 0.48})`}>
                  <ellipse cx="0" cy="-85" rx="20" ry="24" fill="url(#bodyPostGrad)" stroke="#818cf8" strokeWidth="1.2" />
                  <ellipse cx="0" cy="-22" rx="36" ry="34" fill="url(#bodyPostGrad)" stroke="#818cf8" strokeWidth="1.2" />
                  <ellipse cx="0" cy="28" rx="30" ry="26" fill="url(#bodyPostGrad)" stroke="#818cf8" strokeWidth="1.2" />
                  <path d="M-34 -36 Q-64 -10 -72 32" stroke="#4338ca" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.8" />
                  <path d="M34 -36 Q64 -10 72 32" stroke="#4338ca" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.8" />
                  <path d="M-15 48 Q-22 90 -20 125" stroke="#4338ca" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.8" />
                  <path d="M15 48 Q22 90 20 125" stroke="#4338ca" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.8" />
                  <line x1="0" y1="-85" x2="0" y2="48" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="3 3" />
                </g>

                {/* Dual Body Labels */}
                <text x={mapWidth * 0.28} y={mapHeight - 3} textAnchor="middle" fill="#fca5a5" fontSize="6.5" fontWeight="bold">
                  {t.anteriorLabel}
                </text>
                <text x={mapWidth * 0.72} y={mapHeight - 3} textAnchor="middle" fill="#c4b5fd" fontSize="6.5" fontWeight="bold">
                  {t.posteriorLabel}
                </text>
              </svg>

              {/* Anatomical Organ Markers */}
              {ANATOMICAL_ORGANS.map((organ) => {
                const ox = mapCenterX + organ.x * mapScaleX;
                const oy = mapCenterY + organ.y * mapScaleY;
                const isConquered = profileStorage.isOrganConquered(organ.id);

                return (
                  <div
                    key={organ.id}
                    className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${ox}px`,
                      top: `${oy}px`,
                      backgroundColor: isConquered ? '#34d399' : organ.color,
                      boxShadow: isConquered ? '0 0 8px #10b981' : `0 0 6px ${organ.glowColor}`,
                    }}
                    title={organ.name}
                  />
                );
              })}

              {/* Secret Crypt Zone Dot */}
              <div
                className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 bg-cyan-400 border border-purple-400 shadow-[0_0_8px_#06b6d4] animate-pulse"
                style={{
                  left: `${mapCenterX + SECRET_ZONE_X * mapScaleX}px`,
                  top: `${mapCenterY + SECRET_ZONE_Y * mapScaleY}px`,
                }}
                title={t.hiddenCrypt}
              />

              {/* Other Microbes */}
              {otherMicrobes.map((m, i) => (
                <div
                  key={i}
                  className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 ${
                    m.isBig ? 'w-2 h-2 bg-yellow-400 shadow-[0_0_4px_#eab308]' : 'w-1.5 h-1.5 bg-neutral-400'
                  }`}
                  style={{
                    left: `${Math.max(4, Math.min(mapWidth - 4, mapCenterX + m.x * mapScaleX))}px`,
                    top: `${Math.max(4, Math.min(mapHeight - 4, mapCenterY + m.y * mapScaleY))}px`,
                  }}
                />
              ))}

              {/* Antibodies */}
              {antibodies.map((ab, i) => (
                <div
                  key={`ab_${i}`}
                  className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-ping"
                  style={{
                    left: `${Math.max(4, Math.min(mapWidth - 4, mapCenterX + ab.x * mapScaleX))}px`,
                    top: `${Math.max(4, Math.min(mapHeight - 4, mapCenterY + ab.y * mapScaleY))}px`,
                  }}
                />
              ))}

              {/* Local Player Marker */}
              <div
                className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-emerald-400 shadow-[0_0_12px_#34d399] z-10"
                style={{ left: `${playerMapX}px`, top: `${playerMapY}px` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 m-auto mt-0.5 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Controls: Eject & Split (Positioned bottom-right) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 pointer-events-auto flex items-end gap-3 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Eject Spore Button */}
          <button
            onClick={onEject}
            className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 hover:bg-amber-500/35 active:scale-95 border border-amber-400/50 text-amber-200 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
            title={t.ejectSporeHint}
          >
            <span className="text-sm sm:text-base font-black leading-none tracking-wide">{t.ejectBtn}</span>
            <span className="text-[10px] text-amber-200/80 font-mono mt-0.5">[W]</span>
          </button>

          {/* Split / Fission Button */}
          <button
            onClick={onSplit}
            className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-500/40 hover:from-emerald-500/45 hover:to-teal-400/50 active:scale-95 border border-emerald-400/60 text-emerald-200 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            title={t.splitTwoHint}
          >
            <span className="text-base sm:text-xl font-black leading-none tracking-wide">{t.splitBtn}</span>
            <span className="text-[10px] text-emerald-200 font-mono mt-0.5">[ESPACIO]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
