import React, { useState } from 'react';
import { Flag, X, AlertTriangle, Bug, ShieldAlert, WifiOff, HelpCircle, Check, Send } from 'lucide-react';
import { TranslationStrings } from '../i18n/languages';
import { reportStorage, UserReport } from '../storage/reportStorage';

interface ReportModalProps {
  onClose: () => void;
  t: TranslationStrings;
  defaultReportedUser?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ onClose, t, defaultReportedUser = '' }) => {
  const [category, setCategory] = useState<UserReport['category']>('bug');
  const [reportedUser, setReportedUser] = useState(defaultReportedUser);
  const [when, setWhen] = useState('just_now');
  const [details, setDetails] = useState('');
  const [severity, setSeverity] = useState<UserReport['severity']>('medium');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories: { id: UserReport['category']; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'cheat', label: t.reportCategoryCheat, icon: <ShieldAlert className="w-4 h-4" />, color: 'text-rose-400' },
    { id: 'bug', label: t.reportCategoryBug, icon: <Bug className="w-4 h-4" />, color: 'text-amber-400' },
    { id: 'behavior', label: t.reportCategoryBehavior, icon: <AlertTriangle className="w-4 h-4" />, color: 'text-purple-400' },
    { id: 'desync', label: t.reportCategoryDesync, icon: <WifiOff className="w-4 h-4" />, color: 'text-sky-400' },
    { id: 'other', label: t.reportCategoryOther, icon: <HelpCircle className="w-4 h-4" />, color: 'text-emerald-400' },
  ];

  const whenOptions = [
    { id: 'just_now', label: t.reportWhenJustNow },
    { id: 'minutes_ago', label: t.reportWhenMinutes },
    { id: 'start_match', label: t.reportWhenStart },
    { id: 'lobby', label: t.reportWhenLobby },
  ];

  const severities: { id: UserReport['severity']; label: string; color: string }[] = [
    { id: 'low', label: t.reportSeverityLow, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { id: 'medium', label: t.reportSeverityMedium, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { id: 'high', label: t.reportSeverityHigh, color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
    { id: 'critical', label: t.reportSeverityCritical, color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setErrorMsg(t.reportInvalidFeedback);
      return;
    }

    const selectedWhenLabel = whenOptions.find((w) => w.id === when)?.label || when;

    reportStorage.addReport({
      category,
      reportedUser: reportedUser.trim() || undefined,
      when: selectedWhenLabel,
      details: details.trim(),
      severity,
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md pointer-events-auto select-none animate-fade-in font-sans">
      <div className="relative w-full max-w-lg p-5 sm:p-7 rounded-3xl bg-neutral-950/95 border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.3)] flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{t.reportModalTitle}</h3>
              <p className="text-xs text-neutral-400">{t.reportModalDesc}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-base sm:text-lg font-black text-white">{t.reportSuccessToast}</h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Category Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                {t.reportCategoryLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      category === c.id
                        ? 'bg-rose-950/60 border-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className={c.color}>{c.icon}</span>
                    <span className="truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* When Did It Happen */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                {t.reportWhenLabel}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {whenOptions.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWhen(w.id)}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-semibold text-left transition-all cursor-pointer truncate ${
                      when === w.id
                        ? 'bg-purple-950/60 border-purple-400 text-purple-200'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reported User (Optional) */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                {t.reportUserLabel}
              </label>
              <input
                type="text"
                value={reportedUser}
                onChange={(e) => setReportedUser(e.target.value)}
                placeholder={t.reportUserPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            {/* Details Textarea */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                {t.reportDetailsLabel}
              </label>
              <textarea
                value={details}
                onChange={(e) => {
                  setDetails(e.target.value);
                  setErrorMsg(null);
                }}
                rows={3}
                placeholder={t.reportDetailsPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-400 resize-none"
              />
              {errorMsg && <p className="text-[10px] text-rose-400 mt-1 font-semibold">{errorMsg}</p>}
            </div>

            {/* Severity Level */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                {t.reportSeverityLabel}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {severities.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id)}
                    className={`py-1.5 rounded-xl border text-[11px] font-bold uppercase transition-all cursor-pointer text-center ${
                      severity === s.id ? s.color + ' shadow-sm' : 'bg-white/5 border-white/10 text-neutral-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all cursor-pointer transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{t.reportSubmitBtn}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
