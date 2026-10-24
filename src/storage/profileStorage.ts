// Firebase Firestore & Backend Database Profile Manager for Mite.io
// Persists player profiles and primary DEV registration directly in the user's Firebase Firestore database (mite-io)
// across both the named database and the '(default)' database, and synchronizes with the backend server API.

import { ACHIEVEMENTS_LIST, Achievement } from '../game/achievements';
import { detectDeviceType, detectDeviceLanguage } from '../i18n/languages';
import { getOrCreateDeviceId } from './deviceId';
import { PlayerUpgrades } from '../game/types';
import {
  db,
  defaultDb,
  doc,
  getDoc,
  setDocDual,
} from '../firebase';

export interface CytesRewardBreakdown {
  timeReward: number;
  massReward: number;
  territoryReward: number;
  totalEarned: number;
}

export interface PlayerProfile {
  deviceId: string;
  name: string;
  deviceType: 'Móvil' | 'Tablet' | 'Desktop';
  cytes: number; // Red blood cell currency, starts strictly at 0!
  totalCytesEarned: number;
  selectedSkinId: string;
  selectedSporeId: string;
  selectedBacteriaId: string;
  achievements: Record<string, { unlocked: boolean; unlockedAt: string }>;
  unlockedSkinIds: string[];
  unlockedSporeIds: string[];
  unlockedBacteriaIds: string[];
  conqueredOrgans: string[];
  upgrades: PlayerUpgrades;
  stats: {
    gamesPlayed: number;
    highestMass: number;
    totalKills: number;
    totalRBCDevoured: number;
    secretZoneFound: boolean;
    longestSurvivalSec?: number;
  };
  preferredLanguage: string;
  isDev?: boolean;
  isFirstDev?: boolean;
}

const currentDeviceId = getOrCreateDeviceId();

export function isGenericDefaultName(name?: string): boolean {
  if (!name || !name.trim()) return true;
  return /^(Microbio|Microbe|Micróbio|Mikrobe|Microbo|Микроб|微生物|微细胞|미생물|ميكروب|रोगाणु|Mikrop|Mikrob|Mikrobi|Μικρόβιο|Mikroba|Microb|Мікроб|ViKhuẩn|จุลินทรีย์|Mikrobyo|חיידק|জীবাণু)-[A-Z0-9]{4}$/i.test(
    name.trim()
  );
}

export function getDefaultLocalizedName(lang?: string, deviceId?: string): string {
  const shortId = (deviceId || currentDeviceId).slice(-4).toUpperCase();
  const lower = (lang || detectDeviceLanguage() || '').toLowerCase();
  if (lower.startsWith('en')) return `Microbe-${shortId}`;
  if (lower.startsWith('pt')) return `Micróbio-${shortId}`;
  if (lower.startsWith('fr')) return `Microbe-${shortId}`;
  if (lower.startsWith('de')) return `Mikrobe-${shortId}`;
  if (lower.startsWith('it')) return `Microbo-${shortId}`;
  if (lower.startsWith('ru')) return `Микроб-${shortId}`;
  if (lower.startsWith('ja')) return `微生物-${shortId}`;
  if (lower.startsWith('zh')) return `微细胞-${shortId}`;
  if (lower.startsWith('ko')) return `미생물-${shortId}`;
  if (lower.startsWith('ar')) return `ميكروب-${shortId}`;
  if (lower.startsWith('hi')) return `रोगाणु-${shortId}`;
  if (lower.startsWith('tr')) return `Mikrop-${shortId}`;
  if (lower.startsWith('pl')) return `Mikrob-${shortId}`;
  if (lower.startsWith('nl')) return `Microbe-${shortId}`;
  if (lower.startsWith('sv')) return `Mikrob-${shortId}`;
  if (lower.startsWith('no') || lower.startsWith('da')) return `Mikrobe-${shortId}`;
  if (lower.startsWith('fi')) return `Mikrobi-${shortId}`;
  if (lower.startsWith('el')) return `Μικρόβιο-${shortId}`;
  if (lower.startsWith('cs')) return `Mikrob-${shortId}`;
  if (lower.startsWith('hu')) return `Mikroba-${shortId}`;
  if (lower.startsWith('ro')) return `Microb-${shortId}`;
  if (lower.startsWith('uk')) return `Мікроб-${shortId}`;
  if (lower.startsWith('vi')) return `ViKhuẩn-${shortId}`;
  if (lower.startsWith('th')) return `จุลินทรีย์-${shortId}`;
  if (lower.startsWith('id') || lower.startsWith('ms')) return `Mikroba-${shortId}`;
  if (lower.startsWith('fil')) return `Mikrobyo-${shortId}`;
  if (lower.startsWith('he')) return `חיידק-${shortId}`;
  if (lower.startsWith('bn')) return `জীবাণু-${shortId}`;
  if (lower.startsWith('ca')) return `Microbi-${shortId}`;
  return `Microbio-${shortId}`;
}

