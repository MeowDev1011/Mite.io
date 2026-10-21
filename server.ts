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
}

let db: DatabaseSchema = {
  profiles: {},
  territories: {},
  rooms: {
    'room-human-ffa': {
      id: 'room-human-ffa',
      mode: 'ffa',
      humansOnly: true,
      playerCount: 18,
      maxPlayers: 50,
      leaderName: 'Alpha-Leuko',
      leaderMass: 2450,
    },
    'room-human-team': {
      id: 'room-human-team',
      mode: 'team',
      humansOnly: true,
      playerCount: 26,
      maxPlayers: 50,
      leaderName: 'Titan-Macrophage',
      leaderMass: 3100,
      factionScores: { immune: 54, pathogen: 46 },
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
};

// Seed Active Players (Simulated Live Network Microbes + Real Devices)
const simulatedPlayers: ActivePlayer[] = [
  { deviceId: 'bio_net_01', name: 'Macrófago-Centinela', status: 'in_game', currentOrgan: 'Corazón (Aorta)', mass: 420, faction: 'immune', isRealDevice: false, lastSeen: Date.now() },
  { deviceId: 'bio_net_02', name: 'Virus-Ébola-Apex', status: 'in_game', currentOrgan: 'Bazo (Filtro Linfático)', mass: 680, faction: 'pathogen', isRealDevice: false, lastSeen: Date.now() },
  { deviceId: 'bio_net_03', name: 'Glóbulo-Blanco-Alfa', status: 'online', currentOrgan: 'Pulmones (Alvéolos)', mass: 190, faction: 'immune', isRealDevice: false, lastSeen: Date.now() },
  { deviceId: 'bio_net_04', name: 'Staphylococcus-Aureus', status: 'in_game', currentOrgan: 'Hígado (Metabolismo)', mass: 530, faction: 'pathogen', isRealDevice: false, lastSeen: Date.now() },
  { deviceId: 'bio_net_05', name: 'Neutrófilo-Guardián', status: 'online', currentOrgan: 'Cerebro (Hemisferio Anterior)', mass: 310, faction: 'immune', isRealDevice: false, lastSeen: Date.now() },
  { deviceId: 'bio_net_06', name: 'Yersinia-Pestis-X', status: 'in_game', currentOrgan: 'Riñones (Filtración)', mass: 470, faction: 'pathogen', isRealDevice: false, lastSeen: Date.now() },
  { deviceId: 'bio_net_07', name: 'Probiótico-Lactis', status: 'online', currentOrgan: 'Estómago e Intestino', mass: 140, faction: 'immune', isRealDevice: false, lastSeen: Date.now() },
  { deviceId: 'bio_net_08', name: 'Clostridium-Alfa', status: 'in_game', currentOrgan: 'Vasos Femorales', mass: 590, faction: 'pathogen', isRealDevice: false, lastSeen: Date.now() },
];

// Registry of REAL connected devices via heartbeat
let activePlayersRegistry: Record<string, ActivePlayer> = {};

// Load database if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = { ...db, ...JSON.parse(raw) };
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

// REST Endpoints

// 1. Get profile by Device ID (starts with 0 cytes!)
app.get('/api/profile/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  if (!db.profiles[deviceId]) {
    // New device: strictly starts with 0 cytes as specified by the user!
    db.profiles[deviceId] = {
      deviceId,
      name: `Microbio-${deviceId.slice(-4).toUpperCase()}`,
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
      stats: {
        gamesPlayed: 0,
        highestMass: 18,
        totalKills: 0,
        totalRBCDevoured: 0,
        secretZoneFound: false,
      },
      preferredLanguage: 'es',
      createdAt: new Date().toISOString(),
    };
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

  res.json({ success: true, profile: db.profiles[deviceId] });
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
    stats: {
      gamesPlayed: 0,
      highestMass: 18,
      totalKills: 0,
      totalRBCDevoured: 0,
      secretZoneFound: false,
    },
    preferredLanguage: 'es',
  };

  db.profiles[deviceId] = {
    ...existing,
    ...updates,
    deviceId, // immutable
    updatedAt: new Date().toISOString(),
  };

  if (activePlayersRegistry[deviceId]) {
    activePlayersRegistry[deviceId].name = db.profiles[deviceId].name;
    activePlayersRegistry[deviceId].lastSeen = Date.now();
  }

  persistDb();
  res.json({ success: true, profile: db.profiles[deviceId] });
});

// 3. Heartbeat for active player status
app.post('/api/players/heartbeat', (req, res) => {
  const { deviceId, name, status, currentOrgan, mass, faction } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });

  activePlayersRegistry[deviceId] = {
    deviceId,
    name: name || `Microbio-${deviceId.slice(-4).toUpperCase()}`,
    status: status || 'online',
    currentOrgan: currentOrgan || 'Corazón (Aorta)',
    mass: mass || 18,
    faction: faction || 'immune',
    isRealDevice: true,
    lastSeen: Date.now(),
  };

  res.json({ success: true });
});

// 4. Get active players list (strictly real human players with recent heartbeats)
app.get('/api/players/active', (_req, res) => {
  const now = Date.now();
  // Filter strictly real connected devices seen in the last 25 seconds
  const activeList = Object.values(activePlayersRegistry).filter((p) => {
    return p.isRealDevice && (now - p.lastSeen < 25000);
  });

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
  // Return pending invitations created in the last 60 seconds
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
app.get('/api/rooms', (req, res) => {
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

  // If player profile exists, add to conqueredOrgans
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
app.get('/api/territories', (req, res) => {
  res.json({ success: true, territories: db.territories });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
