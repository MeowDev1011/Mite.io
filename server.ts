import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect Backend Server directly to the user's Firebase Firestore database (mite-io)
// Writes to BOTH the named database and the '(default)' database so Firebase Console always shows live data
const appletConfigPath = path.join(__dirname, 'firebase-applet-config.json');
const appletConfig = JSON.parse(fs.readFileSync(appletConfigPath, 'utf-8'));
const firebaseApp = initializeApp(appletConfig, 'mite-io-server');
const firestoreDb = getFirestore(firebaseApp, appletConfig.firestoreDatabaseId);
const defaultFirestoreDb = getFirestore(firebaseApp);

async function setDocDualServer(
  collectionName: string,
  docId: string,
  data: Record<string, any>,
  options?: { merge?: boolean }
) {
  const opts = options || { merge: true };
  await Promise.allSettled([
    setDoc(doc(firestoreDb, collectionName, docId), data, opts),
    setDoc(doc(defaultFirestoreDb, collectionName, docId), data, opts),
  ]);
}

async function deleteDocDualServer(collectionName: string, docId: string) {
  await Promise.allSettled([
    deleteDoc(doc(firestoreDb, collectionName, docId)),
    deleteDoc(doc(defaultFirestoreDb, collectionName, docId)),
  ]);
}

function isGenericDefaultNameServer(name?: string): boolean {
  if (!name || !String(name).trim()) return true;
  return /^(Microbio|Microbe|Micróbio|Mikrobe|Microbo|Микроб|微生物|微细胞|미생물|ميكروب|रोगाणु|Mikrop|Mikrob|Mikrobi|Μικρόβιο|Mikroba|Microb|Мікроб|ViKhuẩn|จุลินทรีย์|Mikrobyo|חיידק|জীবাণু)-[A-Z0-9]{4}$/i.test(
    String(name).trim()
  );
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = path.join(__dirname, 'data', 'database.json');

app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

export interface ActivePlayer {
  deviceId: string;
  name: string;
  status: 'online' | 'in_game' | 'in_room';
  currentOrgan: string;
  mass: number;
  faction: 'immune' | 'pathogen' | 'neutral';
  isRealDevice: boolean;
  lastSeen: number;
  x?: number;
  y?: number;
}

export interface RoomInvitation {
  id: string;
  fromDeviceId: string;
  fromPlayerName: string;
  toDeviceId: string;
  toPlayerName: string;
  mode: 'team' | 'ffa' | 'bots';
  factionRule: 'host_decides' | 'guest_chooses';
  hostFaction: 'immune' | 'pathogen';
  guestFaction?: 'immune' | 'pathogen';
  roomId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

export interface InteractiveWarning {
  id: string;
  message: string;
  question: string;
  createdAt: number;
  answered: boolean;
  answerText?: string;
  answeredAt?: number;
}

export interface UserModerationState {
  isMuted?: boolean;
  isBanned?: boolean;
  tempBanUntil?: number;
  isFrozen?: boolean;
  isSlowed?: boolean;
  isSplitLocked?: boolean;
  isEjectLocked?: boolean;
  isControlsInverted?: boolean;
  warnings?: number;
  interactiveWarnings?: InteractiveWarning[];
  drainMassTrigger?: number;
  boostMassTrigger?: number;
  kickMatchTrigger?: number;
  resetUpgradesTrigger?: number;
  stripOrgansTrigger?: number;
  resetSkinsTrigger?: number;
  cytesOverride?: number;
  cytesOverrideTrigger?: number;
  forcedName?: string;
  forcedNameTrigger?: number;
  lastAction?: string;
  updatedAt?: number;
}

interface DatabaseSchema {
  profiles: Record<string, any>;
  territories: Record<string, { organId: string; faction: string; conqueredBy: string; timestamp: number }>;
  rooms: Record<string, {
    id: string;
    mode: 'ffa' | 'team' | 'bots';
    humansOnly: boolean;
    playerCount: number;
    maxPlayers: number;
    leaderName: string;
    leaderMass: number;
    factionScores?: { immune: number; pathogen: number };
  }>;
  invitations: Record<string, RoomInvitation>;
  firstDevId?: string;
  devIds: string[];
  revokedDevIds: string[];
  devBadges: Record<string, any>;
  moderation: Record<string, UserModerationState>;
  reports: any[];
  dailyLeaderboard?: {
    dayKey: string;
    players: Record<string, any>;
    bots: Record<string, any>;
  };
}

let db: DatabaseSchema = {
  profiles: {},
  territories: {},
  rooms: {
    'room-human-ffa': {
      id: 'room-human-ffa',
      mode: 'ffa',
      humansOnly: true,
      playerCount: 1,
      maxPlayers: 100,
      leaderName: 'Microbio',
      leaderMass: 18,
    },
    'room-human-team': {
      id: 'room-human-team',
      mode: 'team',
      humansOnly: true,
      playerCount: 1,
      maxPlayers: 100,
      leaderName: 'Microbio',
      leaderMass: 18,
      factionScores: { immune: 50, pathogen: 50 },
    },
    'room-bot-practice': {
      id: 'room-bot-practice',
      mode: 'bots',
      humansOnly: false,
      playerCount: 100,
      maxPlayers: 100,
      leaderName: 'catinthelad',
      leaderMass: 1850,
    },
  },
  invitations: {},
  firstDevId: undefined,
  devIds: [],
  revokedDevIds: [],
  devBadges: {},
  moderation: {},
  reports: [],
};

// Registry of REAL connected devices via heartbeat (90s window to survive mobile app-switching/QR sharing)
const ACTIVE_PRESENCE_WINDOW_MS = 90000;
let activePlayersRegistry: Record<string, ActivePlayer> = {};

function isDeviceDevHelper(deviceId: string): boolean {
  if (!deviceId) return false;
  const baseId = deviceId.split('_T')[0];
  return (
    db.firstDevId === deviceId ||
    db.firstDevId === baseId ||
    (db.devIds || []).includes(deviceId) ||
    (db.devIds || []).includes(baseId)
  );
}

// Load initial local backup if exists, cleaning any non-real/fake ghost users
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const rawProfiles = parsed.profiles || {};
    const cleanedProfiles: Record<string, any> = {};
    const now = Date.now();
    for (const [id, p] of Object.entries(rawProfiles)) {
      const prof = p as any;
      if (prof && prof.deviceId && prof.isRealUser === true && prof.deviceType !== 'Registrado' && prof.deviceType !== 'Moderado') {
        cleanedProfiles[id] = prof;
        if (typeof prof.lastSeenMs === 'number' && now - prof.lastSeenMs < ACTIVE_PRESENCE_WINDOW_MS) {
          activePlayersRegistry[id] = {
            deviceId: id,
            name: prof.name || `Microbio-${id.slice(-4).toUpperCase()}`,
            status: prof.lastStatus || 'online',
            currentOrgan: prof.lastOrgan || 'Corazón (Aorta)',
            mass: prof.lastMass || prof.stats?.highestMass || 18,
            faction: prof.lastFaction || 'immune',
            isRealDevice: true,
            lastSeen: prof.lastSeenMs,
            x: typeof prof.lastX === 'number' ? prof.lastX : 0,
            y: typeof prof.lastY === 'number' ? prof.lastY : -400,
          };
        }
      }
    }

    db = {
      ...db,
      ...parsed,
      profiles: cleanedProfiles,
      devIds: Array.isArray(parsed.devIds)
        ? parsed.devIds.filter((id: string) => Boolean(cleanedProfiles[id]))
        : [],
      revokedDevIds: Array.isArray(parsed.revokedDevIds) ? parsed.revokedDevIds : [],
      devBadges: parsed.devBadges || {},
      moderation: parsed.moderation || {},
      reports: Array.isArray(parsed.reports)
        ? parsed.reports.filter((r: any) => r.id !== 'rep_seed_1' && r.id !== 'rep_seed_2')
        : [],
    };
  } catch (err) {
    console.warn('Failed to parse database.json, starting fresh', err);
  }
}

