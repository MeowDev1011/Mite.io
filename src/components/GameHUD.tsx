import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Shield, ShieldAlert, BookOpen, ShoppingBag, MapPin, Crown, Flag, Compass, ChevronDown, ChevronUp, HeartPulse, Thermometer, Droplets, Flame, HelpCircle, Share2, Clock, Pill, Syringe } from 'lucide-react';
import { GameStats, LeaderboardEntry, MedicalTreatmentType } from '../game/types';
import { SECRET_ZONE_X, SECRET_ZONE_Y, ANATOMICAL_ORGANS } from '../game/constants';
import { TranslationStrings } from '../i18n/languages';
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
  onAdministerTreatment?: (type: MedicalTreatmentType) => void;
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
  onAdministerTreatment,
  t,
  currentOrgan = 'Corazón (Aorta)',
  cytesBalance = 0,
  playerPos = { x: 0, y: 0 },
  antibodies = [],
  otherMicrobes = [],
  kingPos = null,
  nearbyMicrobes = [],
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const devBadgeConfig = reportStorage.getDevConfig();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compact radar dimensions so it fits cleanly inside the left HUD stack without overlapping any panel
  const mapWidth = isMobile ? 96 : 154;
  const mapHeight = isMobile ? 76 : 126;
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

  const [isRadarOpen, setIsRadarOpen] = useState<boolean>(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(true);
  // On mobile in Battle Mode, start Patient Status in compact summary bar mode so it never collides with Radar or Joystick
  const [isHostStatusOpen, setIsHostStatusOpen] = useState<boolean>(() => !(typeof window !== 'undefined' && window.innerWidth < 640));

  const handleToggleRadar = () => {
    const next = !isRadarOpen;
    setIsRadarOpen(next);
    if (next && isMobile && isTeamMode) {
      setIsHostStatusOpen(false);
    }
  };

  const handleToggleHostStatus = () => {
    const next = !isHostStatusOpen;
    setIsHostStatusOpen(next);
    if (next && isMobile) {
      setIsRadarOpen(false);
    }
  };

  const hostStatus = stats?.hostStatus;
  const topMass = Math.max(1, leaderboard[0]?.mass || 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const quickTreatments: { type: MedicalTreatmentType; label: string; color: string }[] = [
    { type: 'antibiotic', label: t.treatmentAntibiotic, color: 'border-cyan-500/50 bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900/80' },
    { type: 'analgesic', label: t.treatmentAnalgesic, color: 'border-amber-500/50 bg-amber-950/60 text-amber-200 hover:bg-amber-900/80' },
    { type: 'vaccine', label: t.treatmentVaccine, color: 'border-emerald-500/50 bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/80' },
    { type: 'antiviral_pill', label: t.treatmentAntiviral, color: 'border-purple-500/50 bg-purple-950/60 text-purple-200 hover:bg-purple-900/80' },
    { type: 'iv_serum', label: t.treatmentIvSerum, color: 'border-blue-500/50 bg-blue-950/60 text-blue-200 hover:bg-blue-900/80' },
    { type: 'antipyretic', label: t.treatmentAntipyretic, color: 'border-pink-500/50 bg-pink-950/60 text-pink-200 hover:bg-pink-900/80' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none p-1.5 sm:p-3.5 flex flex-col justify-between select-none z-10 font-sans overflow-hidden">
      {/* Top Section: Team Battle Dominance Bar + Status Strip (Never overlaps columns below) */}
      <div className="w-full flex flex-col items-center gap-1 shrink-0">
        {isTeamMode && (
          <div className="w-full max-w-lg mx-auto pointer-events-auto px-1">
            <div className="flex items-center justify-between text-[8.5px] sm:text-[11px] font-black uppercase tracking-wider mb-0.5 px-1 gap-2">
              <span className="flex items-center gap-1 text-cyan-300 truncate">
                <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{t.immuneDefenders} ({immuneScore}%)</span>
              </span>
              <span className="flex items-center gap-1 text-rose-300 truncate">
                <span className="truncate">{t.pathogenInfection} ({pathogenScore}%)</span>
                <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400 shrink-0" />
              </span>
            </div>
            <div className="w-full h-1.5 sm:h-2.5 rounded-full bg-black/75 border border-white/20 p-0.5 flex overflow-hidden shadow-lg backdrop-blur-md">
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

        {/* Main 2-Column Top Layout: Left Stack (Mass + Organ + Radar + Patient Status) & Right Stack (Controls + Compact Leaderboard) */}
        <div className="flex items-start justify-between w-full gap-1 sm:gap-3 min-w-0">
          {/* LEFT STACK: Strictly bounded above Virtual Joystick so nothing overlaps in Battle Mode */}
          <div className="flex flex-col items-start gap-1 sm:gap-1.5 pointer-events-auto max-w-[46vw] sm:max-w-[265px] max-h-[calc(100dvh-150px)] sm:max-h-[calc(100dvh-120px)] overflow-y-auto overflow-x-hidden pr-0.5">
            {/* 1. Mass, Cytes & Survival Timer Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-2 rounded-xl sm:rounded-2xl bg-black/75 border border-white/10 backdrop-blur-md shadow-xl max-w-full">
              <div className="flex flex-col min-w-0">
                <span className="text-[7.5px] sm:text-[9px] uppercase font-bold text-neutral-400 tracking-wider truncate">
                  {t.cellularMass}
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm sm:text-xl font-black text-white font-mono tabular-nums leading-none">
                    {stats ? Math.round(stats.currentMass) : 18}
                  </span>
                  <span className="text-[7.5px] sm:text-[9px] text-neutral-400 font-mono truncate">
                    /{stats ? Math.round(stats.peakMass) : 18}
                  </span>
                </div>
              </div>

              <div className="h-5 sm:h-6 w-px bg-white/15 shrink-0" />

              <button
                onClick={onOpenShop}
                className="flex items-center gap-1 px-1.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-red-950/70 hover:bg-red-900/80 border border-red-500/40 text-rose-200 transition-all cursor-pointer shrink-0"
                title={t.shopTitle}
              >
                <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-tr from-red-800 via-red-500 to-red-400 border border-rose-300 shadow-sm flex items-center justify-center shrink-0">
                  <div className="w-1 h-1 rounded-full bg-red-950/70" />
                </div>
                <span className="text-[9.5px] sm:text-xs font-extrabold text-white font-mono tabular-nums">
                  {cytesBalance}
                </span>
              </button>
            </div>

            {/* 2. Current Anatomical Organ, Cells & Timer */}
            <div className="flex items-center gap-1 text-[8.5px] sm:text-[10.5px] font-mono text-neutral-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-black/65 border border-white/10 backdrop-blur-sm max-w-full flex-wrap">
              <span className="text-rose-300 font-bold flex items-center gap-0.5 truncate max-w-full">
                <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                <span className="font-sans font-semibold truncate">{currentOrgan}</span>
              </span>
              <span className="text-neutral-500">·</span>
              <span className="flex items-center gap-0.5">
                <span className="text-emerald-400 font-bold">{stats ? stats.cellsCount : 1}</span> {t.cells}
              </span>
              <span className="text-neutral-500">·</span>
              <span className="flex items-center gap-0.5 text-cyan-300 font-bold">
                <Clock className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span>{formatTime(stats?.timeAliveSec || 0)}</span>
              </span>
            </div>

            {/* 3. CONQUISTAR TERRITORIO Button */}
            {canConquer && (
              <button
                onClick={onConquerTerritory}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 font-black text-[9px] sm:text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(16,185,129,0.65)] border border-emerald-300 animate-pulse transition-all active:scale-95 cursor-pointer max-w-full"
                title={t.conquerDesc}
              >
                <Flag className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current text-neutral-950 shrink-0" />
                <div className="flex flex-col text-left leading-tight min-w-0">
                  <span className="truncate">{t.conquerBtn}</span>
                  <span className="hidden sm:inline text-[8px] text-neutral-900 font-mono font-bold lowercase truncate">
                    {t.conquerExtraCytes}
                  </span>
                </div>
              </button>
            )}

            {/* 4. Anatomical Dual Body Radar */}
            <div className="flex flex-col items-start gap-0.5">
              <button
                onClick={handleToggleRadar}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 hover:bg-black/95 border border-rose-500/40 text-rose-300 text-[8.5px] sm:text-[10px] font-bold backdrop-blur-md cursor-pointer transition-all shadow-md active:scale-95"
                title={isRadarOpen ? t.radarMinimizeBtn : t.radarToggleBtn}
              >
                <Compass className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400 shrink-0" />
                <span className="truncate">{isRadarOpen ? t.capillaryRadar : t.radarToggleBtn}</span>
                {isRadarOpen ? (
                  <ChevronUp className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                )}
              </button>

              {isRadarOpen && (
                <div className="p-1 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md shadow-xl flex flex-col items-center animate-fade-in relative">
                  <div className="relative" style={{ width: mapWidth, height: mapHeight }}>
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

                      <rect width={mapWidth} height={mapHeight} rx="8" fill="#060103" stroke="#3b0712" strokeWidth="1.2" />

                      <line x1={mapWidth * 0.28} y1={mapHeight * 0.16} x2={mapWidth * 0.72} y2={mapHeight * 0.16} stroke="#dc2626" strokeWidth="2" opacity="0.6" />
                      <line x1={mapWidth * 0.28} y1={mapHeight * 0.42} x2={mapWidth * 0.72} y2={mapHeight * 0.42} stroke="#ef4444" strokeWidth="3" opacity="0.7" />
                      <line x1={mapWidth * 0.28} y1={mapHeight * 0.72} x2={mapWidth * 0.72} y2={mapHeight * 0.72} stroke="#9333ea" strokeWidth="2.5" opacity="0.6" />

                      <g transform={`translate(${mapWidth * 0.28}, ${mapHeight * 0.5}) scale(${isMobile ? 0.28 : 0.44})`}>
                        <ellipse cx="0" cy="-85" rx="20" ry="24" fill="url(#bodyAntGrad)" stroke="#f43f5e" strokeWidth="1.2" />
                        <ellipse cx="0" cy="-22" rx="36" ry="34" fill="url(#bodyAntGrad)" stroke="#f43f5e" strokeWidth="1.2" />
                        <ellipse cx="0" cy="28" rx="30" ry="26" fill="url(#bodyAntGrad)" stroke="#f43f5e" strokeWidth="1.2" />
                        <path d="M-34 -36 Q-64 -10 -72 32" stroke="#be123c" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.8" />
                        <path d="M34 -36 Q64 -10 72 32" stroke="#be123c" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.8" />
                        <path d="M-15 48 Q-22 90 -20 125" stroke="#be123c" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.8" />
                        <path d="M15 48 Q22 90 20 125" stroke="#be123c" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.8" />
                        <line x1="0" y1="-85" x2="0" y2="48" stroke="#ef4444" strokeWidth="3" />
                      </g>

                      <g transform={`translate(${mapWidth * 0.72}, ${mapHeight * 0.5}) scale(${isMobile ? 0.28 : 0.44})`}>
                        <ellipse cx="0" cy="-85" rx="20" ry="24" fill="url(#bodyPostGrad)" stroke="#818cf8" strokeWidth="1.2" />
                        <ellipse cx="0" cy="-22" rx="36" ry="34" fill="url(#bodyPostGrad)" stroke="#818cf8" strokeWidth="1.2" />
                        <ellipse cx="0" cy="28" rx="30" ry="26" fill="url(#bodyPostGrad)" stroke="#818cf8" strokeWidth="1.2" />
                        <path d="M-34 -36 Q-64 -10 -72 32" stroke="#4338ca" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.8" />
                        <path d="M34 -36 Q64 -10 72 32" stroke="#4338ca" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.8" />
                        <path d="M-15 48 Q-22 90 -20 125" stroke="#4338ca" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.8" />
                        <path d="M15 48 Q22 90 20 125" stroke="#4338ca" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.8" />
                        <line x1="0" y1="-85" x2="0" y2="48" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="3 3" />
                      </g>

                      <text x={mapWidth * 0.28} y={mapHeight - 3} textAnchor="middle" fill="#fca5a5" fontSize="6" fontWeight="bold">
                        {t.anteriorLabel}
                      </text>
                      <text x={mapWidth * 0.72} y={mapHeight - 3} textAnchor="middle" fill="#c4b5fd" fontSize="6" fontWeight="bold">
                        {t.posteriorLabel}
                      </text>
                    </svg>

                    {ANATOMICAL_ORGANS.map((organ) => {
                      const ox = mapCenterX + organ.x * mapScaleX;
                      const oy = mapCenterY + organ.y * mapScaleY;
                      const isConquered = profileStorage.isOrganConquered(organ.id);
                      return (
                        <div
                          key={organ.id}
                          className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${ox}px`,
                            top: `${oy}px`,
                            backgroundColor: isConquered ? '#34d399' : organ.color,
                            boxShadow: isConquered ? '0 0 8px #10b981' : `0 0 5px ${organ.glowColor}`,
                          }}
                          title={organ.name}
                        />
                      );
                    })}

                    <div
                      className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 bg-cyan-400 border border-purple-400 shadow-[0_0_8px_#06b6d4] animate-pulse"
                      style={{
                        left: `${mapCenterX + SECRET_ZONE_X * mapScaleX}px`,
                        top: `${mapCenterY + SECRET_ZONE_Y * mapScaleY}px`,
                      }}
                      title={t.hiddenCrypt}
                    />

                    {otherMicrobes.map((m, i) => {
                      const mx = Math.max(4, Math.min(mapWidth - 4, mapCenterX + m.x * mapScaleX));
                      const my = Math.max(4, Math.min(mapHeight - 4, mapCenterY + m.y * mapScaleY));
                      if (m.isKing) {
                        return (
                          <div
                            key={`king_radar_${i}`}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                            style={{ left: `${mx}px`, top: `${my}px` }}
                          >
                            <Crown className="w-3 h-3 text-amber-400 drop-shadow-[0_0_5px_#fbbf24] animate-bounce" />
                          </div>
                        );
                      }
                      return (
                        <div
                          key={i}
                          className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 ${
                            m.isBig ? 'w-1.5 h-1.5 bg-yellow-400' : 'w-1 h-1 bg-neutral-400'
                          }`}
                          style={{ left: `${mx}px`, top: `${my}px` }}
                        />
                      );
                    })}

                    {antibodies.map((ab, i) => (
                      <div
                        key={`ab_${i}`}
                        className="absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 bg-rose-500 animate-ping"
                        style={{
                          left: `${Math.max(4, Math.min(mapWidth - 4, mapCenterX + ab.x * mapScaleX))}px`,
                          top: `${Math.max(4, Math.min(mapHeight - 4, mapCenterY + ab.y * mapScaleY))}px`,
                        }}
                      />
                    ))}

                    <div
                      className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-emerald-400 shadow-[0_0_10px_#34d399] z-20"
                      style={{ left: `${playerMapX}px`, top: `${playerMapY}px` }}
                    >
                      {kingPos?.isPlayer ? (
                        <Crown className="w-2.5 h-2.5 text-amber-400 -translate-y-2 -translate-x-0.5 animate-bounce" />
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-emerald-500 m-auto mt-0.5 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. BATTLE MODE: Estado de Tratamiento & Paciente (Mutually exclusive with Radar on mobile so nothing overlaps!) */}
            {isTeamMode && hostStatus && (
              <div className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-black/85 border border-cyan-500/40 backdrop-blur-md shadow-2xl w-[158px] sm:w-[255px] max-w-full animate-fade-in text-left overflow-hidden">
                <div className="flex items-center justify-between gap-1">
                  <button
                    onClick={handleToggleHostStatus}
                    className="flex items-center gap-1 min-w-0 flex-1 text-left cursor-pointer"
                  >
                    <HeartPulse className="w-3 h-3 text-rose-400 animate-pulse shrink-0" />
                    <span className="text-[8px] sm:text-[10.5px] font-black text-white uppercase tracking-wider truncate">
                      {t.treatmentAndPatientStatusTitle}
                    </span>
                  </button>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {onOpenBattleTutorial && (
                      <button
                        onClick={onOpenBattleTutorial}
                        className="p-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[9px] font-bold cursor-pointer"
                        title={t.battleTutorialBtn}
                      >
                        <HelpCircle className="w-2.5 h-2.5" />
                      </button>
                    )}
                    <button
                      onClick={handleToggleHostStatus}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      {isHostStatusOpen ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                    </button>
                  </div>
                </div>

                {/* Compact 1-line summary when collapsed so mobile players always see patient health & quick treatment toggle */}
                {!isHostStatusOpen && (
                  <div
                    onClick={handleToggleHostStatus}
                    className="mt-1 pt-1 border-t border-white/10 flex items-center justify-between text-[8px] font-mono cursor-pointer"
                  >
                    <span className={hostStatus.health < 35 ? 'text-rose-400 font-black animate-pulse' : 'text-emerald-300 font-bold'}>
                      ♥ {hostStatus.health.toFixed(0)}%
                    </span>
                    <span className="text-amber-300 font-bold">{hostStatus.temperature}°C</span>
                    <span className="text-cyan-300 underline font-sans font-bold flex items-center gap-0.5">
                      <Pill className="w-2 h-2" />
                      +
                    </span>
                  </div>
                )}

                {isHostStatusOpen && (
                  <div className="mt-1 pt-1 border-t border-white/10 space-y-1.5 text-[8.5px] sm:text-[10px]">
                    <div>
                      <div className="flex items-center justify-between font-mono font-bold text-neutral-300 mb-0.5">
                        <span className="text-rose-300 truncate">{t.humanHealth}:</span>
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

                    <div className="grid grid-cols-3 gap-1 font-mono text-[7.5px] sm:text-[8px]">
                      <div className="p-0.5 sm:p-1 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center">
                        <span className="text-neutral-400 flex items-center gap-0.5"><Thermometer className="w-2 h-2 text-amber-400" /> {t.humanTemperature.slice(0, 3)}</span>
                        <span className={`font-black ${hostStatus.temperature >= 38.5 ? 'text-rose-400' : 'text-amber-300'}`}>
                          {hostStatus.temperature}°
                        </span>
                      </div>
                      <div className="p-0.5 sm:p-1 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center">
                        <span className="text-neutral-400 flex items-center gap-0.5"><Droplets className="w-2 h-2 text-cyan-400" /> {t.humanHydration.slice(0, 3)}</span>
                        <span className="font-black text-cyan-300">{hostStatus.hydration}%</span>
                      </div>
                      <div className="p-0.5 sm:p-1 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center">
                        <span className="text-neutral-400 flex items-center gap-0.5"><Flame className="w-2 h-2 text-yellow-400" /> ATP</span>
                        <span className="font-black text-yellow-300">{hostStatus.energyATP}%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between font-mono font-bold text-neutral-300 mb-0.5">
                        <span className="text-lime-300 truncate">{t.pusLevelLabel}:</span>
                        <span className="text-lime-400">{hostStatus.pusLevel.toFixed(0)} ml</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-yellow-400 to-lime-500"
                          style={{ width: `${Math.max(0, Math.min(100, hostStatus.pusLevel))}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-1 sm:p-1.5 rounded-xl bg-neutral-900/90 border border-cyan-500/30 space-y-0.5">
                      <div className="flex items-center justify-between text-[7.5px] sm:text-[8px] font-bold">
                        <span className="text-cyan-300 flex items-center gap-1 uppercase truncate">
                          <Pill className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{t.activeTreatmentLabel}</span>
                        </span>
                        {hostStatus.activeTreatment && (
                          <span className="font-mono font-black text-emerald-300 shrink-0">
                            {hostStatus.activeTreatment.remainingTime.toFixed(1)}s
                          </span>
                        )}
                      </div>
                      {hostStatus.activeTreatment ? (
                        <div className="text-[8.5px] sm:text-[9px] font-black text-white flex items-center gap-1 truncate">
                          <Pill className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{hostStatus.activeTreatment.name}</span>
                        </div>
                      ) : (
                        <div className="text-[7.5px] sm:text-[8px] text-neutral-400 italic truncate">
                          {t.noActiveTreatmentLabel}
                        </div>
                      )}
                    </div>

                    {onAdministerTreatment && (
                      <div className="pt-0.5">
                        <div className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider text-neutral-400 mb-1 flex items-center gap-1">
                          <Syringe className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{t.administerTreatmentLabel}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {quickTreatments.map((qt) => (
                            <button
                              key={qt.type}
                              onClick={() => onAdministerTreatment(qt.type)}
                              className={`px-1 py-0.5 rounded-lg border text-[7.5px] sm:text-[8px] font-extrabold truncate transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-0.5 ${qt.color}`}
                              title={qt.label}
                            >
                              <Pill className="w-2 h-2 shrink-0" />
                              <span className="truncate">{qt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT STACK: Quick Controls & Compact Non-Overflowing Leaderboard */}
          <div className="flex flex-col items-end gap-1 sm:gap-1.5 pointer-events-auto max-w-[50vw] sm:max-w-[260px] shrink-0">
            {/* Quick HUD Navigation Header */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-end max-w-full">
              {onOpenShare && (
                <button
                  onClick={onOpenShare}
                  className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-black/65 hover:bg-black/85 border border-white/10 text-rose-300 transition-colors backdrop-blur-md cursor-pointer"
                  title={t.shareBtn}
                >
                  <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}

              <button
                onClick={onOpenShop}
                className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-black/65 hover:bg-black/85 border border-white/10 text-rose-300 transition-colors backdrop-blur-md cursor-pointer"
                title={t.shopBtn}
              >
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>

              <button
                onClick={onOpenTutorial}
                className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-black/65 hover:bg-black/85 border border-white/10 text-neutral-200 transition-colors backdrop-blur-md cursor-pointer"
                title={t.tutorialBtn}
              >
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>

              <button
                onClick={onToggleMute}
                className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-black/65 hover:bg-black/85 border border-white/10 text-neutral-200 transition-colors backdrop-blur-md cursor-pointer"
                title={isMuted ? t.soundOff : t.soundOn}
              >
                {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />}
              </button>

              <button
                onClick={onPause}
                className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-black/65 hover:bg-black/85 border border-white/10 text-neutral-200 transition-colors backdrop-blur-md cursor-pointer"
                title={t.controlPause}
              >
                <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>

              {onOpenReport && (
                <button
                  onClick={onOpenReport}
                  className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-rose-950/65 hover:bg-rose-900/85 border border-rose-500/40 text-rose-300 transition-colors backdrop-blur-md cursor-pointer"
                  title={t.reportBtn}
                >
                  <Flag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}

              {onOpenDevPanel && (
                <button
                  onClick={onOpenDevPanel}
                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-amber-950/80 hover:bg-amber-900/90 border border-amber-500/50 text-amber-300 transition-colors backdrop-blur-md cursor-pointer flex items-center gap-0.5 sm:gap-1 font-black text-[8.5px] sm:text-xs"
                  title={t.devPanelTitle}
                >
                  <Shield className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span>{t.devOpenPanelBtn}</span>
                </button>
              )}
            </div>

            {/* Compact Leaderboard: Kept visible on phones without taking excessive space, showing full names without ellipsis */}
            <div className="w-[148px] sm:w-64 max-w-full p-1 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-neutral-950/90 via-black/85 to-neutral-950/90 border border-amber-500/40 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.65)] text-xs overflow-hidden">
              <div
                onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
                className="flex items-center justify-between pb-0.5 sm:pb-1 mb-0.5 sm:mb-1 border-b border-amber-500/20 font-black text-amber-200 cursor-pointer select-none gap-1"
                title={t.foldTable}
              >
                <span className="flex items-center gap-1 text-[8.5px] sm:text-xs truncate min-w-0">
                  <Crown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
                  <span className="truncate tracking-wide">{isTeamMode ? t.leaderboardFaction : t.leadersTitle}</span>
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="hidden sm:inline text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300">
                    {t.podiumTitle}
                  </span>
                  {isLeaderboardOpen ? (
                    <ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400" />
                  )}
                </div>
              </div>

              {isLeaderboardOpen && (
                <>
                  {/* Visual Top 3 Podium Bars: Shown on larger screens (`hidden sm:grid`) so phone screens stay ultra-compact */}
                  {leaderboard.length >= 1 && (
                    <div className="hidden sm:grid grid-cols-3 gap-1 items-end pt-0.5 pb-1 mb-1 border-b border-white/10 px-0.5">
                      {/* #2 Silver */}
                      <div className="flex flex-col items-center min-w-0">
                        {leaderboard[1] ? (
                          <>
                            <span className="text-[9px] font-bold text-slate-200 break-words leading-tight w-full text-center">
                              {leaderboard[1].name}
                            </span>
                            <span className="text-[7.5px] font-mono font-black text-slate-300">
                              {leaderboard[1].mass}
                            </span>
                            <div className="w-full h-4 mt-0.5 rounded-t-md bg-gradient-to-t from-slate-700/80 to-slate-400/40 border-t border-x border-slate-300/50 flex items-center justify-center">
                              <span className="text-[7.5px] font-black text-slate-100">#2</span>
                            </div>
                          </>
                        ) : (
                          <div className="h-6" />
                        )}
                      </div>

                      {/* #1 Gold Crown */}
                      <div className="flex flex-col items-center min-w-0">
                        <Crown className="w-3 h-3 text-amber-400 animate-bounce mb-0.5 shrink-0 drop-shadow-[0_0_4px_#fbbf24]" />
                        <span className="text-[9.5px] font-black text-amber-200 break-words leading-tight w-full text-center">
                          {leaderboard[0].name}
                        </span>
                        <span className="text-[8px] font-mono font-black text-amber-300">
                          {leaderboard[0].mass}
                        </span>
                        <div className="w-full h-6 mt-0.5 rounded-t-md bg-gradient-to-t from-amber-600/80 via-amber-500/50 to-yellow-300/40 border-t border-x border-amber-300/80 shadow-[0_0_10px_rgba(251,191,36,0.3)] flex items-center justify-center">
                          <span className="text-[8px] font-black text-amber-100">#1</span>
                        </div>
                      </div>

                      {/* #3 Bronze */}
                      <div className="flex flex-col items-center min-w-0">
                        {leaderboard[2] ? (
                          <>
                            <span className="text-[9px] font-bold text-amber-600/90 break-words leading-tight w-full text-center">
                              {leaderboard[2].name}
                            </span>
                            <span className="text-[7.5px] font-mono font-black text-amber-500">
                              {leaderboard[2].mass}
                            </span>
                            <div className="w-full h-3.5 mt-0.5 rounded-t-md bg-gradient-to-t from-amber-900/80 to-orange-600/40 border-t border-x border-amber-500/50 flex items-center justify-center">
                              <span className="text-[7.5px] font-black text-amber-200">#3</span>
                            </div>
                          </>
                        ) : (
                          <div className="h-5" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ranked List Rows Showing Full Names on Phones Without Truncation */}
                  <div className="space-y-0.5 max-h-24 sm:max-h-40 overflow-y-auto overflow-x-hidden pr-0.5">
                    {leaderboard.slice(0, isMobile ? 4 : 10).map((entry, idx) => {
                      const isLeader = entry.hasCrown || idx === 0;
                      const rankBadgeClass =
                        idx === 0
                          ? 'bg-amber-500/30 text-amber-200 border-amber-400/60'
                          : idx === 1
                          ? 'bg-slate-400/25 text-slate-200 border-slate-300/50'
                          : idx === 2
                          ? 'bg-orange-600/25 text-amber-300 border-amber-500/50'
                          : 'bg-white/5 text-neutral-400 border-white/10';
                      const massPct = Math.max(8, Math.min(100, Math.round((entry.mass / topMass) * 100)));

                      return (
                        <div
                          key={entry.id || idx}
                          className={`relative overflow-hidden flex items-center justify-between gap-1 px-1 sm:px-1.5 py-0.5 rounded-md sm:rounded-lg border ${
                            entry.isPlayer
                              ? 'bg-emerald-500/25 text-emerald-200 font-bold border-emerald-400/50'
                              : idx < 3
                              ? 'bg-white/[0.04] border-white/10 text-neutral-100'
                              : 'border-transparent text-neutral-300'
                          }`}
                        >
                          <div
                            className={`absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-300 ${
                              entry.isPlayer
                                ? 'bg-emerald-500/15'
                                : idx === 0
                                ? 'bg-amber-500/15'
                                : idx === 1
                                ? 'bg-slate-400/10'
                                : idx === 2
                                ? 'bg-orange-500/10'
                                : 'bg-white/[0.03]'
                            }`}
                            style={{ width: `${massPct}%` }}
                          />

                          <div className="relative z-10 flex items-center gap-1 min-w-0 flex-1 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-0.5 font-mono text-[7px] sm:text-[8.5px] font-black px-1 rounded border shrink-0 ${rankBadgeClass}`}
                            >
                              {isLeader && <Crown className="w-2 h-2 text-amber-300 shrink-0" />}
                              <span>{idx + 1}</span>
                            </span>
                            <span className="break-words leading-tight text-[8px] sm:text-[10.5px] min-w-0">{entry.name}</span>
                            {(entry.isDev || (entry.isPlayer && devBadgeConfig.isDev)) && (
                              <DevBadge
                                config={(entry.devBadge as any) || devBadgeConfig}
                                size="xs"
                                tooltip={t.devBadgeTooltip}
                              />
                            )}
                          </div>
                          <span className="relative z-10 font-mono tabular-nums text-amber-300 text-[8px] sm:text-[10px] font-black shrink-0">
                            {entry.mass}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Compact King Tracker & Active Buff Pills aligned cleanly under the right stack on mobile so they never float over the center */}
            <div className="flex flex-col items-end gap-1 max-w-full pointer-events-none">
              {kingPos && (
                <div className="flex items-center justify-end animate-fade-in">
                  {kingPos.isPlayer ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)] backdrop-blur-md">
                      <Crown className="w-2.5 h-2.5 text-amber-200 animate-bounce shrink-0" />
                      <span className="text-[8px] sm:text-[10px] font-black text-rose-200 uppercase tracking-wider truncate">
                        {t.youAreTheKing}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-950/90 border border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.4)] backdrop-blur-md"
                      title={t.trackKingHint}
                    >
                      <div className="relative w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 border border-rose-300 flex items-center justify-center shrink-0">
                        <Crown className="w-2.5 h-2.5 text-amber-300" />
                        <div
                          className="absolute inset-0 flex items-start justify-center"
                          style={{
                            transform: `rotate(${Math.atan2(kingPos.y - playerPos.y, kingPos.x - playerPos.x) + Math.PI / 2}rad)`,
                          }}
                        >
                          <div className="w-0 h-0 border-l-[2.5px] border-l-transparent border-r-[2.5px] border-r-transparent border-b-[4px] border-b-amber-300 -translate-y-0.5" />
                        </div>
                      </div>
                      <span className="text-[8.5px] sm:text-[11px] font-black font-mono text-white whitespace-nowrap">
                        {Math.max(1, Math.round(Math.hypot(kingPos.x - playerPos.x, kingPos.y - playerPos.y) / 20))} {t.metersUnit}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {stats?.activeSuperpower && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/85 border border-cyan-400/70 shadow-lg backdrop-blur-md max-w-full">
                  <span className="text-[8px] sm:text-[10px] font-black uppercase text-white truncate">
                    {stats.activeSuperpower.name}
                  </span>
                  <span
                    className="text-[8px] font-mono font-black px-1 rounded text-neutral-950 shrink-0"
                    style={{ backgroundColor: stats.activeSuperpower.color }}
                  >
                    {Math.max(0, stats.activeSuperpower.remainingTime).toFixed(1)}s
                  </span>
                </div>
              )}

              {stats?.activeHormoneBuff && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/85 border border-amber-400/60 shadow-lg backdrop-blur-md max-w-full">
                  <span className="text-[8px] sm:text-[10px] font-black text-amber-200 truncate">
                    {stats.activeHormoneBuff.name}
                  </span>
                  <span
                    className="text-[8px] font-mono font-black px-1 rounded text-neutral-950 shrink-0"
                    style={{ backgroundColor: stats.activeHormoneBuff.color }}
                  >
                    {Math.max(0, stats.activeHormoneBuff.remainingTime).toFixed(1)}s
                  </span>
                </div>
              )}

              {antibodyAlert && (
                <div className="animate-bounce flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-600/90 text-white font-bold text-[8.5px] sm:text-xs border border-rose-400 shadow-lg max-w-full">
                  <ShieldAlert className="w-3 h-3 shrink-0" />
                  <span className="truncate">{t.antibodyWarning}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Directional Off-Screen Microbe Arrows */}
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
            ? 'text-rose-300 bg-rose-950/85 border-rose-500/70'
            : 'text-emerald-300 bg-emerald-950/85 border-emerald-500/70';

          return (
            <div
              key={`nearby_${idx}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-lg border backdrop-blur-md pointer-events-none ${colorClass}`}
              style={{
                left: `${edgeX}px`,
                top: `${edgeY}px`,
              }}
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="shrink-0"
                style={{ transform: `rotate(${angle + Math.PI / 2}rad)` }}
              >
                <polygon points="12,2 22,22 12,17 2,22" />
              </svg>
              <span className="text-[8px] sm:text-[10px] font-black font-mono leading-none">
                {meters}{t.metersUnit}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Controls: Eject & Split (Positioned bottom-right) */}
      <div className="fixed bottom-2.5 right-2.5 sm:bottom-6 sm:right-6 pointer-events-auto flex items-end gap-2 sm:gap-2.5 z-30">
        <button
          onClick={onEject}
          className="flex flex-col items-center justify-center w-13 h-13 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 hover:bg-amber-500/35 active:scale-95 border border-amber-400/50 text-amber-200 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
          title={t.ejectSporeHint}
        >
          <span className="text-[11px] sm:text-base font-black leading-none tracking-wide">{t.ejectBtn}</span>
          <span className="text-[8px] sm:text-[9px] text-amber-200/80 font-mono mt-0.5">[W]</span>
        </button>

        <button
          onClick={onSplit}
          className="flex flex-col items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-500/40 hover:from-emerald-500/45 hover:to-teal-400/50 active:scale-95 border border-emerald-400/60 text-emerald-200 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          title={t.splitTwoHint}
        >
          <span className="text-xs sm:text-xl font-black leading-none tracking-wide">{t.splitBtn}</span>
          <span className="text-[8px] sm:text-[9px] text-emerald-200 font-mono mt-0.5">{t.spaceKeyLabel}</span>
        </button>
      </div>
    </div>
  );
};
