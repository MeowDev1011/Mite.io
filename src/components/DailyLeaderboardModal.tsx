import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  X,
  RefreshCw,
  Clock,
  Crown,
  Users,
  Cpu,
  Shield,
  Skull,
  Sparkles,
  Award,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { CyteCoinSvg } from './BioSvgIcons';
import { DevBadge } from './DevBadge';
import { profileStorage } from '../storage/profileStorage';
import { TranslationStrings, detectDeviceLanguage } from '../i18n/languages';

export interface DailyRankEntry {
  id: string;
  name: string;
  isBot: boolean;
  personality?: string;
  faction?: 'immune' | 'pathogen' | 'neutral';
  cytes: number;
  survivalSec: number;
  maxMass: number;
  isDev?: boolean;
  devBadge?: any;
  updatedAt: number;
}

interface DailyLeaderboardResponse {
  success: boolean;
  dayKey: string;
  nextResetAtMs: number;
  players: DailyRankEntry[];
  bots: DailyRankEntry[];
}

interface DailyLeaderboardModalProps {
  onClose: () => void;
  t: TranslationStrings;
}

type LeagueTab = 'players' | 'bots';
type CategoryTab = 'featured' | 'cytes' | 'survival' | 'mass';

interface DailyI18nCopy {
  title: string;
  subtitle: string;
  refreshTitle: string;
  playersTab: string;
  botsTab: string;
  featuredTab: string;
  mostCytesTab: string;
  longestSurvivalTab: string;
  highestMassTab: string;
  cytesLeaderLabel: string;
  survivalLeaderLabel: string;
  massLeaderLabel: string;
  aliveSuffix: string;
  noRecordsToday: string;
  playersRankingHeader: string;
  botsRankingHeader: string;
  sortedBy: string;
  timeCol: string;
  aiLabel: string;
  personalities: Record<string, string>;
}