export const UPGRADE_MAX_LEVEL = 1500;

export function getUpgradeCost(currentLvl: number): number {
  if (currentLvl >= UPGRADE_MAX_LEVEL) return 0;
  return Math.floor(35 + Math.pow(currentLvl, 1.45) * 18 + currentLvl * 15);
}

export function getTotalUpgradeCost(currentLvl: number, count: number): { totalCost: number; actualCount: number; targetLevel: number } {
  const targetLevel = Math.min(UPGRADE_MAX_LEVEL, currentLvl + count);
  const actualCount = targetLevel - currentLvl;
  let totalCost = 0;
  for (let lvl = currentLvl; lvl < targetLevel; lvl++) {
    totalCost += getUpgradeCost(lvl);
  }
  return { totalCost, actualCount, targetLevel };
}

export const UPGRADE_TIERS = [
  { level: 1, costCytes: getUpgradeCost(0), title: 'Nivel 1' },
  { level: 2, costCytes: getUpgradeCost(1), title: 'Nivel 2' },
  { level: 3, costCytes: getUpgradeCost(2), title: 'Nivel 3' },
  { level: 4, costCytes: getUpgradeCost(3), title: 'Nivel 4' },
  { level: 5, costCytes: getUpgradeCost(4), title: 'Nivel 5' },
];

const DEFAULT_PROFILE: PlayerProfile = {
  deviceId: currentDeviceId,
  name: getDefaultLocalizedName(),
  deviceType: detectDeviceType(),
  cytes: 0,
  totalCytesEarned: 0,
  selectedSkinId: 'emerald_mite',
  selectedSporeId: 'spore_plasma',
  selectedBacteriaId: 'bacillus_subtilis',
  achievements: {},
  unlockedSkinIds: ['emerald_mite'],
  unlockedSporeIds: ['spore_plasma'],
  unlockedBacteriaIds: ['bacillus_subtilis', 'escherichia_coli', 'lactobacillus_casei'],
  conqueredOrgans: [],
  upgrades: {
    attraction: 0,
    speed: 0,
    armor: 0,
    metabolism: 0,
    sporesFission: 0,
  },
  stats: {
    gamesPlayed: 0,
    highestMass: 18,
    totalKills: 0,
    totalRBCDevoured: 0,
    secretZoneFound: false,
    longestSurvivalSec: 0,
  },
  preferredLanguage: detectDeviceLanguage() || 'es',
};

class ProfileStorage {
  private profile: PlayerProfile;
  private syncTimer: any = null;
  private listeners: Set<(profile: PlayerProfile) => void> = new Set();
  private hasUserCustomizedName: boolean = false;

  constructor() {
    this.profile = {
      ...DEFAULT_PROFILE,
      deviceType: detectDeviceType(),
    };
    this.initFromDatabases();
  }

  public subscribe(listener: (profile: PlayerProfile) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const snap = this.getProfile();
    this.listeners.forEach((fn) => {
      try {
        fn(snap);
      } catch {}
    });
  }

  private resolveBestName(currentName: string, incomingName?: string): string {
    if (this.hasUserCustomizedName && !isGenericDefaultName(currentName)) {
      return currentName;
    }
    if (incomingName && !isGenericDefaultName(incomingName)) {
      return incomingName.trim();
    }
    if (!isGenericDefaultName(currentName)) {
      return currentName.trim();
    }
    return incomingName || currentName || getDefaultLocalizedName(this.profile.preferredLanguage, currentDeviceId);
  }

  private async initFromDatabases() {
    await this.syncFromFirestore();
    await this.fetchFromServer();
  }

