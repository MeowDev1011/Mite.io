import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Shield, ShieldAlert, Sparkles, Award, BookOpen, Globe, ShoppingBag, MapPin, Crown, Flag, Compass, Zap, ChevronDown, ChevronUp, Map, Eye, EyeOff, HeartPulse, Thermometer, Droplets, Flame, HelpCircle, Share2, X, Clock } from 'lucide-react';
import { GameStats, LeaderboardEntry } from '../game/types';
import { SECRET_ZONE_X, SECRET_ZONE_Y, ANATOMICAL_ORGANS } from '../game/constants';
import { TranslationStrings, SUPPORTED_LANGUAGES } from '../i18n/languages';
import { profileStorage } from '../storage/profileStorage';
import { reportStorage } from '../storage/reportStorage';
import { DevBadge } from './DevBadge';

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
  onOpenReport?: () => void;
  onOpenDevPanel?: () => void;
  currentLang: string;
  onSelectLanguage: (lang: string) => void;
  t: TranslationStrings;
  currentOrgan?: string;
  cytesBalance?: number;
  playerPos?: { x: number; y: number };
  antibodies?: { x: number; y: number; alert: number }[];
  otherMicrobes?: { x: number; y: number; isBig: boolean; isKing?: boolean }[];
  kingPos?: { x: number; y: number; isPlayer: boolean; mass: number } | null;
  nearbyMicrobes?: { x: number; y: number; mass: number; isLarger: boolean }[];
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
  onOpenReport,
  onOpenDevPanel,
  currentLang,
  onSelectLanguage,
  t,
  currentOrgan = 'Corazón (Aorta)',
  cytesBalance = 0,
  playerPos = { x: 0, y: 0 },
  antibodies = [],
  otherMicrobes = [],
  kingPos = null,
  nearbyMicrobes = [],
}) => {
  // Mobile responsiveness check
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const devBadgeConfig = reportStorage.getDevConfig();

  // Minimap scaling: Dual human body world coordinates span approx [-2200, 2200] x [-2600, 2800]
  // Compact size so it comes open by default and never blocks the bottom-left joystick, top-right leaderboard, or center screen
  const mapWidth = isMobile ? 114 : 162;
  const mapHeight = isMobile ? 94 : 134;
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

  // Radar comes open by default (true) and positioned cleanly so it never covers controls
  const [isRadarOpen, setIsRadarOpen] = useState<boolean>(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(true);
  const [isHostStatusOpen, setIsHostStatusOpen] = useState<boolean>(!isMobile);

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

          {/* RED CIRCLE KING TRACKER with Crown and Distance in Meters */}
          {kingPos && (
            <div className="pointer-events-auto flex items-center justify-center animate-fade-in my-0.5">
              {kingPos.isPlayer ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/90 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.7)] backdrop-blur-md">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 border border-amber-300 flex items-center justify-center shadow-md shrink-0">
                    <Crown className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-rose-200 uppercase tracking-wider">
                    {t.youAreTheKing}
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-neutral-950/90 border-2 border-rose-500/90 shadow-[0_0_25px_rgba(244,63,94,0.65)] backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
                  title={t.trackKingHint}
                >
                  {/* Glowing Red Circle with Golden Crown & Direction Pointer */}
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 border border-rose-300 flex items-center justify-center shadow-[0_0_12px_#f43f5e] shrink-0">
                    <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 drop-shadow-[0_0_4px_#fbbf24]" />
                    {/* Rotating direction pointer arrow */}
                    <div
                      className="absolute inset-0 flex items-start justify-center transition-transform duration-200"
                      style={{
                        transform: `rotate(${Math.atan2(kingPos.y - playerPos.y, kingPos.x - playerPos.x) + Math.PI / 2}rad)`,
                      }}
                    >
                      <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-amber-300 -translate-y-1" />
                    </div>
                  </div>

                  {/* King distance info */}
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-300">
                      {t.kingTrackerLabel}
                    </span>
                    <span className="text-xs sm:text-sm font-black font-mono text-white">
                      {Math.max(1, Math.round(Math.hypot(kingPos.x - playerPos.x, kingPos.y - playerPos.y) / 20))} {t.metersUnit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

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

            {/* User Report Button */}
            {onOpenReport && (
              <button
                onClick={onOpenReport}
                className="p-1.5 sm:p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 transition-colors backdrop-blur-md cursor-pointer"
                title={t.reportBtn}
              >
                <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Dev Admin Panel Button */}
            {onOpenDevPanel && (
              <button
                onClick={onOpenDevPanel}
                className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl bg-amber-950/75 hover:bg-amber-900/90 border border-amber-500/50 text-amber-300 transition-colors backdrop-blur-md cursor-pointer flex items-center gap-1 font-black text-[10px] sm:text-xs"
                title={t.devPanelTitle}
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span>{t.devOpenPanelBtn}</span>
              </button>
            )}
          </div>

          {/* Top 10 Leaderboard Panel - Always visible on mobile and desktop */}
          <div className="w-36 sm:w-60 p-1.5 sm:p-2.5 rounded-2xl bg-black/80 border border-amber-500/30 backdrop-blur-md shadow-xl text-xs">
            <div
              onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
              className="flex items-center justify-between pb-1 mb-1 border-b border-white/10 font-bold text-amber-200 cursor-pointer select-none"
              title={t.foldTable}
            >
              <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs truncate">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="truncate">{isTeamMode ? t.leaderboardFaction : t.leadersTitle}</span>
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
              <div className="space-y-0.5 sm:space-y-1 max-h-28 sm:max-h-44 overflow-y-auto pr-0.5">
                {leaderboard.slice(0, isMobile ? 6 : 10).map((entry, idx) => {
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
                      className={`flex items-center justify-between px-1 sm:px-1.5 py-0.5 rounded-lg ${
                        entry.isPlayer
                          ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/30'
                          : 'text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate pr-1 min-w-0">
                        {isLeader ? (
                          <Crown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${crownColor} shrink-0 animate-pulse`} />
                        ) : (
                          <span className="font-mono text-[9px] text-neutral-500 w-3 text-right shrink-0">{idx + 1}.</span>
                        )}
                        <span className="truncate text-[9px] sm:text-xs">{entry.name}</span>
                        {(entry.isDev || (entry.isPlayer && devBadgeConfig.isDev)) && (
                          <DevBadge
                            config={(entry.devBadge as any) || devBadgeConfig}
                            size="sm"
                            tooltip={t.devBadgeTooltip}
                          />
                        )}
                      </div>
                      <span className="font-mono tabular-nums text-amber-300/90 text-[9px] sm:text-[10px] font-bold shrink-0">
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
      {/* Open by default, compact and tucked cleanly below top-left status bar so it never blocks controls */}
      <div className="fixed top-24 sm:top-32 left-2 sm:left-5 z-20 pointer-events-auto flex flex-col items-start gap-1">
        {/* Toggle / Minimize Button */}
        <button
          onClick={() => setIsRadarOpen(!isRadarOpen)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 hover:bg-black/95 border border-rose-500/40 text-rose-300 text-[9px] sm:text-[10px] font-bold backdrop-blur-md cursor-pointer transition-all shadow-md active:scale-95"
          title={isRadarOpen ? t.radarMinimizeBtn : t.radarToggleBtn}
        >
          <Compass className="w-3 h-3 text-rose-400" />
          <span>{isRadarOpen ? t.capillaryRadar : t.radarToggleBtn}</span>
          {isRadarOpen ? (
            <ChevronUp className="w-2.5 h-2.5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-2.5 h-2.5 text-neutral-400" />
          )}
        </button>

        {isRadarOpen && (
          <div className="p-1 sm:p-1.5 rounded-xl bg-black/75 border border-white/10 backdrop-blur-md shadow-xl flex flex-col items-center animate-fade-in relative">
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

              {/* Other Microbes & King on Radar */}
              {otherMicrobes.map((m, i) => {
                const mx = Math.max(4, Math.min(mapWidth - 4, mapCenterX + m.x * mapScaleX));
                const my = Math.max(4, Math.min(mapHeight - 4, mapCenterY + m.y * mapScaleY));

                if (m.isKing) {
                  return (
                    <div
                      key={`king_radar_${i}`}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                      style={{ left: `${mx}px`, top: `${my}px` }}
                      title={t.kingTrackerLabel}
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_6px_#fbbf24] animate-bounce" />
                    </div>
                  );
                }

                return (
                  <div
                    key={i}
                    className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 ${
                      m.isBig ? 'w-2 h-2 bg-yellow-400 shadow-[0_0_4px_#eab308]' : 'w-1.5 h-1.5 bg-neutral-400'
                    }`}
                    style={{ left: `${mx}px`, top: `${my}px` }}
                  />
                );
              })}

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
                className="absolute w-3.5 h-3.5 rounded-full -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-emerald-400 shadow-[0_0_12px_#34d399] z-20"
                style={{ left: `${playerMapX}px`, top: `${playerMapY}px` }}
              >
                {kingPos?.isPlayer ? (
                  <Crown className="w-3 h-3 text-amber-400 -translate-y-2 -translate-x-0.5 animate-bounce" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 m-auto mt-0.5 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Directional Off-Screen Microbe Arrows (No Name, Pure Graphical SVG Arrow, Distance in Meters) */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
        {nearbyMicrobes.map((m, idx) => {
          const dx = m.x - playerPos.x;
          const dy = m.y - playerPos.y;
          const dist = Math.hypot(dx, dy);
          const meters = Math.max(1, Math.round(dist / 20));
          const angle = Math.atan2(dy, dx);

          const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
          const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
          const cx = vw / 2;
          const cy = vh / 2;

          const marginX = isMobile ? 32 : 55;
          const marginY = isMobile ? 65 : 75;

          const maxRadiusX = cx - marginX;
          const maxRadiusY = cy - marginY;
          const edgeX = cx + Math.cos(angle) * maxRadiusX;
          const edgeY = cy + Math.sin(angle) * maxRadiusY;

          const colorClass = m.isLarger
            ? 'text-rose-300 bg-rose-950/85 border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
            : 'text-emerald-300 bg-emerald-950/85 border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.35)]';

          return (
            <div
              key={`nearby_${idx}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border backdrop-blur-md pointer-events-none transition-all duration-300 ${colorClass}`}
              style={{
                left: `${edgeX}px`,
                top: `${edgeY}px`,
              }}
            >
              {/* Graphical SVG Arrow Polygon (No text arrow) */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="shrink-0"
                style={{ transform: `rotate(${angle + Math.PI / 2}rad)` }}
              >
                <polygon points="12,2 22,22 12,17 2,22" />
              </svg>

              {/* Distance in meters without name */}
              <span className="text-[9px] sm:text-[11px] font-black font-mono leading-none">
                {meters}{t.metersUnit}
              </span>
            </div>
          );
        })}
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
            <span className="text-[10px] text-emerald-200 font-mono mt-0.5">{t.spaceKeyLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
