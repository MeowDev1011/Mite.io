// Device-Local Storage & Profile Manager for Mite.io
// Persists player identity, achievements, skins, Cytes currency and game records

import { ACHIEVEMENTS_LIST, Achievement } from '../game/achievements';
import { detectDeviceType } from '../i18n/languages';

const PROFILE_KEY = 'mite_io_player_profile_v3';

export interface CytesRewardBreakdown {
  timeReward: number;
  massReward: number;
  territoryReward: number;
  totalEarned: number;
}

export interface PlayerProfile {
  name: string;
  deviceType: 'Móvil' | 'Tablet' | 'Desktop';
  cytes: number; // Red blood cell currency
  totalCytesEarned: number;
  selectedSkinId: string;
  selectedSporeId: string;
  selectedBacteriaId: string;
  achievements: Record<string, { unlocked: boolean; unlockedAt: string }>;
  unlockedSkinIds: string[];
  unlockedSporeIds: string[];
  unlockedBacteriaIds: string[];
  conqueredOrgans: string[];
  stats: {
    gamesPlayed: number;
    highestMass: number;
    totalKills: number;
    totalRBCDevoured: number;
    secretZoneFound: boolean;
  };
  preferredLanguage: string;
}

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Mite-Alfa',
  deviceType: detectDeviceType(),
  cytes: 120, // Welcome bonus Cytes
  totalCytesEarned: 120,
  selectedSkinId: 'emerald_mite',
  selectedSporeId: 'spore_plasma',
  selectedBacteriaId: 'bacillus_subtilis',
  achievements: {},
  unlockedSkinIds: ['emerald_mite'],
  unlockedSporeIds: ['spore_plasma'],
  unlockedBacteriaIds: ['bacillus_subtilis', 'streptococcus_celer', 'spirillum_flex'],
  conqueredOrgans: [],
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

  constructor() {
    this.profile = this.loadProfile();
  }

  private loadProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          deviceType: detectDeviceType(),
          cytes: typeof parsed.cytes === 'number' ? parsed.cytes : DEFAULT_PROFILE.cytes,
          unlockedSkinIds: parsed.unlockedSkinIds || DEFAULT_PROFILE.unlockedSkinIds,
          unlockedSporeIds: parsed.unlockedSporeIds || DEFAULT_PROFILE.unlockedSporeIds,
          selectedBacteriaId: parsed.selectedBacteriaId || DEFAULT_PROFILE.selectedBacteriaId,
          unlockedBacteriaIds: parsed.unlockedBacteriaIds || DEFAULT_PROFILE.unlockedBacteriaIds,
          conqueredOrgans: parsed.conqueredOrgans || DEFAULT_PROFILE.conqueredOrgans,
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

  public getProfile(): PlayerProfile {
    return { ...this.profile };
  }

  public saveProfile() {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(this.profile));
    } catch {}
  }

  public setPlayerName(name: string) {
    this.profile.name = name.trim() || 'Mite-Alfa';
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

  public conquerOrgan(organId: string): boolean {
    if (!this.profile.conqueredOrgans.includes(organId)) {
      this.profile.conqueredOrgans.push(organId);
      this.saveProfile();
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
    return true; // Newly unlocked!
  }

  // Calculate Cytes reward based on survival duration, peak mass reached, and territory/spores invaded
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
