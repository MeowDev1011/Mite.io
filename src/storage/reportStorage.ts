/**
 * Report Storage and Dev Badge Configuration Storage
 * Persists primary DEV registration, custom DEV badges, and player reports directly
 * in the user's Firebase Firestore database (mite-io) across both the named DB and '(default)' DB.
 */

import { getOrCreateDeviceId } from './deviceId';
import {
  db,
  defaultDb,
  doc,
  getDoc,
  getDocs,
  collection,
  setDocDual,
  deleteDocDual,
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
  title: string;
  color: string;
  iconPreset1: string;
  customSvg1?: string;
  iconPreset2: string;
  customSvg2?: string;
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
  isControlsInverted?: boolean;
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
  | 'boost_mass_500'
  | 'lock_split'
  | 'unlock_split'
  | 'toggle_lock_split'
  | 'lock_eject'
  | 'unlock_eject'
  | 'toggle_lock_eject'
  | 'set_custom_cytes'
  | 'add_custom_cytes'
  | 'sub_custom_cytes'
  | 'gift_cytes'
  | 'fine_cytes'
  | 'reset'
  | 'reset_cytes'
  | 'reset_upgrades'
  | 'strip_organs'
  | 'reset_skins'
  | 'force_rename'
  | 'invert_controls'
  | 'normal_controls'
  | 'toggle_invert_controls'
  | 'kick_match'
  | 'temp_ban_5m'
  | 'ban'
  | 'unban'
  | 'toggle_ban'
  | 'pardon';

const DEFAULT_DEV_CONFIG: DevBadgeConfig = {
  isDev: true,
  title: 'DEV',
  color: '#fbbf24',
  iconPreset1: 'code',
  iconPreset2: 'shield',
};

const currentDeviceId = getOrCreateDeviceId();

let memoryReports: UserReport[] = [];
let memoryDevConfig: DevBadgeConfig = { ...DEFAULT_DEV_CONFIG };

async function initDevBadgeFromFirestore() {
  try {
    let primarySnap = await getDoc(doc(db, 'devs', 'primary_dev'));
    if (!primarySnap.exists()) {
      primarySnap = await getDoc(doc(defaultDb, 'devs', 'primary_dev'));
    }
    let firstDevId = currentDeviceId;

    if (!primarySnap.exists()) {
      await setDocDual('devs', 'primary_dev', {
        deviceId: currentDeviceId,
        firstDevId: currentDeviceId,
        isPrimaryDev: true,
        isDev: true,
        title: memoryDevConfig.title || 'DEV',
        color: memoryDevConfig.color || '#fbbf24',
        iconPreset1: memoryDevConfig.iconPreset1 || 'code',
        iconPreset2: memoryDevConfig.iconPreset2 || 'shield',
        updatedAt: Date.now(),
      });
    } else {
      const pData = primarySnap.data();
      if (pData && pData.firstDevId) {
        firstDevId = pData.firstDevId;
      }
    }

    let myDevSnap = await getDoc(doc(db, 'devs', currentDeviceId));
    if (!myDevSnap.exists()) {
      myDevSnap = await getDoc(doc(defaultDb, 'devs', currentDeviceId));
    }
    if (myDevSnap.exists()) {
      const d = myDevSnap.data();
      memoryDevConfig = {
        ...DEFAULT_DEV_CONFIG,
        isDev: d.isDev !== false,
        title: d.title || 'DEV',
        color: d.color || '#fbbf24',
        iconPreset1: d.iconPreset1 || 'code',
        iconPreset2: d.iconPreset2 || 'shield',
        customSvg1: d.customSvg1,
        customSvg2: d.customSvg2,
      };
    } else if (firstDevId === currentDeviceId) {
      await setDocDual(
        'devs',
        currentDeviceId,
        {
          deviceId: currentDeviceId,
          firstDevId: currentDeviceId,
          isPrimaryDev: true,
          isDev: true,
          title: memoryDevConfig.title || 'DEV',
          color: memoryDevConfig.color || '#fbbf24',
          iconPreset1: memoryDevConfig.iconPreset1 || 'code',
          iconPreset2: memoryDevConfig.iconPreset2 || 'shield',
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  } catch {}
}

initDevBadgeFromFirestore();

export const reportStorage = {
  getReports(): UserReport[] {
    return memoryReports.filter((r) => r.id !== 'rep_seed_1' && r.id !== 'rep_seed_2');
  },

  async fetchReportsFromBackend(): Promise<UserReport[]> {
    const map = new Map<string, UserReport>();
    for (const r of memoryReports) {
      if (r.id !== 'rep_seed_1' && r.id !== 'rep_seed_2') {
        map.set(r.id, r);
      }
    }

    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.reports)) {
          for (const r of json.reports) {
            if (r.id !== 'rep_seed_1' && r.id !== 'rep_seed_2') {
              map.set(r.id, r);
            }
          }
        }
      }
    } catch {}

    try {
      const snap = await getDocs(collection(db, 'reports'));
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
            timestamp: typeof d.timestamp === 'number' ? d.timestamp : Date.now(),
            status: d.status || 'pending',
            devNotes: d.devNotes,
          });
        }
      });
    } catch {}

    memoryReports = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
    return memoryReports;
  },

  addReport(report: Omit<UserReport, 'id' | 'timestamp' | 'status'>): UserReport {
    const cleanId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newReport: UserReport = {
      ...report,
      id: cleanId,
      reporterDeviceId: currentDeviceId,
      timestamp: Date.now(),
      status: 'pending',
    };
    memoryReports.unshift(newReport);

    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    }).catch(() => {});

    const payload: Record<string, any> = {
      id: cleanId,
      reporterDeviceId: currentDeviceId.slice(0, 128),
      category: newReport.category,
      when: (newReport.when || 'just_now').slice(0, 128),
      details: newReport.details.slice(0, 2000),
      severity: newReport.severity,
      status: 'pending',
      timestamp: newReport.timestamp,
      updatedAt: Date.now(),
    };
    if (newReport.reportedUser) {
      payload.reportedUser = newReport.reportedUser.slice(0, 64);
    }
    setDocDual('reports', cleanId, payload).catch(() => {});

    return newReport;
  },

  updateReportStatus(id: string, status: UserReport['status'], devNotes?: string) {
    const rep = memoryReports.find((r) => r.id === id);
    if (rep) {
      rep.status = status;
      if (devNotes !== undefined) rep.devNotes = devNotes;
      if (status === 'resolved') rep.resolvedAt = Date.now();
    }

    fetch(`/api/reports/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, devNotes }),
    }).catch(() => {});

    const updatePayload: Record<string, any> = {
      id,
      status,
      details: rep?.details || 'Updated report',
      updatedAt: Date.now(),
    };
    if (devNotes !== undefined) {
      updatePayload.devNotes = devNotes.slice(0, 2000);
    }
    setDocDual('reports', id, updatePayload, { merge: true }).catch(() => {});
  },

  deleteReport(id: string) {
    memoryReports = memoryReports.filter((r) => r.id !== id);

    fetch(`/api/reports/${id}`, { method: 'DELETE' }).catch(() => {});
    deleteDocDual('reports', id).catch(() => {});
  },

  getDevConfig(): DevBadgeConfig {
    return { ...memoryDevConfig };
  },

  saveDevConfig(config: Partial<DevBadgeConfig>): DevBadgeConfig {
    memoryDevConfig = { ...memoryDevConfig, ...config };

    fetch('/api/devs/badge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: currentDeviceId, config: memoryDevConfig }),
    }).catch(() => {});

    const firestorePayload: Record<string, any> = {
      deviceId: currentDeviceId.slice(0, 128),
      isDev: memoryDevConfig.isDev !== false,
      title: (memoryDevConfig.title || 'DEV').slice(0, 32),
      color: (memoryDevConfig.color || '#fbbf24').slice(0, 16),
      iconPreset1: (memoryDevConfig.iconPreset1 || 'code').slice(0, 32),
      iconPreset2: (memoryDevConfig.iconPreset2 || 'shield').slice(0, 32),
      updatedAt: Date.now(),
    };
    if (memoryDevConfig.customSvg1 !== undefined) {
      firestorePayload.customSvg1 = memoryDevConfig.customSvg1;
    }
    if (memoryDevConfig.customSvg2 !== undefined) {
      firestorePayload.customSvg2 = memoryDevConfig.customSvg2;
    }

    setDocDual('devs', currentDeviceId, firestorePayload, { merge: true }).catch(() => {});

    return { ...memoryDevConfig };
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
          memoryDevConfig = { ...memoryDevConfig, isDev: isMeDev };
          if (json.devBadges && json.devBadges[currentDeviceId]) {
            memoryDevConfig = { ...memoryDevConfig, ...json.devBadges[currentDeviceId], isDev: isMeDev };
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
        if (json.success && json.resolvedId) {
          setDocDual(
            'devs',
            json.resolvedId,
            {
              deviceId: json.resolvedId,
              isDev,
              title: 'DEV',
              color: '#fbbf24',
              iconPreset1: 'code',
              iconPreset2: 'shield',
              updatedAt: Date.now(),
            },
            { merge: true }
          ).catch(() => {});
          setDocDual(
            'profiles',
            json.resolvedId,
            {
              deviceId: json.resolvedId,
              isDev,
              updatedAt: Date.now(),
            },
            { merge: true }
          ).catch(() => {});
        }
        return !!json.success;
      }
    } catch {}
    return false;
  },

  async moderateUser(
    targetQuery: string,
    action: ModerationAction,
    warningMessage?: string,
    warningQuestion?: string,
    customValue?: number
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
          customValue,
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