function getPublicDevBadgeForDevice(deviceId: string) {
  const isDev = isDeviceDevHelper(deviceId);
  if (!isDev) return undefined;
  const baseId = deviceId.split('_T')[0];
  return (
    db.devBadges?.[deviceId] ||
    db.devBadges?.[baseId] || {
      isDev: true,
      title: 'DEV',
      color: '#fbbf24',
      iconPreset1: 'code',
      iconPreset2: 'shield',
    }
  );
}

// Helper to write a player's profile and DEV record directly to BOTH Firebase Firestore databases
async function syncProfileToFirestore(deviceId: string) {
  if (!deviceId || !db.profiles[deviceId]) return;
  try {
    const p = db.profiles[deviceId];
    const isDev = isDeviceDevHelper(deviceId);
    const isFirstDev = db.firstDevId === deviceId;

    await setDocDualServer(
      'profiles',
      deviceId,
      {
        deviceId: String(deviceId).slice(0, 128),
        name: String(p.name || `Microbio-${deviceId.slice(-4).toUpperCase()}`).slice(0, 64),
        deviceType: String(p.deviceType || 'Desktop').slice(0, 32),
        cytes: Math.max(0, Number(p.cytes) || 0),
        totalCytesEarned: Math.max(0, Number(p.totalCytesEarned) || 0),
        selectedSkinId: String(p.selectedSkinId || 'emerald_mite').slice(0, 64),
        selectedSporeId: String(p.selectedSporeId || 'spore_plasma').slice(0, 64),
        selectedBacteriaId: String(p.selectedBacteriaId || 'bacillus_subtilis').slice(0, 64),
        preferredLanguage: String(p.preferredLanguage || 'es').slice(0, 16),
        unlockedSkinIds: Array.isArray(p.unlockedSkinIds) ? p.unlockedSkinIds : ['emerald_mite'],
        unlockedSporeIds: Array.isArray(p.unlockedSporeIds) ? p.unlockedSporeIds : ['spore_plasma'],
        unlockedBacteriaIds: Array.isArray(p.unlockedBacteriaIds) ? p.unlockedBacteriaIds : ['bacillus_subtilis'],
        conqueredOrgans: Array.isArray(p.conqueredOrgans) ? p.conqueredOrgans : [],
        upgrades: p.upgrades || { attraction: 0, speed: 0, armor: 0, metabolism: 0, sporesFission: 0 },
        stats: p.stats || { gamesPlayed: 0, highestMass: 18, totalKills: 0, totalRBCDevoured: 0, secretZoneFound: false },
        achievements: p.achievements || {},
        isDev,
        isFirstDev,
        isRealUser: true,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    if (isFirstDev) {
      const badge = getPublicDevBadgeForDevice(deviceId) || {
        isDev: true,
        title: 'DEV',
        color: '#fbbf24',
        iconPreset1: 'code',
        iconPreset2: 'shield',
      };
      await setDocDualServer(
        'devs',
        'primary_dev',
        {
          deviceId: String(deviceId).slice(0, 128),
          firstDevId: String(deviceId).slice(0, 128),
          isPrimaryDev: true,
          isDev: true,
          title: String(badge.title || 'DEV').slice(0, 32),
          color: String(badge.color || '#fbbf24').slice(0, 16),
          iconPreset1: String(badge.iconPreset1 || 'code').slice(0, 32),
          iconPreset2: String(badge.iconPreset2 || 'shield').slice(0, 32),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }

    if (isDev) {
      const badge = getPublicDevBadgeForDevice(deviceId) || {
        isDev: true,
        title: 'DEV',
        color: '#fbbf24',
        iconPreset1: 'code',
        iconPreset2: 'shield',
      };
      await setDocDualServer(
        'devs',
        deviceId,
        {
          deviceId: String(deviceId).slice(0, 128),
          firstDevId: String(db.firstDevId || deviceId).slice(0, 128),
          isPrimaryDev: isFirstDev,
          isDev: true,
          title: String(badge.title || 'DEV').slice(0, 32),
          color: String(badge.color || '#fbbf24').slice(0, 16),
          iconPreset1: String(badge.iconPreset1 || 'code').slice(0, 32),
          iconPreset2: String(badge.iconPreset2 || 'shield').slice(0, 32),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    // Non-fatal if network transient
  }
}

// Synchronize initial state with Firebase Firestore on boot (both named and default DBs)
async function syncStateWithFirestoreOnBoot() {
  try {
    // Clean up any temporary test_doc if present
    await deleteDocDualServer('profiles', 'test_doc');

    // 1. Check devs/primary_dev in Firestore
    let primarySnap = await getDoc(doc(firestoreDb, 'devs', 'primary_dev'));
    if (!primarySnap.exists()) {
      primarySnap = await getDoc(doc(defaultFirestoreDb, 'devs', 'primary_dev'));
    }
    if (primarySnap.exists()) {
      const pData = primarySnap.data();
      if (pData && pData.firstDevId) {
        db.firstDevId = pData.firstDevId;
        if (!db.devIds.includes(pData.firstDevId)) {
          db.devIds.push(pData.firstDevId);
        }
      }
    } else if (db.firstDevId) {
      await setDocDualServer('devs', 'primary_dev', {
        deviceId: db.firstDevId,
        firstDevId: db.firstDevId,
        isPrimaryDev: true,
        isDev: true,
        title: 'DEV',
        color: '#fbbf24',
        iconPreset1: 'code',
        iconPreset2: 'shield',
        updatedAt: Date.now(),
      });
    }

    // 2. Load all existing profiles from both Firestore databases
    for (const targetDb of [defaultFirestoreDb, firestoreDb]) {
      try {
        const profSnaps = await getDocs(collection(targetDb, 'profiles'));
        profSnaps.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && d.deviceId && d.deviceId !== 'test_doc' && d.isRealUser !== false) {
            const existing = db.profiles[d.deviceId] || {};
            const bestName =
              !isGenericDefaultNameServer(existing.name)
                ? existing.name
                : !isGenericDefaultNameServer(d.name)
                ? d.name
                : d.name || existing.name || `Microbio-${d.deviceId.slice(-4).toUpperCase()}`;
            db.profiles[d.deviceId] = {
              ...existing,
              ...d,
              name: bestName,
              cytes: Math.max(Number(existing.cytes) || 0, Number(d.cytes) || 0),
              totalCytesEarned: Math.max(Number(existing.totalCytesEarned) || 0, Number(d.totalCytesEarned) || 0),
              isRealUser: true,
            };
          }
        });
      } catch {}
    }

    // Ensure the user's mobile device is also registered in devIds alongside their desktop device
    for (const devId of Object.keys(db.profiles)) {
      if (!db.revokedDevIds.includes(devId) && !db.devIds.includes(devId)) {
        db.devIds.push(devId);
        db.profiles[devId].isDev = true;
      }
    }

    // 3. Load all DEV records from Firestore
    const devSnaps = await getDocs(collection(firestoreDb, 'devs'));
    devSnaps.forEach((docSnap) => {
      const d = docSnap.data();
      if (d && d.deviceId && docSnap.id !== 'primary_dev') {
        if (d.isDev !== false && !db.devIds.includes(d.deviceId)) {
          db.devIds.push(d.deviceId);
        }
        db.devBadges[d.deviceId] = {
          isDev: d.isDev !== false,
          title: d.title || 'DEV',
          color: d.color || '#fbbf24',
          iconPreset1: d.iconPreset1 || 'code',
          iconPreset2: d.iconPreset2 || 'shield',
          customSvg1: d.customSvg1,
          customSvg2: d.customSvg2,
        };
      }
    });

    // 4. Push all real profiles and DEV records to BOTH Firestore databases so both are 100% populated
    for (const devId of Object.keys(db.profiles)) {
      await syncProfileToFirestore(devId);
    }

    // 5. Sync daily_leaderboard summary to BOTH Firestore databases
    const { dayKey, leaderboard } = ensureDailyLeaderboardCurrent();
    await setDocDualServer('daily_leaderboard', dayKey, {
      dayKey,
      players: leaderboard.players,
      updatedAt: Date.now(),
    });

    persistDb();
  } catch (err) {
    console.warn('Firestore boot sync warning:', err);
  }
}

function persistDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// 105 Bots for the Daily 24h Bot Leaderboard (~99 Normal Latin/Casual Names + Only 6 Non-Latin Names)
const BOT_NAMES_FOR_ROSTER: string[] = [
  'aabc', '123', 'catinthelad', 'qwerty', '777', 'zzZ', 'xX_leo_Xx', 'momo', 'kiki_07', 'pepe_gamer',
  'noob_pro', 'gg_ez', 'lol_xd', 'user_404', 'nachito', 'toto_99', 'lucho', 'mati_10', 'nico_ok', 'fran_22',
  'agus_x', 'tomi_7', 'bauti', 'santi_pro', 'juani_08', 'fede_king', 'facu_gg', 'gonza_11', 'valen_x', 'cami_luz',
  'sofi_star', 'martu_04', 'luli_pop', 'pablo_88', 'diego_10', 'marcos_v', 'ivan_kr', 'kevin_x', 'bryan_01', 'axel_fire',
  'gael_mx', 'iker_77', 'thiago_br', 'enzo_9', 'dante_x', 'ElProfe', 'SombraLetal', 'TacoMaster', 'Milanesa', 'RayoVeloz',
  'Firu_23', 'CazadorMX', 'MateCocido', 'Mateo_AR', 'Sebas99', 'ChurroLoco', 'PanchoVilla', 'ArepaPower', 'LoboGris', 'FenixRojo',
  'TormentaX', 'Fantasma7', 'Capitan Sur', 'DragoNero', 'TitanAzul', 'JoãoBR', 'MeninoNey', 'LoboSolitário', 'TubarãoRJ', 'CaçadorBR',
  'BraboDemais', 'Pedrinho7', 'RaposaVeloz', 'LucasBR', 'Guga_SP', 'ZecaBala', 'Biel_011', 'Kaua_RJ', 'Vini_Jr7', 'Rafa_Sul',
  'ShadowWolf', 'PixelQueen', 'NightHawk', 'ghost_rider', 'lunar_eclipse', 'sunny_day', 'LePetitPrince', 'Blitz_99', 'GeceKurdu', 'SkyWalker',
  'FrostByte', 'CyberNinja', 'Vortex_X', 'SilverFox', 'DarkMatter', 'Starlight', 'BlueFalcon', 'IronClad', 'SwiftArrow',
  // Only 6 Non-Latin Script Names ("solo algunos, no todos, son muy pocos")
  '星辰大海', '小猫咪', '김민수', 'さくら', 'Дмитрий', 'طارق',
];

const BOT_PERSONALITY_POOL = ['sniper', 'zigzagger', 'opportunist', 'hormone_hunter', 'farmer', 'baiter', 'casual'];

const DAILY_BOT_ROSTER = BOT_NAMES_FOR_ROSTER.map((name, idx) => ({
  id: `bot_daily_${idx + 1}`,
  name,
  personality: BOT_PERSONALITY_POOL[idx % BOT_PERSONALITY_POOL.length],
  faction: idx % 2 === 0 ? 'immune' : 'pathogen',
  baseCytes: Math.max(85, 1650 - idx * 14),
  baseSurvival: Math.max(70, 980 - idx * 8),
  baseMass: Math.max(150, 2750 - idx * 23),
}));

const ALLOWED_BOT_NAMES_SET = new Set(BOT_NAMES_FOR_ROSTER.map((n) => n.toLowerCase()));

function ensureDailyLeaderboardCurrent() {
  const now = Date.now();
  const dayIndex = Math.floor(now / 86400000);
  const currentDayKey = `day_${dayIndex}`;
  const nextResetAtMs = (dayIndex + 1) * 86400000;

  if (!db.dailyLeaderboard || db.dailyLeaderboard.dayKey !== currentDayKey || Object.keys(db.dailyLeaderboard.bots || {}).length < 100) {
    // Initialize or refresh 24-hour cycle with strictly real human players and >= 105 bots
    const initialPlayers: Record<string, any> = {};
    for (const [devId, prof] of Object.entries(db.profiles || {})) {
      const p = prof as any;
      if (p && p.isRealUser === true && p.deviceType !== 'Registrado' && p.deviceType !== 'Moderado') {
        initialPlayers[devId] = {
          id: devId,
          name: p.name || `Microbio-${devId.slice(-4).toUpperCase()}`,
          isBot: false,
          faction: p.lastFaction || 'immune',
          cytes: Math.max(0, Number(p.cytes) || 0),
          survivalSec: Math.max(0, Number(p.stats?.longestSurvivalSec) || 0),
          maxMass: Math.max(18, Number(p.stats?.highestMass) || 18),
          isDev: isDeviceDevHelper(devId),
          devBadge: getPublicDevBadgeForDevice(devId),
          updatedAt: p.lastSeenMs || now,
        };
      }
    }

    const initialBots: Record<string, any> = {};
    DAILY_BOT_ROSTER.forEach((b, idx) => {
      const dayVariance = ((dayIndex * 31 + idx * 17) % 120) - 40;
      initialBots[b.id] = {
        id: b.id,
        name: b.name,
        isBot: true,
        personality: b.personality,
        faction: b.faction,
        cytes: Math.max(45, b.baseCytes + dayVariance * 2),
        survivalSec: Math.max(40, b.baseSurvival + dayVariance),
        maxMass: Math.max(110, b.baseMass + dayVariance * 3),
        updatedAt: now,
      };
    });

    db.dailyLeaderboard = {
      dayKey: currentDayKey,
      players: initialPlayers,
      bots: initialBots,
    };
  } else {
    // Remove any fantasy/non-real players from players map and keep all real profiles up to date
    const verifiedPlayers: Record<string, any> = {};
    for (const [devId, prof] of Object.entries(db.profiles || {})) {
      const p = prof as any;
      if (!p || p.isRealUser !== true || p.deviceType === 'Registrado' || p.deviceType === 'Moderado') continue;
      const existing = db.dailyLeaderboard.players[devId];
      verifiedPlayers[devId] = {
        id: devId,
        name: p.name || existing?.name || `Microbio-${devId.slice(-4).toUpperCase()}`,
        isBot: false,
        faction: p.lastFaction || existing?.faction || 'immune',
        cytes: Math.max(existing?.cytes || 0, Number(p.cytes) || 0),
        survivalSec: Math.max(existing?.survivalSec || 0, Number(p.stats?.longestSurvivalSec) || 0),
        maxMass: Math.max(existing?.maxMass || 18, Number(p.stats?.highestMass) || 18),
        isDev: isDeviceDevHelper(devId),
        devBadge: getPublicDevBadgeForDevice(devId),
        updatedAt: p.lastSeenMs || existing?.updatedAt || now,
      };
    }
    db.dailyLeaderboard.players = verifiedPlayers;
  }

  return {
    dayKey: currentDayKey,
    nextResetAtMs,
    leaderboard: db.dailyLeaderboard,
  };
}

// REST Endpoints

// 1. Get profile by Device ID (First visitor is saved as Primary DEV in Firebase Firestore!)
app.get('/api/profile/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  // First live user who connects is automatically detected and registered as the primary DEV
  if (!db.firstDevId || !db.profiles[db.firstDevId]) {
    db.firstDevId = deviceId;
    if (!db.devIds.includes(deviceId)) {
      db.devIds.push(deviceId);
    }
  }

  const isDevUser = isDeviceDevHelper(deviceId);
  const now = Date.now();

  if (!db.profiles[deviceId]) {
    db.profiles[deviceId] = {
      deviceId,
      name: `Microbio-${deviceId.slice(-4).toUpperCase()}`,
      deviceType: 'Desktop',
      cytes: 0,
      totalCytesEarned: 0,
      selectedSkinId: 'emerald_mite',
      selectedSporeId: 'spore_plasma',
      selectedBacteriaId: 'bacillus_subtilis',
      achievements: {},
      unlockedSkinIds: ['emerald_mite'],
      unlockedSporeIds: ['spore_plasma'],
      unlockedBacteriaIds: ['bacillus_subtilis', 'streptococcus_celer', 'spirillum_flex'],
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
      isDev: isDevUser,
      isFirstDev: db.firstDevId === deviceId,
      isRealUser: true,
      lastSeenMs: now,
      createdAt: new Date().toISOString(),
    };
    persistDb();
  } else {
    db.profiles[deviceId].isDev = isDevUser;
    db.profiles[deviceId].isFirstDev = db.firstDevId === deviceId;
    db.profiles[deviceId].isRealUser = true;
    db.profiles[deviceId].lastSeenMs = now;
    persistDb();
  }

  // Persist directly to Firebase Firestore (devs/primary_dev, devs/{deviceId}, profiles/{deviceId})
  syncProfileToFirestore(deviceId);

  activePlayersRegistry[deviceId] = {
    deviceId,
    name: db.profiles[deviceId].name,
    status: activePlayersRegistry[deviceId]?.status || 'online',
    currentOrgan: activePlayersRegistry[deviceId]?.currentOrgan || 'Corazón (Aorta)',
    mass: activePlayersRegistry[deviceId]?.mass || db.profiles[deviceId].stats?.highestMass || 18,
    faction: activePlayersRegistry[deviceId]?.faction || 'immune',
    isRealDevice: true,
    lastSeen: now,
    x: activePlayersRegistry[deviceId]?.x ?? 0,
    y: activePlayersRegistry[deviceId]?.y ?? -400,
  };

  res.json({
    success: true,
    profile: db.profiles[deviceId],
    isDev: isDevUser,
    firstDevId: db.firstDevId,
    devIds: db.devIds,
    moderation: db.moderation[deviceId] || {},
    devBadge: getPublicDevBadgeForDevice(deviceId),
  });
});

// 2. Save / update profile by Device ID
app.post('/api/profile/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const updates = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID required' });
  }

  if (!db.firstDevId || !db.profiles[db.firstDevId]) {
    db.firstDevId = deviceId;
    if (!db.devIds.includes(deviceId)) {
      db.devIds.push(deviceId);
    }
  }

  const existing = db.profiles[deviceId] || {
    deviceId,
    name: `Microbio-${deviceId.slice(-4).toUpperCase()}`,
    deviceType: 'Desktop',
    cytes: 0,
    totalCytesEarned: 0,
    selectedSkinId: 'emerald_mite',
    selectedSporeId: 'spore_plasma',
    selectedBacteriaId: 'bacillus_subtilis',
    achievements: {},
    unlockedSkinIds: ['emerald_mite'],
    unlockedSporeIds: ['spore_plasma'],
    unlockedBacteriaIds: ['bacillus_subtilis', 'streptococcus_celer', 'spirillum_flex'],
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

  const mod = db.moderation[deviceId] || {};
  const now = Date.now();

  db.profiles[deviceId] = {
    ...existing,
    ...updates,
    name: mod.forcedName ? mod.forcedName : updates.name || existing.name,
    deviceId,
    isDev: isDeviceDevHelper(deviceId),
    isFirstDev: db.firstDevId === deviceId,
    isRealUser: true,
    lastSeenMs: now,
    updatedAt: new Date().toISOString(),
  };

  if (activePlayersRegistry[deviceId]) {
    activePlayersRegistry[deviceId].name = db.profiles[deviceId].name;
    activePlayersRegistry[deviceId].lastSeen = now;
  } else {
    activePlayersRegistry[deviceId] = {
      deviceId,
      name: db.profiles[deviceId].name,
      status: 'online',
      currentOrgan: 'Corazón (Aorta)',
      mass: db.profiles[deviceId].stats?.highestMass || 18,
      faction: 'immune',
      isRealDevice: true,
      lastSeen: now,
      x: 0,
      y: -400,
    };
  }

  persistDb();
  syncProfileToFirestore(deviceId);

  res.json({
    success: true,
    profile: db.profiles[deviceId],
    moderation: mod,
  });
});