  private async syncFromFirestore() {
    try {
      const primaryRef = doc(db, 'devs', 'primary_dev');
      const primarySnap = await getDoc(primaryRef);
      let firstDevId = currentDeviceId;

      if (!primarySnap.exists()) {
        const primaryPayload = {
          deviceId: currentDeviceId,
          firstDevId: currentDeviceId,
          isPrimaryDev: true,
          isDev: true,
          title: 'DEV',
          color: '#fbbf24',
          iconPreset1: 'code',
          iconPreset2: 'shield',
          updatedAt: Date.now(),
        };
        await setDocDual('devs', 'primary_dev', primaryPayload);
        await setDocDual('devs', currentDeviceId, primaryPayload);
      } else {
        const pData = primarySnap.data();
        if (pData && pData.firstDevId) {
          firstDevId = pData.firstDevId;
        }
      }

      const isMePrimaryDev = firstDevId === currentDeviceId;
      const devDocSnap = await getDoc(doc(db, 'devs', currentDeviceId));
      const isMeDev = isMePrimaryDev || (devDocSnap.exists() && devDocSnap.data()?.isDev !== false);

      // Check named DB first, then fallback to defaultDb
      let profSnap = await getDoc(doc(db, 'profiles', currentDeviceId));
      if (!profSnap.exists()) {
        profSnap = await getDoc(doc(defaultDb, 'profiles', currentDeviceId));
      }

      if (profSnap.exists()) {
        const data = profSnap.data();
        const bestName = this.resolveBestName(this.profile.name, data.name);
        this.profile = {
          ...this.profile,
          ...data,
          name: bestName,
          deviceId: currentDeviceId,
          deviceType: detectDeviceType(),
          cytes: typeof data.cytes === 'number' ? Math.max(this.profile.cytes, data.cytes) : this.profile.cytes,
          totalCytesEarned:
            typeof data.totalCytesEarned === 'number'
              ? Math.max(this.profile.totalCytesEarned, data.totalCytesEarned)
              : this.profile.totalCytesEarned,
          unlockedSkinIds: Array.isArray(data.unlockedSkinIds) ? data.unlockedSkinIds : this.profile.unlockedSkinIds,
          unlockedSporeIds: Array.isArray(data.unlockedSporeIds) ? data.unlockedSporeIds : this.profile.unlockedSporeIds,
          unlockedBacteriaIds: Array.isArray(data.unlockedBacteriaIds)
            ? data.unlockedBacteriaIds
            : this.profile.unlockedBacteriaIds,
          conqueredOrgans: Array.isArray(data.conqueredOrgans) ? data.conqueredOrgans : this.profile.conqueredOrgans,
          upgrades: {
            ...DEFAULT_PROFILE.upgrades,
            ...(data.upgrades || {}),
          },
          stats: {
            ...DEFAULT_PROFILE.stats,
            ...(data.stats || {}),
          },
          achievements: {
            ...(data.achievements || {}),
            ...this.profile.achievements,
          },
          isDev: isMeDev || Boolean(data.isDev),
          isFirstDev: isMePrimaryDev,
        };
        this.notifyListeners();
        await this.writeToFirestore();
      } else {
        this.profile.isDev = isMeDev;
        this.profile.isFirstDev = isMePrimaryDev;
        this.notifyListeners();
        await this.writeToFirestore();
      }
    } catch {
      // Handled gracefully if offline
    }
  }

  private async writeToFirestore() {
    try {
      const payload = {
        deviceId: currentDeviceId.slice(0, 128),
        name: (this.profile.name || getDefaultLocalizedName()).slice(0, 64),
        deviceType: (this.profile.deviceType || detectDeviceType()).slice(0, 32),
        cytes: Math.max(0, Number(this.profile.cytes) || 0),
        totalCytesEarned: Math.max(0, Number(this.profile.totalCytesEarned) || 0),
        selectedSkinId: (this.profile.selectedSkinId || 'emerald_mite').slice(0, 64),
        selectedSporeId: (this.profile.selectedSporeId || 'spore_plasma').slice(0, 64),
        selectedBacteriaId: (this.profile.selectedBacteriaId || 'bacillus_subtilis').slice(0, 64),
        preferredLanguage: (this.profile.preferredLanguage || detectDeviceLanguage() || 'es').slice(0, 16),
        unlockedSkinIds: this.profile.unlockedSkinIds || ['emerald_mite'],
        unlockedSporeIds: this.profile.unlockedSporeIds || ['spore_plasma'],
        unlockedBacteriaIds: this.profile.unlockedBacteriaIds || ['bacillus_subtilis'],
        conqueredOrgans: this.profile.conqueredOrgans || [],
        upgrades: this.profile.upgrades || DEFAULT_PROFILE.upgrades,
        stats: this.profile.stats || DEFAULT_PROFILE.stats,
        achievements: this.profile.achievements || {},
        isDev: Boolean(this.profile.isDev),
        isFirstDev: Boolean(this.profile.isFirstDev),
        isRealUser: true,
        updatedAt: Date.now(),
      };
      await setDocDual('profiles', currentDeviceId, payload, { merge: true });
    } catch {
      // Handled silently if offline
    }
  }

