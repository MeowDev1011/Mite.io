import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  Smartphone,
  QrCode,
  Linkedin,
  Mail,
  MessageSquare,
  MessageCircle,
  Download,
  Bookmark
} from 'lucide-react';
import { TranslationStrings } from '../i18n/languages';
import { GameStats } from '../game/types';
import { profileStorage } from '../storage/profileStorage';
import {
  QR_STYLE_THEMES,
  QrThemeId,
  generateStyledQrDataUrl,
  renderStyledQrToCanvas,
} from '../utils/styledQr';

interface ShareModalProps {
  onClose: () => void;
  t: TranslationStrings;
  currentLang: string;
  stats?: GameStats | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose, t, stats }) => {
  const [copied, setCopied] = useState(false);
  const [discordCopied, setDiscordCopied] = useState(false);
  const [cardDownloaded, setCardDownloaded] = useState(false);
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const [showQr, setShowQr] = useState(true);
  const [qrTheme, setQrTheme] = useState<QrThemeId>('bio_crimson');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const profile = profileStorage.getProfile();

  const getShareUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('ref', profileStorage.getDeviceId().slice(-6));
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  const shareUrl = getShareUrl();

  useEffect(() => {
    const dataUrl = generateStyledQrDataUrl(shareUrl, 340, qrTheme);
    setQrDataUrl(dataUrl);
  }, [shareUrl, qrTheme]);

  const getShareMessage = () => {
    const peak = stats?.peakMass ? `[Mite.io] ${t.peakMass}: ${stats.peakMass} · ` : '';
    return `${peak}${t.shareMessageText} ${shareUrl}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.shareTitle,
          text: getShareMessage(),
          url: shareUrl,
        });
      } catch {
        // User canceled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareMessage());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(getShareMessage());
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(getShareMessage());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareReddit = () => {
    const title = encodeURIComponent(t.shareTitle);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://reddit.com/submit?url=${url}&title=${title}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleShareDiscord = () => {
    const discordText = `🦠 **${t.shareTitle}**\n> ${stats?.peakMass ? `${t.peakMass}: **${stats.peakMass}** | ` : ''}${t.shareMessageText}\n<${shareUrl}>`;
    navigator.clipboard.writeText(discordText);
    setDiscordCopied(true);
    setTimeout(() => setDiscordCopied(false), 3500);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(t.shareTitle);
    const body = encodeURIComponent(getShareMessage());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareSMS = () => {
    const body = encodeURIComponent(getShareMessage());
    window.location.href = `sms:?&body=${body}`;
  };

  const handleSharePinterest = () => {
    const url = encodeURIComponent(shareUrl);
    const desc = encodeURIComponent(getShareMessage());
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&description=${desc}`, '_blank');
  };

  // Generate downloadable Bio Identity Card PNG using Canvas with real QR code
  const handleDownloadCard = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 680;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 680, 400);
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(0.5, '#180718');
      bgGrad.addColorStop(1, '#030712');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 680, 400);

      // Cyber / Bio border
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, 656, 376);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(18, 18, 644, 364);

      // Top title
      ctx.font = '900 28px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('MITE.IO', 45, 62);

      ctx.font = '700 13px sans-serif';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(t.shareBioCardHeader, 45, 84);

      // Real Scannable Styled QR Code on Right Side of Bio Card
      const qrTempCanvas = document.createElement('canvas');
      renderStyledQrToCanvas(qrTempCanvas, shareUrl, 170, qrTheme);
      ctx.drawImage(qrTempCanvas, 465, 110, 170, 170);

      // Player Information Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(45, 120, 390, 160);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(45, 120, 390, 160);

      // Name & Bacteria
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 12px sans-serif';
      ctx.fillText(t.shareMicrobeSpecimen, 65, 150);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 22px sans-serif';
      const name = profile.name || 'Mite';
      ctx.fillText(name.slice(0, 18), 65, 178);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 12px sans-serif';
      ctx.fillText(`${t.bacteriaTab.toUpperCase()}:`, 65, 215);

      ctx.fillStyle = '#34d399';
      ctx.font = '700 15px sans-serif';
      ctx.fillText((profile.selectedBacteriaId || 'bacillus_subtilis').toUpperCase(), 65, 235);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 12px sans-serif';
      ctx.fillText(`${t.cytes.toUpperCase()}:`, 250, 215);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 16px monospace';
      ctx.fillText(`${profile.cytes.toLocaleString()} ${t.cytes}`, 250, 235);

      // Stats Banner
      ctx.fillStyle = '#f43f5e';
      ctx.font = '800 14px sans-serif';
      const peakMass = stats?.peakMass || profile.cytes || 500;
      ctx.fillText(`${t.peakMass.toUpperCase()}: ${peakMass.toLocaleString()}`, 45, 315);

      // URL Footer
      ctx.fillStyle = '#64748b';
      ctx.font = '500 11px monospace';
      ctx.fillText(`ID: ${profileStorage.getDeviceId().slice(0, 14)} · ${t.sharePlayLiveAt} ${shareUrl.slice(0, 45)}`, 45, 355);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `mite-io-bio-card-${profile.name || 'cell'}.png`;
      a.click();

      setCardDownloaded(true);
      setTimeout(() => setCardDownloaded(false), 3500);
    } catch {
      // Fallback
    }
  };

  // Build high-resolution REAL ISO Scannable QR Code canvas for downloading or sharing
  const buildQrCanvas = async (): Promise<HTMLCanvasElement | null> => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 520;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Dark bio background
      const bgGrad = ctx.createLinearGradient(0, 0, 520, 640);
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(0.5, '#180718');
      bgGrad.addColorStop(1, '#040d1a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 520, 640);

      // Border frame
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.strokeRect(12, 12, 496, 616);

      // Header text
      ctx.textAlign = 'center';
      ctx.font = '900 32px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Mite.io', 260, 58);

      ctx.font = '700 13px sans-serif';
      ctx.fillStyle = '#c084fc';
      ctx.fillText(t.shareScanQrJoin, 260, 84);

      // White QR container pad
      const qrBoxX = 80;
      const qrBoxY = 108;
      const qrBoxSize = 360;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
      ctx.fill();

      // Render genuine Reed-Solomon Styled QR code onto offscreen canvas and draw inside pad
      const qrTempCanvas = document.createElement('canvas');
      renderStyledQrToCanvas(qrTempCanvas, shareUrl, 340, qrTheme);
      ctx.drawImage(qrTempCanvas, qrBoxX + 10, qrBoxY + 10, 340, 340);

      // Player & URL footer
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
      setTimeout(() => setQrDownloaded(false), 3500);
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
              text: getShareMessage(),
              url: shareUrl,
              files: [file],
            });
            return;
          }
        }
      } catch {
        // Fallback to standard share below
      }
    }
    await handleNativeShare();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md pointer-events-auto select-none animate-fade-in overflow-x-hidden">
      <div className="relative w-full max-w-lg p-4 sm:p-7 rounded-3xl bg-neutral-950/95 border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.3)] flex flex-col max-h-[92vh] overflow-y-auto overflow-x-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">{t.shareModalTitle}</h3>
              <p className="text-xs text-neutral-400">{t.shareModalDesc}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link Copy Bar */}
        <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
          <div className="text-xs font-mono text-neutral-300 truncate max-w-[280px] sm:max-w-[340px]">
            {shareUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              copied
                ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.linkCopied : t.copyLinkBtn}</span>
          </button>
        </div>

        {/* Primary Action Row: Native Device Share & Download Bio Card */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleNativeShare}
            className="w-full py-3 px-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all transform active:scale-95 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>{t.shareNativeBtn}</span>
          </button>

          <button
            onClick={handleDownloadCard}
            className={`w-full py-3 px-3.5 rounded-2xl font-black text-xs tracking-wide uppercase flex items-center justify-center gap-2 border transition-all transform active:scale-95 cursor-pointer ${
              cardDownloaded
                ? 'bg-emerald-600 text-neutral-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
            }`}
          >
            {cardDownloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{cardDownloaded ? t.shareCardDownloaded : t.shareDownloadCard}</span>
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="mt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            {t.shareSocialTitle}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.shareWhatsApp}</span>
            </button>

            {/* Telegram */}
            <button
              onClick={handleShareTelegram}
              className="p-3 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/40 text-sky-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>{t.shareTelegram}</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={handleShareTwitter}
              className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <span className="font-mono font-black text-sm">𝕏</span>
              <span>{t.shareTwitter}</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleShareFacebook}
              className="p-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>{t.shareFacebook}</span>
            </button>

            {/* Reddit */}
            <button
              onClick={handleShareReddit}
              className="p-3 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/40 text-orange-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
              <span>{t.shareReddit}</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleShareLinkedIn}
              className="p-3 rounded-xl bg-blue-900/30 hover:bg-blue-900/50 border border-blue-400/40 text-blue-200 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <Linkedin className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.shareLinkedIn}</span>
            </button>

            {/* Discord Markdown */}
            <button
              onClick={handleShareDiscord}
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02] ${
                discordCopied
                  ? 'bg-indigo-700 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                  : 'bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-500/40 text-indigo-300'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>{discordCopied ? t.shareDiscordCopied : t.shareDiscord}</span>
            </button>

            {/* Pinterest */}
            <button
              onClick={handleSharePinterest}
              className="p-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <Bookmark className="w-3.5 h-3.5 text-red-400" />
              <span>{t.sharePinterest}</span>
            </button>

            {/* Email */}
            <button
              onClick={handleShareEmail}
              className="p-3 rounded-xl bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.shareEmail}</span>
            </button>

            {/* SMS */}
            <button
              onClick={handleShareSMS}
              className="p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-200 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.shareSMS}</span>
            </button>

            {/* QR Code Toggle */}
            <button
              onClick={() => setShowQr(!showQr)}
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02] ${
                showQr
                  ? 'bg-purple-950/60 border-purple-400 text-purple-200'
                  : 'bg-purple-950/30 hover:bg-purple-900/50 border-purple-500/40 text-purple-300'
              }`}
            >
              <QrCode className="w-4 h-4 text-purple-400" />
              <span>{t.shareQrCode}</span>
            </button>
          </div>
        </div>

        {/* QR Code Display Card with Bio-Line Styling & Color Palette Selector */}
        {showQr && (
          <div className="mt-4 p-4 rounded-2xl bg-neutral-900 border border-purple-500/40 flex flex-col items-center text-center animate-fade-in">
            {/* Color Palette Selector */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap mb-3">
              {QR_STYLE_THEMES.map((theme) => {
                const isSelected = qrTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setQrTheme(theme.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/15 text-white border-white/50 shadow-sm'
                        : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40"
                      style={{
                        background: `linear-gradient(135deg, ${theme.gradStops[0]}, ${theme.gradStops[1]})`,
                      }}
                    />
                    <span>{theme.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 bg-white rounded-2xl shadow-[0_0_25px_rgba(244,63,94,0.25)] border-2 border-rose-500/40 mb-2 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={t.shareQrCode}
                  className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-xl block"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-neutral-900 text-xs font-bold">
                  QR...
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-neutral-300 mb-3">{t.scanQrToPlay}</p>

            {/* QR Code Action Buttons: Download QR & Share QR/Game */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-2.5 px-3 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-400/50 text-purple-100 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                {qrDownloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300 truncate">{t.qrDownloaded}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-purple-300 shrink-0" />
                    <span className="truncate">{t.downloadQrBtn}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareQr}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.35)]"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.shareQrBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