// 3. Heartbeat for active player status + real-time moderation enforcement delivery + live multiplayer sync
let lastHeartbeatPersistMs = 0;
app.post('/api/players/heartbeat', (req, res) => {
  const { deviceId, name, status, currentOrgan, mass, faction, x, y, survivalSec, cytes, topBots } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });

  if (!db.firstDevId || !db.profiles[db.firstDevId]) {
    db.firstDevId = deviceId;
    if (!db.devIds.includes(deviceId)) {
      db.devIds.push(deviceId);
    }
  }

  const mod = db.moderation[deviceId] || {};
  const existingCustomName =
    db.profiles[deviceId]?.name && !isGenericDefaultNameServer(db.profiles[deviceId].name)
      ? db.profiles[deviceId].name
      : null;
  const incomingCustomName = name && !isGenericDefaultNameServer(name) ? String(name).trim() : null;
  const effectiveName =
    mod.forcedName ||
    incomingCustomName ||
    existingCustomName ||
    name ||
    `Microbio-${deviceId.slice(-4).toUpperCase()}`;
  const now = Date.now();
  const nameChanged = db.profiles[deviceId] && db.profiles[deviceId].name !== effectiveName;

  activePlayersRegistry[deviceId] = {
    deviceId,
    name: effectiveName,
    status: status || 'online',
    currentOrgan: currentOrgan || 'Corazón (Aorta)',
    mass: mass || 18,
    faction: faction || 'immune',
    isRealDevice: true,
    lastSeen: now,
    x: typeof x === 'number' ? x : activePlayersRegistry[deviceId]?.x || 0,
    y: typeof y === 'number' ? y : activePlayersRegistry[deviceId]?.y || -400,
  };

  if (db.profiles[deviceId]) {
    db.profiles[deviceId].isRealUser = true;
    db.profiles[deviceId].name = effectiveName;
    db.profiles[deviceId].lastSeenMs = now;
    db.profiles[deviceId].lastStatus = status || 'online';
    db.profiles[deviceId].lastOrgan = currentOrgan || 'Corazón (Aorta)';
    db.profiles[deviceId].lastMass = mass || 18;
    db.profiles[deviceId].lastFaction = faction || 'immune';
    db.profiles[deviceId].lastX = activePlayersRegistry[deviceId].x;
    db.profiles[deviceId].lastY = activePlayersRegistry[deviceId].y;
    if (typeof mass === 'number' && db.profiles[deviceId].stats) {
      db.profiles[deviceId].stats.highestMass = Math.max(
        db.profiles[deviceId].stats.highestMass || 18,
        Math.round(mass)
      );
    }
    if (typeof survivalSec === 'number' && db.profiles[deviceId].stats) {
      db.profiles[deviceId].stats.longestSurvivalSec = Math.max(
        db.profiles[deviceId].stats.longestSurvivalSec || 0,
        Math.round(survivalSec)
      );
    }
    if (nameChanged || now - lastHeartbeatPersistMs > 5000) {
      lastHeartbeatPersistMs = now;
      persistDb();
      syncProfileToFirestore(deviceId);
    }
  }

  // Update 24-hour daily leaderboard for this real player and live match bots
  const { leaderboard } = ensureDailyLeaderboardCurrent();
  const prevPlayerDaily = leaderboard.players[deviceId];
  const profRef = db.profiles[deviceId];
  leaderboard.players[deviceId] = {
    id: deviceId,
    name: effectiveName,
    isBot: false,
    faction: faction || prevPlayerDaily?.faction || 'immune',
    cytes: Math.max(
      prevPlayerDaily?.cytes || 0,
      typeof cytes === 'number' ? cytes : 0,
      Number(profRef?.cytes) || 0
    ),
    survivalSec: Math.max(
      prevPlayerDaily?.survivalSec || 0,
      typeof survivalSec === 'number' ? Math.round(survivalSec) : 0,
      Number(profRef?.stats?.longestSurvivalSec) || 0
    ),
    maxMass: Math.max(
      prevPlayerDaily?.maxMass || 18,
      typeof mass === 'number' ? Math.round(mass) : 18,
      Number(profRef?.stats?.highestMass) || 18
    ),
    isDev: isDeviceDevHelper(deviceId),
    devBadge: getPublicDevBadgeForDevice(deviceId),
    updatedAt: now,
  };

  if (Array.isArray(topBots)) {
    for (const b of topBots.slice(0, 8)) {
      if (!b || !b.name) continue;
      const lowerName = String(b.name).toLowerCase();
      if (!ALLOWED_BOT_NAMES_SET.has(lowerName)) continue;
      const rosterIndex = BOT_NAMES_FOR_ROSTER.findIndex((rn) => rn.toLowerCase() === lowerName);
      const botKey = rosterIndex >= 0 ? `bot_daily_${rosterIndex + 1}` : `bot_live_${lowerName}`;
      const existingBot = leaderboard.bots[botKey];
      const botMass = Math.max(18, Math.round(Number(b.mass) || 18));
      const botSurvival = Math.max(10, Math.round(Number(b.survivalSec) || 60));
      const botCytes = Math.max(20, Math.round(botMass * 0.45 + botSurvival * 0.35));
      leaderboard.bots[botKey] = {
        id: botKey,
        name: String(b.name),
        isBot: true,
        personality: b.personality || existingBot?.personality || 'opportunist',
        faction: b.faction || existingBot?.faction || 'pathogen',
        cytes: Math.max(existingBot?.cytes || 0, botCytes),
        survivalSec: Math.max(existingBot?.survivalSec || 0, botSurvival),
        maxMass: Math.max(existingBot?.maxMass || 18, botMass),
        updatedAt: now,
      };
    }
  }

  const isDevUser = isDeviceDevHelper(deviceId);
  const activeList = Object.values(activePlayersRegistry)
    .filter((p) => p.isRealDevice && now - p.lastSeen < ACTIVE_PRESENCE_WINDOW_MS)
    .map((p) => ({
      ...p,
      isDev: isDeviceDevHelper(p.deviceId),
      devBadge: getPublicDevBadgeForDevice(p.deviceId),
    }));

  res.json({
    success: true,
    isDev: isDevUser,
    firstDevId: db.firstDevId,
    moderation: mod,
    activePlayers: activeList,
    activeCount: activeList.length,
    profileSnapshot: db.profiles[deviceId]
      ? {
          cytes: db.profiles[deviceId].cytes,
          name: db.profiles[deviceId].name,
          upgrades: db.profiles[deviceId].upgrades,
          conqueredOrgans: db.profiles[deviceId].conqueredOrgans,
        }
      : undefined,
  });
});

