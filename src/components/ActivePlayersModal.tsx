import React, { useState, useEffect } from 'react';
import { Users, X, RefreshCw, Send, Shield, Skull, MapPin } from 'lucide-react';
import { ActivePlayer } from '../game/types';
import { profileStorage } from '../storage/profileStorage';
import { InviteModal } from './InviteModal';
import { TranslationStrings } from '../i18n/languages';
import { DevBadge } from './DevBadge';

interface ActivePlayersModalProps {
  onClose: () => void;
  onInviteSent: (msg: string) => void;
  t: TranslationStrings;
}

export const ActivePlayersModal: React.FC<ActivePlayersModalProps> = ({ onClose, onInviteSent, t }) => {
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [filter, setFilter] = useState<'all' | 'immune' | 'pathogen'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<ActivePlayer | null>(null);

  const fetchActivePlayers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/players/active');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.players) {
          setPlayers(json.players);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePlayers();
    const interval = setInterval(fetchActivePlayers, 2000);
    return () => clearInterval(interval);
  }, []);

  const myDeviceId = profileStorage.getDeviceId();

  const filteredPlayers = players.filter((p) => {
    if (filter !== 'all' && p.faction !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md pointer-events-auto select-none font-sans">
        <div className="w-full max-w-3xl max-h-[90vh] p-4 sm:p-7 rounded-3xl bg-neutral-900 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-white">{t.activePlayersTitle}</h2>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                    {players.length} {t.onlineBadge}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  {t.activePlayersSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchActivePlayers}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 transition-colors cursor-pointer"
                title={t.refreshListTitle}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 pt-3 pb-2 flex-wrap shrink-0">
            <input
              type="text"
              placeholder={t.searchMicrobePlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[160px] px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />

            <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-cyan-500 text-neutral-950 font-black shadow-sm'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                {t.filterAll}
              </button>
              <button
                onClick={() => setFilter('immune')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  filter === 'immune'
                    ? 'bg-cyan-600 text-white font-black shadow-sm'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>{t.filterDefenders}</span>
              </button>
              <button
                onClick={() => setFilter('pathogen')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  filter === 'pathogen'
                    ? 'bg-rose-600 text-white font-black shadow-sm'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                <Skull className="w-3 h-3 text-rose-400" />
                <span>{t.filterPathogens}</span>
              </button>
            </div>
          </div>

          {/* Players List Grid */}
          <div className="overflow-y-auto py-2 flex-1 pr-1 space-y-2.5">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs">
                {t.noActiveMicrobesFound}
              </div>
            ) : (
              filteredPlayers.map((player) => {
                const isImmune = player.faction === 'immune';
                const isMe = player.deviceId === myDeviceId;
                return (
                  <div
                    key={player.deviceId}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 flex-wrap ${
                      isMe
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-black/40 border-white/10 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Faction & Status Badge */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 ${
                          isImmune
                            ? 'bg-cyan-950/60 border-cyan-400/50 text-cyan-300'
                            : 'bg-rose-950/60 border-rose-400/50 text-rose-300'
                        }`}
                      >
                        {isImmune ? <Shield className="w-5 h-5" /> : <Skull className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white break-words">
                            {player.name} {isMe && <span className="text-emerald-400 font-bold">{t.youSuffix}</span>}
                          </h4>
                          {player.isDev && player.devBadge && (
                            <DevBadge config={player.devBadge as any} size="sm" tooltip={t.devBadgeTooltip} />
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                              isImmune
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                            }`}
                          >
                            {isImmune ? t.defenderRole : t.pathogenRole}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-black uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            {t.onlineBadge}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 text-rose-300 font-sans">
                            <MapPin className="w-3 h-3 text-rose-400" />
                            <span>{player.currentOrgan}</span>
                          </span>
                          <span>·</span>
                          <span>
                            {t.massLabel}: <strong className="text-white">{player.mass}</strong>
                          </span>
                          <span>·</span>
                          <span className="text-[10px] text-neutral-500 truncate">ID: {player.deviceId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Invite Button (for other connected players) or Live Self Status Badge */}
                    {isMe ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider shrink-0">
                        ● {t.onlineBadge} {t.youSuffix}
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedTarget(player)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all transform active:scale-95 cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t.inviteToRoomBtn}</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Nested Invite Configuration Dialog */}
      {selectedTarget && (
        <InviteModal
          targetPlayer={selectedTarget}
          onClose={() => setSelectedTarget(null)}
          onInviteSent={(msg) => {
            onInviteSent(msg);
            setSelectedTarget(null);
          }}
          t={t}
        />
      )}
    </>
  );
};
