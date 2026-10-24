import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Zap,
  Share2,
  Copy,
  Check,
  X,
  Globe,
  MessageCircle,
  Send,
  Smartphone,
  QrCode,
  Mail,
  MessageSquare,
  Download,
  Hash,
} from 'lucide-react';
import { GameMode, Faction } from '../game/types';
import { TranslationStrings } from '../i18n/languages';
import { profileStorage } from '../storage/profileStorage';
import {
  QR_STYLE_THEMES,
  QrThemeId,
  generateStyledQrDataUrl,
  renderStyledQrToCanvas,
} from '../utils/styledQr';

interface InsufficientPlayersModalProps {
  mode: GameMode;
  faction: Faction;
  activeCount: number;
  minRequired: number;
  onClose: () => void;
  onPlayWithBots: () => void;
  onOpenInvite: () => void;
  currentLang: string;
  t: TranslationStrings;
}

export const InsufficientPlayersModal: React.FC<InsufficientPlayersModalProps> = ({
  mode,
  activeCount,
  minRequired,
  onClose,
  onPlayWithBots,
  onOpenInvite,
  t,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [copiedTikTok, setCopiedTikTok] = useState(false);
  const [cardDownloaded, setCardDownloaded] = useState(false);
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrTheme, setQrTheme] = useState<QrThemeId>('bio_crimson');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasCardRef = useRef<HTMLCanvasElement | null>(null);

  const profile = profileStorage.getProfile();
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://mite.io';
  const shareMessage = `${t.shareMessageText}${shareUrl}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareMessage);
  const encodedTitle = encodeURIComponent(t.shareTitle);

  useEffect(() => {
    const dataUrl = generateStyledQrDataUrl(shareUrl, 320, qrTheme);
    setQrDataUrl(dataUrl);
  }, [shareUrl, qrTheme]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2600);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2600);
    }
  };

  const handleCopyDiscord = async () => {
    const discordMsg = `🦠 **Mite.io — ${t.shareTitle}**\n> 👤 **${profile.name}** | 🩸 **${profile.cytes} ${t.cytes}**\n> ${t.shareMessageText}\n🔗 ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(discordMsg);
      setCopiedDiscord(true);
      setTimeout(() => setCopiedDiscord(false), 2600);
    } catch {
      handleCopyLink();
    }
  };

  const handleCopyTikTok = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedTikTok(true);
      setTimeout(() => setCopiedTikTok(false), 3000);
    } catch {
      handleCopyLink();
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.shareTitle,
          text: t.shareMessageText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadBioCard = async () => {
    const canvas = canvasCardRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 640;
    canvas.height = 340;

    const grad = ctx.createLinearGradient(0, 0, 640, 340);
    grad.addColorStop(0, '#140308');
    grad.addColorStop(0.5, '#090205');
    grad.addColorStop(1, '#041418');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 340);

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 620, 320);

    ctx.beginPath();
    ctx.arc(95, 110, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#34d399';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(90, 102, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px sans-serif';
    ctx.fillText('Mite.io', 165, 92);

    ctx.fillStyle = '#f43f5e';
    ctx.font = '700 15px monospace';
    ctx.fillText(t.bioZone.toUpperCase(), 165, 118);

    ctx.fillStyle = '#34d399';
    ctx.font = '800 22px sans-serif';
    ctx.fillText(`${profile.name}`, 165, 152);

    // Draw real styled QR code on the right side of the card
    try {
      const qrTemp = document.createElement('canvas');
      renderStyledQrToCanvas(qrTemp, shareUrl, 130, qrTheme);
      ctx.drawImage(qrTemp, 480, 42, 130, 130);
    } catch {}

    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(30, 185, 580, 75);

    ctx.fillStyle = '#fca5a5';
    ctx.font = '700 13px monospace';
    ctx.fillText(t.cytes.toUpperCase(), 55, 212);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px monospace';
    ctx.fillText(`${profile.cytes}`, 55, 242);

    ctx.fillStyle = '#67e8f9';
    ctx.font = '700 13px monospace';
    ctx.fillText(t.colonizedOrgansLabel.toUpperCase(), 230, 212);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px monospace';
    ctx.fillText(`${profile.conqueredOrgans.length} / 7`, 230, 242);

    ctx.fillStyle = '#fde047';
    ctx.font = '700 13px monospace';
    ctx.fillText('ID', 460, 212);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px monospace';
    ctx.fillText(`${profile.deviceId.slice(-6).toUpperCase()}`, 460, 242);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px monospace';
    ctx.fillText(shareUrl.slice(0, 62), 30, 298);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `mite-io-${profile.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      setCardDownloaded(true);
      setTimeout(() => setCardDownloaded(false), 3000);
    } catch {
      handleCopyLink();
    }
  };

  const buildQrCanvas = async (): Promise<HTMLCanvasElement | null> => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 520;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const bgGrad = ctx.createLinearGradient(0, 0, 520, 640);
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(0.5, '#180718');
      bgGrad.addColorStop(1, '#040d1a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 520, 640);

      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, 496, 616);

      ctx.textAlign = 'center';
      ctx.font = '900 32px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Mite.io', 260, 58);

      ctx.font = '700 13px sans-serif';
      ctx.fillStyle = '#c084fc';
      ctx.fillText(t.shareScanQrJoin, 260, 84);

      const qrBoxX = 80;
      const qrBoxY = 108;
      const qrBoxSize = 360;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
      ctx.fill();

      const qrTempCanvas = document.createElement('canvas');
      renderStyledQrToCanvas(qrTempCanvas, shareUrl, 340, qrTheme);
      ctx.drawImage(qrTempCanvas, qrBoxX + 10, qrBoxY + 10, 340, 340);

      ctx.fillStyle = '#34d399';
      ctx.font = '800 18px sans-serif';
      ctx.fillText(`${profile.name || 'Microbio'} · ${profile.cytes} ${t.cytes}`, 260, 512);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 13px sans-serif';
      ctx.fillText(t.scanQrToPlay, 260, 545);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 11px monospace';
      ctx.fillText(shareUrl.slice(0, 54), 260, 585);

      return canvas;
    } catch {
      return null;
    }
  };

  const handleDownloadQr = async () => {
    const canvas = await buildQrCanvas();
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `mite-io-qr-${(profile.name || 'game').toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
      setQrDownloaded(true);
      setTimeout(() => setQrDownloaded(false), 3000);
    } catch {
      handleCopyLink();
    }
  };

  const handleShareQr = async () => {
    const canvas = await buildQrCanvas();
    if (canvas && navigator.share) {
      try {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const file = new File([blob], 'mite-io-qr.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: t.shareTitle,
              text: shareMessage,
              url: shareUrl,
              files: [file],
            });
            return;
          }
        }
      } catch {
        // Fallback below
      }
    }
    await handleNativeShare();
  };

  const isTeam = mode === 'team';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans overflow-x-hidden">
      <div className="relative w-full max-w-xl rounded-3xl bg-neutral-950/95 border border-rose-500/40 p-4 sm:p-6 shadow-[0_0_50px_rgba(244,63,94,0.35)] text-center text-white overflow-x-hidden max-h-[92vh] overflow-y-auto">
        <canvas ref={canvasCardRef} className="hidden" />

        {/* Glow corner highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Alert Icon & Header */}
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-center text-rose-400 mb-2.5 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          <Users className="w-6 h-6" />
        </div>

        <h3 className="text-base sm:text-xl font-black uppercase tracking-wider text-rose-200 mb-1">
          {t.insufficientPlayersTitle}
        </h3>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold mb-2.5">
          <span>{activeCount} {t.playersOnlineCount}</span>
          <span>·</span>
          <span>{t.minRequiredLabel}: {minRequired}</span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-3.5 max-w-md mx-auto">
          {isTeam ? t.insufficientTeamDesc : t.insufficientFfaDesc}
        </p>

        {/* Complete Multi-Platform & Device Viral Sharing Suite */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 via-black/50 to-cyan-950/30 border border-white/10 mb-3.5 text-left space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.makeGameFamousTitle}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
              {t.viralizeInvasionBadge}
            </span>
          </div>

          <p className="text-[11px] text-neutral-300">
            {t.shareToFillRoomDesc}
          </p>

          {/* Row 1: Native Device Share & Copy Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>{t.shareNativeBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                  : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t.linkCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>{t.copyLinkBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Row 2: Full 11-Platform Social & Messaging Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pt-1">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold">{t.shareWhatsApp}</span>
            </a>

            {/* Telegram */}
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(t.shareMessageText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/35 border border-sky-500/40 text-sky-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-sky-400" />
              <span className="text-[10px] font-bold">{t.shareTelegram}</span>
            </a>

            {/* X / Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(t.shareMessageText)}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/20 text-white flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-neutral-300" />
              <span className="text-[10px] font-bold">{t.shareTwitter}</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/40 text-blue-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold">{t.shareFacebook}</span>
            </a>

            {/* Discord */}
            <button
              type="button"
              onClick={handleCopyDiscord}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                copiedDiscord
                  ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                  : 'bg-indigo-600/20 hover:bg-indigo-600/35 border-indigo-500/40 text-indigo-200'
              }`}
            >
              {copiedDiscord ? <Check className="w-4 h-4 text-emerald-400" /> : <Hash className="w-4 h-4 text-indigo-400" />}
              <span className="text-[10px] font-bold">{t.shareDiscord}</span>
            </button>

            {/* TikTok */}
            <button
              type="button"
              onClick={handleCopyTikTok}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                copiedTikTok
                  ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                  : 'bg-pink-600/20 hover:bg-pink-600/35 border-pink-500/40 text-pink-200'
              }`}
            >
              {copiedTikTok ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-pink-400" />}
              <span className="text-[10px] font-bold">{copiedTikTok ? t.copiedToast : 'TikTok'}</span>
            </button>

            {/* Reddit */}
            <a
              href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/35 border border-orange-500/40 text-orange-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] font-bold">{t.shareReddit}</span>
            </a>

            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-sky-800/25 hover:bg-sky-800/40 border border-sky-400/40 text-sky-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4 text-sky-300" />
              <span className="text-[10px] font-bold">{t.shareLinkedIn}</span>
            </a>

            {/* Pinterest */}
            <a
              href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/35 border border-red-500/40 text-red-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-bold">{t.sharePinterest}</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:?subject=${encodedTitle}&body=${encodedText}`}
              className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/35 border border-amber-500/40 text-amber-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold">{t.shareEmail}</span>
            </a>

            {/* SMS */}
            <a
              href={`sms:?&body=${encodedText}`}
              className="p-2 rounded-xl bg-teal-600/20 hover:bg-teal-600/35 border border-teal-500/40 text-teal-200 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span className="text-[10px] font-bold">{t.shareSMS}</span>
            </a>

            {/* QR Code Toggle */}
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                showQr
                  ? 'bg-purple-600/40 border-purple-400 text-white'
                  : 'bg-purple-600/20 hover:bg-purple-600/35 border-purple-500/40 text-purple-200'
              }`}
            >
              <QrCode className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold">{t.shareQrCode}</span>
            </button>
          </div>

          {/* Row 3: Download Bio Card PNG */}
          <button
            type="button"
            onClick={handleDownloadBioCard}
            className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {cardDownloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">{t.shareCardDownloaded}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-cyan-300" />
                <span>{t.shareDownloadCard}</span>
              </>
            )}
          </button>

          {/* Toast notifications */}
          {copiedDiscord && (
            <p className="text-[10px] text-indigo-300 text-center font-bold animate-fade-in">
              {t.shareDiscordCopied}
            </p>
          )}
          {copiedTikTok && (
            <p className="text-[10px] text-emerald-300 text-center font-bold animate-fade-in">
              {t.tiktokCopiedHint}
            </p>
          )}

          {/* Scannable Styled QR Code Panel with Color Theme Selector, Download & Share */}
          {showQr && (
            <div className="p-3 rounded-2xl bg-black/70 border border-purple-500/40 flex flex-col items-center text-center animate-fade-in">
              <div className="flex items-center justify-center gap-1 flex-wrap mb-2">
                {QR_STYLE_THEMES.map((theme) => {
                  const isSelected = qrTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setQrTheme(theme.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/15 text-white border-white/50'
                          : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${theme.gradStops[0]}, ${theme.gradStops[1]})`,
                        }}
                      />
                      <span>{theme.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="p-2 rounded-xl bg-white border-2 border-rose-500/40 mb-1.5 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Mite.io QR Code" className="w-40 h-40 object-contain rounded-lg block" />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-neutral-900 text-xs font-bold">
                    QR...
                  </div>
                )}
              </div>
              <p className="text-[11px] text-purple-200 font-semibold mb-2.5">{t.scanQrToPlay}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="py-2 px-3 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-400/50 text-purple-100 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {qrDownloaded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">{t.qrDownloaded}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-purple-300" />
                      <span>{t.downloadQrBtn}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleShareQr}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t.shareQrBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Play with BOTs for now vs Invite active players */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onPlayWithBots}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{t.playWithBotsNowBtn}</span>
          </button>

          <button
            onClick={onOpenInvite}
            className="w-full py-2.5 px-4 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>{t.viewActiveAndInviteBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
