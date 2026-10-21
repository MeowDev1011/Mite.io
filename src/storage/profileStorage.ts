// Device-Associated Database Storage & Profile Manager for Mite.io
// Connects client device identity with backend database and offline PWA cache.
// Ensures fresh accounts start strictly with 0 Cytes as requested.

import { ACHIEVEMENTS_LIST, Achievement } from '../game/achievements';
import { detectDeviceType, detectDeviceLanguage } from '../i18n/languages';
import { getOrCreateDeviceId } from './deviceId';
import { PlayerUpgrades } from '../game/types';

const CACHE_KEY = 'mite_io_device_profile_cache_v5';

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
  };
  preferredLanguage: string;
}

const currentDeviceId = getOrCreateDeviceId();

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

// Dynamic cost formula scaling progressively from level 0 to 1500
export function getUpgradeCost(currentLvl: number): number {
  if (currentLvl >= UPGRADE_MAX_LEVEL) return 0;
  return Math.floor(10 + Math.pow(currentLvl, 1.28) * 3 + currentLvl * 2);
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

// Backward compatibility tier preview for initial levels
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
  cytes: 0, // Strictly 0 Cytes initial balance as per user instruction
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
  },
  preferredLanguage: 'es',
};

class ProfileStorage {
  private profile: PlayerProfile;
  private syncTimer: any = null;

  constructor() {
    this.profile = this.loadLocalCache();
    // Synchronize with server database
    this.fetchFromServer();
  }

  private loadLocalCache(): PlayerProfile {
    try {
      const data = localStorage.getItem(CACHE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          deviceId: currentDeviceId,
          deviceType: detectDeviceType(),
          cytes: typeof parsed.cytes === 'number' ? parsed.cytes : 0,
          unlockedSkinIds: parsed.unlockedSkinIds || DEFAULT_PROFILE.unlockedSkinIds,
          unlockedSporeIds: parsed.unlockedSporeIds || DEFAULT_PROFILE.unlockedSporeIds,
          selectedBacteriaId: parsed.selectedBacteriaId || DEFAULT_PROFILE.selectedBacteriaId,
          unlockedBacteriaIds: parsed.unlockedBacteriaIds || DEFAULT_PROFILE.unlockedBacteriaIds,
          conqueredOrgans: parsed.conqueredOrgans || DEFAULT_PROFILE.conqueredOrgans,
          upgrades: {
            ...DEFAULT_PROFILE.upgrades,
            ...(parsed.upgrades || {}),
          },
          stats: {
            ...DEFAULT_PROFILE.stats,
            ...(parsed.stats || {}),
          },
        };
      }
    } catch {}
    return {
      ...DEFAULT_PROFILE,
      deviceType: detectDeviceType(),
    };
  }

  private async fetchFromServer() {
    try {
      const res = await fetch(`/api/profile/${currentDeviceId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.profile) {
          this.profile = {
            ...this.profile,
            ...json.profile,
            deviceId: currentDeviceId,
          };
          this.saveLocalCache();
        }
      }
    } catch (err) {
      // Offline fallback: continue using local cache seamlessly
    }
  }

  private saveLocalCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.profile));
    } catch {}
  }

  private queueServerSync() {
    this.saveLocalCache();
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(async () => {
      try {
        await fetch(`/api/profile/${currentDeviceId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.profile),
        });
      } catch (e) {
        // Handled silently for offline mode
      }
    }, 400);
  }

  public getDeviceId(): string {
    return currentDeviceId;
  }

  public getProfile(): PlayerProfile {
    return { ...this.profile };
  }

  public saveProfile() {
    this.queueServerSync();
  }

  public setPlayerName(name: string) {
    this.profile.name = name.trim() || `Microbio-${currentDeviceId.slice(-4).toUpperCase()}`;
    this.saveProfile();
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

      // Post to global server database
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
      return false; // Already unlocked
    }

    const now = new Date().toISOString();
    this.profile.achievements[achievementId] = {
      unlocked: true,
      unlockedAt: now,
    };

    // Auto-unlock corresponding skin rewards from achievements
    if (achievementId === 'first_blood' && !this.profile.unlockedSkinIds.includes('crimson_phage')) {
      this.profile.unlockedSkinIds.push('crimson_phage');
    }
    if (achievementId === 'mitosis_master' && !this.profile.unlockedSkinIds.includes('cyber_cyan')) {
      this.profile.unlockedSkinIds.push('cyber_cyan');
    }
    if (achievementId === 'mass_500' && !this.profile.unlockedSkinIds.includes('royal_gold')) {
      this.profile.unlockedSkinIds.push('royal_gold');
    }
    if (achievementId === 'secret_lymph_node' && !this.profile.unlockedSkinIds.includes('void_amethyst')) {
      this.profile.unlockedSkinIds.push('void_amethyst');
    }
    if (achievementId === 'antibody_survivor' && !this.profile.unlockedSkinIds.includes('solar_amber')) {
      this.profile.unlockedSkinIds.push('solar_amber');
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

    // Award bonus Cytes for completing achievement
    this.addCytes(75);

    this.saveProfile();
    return true;
  }

  public calculateGameReward(
    survivalSec: number,
    peakMass: number,
    sporesInvaded: number,
    kills: number
  ): CytesRewardBreakdown {
    const timeReward = Math.floor(survivalSec * 1.5);
    const massReward = Math.floor(peakMass * 0.65);
    const territoryReward = Math.floor(sporesInvaded * 6 + kills * 40);
    const totalEarned = Math.max(15, timeReward + massReward + territoryReward);

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
    this.profile.stats.totalKills += kills;
    this.profile.stats.totalRBCDevoured += rbcs;
    if (secretFound) {
      this.profile.stats.secretZoneFound = true;
    }

    const reward = this.calculateGameReward(survivalSec, finalMass, sporesInvaded, kills);
    this.addCytes(reward.totalEarned);

    this.saveProfile();
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