  private async fetchFromServer() {
    try {
      const res = await fetch(`/api/profile/${currentDeviceId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.profile) {
          const bestName = this.resolveBestName(this.profile.name, json.profile.name);
          this.profile = {
            ...this.profile,
            ...json.profile,
            name: bestName,
            deviceId: currentDeviceId,
            deviceType: detectDeviceType(),
            cytes: Math.max(Number(this.profile.cytes) || 0, Number(json.profile.cytes) || 0),
            totalCytesEarned: Math.max(
              Number(this.profile.totalCytesEarned) || 0,
              Number(json.profile.totalCytesEarned) || 0
            ),
            isDev: Boolean(json.isDev ?? json.profile.isDev ?? this.profile.isDev),
            isFirstDev: json.firstDevId === currentDeviceId || Boolean(this.profile.isFirstDev),
          };
          this.notifyListeners();
          await this.writeToFirestore();
        }
      }
    } catch {
      // Continues using Firestore state
    }
  }

  private async flushSyncImmediately() {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    await this.writeToFirestore();
    try {
      await fetch(`/api/profile/${currentDeviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.profile),
      });
    } catch {}
  }

  private queueServerSync() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.flushSyncImmediately();
    }, 150);
  }

  public getDeviceId(): string {
    return currentDeviceId;
  }

  public getProfile(): PlayerProfile {
    return { ...this.profile };
  }

  public saveProfile() {
    this.notifyListeners();
    this.queueServerSync();
  }

  public setPlayerName(name: string) {
    const trimmed = name.trim();
    if (trimmed && !isGenericDefaultName(trimmed)) {
      this.hasUserCustomizedName = true;
    }
    this.profile.name = trimmed || getDefaultLocalizedName(this.profile.preferredLanguage, currentDeviceId);
    this.notifyListeners();
    // Flush immediately so name changes are saved right away in Firebase Firestore and Server
    this.flushSyncImmediately();
  }

  public setPreferredLanguage(lang: string) {
    this.profile.preferredLanguage = lang;
    this.saveProfile();
  }

  public addCytes(amount: number) {
    const validAmount = Math.max(0, Math.floor(amount));
    this.profile.cytes += validAmount;
    this.profile.totalCytesEarned += validAmount;
    this.saveProfile();
  }

  public setCytesBalance(amount: number) {
    this.profile.cytes = Math.max(0, Math.floor(amount));
    this.saveProfile();
  }

  public resetUpgradesToZero() {
    this.profile.upgrades = {
      attraction: 0,
      speed: 0,
      armor: 0,
      metabolism: 0,
      sporesFission: 0,
    };
    this.saveProfile();
  }

  public clearConqueredOrgans() {
    this.profile.conqueredOrgans = [];
    this.saveProfile();
  }

  public resetSkinsAndSporesToDefault() {
    this.profile.unlockedSkinIds = ['emerald_mite'];
    this.profile.unlockedSporeIds = ['spore_plasma'];
    this.profile.selectedSkinId = 'emerald_mite';
    this.profile.selectedSporeId = 'spore_plasma';
    this.saveProfile();
  }

  public spendCytes(amount: number): boolean {
    if (this.profile.cytes >= amount) {
      this.profile.cytes -= amount;
      this.saveProfile();
      return true;
    }
    return false;
  }

  public selectSkin(skinId: string) {
    this.profile.selectedSkinId = skinId;
    this.saveProfile();
  }

  public selectSpore(sporeId: string) {
    this.profile.selectedSporeId = sporeId;
    this.saveProfile();
  }

  public unlockSkin(skinId: string) {
    if (!this.profile.unlockedSkinIds.includes(skinId)) {
      this.profile.unlockedSkinIds.push(skinId);
      this.saveProfile();
    }
  }

  public unlockSpore(sporeId: string) {
    if (!this.profile.unlockedSporeIds.includes(sporeId)) {
      this.profile.unlockedSporeIds.push(sporeId);
      this.saveProfile();
    }
  }

  public selectBacteria(bacteriaId: string) {
    this.profile.selectedBacteriaId = bacteriaId;
    this.saveProfile();
  }

  public unlockBacteria(bacteriaId: string) {
    if (!this.profile.unlockedBacteriaIds.includes(bacteriaId)) {
      this.profile.unlockedBacteriaIds.push(bacteriaId);
      this.saveProfile();
    }
  }

  public getUpgrades(): PlayerUpgrades {
    return (
      this.profile.upgrades || {
        attraction: 0,
        speed: 0,
        armor: 0,
        metabolism: 0,
        sporesFission: 0,
      }
    );
  }

  public upgradeStat(
    stat: keyof PlayerUpgrades,
    count: number = 1
  ): { success: boolean; newLevel: number; cost: number; actualCount?: number; error?: string } {
    if (!this.profile.upgrades) {
      this.profile.upgrades = {
        attraction: 0,
        speed: 0,
        armor: 0,
        metabolism: 0,
        sporesFission: 0,
      };
    }
    const currentLvl = this.profile.upgrades[stat] || 0;
    if (currentLvl >= UPGRADE_MAX_LEVEL) {
      return { success: false, newLevel: currentLvl, cost: 0, error: 'Nivel máximo alcanzado (1500)' };
    }

    const { totalCost, actualCount, targetLevel } = getTotalUpgradeCost(currentLvl, count);
    if (actualCount <= 0) {
      return { success: false, newLevel: currentLvl, cost: 0, error: 'Nivel máximo alcanzado' };
    }

    if (this.profile.cytes < totalCost) {
      return {
        success: false,
        newLevel: currentLvl,
        cost: totalCost,
        actualCount,
        error: `Cytes insuficientes. Se requieren ${totalCost} Cytes`,
      };
    }

    this.profile.cytes -= totalCost;
    this.profile.upgrades[stat] = targetLevel;
    this.saveProfile();
    return { success: true, newLevel: targetLevel, cost: totalCost, actualCount };
  }

  public getMaxAffordableCount(stat: keyof PlayerUpgrades): number {
    if (!this.profile.upgrades) {
      this.profile.upgrades = {
        attraction: 0,
        speed: 0,
        armor: 0,
        metabolism: 0,
        sporesFission: 0,
      };
    }
    const currentLvl = this.profile.upgrades[stat] || 0;
    let count = 0;
    let accumulated = 0;
    let lvl = currentLvl;
    while (lvl < UPGRADE_MAX_LEVEL) {
      const nextCost = getUpgradeCost(lvl);
      if (accumulated + nextCost > this.profile.cytes) break;
      accumulated += nextCost;
      lvl++;
      count++;
    }
    return Math.max(1, count);
  }

  public conquerOrgan(organId: string, faction: string = 'neutral'): boolean {
    if (!this.profile.conqueredOrgans.includes(organId)) {
      this.profile.conqueredOrgans.push(organId);
      this.saveProfile();

      try {
        fetch('/api/conquest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organId,
            faction,
            playerName: this.profile.name,
            deviceId: currentDeviceId,
          }),
        }).catch(() => {});
      } catch {}

      return true;
    }
    return false;
  }

  public isOrganConquered(organId: string): boolean {
    return this.profile.conqueredOrgans.includes(organId);
  }

  public unlockAchievement(achievementId: string): boolean {
    if (this.profile.achievements[achievementId]?.unlocked) {
      return false;
    }

    const achDef = ACHIEVEMENTS_LIST.find((a) => a.id === achievementId);
    if (!achDef) return false;

    const now = new Date().toISOString();
    this.profile.achievements[achievementId] = {
      unlocked: true,
      unlockedAt: now,
    };

    if (achievementId === 'first_blood') {
      if (!this.profile.unlockedSkinIds.includes('crimson_phage')) this.profile.unlockedSkinIds.push('crimson_phage');
      if (!this.profile.unlockedSporeIds.includes('spore_hemoglobin_ruby')) this.profile.unlockedSporeIds.push('spore_hemoglobin_ruby');
    }
    if (achievementId === 'mitosis_master') {
      if (!this.profile.unlockedSkinIds.includes('cyber_cyan')) this.profile.unlockedSkinIds.push('cyber_cyan');
      if (!this.profile.unlockedSporeIds.includes('spore_mitosis_spark')) this.profile.unlockedSporeIds.push('spore_mitosis_spark');
    }
    if (achievementId === 'mass_500') {
      if (!this.profile.unlockedSkinIds.includes('royal_gold')) this.profile.unlockedSkinIds.push('royal_gold');
      if (!this.profile.unlockedSporeIds.includes('spore_titan_gold')) this.profile.unlockedSporeIds.push('spore_titan_gold');
    }
    if (achievementId === 'secret_lymph_node') {
      if (!this.profile.unlockedSkinIds.includes('void_amethyst')) this.profile.unlockedSkinIds.push('void_amethyst');
      if (!this.profile.unlockedSporeIds.includes('spore_lymphatic_mist')) this.profile.unlockedSporeIds.push('spore_lymphatic_mist');
    }
    if (achievementId === 'antibody_survivor') {
      if (!this.profile.unlockedSkinIds.includes('solar_amber')) this.profile.unlockedSkinIds.push('solar_amber');
      if (!this.profile.unlockedSporeIds.includes('spore_antibody_null')) this.profile.unlockedSporeIds.push('spore_antibody_null');
    }
    if (achievementId === 'erythrocyte_feast' && !this.profile.unlockedSporeIds.includes('spore_hemoglobin')) {
      this.profile.unlockedSporeIds.push('spore_hemoglobin');
    }
    if (achievementId === 'toxic_bomber' && !this.profile.unlockedSporeIds.includes('spore_toxic')) {
      this.profile.unlockedSporeIds.push('spore_toxic');
    }
    if (achievementId === 'bloodstream_king' && !this.profile.unlockedSporeIds.includes('spore_cosmic')) {
      this.profile.unlockedSporeIds.push('spore_cosmic');
    }

    const rewardAmount = achDef.rewardCytes || 25;
    this.profile.cytes += rewardAmount;
    this.profile.totalCytesEarned += rewardAmount;

    this.flushSyncImmediately();
    return true;
  }

  public calculateGameReward(
    survivalSec: number,
    peakMass: number,
    sporesInvaded: number,
    kills: number
  ): CytesRewardBreakdown {
    const timeReward = Math.floor(survivalSec * 0.25);
    const massReward = Math.floor(Math.max(0, peakMass - 18) * 0.12);
    const territoryReward = Math.floor(sporesInvaded * 1 + kills * 8);
    const totalEarned = Math.max(3, timeReward + massReward + territoryReward);

    return {
      timeReward,
      massReward,
      territoryReward,
      totalEarned,
    };
  }

  public recordGameEnd(
    finalMass: number,
    kills: number,
    rbcs: number,
    secretFound: boolean,
    survivalSec: number = 0,
    sporesInvaded: number = 0
  ): CytesRewardBreakdown {
    this.profile.stats.gamesPlayed++;
    if (finalMass > this.profile.stats.highestMass) {
      this.profile.stats.highestMass = Math.round(finalMass);
    }
    if (survivalSec > (this.profile.stats.longestSurvivalSec || 0)) {
      this.profile.stats.longestSurvivalSec = Math.round(survivalSec);
    }
    this.profile.stats.totalKills += kills;
    this.profile.stats.totalRBCDevoured += rbcs;
    if (secretFound) {
      this.profile.stats.secretZoneFound = true;
    }

    const reward = this.calculateGameReward(survivalSec, finalMass, sporesInvaded, kills);
    this.addCytes(reward.totalEarned);

    this.flushSyncImmediately();
    return reward;
  }

  public getAchievements(): Achievement[] {
    return ACHIEVEMENTS_LIST.map((ach) => {
      const record = this.profile.achievements[ach.id];
      return {
        ...ach,
        unlocked: !!record?.unlocked,
        unlockedAt: record?.unlockedAt,
      };
    });
  }
}

export const profileStorage = new ProfileStorage();