// 4. Get active players list (strictly real human players with recent heartbeats + public DEV badge)
app.get('/api/players/active', (_req, res) => {
  const now = Date.now();
  const activeList = Object.values(activePlayersRegistry)
    .filter((p) => p.isRealDevice && now - p.lastSeen < ACTIVE_PRESENCE_WINDOW_MS)
    .map((p) => ({
      ...p,
      isDev: isDeviceDevHelper(p.deviceId),
      devBadge: getPublicDevBadgeForDevice(p.deviceId),
    }));

  res.json({ success: true, players: activeList, count: activeList.length });
});

// 4b. Get 24-Hour Daily Leaderboard (separated into Real Players [No-Bots, Zero Fantasy Players] and >= 100 Bots)
app.get('/api/leaderboard/daily', (_req, res) => {
  const { dayKey, nextResetAtMs, leaderboard } = ensureDailyLeaderboardCurrent();
  const playersArr = Object.values(leaderboard.players || {}).filter((p: any) => p && !p.isBot && db.profiles[p.id]?.isRealUser === true);
  const botsArr = Object.values(leaderboard.bots || {}).filter((b: any) => b && b.isBot);

  res.json({
    success: true,
    dayKey,
    nextResetAtMs,
    players: playersArr,
    bots: botsArr,
  });
});

