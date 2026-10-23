/**
 * Report Storage and Dev Badge Configuration Storage
 * Connects with Firebase Firestore + Backend Server API + Local Cache.
 * No fake seed reports — strictly real user reports and real first-user DEV detection.
 */

import { getOrCreateDeviceId } from './deviceId';
import {
  db,
  auth,
  doc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  handleFirestoreError,
  OperationType,
} from '../firebase';

export interface UserReport {
  id: string;
  category: 'cheat' | 'bug' | 'behavior' | 'desync' | 'other';
  reportedUser?: string;
  reporterDeviceId?: string;
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

export interface InteractiveWarningEntry {
  id: string;
  message: string;
  question: string;
  createdAt: number;
  answered: boolean;
  answerText?: string;
  answeredAt?: number;
}

export interface RegisteredUserEntry {
  deviceId: string;
  name: string;
  deviceType: string;
  cytes: number;
  isOnline?: boolean;
  isDev: boolean;
  isFirstDev?: boolean;
  devBadge?: DevBadgeConfig;
  isMuted?: boolean;
  isBanned?: boolean;
  tempBanUntil?: number;
  isFrozen?: boolean;
  isSlowed?: boolean;
  isSplitLocked?: boolean;
  isEjectLocked?: boolean;
  warnings?: number;
  interactiveWarnings?: InteractiveWarningEntry[];
}

export type ModerationAction =
  | 'warn_interactive'
  | 'warn'
  | 'mute'
  | 'unmute'
  | 'toggle_mute'
  | 'freeze'
  | 'unfreeze'
  | 'toggle_freeze'
  | 'slow'
  | 'unslow'
  | 'toggle_slow'
  | 'drain_mass'
  | 'lock_split'
  | 'unlock_split'
  | 'toggle_lock_split'
  | 'lock_eject'
  | 'unlock_eject'
  | 'toggle_lock_eject'
  | 'gift_cytes'
  | 'fine_cytes'
  | 'reset'
  | 'reset_cytes'
  | 'reset_upgrades'
  | 'strip_organs'
  | 'force_rename'
  | 'kick_match'
  | 'temp_ban_5m'
  | 'ban'
  | 'unban'
  | 'toggle_ban'
  | 'pardon';

const REPORTS_KEY = 'mite_io_user_reports_v2';
const DEV_BADGE_KEY = 'mite_io_dev_badge_config_v2';

const DEFAULT_DEV_CONFIG: DevBadgeConfig = {
  isDev: true,
  title: 'DEV',
  color: '#fbbf24', // Royal Gold default
  iconPreset1: 'code',
  iconPreset2: 'shield',
};

const currentDeviceId = getOrCreateDeviceId();

// Clean up any legacy fake seed reports from old storage key
try {
  localStorage.removeItem('mite_io_user_reports_v1');
} catch {}

export const reportStorage = {
  getReports(): UserReport[] {
    try {
      const data = localStorage.getItem(REPORTS_KEY);
      if (!data) return [];
      const parsed: UserReport[] = JSON.parse(data);
      return parsed.filter((r) => r.id !== 'rep_seed_1' && r.id !== 'rep_seed_2');
    } catch {
      return [];
    }
  },

  async fetchReportsFromBackend(): Promise<UserReport[]> {
    let combined = this.getReports();

    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.reports)) {
          const map = new Map<string, UserReport>();
          for (const r of [...json.reports, ...combined]) {
            if (r.id !== 'rep_seed_1' && r.id !== 'rep_seed_2') {
              map.set(r.id, r);
            }
          }
          combined = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
          localStorage.setItem(REPORTS_KEY, JSON.stringify(combined));
        }
      }
    } catch {}

    // If user is authenticated in Firebase with verified email, also sync from Firestore
    const user = auth.currentUser;
    if (user && user.emailVerified) {
      const isAdminEmail = user.email === 'carmenmena1204@gmail.com';
      const path = 'reports';
      try {
        const q = isAdminEmail
          ? collection(db, path)
          : query(collection(db, path), where('reporterUid', '==', user.uid));
        const snap = await getDocs(q);
        const map = new Map<string, UserReport>();
        for (const r of combined) map.set(r.id, r);
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.id && d.id !== 'rep_seed_1' && d.id !== 'rep_seed_2') {
            map.set(d.id, {
              id: d.id,
              category: d.category || 'bug',
              reportedUser: d.reportedUser,
              reporterDeviceId: d.reporterDeviceId,
              when: d.when || '',
              details: d.details || '',
              severity: d.severity || 'medium',
              timestamp: d.createdAt?.toMillis ? d.createdAt.toMillis() : Date.now(),
              status: d.status || 'pending',
              devNotes: d.devNotes,
            });
          }
        });
        combined = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        localStorage.setItem(REPORTS_KEY, JSON.stringify(combined));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }

    return combined;
  },

  addReport(report: Omit<UserReport, 'id' | 'timestamp' | 'status'>): UserReport {
    const reports = this.getReports();
    const cleanId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newReport: UserReport = {
      ...report,
      id: cleanId,
      reporterDeviceId: currentDeviceId,
      timestamp: Date.now(),
      status: 'pending',
    };
    reports.unshift(newReport);
    try {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch {}

    // Sync to server API
    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    }).catch(() => {});

    // Sync to Firestore if signed in with verified email
    const user = auth.currentUser;
    if (user && user.emailVerified) {
      const path = `reports/${cleanId}`;
      const payload: Record<string, any> = {
        id: cleanId,
        reporterUid: user.uid,
        reporterDeviceId: currentDeviceId.slice(0, 128),
        category: newReport.category,
        when: (newReport.when || 'just_now').slice(0, 128),
        details: newReport.details.slice(0, 2000),
        severity: newReport.severity,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (newReport.reportedUser) {
        payload.reportedUser = newReport.reportedUser.slice(0, 64);
      }
      setDoc(doc(db, 'reports', cleanId), payload).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, path);
      });
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
      } catch {}
    }

    fetch(`/api/reports/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, devNotes }),
    }).catch(() => {});

    const user = auth.currentUser;
    if (user && user.emailVerified && user.email === 'carmenmena1204@gmail.com') {
      const path = `reports/${id}`;
      const updatePayload: Record<string, any> = {
        status,
        updatedAt: serverTimestamp(),
      };
      if (devNotes !== undefined) {
        updatePayload.devNotes = devNotes.slice(0, 2000);
      }
      updateDoc(doc(db, 'reports', id), updatePayload).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, path);
      });
    }
  },

  deleteReport(id: string) {
    const reports = this.getReports().filter((r) => r.id !== id);
    try {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch {}

    fetch(`/api/reports/${id}`, { method: 'DELETE' }).catch(() => {});

    const user = auth.currentUser;
    if (user && user.emailVerified && user.email === 'carmenmena1204@gmail.com') {
      const path = `reports/${id}`;
      deleteDoc(doc(db, 'reports', id)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, path);
      });
    }
  },

  getDevConfig(): DevBadgeConfig {
    try {
      const data = localStorage.getItem(DEV_BADGE_KEY);
      if (!data) {
        localStorage.setItem(DEV_BADGE_KEY, JSON.stringify(DEFAULT_DEV_CONFIG));
        return DEFAULT_DEV_CONFIG;
      }
      const parsed = JSON.parse(data);
      return { ...DEFAULT_DEV_CONFIG, ...parsed, isDev: parsed.isDev !== false };
    } catch {
      return DEFAULT_DEV_CONFIG;
    }
  },

  saveDevConfig(config: Partial<DevBadgeConfig>): DevBadgeConfig {
    const current = this.getDevConfig();
    const updated = { ...current, ...config };
    try {
      localStorage.setItem(DEV_BADGE_KEY, JSON.stringify(updated));
    } catch {}

    fetch('/api/devs/badge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: currentDeviceId, config: updated }),
    }).catch(() => {});

    const user = auth.currentUser;
    if (user && user.emailVerified && user.email === 'carmenmena1204@gmail.com') {
      const path = `devs/${user.uid}`;
      setDoc(
        doc(db, 'devs', user.uid),
        {
          deviceId: currentDeviceId.slice(0, 128),
          grantedByUid: user.uid,
          title: (updated.title || 'DEV').slice(0, 32),
          color: (updated.color || '#fbbf24').slice(0, 16),
          iconPreset1: (updated.iconPreset1 || 'code').slice(0, 32),
          iconPreset2: (updated.iconPreset2 || 'shield').slice(0, 32),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    }

    return updated;
  },

  async fetchDevRegistry(): Promise<{
    firstDevId?: string;
    devIds: string[];
    users: RegisteredUserEntry[];
  }> {
    try {
      const res = await fetch(`/api/devs?deviceId=${encodeURIComponent(currentDeviceId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const isMeDev =
            json.firstDevId === currentDeviceId ||
            !Array.isArray(json.devIds) ||
            json.devIds.includes(currentDeviceId);
          const currentCfg = this.getDevConfig();
          if (currentCfg.isDev !== isMeDev) {
            localStorage.setItem(DEV_BADGE_KEY, JSON.stringify({ ...currentCfg, isDev: isMeDev }));
          }
          return {
            firstDevId: json.firstDevId || currentDeviceId,
            devIds: json.devIds || [currentDeviceId],
            users: json.users || [],
          };
        }
      }
    } catch {}
    return {
      firstDevId: currentDeviceId,
      devIds: [currentDeviceId],
      users: [
        {
          deviceId: currentDeviceId,
          name: 'DEV',
          deviceType: 'Actual',
          cytes: 0,
          isDev: true,
          isFirstDev: true,
        },
      ],
    };
  },

  async setUserDevStatus(targetQuery: string, isDev: boolean): Promise<boolean> {
    try {
      const res = await fetch('/api/devs/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDeviceId: targetQuery, targetQuery, isDev }),
      });
      if (res.ok) {
        const json = await res.json();
        return !!json.success;
      }
    } catch {}
    return false;
  },

  async moderateUser(
    targetQuery: string,
    action: ModerationAction,
    warningMessage?: string,
    warningQuestion?: string
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/users/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetQuery,
          action,
          warningMessage,
          warningQuestion,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return !!json.success;
      }
    } catch {}
    return false;
  },

  async respondToWarning(warningId: string, answerText: string): Promise<boolean> {
    try {
      const res = await fetch('/api/users/warning-respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: currentDeviceId,
          warningId,
          answerText: answerText.trim(),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return !!json.success;
      }
    } catch {}
    return false;
  },
};
