import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  warnings?: number;
  interactiveWarnings?: InteractiveWarning[];
  drainMassTrigger?: number;
  kickMatchTrigger?: number;
  resetUpgradesTrigger?: number;
  stripOrgansTrigger?: number;
  cytesOverride?: number;
  cytesOverrideTrigger?: number;
  forcedName?: string;
  forcedNameTrigger?: number;
  lastAction?: string;
  updatedAt?: number;
}

// In-memory + persistent database store
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
      maxPlayers: 50,
      leaderName: 'Microbio',
      leaderMass: 18,
    },
    'room-human-team': {
      id: 'room-human-team',
      mode: 'team',
      humansOnly: true,
      playerCount: 1,
      maxPlayers: 50,
      leaderName: 'Microbio',
      leaderMass: 18,
      factionScores: { immune: 50, pathogen: 50 },
    },
    'room-bot-practice': {
      id: 'room-bot-practice',
      mode: 'bots',
      humansOnly: false,
      playerCount: 50,
      maxPlayers: 50,
      leaderName: 'Bacillus-Prime',
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

// Registry of REAL connected devices via heartbeat
let activePlayersRegistry: Record<string, ActivePlayer> = {};

// Load database if exists, cleaning any non-real/fake ghost users
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const rawProfiles = parsed.profiles || {};
    const cleanedProfiles: Record<string, any> = {};
    for (const [id, p] of Object.entries(rawProfiles)) {
      const prof = p as any;
      // Keep only genuine browser device profiles (must have isRealUser===true)
      if (prof && prof.deviceId && prof.isRealUser === true && prof.deviceType !== 'Registrado' && prof.deviceType !== 'Moderado') {
        cleanedProfiles[id] = prof;
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

function persistDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

function getPublicDevBadgeForDevice(deviceId: string) {
  const isDev = db.firstDevId === deviceId || (db.devIds || []).includes(deviceId);
  if (!isDev) return undefined;
  return (
    db.devBadges?.[deviceId] || {
      isDev: true,
      title: 'DEV',
      color: '#fbbf24',
      iconPreset1: 'code',
      iconPreset2: 'shield',
    }
  );
}

// REST Endpoints

// 1. Get profile by Device ID (starts with 0 cytes!)
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

  const isDevUser = db.firstDevId === deviceId || db.devIds.includes(deviceId);

  if (!db.profiles[deviceId]) {
    // New device: strictly starts with 0 cytes as specified by the user!
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
      isRealUser: true,
      createdAt: new Date().toISOString(),
    };
    persistDb();
  } else {
    db.profiles[deviceId].isDev = isDevUser;
    db.profiles[deviceId].isRealUser = true;
    persistDb();
  }

  // Register in active players
  activePlayersRegistry[deviceId] = {
    deviceId,
    name: db.profiles[deviceId].name,
    status: 'online',
    currentOrgan: 'Corazón (Aorta)',
    mass: db.profiles[deviceId].stats?.highestMass || 18,
    faction: 'immune',
    isRealDevice: true,
    lastSeen: Date.now(),
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

  const existing = db.profiles[deviceId] || {
    deviceId,
    name: 'Microbio-Host',
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

  db.profiles[deviceId] = {
    ...existing,
    ...updates,
    name: mod.forcedName ? mod.forcedName : updates.name || existing.name,
    deviceId, // immutable
    isRealUser: true,
    updatedAt: new Date().toISOString(),
  };

  if (activePlayersRegistry[deviceId]) {
    activePlayersRegistry[deviceId].name = db.profiles[deviceId].name;
    activePlayersRegistry[deviceId].lastSeen = Date.now();
  }

  persistDb();
  res.json({
    success: true,
    profile: db.profiles[deviceId],
    moderation: mod,
  });
});

// 3. Heartbeat for active player status + real-time moderation enforcement delivery
app.post('/api/players/heartbeat', (req, res) => {
  const { deviceId, name, status, currentOrgan, mass, faction } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });

  if (!db.firstDevId || !db.profiles[db.firstDevId]) {
    db.firstDevId = deviceId;
    if (!db.devIds.includes(deviceId)) {
      db.devIds.push(deviceId);
    }
  }

  const mod = db.moderation[deviceId] || {};
  const effectiveName = mod.forcedName || name || `Microbio-${deviceId.slice(-4).toUpperCase()}`;

  activePlayersRegistry[deviceId] = {
    deviceId,
    name: effectiveName,
    status: status || 'online',
    currentOrgan: currentOrgan || 'Corazón (Aorta)',
    mass: mass || 18,
    faction: faction || 'immune',
    isRealDevice: true,
    lastSeen: Date.now(),
  };

  if (db.profiles[deviceId]) {
    db.profiles[deviceId].isRealUser = true;
    db.profiles[deviceId].name = effectiveName;
  }

  const isDevUser = db.firstDevId === deviceId || (db.devIds || []).includes(deviceId);

  res.json({
    success: true,
    isDev: isDevUser,
    firstDevId: db.firstDevId,
    moderation: mod,
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
    .filter((p) => p.isRealDevice && now - p.lastSeen < 25000)
    .map((p) => ({
      ...p,
      isDev: db.firstDevId === p.deviceId || (db.devIds || []).includes(p.deviceId),
      devBadge: getPublicDevBadgeForDevice(p.deviceId),
    }));

  res.json({ success: true, players: activeList, count: activeList.length });
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

  // Enforce mute moderation: muted users cannot send invitations
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

  // Ensure room exists
  if (!db.rooms[targetRoomId]) {
    db.rooms[targetRoomId] = {
      id: targetRoomId,
      mode: mode || 'team',
      humansOnly: mode !== 'bots',
      playerCount: 2,
      maxPlayers: 50,
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

// 8. List active rooms (max 50 players per room)
app.get('/api/rooms', (_req, res) => {
  res.json({ success: true, rooms: Object.values(db.rooms) });
});

// 9. Record organ conquest in global database
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
  }

  persistDb();
  res.json({ success: true, territory: db.territories[organId] });
});

// 10. Get global territories status
app.get('/api/territories', (_req, res) => {
  res.json({ success: true, territories: db.territories });
});

// 11. Get real user reports (no fake seed reports)
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
  res.json({ success: true, report: rep });
});

// 14. Delete a report
app.delete('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  if (!Array.isArray(db.reports)) db.reports = [];
  db.reports = db.reports.filter((r: any) => r.id !== id);
  persistDb();
  res.json({ success: true });
});