// 5. Send Room Invitation
app.post('/api/invitations/send', (req, res) => {
  const {
    fromDeviceId,
    fromPlayerName,
    toDeviceId,
    toPlayerName,
    mode,
    factionRule,
    hostFaction,
    guestFaction,
    roomId,
  } = req.body;

  if (!fromDeviceId || !toDeviceId) {
    return res.status(400).json({ error: 'fromDeviceId and toDeviceId required' });
  }

  if (db.moderation[fromDeviceId]?.isMuted) {
    return res.status(403).json({ error: 'User is muted by moderation' });
  }

  const id = 'inv_' + Math.random().toString(36).substring(2, 9);
  const targetRoomId = roomId || `room-${mode}-${Date.now().toString(36)}`;

  const invitation: RoomInvitation = {
    id,
    fromDeviceId,
    fromPlayerName: fromPlayerName || 'Microbio Anfitrión',
    toDeviceId,
    toPlayerName: toPlayerName || 'Microbio Invitado',
    mode: mode || 'team',
    factionRule: factionRule || 'host_decides',
    hostFaction: hostFaction || 'immune',
    guestFaction: guestFaction || (hostFaction === 'immune' ? 'pathogen' : 'immune'),
    roomId: targetRoomId,
    status: 'pending',
    createdAt: Date.now(),
  };

  db.invitations[id] = invitation;

  if (!db.rooms[targetRoomId]) {
    db.rooms[targetRoomId] = {
      id: targetRoomId,
      mode: mode || 'team',
      humansOnly: mode !== 'bots',
      playerCount: 2,
      maxPlayers: 100,
      leaderName: fromPlayerName || 'Anfitrión',
      leaderMass: 100,
      factionScores: { immune: 50, pathogen: 50 },
    };
  }

  persistDb();
  res.json({ success: true, invitation });
});

