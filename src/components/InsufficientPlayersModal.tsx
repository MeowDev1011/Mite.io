import React, { useState } from 'react';
import { Users, Zap, Share2, Copy, Check, X, Shield, ExternalLink, Globe } from 'lucide-react';
import { GameMode, Faction } from '../game/types';

interface InsufficientPlayersModalProps {
  mode: GameMode;
  faction: Faction;
  activeCount: number;
  minRequired: number;
  onClose: () => void;
  onPlayWithBots: () => void;
  onOpenInvite: () => void;
  currentLang: string;
}

export const InsufficientPlayersModal: React.FC<InsufficientPlayersModalProps> = ({
  mode,
  faction,
  activeCount,
  minRequired,
  onClose,
  onPlayWithBots,
  onOpenInvite,
  currentLang,
}) => {
  const [copied, setCopied] = useState(false);

  // Localized share texts
  const getShareText = () => {
    const lang = currentLang.toLowerCase();
    const gameUrl = window.location.href;
    if (lang.startsWith('en')) {
      return `Invade the bloodstream with me in Mite.io! Play live cell evolution right now: ${gameUrl}`;
    }
    if (lang.startsWith('pt')) {
      return `Invada a corrente sanguínea comigo no Mite.io! Batalha celular em tempo real: ${gameUrl}`;
    }
    if (lang.startsWith('fr')) {
      return `Envahis la circulation sanguine avec moi sur Mite.io ! Jeu cellulaire en direct : ${gameUrl}`;
    }
    if (lang.startsWith('de')) {
      return `Komm in die Blutbahn mit Mite.io! Spiele Echtzeit-Zellenevolution: ${gameUrl}`;
    }
    if (lang.startsWith('it')) {
      return `Invadi il flusso sanguigno con me su Mite.io! Battaglia cellulare in tempo reale: ${gameUrl}`;
    }
    if (lang.startsWith('ru')) {
      return `Вступай в бой в кровяном русле в Mite.io! Играй в клеточную эволюцию: ${gameUrl}`;
    }
    if (lang.startsWith('ja')) {
      return `Mite.ioで一緒に血流を侵略しよう！リアルタイム細胞バトル： ${gameUrl}`;
    }
    if (lang.startsWith('zh')) {
      return `来 Mite.io 与我一起入侵血流！实时微细胞吞噬大战： ${gameUrl}`;
    }
    return `¡Entrá a jugar Mite.io conmigo! Invadí el torrente sanguíneo y devorá nutrientes en tiempo real: ${gameUrl}`;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleCopyTikTok = () => {
    const text = getShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mite.io • Bloodstream Invasion',
          text: getShareText(),
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopyTikTok();
    }
  };

  const isTeam = mode === 'team';
  const modeLabel = isTeam ? 'Batalla en Equipo' : 'Individual Multijugador';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-neutral-950/95 border border-rose-500/40 p-5 sm:p-6 shadow-[0_0_50px_rgba(244,63,94,0.35)] text-center text-white overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow corner highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-rose-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Alert Icon & Header */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          <Users className="w-7 h-7" />
        </div>

        <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-rose-200 mb-1">
          ¡Faltan Jugadores Humanos!
        </h3>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold mb-3">
          <span>{activeCount} jugador{activeCount === 1 ? '' : 'es'} en línea</span>
          <span>·</span>
          <span>Mínimo requerido: {minRequired}</span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-4 max-w-md mx-auto">
          {isTeam ? (
            <>
              Para jugar <strong className="text-white">Batalla en Equipo (Solo Humanos)</strong> se exigen al menos{' '}
              <strong className="text-cyan-400">4 jugadores</strong> (2 por bando: Sistema Inmune vs Infección) para que el combate sea balanceado y competitivo.
            </>
          ) : (
            <>
              Para jugar <strong className="text-white">Multijugador (Solo Humanos)</strong> se exige un mínimo de{' '}
              <strong className="text-cyan-400">3 jugadores</strong> simultáneos en el torrente sanguíneo.
            </>
          )}
        </p>

        {/* Viral Promotion Box: Haz más famoso el juego */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 via-black/40 to-cyan-950/30 border border-white/10 mb-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              ¡Haz más famoso el juego!
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
              Viralizá la Invasión
            </span>
          </div>

          <p className="text-[11px] text-neutral-300 mb-3">
            Compartí Mite.io en tus redes sociales con un solo toque y llená la sala de inmediato con tus amigos:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(37,211,102,0.2)]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleShareFacebook}
              className="py-2.5 px-3 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-[#4285f4] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(24,119,242,0.2)]"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </button>

            {/* TikTok / Clipboard */}
            <button
              onClick={handleCopyTikTok}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-cyan-500/20 hover:from-pink-500/30 hover:to-cyan-500/30 border border-pink-400/40 text-pink-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'TikTok'}</span>
            </button>
          </div>

          {copied && (
            <p className="text-[10px] text-emerald-300 mt-2 text-center font-bold animate-fade-in">
              ¡Texto y enlace copiados! Pegalo en tu biografía o historias de TikTok.
            </p>
          )}
        </div>

        {/* Action Buttons: Play with BOTs for now vs Invite active players */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onPlayWithBots}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Jugar con BOTs por el momento</span>
          </button>

          <button
            onClick={onOpenInvite}
            className="w-full py-2.5 px-4 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Ver Jugadores Activos e Invitar a Sala</span>
          </button>
        </div>
      </div>
    </div>
  );
};
