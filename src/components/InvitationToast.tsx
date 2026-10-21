import React, { useState } from 'react';
import { Users, Shield, Skull, Crown, Check, X, Bell } from 'lucide-react';
import { RoomInvitation, Faction } from '../game/types';

interface InvitationToastProps {
  invitation: RoomInvitation | null;
  onAccept: (invitation: RoomInvitation, selectedFaction?: Faction) => void;
  onDecline: (invitationId: string) => void;
}

export const InvitationToast: React.FC<InvitationToastProps> = ({
  invitation,
  onAccept,
  onDecline,
}) => {
  const [chosenFaction, setChosenFaction] = useState<Faction>('immune');

  if (!invitation) return null;

  const isTeam = invitation.mode === 'team';
  const allowsChoice = invitation.factionRule === 'guest_chooses';

  const modeTitle =
    invitation.mode === 'team'
      ? 'Batalla en Equipo (Solo Humanos)'
      : invitation.mode === 'ffa'
      ? 'Multijugador Normal FFA (Solo Humanos)'
      : 'Sala con BOTs';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md p-4 rounded-3xl bg-neutral-950/95 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.6)] backdrop-blur-xl animate-fade-in pointer-events-auto select-none">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
              ¡Invitación a Partida!
            </span>
          </div>

          <h4 className="text-sm font-black text-white truncate">
            <strong className="text-cyan-300">{invitation.fromPlayerName}</strong> te invitó a jugar
          </h4>

          <p className="text-xs text-neutral-300 font-medium mt-0.5">
            Modo: <strong className="text-white">{modeTitle}</strong>
          </p>

          {isTeam && !allowsChoice && (
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-neutral-400">Tu bando asignado:</span>
              <span
                className={`font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 ${
                  invitation.guestFaction === 'immune'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                }`}
              >
                {invitation.guestFaction === 'immune' ? (
                  <>
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>Sistema Inmune</span>
                  </>
                ) : (
                  <>
                    <Skull className="w-3 h-3 text-rose-400" />
                    <span>Infección / Patógeno</span>
                  </>
                )}
              </span>
            </div>
          )}

          {isTeam && allowsChoice && (
            <div className="mt-2 space-y-1">
              <span className="text-[11px] text-neutral-400 block font-semibold">
                Elegí tu bando para ingresar:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setChosenFaction('immune')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    chosenFaction === 'immune'
                      ? 'bg-cyan-600 text-white border border-cyan-300 shadow-sm'
                      : 'bg-white/5 border border-white/10 text-neutral-400'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>Defensor Inmune</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChosenFaction('pathogen')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    chosenFaction === 'pathogen'
                      ? 'bg-rose-600 text-white border border-rose-300 shadow-sm'
                      : 'bg-white/5 border border-white/10 text-neutral-400'
                  }`}
                >
                  <Skull className="w-3 h-3" />
                  <span>Infección</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
            <button
              onClick={() => onDecline(invitation.id)}
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Rechazar</span>
            </button>

            <button
              onClick={() =>
                onAccept(
                  invitation,
                  allowsChoice ? chosenFaction : invitation.guestFaction || 'immune'
                )
              }
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aceptar e Ingresar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
