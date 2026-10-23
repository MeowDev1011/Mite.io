import React, { useState, useEffect } from 'react';
import {
  Shield,
  X,
  Check,
  Save,
  Terminal,
  Code2,
  Crown,
  Zap,
  Flame,
  Star,
  Sparkles,
  CheckCircle2,
  Users,
  UserPlus,
  Trash2,
  RefreshCw,
  LogIn,
  VolumeX,
  Volume2,
  AlertTriangle,
  Ban,
  RotateCcw,
  Snowflake,
  Gauge,
  TrendingDown,
  Lock,
  Unlock,
  Gift,
  Coins,
  UserX,
  Clock,
  HeartHandshake,
  MessageSquareWarning,
  Send,
} from 'lucide-react';
import { TranslationStrings } from '../i18n/languages';
import {
  reportStorage,
  UserReport,
  DevBadgeConfig,
  RegisteredUserEntry,
  ModerationAction,
} from '../storage/reportStorage';
import { profileStorage } from '../storage/profileStorage';
import { DevBadge } from './DevBadge';
import { signInWithGoogle, auth } from '../firebase';

interface DevAdminModalProps {
  onClose: () => void;
  t: TranslationStrings;
}

export const DevAdminModal: React.FC<DevAdminModalProps> = ({ onClose, t }) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'badge'>('reports');
  const [reports, setReports] = useState<UserReport[]>(() => reportStorage.getReports());
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [devConfig, setDevConfig] = useState<DevBadgeConfig>(() => reportStorage.getDevConfig());
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Users & DEV Registry state
  const [firstDevId, setFirstDevId] = useState<string | null>(null);
  const [devIds, setDevIds] = useState<string[]>([]);
  const [usersList, setUsersList] = useState<RegisteredUserEntry[]>([]);
  const [manualUserIdInput, setManualUserIdInput] = useState<string>('');
  const [firebaseUserEmail, setFirebaseUserEmail] = useState<string | null>(() => auth.currentUser?.email || null);

  // Resolution note draft per report
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});

  // Interactive Warning & Mandatory Question Composer State
  const [warnTargetQuery, setWarnTargetQuery] = useState<string | null>(null);
  const [warnCustomMessage, setWarnCustomMessage] = useState<string>('');
  const [warnCustomQuestion, setWarnCustomQuestion] = useState<string>('');

  const myDeviceId = profileStorage.getDeviceId();

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [latestReports, registry] = await Promise.all([
        reportStorage.fetchReportsFromBackend(),
        reportStorage.fetchDevRegistry(),
      ]);
      setReports(latestReports);
      setFirstDevId(registry.firstDevId || null);
      setDevIds(registry.devIds);
      setUsersList(registry.users);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3200);
  };

  const handleStatusChange = async (id: string, status: UserReport['status']) => {
    const note = activeNotes[id] || '';
    await reportStorage.updateReportStatus(id, status, note || undefined);
    setReports(reportStorage.getReports());
    showToast(t.devActionAppliedToast);
  };

  const handleDeleteReport = async (id: string) => {
    await reportStorage.deleteReport(id);
    setReports(reportStorage.getReports());
  };

  const handleToggleUserDev = async (targetQuery: string, makeDev: boolean) => {
    const cleanId = targetQuery.trim();
    if (!cleanId) {
      showToast(t.devUserNotFoundToast);
      return;
    }
    const ok = await reportStorage.setUserDevStatus(cleanId, makeDev);
    if (!ok) {
      showToast(t.devUserNotExistingToast);
      return;
    }
    await refreshData();
    showToast(`${cleanId} → ${makeDev ? t.devMakeDevBtn : t.devRevokeDevBtn}`);
  };

  const handleModerateUser = async (
    targetQuery: string,
    action: ModerationAction,
    warningMessage?: string,
    warningQuestion?: string
  ) => {
    const cleanQuery = targetQuery.trim();
    if (!cleanQuery) {
      showToast(t.devUserNotFoundToast);
      return;
    }
    const ok = await reportStorage.moderateUser(cleanQuery, action, warningMessage, warningQuestion);
    if (!ok) {
      showToast(t.devUserNotExistingToast);
      return;
    }
    await refreshData();
    showToast(`${cleanQuery} → ${t.devActionAppliedToast}`);
  };

  const openInteractiveWarningComposer = (targetQuery: string) => {
    const clean = targetQuery.trim();
    if (!clean) {
      showToast(t.devUserNotFoundToast);
      return;
    }
    setWarnTargetQuery(clean);
    setWarnCustomMessage('');
    setWarnCustomQuestion('');
  };

  const handleSendInteractiveWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warnTargetQuery) return;
    await handleModerateUser(
      warnTargetQuery,
      'warn_interactive',
      warnCustomMessage.trim() || undefined,
      warnCustomQuestion.trim() || undefined
    );
    setWarnTargetQuery(null);
    setWarnCustomMessage('');
    setWarnCustomQuestion('');
  };

  const handleGrantManualId = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualUserIdInput.trim();
    if (!cleanId) {
      showToast(t.devUserNotFoundToast);
      return;
    }
    await handleToggleUserDev(cleanId, true);
    setManualUserIdInput('');
  };

  const handleSaveBadge = () => {
    reportStorage.saveDevConfig(devConfig);
    showToast(t.devBadgeSaved);
  };

  const handleFirebaseSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      setFirebaseUserEmail(user.email);
      await refreshData();
      showToast(`Firebase: ${user.email}`);
    }
  };

  const getCategoryLabel = (cat: UserReport['category']) => {
    switch (cat) {
      case 'cheat':
        return t.reportCategoryCheat;
      case 'bug':
        return t.reportCategoryBug;
      case 'behavior':
        return t.reportCategoryBehavior;
      case 'desync':
        return t.reportCategoryDesync;
      default:
        return t.reportCategoryOther;
    }
  };

  const getSeverityLabel = (sev: UserReport['severity']) => {
    switch (sev) {
      case 'low':
        return t.reportSeverityLow;
      case 'medium':
        return t.reportSeverityMedium;
      case 'high':
        return t.reportSeverityHigh;
      case 'critical':
        return t.reportSeverityCritical;
      default:
        return t.reportSeverityMedium;
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const iconPresets = [
    { id: 'code', label: t.iconCode, icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'terminal', label: t.iconTerminal, icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'shield', label: t.iconShield, icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'crown', label: t.iconCrown, icon: <Crown className="w-3.5 h-3.5" /> },
    { id: 'zap', label: t.iconZap, icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'flame', label: t.iconFlame, icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'star', label: t.iconStar, icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'sparkles', label: t.iconSparkles, icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'check', label: t.iconCheck, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'custom', label: t.iconCustom, icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  const colorPresets = ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#ffffff'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md pointer-events-auto select-none animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl p-4 sm:p-7 rounded-3xl bg-neutral-950/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
                <span>{t.devPanelTitle}</span>
                <DevBadge config={devConfig} size="md" tooltip={t.devBadgeTooltip} />
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-400">{t.devModalSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={refreshData}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
              title={t.refreshListTitle}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {saveToast && (
          <div className="my-2 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold text-center shrink-0">
            {saveToast}
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-3 pb-2 border-b border-white/5 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            {t.reportBtn} ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.devUsersTab} ({usersList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('badge')}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'badge'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            {t.devBadgeTitle}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {/* TAB 1: REAL REPORTS INBOX & RESOLUTION */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {/* Filter Row */}
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  {(['all', 'pending', 'resolved'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        filter === f ? 'bg-white/15 text-white font-black' : 'text-neutral-500 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? t.filterAll : f === 'pending' ? t.devStatusPending : t.devStatusResolved}
                    </button>
                  ))}
                </div>
                <span>
                  {filteredReports.length} {t.devReportsCountLabel}
                </span>
              </div>

              {filteredReports.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">{t.noReportsFound}</div>
              ) : (
                filteredReports.map((r) => {
                  const isResolved = r.status === 'resolved';
                  const statusLabel =
                    r.status === 'resolved'
                      ? t.devStatusResolved
                      : r.status === 'investigating'
                      ? t.devStatusInvestigating
                      : r.status === 'dismissed'
                      ? t.devStatusDismissed
                      : t.devStatusPending;

                  return (
                    <div
                      key={r.id}
                      className={`p-3.5 rounded-2xl border transition-all text-left space-y-2.5 ${
                        isResolved
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : r.severity === 'critical' || r.severity === 'high'
                          ? 'bg-rose-950/25 border-rose-500/40 shadow-sm'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {/* Top Bar */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-white/10 text-white">
                            {getCategoryLabel(r.category)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                              r.severity === 'critical'
                                ? 'bg-rose-600 text-white'
                                : r.severity === 'high'
                                ? 'bg-orange-600 text-white'
                                : 'bg-white/10 text-neutral-300'
                            }`}
                          >
                            {getSeverityLabel(r.severity)}
                          </span>
                          {r.reportedUser && (
                            <span className="text-xs font-bold text-cyan-300">@{r.reportedUser}</span>
                          )}
                          {r.reporterDeviceId && (
                            <span className="text-[10px] font-mono text-neutral-400">
                              ID: {r.reporterDeviceId}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isResolved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {statusLabel}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(r.timestamp).toLocaleTimeString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(r.id)}
                            className="p-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 cursor-pointer"
                            title={t.devDeleteReportBtn}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <p className="text-xs text-neutral-200 leading-relaxed font-sans">{r.details}</p>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {t.devWhenOccurredLabel} {r.when}
                      </div>

                      {/* Dev Notes Display */}
                      {r.devNotes && (
                        <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-emerald-300">
                          <strong>DEV:</strong> {r.devNotes}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        {!isResolved && (
                          <input
                            type="text"
                            placeholder={t.devNotesPlaceholder}
                            value={activeNotes[r.id] || ''}
                            onChange={(e) => setActiveNotes({ ...activeNotes, [r.id]: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none"
                          />
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {!isResolved && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(r.id, 'resolved')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black text-xs flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{t.devResolveReport}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(r.id, 'investigating')}
                                className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 font-bold text-xs transition-all cursor-pointer"
                              >
                                <span>{t.devInvestigateReport}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(r.id, 'dismissed')}
                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 font-semibold text-xs transition-all cursor-pointer"
                              >
                                <span>{t.devDismissReport}</span>
                              </button>
                            </>
                          )}
                          {(r.reportedUser || r.reporterDeviceId) && (
                            <button
                              type="button"
                              onClick={() => {
                                setManualUserIdInput(r.reportedUser || r.reporterDeviceId || '');
                                setActiveTab('users');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{t.devQuickModerateBtn}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: USER MODERATION & DEV PERMISSIONS (By ID or Username + User List) */}
          {activeTab === 'users' && (
            <div className="space-y-4 text-left">
              {/* First User Automatic Detection + Security & Visibility Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="space-y-1 flex-1 min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        {t.devPrimaryFounderBadge}: {firstDevId || myDeviceId}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {t.devFirstUserNotice}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleFirebaseSignIn}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-cyan-300 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{firebaseUserEmail ? firebaseUserEmail : t.devSyncFirebaseBtn}</span>
                  </button>
                </div>

                {/* DEV Button Exclusivity & Public Badge Visibility Info */}
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-200 space-y-0.5">
                  <div className="font-black text-emerald-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{t.devAccessNoticeTitle}</span>
                  </div>
                  <p className="text-neutral-300 leading-snug">{t.devAccessNoticeDesc}</p>
                </div>
              </div>

              {/* Interactive Warning & Mandatory Question Composer Modal/Card */}
              {warnTargetQuery && (
                <form
                  onSubmit={handleSendInteractiveWarning}
                  className="p-4 rounded-2xl bg-orange-950/40 border-2 border-orange-500/60 shadow-[0_0_30px_rgba(249,115,22,0.25)] space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-orange-300 font-black text-xs uppercase tracking-wider">
                      <MessageSquareWarning className="w-4 h-4 text-orange-400" />
                      <span>
                        {t.devWarnComposerTitle} → <strong className="text-white">{warnTargetQuery}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWarnTargetQuery(null)}
                      className="px-2 py-0.5 rounded-lg bg-white/10 text-neutral-300 hover:text-white text-[10px] font-bold cursor-pointer"
                    >
                      {t.devWarnCancelBtn}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-orange-200 block">
                      {t.devWarnCustomMessageLabel}
                    </label>
                    <input
                      type="text"
                      value={warnCustomMessage}
                      onChange={(e) => setWarnCustomMessage(e.target.value)}
                      placeholder={t.devWarnCustomMessagePlaceholder}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-orange-500/40 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-200 block">
                      {t.devWarnQuestionLabel}
                    </label>
                    <input
                      type="text"
                      value={warnCustomQuestion}
                      onChange={(e) => setWarnCustomQuestion(e.target.value)}
                      placeholder={t.devWarnQuestionPlaceholder}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/40 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setWarnTargetQuery(null)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold cursor-pointer"
                    >
                      {t.devWarnCancelBtn}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t.devWarnSendBtn}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Manual Input: Enter or Paste User ID OR Username to Make DEV or Moderate (Strictly Real Users) */}
              <form
                onSubmit={handleGrantManualId}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5"
              >
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.devGrantByIdOrUserTitle}</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    value={manualUserIdInput}
                    onChange={(e) => setManualUserIdInput(e.target.value)}
                    placeholder={t.devEnterUserOrIdPlaceholder}
                    className="flex-1 w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{t.devMakeDevBtn}</span>
                  </button>
                </div>

                {/* All 17 Moderation Functions for typed ID or Username */}
                <div className="pt-1 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    {t.devModerationTitle} (17):
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openInteractiveWarningComposer(manualUserIdInput)}
                      className="px-2 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/35 border border-orange-500/40 text-orange-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquareWarning className="w-3 h-3" />
                      <span>{t.devModInteractiveWarnBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'toggle_mute')}
                      className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <VolumeX className="w-3 h-3" />
                      <span>2. {t.devModMuteBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'toggle_freeze')}
                      className="px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/30 text-sky-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Snowflake className="w-3 h-3" />
                      <span>{t.devModFreezeBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'toggle_slow')}
                      className="px-2 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Gauge className="w-3 h-3" />
                      <span>{t.devModSlowBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'drain_mass')}
                      className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 text-purple-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <TrendingDown className="w-3 h-3" />
                      <span>{t.devModDrainMassBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'toggle_lock_split')}
                      className="px-2 py-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/30 border border-pink-500/30 text-pink-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3 h-3" />
                      <span>{t.devModLockSplitBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'toggle_lock_eject')}
                      className="px-2 py-1 rounded-lg bg-fuchsia-500/15 hover:bg-fuchsia-500/30 border border-fuchsia-500/30 text-fuchsia-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3 h-3" />
                      <span>{t.devModLockEjectBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'gift_cytes')}
                      className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Gift className="w-3 h-3" />
                      <span>{t.devModGiftCytesBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'fine_cytes')}
                      className="px-2 py-1 rounded-lg bg-yellow-500/15 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Coins className="w-3 h-3" />
                      <span>{t.devModFineCytesBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'reset_cytes')}
                      className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>10. {t.devModResetBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'reset_upgrades')}
                      className="px-2 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/30 border border-teal-500/30 text-teal-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t.devModResetUpgradesBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'strip_organs')}
                      className="px-2 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t.devModStripOrgansBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'force_rename')}
                      className="px-2 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/30 border border-violet-500/30 text-violet-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <UserX className="w-3 h-3" />
                      <span>{t.devModForceRenameBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'kick_match')}
                      className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>{t.devModKickMatchBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'temp_ban_5m')}
                      className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/40 text-rose-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{t.devModTempBan5mBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'toggle_ban')}
                      className="px-2 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/45 border border-rose-500/50 text-rose-100 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Ban className="w-3 h-3" />
                      <span>16. {t.devModBanBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateUser(manualUserIdInput, 'pardon')}
                      className="px-2 py-1 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-400/50 text-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <HeartHandshake className="w-3 h-3" />
                      <span>{t.devModPardonBtn}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Strictly Real Existing Users List with Full 17-Action Moderation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                    {t.devRegisteredUsersTitle} ({usersList.length})
                  </h4>
                  <span className="text-[10px] text-emerald-300 font-semibold">
                    {t.devOnlyRealUsersNotice}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {usersList.map((u) => {
                    const isPrimary = u.deviceId === firstDevId;
                    const isUserDev = u.isDev || devIds.includes(u.deviceId);
                    const isMe = u.deviceId === myDeviceId;
                    const isTempBanned = Boolean(u.tempBanUntil && u.tempBanUntil > Date.now());

                    return (
                      <div
                        key={u.deviceId}
                        className={`p-3 rounded-2xl border flex flex-col gap-2.5 ${
                          u.isBanned || isTempBanned
                            ? 'bg-rose-950/35 border-rose-500/50'
                            : isUserDev
                            ? 'bg-amber-950/25 border-amber-500/40'
                            : 'bg-black/40 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-black text-white">
                                {u.name} {isMe ? t.youSuffix : ''}
                              </span>
                              {isUserDev && (
                                <DevBadge
                                  config={u.devBadge || devConfig}
                                  size="sm"
                                  tooltip={t.devBadgeTooltip}
                                />
                              )}
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                  u.isOnline
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-white/5 text-neutral-400'
                                }`}
                              >
                                {u.isOnline ? t.devOnlineBadge : t.devOfflineBadge}
                              </span>
                              {isPrimary && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-black uppercase">
                                  {t.devPrimaryFounderBadge}
                                </span>
                              )}
                              {u.isMuted && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-600/30 text-amber-200 text-[9px] font-black uppercase">
                                  {t.devMutedBadge}
                                </span>
                              )}
                              {u.isFrozen && (
                                <span className="px-2 py-0.5 rounded-md bg-sky-600/30 text-sky-200 text-[9px] font-black uppercase">
                                  {t.devFrozenBadge}
                                </span>
                              )}
                              {u.isSlowed && (
                                <span className="px-2 py-0.5 rounded-md bg-indigo-600/30 text-indigo-200 text-[9px] font-black uppercase">
                                  {t.devSlowedBadge}
                                </span>
                              )}
                              {u.isSplitLocked && (
                                <span className="px-2 py-0.5 rounded-md bg-pink-600/30 text-pink-200 text-[9px] font-black uppercase">
                                  {t.devSplitLockedBadge}
                                </span>
                              )}
                              {u.isEjectLocked && (
                                <span className="px-2 py-0.5 rounded-md bg-fuchsia-600/30 text-fuchsia-200 text-[9px] font-black uppercase">
                                  {t.devEjectLockedBadge}
                                </span>
                              )}
                              {isTempBanned && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-500/40 text-rose-100 text-[9px] font-black uppercase">
                                  {t.devTempBannedBadge}
                                </span>
                              )}
                              {u.isBanned && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase">
                                  {t.devBannedBadge}
                                </span>
                              )}
                              {(u.warnings || 0) > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-orange-500/30 text-orange-200 text-[9px] font-black uppercase">
                                  {t.devWarningsBadge}: {u.warnings}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-cyan-300">
                              ID: <strong className="select-text">{u.deviceId}</strong> · {u.deviceType} · {u.cytes} {t.cytes}
                            </div>
                          </div>

                          {/* DEV Role Toggle */}
                          <div>
                            {isUserDev ? (
                              !isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserDev(u.deviceId, false)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-300 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  {t.devRevokeDevBtn}
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleUserDev(u.deviceId, true)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                              >
                                {t.devMakeDevBtn}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 17 Moderation Action Buttons for this User */}
                        <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-white/5">
                          {/* 1. Interactive Warning + Question */}
                          <button
                            type="button"
                            onClick={() => openInteractiveWarningComposer(u.deviceId)}
                            className="px-2 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/35 border border-orange-500/40 text-orange-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquareWarning className="w-3 h-3" />
                            <span>{t.devModInteractiveWarnBtn}</span>
                          </button>

                          {/* 2. Mute / Unmute */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, u.isMuted ? 'unmute' : 'mute')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-amber-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {u.isMuted ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                            <span>2. {u.isMuted ? t.devModUnmuteBtn : t.devModMuteBtn}</span>
                          </button>

                          {/* 3. Freeze / Unfreeze */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, u.isFrozen ? 'unfreeze' : 'freeze')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sky-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Snowflake className="w-3 h-3" />
                            <span>{u.isFrozen ? t.devModUnfreezeBtn : t.devModFreezeBtn}</span>
                          </button>

                          {/* 4. Slow 50% / Normal Speed */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, u.isSlowed ? 'unslow' : 'slow')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Gauge className="w-3 h-3" />
                            <span>{u.isSlowed ? t.devModUnslowBtn : t.devModSlowBtn}</span>
                          </button>

                          {/* 5. Drain Mass to 18 */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, 'drain_mass')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <TrendingDown className="w-3 h-3" />
                            <span>{t.devModDrainMassBtn}</span>
                          </button>

                          {/* 6. Lock / Unlock Split */}
                          <button
                            type="button"
                            onClick={() =>
                              handleModerateUser(u.deviceId, u.isSplitLocked ? 'unlock_split' : 'lock_split')
                            }
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-pink-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {u.isSplitLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{u.isSplitLocked ? t.devModUnlockSplitBtn : t.devModLockSplitBtn}</span>
                          </button>

                          {/* 7. Lock / Unlock Spores */}
                          <button
                            type="button"
                            onClick={() =>
                              handleModerateUser(u.deviceId, u.isEjectLocked ? 'unlock_eject' : 'lock_eject')
                            }
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-fuchsia-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {u.isEjectLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{u.isEjectLocked ? t.devModUnlockEjectBtn : t.devModLockEjectBtn}</span>
                          </button>

                          {/* 8. Gift +500 Cytes */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, 'gift_cytes')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Gift className="w-3 h-3" />
                            <span>{t.devModGiftCytesBtn}</span>
                          </button>

                          {/* 9. Fine -250 Cytes */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, 'fine_cytes')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-yellow-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Coins className="w-3 h-3" />
                            <span>{t.devModFineCytesBtn}</span>
                          </button>

                          {/* 10. Reset Cytes to 0 */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, 'reset_cytes')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>10. {t.devModResetBtn}</span>
                          </button>

                          {/* 11. Reset Upgrades */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, 'reset_upgrades')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-teal-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{t.devModResetUpgradesBtn}</span>
                          </button>

                          {/* 12. Strip Conquered Organs */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, 'strip_organs')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-red-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t.devModStripOrgansBtn}</span>
                          </button>

                          {/* 13. Force Sanctioned Name */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, 'force_rename')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-violet-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <UserX className="w-3 h-3" />
                            <span>{t.devModForceRenameBtn}</span>
                          </button>

                          {/* 14. Kick from Match */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, 'kick_match')}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-rose-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>{t.devModKickMatchBtn}</span>
                          </button>

                          {/* 15. Suspend 5 Minutes */}
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleModerateUser(u.deviceId, 'temp_ban_5m')}
                              className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Clock className="w-3 h-3" />
                              <span>{t.devModTempBan5mBtn}</span>
                            </button>
                          )}

                          {/* 16. Permanent Ban / Unban */}
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleModerateUser(u.deviceId, u.isBanned ? 'unban' : 'ban')}
                              className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Ban className="w-3 h-3" />
                              <span>16. {u.isBanned ? t.devModUnbanBtn : t.devModBanBtn}</span>
                            </button>
                          )}

                          {/* 17. Pardon & Clear All Sanctions */}
                          <button
                            type="button"
                            onClick={() => handleModerateUser(u.deviceId, 'pardon')}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <HeartHandshake className="w-3 h-3" />
                            <span>{t.devModPardonBtn}</span>
                          </button>
                        </div>

                        {/* Interactive Warnings & Player Answers History */}
                        {u.interactiveWarnings && u.interactiveWarnings.length > 0 && (
                          <div className="mt-1 p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/30 space-y-1.5">
                            <div className="text-[10px] font-black uppercase tracking-wider text-orange-300">
                              {t.devWarnHistoryTitle}
                            </div>
                            {u.interactiveWarnings.slice(0, 3).map((w) => (
                              <div
                                key={w.id}
                                className="p-2 rounded-lg bg-black/50 border border-white/5 text-[11px] space-y-1"
                              >
                                <div className="text-orange-200">
                                  <strong>DEV:</strong> {w.message}
                                </div>
                                <div className="text-amber-200">
                                  <strong>?:</strong> {w.question}
                                </div>
                                {w.answered ? (
                                  <div className="text-emerald-300 font-bold">
                                    ✓ {t.devWarnPlayerAnswered} "{w.answerText}"
                                  </div>
                                ) : (
                                  <div className="text-neutral-400 italic">{t.devWarnWaitingAnswer}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMIZABLE DEV BADGE (Title, Color, Icon Presets + Custom SVG Code) */}
          {activeTab === 'badge' && (
            <div className="space-y-4 text-left">
              {/* Preview Banner */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    {t.devLivePreviewLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">
                      {profileStorage.getProfile().name || t.devYourNamePreview}
                    </span>
                    <DevBadge config={devConfig} size="md" tooltip={t.devBadgeTooltip} />
                  </div>
                </div>
              </div>

              {/* Title / Role Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  {t.devCustomRole}
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={devConfig.title}
                  onChange={(e) => setDevConfig({ ...devConfig, title: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-black text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Hex Color Picker & Presets */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  {t.devCustomColor}
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    type="color"
                    value={devConfig.color}
                    onChange={(e) => setDevConfig({ ...devConfig, color: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={devConfig.color}
                    onChange={(e) => setDevConfig({ ...devConfig, color: e.target.value })}
                    className="w-28 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {colorPresets.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setDevConfig({ ...devConfig, color: c })}
                        className="w-6 h-6 rounded-full border border-white/20 cursor-pointer shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 1st Icon Preset Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  {t.devIconPreset1}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {iconPresets.map((p) => {
                    const isSelected =
                      p.id === 'custom'
                        ? devConfig.iconPreset1 === 'custom' || !!devConfig.customSvg1
                        : devConfig.iconPreset1 === p.id && !devConfig.customSvg1;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setDevConfig({
                            ...devConfig,
                            iconPreset1: p.id,
                            customSvg1: p.id === 'custom' ? devConfig.customSvg1 || '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg>' : undefined,
                          })
                        }
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 font-black'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                        }`}
                      >
                        {p.icon}
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
                {(devConfig.iconPreset1 === 'custom' || !!devConfig.customSvg1) && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[11px] font-bold text-amber-300 block">
                      {t.devCustomSvgCode}
                    </span>
                    <input
                      type="text"
                      placeholder={t.devCustomSvgCode}
                      value={devConfig.customSvg1 || ''}
                      onChange={(e) => setDevConfig({ ...devConfig, iconPreset1: 'custom', customSvg1: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-amber-400/50 text-[11px] font-mono text-white placeholder-neutral-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 2nd Icon Preset Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  {t.devIconPreset2}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {iconPresets.map((p) => {
                    const isSelected =
                      p.id === 'custom'
                        ? devConfig.iconPreset2 === 'custom' || !!devConfig.customSvg2
                        : devConfig.iconPreset2 === p.id && !devConfig.customSvg2;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setDevConfig({
                            ...devConfig,
                            iconPreset2: p.id,
                            customSvg2: p.id === 'custom' ? devConfig.customSvg2 || '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg>' : undefined,
                          })
                        }
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 font-black'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                        }`}
                      >
                        {p.icon}
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
                {(devConfig.iconPreset2 === 'custom' || !!devConfig.customSvg2) && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[11px] font-bold text-amber-300 block">
                      {t.devCustomSvgCode}
                    </span>
                    <input
                      type="text"
                      placeholder={t.devCustomSvgCode}
                      value={devConfig.customSvg2 || ''}
                      onChange={(e) => setDevConfig({ ...devConfig, iconPreset2: 'custom', customSvg2: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-amber-400/50 text-[11px] font-mono text-white placeholder-neutral-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveBadge}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t.devSaveBadge}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