function getDailyCopy(lang: string, cytesWord: string, massWord: string): DailyI18nCopy {
  const code = (lang || 'es').toLowerCase().slice(0, 2);
  if (code === 'en') {
    return {
      title: 'Daily 24h Leaderboard',
      subtitle: 'Featured champions of the day (resets every 24h) · Real Players (No Bots) & Bots',
      refreshTitle: 'Refresh leaderboard',
      playersTab: 'Players (No Bots)',
      botsTab: 'Bots Leaderboard',
      featuredTab: 'Featured Today',
      mostCytesTab: `Most ${cytesWord}`,
      longestSurvivalTab: 'Longest Survival',
      highestMassTab: `Highest ${massWord}`,
      cytesLeaderLabel: `${cytesWord} Leader`,
      survivalLeaderLabel: 'Longest Survival',
      massLeaderLabel: `${massWord} Record`,
      aliveSuffix: 'alive',
      noRecordsToday: 'No records yet in this 24h cycle',
      playersRankingHeader: 'Official Real Players Ranking (No Bots)',
      botsRankingHeader: 'Daily AI Personality Bots Ranking',
      sortedBy: 'Sorted by',
      timeCol: 'Time',
      aiLabel: 'AI',
      personalities: {
        sniper: 'Sniper',
        zigzagger: 'Zigzagger',
        opportunist: 'Opportunist',
        hormone_hunter: 'Hormone Hunter',
        farmer: 'Harvester',
        baiter: 'Ambusher',
        casual: 'Casual',
      },
    };
  }
  if (code === 'pt') {
    return {
      title: 'Classificação Diária 24h',
      subtitle: 'Destaques do dia (reinicia a cada 24h) · Jogadores Reais (Sem Bots) e Bots',
      refreshTitle: 'Atualizar classificação',
      playersTab: 'Jogadores (Sem Bots)',
      botsTab: 'Classificação de Bots',
      featuredTab: 'Destaques do Dia',
      mostCytesTab: `Mais ${cytesWord}`,
      longestSurvivalTab: 'Maior Sobrevivência',
      highestMassTab: `Maior ${massWord}`,
      cytesLeaderLabel: `Líder em ${cytesWord}`,
      survivalLeaderLabel: 'Maior Sobrevivência',
      massLeaderLabel: `Recorde de ${massWord}`,
      aliveSuffix: 'vivo',
      noRecordsToday: 'Sem registros neste ciclo de 24h',
      playersRankingHeader: 'Ranking Oficial de Jogadores (Sem Bots)',
      botsRankingHeader: 'Ranking Diário de Bots com Personalidade IA',
      sortedBy: 'Ordenado por',
      timeCol: 'Tempo',
      aiLabel: 'IA',
      personalities: {
        sniper: 'Franco-atirador',
        zigzagger: 'Ziguezague',
        opportunist: 'Oportunista',
        hormone_hunter: 'Caça-Hormônios',
        farmer: 'Coletor',
        baiter: 'Emboscador',
        casual: 'Casual',
      },
    };
  }
  if (code === 'fr') {
    return {
      title: 'Classement Quotidien 24h',
      subtitle: 'Champions du jour (réinitialisé toutes les 24h) · Joueurs Réels (Sans Bots) et Bots',
      refreshTitle: 'Actualiser le classement',
      playersTab: 'Joueurs (Sans Bots)',
      botsTab: 'Classement des Bots',
      featuredTab: 'À la Une',
      mostCytesTab: `Plus de ${cytesWord}`,
      longestSurvivalTab: 'Plus Longue Survie',
      highestMassTab: `Plus Grande ${massWord}`,
      cytesLeaderLabel: `Leader en ${cytesWord}`,
      survivalLeaderLabel: 'Record de Survie',
      massLeaderLabel: `Record de ${massWord}`,
      aliveSuffix: 'en vie',
      noRecordsToday: 'Aucun record dans ce cycle de 24h',
      playersRankingHeader: 'Classement Officiel des Joueurs (Sans Bots)',
      botsRankingHeader: 'Classement Quotidien des Bots IA',
      sortedBy: 'Trié par',
      timeCol: 'Temps',
      aiLabel: 'IA',
      personalities: {
        sniper: 'Tireur d’élite',
        zigzagger: 'Zigzagueur',
        opportunist: 'Opportuniste',
        hormone_hunter: 'Chasseur d’Hormones',
        farmer: 'Récolteur',
        baiter: 'Piégeur',
        casual: 'Décontracté',
      },
    };
  }
  return {
    title: 'Tabla de Clasificación Diaria',
    subtitle: 'Destacados del día (se reinicia cada 24 horas) · Jugadores Reales (Sin Bots) y Bots',
    refreshTitle: 'Actualizar clasificación',
    playersTab: 'Jugadores (Sin Bots)',
    botsTab: 'Clasificación de Bots',
    featuredTab: 'Destacados del Día',
    mostCytesTab: `Más ${cytesWord} (Moneda)`,
    longestSurvivalTab: 'Más Tiempo Sobrevivido',
    highestMassTab: 'Mayor Masa Alcanzada',
    cytesLeaderLabel: `Líder en ${cytesWord}`,
    survivalLeaderLabel: 'Mayor Supervivencia',
    massLeaderLabel: 'Récord de Masa',
    aliveSuffix: 'vivo',
    noRecordsToday: 'No hay registros todavía en este ciclo de 24 horas.',
    playersRankingHeader: 'Ranking Oficial de Jugadores (Sin Bots)',
    botsRankingHeader: 'Ranking Diario de Bots con Personalidad IA',
    sortedBy: 'Ordenado por',
    timeCol: 'Tiempo',
    aiLabel: 'IA',
    personalities: {
      sniper: 'Francotirador',
      zigzagger: 'Zigzagueante',
      opportunist: 'Oportunista',
      hormone_hunter: 'Caza-Hormonas',
      farmer: 'Recolector',
      baiter: 'Emboscador',
      casual: 'Casual',
    },
  };
}

