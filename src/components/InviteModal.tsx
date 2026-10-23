import React, { useState } from 'react';
import { X, Send, Users, Shield, Skull, Crown, Bot } from 'lucide-react';
import { ActivePlayer, GameMode, Faction } from '../game/types';
import { profileStorage } from '../storage/profileStorage';
import { TranslationStrings } from '../i18n/languages';

interface InviteModalProps {
  targetPlayer: ActivePlayer;
  onClose: () => void;
  onInviteSent: (msg: string) => void;
  t: TranslationStrings;
}

export const InviteModal: React.FC<InviteModalProps> = ({ targetPlayer, onClose, onInviteSent, t }) => {
  const profile = profileStorage.getProfile();
  const [mode, setMode] = useState<GameMode | 'bots'>('team');
  const [factionRule, setFactionRule] = useState<'host_decides' | 'guest_chooses'>('host_decides');
  const [hostFaction, setHostFaction] = useState<Faction>('immune');
  const [guestFaction, setGuestFaction] = useState<Faction>('pathogen');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDeviceId: profileStorage.getDeviceId(),
          fromPlayerName: profile.name,
          toDeviceId: targetPlayer.deviceId,
          toPlayerName: targetPlayer.name,
          mode: mode === 'bots' ? 'bots' : mode,
          factionRule,
          hostFaction,
          guestFaction: factionRule === 'host_decides' ? guestFaction : undefined,
          roomId: `room-${mode}-${Date.now().toString(36)}`,
        }),
      });

      if (res.ok) {
        onInviteSent(`${targetPlayer.name} — ${t.inviteSentSuccess}`);
        onClose();
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto select-none font-sans">
      <div className="w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-neutral-900 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{t.inviteToRoomBtn}</h3>
              <p className="text-xs text-neutral-400">
                {t.invitingPlayerLabel} <strong className="text-cyan-300">{targetPlayer.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 py-4 overflow-y-auto max-h-[70vh] pr-1">
          {/* Step 1: Mode Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 block">
              {t.selectGameModeStep}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('team')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  mode === 'team'
                    ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">0 BOTs</span>
                </div>
                <div>
                  <span className="text-xs font-black text-white block">{t.modeTeam}</span>
                  <span className="text-[10px] text-neutral-400 leading-tight">{t.humansOnly2Factions}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('ffa')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  mode === 'ffa'
                    ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">0 BOTs</span>
                </div>
                <div>
                  <span className="text-xs font-black text-white block">{t.modeFfa}</span>
                  <span className="text-[10px] text-neutral-400 leading-tight">{t.humansOnlyFfa}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('bots')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  mode === 'bots'
                    ? 'bg-purple-950/50 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">BOTs</span>
                </div>
                <div>
                  <span className="text-xs font-black text-white block">{t.modeBots}</span>
                  <span className="text-[10px] text-neutral-400 leading-tight">{t.practiceWithAi}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Faction Options (for Team Battle) */}
          {mode === 'team' && (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-3 animate-fade-in">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                {t.factionSelectionStep}
              </label>

              {/* Faction Rule Toggle */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFactionRule('host_decides')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    factionRule === 'host_decides'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-neutral-400'
                  }`}
                >
                  <span className="block font-black">{t.hostAssignsFactions}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">{t.hostAssignsDesc}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFactionRule('guest_chooses')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    factionRule === 'guest_chooses'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-neutral-400'
                  }`}
                >
                  <span className="block font-black">{t.guestChoosesFaction}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">{t.guestChoosesDesc}</span>
                </button>
              </div>

              {/* Host Faction Picker */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-neutral-400 font-medium">{t.yourHostFactionLabel}</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHostFaction('immune');
                      if (factionRule === 'host_decides') setGuestFaction('pathogen');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      hostFaction === 'immune'
                        ? 'bg-cyan-600 text-white border-cyan-300 shadow-md'
                        : 'bg-white/5 border-white/10 text-neutral-400'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{t.factionImmuneTitle}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHostFaction('pathogen');
                      if (factionRule === 'host_decides') setGuestFaction('immune');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      hostFaction === 'pathogen'
                        ? 'bg-rose-600 text-white border-rose-300 shadow-md'
                        : 'bg-white/5 border-white/10 text-neutral-400'
                    }`}
                  >
                    <Skull className="w-3.5 h-3.5" />
                    <span>{t.factionPathogenTitle}</span>
                  </button>
                </div>
              </div>

              {/* Guest Faction Picker (if host_decides) */}
              {factionRule === 'host_decides' && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {t.guestFactionLabel} ({targetPlayer.name}):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGuestFaction('immune')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        guestFaction === 'immune'
                          ? 'bg-cyan-600 text-white border-cyan-300 shadow-md'
                          : 'bg-white/5 border-white/10 text-neutral-400'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{t.factionImmuneTitle}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGuestFaction('pathogen')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        guestFaction === 'pathogen'
                          ? 'bg-rose-600 text-white border-rose-300 shadow-md'
                          : 'bg-white/5 border-white/10 text-neutral-400'
                      }`}
                    >
                      <Skull className="w-3.5 h-3.5" />
                      <span>{t.factionPathogenTitle}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>

          <button
            type="button"
            disabled={isSending}
            onClick={handleSend}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? t.sendingInviteBtn : t.sendOfficialInviteBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