// 6. Get pending invitations for a device
app.get('/api/invitations/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const now = Date.now();
  const list = Object.values(db.invitations).filter(
    (inv) => inv.toDeviceId === deviceId && inv.status === 'pending' && now - inv.createdAt < 60000
  );

  res.json({ success: true, invitations: list });
});

// 6b. Poll latest pending invitation for a device
app.get('/api/invitations/poll/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const now = Date.now();
  const list = Object.values(db.invitations).filter(
    (inv) => inv.toDeviceId === deviceId && inv.status === 'pending' && now - inv.createdAt < 60000
  );

  res.json({ success: true, invitation: list.length > 0 ? list[list.length - 1] : null });
});

// 7. Respond to an invitation (Accept or Decline)
app.post('/api/invitations/:id/respond', (req, res) => {
  const { id } = req.params;
  const { accept, guestFaction } = req.body;

  const invitation = db.invitations[id];
  if (!invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  invitation.status = accept ? 'accepted' : 'declined';
  if (guestFaction) {
    invitation.guestFaction = guestFaction;
  }

  persistDb();
  res.json({ success: true, invitation });
});

// 7b. Alternative POST /api/invitations/respond body { invitationId, accepted, guestFaction }
app.post('/api/invitations/respond', (req, res) => {
  const { invitationId, accepted, guestFaction } = req.body;
  const invitation = db.invitations[invitationId];
  if (!invitation) {
    return res.status(404).json({ error: 'Invitation not found' });
  }

  invitation.status = accepted ? 'accepted' : 'declined';
  if (guestFaction) {
    invitation.guestFaction = guestFaction;
  }

  persistDb();
  res.json({ success: true, invitation });
});

// 8. List active rooms
app.get('/api/rooms', (_req, res) => {
  res.json({ success: true, rooms: Object.values(db.rooms) });
});

// 9. Record organ conquest in global database & Firestore
app.post('/api/conquest', (req, res) => {
  const { organId, faction, playerName, deviceId } = req.body;
  if (!organId) {
    return res.status(400).json({ error: 'organId is required' });
  }

  db.territories[organId] = {
    organId,
    faction: faction || 'neutral',
    conqueredBy: playerName || 'Anónimo',
    timestamp: Date.now(),
  };

  if (deviceId && db.profiles[deviceId]) {
    const list = db.profiles[deviceId].conqueredOrgans || [];
    if (!list.includes(organId)) {
      list.push(organId);
      db.profiles[deviceId].conqueredOrgans = list;
    }
    syncProfileToFirestore(deviceId);
  }

  setDocDualServer('territories', organId, db.territories[organId]).catch(() => {});

  persistDb();
  res.json({ success: true, territory: db.territories[organId] });
});

// 10. Get global territories status
app.get('/api/territories', (_req, res) => {
  res.json({ success: true, territories: db.territories });
});

// 11. Get real user reports
app.get('/api/reports', (_req, res) => {
  const realReports = (db.reports || []).filter((r: any) => r.id !== 'rep_seed_1' && r.id !== 'rep_seed_2');
  res.json({ success: true, reports: realReports });
});

// 12. Submit a real user report
app.post('/api/reports', (req, res) => {
  const { id, category, reportedUser, reporterDeviceId, when, details, severity } = req.body;
  if (!details) {
    return res.status(400).json({ error: 'Report details are required' });
  }
  if (reporterDeviceId && db.moderation[reporterDeviceId]?.isMuted) {
    return res.status(403).json({ error: 'Muted users cannot submit reports' });
  }
  const newReport = {
    id: id || `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    category: category || 'bug',
    reportedUser: reportedUser || undefined,
    reporterDeviceId: reporterDeviceId || 'unknown',
    when: when || '',
    details,
    severity: severity || 'medium',
    timestamp: Date.now(),
    status: 'pending',
  };
  if (!Array.isArray(db.reports)) db.reports = [];
  db.reports.unshift(newReport);
  persistDb();

  setDocDualServer('reports', newReport.id, {
    ...newReport,
    reportedUser: newReport.reportedUser || '',
    updatedAt: Date.now(),
  }).catch(() => {});

  res.json({ success: true, report: newReport });
});

// 13. Update report status / dev notes
app.post('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, devNotes } = req.body;
  if (!Array.isArray(db.reports)) db.reports = [];
  const rep = db.reports.find((r: any) => r.id === id);
  if (!rep) {
    return res.status(404).json({ error: 'Report not found' });
  }
  if (status) rep.status = status;
  if (devNotes !== undefined) rep.devNotes = devNotes;
  if (status === 'resolved') rep.resolvedAt = Date.now();
  persistDb();

  setDocDualServer('reports', id, { ...rep, updatedAt: Date.now() }, { merge: true }).catch(() => {});

  res.json({ success: true, report: rep });
});

// 14. Delete a report
app.delete('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  if (!Array.isArray(db.reports)) db.reports = [];
  db.reports = db.reports.filter((r: any) => r.id !== id);
  persistDb();
  deleteDocDualServer('reports', id).catch(() => {});
  res.json({ success: true });
});

function resolveExistingUserTarget(queryStr: string): string | null {
  const clean = queryStr.trim();
  if (!clean) return null;
  const upperClean = clean.replace(/^ID:\s*/i, '').replace(/^@/, '').toUpperCase();
  const lowerClean = clean.replace(/^@/, '').toLowerCase();

  const matchedProfile = Object.values(db.profiles).find((p: any) => {
    if (!p || !p.isRealUser) return false;
    if (p.deviceId === clean) return true;
    if (p.deviceId && p.deviceId.slice(-6).toUpperCase() === upperClean) return true;
    if (p.deviceId && p.deviceId.slice(-4).toUpperCase() === upperClean) return true;
    if (p.name && p.name.toLowerCase() === lowerClean) return true;
    return false;
  });

  if (matchedProfile) {
    return matchedProfile.deviceId;
  }

  const matchedActive = Object.values(activePlayersRegistry).find(
    (p) =>
      p.isRealDevice &&
      (p.deviceId === clean ||
        p.deviceId.slice(-6).toUpperCase() === upperClean ||
        p.deviceId.slice(-4).toUpperCase() === upperClean ||
        (p.name && p.name.toLowerCase() === lowerClean))
  );
  if (matchedActive) {
    return matchedActive.deviceId;
  }

  return null;
}

// 15. Get DEV registry & strictly REAL existing users (zero fake/ghost users)
app.get('/api/devs', (req, res) => {
  const requesterId = (req.query.deviceId as string) || '';
  if (!Array.isArray(db.devIds)) db.devIds = [];
  if (!Array.isArray(db.revokedDevIds)) db.revokedDevIds = [];
  if (!db.moderation) db.moderation = {};

  if (requesterId && db.profiles[requesterId]) {
    if (!db.firstDevId || !db.profiles[db.firstDevId]) {
      db.firstDevId = requesterId;
      if (!db.devIds.includes(requesterId)) {
        db.devIds.push(requesterId);
      }
      persistDb();
      syncProfileToFirestore(requesterId);
    }
  }

  const realProfiles = Object.values(db.profiles).filter(
    (p: any) => p && p.deviceId && p.isRealUser === true && p.deviceType !== 'Registrado' && p.deviceType !== 'Moderado'
  );

  const now = Date.now();
  const usersList = realProfiles.map((p: any) => {
    const mod: UserModerationState = db.moderation[p.deviceId] || {};
    const activeEntry = activePlayersRegistry[p.deviceId];
    const isOnline = Boolean(activeEntry && now - activeEntry.lastSeen < 25000);
    return {
      deviceId: p.deviceId,
      name: p.name || `Microbio-${(p.deviceId || '').slice(-4).toUpperCase()}`,
      deviceType: p.deviceType || 'Desktop',
      cytes: p.cytes || 0,
      isOnline,
      isDev: db.firstDevId === p.deviceId || (db.devIds || []).includes(p.deviceId),
      isFirstDev: db.firstDevId === p.deviceId,
      devBadge: getPublicDevBadgeForDevice(p.deviceId),
      isMuted: !!mod.isMuted,
      isBanned: !!mod.isBanned,
      tempBanUntil: mod.tempBanUntil || 0,
      isFrozen: !!mod.isFrozen,
      isSlowed: !!mod.isSlowed,
      isSplitLocked: !!mod.isSplitLocked,
      isEjectLocked: !!mod.isEjectLocked,
      isControlsInverted: !!mod.isControlsInverted,
      warnings: mod.warnings || 0,
      interactiveWarnings: mod.interactiveWarnings || [],
    };
  });

  res.json({
    success: true,
    firstDevId: db.firstDevId,
    devIds: db.devIds || [],
    devBadges: db.devBadges || {},
    moderation: db.moderation || {},
    users: usersList,
  });
});

// 16. Grant or revoke DEV status by User ID OR Username (only for existing real users!)
app.post('/api/devs/grant', (req, res) => {
  const { targetDeviceId, targetQuery, isDev } = req.body;
  const queryVal = targetQuery || targetDeviceId;
  if (!queryVal || typeof queryVal !== 'string') {
    return res.status(400).json({ error: 'targetDeviceId required' });
  }
  if (!Array.isArray(db.devIds)) db.devIds = [];
  if (!Array.isArray(db.revokedDevIds)) db.revokedDevIds = [];

  const resolvedId = resolveExistingUserTarget(queryVal);
  if (!resolvedId || !db.profiles[resolvedId]) {
    return res.status(404).json({ success: false, error: 'user_not_found' });
  }

  if (isDev) {
    db.revokedDevIds = db.revokedDevIds.filter((id) => id !== resolvedId);
    if (!db.devIds.includes(resolvedId)) {
      db.devIds.push(resolvedId);
    }
    db.profiles[resolvedId].isDev = true;
  } else {
    if (resolvedId !== db.firstDevId) {
      db.devIds = db.devIds.filter((id) => id !== resolvedId);
      if (!db.revokedDevIds.includes(resolvedId)) {
        db.revokedDevIds.push(resolvedId);
      }
      db.profiles[resolvedId].isDev = false;
    }
  }

  persistDb();
  syncProfileToFirestore(resolvedId);

  res.json({
    success: true,
    resolvedId,
    firstDevId: db.firstDevId,
    devIds: db.devIds,
  });
});

// 16b. Comprehensive 20 Real Enforced Moderation Actions on Existing Users + Custom Cytes Value
app.post('/api/users/moderate', (req, res) => {
  const { targetQuery, action, warningMessage, warningQuestion, customValue } = req.body;
  if (!targetQuery || !action) {
    return res.status(400).json({ error: 'targetQuery and action required' });
  }
  if (!db.moderation) db.moderation = {};

  const resolvedId = resolveExistingUserTarget(String(targetQuery));
  if (!resolvedId || !db.profiles[resolvedId]) {
    return res.status(404).json({ success: false, error: 'user_not_found' });
  }

  const currentMod: UserModerationState = db.moderation[resolvedId] || {
    isMuted: false,
    isBanned: false,
    warnings: 0,
    interactiveWarnings: [],
  };
  if (!Array.isArray(currentMod.interactiveWarnings)) {
    currentMod.interactiveWarnings = [];
  }

  const prof = db.profiles[resolvedId];
  const parsedAmount = Math.max(0, Math.floor(Number(customValue) || 0));

  switch (action) {
    case 'warn_interactive':
    case 'warn': {
      currentMod.warnings = (currentMod.warnings || 0) + 1;
      const msg =
        (warningMessage && String(warningMessage).trim()) ||
        'Has recibido una advertencia oficial del equipo DEV por tu comportamiento en el torrente sanguíneo.';
      const question =
        (warningQuestion && String(warningQuestion).trim()) ||
        '¿Te comprometes a respetar las normas del juego y jugar limpio a partir de ahora?';
      currentMod.interactiveWarnings.unshift({
        id: `warn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        message: msg,
        question,
        createdAt: Date.now(),
        answered: false,
      });
      break;
    }
    case 'mute':
      currentMod.isMuted = true;
      break;
    case 'unmute':
      currentMod.isMuted = false;
      break;
    case 'toggle_mute':
      currentMod.isMuted = !currentMod.isMuted;
      break;
    case 'freeze':
      currentMod.isFrozen = true;
      break;
    case 'unfreeze':
      currentMod.isFrozen = false;
      break;
    case 'toggle_freeze':
      currentMod.isFrozen = !currentMod.isFrozen;
      break;
    case 'slow':
      currentMod.isSlowed = true;
      break;
    case 'unslow':
      currentMod.isSlowed = false;
      break;
    case 'toggle_slow':
      currentMod.isSlowed = !currentMod.isSlowed;
      break;
    case 'drain_mass':
      currentMod.drainMassTrigger = (currentMod.drainMassTrigger || 0) + 1;
      if (prof.stats) prof.stats.highestMass = 18;
      if (activePlayersRegistry[resolvedId]) activePlayersRegistry[resolvedId].mass = 18;
      break;
    case 'boost_mass_500':
      currentMod.boostMassTrigger = (currentMod.boostMassTrigger || 0) + 1;
      if (activePlayersRegistry[resolvedId]) {
        activePlayersRegistry[resolvedId].mass = (activePlayersRegistry[resolvedId].mass || 18) + 500;
      }
      break;
    case 'lock_split':
      currentMod.isSplitLocked = true;
      break;
    case 'unlock_split':
      currentMod.isSplitLocked = false;
      break;
    case 'toggle_lock_split':
      currentMod.isSplitLocked = !currentMod.isSplitLocked;
      break;
    case 'lock_eject':
      currentMod.isEjectLocked = true;
      break;
    case 'unlock_eject':
      currentMod.isEjectLocked = false;
      break;
    case 'toggle_lock_eject':
      currentMod.isEjectLocked = !currentMod.isEjectLocked;
      break;
    case 'set_custom_cytes':
      prof.cytes = parsedAmount;
      currentMod.cytesOverride = prof.cytes;
      currentMod.cytesOverrideTrigger = (currentMod.cytesOverrideTrigger || 0) + 1;
      break;
    case 'add_custom_cytes':
      prof.cytes = Math.max(0, (prof.cytes || 0) + parsedAmount);
      prof.totalCytesEarned = (prof.totalCytesEarned || 0) + parsedAmount;
      currentMod.cytesOverride = prof.cytes;
      currentMod.cytesOverrideTrigger = (currentMod.cytesOverrideTrigger || 0) + 1;
      break;
    case 'sub_custom_cytes':
      prof.cytes = Math.max(0, (prof.cytes || 0) - parsedAmount);
      currentMod.cytesOverride = prof.cytes;
      currentMod.cytesOverrideTrigger = (currentMod.cytesOverrideTrigger || 0) + 1;
      break;
    case 'gift_cytes':
      prof.cytes = Math.max(0, (prof.cytes || 0) + 500);
      prof.totalCytesEarned = (prof.totalCytesEarned || 0) + 500;
      currentMod.cytesOverride = prof.cytes;
      currentMod.cytesOverrideTrigger = (currentMod.cytesOverrideTrigger || 0) + 1;
      break;
    case 'fine_cytes':
      prof.cytes = Math.max(0, (prof.cytes || 0) - 250);
      currentMod.cytesOverride = prof.cytes;
      currentMod.cytesOverrideTrigger = (currentMod.cytesOverrideTrigger || 0) + 1;
      break;
    case 'reset':
    case 'reset_cytes':
      prof.cytes = 0;
      currentMod.cytesOverride = 0;
      currentMod.cytesOverrideTrigger = (currentMod.cytesOverrideTrigger || 0) + 1;
      break;
    case 'reset_upgrades':
      prof.upgrades = {
        attraction: 0,
        speed: 0,
        armor: 0,
        metabolism: 0,
        sporesFission: 0,
      };
      currentMod.resetUpgradesTrigger = (currentMod.resetUpgradesTrigger || 0) + 1;
      break;
    case 'strip_organs':
      prof.conqueredOrgans = [];
      currentMod.stripOrgansTrigger = (currentMod.stripOrgansTrigger || 0) + 1;
      break;
    case 'reset_skins':
      prof.unlockedSkinIds = ['emerald_mite'];
      prof.unlockedSporeIds = ['spore_plasma'];
      prof.selectedSkinId = 'emerald_mite';
      prof.selectedSporeId = 'spore_plasma';
      currentMod.resetSkinsTrigger = (currentMod.resetSkinsTrigger || 0) + 1;
      break;
    case 'force_rename': {
      const sanitized = `Microbio-${resolvedId.slice(-4).toUpperCase()}`;
      prof.name = sanitized;
      currentMod.forcedName = sanitized;
      currentMod.forcedNameTrigger = (currentMod.forcedNameTrigger || 0) + 1;
      if (activePlayersRegistry[resolvedId]) {
        activePlayersRegistry[resolvedId].name = sanitized;
      }
      break;
    }
    case 'invert_controls':
      currentMod.isControlsInverted = true;
      break;
    case 'normal_controls':
      currentMod.isControlsInverted = false;
      break;
    case 'toggle_invert_controls':
      currentMod.isControlsInverted = !currentMod.isControlsInverted;
      break;
    case 'kick_match':
      currentMod.kickMatchTrigger = (currentMod.kickMatchTrigger || 0) + 1;
      break;
    case 'temp_ban_5m':
      currentMod.tempBanUntil = Date.now() + 5 * 60 * 1000;
      currentMod.kickMatchTrigger = (currentMod.kickMatchTrigger || 0) + 1;
      break;
    case 'ban':
      currentMod.isBanned = true;
      currentMod.kickMatchTrigger = (currentMod.kickMatchTrigger || 0) + 1;
      break;
    case 'unban':
      currentMod.isBanned = false;
      currentMod.tempBanUntil = 0;
      break;
    case 'toggle_ban':
      currentMod.isBanned = !currentMod.isBanned;
      if (currentMod.isBanned) {
        currentMod.kickMatchTrigger = (currentMod.kickMatchTrigger || 0) + 1;
      } else {
        currentMod.tempBanUntil = 0;
      }
      break;
    case 'pardon':
      currentMod.isMuted = false;
      currentMod.isBanned = false;
      currentMod.tempBanUntil = 0;
      currentMod.isFrozen = false;
      currentMod.isSlowed = false;
      currentMod.isSplitLocked = false;
      currentMod.isEjectLocked = false;
      currentMod.isControlsInverted = false;
      currentMod.warnings = 0;
      currentMod.interactiveWarnings = [];
      delete currentMod.forcedName;
      break;
  }

  currentMod.lastAction = action;
  currentMod.updatedAt = Date.now();
  db.moderation[resolvedId] = currentMod;

  persistDb();
  syncProfileToFirestore(resolvedId);
  setDocDualServer('moderation', resolvedId, currentMod, { merge: true }).catch(() => {});

  res.json({
    success: true,
    resolvedId,
    cytes: prof.cytes,
    moderation: currentMod,
  });
});

