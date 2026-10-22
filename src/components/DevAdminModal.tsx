import React, { useState } from 'react';
import { Shield, X, Check, Save, Terminal, Code2, Crown, Zap, Flame, Star, Sparkles, CheckCircle2, AlertTriangle, Bug, MessageSquare } from 'lucide-react';
import { TranslationStrings } from '../i18n/languages';
import { reportStorage, UserReport, DevBadgeConfig } from '../storage/reportStorage';
import { DevBadge, renderDevSvgIcon } from './DevBadge';

interface DevAdminModalProps {
  onClose: () => void;
  t: TranslationStrings;
}

export const DevAdminModal: React.FC<DevAdminModalProps> = ({ onClose, t }) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'badge'>('reports');
  const [reports, setReports] = useState<UserReport[]>(() => reportStorage.getReports());
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [devConfig, setDevConfig] = useState<DevBadgeConfig>(() => reportStorage.getDevConfig());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Resolution note draft per report
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});

  const handleStatusChange = (id: string, status: UserReport['status']) => {
    const note = activeNotes[id] || '';
    reportStorage.updateReportStatus(id, status, note || undefined);
    setReports(reportStorage.getReports());
  };

  const handleSaveBadge = () => {
    reportStorage.saveDevConfig(devConfig);
    setSaveToast(t.devBadgeSaved);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const filteredReports = reports.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const iconPresets = [
    { id: 'code', label: 'Code', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'shield', label: 'Shield', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'crown', label: 'Crown', icon: <Crown className="w-3.5 h-3.5" /> },
    { id: 'zap', label: 'Zap', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'flame', label: 'Flame', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'star', label: 'Star', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'sparkles', label: 'Sparkles', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'check', label: 'Check', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  const colorPresets = ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#ffffff'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md pointer-events-auto select-none animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl p-5 sm:p-7 rounded-3xl bg-neutral-950/95 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{t.devPanelTitle}</span>
                <DevBadge config={devConfig} size="md" />
              </h3>
              <p className="text-xs text-neutral-400">Administración de reportes de bugs, trampas e insignia oficial</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {saveToast && (
          <div className="my-2 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold text-center shrink-0">
            {saveToast}
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-white/5 shrink-0">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            {t.devPanelTitle} ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('badge')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
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
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {/* Filter Row */}
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
                <div className="flex items-center gap-1.5">
                  {(['all', 'pending', 'resolved'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded-lg transition-all capitalize cursor-pointer ${
                        filter === f ? 'bg-white/15 text-white font-black' : 'text-neutral-500 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'Todos' : f === 'pending' ? t.devStatusPending : t.devStatusResolved}
                    </button>
                  ))}
                </div>
                <span>{filteredReports.length} reportes</span>
              </div>

              {filteredReports.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">{t.noReportsFound}</div>
              ) : (
                filteredReports.map((r) => {
                  const isResolved = r.status === 'resolved';

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
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono bg-white/10 text-white">
                            {r.category.toUpperCase()}
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
                            {r.severity}
                          </span>
                          {r.reportedUser && (
                            <span className="text-xs font-bold text-cyan-300">@{r.reportedUser}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isResolved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {isResolved ? t.devStatusResolved : t.devStatusPending}
                          </span>
                          <span className="text-[10px] text-neutral-500">{new Date(r.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <p className="text-xs text-neutral-200 leading-relaxed font-sans">{r.details}</p>
                      <div className="text-[10px] text-neutral-400 font-mono">Momento: {r.when}</div>

                      {/* Dev Notes Display if already resolved */}
                      {r.devNotes && (
                        <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-emerald-300">
                          <strong>DEV:</strong> {r.devNotes}
                        </div>
                      )}

                      {/* Action Bar */}
                      {!isResolved && (
                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <input
                            type="text"
                            placeholder={t.devNotesPlaceholder}
                            value={activeNotes[r.id] || ''}
                            onChange={(e) => setActiveNotes({ ...activeNotes, [r.id]: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none"
                          />
                          <div className="flex items-center gap-2">
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
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'badge' && (
            <div className="space-y-4 text-left">
              {/* Preview Banner */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Vista Previa en Tiempo Real:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">TuNombre</span>
                    <DevBadge config={devConfig} size="md" />
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
                  maxLength={10}
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
                <div className="flex items-center gap-3">
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

              {/* 1st SVG Preset Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  {t.devIconPreset1}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {iconPresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDevConfig({ ...devConfig, iconPreset1: p.id, customSvg1: undefined })}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                        devConfig.iconPreset1 === p.id && !devConfig.customSvg1
                          ? 'bg-amber-500 text-neutral-950 font-black'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                      }`}
                    >
                      {p.icon}
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
                {/* Custom Raw SVG Input 1 */}
                <input
                  type="text"
                  placeholder="O pega código SVG (<svg>...</svg>)..."
                  value={devConfig.customSvg1 || ''}
                  onChange={(e) => setDevConfig({ ...devConfig, customSvg1: e.target.value })}
                  className="mt-1.5 w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none"
                />
              </div>

              {/* 2nd SVG Preset Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  {t.devIconPreset2}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {iconPresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDevConfig({ ...devConfig, iconPreset2: p.id, customSvg2: undefined })}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                        devConfig.iconPreset2 === p.id && !devConfig.customSvg2
                          ? 'bg-amber-500 text-neutral-950 font-black'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
                      }`}
                    >
                      {p.icon}
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
                {/* Custom Raw SVG Input 2 */}
                <input
                  type="text"
                  placeholder="O pega código SVG (<svg>...</svg>)..."
                  value={devConfig.customSvg2 || ''}
                  onChange={(e) => setDevConfig({ ...devConfig, customSvg2: e.target.value })}
                  className="mt-1.5 w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none"
                />
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