// Helper to resolve an EXISTING real user by Device ID, short ID, or Username (case-insensitive)
// Returns null if no real existing user matches, preventing creation of fake/ghost users!
function resolveExistingUserTarget(queryStr: string): string | null {
  const clean = queryStr.trim();
  if (!clean) return null;
  const upperClean = clean.replace(/^ID:\s*/i, '').replace(/^@/, '').toUpperCase();
  const lowerClean = clean.replace(/^@/, '').toLowerCase();

  // Check real profiles first
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

  // Also check currently online real players
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
    }
  }

  // Strictly filter to real users who actually exist in db.profiles with isRealUser === true
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
  res.json({
    success: true,
    resolvedId,
    firstDevId: db.firstDevId,
    devIds: db.devIds,
  });
});

// 16b. Comprehensive 16+ Real Moderation Actions on Existing Users
app.post('/api/users/moderate', (req, res) => {
  const { targetQuery, action, warningMessage, warningQuestion } = req.body;
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
      currentMod.warnings = 0;
      currentMod.interactiveWarnings = [];
      delete currentMod.forcedName;
      break;
  }

  currentMod.lastAction = action;
  currentMod.updatedAt = Date.now();
  db.moderation[resolvedId] = currentMod;

  persistDb();
  res.json({
    success: true,
    resolvedId,
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
  res.json({ success: true, moderation: mod });
});

// 17. Save custom DEV badge configuration
app.post('/api/devs/badge', (req, res) => {
  const { deviceId, config } = req.body;
  if (!deviceId || !config) {
    return res.status(400).json({ error: 'deviceId and config required' });
  }
  if (!db.devBadges) db.devBadges = {};
  db.devBadges[deviceId] = config;
  persistDb();
  res.json({ success: true, config: db.devBadges[deviceId] });
});


// Setup Vite middleware in dev or static files in production
async function startServer() {
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