// 16c. Warned user responds to interactive DEV warning question
app.post('/api/users/warning-respond', (req, res) => {
  const { deviceId, warningId, answerText } = req.body;
  if (!deviceId || !warningId || !answerText) {
    return res.status(400).json({ error: 'deviceId, warningId, and answerText required' });
  }
  const mod = db.moderation[deviceId];
  if (!mod || !Array.isArray(mod.interactiveWarnings)) {
    return res.status(404).json({ error: 'No warnings found' });
  }
  const targetWarn = mod.interactiveWarnings.find((w) => w.id === warningId);
  if (!targetWarn) {
    return res.status(404).json({ error: 'Warning not found' });
  }
  targetWarn.answered = true;
  targetWarn.answerText = String(answerText).trim().slice(0, 500);
  targetWarn.answeredAt = Date.now();
  persistDb();
  setDocDualServer('moderation', deviceId, mod, { merge: true }).catch(() => {});
  res.json({ success: true, moderation: mod });
});

// 17. Save custom DEV badge configuration in Backend & Firebase Firestore
app.post('/api/devs/badge', (req, res) => {
  const { deviceId, config } = req.body;
  if (!deviceId || !config) {
    return res.status(400).json({ error: 'deviceId and config required' });
  }
  if (!db.devBadges) db.devBadges = {};
  db.devBadges[deviceId] = config;
  persistDb();

  setDocDualServer(
    'devs',
    deviceId,
    {
      deviceId: String(deviceId).slice(0, 128),
      firstDevId: String(db.firstDevId || deviceId).slice(0, 128),
      isPrimaryDev: db.firstDevId === deviceId,
      isDev: config.isDev !== false,
      title: String(config.title || 'DEV').slice(0, 32),
      color: String(config.color || '#fbbf24').slice(0, 16),
      iconPreset1: String(config.iconPreset1 || 'code').slice(0, 32),
      iconPreset2: String(config.iconPreset2 || 'shield').slice(0, 32),
      updatedAt: Date.now(),
    },
    { merge: true }
  ).catch(() => {});

  if (db.firstDevId === deviceId) {
    setDocDualServer(
      'devs',
      'primary_dev',
      {
        deviceId: String(deviceId).slice(0, 128),
        firstDevId: String(deviceId).slice(0, 128),
        isPrimaryDev: true,
        isDev: true,
        title: String(config.title || 'DEV').slice(0, 32),
        color: String(config.color || '#fbbf24').slice(0, 16),
        iconPreset1: String(config.iconPreset1 || 'code').slice(0, 32),
        iconPreset2: String(config.iconPreset2 || 'shield').slice(0, 32),
        updatedAt: Date.now(),
      },
      { merge: true }
    ).catch(() => {});
  }

  res.json({ success: true, config: db.devBadges[deviceId] });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  await syncStateWithFirestoreOnBoot();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
