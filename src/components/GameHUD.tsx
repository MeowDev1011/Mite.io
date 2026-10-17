import React from 'react';
import { Volume2, VolumeX, Pause, ShieldAlert, Sparkles, Award, BookOpen, Globe, ShoppingBag } from 'lucide-react';
import { GameStats, LeaderboardEntry } from '../game/types';
import { WORLD_RADIUS, SECRET_ZONE_X, SECRET_ZONE_Y, ANATOMICAL_ORGANS } from '../game/constants';
import { TranslationStrings, SUPPORTED_LANGUAGES } from '../i18n/languages';

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
  currentLang,
  onSelectLanguage,
  t,
  currentOrgan = 'Corazón (Aorta)',
  cytesBalance = 120,
  playerPos = { x: 0, y: 0 },
  antibodies = [],
  otherMicrobes = [],
}) => {
  // Minimap rendering dimensions
  const mapSize = 135;
  const mapCenter = mapSize / 2;
  const mapScale = (mapSize / 2 - 6) / WORLD_RADIUS;

  const playerMapX = mapCenter + playerPos.x * mapScale;
  const playerMapY = mapCenter + playerPos.y * mapScale;

  const secretMapX = mapCenter + SECRET_ZONE_X * mapScale;
  const secretMapY = mapCenter + SECRET_ZONE_Y * mapScale;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden">
      {/* Top Bar Cluster */}
      <div className="flex items-start justify-between w-full gap-2 sm:gap-4">
        {/* Left: Player Vital Metrics, Organ & Cytes */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {/* Main Mass and Rank Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-black/65 border border-white/10 backdrop-blur-md shadow-lg pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold leading-tight">
                  {t.cellularMass}
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums leading-none">
                  {stats ? stats.currentMass : 18}
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/15 mx-1" />

            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold leading-tight">
                  {t.rank}
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-300 font-mono tabular-nums leading-none">
                  #{stats ? stats.rank : 1}
                  <span className="text-xs text-neutral-400 font-normal ml-1">/ {stats ? stats.totalMicrobes : 20}</span>
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/15 mx-1" />

            {/* Cytes Red Blood Cell Coin Pill */}
            <button
              onClick={onOpenShop}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-red-950/70 hover:bg-red-900/80 border border-red-500/40 text-rose-200 transition-all cursor-pointer"
              title="Abrir Tienda Cyte"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-red-800 via-red-500 to-red-400 border border-rose-300 shadow-sm flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-950/70" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-white font-mono tabular-nums">
                {cytesBalance}
              </span>
            </button>
          </div>

          {/* Current Anatomical Organ & Submetrics */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-300 px-3 py-1 rounded-xl bg-black/45 border border-white/5 backdrop-blur-sm self-start flex-wrap">
            <span className="text-rose-300 font-bold flex items-center gap-1">
              <span>📍</span>
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
        </div>

        {/* Center Alert: Antibody Detection Warning */}
        {antibodyAlert && (
          <div className="animate-bounce flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-rose-600/90 text-white font-bold text-xs sm:text-sm border border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.7)] pointer-events-auto">
            <ShieldAlert className="w-4 h-4" />
            <span className="truncate max-w-xs sm:max-w-md">{t.antibodyWarning}</span>
          </div>
        )}

        {/* Right: Quick Controls, Language & Leaderboard */}
        <div className="flex flex-col items-end gap-2">
          {/* Quick HUD Navigation Header */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Shop Button */}
            <button
              onClick={onOpenShop}
              className="p-2 rounded-xl bg-black/55 hover:bg-black/80 border border-rose-500/30 text-rose-300 transition-colors backdrop-blur-md cursor-pointer"
              title={t.shopBtn}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            {/* Quick Tutorial Trigger */}
            <button
              onClick={onOpenTutorial}
              className="p-2 rounded-xl bg-black/55 hover:bg-black/80 border border-white/10 text-cyan-300 transition-colors backdrop-blur-md cursor-pointer"
              title={t.tutorialBtn}
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Quick Language Switch */}
            <div className="flex items-center bg-black/55 hover:bg-black/80 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white backdrop-blur-md">
              <Globe className="w-3.5 h-3.5 text-cyan-400 mr-1" />
              <select
                value={currentLang}
                onChange={(e) => onSelectLanguage(e.target.value)}
                className="bg-transparent text-white text-[11px] font-medium focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-neutral-900 text-white">
                    {l.flag} {l.code.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl bg-black/55 hover:bg-black/80 border border-white/10 text-neutral-200 transition-colors backdrop-blur-md cursor-pointer"
              title={t.soundOn}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Pause Button */}
            <button
              onClick={onPause}
              className="p-2 rounded-xl bg-black/55 hover:bg-black/80 border border-white/10 text-neutral-200 transition-colors backdrop-blur-md cursor-pointer"
              title={t.controlPause}
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          {/* Top 10 Leaderboard Panel */}
          <div className="w-44 sm:w-56 p-2.5 sm:p-3 rounded-2xl bg-black/65 border border-white/10 backdrop-blur-md shadow-xl text-xs pointer-events-auto">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 font-bold text-neutral-300">
              <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t.leadersTitle}
              </span>
            </div>
            <div className="space-y-0.5 sm:space-y-1 max-h-36 sm:max-h-44 overflow-hidden">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className={`flex items-center justify-between px-1.5 py-0.5 rounded-lg ${
                    entry.isPlayer
                      ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span className="font-mono text-[10px] text-neutral-400 w-3.5 text-right">{idx + 1}.</span>
                    <span className="truncate text-[11px] sm:text-xs">{entry.name}</span>
                  </div>
                  <span className="font-mono tabular-nums text-neutral-400 text-[11px] shrink-0">
                    {entry.mass}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: Anatomical Human Minimap & Tactile Action Buttons */}
      <div className="flex items-end justify-between w-full">
        {/* Anatomical Human Body Radar */}
        <div className="p-2 rounded-2xl bg-black/65 border border-white/10 backdrop-blur-md shadow-lg pointer-events-auto flex flex-col items-center">
          <div className="relative" style={{ width: mapSize, height: mapSize }}>
            {/* Human body silhouette SVG representation */}
            <svg width={mapSize} height={mapSize} className="absolute inset-0">
              {/* Outer boundary */}
              <circle
                cx={mapCenter}
                cy={mapCenter}
                r={mapSize / 2 - 5}
                fill="#120306"
                stroke="#6b1222"
                strokeWidth="2"
              />
              {/* Head contour */}
              <ellipse cx={mapCenter} cy={mapCenter - 45} rx="16" ry="14" fill="#2e1065" opacity="0.6" />
              {/* Torso & Lungs */}
              <ellipse cx={mapCenter} cy={mapCenter - 14} rx="26" ry="20" fill="#450a0a" opacity="0.6" />
              {/* Abdomen & Intestines */}
              <ellipse cx={mapCenter} cy={mapCenter + 15} rx="22" ry="18" fill="#14532d" opacity="0.5" />
              {/* Pelvis & Legs */}
              <ellipse cx={mapCenter} cy={mapCenter + 42} rx="18" ry="16" fill="#881337" opacity="0.5" />
            </svg>

            {/* Anatomical Organ Markers */}
            {ANATOMICAL_ORGANS.map((organ) => (
              <div
                key={organ.id}
                className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-80"
                style={{
                  left: `${mapCenter + organ.x * mapScale}px`,
                  top: `${mapCenter + organ.y * mapScale}px`,
                  backgroundColor: organ.color,
                  boxShadow: `0 0 6px ${organ.glowColor}`,
                }}
                title={organ.name}
              />
            ))}

            {/* Secret Crypt Zone Dot */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 bg-cyan-400 border border-purple-400 shadow-[0_0_8px_#06b6d4] animate-pulse"
              style={{
                left: `${secretMapX}px`,
                top: `${secretMapY}px`,
              }}
              title="Cripta Linfática Oculta"
            />

            {/* Other Microbes */}
            {otherMicrobes.map((m, i) => (
              <div
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                  m.isBig ? 'bg-orange-500 shadow-[0_0_4px_#f97316]' : 'bg-cyan-400'
                }`}
                style={{
                  left: `${mapCenter + m.x * mapScale}px`,
                  top: `${mapCenter + m.y * mapScale}px`,
                }}
              />
            ))}

            {/* Patrol Antibodies (Red Spiky Dots) */}
            {antibodies.map((ab, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 bg-rose-500 animate-ping opacity-75"
                style={{
                  left: `${mapCenter + ab.x * mapScale}px`,
                  top: `${mapCenter + ab.y * mapScale}px`,
                }}
              />
            ))}

            {/* Player Marker (Glowing Green Ring) */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 bg-emerald-400 border border-white shadow-[0_0_8px_#34d399]"
              style={{
                left: `${playerMapX}px`,
                top: `${playerMapY}px`,
              }}
            />
          </div>
          <span className="text-[9px] font-bold text-rose-300/80 mt-1 uppercase tracking-wider">
            {t.capillaryRadar}
          </span>
        </div>

        {/* Action Buttons for Touch / Mobile & Desktop Hints */}
        <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto">
          {/* Eject Spore Button */}
          <button
            onClick={onEject}
            className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 hover:bg-amber-500/35 active:scale-95 border border-amber-500/40 text-amber-300 backdrop-blur-md shadow-lg transition-all cursor-pointer"
            title="Eyectar Espora / Masa [W]"
          >
            <span className="text-sm sm:text-base font-black leading-none">{t.ejectBtn}</span>
            <span className="text-[10px] text-amber-200/80 font-mono mt-0.5">[W]</span>
          </button>

          {/* Split / Fission Button */}
          <button
            onClick={onSplit}
            className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-500/40 hover:from-emerald-500/45 hover:to-teal-400/50 active:scale-95 border border-emerald-400/60 text-emerald-200 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            title="Dividirse en dos [ESPACIO]"
          >
            <span className="text-base sm:text-xl font-black leading-none tracking-wide">{t.splitBtn}</span>
            <span className="text-[10px] text-emerald-200 font-mono mt-0.5">[ESPACIO]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