export const DailyLeaderboardModal: React.FC<DailyLeaderboardModalProps> = ({ onClose, t }) => {
  const [leagueTab, setLeagueTab] = useState<LeagueTab>('players');
  const [categoryTab, setCategoryTab] = useState<CategoryTab>('featured');
  const [playersList, setPlayersList] = useState<DailyRankEntry[]>([]);
  const [botsList, setBotsList] = useState<DailyRankEntry[]>([]);
  const [nextResetAtMs, setNextResetAtMs] = useState<number>(() => {
    const now = Date.now();
    return (Math.floor(now / 86400000) + 1) * 86400000;
  });
  const [countdownText, setCountdownText] = useState<string>('24:00:00');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const myDeviceId = profileStorage.getDeviceId();
  const activeLang = profileStorage.getProfile().preferredLanguage || detectDeviceLanguage() || 'es';
  const copy = getDailyCopy(activeLang, t.cytes, t.massLabel);

  const fetchDailyLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leaderboard/daily');
      if (res.ok) {
        const json: DailyLeaderboardResponse = await res.json();
        if (json.success) {
          setPlayersList(Array.isArray(json.players) ? json.players : []);
          setBotsList(Array.isArray(json.bots) ? json.bots : []);
          if (typeof json.nextResetAtMs === 'number') {
            setNextResetAtMs(json.nextResetAtMs);
          }
        }
      }
    } catch {
      const prof = profileStorage.getProfile();
      setPlayersList([
        {
          id: prof.deviceId,
          name: prof.name,
          isBot: false,
          cytes: prof.cytes || 0,
          survivalSec: prof.stats?.longestSurvivalSec || 0,
          maxMass: prof.stats?.highestMass || 18,
          updatedAt: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyLeaderboard();
    const pollInterval = setInterval(fetchDailyLeaderboard, 4000);
    return () => clearInterval(pollInterval);
  }, [fetchDailyLeaderboard]);

  // Live 24-hour reset countdown clock
  useEffect(() => {
    const updateClock = () => {
      const diff = Math.max(0, nextResetAtMs - Date.now());
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');
      setCountdownText(`${hh}:${mm}:${ss}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [nextResetAtMs]);

  const formatDuration = (sec: number): string => {
    const total = Math.max(0, Math.floor(sec || 0));
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${String(secs).padStart(2, '0')}s`;
    }
    return `${secs}s`;
  };

  const activeDataset = leagueTab === 'players' ? playersList : botsList;

  const sortedByCytes = [...activeDataset].sort((a, b) => b.cytes - a.cytes || b.maxMass - a.maxMass);
  const sortedBySurvival = [...activeDataset].sort(
    (a, b) => b.survivalSec - a.survivalSec || b.maxMass - a.maxMass
  );
  const sortedByMass = [...activeDataset].sort((a, b) => b.maxMass - a.maxMass || b.cytes - a.cytes);

  const topCytesLeader = sortedByCytes[0] || null;
  const topSurvivalLeader = sortedBySurvival[0] || null;
  const topMassLeader = sortedByMass[0] || null;

  const getRankedListForCategory = (): DailyRankEntry[] => {
    if (categoryTab === 'cytes') return sortedByCytes;
    if (categoryTab === 'survival') return sortedBySurvival;
    return sortedByMass;
  };

  const rankedList = getRankedListForCategory();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md pointer-events-auto select-none font-sans animate-fade-in">
      <div className="w-full max-w-4xl max-h-[92dvh] p-3.5 sm:p-6 rounded-3xl bg-neutral-900/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.22)] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 flex-wrap shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-500/10 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wide break-words">
                  {copy.title}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black font-mono">
                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>24h: {countdownText}</span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 break-words">
                {copy.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={fetchDailyLeaderboard}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
              title={copy.refreshTitle}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* League Division Selector: Jugadores (No-Bots) vs Bots */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-3 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setLeagueTab('players')}
            className={`py-2 px-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              leagueTab === 'players'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">{copy.playersTab}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                leagueTab === 'players' ? 'bg-black/25 text-neutral-950' : 'bg-white/10 text-neutral-300'
              }`}
            >
              {playersList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLeagueTab('bots')}
            className={`py-2 px-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              leagueTab === 'bots'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-neutral-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span className="truncate">{copy.botsTab}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                leagueTab === 'bots' ? 'bg-black/25 text-neutral-950' : 'bg-white/10 text-neutral-300'
              }`}
            >
              {botsList.length}
            </span>
          </button>
        </div>

        {/* Category Sub-Tabs: Destacados, Más Cytes, Mayor Supervivencia, Mayor Masa */}
        <div className="flex items-center gap-1.5 pb-3 border-b border-white/10 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setCategoryTab('featured')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              categoryTab === 'featured'
                ? 'bg-amber-500/25 border border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{copy.featuredTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('cytes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              categoryTab === 'cytes'
                ? 'bg-rose-500/25 border border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            <CyteCoinSvg size={14} />
            <span>{copy.mostCytesTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('survival')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              categoryTab === 'survival'
                ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{copy.longestSurvivalTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryTab('mass')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              categoryTab === 'mass'
                ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{copy.highestMassTab}</span>
          </button>
        </div>

        {/* Main Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto py-3 pr-1 space-y-4">
          {/* 3 Featured Champions Spotlight Cards (shown in 'featured' view) */}
          {categoryTab === 'featured' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Card 1: Most Cytes */}
              <div
                onClick={() => setCategoryTab('cytes')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/70 via-neutral-900 to-neutral-950 border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-300">
                    <CyteCoinSvg size={14} />
                    <span>{copy.cytesLeaderLabel}</span>
                  </span>
                  <Trophy className="w-4 h-4 text-rose-400 shrink-0" />
                </div>
                {topCytesLeader ? (
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-white break-words">
                        {topCytesLeader.name}
                      </span>
                      {topCytesLeader.isDev && topCytesLeader.devBadge && (
                        <DevBadge config={topCytesLeader.devBadge} size="xs" />
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-lg font-black font-mono text-rose-300 tabular-nums">
                        {topCytesLeader.cytes.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-rose-400/90">{t.cytes}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-500">{copy.noRecordsToday}</span>
                )}
              </div>

              {/* Card 2: Longest Survival Time */}
              <div
                onClick={() => setCategoryTab('survival')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/70 via-neutral-900 to-neutral-950 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                    <Timer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{copy.survivalLeaderLabel}</span>
                  </span>
                  <Trophy className="w-4 h-4 text-cyan-400 shrink-0" />
                </div>
                {topSurvivalLeader ? (
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-white break-words">
                        {topSurvivalLeader.name}
                      </span>
                      {topSurvivalLeader.isDev && topSurvivalLeader.devBadge && (
                        <DevBadge config={topSurvivalLeader.devBadge} size="xs" />
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-lg font-black font-mono text-cyan-300 tabular-nums">
                        {formatDuration(topSurvivalLeader.survivalSec)}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-cyan-400/90">{copy.aliveSuffix}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-500">{copy.noRecordsToday}</span>
                )}
              </div>

              {/* Card 3: Highest Mass */}
              <div
                onClick={() => setCategoryTab('mass')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-neutral-900 to-neutral-950 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    <Crown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{copy.massLeaderLabel}</span>
                  </span>
                  <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                {topMassLeader ? (
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-black text-white break-words">
                        {topMassLeader.name}
                      </span>
                      {topMassLeader.isDev && topMassLeader.devBadge && (
                        <DevBadge config={topMassLeader.devBadge} size="xs" />
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-lg font-black font-mono text-emerald-300 tabular-nums">
                        {Math.round(topMassLeader.maxMass).toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-emerald-400/90">{t.massLabel}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-neutral-500">{copy.noRecordsToday}</span>
                )}
              </div>
            </div>
          )}

          {/* Ranked Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-wider text-neutral-400 flex-wrap gap-1">
              <span>
                {leagueTab === 'players' ? copy.playersRankingHeader : copy.botsRankingHeader}
              </span>
              <span>
                {copy.sortedBy}:{' '}
                {categoryTab === 'cytes'
                  ? t.cytes
                  : categoryTab === 'survival'
                  ? copy.longestSurvivalTab
                  : t.massLabel}
              </span>
            </div>

            {rankedList.length === 0 ? (
              <div className="p-8 rounded-2xl bg-black/40 border border-white/10 text-center text-xs text-neutral-400">
                {copy.noRecordsToday}
              </div>
            ) : (
              rankedList.map((entry, idx) => {
                const rank = idx + 1;
                const isMe = !entry.isBot && entry.id === myDeviceId;
                const isTop1 = rank === 1;
                const isTop2 = rank === 2;
                const isTop3 = rank === 3;

                return (
                  <div
                    key={entry.id}
                    className={`p-2.5 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-2 sm:gap-4 flex-wrap ${
                      isMe
                        ? 'bg-emerald-950/40 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : isTop1
                        ? 'bg-gradient-to-r from-amber-950/50 via-neutral-900/90 to-neutral-900/90 border-amber-400/50'
                        : isTop2
                        ? 'bg-gradient-to-r from-slate-800/50 via-neutral-900/90 to-neutral-900/90 border-slate-400/40'
                        : isTop3
                        ? 'bg-gradient-to-r from-orange-950/40 via-neutral-900/90 to-neutral-900/90 border-orange-500/40'
                        : 'bg-black/40 border-white/10'
                    }`}
                  >
                    {/* Left: Rank Medal + Full Un-Truncated Name + Badges */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black font-mono text-xs sm:text-sm shrink-0 border ${
                          isTop1
                            ? 'bg-amber-400 text-neutral-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                            : isTop2
                            ? 'bg-slate-300 text-neutral-950 border-white'
                            : isTop3
                            ? 'bg-amber-700 text-white border-amber-500'
                            : 'bg-white/5 text-neutral-400 border-white/10'
                        }`}
                      >
                        {rank <= 3 ? <Award className="w-4 h-4" /> : `#${rank}`}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-white break-words">
                            {entry.name}
                          </span>
                          {isMe && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[9px] font-black uppercase">
                              {t.youSuffix}
                            </span>
                          )}
                          {entry.isDev && entry.devBadge && (
                            <DevBadge config={entry.devBadge} size="xs" />
                          )}
                          {entry.isBot && entry.personality && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[9px] font-bold">
                              {copy.aiLabel}: {copy.personalities[entry.personality] || entry.personality}
                            </span>
                          )}
                          {entry.faction && entry.faction !== 'neutral' && (
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                entry.faction === 'immune'
                                  ? 'bg-cyan-500/15 text-cyan-300'
                                  : 'bg-rose-500/15 text-rose-300'
                              }`}
                            >
                              {entry.faction === 'immune' ? (
                                <Shield className="w-2.5 h-2.5" />
                              ) : (
                                <Skull className="w-2.5 h-2.5" />
                              )}
                              <span>{entry.faction === 'immune' ? t.defenderRole : t.pathogenRole}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: 3 Divided Stat Columns (Cytes, Tiempo Sobrevivido, Masa Máxima) */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-right">
                      {/* Cytes Column */}
                      <div
                        className={`px-2 py-1 rounded-xl border ${
                          categoryTab === 'cytes'
                            ? 'bg-rose-500/20 border-rose-400/50'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-rose-300 uppercase">
                          <CyteCoinSvg size={11} />
                          <span>{t.cytes}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-black font-mono text-white tabular-nums">
                          {entry.cytes.toLocaleString()}
                        </div>
                      </div>

                      {/* Survival Time Column */}
                      <div
                        className={`px-2 py-1 rounded-xl border ${
                          categoryTab === 'survival'
                            ? 'bg-cyan-500/20 border-cyan-400/50'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-cyan-300 uppercase">
                          <Timer className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{copy.timeCol}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-black font-mono text-white tabular-nums">
                          {formatDuration(entry.survivalSec)}
                        </div>
                      </div>

                      {/* Max Mass Column */}
                      <div
                        className={`px-2 py-1 rounded-xl border ${
                          categoryTab === 'mass' || categoryTab === 'featured'
                            ? 'bg-emerald-500/20 border-emerald-400/50'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-emerald-300 uppercase">
                          <Crown className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{t.massLabel}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-black font-mono text-white tabular-nums">
                          {Math.round(entry.maxMass).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
