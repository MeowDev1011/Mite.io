import React, { useState } from 'react';
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
  Sparkles,
  Bookmark
} from 'lucide-react';
import { TranslationStrings } from '../i18n/languages';
import { GameStats } from '../game/types';
import { profileStorage } from '../storage/profileStorage';

interface ShareModalProps {
  onClose: () => void;
  t: TranslationStrings;
  currentLang: string;
  stats?: GameStats | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose, t, currentLang, stats }) => {
  const [copied, setCopied] = useState(false);
  const [discordCopied, setDiscordCopied] = useState(false);
  const [cardDownloaded, setCardDownloaded] = useState(false);
  const [showQr, setShowQr] = useState(false);
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

  const getShareMessage = () => {
    const peak = stats?.peakMass ? `[Mite.io] Mass: ${stats.peakMass} · ` : '';
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
          title: 'Mite.io · Bloodstream Cellular Invasion',
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
    const title = encodeURIComponent('Mite.io - Real-Time Bloodstream Cellular Invasion Game');
    const url = encodeURIComponent(shareUrl);
    window.open(`https://reddit.com/submit?url=${url}&title=${title}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleShareDiscord = () => {
    const discordText = `🦠 **Mite.io — Bloodstream Cellular Invasion**\n> ${stats?.peakMass ? `Peak mass: **${stats.peakMass}** | ` : ''}Factions, super-powers & real-time survival inside the human body!\nPlay here: <${shareUrl}>`;
    navigator.clipboard.writeText(discordText);
    setDiscordCopied(true);
    setTimeout(() => setDiscordCopied(false), 3500);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Mite.io · Cellular Invasion Battle');
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

  // Generate downloadable Bio Identity Card PNG using Canvas
  const handleDownloadCard = () => {
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

      // Glowing corner accents
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(12, 12, 30, 6);
      ctx.fillRect(12, 12, 6, 30);
      ctx.fillRect(638, 12, 30, 6);
      ctx.fillRect(662, 12, 6, 30);
      ctx.fillRect(12, 382, 30, 6);
      ctx.fillRect(12, 358, 6, 30);
      ctx.fillRect(638, 382, 30, 6);
      ctx.fillRect(662, 358, 6, 30);

      // Top title
      ctx.font = '900 28px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('MITE.IO', 45, 62);

      ctx.font = '700 13px sans-serif';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('BIOLOGICAL IDENTITY CARD', 45, 84);

      // Microbe circular badge
      const badgeX = 550;
      const badgeY = 110;
      const badgeGrad = ctx.createRadialGradient(badgeX, badgeY, 10, badgeX, badgeY, 65);
      badgeGrad.addColorStop(0, '#f43f5e');
      badgeGrad.addColorStop(0.7, '#881337');
      badgeGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = badgeGrad;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Crown or star on badge
      ctx.fillStyle = '#fbbf24';
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', badgeX, badgeY + 10);
      ctx.textAlign = 'left';

      // Player Information Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(45, 120, 390, 160);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(45, 120, 390, 160);

      // Name & Bacteria
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 12px sans-serif';
      ctx.fillText('MICROBE SPECIMEN:', 65, 150);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 22px sans-serif';
      const name = profile.nickname || 'Unknown Cell';
      ctx.fillText(name.slice(0, 18), 65, 178);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 12px sans-serif';
      ctx.fillText('SPECIES / VARIANT:', 65, 215);

      ctx.fillStyle = '#34d399';
      ctx.font = '700 15px sans-serif';
      ctx.fillText(profile.bacteriaType.toUpperCase(), 65, 235);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 12px sans-serif';
      ctx.fillText('CYTES POOL:', 250, 215);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 16px monospace';
      ctx.fillText(`${profile.cytes.toLocaleString()} cytes`, 250, 235);

      // Stats Banner
      ctx.fillStyle = '#f43f5e';
      ctx.font = '800 14px sans-serif';
      const peakMass = stats?.peakMass || profile.cytes || 500;
      ctx.fillText(`PEAK MASS RECORD: ${peakMass.toLocaleString()} AMU`, 45, 315);

      // URL Footer
      ctx.fillStyle = '#64748b';
      ctx.font = '500 11px monospace';
      ctx.fillText(`ID: ${profileStorage.getDeviceId().slice(0, 14)} · PLAY AT: ${shareUrl.slice(0, 50)}`, 45, 355);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `mite-io-bio-card-${profile.nickname || 'cell'}.png`;
      a.click();

      setCardDownloaded(true);
      setTimeout(() => setCardDownloaded(false), 3500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md pointer-events-auto select-none animate-fade-in">
      <div className="relative w-full max-w-lg p-5 sm:p-7 rounded-3xl bg-neutral-950/95 border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.3)] flex flex-col max-h-[92vh] overflow-y-auto">
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

        {/* QR Code Display Card */}
        {showQr && (
          <div className="mt-4 p-4 rounded-2xl bg-neutral-900 border border-purple-500/40 flex flex-col items-center text-center animate-fade-in">
            <div className="p-3 bg-white rounded-2xl shadow-xl mb-2 flex items-center justify-center">
              <svg width="140" height="140" viewBox="0 0 140 140" className="rounded-lg">
                <rect width="140" height="140" fill="#ffffff" />
                <rect x="10" y="10" width="34" height="34" fill="#09090b" rx="4" />
                <rect x="16" y="16" width="22" height="22" fill="#ffffff" rx="2" />
                <rect x="22" y="22" width="10" height="10" fill="#e11d48" rx="2" />
                <rect x="96" y="10" width="34" height="34" fill="#09090b" rx="4" />
                <rect x="102" y="16" width="22" height="22" fill="#ffffff" rx="2" />
                <rect x="108" y="22" width="10" height="10" fill="#e11d48" rx="2" />
                <rect x="10" y="96" width="34" height="34" fill="#09090b" rx="4" />
                <rect x="16" y="102" width="22" height="22" fill="#ffffff" rx="2" />
                <rect x="22" y="108" width="10" height="10" fill="#e11d48" rx="2" />

                <g fill="#18181b">
                  <rect x="52" y="12" width="6" height="6" />
                  <rect x="64" y="12" width="6" height="6" />
                  <rect x="76" y="12" width="6" height="6" />
                  <rect x="58" y="24" width="6" height="6" />
                  <rect x="70" y="24" width="6" height="6" />
                  <rect x="82" y="24" width="6" height="6" />
                  <rect x="52" y="36" width="6" height="6" />
                  <rect x="64" y="36" width="6" height="6" />
                  <rect x="12" y="52" width="6" height="6" />
                  <rect x="24" y="52" width="6" height="6" />
                  <rect x="36" y="52" width="6" height="6" />
                  <rect x="48" y="52" width="6" height="6" />
                  <rect x="60" y="52" width="6" height="6" />
                  <rect x="72" y="52" width="6" height="6" />
                  <rect x="84" y="52" width="6" height="6" />
                  <rect x="96" y="52" width="6" height="6" />
                  <rect x="108" y="52" width="6" height="6" />
                  <rect x="120" y="52" width="6" height="6" />

                  <circle cx="70" cy="70" r="14" fill="#f43f5e" />
                  <circle cx="70" cy="70" r="8" fill="#ffffff" />
                  <circle cx="70" cy="70" r="4" fill="#09090b" />

                  <rect x="12" y="68" width="6" height="6" />
                  <rect x="28" y="68" width="6" height="6" />
                  <rect x="44" y="68" width="6" height="6" />
                  <rect x="92" y="68" width="6" height="6" />
                  <rect x="108" y="68" width="6" height="6" />
                  <rect x="124" y="68" width="6" height="6" />

                  <rect x="12" y="80" width="6" height="6" />
                  <rect x="36" y="80" width="6" height="6" />
                  <rect x="52" y="80" width="6" height="6" />
                  <rect x="82" y="80" width="6" height="6" />
                  <rect x="102" y="80" width="6" height="6" />
                  <rect x="120" y="80" width="6" height="6" />

                  <rect x="52" y="96" width="6" height="6" />
                  <rect x="68" y="96" width="6" height="6" />
                  <rect x="84" y="96" width="6" height="6" />
                  <rect x="100" y="96" width="6" height="6" />
                  <rect x="116" y="96" width="6" height="6" />

                  <rect x="52" y="112" width="6" height="6" />
                  <rect x="74" y="112" width="6" height="6" />
                  <rect x="92" y="112" width="6" height="6" />
                  <rect x="110" y="112" width="6" height="6" />
                  <rect x="124" y="112" width="6" height="6" />

                  <rect x="60" y="124" width="6" height="6" />
                  <rect x="78" y="124" width="6" height="6" />
                  <rect x="96" y="124" width="6" height="6" />
                </g>
              </svg>
            </div>
            <p className="text-xs font-bold text-neutral-300">{t.scanQrToPlay}</p>
          </div>
        )}
      </div>
    </div>
  );
};
