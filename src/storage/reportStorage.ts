/**
 * Report Storage and Dev Badge Configuration Storage
 * Handles user reports (cheats, bugs, behavior) and persistent DEV customization.
 */

export interface UserReport {
  id: string;
  category: 'cheat' | 'bug' | 'behavior' | 'desync' | 'other';
  reportedUser?: string;
  when: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  devNotes?: string;
  resolvedAt?: number;
}

export interface DevBadgeConfig {
  isDev: boolean;
  title: string; // e.g. "DEV", "ADMIN", "CREATOR"
  color: string; // Hex color, e.g. "#fbbf24" (gold default)
  iconPreset1: string; // e.g. "terminal", "shield", "crown", "code", "zap", "star", "custom"
  customSvg1?: string; // Optional raw SVG string
  iconPreset2: string; // e.g. "shield", "sparkles", "crown", "flame", "check", "custom"
  customSvg2?: string; // Optional raw SVG string
}

const REPORTS_KEY = 'mite_io_user_reports_v1';
const DEV_BADGE_KEY = 'mite_io_dev_badge_config_v1';

const DEFAULT_DEV_CONFIG: DevBadgeConfig = {
  isDev: true, // First user is dev by default
  title: 'DEV',
  color: '#fbbf24', // Rich royal gold
  iconPreset1: 'code',
  iconPreset2: 'shield',
};

// Seed initial reports if empty so dev panel is populated
const SEED_REPORTS: UserReport[] = [
  {
    id: 'rep_seed_1',
    category: 'bug',
    reportedUser: 'Glóbulo_Bot_9',
    when: 'Hace 10 minutos',
    details: 'En la Cripta Linfática Oculta, el multiplicador de masa se superpuso con el radar en teléfono.',
    severity: 'medium',
    timestamp: Date.now() - 600000,
    status: 'resolved',
    devNotes: 'Corregido en la versión actual con clamp y z-index limpio.',
    resolvedAt: Date.now() - 300000,
  },
  {
    id: 'rep_seed_2',
    category: 'cheat',
    reportedUser: 'Virus_Fast_X',
    when: 'Hace 2 minutos',
    details: 'Movimiento sospechoso a gran velocidad sin haber recogido la píldora de turbo.',
    severity: 'high',
    timestamp: Date.now() - 120000,
    status: 'pending',
  },
];

export const reportStorage = {
  getReports(): UserReport[] {
    try {
      const data = localStorage.getItem(REPORTS_KEY);
      if (!data) {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(SEED_REPORTS));
        return SEED_REPORTS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_REPORTS;
    }
  },

  addReport(report: Omit<UserReport, 'id' | 'timestamp' | 'status'>): UserReport {
    const reports = this.getReports();
    const newReport: UserReport = {
      ...report,
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      status: 'pending',
    };
    reports.unshift(newReport);
    try {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch {
      // storage full
    }
    return newReport;
  },

  updateReportStatus(id: string, status: UserReport['status'], devNotes?: string) {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === id);
    if (rep) {
      rep.status = status;
      if (devNotes !== undefined) rep.devNotes = devNotes;
      if (status === 'resolved') rep.resolvedAt = Date.now();
      try {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
      } catch {
        // storage full
      }
    }
  },

  deleteReport(id: string) {
    const reports = this.getReports().filter((r) => r.id !== id);
    try {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch {
      // storage full
    }
  },

  getDevConfig(): DevBadgeConfig {
    try {
      const data = localStorage.getItem(DEV_BADGE_KEY);
      if (!data) {
        localStorage.setItem(DEV_BADGE_KEY, JSON.stringify(DEFAULT_DEV_CONFIG));
        return DEFAULT_DEV_CONFIG;
      }
      return { ...DEFAULT_DEV_CONFIG, ...JSON.parse(data) };
    } catch {
      return DEFAULT_DEV_CONFIG;
    }
  },

  saveDevConfig(config: Partial<DevBadgeConfig>): DevBadgeConfig {
    const current = this.getDevConfig();
    const updated = { ...current, ...config };
    try {
      localStorage.setItem(DEV_BADGE_KEY, JSON.stringify(updated));
    } catch {
      // storage full
    }
    return updated;
  },
};
