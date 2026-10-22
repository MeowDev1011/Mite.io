import { soundEngine } from '../audio/soundEngine';
import { profileStorage, CytesRewardBreakdown } from '../storage/profileStorage';
import { MICROBE_SKINS, SPORE_STYLES } from './skins';
import {
  GameState,
  Organism,
  CellPiece,
  Protein,
  RedBloodCell,
  EjectedSpore,
  AntibodyPatrol,
  BiologicalParticle,
  FloatingText,
  LeaderboardEntry,
  GameStats,
  MutationId,
  GameMode,
  Faction,
  SuperpowerEntity,
  ActiveSuperpower,
  SuperpowerType,
  PlayerUpgrades,
  HostHumanStatus,
} from './types';
import {
  WORLD_RADIUS,
  WORLD_CENTER_X,
  WORLD_CENTER_Y,
  SECRET_ZONE_X,
  SECRET_ZONE_Y,
  SECRET_ZONE_RADIUS,
  ANATOMICAL_ORGANS,
  OrganZone,
  PROTEIN_COUNT,
  RED_BLOOD_CELL_COUNT,
  ANTIBODY_COUNT,
  BOT_COUNT,
  MIN_START_MASS,
  RADIUS_SCALE,
  BASE_SPEED,
  SPEED_MASS_EXPONENT,
  MIN_SPLIT_MASS,
  MAX_CELLS_PER_ORGANISM,
  SPLIT_IMPULSE,
  REMERGE_BASE_TIME,
  EJECT_MASS_COST,
  EJECT_IMPULSE,
  ANTIBODY_DETECTION_MASS,
  ANTIBODY_BASE_SPEED,
  ANTIBODY_HUNT_SPEED,
  ANTIBODY_DAMAGE_RATIO,
  PROTEIN_COLORS,
  SUPERPOWER_DURATION_SEC,
  SUPERPOWER_RESPAWN_SEC,
  SUPERPOWER_DEFS,
} from './constants';
import { BOT_PRESETS, IMMUNE_BOT_PRESETS, PATHOGEN_BOT_PRESETS } from './botNames';
import { BACTERIA_STRAINS } from './bacteria';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Game state
  public state: GameState = 'TITLE_MENU';
  public onStateChange?: (state: GameState) => void;
  public onStatsUpdate?: (stats: GameStats) => void;
  public onLeaderboardUpdate?: (leaderboard: LeaderboardEntry[]) => void;
  public onMutationTrigger?: (milestone: number) => void;
  public onAntibodyAlertChange?: (alert: boolean) => void;
  public onAchievementUnlocked?: (achievementId: string) => void;
  public onSecretZoneEntered?: () => void;
  public onOrganChange?: (organName: string) => void;
  public onGameOverWithReward?: (reward: CytesRewardBreakdown) => void;

  public currentOrgan: string = 'Corazón (Aorta)';
  public sporesFiredCount: number = 0;
  public territoryExplored: Set<string> = new Set();
  public gameMode: GameMode = 'ffa';
  public playerFaction: Faction = 'immune';

  // Entities
  public player: Organism | null = null;
  public bots: Organism[] = [];
  public proteins: Protein[] = [];
  public redBloodCells: RedBloodCell[] = [];
  public spores: EjectedSpore[] = [];
  public antibodies: AntibodyPatrol[] = [];
  public particles: BiologicalParticle[] = [];
  public floatingTexts: FloatingText[] = [];
  public superpowers: SuperpowerEntity[] = [];
  public activeSuperpower: ActiveSuperpower | null = null;
  public playerUpgrades: PlayerUpgrades = { attraction: 0, speed: 0, armor: 0, metabolism: 0, sporesFission: 0 };
  public pusPustules: {
    id: string;
    x: number;
    y: number;
    radius: number;
    mass: number;
    wobble: number;
    wobbleSpeed: number;
    pulseTimer: number;
  }[] = [];
  public hostStatus: HostHumanStatus = {
    health: 100,
    temperature: 37.0,
    hydration: 75,
    energyATP: 95,
    pusLevel: 0,
    activeSymptoms: [],
  };
  private toxicPulseCooldown: number = 0;

  // Camera & Viewport
  public cameraX: number = 0;
  public cameraY: number = 0;
  public cameraZoom: number = 1.0;
  public targetZoom: number = 1.0;
  public screenShake: number = 0;

  // Controls & Input
  public mousePos: { x: number; y: number } = { x: 0, y: 0 };
  public keysHeld: Record<string, boolean> = {};
  public isTouchActive: boolean = false;
  public touchHeading: { x: number; y: number } = { x: 0, y: 0 };
  public joystickHeading: { x: number; y: number } | null = null;
  public humansOnly: boolean = false;

  // Runtime stats
  private startTime: number = 0;
  private peakMass: number = MIN_START_MASS;
  private proteinsEaten: number = 0;
  private redCellsEaten: number = 0;
  private rivalsEaten: number = 0;
  private causeOfDeath: string = '';
  private antibodyAlertActive: boolean = false;
  private nextMilestone: number = 100;
  private unlockedMutations: Set<MutationId> = new Set();
  private splitsCount: number = 0;
  private secretZoneDiscoveredThisGame: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2D context');
    this.ctx = context;

    this.resizeCanvas();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('blur', this.handleBlur);
    this.initWorld();
  }

  private handleResize = () => {
    this.resizeCanvas();
  };

  private handleBlur = () => {
    this.keysHeld = {};
  };

  public resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Calculate radius from mass
  public static massToRadius(mass: number): number {
    return Math.sqrt(Math.max(1, mass)) * RADIUS_SCALE;
  }

  // Calculate speed from mass
  public static massToSpeed(mass: number, speedMultiplier: number = 1.0): number {
    const rawSpeed = BASE_SPEED / Math.pow(Math.max(10, mass), SPEED_MASS_EXPONENT);
    return Math.max(75, rawSpeed * 4.2 * speedMultiplier);
  }

  // Initialize all entities in the bloodstream
  public initWorld() {
    this.proteins = [];
    this.redBloodCells = [];
    this.antibodies = [];
    this.bots = [];
    this.spores = [];
    this.particles = [];
    this.floatingTexts = [];

    // Spawn Proteins
    for (let i = 0; i < PROTEIN_COUNT; i++) {
      this.spawnProtein();
    }

    // Spawn Red Blood Cells
    for (let i = 0; i < RED_BLOOD_CELL_COUNT; i++) {
      this.spawnRedBloodCell();
    }

    // Spawn Patrol Antibodies
    for (let i = 0; i < ANTIBODY_COUNT; i++) {
      this.spawnAntibody(i);
    }

    // Spawn AI Bots
    for (let i = 0; i < BOT_COUNT; i++) {
      this.spawnBot(i);
    }

    // Initialize the 4 Central Map Superpowers
    this.initSuperpowers();
  }

  public initSuperpowers() {
    this.superpowers = [
      // 4 Bloodstream Superpowers (Separated into Upper & Lower corridors so they never collide)
      {
        id: 'super_magnet',
        type: 'magnet_pill',
        x: -360,
        y: -460, // Upper Left
        radius: 34,
        color: SUPERPOWER_DEFS.magnet_pill.color,
        glowColor: SUPERPOWER_DEFS.magnet_pill.glowColor,
        name: SUPERPOWER_DEFS.magnet_pill.name,
        desc: SUPERPOWER_DEFS.magnet_pill.desc,
        rotation: 0,
        respawnTimer: 0,
        isAvailable: true,
      },
      {
        id: 'super_speed',
        type: 'speed_capsule',
        x: 360,
        y: -460, // Upper Right
        radius: 34,
        color: SUPERPOWER_DEFS.speed_capsule.color,
        glowColor: SUPERPOWER_DEFS.speed_capsule.glowColor,
        name: SUPERPOWER_DEFS.speed_capsule.name,
        desc: SUPERPOWER_DEFS.speed_capsule.desc,
        rotation: 0,
        respawnTimer: 0,
        isAvailable: true,
      },
      {
        id: 'super_shield',
        type: 'shield_capsule',
        x: -360,
        y: 460, // Lower Left
        radius: 34,
        color: SUPERPOWER_DEFS.shield_capsule.color,
        glowColor: SUPERPOWER_DEFS.shield_capsule.glowColor,
        name: SUPERPOWER_DEFS.shield_capsule.name,
        desc: SUPERPOWER_DEFS.shield_capsule.desc,
        rotation: 0,
        respawnTimer: 0,
        isAvailable: true,
      },
      {
        id: 'super_toxic',
        type: 'toxic_nanobot',
        x: 360,
        y: 460, // Lower Right
        radius: 34,
        color: SUPERPOWER_DEFS.toxic_nanobot.color,
        glowColor: SUPERPOWER_DEFS.toxic_nanobot.glowColor,
        name: SUPERPOWER_DEFS.toxic_nanobot.name,
        desc: SUPERPOWER_DEFS.toxic_nanobot.desc,
        rotation: 0,
        respawnTimer: 0,
        isAvailable: true,
      },
      // 5 Organ Zone Superpowers Across Anatomy
      {
        id: 'super_mega_shield',
        type: 'mega_shield',
        x: 1450,
        y: 250, // Spleen (Bazo)
        radius: 36,
        color: SUPERPOWER_DEFS.mega_shield.color,
        glowColor: SUPERPOWER_DEFS.mega_shield.glowColor,
        name: SUPERPOWER_DEFS.mega_shield.name,
        desc: SUPERPOWER_DEFS.mega_shield.desc,
        rotation: 0,
        respawnTimer: 0,
        isAvailable: true,
      },
      {
        id: 'super_growth',
        type: 'growth_serum',
        x: -1050,
        y: -400, // Heart (Corazón)
        radius: 36,
        color: SUPERPOWER_DEFS.growth_serum.color,
        glowColor: SUPERPOWER_DEFS.growth_serum.glowColor,
        name: SUPERPOWER_DEFS.growth_serum.name,
        desc: SUPERPOWER_DEFS.growth_serum.desc,
        rotation: 0,
        respawnTimer: 0,
        isAvailable: true,
      },
      {
        id: 'super_frost',
        type: 'frost_blast',
        x: -1050,
        y: -1900, // Brain (Cerebro)
        radius: 36,
        color: SUPERPOWER_DEFS.frost_blast.color,
        glowColor: SUPERPOWER_DEFS.frost_blast.glowColor,
        name: SUPERPOWER_DEFS.frost_blast.name,
        desc: SUPERPOWER_DEFS.frost_blast.desc,
        rotation: 0,
        respawnTimer: 0,
        isAvailable: true,
      },
      {
        id: 'super_cloaking',
        type: 'cloaking_ghost',
        x: -800,
        y: -900, // Lungs (Pulmones)
        radius: 36,
        color: SUPERPOWER_DEFS.cloaking_ghost.color,
        glowColor: SUPERPOWER_DEFS.cloaking_ghost.glowColor,
        name: SUPERPOWER_DEFS.cloaking_ghost.name,
        desc: SUPERPOWER_DEFS.cloaking_ghost.desc,
        rotation: 0,
        respawnTimer: 0,
        isAvailable: true,
      },
      {
        id: 'super_quantum',
        type: 'quantum_fission',
        x: -850,
        y: 0, // Liver (Hígado)
        radius: 36,
        color: SUPERPOWER_DEFS.quantum_fission.color,
        glowColor: SUPERPOWER_DEFS.quantum_fission.glowColor,
        name: SUPERPOWER_DEFS.quantum_fission.name,
        desc: SUPERPOWER_DEFS.quantum_fission.desc,
        rotation: 0,
        respawnTimer: 0,
        isAvailable: true,
      },
    ];
  }

  public spawnProtein(): Protein {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (WORLD_RADIUS - 120);
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    const color = PROTEIN_COLORS[Math.floor(Math.random() * PROTEIN_COLORS.length)];

    const protein: Protein = {
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      x,
      y,
      radius: 4.5 + Math.random() * 3,
      color,
      mass: 1.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
    };
    this.proteins.push(protein);
    return protein;
  }

  public spawnRedBloodCell(): RedBloodCell {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (WORLD_RADIUS - 180);
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    const rbc: RedBloodCell = {
      id: 'rbc_' + Math.random().toString(36).substring(2, 9),
      x,
      y,
      radius: 20 + Math.random() * 12,
      mass: 14 + Math.random() * 18,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16,
      biconcaveScale: 0.65 + Math.random() * 0.15,
    };
    this.redBloodCells.push(rbc);
    return rbc;
  }

  public spawnAntibody(index: number) {
    const baseAngle = (index / ANTIBODY_COUNT) * Math.PI * 2;
    const patrolRadius = 400 + (index % 4) * 450;
    const centerX = Math.cos(baseAngle) * patrolRadius * 0.6;
    const centerY = Math.sin(baseAngle) * patrolRadius * 0.6;

    const antibody: AntibodyPatrol = {
      id: 'ab_' + index,
      x: centerX + Math.cos(baseAngle) * 300,
      y: centerY + Math.sin(baseAngle) * 300,
      vx: 0,
      vy: 0,
      targetX: centerX,
      targetY: centerY,
      radius: 48,
      spikeCount: 12,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: 0.8 + Math.random() * 0.4,
      patrolAngle: baseAngle,
      patrolCenter: { x: centerX, y: centerY },
      targetOrganismId: null,
      alertLevel: 0,
      laserCooldown: 0,
    };
    this.antibodies.push(antibody);
  }

  public spawnBot(index: number): Organism {
    if (this.humansOnly) {
      return null as any;
    }
    const preset = BOT_PRESETS[index % BOT_PRESETS.length];
    const angle = Math.random() * Math.PI * 2;
    const dist = 300 + Math.random() * (WORLD_RADIUS - 600);
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;

    const startMass = 16 + Math.random() * 45;
    const r = GameEngine.massToRadius(startMass);

    const bot: Organism = {
      id: 'bot_' + Math.random().toString(36).substring(2, 9),
      name: preset.name,
      isPlayer: false,
      color: preset.color,
      secondaryColor: preset.secondaryColor,
      ciliaColor: preset.ciliaColor,
      aiPersonality: preset.personality,
      aiDecisionTimer: Math.random() * 2,
      targetHeading: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
      speedMultiplier: 1.0,
      mutations: new Set(),
      isAlive: true,
      score: Math.floor(startMass),
      kills: 0,
      pieces: [
        {
          id: 'bp_0',
          x,
          y,
          vx: 0,
          vy: 0,
          mass: startMass,
          targetRadius: r,
          radius: r,
          remergeTimer: 0,
          totalRemergeTime: 1,
          wobbleOffsets: Array.from({ length: 16 }, () => 0),
          wobbleSpeed: 2 + Math.random() * 2,
          impulseX: 0,
          impulseY: 0,
        },
      ],
    };
    this.bots.push(bot);
    return bot;
  }

  // Start the actual player match
  public startGame(
    playerName: string = 'Mite-Alfa',
    mode: GameMode = 'ffa',
    faction: Faction = 'immune',
    humansOnly: boolean = false
  ) {
    this.state = 'PLAYING';
    this.gameMode = mode;
    this.playerFaction = faction;
    this.humansOnly = humansOnly;
    this.startTime = Date.now();
    this.peakMass = MIN_START_MASS;
    this.proteinsEaten = 0;
    this.redCellsEaten = 0;
    this.rivalsEaten = 0;
    this.causeOfDeath = '';
    this.nextMilestone = 100;
    this.unlockedMutations = new Set();
    this.splitsCount = 0;
    this.secretZoneDiscoveredThisGame = false;
    this.sporesFiredCount = 0;
    this.territoryExplored.clear();
    this.playerUpgrades = profileStorage.getUpgrades();
    this.activeSuperpower = null;
    this.initSuperpowers();

    // Re-initialize bots according to mode and player preferences
    this.initBotsForMode(mode, faction, humansOnly);

    // Get equipped skin and bacteria strain
    const profile = profileStorage.getProfile();
    const equippedSkin = MICROBE_SKINS.find((s) => s.id === profile.selectedSkinId) || MICROBE_SKINS[0];
    const bacteria = BACTERIA_STRAINS.find((b) => b.id === profile.selectedBacteriaId) || BACTERIA_STRAINS[0];
    const bacteriaSpeed = bacteria.speedBonus || 1.0;
    const upgradeSpeedBonus = 1.0 + (this.playerUpgrades?.speed || 0) * 0.06;

    let playerColor = equippedSkin.color;
    let playerSecondary = equippedSkin.secondaryColor;
    let playerCilia = equippedSkin.ciliaColor;

    if (mode === 'team') {
      if (faction === 'immune') {
        playerColor = '#06b6d4';
        playerSecondary = '#0284c7';
        playerCilia = '#7dd3fc';
      } else {
        playerColor = '#f43f5e';
        playerSecondary = '#be123c';
        playerCilia = '#fda4af';
      }

      this.hostStatus = {
        health: 80,
        temperature: 37.6,
        hydration: 72,
        energyATP: 88,
        pusLevel: 20,
        activeSymptoms: ['symptomInflammation', 'symptomPurulentExudate'],
      };
      this.pusPustules = [];
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 350 + Math.random() * 2100;
        this.pusPustules.push({
          id: `pus-start-${i}`,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          radius: 12 + Math.random() * 8,
          mass: 30,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 2 + Math.random() * 3,
          pulseTimer: 0,
        });
      }
    } else {
      this.pusPustules = [];
      this.hostStatus = {
        health: 100,
        temperature: 37.0,
        hydration: 75,
        energyATP: 95,
        pusLevel: 0,
        activeSymptoms: [],
      };
    }

    // Spawn player in corresponding anatomical body:
    // Immune starts in Body 1 (Anterior / Heart), Pathogen starts in Body 2 (Posterior / Spleen)
    let px = (Math.random() - 0.5) * 350;
    let py = -400 + (Math.random() - 0.5) * 350;
    if (mode === 'team') {
      if (faction === 'immune') {
        px = -1050 + (Math.random() - 0.5) * 300;
        py = -400 + (Math.random() - 0.5) * 300;
      } else {
        px = 1050 + (Math.random() - 0.5) * 300;
        py = 250 + (Math.random() - 0.5) * 300;
      }
    }

    const r = GameEngine.massToRadius(MIN_START_MASS);

    this.player = {
      id: 'player',
      name: playerName.trim() || profile.name || 'Mite-Alfa',
      isPlayer: true,
      mode,
      faction,
      color: playerColor,
      secondaryColor: playerSecondary,
      ciliaColor: playerCilia,
      targetHeading: { x: 0, y: 0 },
      speedMultiplier: bacteriaSpeed * upgradeSpeedBonus,
      mutations: this.unlockedMutations,
      isAlive: true,
      score: MIN_START_MASS,
      kills: 0,
      pieces: [
        {
          id: 'pp_0',
          x: px,
          y: py,
          vx: 0,
          vy: 0,
          mass: MIN_START_MASS,
          targetRadius: r,
          radius: r,
          remergeTimer: 0,
          totalRemergeTime: 1,
          wobbleOffsets: Array.from({ length: 16 }, () => 0),
          wobbleSpeed: 3.2,
          impulseX: 0,
          impulseY: 0,
        },
      ],
    };

    this.cameraX = px;
    this.cameraY = py;

    soundEngine.startHeartbeat();
    soundEngine.startBGM();
    if (this.onStateChange) this.onStateChange('PLAYING');
  }

  // Populate room with up to 50 players (Bots or Human Matchmaking)
  public initBotsForMode(mode: GameMode, playerFaction: Faction, humansOnly: boolean = false) {
    this.bots = [];
    if (humansOnly) {
      // In humans-only mode, room only contains real connected humans
      return;
    }

    const botTotal = BOT_COUNT; // 49 bots + 1 player = 50 in room!

    if (mode === 'ffa') {
      for (let i = 0; i < botTotal; i++) {
        const preset = BOT_PRESETS[i % BOT_PRESETS.length];
        const angle = Math.random() * Math.PI * 2;
        const dist = 300 + Math.random() * (WORLD_RADIUS - 600);
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        const startMass = 16 + Math.random() * 55;
        const r = GameEngine.massToRadius(startMass);

        this.bots.push({
          id: 'bot_' + i + '_' + Math.random().toString(36).substring(2, 6),
          name: `${preset.name}-${i + 1}`,
          isPlayer: false,
          mode: 'ffa',
          color: preset.color,
          secondaryColor: preset.secondaryColor,
          ciliaColor: preset.ciliaColor,
          aiPersonality: preset.personality,
          aiDecisionTimer: Math.random() * 2,
          targetHeading: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
          speedMultiplier: 1.0,
          mutations: new Set(),
          isAlive: true,
          score: Math.floor(startMass),
          kills: 0,
          pieces: [
            {
              id: `bp_${i}_0`,
              x,
              y,
              vx: 0,
              vy: 0,
              mass: startMass,
              targetRadius: r,
              radius: r,
              remergeTimer: 0,
              totalRemergeTime: 1,
              wobbleOffsets: Array.from({ length: 16 }, () => 0),
              wobbleSpeed: 2 + Math.random() * 2,
              impulseX: 0,
              impulseY: 0,
            },
          ],
        });
      }
    } else {
      // Team Battle: 24 teammates + 25 rivals = 50 players in room
      const sameTeamCount = 24;
      const rivalTeamCount = 25;
      const samePresets = playerFaction === 'immune' ? IMMUNE_BOT_PRESETS : PATHOGEN_BOT_PRESETS;
      const rivalPresets = playerFaction === 'immune' ? PATHOGEN_BOT_PRESETS : IMMUNE_BOT_PRESETS;
      const rivalFaction: Faction = playerFaction === 'immune' ? 'pathogen' : 'immune';

      // Spawn teammates
      for (let i = 0; i < sameTeamCount; i++) {
        const preset = samePresets[i % samePresets.length];
        const baseX = playerFaction === 'immune' ? -1050 : 1050;
        const x = baseX + (Math.random() - 0.5) * 1100;
        const y = (Math.random() - 0.5) * 3200;
        const startMass = 18 + Math.random() * 60;
        const r = GameEngine.massToRadius(startMass);

        this.bots.push({
          id: `bot_team_${i}`,
          name: preset.name,
          isPlayer: false,
          mode: 'team',
          faction: playerFaction,
          color: preset.color,
          secondaryColor: preset.secondaryColor,
          ciliaColor: preset.ciliaColor,
          aiPersonality: preset.personality,
          aiDecisionTimer: Math.random() * 2,
          targetHeading: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
          speedMultiplier: 1.0,
          mutations: new Set(),
          isAlive: true,
          score: Math.floor(startMass),
          kills: 0,
          pieces: [
            {
              id: `bp_t_${i}_0`,
              x,
              y,
              vx: 0,
              vy: 0,
              mass: startMass,
              targetRadius: r,
              radius: r,
              remergeTimer: 0,
              totalRemergeTime: 1,
              wobbleOffsets: Array.from({ length: 16 }, () => 0),
              wobbleSpeed: 2 + Math.random() * 2,
              impulseX: 0,
              impulseY: 0,
            },
          ],
        });
      }

      // Spawn rivals
      for (let i = 0; i < rivalTeamCount; i++) {
        const preset = rivalPresets[i % rivalPresets.length];
        const baseX = rivalFaction === 'immune' ? -1050 : 1050;
        const x = baseX + (Math.random() - 0.5) * 1100;
        const y = (Math.random() - 0.5) * 3200;
        const startMass = 18 + Math.random() * 60;
        const r = GameEngine.massToRadius(startMass);

        this.bots.push({
          id: `bot_rival_${i}`,
          name: preset.name,
          isPlayer: false,
          mode: 'team',
          faction: rivalFaction,
          color: preset.color,
          secondaryColor: preset.secondaryColor,
          ciliaColor: preset.ciliaColor,
          aiPersonality: preset.personality,
          aiDecisionTimer: Math.random() * 2,
          targetHeading: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
          speedMultiplier: 1.0,
          mutations: new Set(),
          isAlive: true,
          score: Math.floor(startMass),
          kills: 0,
          pieces: [
            {
              id: `bp_r_${i}_0`,
              x,
              y,
              vx: 0,
              vy: 0,
              mass: startMass,
              targetRadius: r,
              radius: r,
              remergeTimer: 0,
              totalRemergeTime: 1,
              wobbleOffsets: Array.from({ length: 16 }, () => 0),
              wobbleSpeed: 2 + Math.random() * 2,
              impulseX: 0,
              impulseY: 0,
            },
          ],
        });
      }
    }
  }

  public canConquerTerritory(): boolean {
    if (!this.player || !this.player.isAlive) return false;
    return this.calculateTotalMass(this.player) >= 100;
  }

  // Conquer Organ Territory: Player sacrifices mass ("te haces chiquito"), gains +80 Cytes and speed boost!
  public conquerTerritory(): { success: boolean; organName: string; cytesEarned: number } | null {
    if (!this.canConquerTerritory() || !this.player) return null;

    const centroid = this.calculateCentroid(this.player);
    let closestOrgan = ANATOMICAL_ORGANS[0];
    let minDist = Infinity;
    for (const organ of ANATOMICAL_ORGANS) {
      const d = Math.hypot(centroid.x - organ.x, centroid.y - organ.y);
      if (d < minDist) {
        minDist = d;
        closestOrgan = organ;
      }
    }

    const profile = profileStorage.getProfile();
    const strain = BACTERIA_STRAINS.find((b) => b.id === profile.selectedBacteriaId);
    const multiplier = strain?.conquestCytesMultiplier || 1.0;
    const cytesEarned = Math.round(80 * multiplier);

    // "Te haces chiquito": shrink player down to base mass 20
    const mainPiece = this.player.pieces[0];
    mainPiece.mass = 20;
    mainPiece.radius = GameEngine.massToRadius(20);
    mainPiece.targetRadius = mainPiece.radius;
    mainPiece.vx = 0;
    mainPiece.vy = 0;
    this.player.pieces = [mainPiece];

    // Grant temporary Agility Boost (2.2x speed for 8s)
    this.player.speedMultiplier = 2.2;
    setTimeout(() => {
      if (this.player) this.player.speedMultiplier = strain?.speedBonus || 1.0;
    }, 8000);

    // Play triumphant conquest fanfare
    soundEngine.playConquestFanfare();
    this.screenShake = 18;

    // Burst of 70 bioluminescent conquest particles
    for (let i = 0; i < 70; i++) {
      const angle = (i / 70) * Math.PI * 2;
      const speed = 140 + Math.random() * 240;
      this.particles.push({
        x: centroid.x,
        y: centroid.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 4 + Math.random() * 4,
        color: this.player.color,
        alpha: 1.0,
        life: 0,
        maxLife: 2.0 + Math.random() * 0.8,
      });
    }

    // Floating text alert
    this.addFloatingText(centroid.x, centroid.y - 45, `¡${closestOrgan.name.toUpperCase()} COLONIZADO! +${cytesEarned} CYTES`, '#34d399');

    // Update profile and DB
    profileStorage.addCytes(cytesEarned);
    profileStorage.conquerOrgan(closestOrgan.id, this.playerFaction);
    this.checkAchievement('territory_conqueror');

    return { success: true, organName: closestOrgan.name, cytesEarned };
  }

  public calculateTeamPercentage(targetFaction: Faction): number {
    let immuneMass = 0;
    let pathogenMass = 0;

    if (this.player && this.player.isAlive) {
      const m = this.calculateTotalMass(this.player);
      if (this.playerFaction === 'immune') immuneMass += m;
      else pathogenMass += m;
    }

    for (const bot of this.bots) {
      if (bot.isAlive) {
        const m = this.calculateTotalMass(bot);
        if (bot.faction === 'immune') immuneMass += m;
        else pathogenMass += m;
      }
    }

    const total = immuneMass + pathogenMass;
    if (total === 0) return 50;

    if (targetFaction === 'immune') {
      return Math.round((immuneMass / total) * 100);
    } else {
      return Math.round((pathogenMass / total) * 100);
    }
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      if (this.onStateChange) this.onStateChange('PAUSED');
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      if (this.onStateChange) this.onStateChange('PLAYING');
    }
  }

  public restartGame() {
    this.initWorld();
    const name = this.player ? this.player.name : 'Mite-Alfa';
    this.startGame(name);
  }

  public returnToMenu() {
    this.state = 'TITLE_MENU';
    this.initWorld();
    if (this.onStateChange) this.onStateChange('TITLE_MENU');
  }

  // Joystick steering input from on-screen virtual joystick
  public setJoystickHeading(x: number, y: number) {
    this.joystickHeading = { x, y };
  }

  public clearJoystickHeading() {
    this.joystickHeading = null;
  }

  // Player split mechanic (Spacebar / Split button)
  public splitPlayer() {
    if (!this.player || !this.player.isAlive || this.state !== 'PLAYING') return;
    this.splitOrganism(this.player);
  }

  // Player eject mass mechanic (W / Eject button)
  public ejectPlayerSpore() {
    if (!this.player || !this.player.isAlive || this.state !== 'PLAYING') return;
    this.ejectSpore(this.player);
  }

  public splitOrganism(organism: Organism) {
    if (organism.pieces.length >= MAX_CELLS_PER_ORGANISM) return;

    let splitHappened = false;
    const newPieces: CellPiece[] = [];

    // Cooldown duration modified by mutations
    const hasRapidFission = organism.mutations.has('rapid_fission');
    const baseCooldown = hasRapidFission ? REMERGE_BASE_TIME * 0.6 : REMERGE_BASE_TIME;

    // Split each piece with sufficient mass
    for (const piece of organism.pieces) {
      if (piece.mass >= MIN_SPLIT_MASS && organism.pieces.length + newPieces.length < MAX_CELLS_PER_ORGANISM) {
        splitHappened = true;
        const halfMass = piece.mass * 0.5;
        const cooldown = baseCooldown + halfMass * 0.04;
        piece.mass = halfMass;
        piece.targetRadius = GameEngine.massToRadius(halfMass);
        piece.remergeTimer = cooldown;
        piece.totalRemergeTime = cooldown;

        // Direction of split: towards organism's heading
        let dirX = organism.targetHeading.x;
        let dirY = organism.targetHeading.y;
        const len = Math.hypot(dirX, dirY);
        if (len < 0.1) {
          dirX = 1;
          dirY = 0;
        } else {
          dirX /= len;
          dirY /= len;
        }

        const newRadius = GameEngine.massToRadius(halfMass);
        const impulse = SPLIT_IMPULSE;

        const splitImpulseBonus = organism.isPlayer
          ? 1.0 + Math.min(2.0, Math.log10(1 + (this.playerUpgrades?.sporesFission || 0)) * 0.6)
          : 1.0;

        const newPiece: CellPiece = {
          id: 'piece_' + Math.random().toString(36).substring(2, 9),
          x: piece.x + dirX * (piece.targetRadius + newRadius * 0.6),
          y: piece.y + dirY * (piece.targetRadius + newRadius * 0.6),
          vx: piece.vx,
          vy: piece.vy,
          mass: halfMass,
          targetRadius: newRadius,
          radius: newRadius,
          remergeTimer: cooldown,
          totalRemergeTime: cooldown,
          wobbleOffsets: Array.from({ length: 16 }, () => 0),
          wobbleSpeed: 3.5,
          impulseX: dirX * (impulse * splitImpulseBonus),
          impulseY: dirY * (impulse * splitImpulseBonus),
        };

        // Recoil on original piece
        piece.impulseX = -dirX * (impulse * 0.25);
        piece.impulseY = -dirY * (impulse * 0.25);

        newPieces.push(newPiece);

        // Spawn rich organic split burst particles
        for (let p = 0; p < 14; p++) {
          this.particles.push({
            x: piece.x + (Math.random() - 0.5) * piece.radius,
            y: piece.y + (Math.random() - 0.5) * piece.radius,
            vx: dirX * 220 + (Math.random() - 0.5) * 160,
            vy: dirY * 220 + (Math.random() - 0.5) * 160,
            radius: 3 + Math.random() * 4,
            color: organism.ciliaColor,
            alpha: 0.95,
            life: 0.45,
            maxLife: 0.45,
          });
        }
      }
    }

    if (splitHappened) {
      organism.pieces.push(...newPieces);
      if (organism.isPlayer) {
        soundEngine.playMitosisSquish();
        this.splitsCount++;
        if (this.splitsCount >= 5) {
          this.checkAchievement('mitosis_master');
        }
        this.addFloatingText(organism.pieces[0].x, organism.pieces[0].y - 30, '¡FISIÓN CELULAR! [Espacio]', '#34d399');
      }
    }
  }

  public ejectSpore(organism: Organism) {
    const isToxic = organism.mutations.has('toxic_spores');
    let ejected = false;

    // Get equipped spore style for player
    let sporeColor = organism.ciliaColor;
    if (organism.isPlayer) {
      const profile = profileStorage.getProfile();
      const style = SPORE_STYLES.find((s) => s.id === profile.selectedSporeId) || SPORE_STYLES[0];
      sporeColor = isToxic ? '#a3e635' : style.color;
    }

    for (const piece of organism.pieces) {
      if (piece.mass > EJECT_MASS_COST + 15) {
        piece.mass -= EJECT_MASS_COST;
        piece.targetRadius = GameEngine.massToRadius(piece.mass);

        let dirX = organism.targetHeading.x;
        let dirY = organism.targetHeading.y;
        const len = Math.hypot(dirX, dirY);
        if (len < 0.1) {
          dirX = 1;
          dirY = 0;
        } else {
          dirX /= len;
          dirY /= len;
        }

        const sporeRadius = 7;
        const sporeImpulseBonus = organism.isPlayer
          ? 1.0 + Math.min(2.5, Math.log10(1 + (this.playerUpgrades?.sporesFission || 0)) * 0.75)
          : 1.0;
        const spore: EjectedSpore = {
          id: 'spore_' + Math.random().toString(36).substring(2, 9),
          ownerId: organism.id,
          x: piece.x + dirX * (piece.radius + sporeRadius + 4),
          y: piece.y + dirY * (piece.radius + sporeRadius + 4),
          vx: dirX * (EJECT_IMPULSE * sporeImpulseBonus) + piece.vx * 0.4,
          vy: dirY * (EJECT_IMPULSE * sporeImpulseBonus) + piece.vy * 0.4,
          mass: EJECT_MASS_COST,
          radius: sporeRadius,
          color: isToxic ? '#a855f7' : sporeColor,
          isToxic,
          lifespan: 25,
        };

        this.spores.push(spore);
        ejected = true;
      }
    }

    if (ejected && organism.isPlayer) {
      soundEngine.playEjectSpore();
      this.sporesFiredCount++;
      if (isToxic) {
        this.checkAchievement('toxic_bomber');
      }
    }
  }

  public applyMutation(mutationId: MutationId) {
    this.unlockedMutations.add(mutationId);
    if (this.player) {
      this.player.mutations.add(mutationId);
      if (mutationId === 'flagella_boost') {
        this.player.speedMultiplier = 1.18;
      }
    }
    soundEngine.playLevelUp();
    if (this.player && this.player.pieces.length > 0) {
      this.addFloatingText(this.player.pieces[0].x, this.player.pieces[0].y - 45, '¡MUTACIÓN ADQUIRIDA!', '#f59e0b');
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      life: 1.2,
    });
  }

  public checkAchievement(id: string) {
    const isNew = profileStorage.unlockAchievement(id);
    if (isNew) {
      soundEngine.playAchievement();
      if (this.onAchievementUnlocked) {
        this.onAchievementUnlocked(id);
      }
      if (this.player && this.player.pieces.length > 0) {
        const p = this.player.pieces[0];
        this.addFloatingText(p.x, p.y - 50, '¡LOGRO DESBLOQUEADO!', '#fbbf24');
      }
    }
  }

  // Main start loop
  public start() {
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      const rawDt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05); // Clamp frame delta time for stable simulation

      if (this.state === 'PLAYING') {
        this.update(dt);
      } else if (this.state === 'TITLE_MENU') {
        this.updateTitleWorld(dt);
      }

      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('blur', this.handleBlur);
    soundEngine.stopHeartbeat();
  }

  // Update world simulation when in title screen (live atmospheric drift)
  private updateTitleWorld(dt: number) {
    this.cameraX = Math.cos(performance.now() * 0.0003) * 600;
    this.cameraY = Math.sin(performance.now() * 0.0003) * 600;
    this.cameraZoom = 0.85;

    // Gentle bot movement
    for (const bot of this.bots) {
      this.updateOrganismPhysics(bot, dt);
    }
    // Update RBCs
    for (const rbc of this.redBloodCells) {
      rbc.x += rbc.vx * dt;
      rbc.y += rbc.vy * dt;
      rbc.rotation += rbc.rotationSpeed * dt;
    }
  }

  // Core Simulation Step
  public update(dt: number) {
    if (!this.player || !this.player.isAlive) return;

    // 1. Process Player Input & Heading
    this.updatePlayerHeading();

    // 2. Update Organism Physics (Player & Bots)
    this.updateOrganismPhysics(this.player, dt);
    for (const bot of this.bots) {
      this.updateBotAI(bot, dt);
      this.updateOrganismPhysics(bot, dt);
    }

    // 3. Update Ejected Spores
    for (let i = this.spores.length - 1; i >= 0; i--) {
      const spore = this.spores[i];
      spore.x += spore.vx * dt;
      spore.y += spore.vy * dt;
      spore.vx *= Math.pow(0.88, dt * 60);
      spore.vy *= Math.pow(0.88, dt * 60);
      spore.lifespan -= dt;

      // Keep inside bounds
      const dist = Math.hypot(spore.x, spore.y);
      if (dist > WORLD_RADIUS - spore.radius) {
        const angle = Math.atan2(spore.y, spore.x);
        spore.x = Math.cos(angle) * (WORLD_RADIUS - spore.radius);
        spore.y = Math.sin(angle) * (WORLD_RADIUS - spore.radius);
      }

      if (spore.lifespan <= 0) {
        this.spores.splice(i, 1);
      }
    }

    // 4. Update Red Blood Cells drift
    for (const rbc of this.redBloodCells) {
      rbc.x += rbc.vx * dt;
      rbc.y += rbc.vy * dt;
      rbc.rotation += rbc.rotationSpeed * dt;
      // Bounce against vascular walls
      const dist = Math.hypot(rbc.x, rbc.y);
      if (dist > WORLD_RADIUS - rbc.radius) {
        const nx = rbc.x / dist;
        const ny = rbc.y / dist;
        rbc.vx = -nx * Math.abs(rbc.vx) * 0.8;
        rbc.vy = -ny * Math.abs(rbc.vy) * 0.8;
      }
    }

    // 5. Update Patrol Antibodies
    this.updateAntibodies(dt);

    // 6. Collision & Consumption checks
    this.checkConsumptions();

    // 7. Check Player Re-merges & Mass bounds
    this.handleCellRemerge(this.player, dt);
    for (const bot of this.bots) {
      this.handleCellRemerge(bot, dt);
    }

    // 7b. Secret Zone Check (Lymphatic Crypt)
    if (this.player && this.player.isAlive && this.player.pieces.length > 0) {
      const p = this.player.pieces[0];
      const distToSecret = Math.hypot(p.x - SECRET_ZONE_X, p.y - SECRET_ZONE_Y);
      if (distToSecret < SECRET_ZONE_RADIUS) {
        // Continuous healing / nutrient burst in secret zone
        if (Math.random() < 0.15) {
          p.mass += 0.4;
          this.particles.push({
            x: SECRET_ZONE_X + (Math.random() - 0.5) * SECRET_ZONE_RADIUS * 1.2,
            y: SECRET_ZONE_Y + (Math.random() - 0.5) * SECRET_ZONE_RADIUS * 1.2,
            vx: (Math.random() - 0.5) * 40,
            vy: (Math.random() - 0.5) * 40,
            radius: 3 + Math.random() * 3,
            color: '#38bdf8',
            alpha: 0.9,
            life: 0.8,
            maxLife: 0.8,
          });
        }
        if (!this.secretZoneDiscoveredThisGame) {
          this.secretZoneDiscoveredThisGame = true;
          soundEngine.playSecretDiscovery();
          this.checkAchievement('secret_lymph_node');
          this.addFloatingText(p.x, p.y - 45, '¡ZONA SECRETA: NÓDULO LINFÁTICO!', '#06b6d4');
          if (this.onSecretZoneEntered) {
            this.onSecretZoneEntered();
          }
        }
      }

      // Track territory invaded
      const tileKey = `${Math.floor(p.x / 250)}_${Math.floor(p.y / 250)}`;
      this.territoryExplored.add(tileKey);

      // Detect current anatomical organ
      let closestOrgan = 'Vasos Sanguíneos';
      let minOrganDist = 999999;
      for (const organ of ANATOMICAL_ORGANS) {
        const dist = Math.hypot(p.x - organ.x, p.y - organ.y);
        if (dist < organ.radius * 1.15 && dist < minOrganDist) {
          minOrganDist = dist;
          closestOrgan = organ.name;
        }
      }
      if (closestOrgan !== this.currentOrgan) {
        this.currentOrgan = closestOrgan;
        if (this.onOrganChange) {
          this.onOrganChange(closestOrgan);
        }
      }
    }

    // 7c. Update 4 Central Superpowers (Respawn, Collisions & 15s Active Effects)
    this.updateSuperpowers(dt);

    // 7d. Update Pus Pustules and Host Human Status (Battle Mode)
    this.updatePusAndHostStatus(dt);

    // 8. Respawn missing food & bots
    while (this.proteins.length < PROTEIN_COUNT) {
      this.spawnProtein();
    }
    while (this.redBloodCells.length < RED_BLOOD_CELL_COUNT) {
      this.spawnRedBloodCell();
    }
    if (!this.humansOnly) {
      while (this.bots.length < BOT_COUNT) {
        this.spawnBot(this.bots.length);
      }
    }

    // 9. Update Particles & Floating Text
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y -= 30 * dt;
      t.life -= dt;
      t.alpha = Math.max(0, t.life / 1.2);
      if (t.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // 10. Update Camera to Follow Player Centroid
    this.updateCamera(dt);

    // 11. Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // 12. Dispatch Stats and Leaderboard
    this.dispatchStats();
  }

  private updatePlayerHeading() {
    if (!this.player || this.player.pieces.length === 0) return;

    // 1. Virtual Joystick on-screen panel has top priority
    if (this.joystickHeading !== null) {
      this.player.targetHeading = { ...this.joystickHeading };
      return;
    }

    // Check keyboard continuous directional input
    let kx = 0;
    let ky = 0;
    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) ky -= 1;
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) ky += 1;
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) kx -= 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) kx += 1;

    if (kx !== 0 || ky !== 0) {
      const len = Math.hypot(kx, ky);
      this.player.targetHeading = { x: kx / len, y: ky / len };
      return;
    }

    // Touch joystick support
    if (this.isTouchActive) {
      this.player.targetHeading = { ...this.touchHeading };
      return;
    }

    // Mouse heading relative to player centroid on screen
    const centroid = this.calculateCentroid(this.player);
    const screenX = (centroid.x - this.cameraX) * this.cameraZoom + this.canvas.width / 2;
    const screenY = (centroid.y - this.cameraY) * this.cameraZoom + this.canvas.height / 2;

    const dx = this.mousePos.x - screenX;
    const dy = this.mousePos.y - screenY;
    const dist = Math.hypot(dx, dy);

    if (dist > 15) {
      this.player.targetHeading = { x: dx / dist, y: dy / dist };
    }
  }

  private updateOrganismPhysics(organism: Organism, dt: number) {
    const hasFlagella = organism.mutations.has('flagella_boost');
    const isPlayerSpeedBoost = organism.isPlayer && this.activeSuperpower?.type === 'speed_capsule';
    const speedMult = organism.speedMultiplier * (hasFlagella ? 1.18 : 1.0) * (isPlayerSpeedBoost ? 1.85 : 1.0);

    for (const piece of organism.pieces) {
      // Smoothly interpolate radius to target radius based on mass
      piece.targetRadius = GameEngine.massToRadius(piece.mass);
      piece.radius += (piece.targetRadius - piece.radius) * Math.min(1, dt * 8);

      // Speed inversely proportional to mass
      const speed = GameEngine.massToSpeed(piece.mass, speedMult);

      // Desired velocity from organism heading
      const targetVx = organism.targetHeading.x * speed;
      const targetVy = organism.targetHeading.y * speed;

      // Smooth acceleration
      piece.vx += (targetVx - piece.vx) * Math.min(1, dt * 5);
      piece.vy += (targetVy - piece.vy) * Math.min(1, dt * 5);

      // Apply impulse decay (from splitting or ejection)
      piece.x += (piece.vx + piece.impulseX) * dt;
      piece.y += (piece.vy + piece.impulseY) * dt;

      piece.impulseX *= Math.pow(0.85, dt * 60);
      piece.impulseY *= Math.pow(0.85, dt * 60);

      // Keep within vascular lumen boundary
      const distFromCenter = Math.hypot(piece.x, piece.y);
      if (distFromCenter > WORLD_RADIUS - piece.radius) {
        const angle = Math.atan2(piece.y, piece.x);
        piece.x = Math.cos(angle) * (WORLD_RADIUS - piece.radius);
        piece.y = Math.sin(angle) * (WORLD_RADIUS - piece.radius);
        piece.vx *= 0.5;
        piece.vy *= 0.5;
      }

      // Decrement remerge timer (accelerated by speed superpower and metabolism upgrade)
      if (piece.remergeTimer > 0) {
        const remergeSpeed = (isPlayerSpeedBoost ? 2.5 : 1.0) * (1 + (organism.isPlayer ? (this.playerUpgrades?.metabolism || 0) * 0.1 : 0));
        piece.remergeTimer = Math.max(0, piece.remergeTimer - dt * remergeSpeed);
      }

      // Wobble animation on membrane
      for (let i = 0; i < piece.wobbleOffsets.length; i++) {
        const timeOffset = performance.now() * 0.003 * piece.wobbleSpeed + i;
        piece.wobbleOffsets[i] = Math.sin(timeOffset) * (piece.radius * 0.065);
      }
    }

    // Repulsion between pieces of same organism while remergeTimer is active
    if (organism.pieces.length > 1) {
      for (let i = 0; i < organism.pieces.length; i++) {
        for (let j = i + 1; j < organism.pieces.length; j++) {
          const p1 = organism.pieces[i];
          const p2 = organism.pieces[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = p1.radius + p2.radius;

          if (dist < minDist && (p1.remergeTimer > 0 || p2.remergeTimer > 0)) {
            const overlap = (minDist - dist) * 0.5;
            const nx = (dx / (dist || 1));
            const ny = (dy / (dist || 1));
            p1.x -= nx * overlap;
            p1.y -= ny * overlap;
            p2.x += nx * overlap;
            p2.y += ny * overlap;
          }
        }
      }
    }
  }

  // Handle re-merging split pieces after timer expires
  private handleCellRemerge(organism: Organism, _dt: number) {
    if (organism.pieces.length <= 1) return;

    for (let i = 0; i < organism.pieces.length; i++) {
      for (let j = i + 1; j < organism.pieces.length; j++) {
        const p1 = organism.pieces[i];
        const p2 = organism.pieces[j];

        // Can only remerge if both timers expired
        if (p1.remergeTimer <= 0 && p2.remergeTimer <= 0) {
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          // When they touch or overlap substantially
          if (dist < Math.max(p1.radius, p2.radius) * 1.1) {
            p1.mass += p2.mass;
            p1.targetRadius = GameEngine.massToRadius(p1.mass);
            organism.pieces.splice(j, 1);

            if (organism.isPlayer) {
              soundEngine.playEatRedBloodCell();
              this.addFloatingText(p1.x, p1.y - 20, '¡FUSIÓN CELULAR!', '#10b981');
            }
            return;
          }
        }
      }
    }
  }

  // AI Logic for competing bloodstream microbes
  private updateBotAI(bot: Organism, dt: number) {
    if (!bot.isAlive || bot.pieces.length === 0) return;

    bot.aiDecisionTimer = (bot.aiDecisionTimer || 0) - dt;
    if (bot.aiDecisionTimer > 0) return;
    bot.aiDecisionTimer = 0.2 + Math.random() * 0.25;

    const mainPiece = bot.pieces[0];
    const botTotalMass = this.calculateTotalMass(bot);

    // 1. Check for immediate Antibody threat
    for (const ab of this.antibodies) {
      const dist = Math.hypot(ab.x - mainPiece.x, ab.y - mainPiece.y);
      if (botTotalMass > ANTIBODY_DETECTION_MASS && dist < 450) {
        // Run away in terror from antibody!
        const dx = mainPiece.x - ab.x;
        const dy = mainPiece.y - ab.y;
        const len = Math.hypot(dx, dy) || 1;
        bot.targetHeading = { x: dx / len, y: dy / len };
        return;
      }
    }

    // 2. Check for predators (Player or bigger Bots)
    let closestPredatorDist = 99999;
    let fleeVector = { x: 0, y: 0 };

    const candidates = this.player && this.player.isAlive ? [this.player, ...this.bots] : [...this.bots];

    for (const other of candidates) {
      if (other.id === bot.id || !other.isAlive) continue;
      if (this.gameMode === 'team' && other.faction === bot.faction) continue;

      for (const op of other.pieces) {
        for (const bp of bot.pieces) {
          const dist = Math.hypot(op.x - bp.x, op.y - bp.y);
          if (op.mass > bp.mass * 1.15 && dist < 380) {
            if (dist < closestPredatorDist) {
              closestPredatorDist = dist;
              fleeVector = { x: bp.x - op.x, y: bp.y - op.y };
            }
          }
        }
      }
    }

    if (closestPredatorDist < 350) {
      const len = Math.hypot(fleeVector.x, fleeVector.y) || 1;
      bot.targetHeading = { x: fleeVector.x / len, y: fleeVector.y / len };
      return;
    }

    // 3. Hunt smaller targets if aggressive
    if (bot.aiPersonality === 'aggressive' || bot.aiPersonality === 'balanced') {
      let closestPreyDist = 99999;
      let huntVector = { x: 0, y: 0 };
      let targetPreyPiece: CellPiece | null = null;

      for (const other of candidates) {
        if (other.id === bot.id || !other.isAlive) continue;
        if (this.gameMode === 'team' && other.faction === bot.faction) continue;

        for (const op of other.pieces) {
          for (const bp of bot.pieces) {
            const dist = Math.hypot(op.x - bp.x, op.y - bp.y);
            if (bp.mass > op.mass * 1.25 && dist < 420) {
              if (dist < closestPreyDist) {
                closestPreyDist = dist;
                huntVector = { x: op.x - bp.x, y: op.y - bp.y };
                targetPreyPiece = op;
              }
            }
          }
        }
      }

      if (targetPreyPiece && closestPreyDist < 380) {
        const len = Math.hypot(huntVector.x, huntVector.y) || 1;
        bot.targetHeading = { x: huntVector.x / len, y: huntVector.y / len };

        // Tactical bot split: if close enough and aggressive, split to snipe prey!
        if (
          bot.aiPersonality === 'aggressive' &&
          closestPreyDist < 220 &&
          bot.pieces.length === 1 &&
          mainPiece.mass > MIN_SPLIT_MASS * 1.4 &&
          mainPiece.mass * 0.5 > targetPreyPiece.mass * 1.15 &&
          Math.random() < 0.2
        ) {
          this.splitOrganism(bot);
        }
        return;
      }
    }

    // 4. Default: Scavenge nutrients (Proteins or Red Blood Cells)
    let closestFoodDist = 99999;
    let targetX = mainPiece.x;
    let targetY = mainPiece.y;

    // Check nearby red blood cells (rich mass)
    for (const rbc of this.redBloodCells) {
      const dist = Math.hypot(rbc.x - mainPiece.x, rbc.y - mainPiece.y);
      if (dist < 450 && dist < closestFoodDist && mainPiece.mass > rbc.mass * 1.2) {
        closestFoodDist = dist;
        targetX = rbc.x;
        targetY = rbc.y;
      }
    }

    // If no RBC nearby, seek nearest protein
    if (closestFoodDist > 300) {
      for (let i = 0; i < Math.min(this.proteins.length, 120); i++) {
        const p = this.proteins[i];
        const dist = Math.hypot(p.x - mainPiece.x, p.y - mainPiece.y);
        if (dist < closestFoodDist) {
          closestFoodDist = dist;
          targetX = p.x;
          targetY = p.y;
        }
      }
    }

    const dx = targetX - mainPiece.x;
    const dy = targetY - mainPiece.y;
    const len = Math.hypot(dx, dy) || 1;
    bot.targetHeading = { x: dx / len, y: dy / len };
  }

  // Update Patrol Antibodies (Security Bots of the Bloodstream)
  private updateAntibodies(dt: number) {
    let anyAlert = false;

    // Collect all living organisms
    const organisms = this.player && this.player.isAlive ? [this.player, ...this.bots] : [...this.bots];

    for (const ab of this.antibodies) {
      ab.rotation += ab.rotationSpeed * dt;

      // Find the biggest over-threshold Mite within scanning radius
      let highestThreatMass = 0;
      let threatTarget: Organism | null = null;
      let threatPiece: CellPiece | null = null;

      for (const org of organisms) {
        if (!org.isAlive) continue;
        const totalMass = this.calculateTotalMass(org);
        const hasCloak = org.mutations.has('antibody_cloak');
        const detectionThreshold = hasCloak ? ANTIBODY_DETECTION_MASS * 1.5 : ANTIBODY_DETECTION_MASS;

        if (totalMass >= detectionThreshold) {
          for (const piece of org.pieces) {
            const dist = Math.hypot(piece.x - ab.x, piece.y - ab.y);
            // Sensing radius
            if (dist < 900) {
              if (totalMass > highestThreatMass) {
                highestThreatMass = totalMass;
                threatTarget = org;
                threatPiece = piece;
              }
            }
          }
        }
      }

      if (threatTarget?.isPlayer && this.activeSuperpower?.type === 'cloaking_ghost') {
        threatTarget = null;
        threatPiece = null;
      }

      if (threatTarget && threatPiece) {
        // High alert state: home in on the oversized invader
        ab.targetOrganismId = threatTarget.id;
        ab.alertLevel = Math.min(1.0, ab.alertLevel + dt * 4);
        if (threatTarget.isPlayer) {
          anyAlert = true;
        }

        const dx = threatPiece.x - ab.x;
        const dy = threatPiece.y - ab.y;
        const dist = Math.hypot(dx, dy) || 1;

        // Hunt propulsion towards threat
        const speed = ANTIBODY_HUNT_SPEED;
        ab.vx += ((dx / dist) * speed - ab.vx) * Math.min(1, dt * 4);
        ab.vy += ((dy / dist) * speed - ab.vy) * Math.min(1, dt * 4);

        // Collision with threat piece: Shred membrane!
        if (dist < ab.radius + threatPiece.radius) {
          this.triggerAntibodyCollision(ab, threatTarget, threatPiece);
        }
      } else {
        // Peaceful patrol around assigned capillary sector
        ab.targetOrganismId = null;
        ab.alertLevel = Math.max(0, ab.alertLevel - dt * 2);

        ab.patrolAngle += dt * 0.45;
        const targetPatrolX = ab.patrolCenter.x + Math.cos(ab.patrolAngle) * 350;
        const targetPatrolY = ab.patrolCenter.y + Math.sin(ab.patrolAngle) * 350;

        const dx = targetPatrolX - ab.x;
        const dy = targetPatrolY - ab.y;
        const dist = Math.hypot(dx, dy) || 1;

        const speed = ANTIBODY_BASE_SPEED;
        ab.vx += ((dx / dist) * speed - ab.vx) * Math.min(1, dt * 2);
        ab.vy += ((dy / dist) * speed - ab.vy) * Math.min(1, dt * 2);
      }

      ab.x += ab.vx * dt;
      ab.y += ab.vy * dt;

      // Keep within bounds
      const distFromCenter = Math.hypot(ab.x, ab.y);
      if (distFromCenter > WORLD_RADIUS - ab.radius) {
        const angle = Math.atan2(ab.y, ab.x);
        ab.x = Math.cos(angle) * (WORLD_RADIUS - ab.radius);
        ab.y = Math.sin(angle) * (WORLD_RADIUS - ab.radius);
      }
    }

    // Trigger audio siren if alert state changed
    if (anyAlert !== this.antibodyAlertActive) {
      this.antibodyAlertActive = anyAlert;
      if (anyAlert) {
        soundEngine.playAntibodyAlert();
      }
      if (this.onAntibodyAlertChange) {
        this.onAntibodyAlertChange(anyAlert);
      }
    }
  }

  // When a giant Mite impacts a thorny Antibody
  private triggerAntibodyCollision(ab: AntibodyPatrol, target: Organism, piece: CellPiece) {
    if (target.isPlayer && (this.activeSuperpower?.type === 'shield_capsule' || this.activeSuperpower?.type === 'mega_shield')) {
      const nx = (piece.x - ab.x) / (Math.hypot(piece.x - ab.x, piece.y - ab.y) || 1);
      const ny = (piece.y - ab.y) / (Math.hypot(piece.x - ab.x, piece.y - ab.y) || 1);
      ab.vx = -nx * 400;
      ab.vy = -ny * 400;
      this.addFloatingText(piece.x, piece.y - 35, '¡ESCUDO ACTIVO! 0 DAÑO', '#10b981');
      soundEngine.playSecretDiscovery();
      return;
    }

    const hasDenseMembrane = target.mutations.has('dense_membrane');
    const armorReduction = target.isPlayer ? (this.playerUpgrades?.armor || 0) * 0.12 : 0;
    const damageRatio = (hasDenseMembrane ? ANTIBODY_DAMAGE_RATIO * 0.75 : ANTIBODY_DAMAGE_RATIO) * Math.max(0.4, 1.0 - armorReduction);

    const lostMass = piece.mass * damageRatio;
    piece.mass = Math.max(MIN_START_MASS, piece.mass - lostMass);
    piece.targetRadius = GameEngine.massToRadius(piece.mass);

    // Bounce target violently away
    const nx = (piece.x - ab.x) / (Math.hypot(piece.x - ab.x, piece.y - ab.y) || 1);
    const ny = (piece.y - ab.y) / (Math.hypot(piece.x - ab.x, piece.y - ab.y) || 1);
    piece.impulseX = nx * 500;
    piece.impulseY = ny * 500;
    ab.vx = -nx * 150;
    ab.vy = -ny * 150;

    // Scatter released mass nutrients everywhere
    const scatterCount = Math.min(12, Math.floor(lostMass / 3));
    for (let i = 0; i < scatterCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      this.spores.push({
        id: 'scatter_' + Math.random().toString(36).substring(2, 9),
        ownerId: '',
        x: piece.x,
        y: piece.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        mass: lostMass / scatterCount,
        radius: 6,
        color: target.ciliaColor,
        lifespan: 18,
      });
    }

    // If piece was very large, force-split into two!
    if (piece.mass > MIN_SPLIT_MASS * 1.5 && target.pieces.length < MAX_CELLS_PER_ORGANISM) {
      this.splitOrganism(target);
    }

    if (target.isPlayer) {
      soundEngine.playAntibodyRupture();
      this.screenShake = 16;
      this.addFloatingText(piece.x, piece.y - 40, '¡RUPTURA POR ANTICUERPO!', '#ef4444');
    }
  }

  // Check all eating interactions
  private checkConsumptions() {
    const organisms = this.player && this.player.isAlive ? [this.player, ...this.bots] : [...this.bots];

    for (const org of organisms) {
      if (!org.isAlive) continue;

      for (const piece of org.pieces) {
        const superGrowthBonus =
          this.activeSuperpower?.type === 'growth_serum'
            ? 2.8
            : this.activeSuperpower?.type === 'toxic_nanobot'
            ? 1.5
            : 1.0;
        const metabolismMultiplier = org.isPlayer
          ? (1 + (this.playerUpgrades?.metabolism || 0) * 0.1) * superGrowthBonus
          : 1.0;

        // 1. Eat Proteins
        for (let i = this.proteins.length - 1; i >= 0; i--) {
          const protein = this.proteins[i];
          const dist = Math.hypot(protein.x - piece.x, protein.y - piece.y);

          if (dist < piece.radius) {
            const gained = protein.mass * metabolismMultiplier;
            piece.mass += gained;
            org.score += Math.round(gained);
            this.proteins.splice(i, 1);

            if (org.isPlayer) {
              this.proteinsEaten++;
              soundEngine.playEatProtein(piece.mass / 200);
            }
          }
        }

        // 2. Eat Red Blood Cells (requires cell to be larger than the RBC)
        const hasErythrocyteAffinity = org.mutations.has('erythrocyte_affinity');
        const massBonus = hasErythrocyteAffinity ? 1.3 : 1.0;

        for (let i = this.redBloodCells.length - 1; i >= 0; i--) {
          const rbc = this.redBloodCells[i];
          const dist = Math.hypot(rbc.x - piece.x, rbc.y - piece.y);

          if (dist < piece.radius && piece.mass > rbc.mass * 1.15) {
            const gainedMass = rbc.mass * massBonus * metabolismMultiplier;
            piece.mass += gainedMass;
            org.score += Math.round(gainedMass);
            this.redBloodCells.splice(i, 1);

            // Burst particles
            for (let p = 0; p < 8; p++) {
              this.particles.push({
                x: rbc.x,
                y: rbc.y,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                radius: 4 + Math.random() * 3,
                color: '#ef4444',
                alpha: 0.9,
                life: 0.4,
                maxLife: 0.4,
              });
            }

            if (org.isPlayer) {
              this.redCellsEaten++;
              soundEngine.playEatRedBloodCell();
              this.addFloatingText(rbc.x, rbc.y - 25, `+${Math.round(gainedMass)} Masa`, '#f87171');
              if (this.redCellsEaten >= 10) {
                this.checkAchievement('erythrocyte_feast');
              }
            }
          }
        }

        // 3. Eat Ejected Spores
        for (let i = this.spores.length - 1; i >= 0; i--) {
          const spore = this.spores[i];
          const dist = Math.hypot(spore.x - piece.x, spore.y - piece.y);

          if (dist < piece.radius) {
            // If toxic spore from an enemy, apply speed slow
            if (spore.isToxic && spore.ownerId !== org.id) {
              org.speedMultiplier = 0.65;
              setTimeout(() => {
                org.speedMultiplier = 1.0;
              }, 3000);
            }

            piece.mass += spore.mass;
            org.score += Math.round(spore.mass);
            this.spores.splice(i, 1);

            if (org.isPlayer) {
              soundEngine.playEatProtein(0.8);
            }
          }
        }

        // 4. Devour Other Microbes
        for (const rival of organisms) {
          if (rival.id === org.id || !rival.isAlive) continue;
          // In Team Battle, teammates cannot eat each other
          if (this.gameMode === 'team' && rival.faction === org.faction) continue;
          // Player is invulnerable while Shield Capsule superpower is active!
          if (rival.isPlayer && this.activeSuperpower?.type === 'shield_capsule') continue;

          for (let rIdx = rival.pieces.length - 1; rIdx >= 0; rIdx--) {
            const rivalPiece = rival.pieces[rIdx];
            const dist = Math.hypot(rivalPiece.x - piece.x, rivalPiece.y - piece.y);

            // Must be at least 15% larger and overlapping center
            if (piece.mass > rivalPiece.mass * 1.15 && dist < piece.radius - rivalPiece.radius * 0.3) {
              piece.mass += rivalPiece.mass;
              org.score += Math.round(rivalPiece.mass);
              org.kills++;
              rival.pieces.splice(rIdx, 1);

              if (org.isPlayer) {
                this.rivalsEaten++;
                soundEngine.playKillMicrobe();
                this.addFloatingText(rivalPiece.x, rivalPiece.y - 35, `¡Devorado! +${Math.round(rivalPiece.mass)}`, '#fbbf24');
                this.checkAchievement('first_blood');
              }

              // Check if rival is completely eliminated
              if (rival.pieces.length === 0) {
                rival.isAlive = false;

                if (rival.isPlayer) {
                  this.causeOfDeath = `Devorado por ${org.name}`;
                  this.triggerGameOver();
                  return;
                } else {
                  // Respawn bot after 3 seconds to keep room populated at 50 capacity
                  setTimeout(() => {
                    if (this.state === 'PLAYING' && !this.humansOnly) {
                      const faction = rival.faction || (Math.random() < 0.5 ? 'immune' : 'pathogen');
                      const presets = faction === 'immune' ? IMMUNE_BOT_PRESETS : PATHOGEN_BOT_PRESETS;
                      const preset = presets[Math.floor(Math.random() * presets.length)];
                      const baseX = faction === 'immune' ? -1050 : 1050;
                      const x = baseX + (Math.random() - 0.5) * 800;
                      const y = (Math.random() - 0.5) * 2400;
                      const startMass = 18 + Math.random() * 45;
                      const r = GameEngine.massToRadius(startMass);
                      rival.name = preset.name;
                      rival.faction = faction;
                      rival.color = preset.color;
                      rival.secondaryColor = preset.secondaryColor;
                      rival.ciliaColor = preset.ciliaColor;
                      rival.isAlive = true;
                      rival.score = Math.floor(startMass);
                      rival.pieces = [{
                        id: `bp_respawn_${Date.now()}`,
                        x,
                        y,
                        vx: 0,
                        vy: 0,
                        mass: startMass,
                        targetRadius: r,
                        radius: r,
                        remergeTimer: 0,
                        totalRemergeTime: 1,
                        wobbleOffsets: Array.from({ length: 16 }, () => 0),
                        wobbleSpeed: 2.5,
                        impulseX: 0,
                        impulseY: 0,
                      }];
                    }
                  }, 3000);
                }
              }
            }
          }
        }
      }
    }
  }

  private triggerGameOver() {
    this.state = 'GAME_OVER';
    soundEngine.playAntibodyRupture();
    if (this.player) {
      const survivalSec = Math.floor((Date.now() - this.startTime) / 1000);
      const sporesInvaded = this.sporesFiredCount + this.territoryExplored.size;
      const reward = profileStorage.recordGameEnd(
        this.calculateTotalMass(this.player),
        this.rivalsEaten,
        this.redCellsEaten,
        this.secretZoneDiscoveredThisGame,
        survivalSec,
        sporesInvaded
      );
      if (this.onGameOverWithReward) {
        this.onGameOverWithReward(reward);
      }
    }
    if (this.onStateChange) this.onStateChange('GAME_OVER');
  }

  // Smooth camera tracking with Grand Panoramic field of view
  private updateCamera(dt: number) {
    let targetX = this.cameraX;
    let targetY = this.cameraY;
    let totalMass = 20;

    if (this.player && this.player.isAlive && this.player.pieces.length > 0) {
      const centroid = this.calculateCentroid(this.player);
      targetX = centroid.x;
      targetY = centroid.y;
      totalMass = this.calculateTotalMass(this.player);

      if (totalMass > this.peakMass) {
        this.peakMass = totalMass;
      }
    } else {
      // If player died, spectate the largest organism in the match or stay smooth
      const aliveOrgs = [...this.bots].filter((b) => b.isAlive && b.pieces.length > 0);
      if (aliveOrgs.length > 0) {
        aliveOrgs.sort((a, b) => this.calculateTotalMass(b) - this.calculateTotalMass(a));
        const leader = aliveOrgs[0];
        const centroid = this.calculateCentroid(leader);
        targetX = centroid.x;
        targetY = centroid.y;
        totalMass = this.calculateTotalMass(leader);
      }
    }

    // Dynamic zoom: scale out smoothly as cell grows to provide an expansive, grand panorama
    const targetZoom = Math.max(0.24, Math.min(0.96, 0.92 - Math.log10(Math.max(15, totalMass) / 15) * 0.26));
    this.cameraZoom += (targetZoom - this.cameraZoom) * Math.min(1, dt * 3);

    // Smooth camera lerp
    this.cameraX += (targetX - this.cameraX) * Math.min(1, dt * 5);
    this.cameraY += (targetY - this.cameraY) * Math.min(1, dt * 5);

    // Check Evolution Milestones (100, 250, 500, 1000 mass)
    if (totalMass >= this.nextMilestone && this.nextMilestone <= 1000) {
      const milestone = this.nextMilestone;
      if (this.nextMilestone === 100) this.nextMilestone = 250;
      else if (this.nextMilestone === 250) this.nextMilestone = 500;
      else if (this.nextMilestone === 500) this.nextMilestone = 1000;
      else this.nextMilestone = 999999;

      if (this.onMutationTrigger) {
        this.onMutationTrigger(milestone);
      }
    }
  }

  public calculateCentroid(org: Organism): { x: number; y: number } {
    if (org.pieces.length === 0) return { x: 0, y: 0 };
    let sumX = 0;
    let sumY = 0;
    let totalWeight = 0;
    for (const p of org.pieces) {
      sumX += p.x * p.mass;
      sumY += p.y * p.mass;
      totalWeight += p.mass;
    }
    return { x: sumX / totalWeight, y: sumY / totalWeight };
  }

  public calculateTotalMass(org: Organism): number {
    return org.pieces.reduce((acc, p) => acc + p.mass, 0);
  }

  private dispatchStats() {
    if (!this.player) return;

    const totalMass = Math.round(this.calculateTotalMass(this.player));

    // Sort all microbes by mass for real-time leaderboard
    const allOrganisms = [this.player, ...this.bots].filter((o) => o.isAlive);
    allOrganisms.sort((a, b) => this.calculateTotalMass(b) - this.calculateTotalMass(a));

    const rank = allOrganisms.findIndex((o) => o.id === this.player?.id) + 1;

    // Check achievement triggers
    if (rank === 1 && totalMass >= 70) {
      this.checkAchievement('bloodstream_king');
    }
    if (totalMass >= 100) {
      this.checkAchievement('mass_100');
    }
    if (totalMass >= 500) {
      this.checkAchievement('mass_500');
    }

    // Reset all crown flags
    for (const org of allOrganisms) {
      org.hasCrown = false;
      org.crownType = undefined;
    }

    if (this.gameMode === 'ffa') {
      if (allOrganisms.length > 0) {
        allOrganisms[0].hasCrown = true;
        allOrganisms[0].crownType = 'gold';
      }
    } else {
      // Team Battle: 1 King for Immune, 1 King for Pathogen
      const topImmune = allOrganisms.find((o) => o.faction === 'immune');
      const topPathogen = allOrganisms.find((o) => o.faction === 'pathogen');
      if (topImmune) {
        topImmune.hasCrown = true;
        topImmune.crownType = 'immune';
      }
      if (topPathogen) {
        topPathogen.hasCrown = true;
        topPathogen.crownType = 'pathogen';
      }
    }

    const leaderboard: LeaderboardEntry[] = allOrganisms.slice(0, 10).map((o) => ({
      id: o.id,
      name: o.name,
      mass: Math.round(this.calculateTotalMass(o)),
      isPlayer: o.isPlayer,
      faction: o.faction,
      hasCrown: o.hasCrown,
      crownType: o.crownType,
    }));

    if (this.onLeaderboardUpdate) {
      this.onLeaderboardUpdate(leaderboard);
    }

    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        currentMass: totalMass,
        peakMass: Math.round(this.peakMass),
        rank: Math.max(1, rank),
        totalMicrobes: allOrganisms.length,
        cellsCount: this.player.pieces.length,
        proteinsEaten: this.proteinsEaten,
        redCellsEaten: this.redCellsEaten,
        rivalsEaten: this.rivalsEaten,
        timeAliveSec: Math.floor((Date.now() - this.startTime) / 1000),
        causeOfDeath: this.causeOfDeath,
        canConquer: this.canConquerTerritory(),
        conqueredOrgansCount: profileStorage.getProfile().conqueredOrgans.length,
        immunePercentage: this.calculateTeamPercentage('immune'),
        pathogenPercentage: this.calculateTeamPercentage('pathogen'),
        gameMode: this.gameMode,
        playerFaction: this.playerFaction,
        activeSuperpower: this.activeSuperpower,
        hostStatus: this.hostStatus,
      });
    }
  }

  // ================= RENDER PASS =================
  public render() {
    const { ctx, canvas } = this;
    const width = canvas.width;
    const height = canvas.height;

    // Clear background: deep visceral blood-plasma wine / dark burgundy
    ctx.fillStyle = '#0b0204';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Screen Shake effect
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // World to Viewport transformation
    ctx.translate(width / 2, height / 2);
    ctx.scale(this.cameraZoom, this.cameraZoom);
    ctx.translate(-this.cameraX, -this.cameraY);

    // 1. Draw Capillary & Vessel Wall boundaries
    this.renderVascularWalls(ctx);

    // 1b. Draw Human Anatomy & Organs
    this.renderHumanAnatomy(ctx);

    // 1c. Draw Secret Lymphatic Crypt
    this.renderSecretZone(ctx);

    // 2. Draw Plasma Fluid Stream lines
    this.renderPlasmaCurrents(ctx);

    // 3. Draw Proteins / Nutrients
    this.renderProteins(ctx);

    // 4. Draw Red Blood Cells
    this.renderRedBloodCells(ctx);

    // 5. Draw Ejected Spores
    this.renderSpores(ctx);

    // 5b. Draw 4 Central Map Superpowers (Medicine Capsules)
    this.renderSuperpowers(ctx);

    // 5c. Draw Battle Mode Pus Pustules
    this.renderPusPustules(ctx);

    // 6. Draw AI Bot Microbes
    for (const bot of this.bots) {
      if (bot.isAlive) {
        this.renderOrganism(ctx, bot);
      }
    }

    // 7. Draw Player Microbe
    if (this.player && this.player.isAlive) {
      this.renderOrganism(ctx, this.player);
    }

    // 8. Draw Patrol Antibodies with surveillance beams & thorny spikes
    this.renderAntibodies(ctx);

    // 9. Draw Particle bursts
    this.renderParticles(ctx);

    // 10. Draw Floating Numbers / Alerts
    this.renderFloatingTexts(ctx);

    ctx.restore();
  }

  // Vascular wall with pulsating endothelium
  private renderVascularWalls(ctx: CanvasRenderingContext2D) {
    const pulse = Math.sin(performance.now() * 0.0015) * 8;
    const effectiveRadius = WORLD_RADIUS + pulse;

    // Outer tissue border
    ctx.save();
    ctx.beginPath();
    ctx.arc(WORLD_CENTER_X, WORLD_CENTER_Y, effectiveRadius, 0, Math.PI * 2);
    ctx.lineWidth = 42;
    ctx.strokeStyle = '#5a0c18'; // Muscular arteriole wall
    ctx.stroke();

    // Inner vascular lining
    ctx.beginPath();
    ctx.arc(WORLD_CENTER_X, WORLD_CENTER_Y, effectiveRadius - 18, 0, Math.PI * 2);
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#881328';
    ctx.stroke();

    // Dark exterior tissue
    ctx.beginPath();
    ctx.arc(WORLD_CENTER_X, WORLD_CENTER_Y, effectiveRadius + 20, 0, Math.PI * 2);
    ctx.arc(WORLD_CENTER_X, WORLD_CENTER_Y, effectiveRadius + 3000, 0, Math.PI * 2, true);
    ctx.fillStyle = '#030001';
    ctx.fill();

    ctx.restore();
  }

  // Gentle laminar plasma currents
  private renderPlasmaCurrents(ctx: CanvasRenderingContext2D) {
    const time = performance.now() * 0.0004;
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 30, 50, 0.06)';
    ctx.lineWidth = 2.5;

    for (let r = 500; r < WORLD_RADIUS - 100; r += 450) {
      ctx.beginPath();
      const offset = (r * 0.002) + time;
      ctx.arc(WORLD_CENTER_X, WORLD_CENTER_Y, r, offset, offset + Math.PI * 1.6);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Render glowing proteins
  private renderProteins(ctx: CanvasRenderingContext2D) {
    for (const p of this.proteins) {
      // Viewport frustum culling
      if (this.isOutsideViewport(p.x, p.y, p.radius * 2)) continue;

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  // Render realistic biconcave red blood cells
  private renderRedBloodCells(ctx: CanvasRenderingContext2D) {
    for (const rbc of this.redBloodCells) {
      if (this.isOutsideViewport(rbc.x, rbc.y, rbc.radius * 2)) continue;

      ctx.save();
      ctx.translate(rbc.x, rbc.y);
      ctx.rotate(rbc.rotation);

      // Outer rim gradient (arterial bright red into dark venous crimson)
      const grad = ctx.createRadialGradient(0, 0, rbc.radius * 0.3, 0, 0, rbc.radius);
      grad.addColorStop(0, '#7f1d1d'); // Dark concave center
      grad.addColorStop(0.5, '#dc2626'); // Thick toroid rim
      grad.addColorStop(1, '#991b1b'); // Edge contour

      ctx.beginPath();
      ctx.arc(0, 0, rbc.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Biconcave inner dimple shading
      ctx.beginPath();
      ctx.arc(0, 0, rbc.radius * rbc.biconcaveScale * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(69, 10, 10, 0.45)';
      ctx.fill();

      ctx.restore();
    }
  }

  // Render ejected spores
  private renderSpores(ctx: CanvasRenderingContext2D) {
    for (const spore of this.spores) {
      if (this.isOutsideViewport(spore.x, spore.y, spore.radius * 2)) continue;

      ctx.save();
      ctx.beginPath();
      ctx.arc(spore.x, spore.y, spore.radius, 0, Math.PI * 2);
      ctx.fillStyle = spore.color;
      ctx.shadowColor = spore.color;
      ctx.shadowBlur = 10;
      ctx.fill();

      if (spore.isToxic) {
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Render Human Body Anatomical Environment & Organs
  private renderHumanAnatomy(ctx: CanvasRenderingContext2D) {
    const time = performance.now() * 0.001;

    ctx.save();

    // 1. Comprehensive Humanoid Silhouette & Skeletal Structure
    // Head & Cranium
    ctx.beginPath();
    ctx.ellipse(0, -1900, 700, 800, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(45, 10, 24, 0.4)';
    ctx.fill();

    // Neck
    ctx.beginPath();
    ctx.rect(-340, -1450, 680, 400);
    ctx.fillStyle = 'rgba(40, 8, 20, 0.45)';
    ctx.fill();

    // Shoulders & Left/Right Arms (Brachial Vessels)
    // Left Shoulder & Arm
    ctx.beginPath();
    ctx.moveTo(-500, -1250);
    ctx.bezierCurveTo(-1100, -1200, -1650, -800, -1800, 300);
    ctx.bezierCurveTo(-1650, 400, -1350, 300, -1250, -700);
    ctx.bezierCurveTo(-900, -900, -700, -1000, -500, -1100);
    ctx.closePath();
    ctx.fillStyle = 'rgba(38, 8, 18, 0.35)';
    ctx.fill();

    // Right Shoulder & Arm
    ctx.beginPath();
    ctx.moveTo(500, -1250);
    ctx.bezierCurveTo(1100, -1200, 1650, -800, 1800, 300);
    ctx.bezierCurveTo(1650, 400, 1350, 300, 1250, -700);
    ctx.bezierCurveTo(900, -900, 700, -1000, 500, -1100);
    ctx.closePath();
    ctx.fillStyle = 'rgba(38, 8, 18, 0.35)';
    ctx.fill();

    // Left Brachial Artery & Vein
    ctx.beginPath();
    ctx.moveTo(-350, -1100);
    ctx.bezierCurveTo(-850, -1000, -1350, -600, -1550, 250);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.28)';
    ctx.lineWidth = 45;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Right Brachial Artery & Vein
    ctx.beginPath();
    ctx.moveTo(350, -1100);
    ctx.bezierCurveTo(850, -1000, 1350, -600, 1550, 250);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.28)';
    ctx.lineWidth = 45;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Chest & Ribcage torso
    ctx.beginPath();
    ctx.ellipse(0, -650, 1150, 850, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(42, 8, 18, 0.45)';
    ctx.fill();

    // Abdomen & Flanks
    ctx.beginPath();
    ctx.ellipse(0, 450, 1000, 850, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(40, 7, 16, 0.42)';
    ctx.fill();

    // Pelvic Girdle & Groin
    ctx.beginPath();
    ctx.ellipse(0, 1350, 850, 650, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(36, 6, 14, 0.4)';
    ctx.fill();

    // Left Thigh Conduit
    ctx.beginPath();
    ctx.moveTo(-450, 1400);
    ctx.bezierCurveTo(-550, 1800, -450, 2400, -350, 2750);
    ctx.lineTo(-120, 2750);
    ctx.bezierCurveTo(-150, 2300, -180, 1800, -120, 1500);
    ctx.closePath();
    ctx.fillStyle = 'rgba(34, 6, 12, 0.38)';
    ctx.fill();

    // Right Thigh Conduit
    ctx.beginPath();
    ctx.moveTo(450, 1400);
    ctx.bezierCurveTo(550, 1800, 450, 2400, 350, 2750);
    ctx.lineTo(120, 2750);
    ctx.bezierCurveTo(150, 2300, 180, 1800, 120, 1500);
    ctx.closePath();
    ctx.fillStyle = 'rgba(34, 6, 12, 0.38)';
    ctx.fill();

    // Human Skeletal Ribs (Translucent Costal Arches)
    ctx.strokeStyle = 'rgba(255, 230, 230, 0.05)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    for (let r = 0; r < 7; r++) {
      const ribY = -1150 + r * 135;
      const ribSpread = 420 + r * 65;
      // Left Rib
      ctx.beginPath();
      ctx.moveTo(-40, ribY);
      ctx.quadraticCurveTo(-ribSpread * 0.9, ribY + 30, -ribSpread, ribY + 110);
      ctx.stroke();
      // Right Rib
      ctx.beginPath();
      ctx.moveTo(40, ribY);
      ctx.quadraticCurveTo(ribSpread * 0.9, ribY + 30, ribSpread, ribY + 110);
      ctx.stroke();
    }

    // Vertebral Spinal Column (Midline discs)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let v = -1800; v < 1400; v += 95) {
      ctx.beginPath();
      ctx.roundRect(-42, v, 84, 52, 12);
      ctx.fill();
    }

    // 2. The Great Circulatory Arteries & Vena Cava Network
    // Aorta trunk (Red arterial highway)
    ctx.beginPath();
    ctx.moveTo(0, -1900);
    ctx.bezierCurveTo(40, -1200, -30, -500, 0, -400); // Carotid into Heart
    ctx.bezierCurveTo(30, -200, 40, 400, 0, 1300); // Abdominal aorta
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.32)';
    ctx.lineWidth = 150;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Bifurcation into Left & Right Femoral Arteries
    // Left Femoral
    ctx.beginPath();
    ctx.moveTo(0, 1300);
    ctx.bezierCurveTo(-80, 1600, -280, 2000, -260, 2750);
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
    ctx.lineWidth = 90;
    ctx.stroke();

    // Right Femoral
    ctx.beginPath();
    ctx.moveTo(0, 1300);
    ctx.bezierCurveTo(80, 1600, 280, 2000, 260, 2750);
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
    ctx.lineWidth = 90;
    ctx.stroke();

    // Inner bright aorta channel
    ctx.beginPath();
    ctx.moveTo(0, -1900);
    ctx.bezierCurveTo(40, -1200, -30, -500, 0, -400);
    ctx.bezierCurveTo(30, -200, 40, 400, 0, 1300);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
    ctx.lineWidth = 50;
    ctx.stroke();

    // Vena Cava (Venous return highway)
    ctx.beginPath();
    ctx.moveTo(130, -1850);
    ctx.bezierCurveTo(160, -1100, 120, -500, 130, -400);
    ctx.bezierCurveTo(140, -200, 150, 500, 130, 1300);
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.28)';
    ctx.lineWidth = 120;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Left & Right Venous Return from legs
    ctx.beginPath();
    ctx.moveTo(-200, 2750);
    ctx.bezierCurveTo(-220, 2000, -70, 1600, 100, 1300);
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.24)';
    ctx.lineWidth = 75;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(320, 2750);
    ctx.bezierCurveTo(340, 2000, 200, 1600, 130, 1300);
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.24)';
    ctx.lineWidth = 75;
    ctx.stroke();

    // 3. Render Each Organ Zone with Specific Anatomical Art
    for (const organ of ANATOMICAL_ORGANS) {
      if (this.isOutsideViewport(organ.x, organ.y, organ.radius * 2.2)) continue;

      ctx.save();
      ctx.translate(organ.x, organ.y);

      // Heart rhythmic systolic pulse
      let organPulse = 0;
      if (organ.id === 'heart') {
        const beat = Math.pow(Math.sin(time * 4), 6);
        organPulse = beat * 35;
      } else {
        organPulse = Math.sin(time * 2 + organ.x) * 10;
      }

      const currentR = organ.radius + organPulse;

      // Outer organ tissue glow
      const grad = ctx.createRadialGradient(0, 0, currentR * 0.2, 0, 0, currentR);
      grad.addColorStop(0, `${organ.color}35`);
      grad.addColorStop(0.7, `${organ.color}18`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(0, 0, currentR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Organ anatomical contour border
      ctx.beginPath();
      ctx.arc(0, 0, currentR * 0.78, 0, Math.PI * 2);
      ctx.strokeStyle = `${organ.glowColor}50`;
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 10]);
      ctx.stroke();

      // SPECIFIC ORGAN ART:
      // A. Brain (Cerebro): Hemispheres & Sulci/Gyri Convolutions
      if (organ.id === 'brain') {
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        // Sulci folds
        for (let fold = -3; fold <= 3; fold++) {
          ctx.beginPath();
          ctx.arc(fold * 70, 0, 160, Math.PI * 0.2, Math.PI * 0.8);
          ctx.stroke();
        }
        // Neural Synapse Sparks
        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let s = 0; s < 7; s++) {
          const a1 = (s * 0.9) + time * 1.5;
          const r1 = 100 + (s * 35);
          ctx.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
          ctx.lineTo(Math.cos(a1 + 0.4) * (r1 + 55), Math.sin(a1 + 0.4) * (r1 + 55));
        }
        ctx.stroke();
      }

      // B. Heart (Corazón): Ventricles & Coronary Artery Branches
      if (organ.id === 'heart') {
        // Muscular silhouette
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, 180);
        ctx.bezierCurveTo(-260, 40, -220, -180, 0, -110);
        ctx.bezierCurveTo(220, -180, 260, 40, 0, 180);
        ctx.fill();

        // Coronary arteries tree
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(0, -90);
        ctx.lineTo(-60, 20);
        ctx.lineTo(-120, 80);
        ctx.moveTo(0, -90);
        ctx.lineTo(70, 30);
        ctx.lineTo(130, 90);
        ctx.stroke();
      }

      // C. Lungs (Pulmones): Bronchial Tree & Alveoli
      if (organ.id === 'left_lung' || organ.id === 'right_lung') {
        const isLeft = organ.id === 'left_lung';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([]);
        // Bronchus branching
        ctx.beginPath();
        const rootX = isLeft ? 120 : -120;
        ctx.moveTo(rootX, -100);
        ctx.lineTo(0, 0);
        ctx.lineTo(isLeft ? -80 : 80, 80);
        ctx.moveTo(0, 0);
        ctx.lineTo(isLeft ? -100 : 100, -40);
        ctx.stroke();

        // Alveolar Clusters
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        for (let b = 0; b < 7; b++) {
          const a = (b / 7) * Math.PI * 2 + time * 0.4;
          const br = currentR * 0.48;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * br, Math.sin(a) * br, 28, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // D. Liver (Hígado): Large Metabolic Lobe
      if (organ.id === 'liver') {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.28)';
        ctx.beginPath();
        ctx.moveTo(-180, -90);
        ctx.bezierCurveTo(180, -120, 240, 90, 80, 140);
        ctx.bezierCurveTo(-60, 160, -220, 80, -180, -90);
        ctx.fill();
      }

      // E. Stomach & Intestines (Estómago e Intestino)
      if (organ.id === 'stomach') {
        // C-curve stomach
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
        ctx.lineWidth = 45;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, -60, 140, Math.PI * 0.3, Math.PI * 1.5);
        ctx.stroke();

        // Intestinal convolution coils
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 18;
        ctx.beginPath();
        for (let c = 0; c < 4; c++) {
          const cy = 60 + c * 40;
          ctx.moveTo(-120, cy);
          ctx.bezierCurveTo(-60, cy + 25, 60, cy - 25, 120, cy);
        }
        ctx.stroke();
      }

      // F. Kidneys (Riñones): Bean-shaped Nephrons
      if (organ.id === 'kidneys') {
        // Left & Right bean shapes
        ctx.fillStyle = 'rgba(225, 29, 72, 0.35)';
        // Left kidney
        ctx.beginPath();
        ctx.ellipse(-140, 0, 75, 120, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Right kidney
        ctx.beginPath();
        ctx.ellipse(140, 0, 75, 120, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Organ Name & Bonus Badge
      ctx.font = "800 18px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.strokeText(organ.name, 0, -12);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(organ.name, 0, -12);

      // Subtitle bonus description
      ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.strokeText(organ.description, 0, 14);
      ctx.fillStyle = organ.glowColor;
      ctx.fillText(organ.description, 0, 14);

      ctx.restore();
    }

    ctx.restore();
  }

  // Render Secret Lymphatic Crypt Zone
  private renderSecretZone(ctx: CanvasRenderingContext2D) {
    if (this.isOutsideViewport(SECRET_ZONE_X, SECRET_ZONE_Y, SECRET_ZONE_RADIUS * 1.5)) return;

    ctx.save();
    ctx.translate(SECRET_ZONE_X, SECRET_ZONE_Y);

    const time = performance.now() * 0.0015;
    const pulse = Math.sin(time * 2) * 15;

    // Outer ethereal bioluminescent aura
    const auraGrad = ctx.createRadialGradient(0, 0, 40, 0, 0, SECRET_ZONE_RADIUS + pulse);
    auraGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    auraGrad.addColorStop(0.5, 'rgba(147, 51, 234, 0.2)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(0, 0, SECRET_ZONE_RADIUS + pulse, 0, Math.PI * 2);
    ctx.fillStyle = auraGrad;
    ctx.fill();

    // Valve ring border
    ctx.beginPath();
    ctx.arc(0, 0, SECRET_ZONE_RADIUS * 0.85, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.stroke();

    // Central Stem Cell Crypt Core
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 25;
    ctx.fill();

    // Crypt Label
    ctx.font = "700 14px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#67e8f9';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0891b2';
    ctx.fillText('CRIPTA LINFÁTICA OCULTA', 0, 75);

    ctx.restore();
  }

  // Update 4 Central Superpowers (Respawn, Collisions, Attraction & 15s Active Effects)
  private updateSuperpowers(dt: number) {
    // 1. Update Map Superpowers (respawn timer, rotation, availability)
    for (const sp of this.superpowers) {
      sp.rotation += dt * 1.8;

      if (!sp.isAvailable) {
        sp.respawnTimer -= dt;
        if (sp.respawnTimer <= 0) {
          sp.isAvailable = true;
          sp.respawnTimer = 0;
          // Spawn respawn flash particles
          for (let p = 0; p < 12; p++) {
            const angle = (p / 12) * Math.PI * 2;
            this.particles.push({
              x: sp.x + Math.cos(angle) * sp.radius,
              y: sp.y + Math.sin(angle) * sp.radius,
              vx: Math.cos(angle) * 70,
              vy: Math.sin(angle) * 70,
              radius: 4,
              color: sp.color,
              alpha: 0.9,
              life: 0.7,
              maxLife: 0.7,
            });
          }
        }
      } else {
        // Check collection collision with any cell piece
        const organisms = this.player && this.player.isAlive ? [this.player, ...this.bots] : [...this.bots];
        for (const org of organisms) {
          if (!org.isAlive) continue;
          for (const piece of org.pieces) {
            const dist = Math.hypot(piece.x - sp.x, piece.y - sp.y);
            if (dist < piece.radius + sp.radius) {
              sp.isAvailable = false;
              sp.respawnTimer = SUPERPOWER_RESPAWN_SEC; // 24s respawn

              // Particle burst on pickup
              for (let p = 0; p < 24; p++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 60 + Math.random() * 180;
                this.particles.push({
                  x: sp.x,
                  y: sp.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  radius: 3 + Math.random() * 4,
                  color: sp.color,
                  alpha: 1.0,
                  life: 0.8,
                  maxLife: 0.8,
                });
              }

              if (org.isPlayer) {
                this.activeSuperpower = {
                  type: sp.type,
                  name: sp.name,
                  desc: sp.desc,
                  color: sp.color,
                  remainingTime: SUPERPOWER_DURATION_SEC,
                  totalDuration: SUPERPOWER_DURATION_SEC,
                };
                soundEngine.playLevelUp();
                this.screenShake = 12;
                this.addFloatingText(sp.x, sp.y - 45, `¡${sp.name.toUpperCase()}!`, sp.color);
                this.addFloatingText(sp.x, sp.y - 20, '+10 SEGUNDOS DE SUPERPODER', '#ffffff');
              } else {
                this.addFloatingText(sp.x, sp.y - 30, `¡${org.name} tomó ${sp.name}!`, sp.color);
              }
              break;
            }
          }
          if (!sp.isAvailable) break;
        }
      }
    }

    // 2. Active Superpower & Permanent Attraction logic for Player
    if (this.player && this.player.isAlive) {
      // 2a. Attraction Upgrade Gravitational Field (Permanent) + Super Magnet Pill
      const attractionLvl = this.playerUpgrades?.attraction || 0;
      const isMagnetPill = this.activeSuperpower?.type === 'magnet_pill';

      if (attractionLvl > 0 || isMagnetPill) {
        for (const piece of this.player.pieces) {
          const suctionRadius = isMagnetPill ? 650 : piece.radius + 35 + attractionLvl * 30;
          const suctionForce = isMagnetPill ? 480 : 180 + attractionLvl * 35;

          // Pull proteins
          for (const protein of this.proteins) {
            const dx = piece.x - protein.x;
            const dy = piece.y - protein.y;
            const dist = Math.hypot(dx, dy);
            if (dist < suctionRadius && dist > 2) {
              const pull = (suctionForce / (dist * 0.4 + 40)) * dt * 100;
              protein.x += (dx / dist) * Math.min(dist, pull);
              protein.y += (dy / dist) * Math.min(dist, pull);
            }
          }

          // Pull red blood cells if larger or magnet active
          for (const rbc of this.redBloodCells) {
            const dx = piece.x - rbc.x;
            const dy = piece.y - rbc.y;
            const dist = Math.hypot(dx, dy);
            if (dist < suctionRadius * 0.75 && dist > 5) {
              const pull = (suctionForce * 0.4 / (dist * 0.5 + 50)) * dt * 80;
              rbc.x += (dx / dist) * Math.min(dist, pull);
              rbc.y += (dy / dist) * Math.min(dist, pull);
            }
          }

          // Pull spores
          for (const spore of this.spores) {
            const dx = piece.x - spore.x;
            const dy = piece.y - spore.y;
            const dist = Math.hypot(dx, dy);
            if (dist < suctionRadius && dist > 2) {
              const pull = (suctionForce / (dist * 0.4 + 40)) * dt * 100;
              spore.x += (dx / dist) * Math.min(dist, pull);
              spore.y += (dy / dist) * Math.min(dist, pull);
            }
          }
        }
      }

      // 2b. Decrement active superpower timer
      if (this.activeSuperpower) {
        this.activeSuperpower.remainingTime -= dt;

        // Toxic nanobot pulse logic (every 1.3s)
        if (this.activeSuperpower.type === 'toxic_nanobot') {
          this.toxicPulseCooldown -= dt;
          if (this.toxicPulseCooldown <= 0) {
            this.toxicPulseCooldown = 1.3;
            for (const piece of this.player.pieces) {
              // Pulse wave particle effect
              for (let p = 0; p < 16; p++) {
                const angle = (p / 16) * Math.PI * 2;
                this.particles.push({
                  x: piece.x + Math.cos(angle) * (piece.radius * 0.9),
                  y: piece.y + Math.sin(angle) * (piece.radius * 0.9),
                  vx: Math.cos(angle) * 160,
                  vy: Math.sin(angle) * 160,
                  radius: 4,
                  color: '#ec4899',
                  alpha: 0.9,
                  life: 0.5,
                  maxLife: 0.5,
                });
              }

              // Knockback nearby rival microbes
              for (const bot of this.bots) {
                if (!bot.isAlive) continue;
                if (this.gameMode === 'team' && bot.faction === this.player.faction) continue;
                for (const bPiece of bot.pieces) {
                  const dx = bPiece.x - piece.x;
                  const dy = bPiece.y - piece.y;
                  const dist = Math.hypot(dx, dy);
                  if (dist < piece.radius + bPiece.radius + 150) {
                    const nx = dx / (dist || 1);
                    const ny = dy / (dist || 1);
                    bPiece.impulseX += nx * 380;
                    bPiece.impulseY += ny * 380;
                    bPiece.mass = Math.max(MIN_START_MASS, bPiece.mass * 0.95);
                    this.addFloatingText(bPiece.x, bPiece.y - 20, '-Ácido Lítico', '#f472b6');
                  }
                }
              }
            }
            soundEngine.playEatProtein(1.4);
          }
        }

        // Mega Shield: continuous +4 mass/sec regeneration
        if (this.activeSuperpower.type === 'mega_shield') {
          for (const piece of this.player.pieces) {
            piece.mass += 4 * dt;
            piece.radius = GameEngine.massToRadius(piece.mass);
          }
        }

        // Frost Blast: slow down nearby rival bots and antibodies
        if (this.activeSuperpower.type === 'frost_blast') {
          for (const piece of this.player.pieces) {
            for (const bot of this.bots) {
              if (!bot.isAlive) continue;
              const bDist = Math.hypot((bot.pieces[0]?.x || 0) - piece.x, (bot.pieces[0]?.y || 0) - piece.y);
              if (bDist < 700) {
                bot.speedMultiplier = 0.35;
              }
            }
            for (const ab of this.antibodies) {
              const abDist = Math.hypot(ab.x - piece.x, ab.y - piece.y);
              if (abDist < 700) {
                ab.vx *= 0.55;
                ab.vy *= 0.55;
              }
            }
          }
        }

        // Quantum Fission: instant recombine timer (0s cooldown)
        if (this.activeSuperpower.type === 'quantum_fission') {
          for (const piece of this.player.pieces) {
            piece.remergeTimer = 0;
          }
        }

        // Cloaking Ghost: clear antibody locks from player
        if (this.activeSuperpower.type === 'cloaking_ghost') {
          for (const ab of this.antibodies) {
            if (ab.targetOrganismId === this.player.id) {
              ab.targetOrganismId = null;
              ab.alertLevel = 0;
            }
          }
        }

        if (this.activeSuperpower.remainingTime <= 0) {
          const finishedName = this.activeSuperpower.name;
          this.activeSuperpower = null;
          if (this.player.pieces.length > 0) {
            this.addFloatingText(this.player.pieces[0].x, this.player.pieces[0].y - 35, `¡${finishedName} agotado!`, '#94a3b8');
          }
        }
      }
    }
  }

  // Update Pus Pustules and Host Human Status (Battle Mode)
  private updatePusAndHostStatus(dt: number) {
    if (this.gameMode !== 'team') return;

    // 1. Maintain Pus Pustules in the vascular system
    if (this.pusPustules.length < 22 && Math.random() < 0.25) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 350 + Math.random() * 2200;
      this.pusPustules.push({
        id: `pus-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        radius: 13 + Math.random() * 9,
        mass: 30,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 2 + Math.random() * 3,
        pulseTimer: 0,
      });
    }

    // Wobble animation
    for (const p of this.pusPustules) {
      p.wobble += p.wobbleSpeed * dt;
      p.pulseTimer += dt;
    }

    // 2. Collisions with player and bot organisms
    const allOrganisms: Organism[] = [];
    if (this.player && this.player.isAlive) allOrganisms.push(this.player);
    for (const b of this.bots) {
      if (b.isAlive) allOrganisms.push(b);
    }

    for (let i = this.pusPustules.length - 1; i >= 0; i--) {
      const pus = this.pusPustules[i];
      let consumed = false;

      for (const org of allOrganisms) {
        if (!org.isAlive) continue;
        for (const piece of org.pieces) {
          const d = Math.hypot(piece.x - pus.x, piece.y - pus.y);
          if (d < piece.radius + pus.radius) {
            consumed = true;

            if (org.faction === 'pathogen') {
              // Pathogen absorbs pus to grow and fuel infection
              piece.mass += 35;
              piece.targetRadius = GameEngine.massToRadius(piece.mass);
              this.hostStatus.pusLevel = Math.min(100, +(this.hostStatus.pusLevel + 2.5).toFixed(1));
              this.hostStatus.health = Math.max(0, +(this.hostStatus.health - 0.8).toFixed(1));

              if (org.isPlayer) {
                soundEngine.playEjectSpore();
                this.addFloatingText(pus.x, pus.y - 25, '+35 PUS (INFECCIÓN)', '#a3e635');
              }
            } else {
              // Immune cell phagocytoses & sanitizes pus
              this.hostStatus.health = Math.min(100, +(this.hostStatus.health + 3.0).toFixed(1));
              this.hostStatus.pusLevel = Math.max(0, +(this.hostStatus.pusLevel - 3.5).toFixed(1));
              this.hostStatus.temperature = Math.max(37.0, +(this.hostStatus.temperature - 0.1).toFixed(1));

              if (org.isPlayer) {
                soundEngine.playCollect();
                profileStorage.addCytes(5);
                this.addFloatingText(pus.x, pus.y - 25, '¡PUS SANADO! +3% SALUD (+5 Cytes)', '#22d3ee');
              }
            }

            // Burst bio pus particles
            for (let k = 0; k < 8; k++) {
              this.particles.push({
                x: pus.x,
                y: pus.y,
                vx: (Math.random() - 0.5) * 140,
                vy: (Math.random() - 0.5) * 140,
                radius: 3 + Math.random() * 3,
                color: org.faction === 'pathogen' ? '#a3e635' : '#38bdf8',
                alpha: 0.9,
                life: 0.5,
                maxLife: 0.5,
              });
            }
            break;
          }
        }
        if (consumed) break;
      }

      if (consumed) {
        this.pusPustules.splice(i, 1);
      }
    }

    // 3. Faction Dominance Pressure on Human Host
    const pathogenPct = this.calculateTeamPercentage('pathogen');
    const immunePct = this.calculateTeamPercentage('immune');

    if (pathogenPct > 50) {
      const delta = (pathogenPct - 50) * 0.02 * dt;
      this.hostStatus.health = Math.max(0, +(this.hostStatus.health - delta).toFixed(2));
    } else {
      const delta = (immunePct - 50) * 0.015 * dt;
      this.hostStatus.health = Math.min(100, +(this.hostStatus.health + delta).toFixed(2));
    }

    // 4. Update Host Telemetry based on health
    this.hostStatus.temperature = +(37.0 + (100 - this.hostStatus.health) * 0.042).toFixed(1);
    this.hostStatus.hydration = Math.max(20, Math.round(75 - (100 - this.hostStatus.health) * 0.45));
    this.hostStatus.energyATP = Math.max(10, Math.round(95 - (100 - this.hostStatus.health) * 0.65));

    // Dynamic symptoms
    const symptoms: string[] = [];
    if (this.hostStatus.pusLevel > 15) symptoms.push('symptomPurulentExudate');
    if (this.hostStatus.temperature >= 38.3) symptoms.push('symptomFeverPeak');
    if (this.hostStatus.health < 75) symptoms.push('symptomInflammation');
    if (this.hostStatus.health < 45) symptoms.push('symptomCytokineStorm');
    if (this.hostStatus.health < 25) symptoms.push('symptomCellNecrosis');
    if (this.hostStatus.health < 15) symptoms.push('symptomSepticShock');
    if (immunePct >= 65) symptoms.push('symptomImmuneSurge');
    this.hostStatus.activeSymptoms = symptoms;
  }

  // Render Battle Mode Pus Pustules on the canvas
  private renderPusPustules(ctx: CanvasRenderingContext2D) {
    if (this.gameMode !== 'team') return;
    for (const pus of this.pusPustules) {
      if (this.isOutsideViewport(pus.x, pus.y, pus.radius * 3)) continue;
      ctx.save();
      ctx.translate(pus.x, pus.y);
      const wobble = Math.sin(pus.wobble) * 2;
      const r = pus.radius + wobble;

      // Toxic viscous chartreuse halo
      ctx.shadowColor = '#84cc16';
      ctx.shadowBlur = 16;

      const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
      grad.addColorStop(0, '#fef08a'); // inner creamy pus center
      grad.addColorStop(0.5, '#a3e635'); // viscous lime pus
      grad.addColorStop(0.85, '#65a30d'); // dark biological exudate
      grad.addColorStop(1.0, 'rgba(101, 163, 13, 0)');

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Inner purulent vesicles
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.25, r * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(r * 0.35, r * 0.2, r * 0.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Render 4 Central Map Superpowers (Medicine Capsules / Pills)
  private renderSuperpowers(ctx: CanvasRenderingContext2D) {
    const time = performance.now() * 0.003;

    for (const sp of this.superpowers) {
      if (this.isOutsideViewport(sp.x, sp.y, sp.radius * 3.5)) continue;

      ctx.save();
      ctx.translate(sp.x, sp.y);

      if (sp.isAvailable) {
        const floatY = Math.sin(time * 2 + sp.x) * 6;
        ctx.translate(0, floatY);

        // 1. Radial glow halo
        const haloPulse = sp.radius * 1.8 + Math.sin(time * 3) * 6;
        const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, haloPulse);
        grad.addColorStop(0, sp.glowColor);
        grad.addColorStop(0.4, sp.color + '66');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(0, 0, haloPulse, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // 2. Rotating orbital energy ring
        ctx.save();
        ctx.rotate(sp.rotation);
        ctx.beginPath();
        ctx.arc(0, 0, sp.radius * 1.35, 0, Math.PI * 2);
        ctx.strokeStyle = sp.glowColor;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 8]);
        ctx.stroke();

        // Small orbital energy satellites
        for (let i = 0; i < 3; i++) {
          const orbAngle = (i / 3) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(
            Math.cos(orbAngle) * (sp.radius * 1.35),
            Math.sin(orbAngle) * (sp.radius * 1.35),
            3,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = sp.glowColor;
          ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.restore();

        // 3. Render 3D Pill / Medicine Capsule Shape (Tilted at -25 degrees)
        ctx.save();
        ctx.rotate(-0.4);

        const pillW = sp.radius * 1.9;
        const pillH = sp.radius * 0.95;
        const halfW = pillW / 2;
        const halfH = pillH / 2;

        // Shadow under capsule
        ctx.shadowColor = sp.glowColor;
        ctx.shadowBlur = 18;

        // Left Half of Capsule (Vibrant Theme Color)
        ctx.beginPath();
        ctx.arc(-halfW + halfH, 0, halfH, Math.PI * 0.5, Math.PI * 1.5);
        ctx.lineTo(0, -halfH);
        ctx.lineTo(0, halfH);
        ctx.closePath();
        ctx.fillStyle = sp.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();

        // Right Half of Capsule (Bright Medicine White)
        ctx.beginPath();
        ctx.arc(halfW - halfH, 0, halfH, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.lineTo(0, halfH);
        ctx.lineTo(0, -halfH);
        ctx.closePath();
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();

        // Capsule Center Seam
        ctx.beginPath();
        ctx.moveTo(0, -halfH);
        ctx.lineTo(0, halfH);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.stroke();

        // Specular highlight gloss across top
        ctx.beginPath();
        ctx.ellipse(-halfW * 0.3, -halfH * 0.45, halfW * 0.5, halfH * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();

        ctx.restore();

        // 4. Floating Name & 15s Duration Badge
        ctx.font = "800 11px 'Plus Jakarta Sans', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(sp.name.toUpperCase(), 0, -sp.radius - 16);

        ctx.font = "700 9px 'JetBrains Mono', monospace";
        ctx.fillStyle = sp.glowColor;
        ctx.fillText('15s SUPERPODER', 0, -sp.radius - 5);
      } else {
        // Holographic cooldown outline & ring
        ctx.beginPath();
        ctx.arc(0, 0, sp.radius * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Circular cooldown progress
        const cooldownProgress = (SUPERPOWER_RESPAWN_SEC - sp.respawnTimer) / SUPERPOWER_RESPAWN_SEC;
        ctx.beginPath();
        ctx.arc(0, 0, sp.radius * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cooldownProgress);
        ctx.strokeStyle = sp.glowColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Countdown text
        ctx.font = "700 11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`${Math.ceil(sp.respawnTimer)}s`, 0, 0);

        ctx.font = "600 9px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(sp.name, 0, sp.radius + 12);
      }

      ctx.restore();
    }
  }

  // Render soft-body undulating cellular microbe
  private renderOrganism(ctx: CanvasRenderingContext2D, org: Organism) {
    const time = performance.now() * 0.002;

    // 0. Mitotic Spindle Filaments connecting divided pieces
    if (org.pieces.length > 1) {
      ctx.save();
      for (let i = 0; i < org.pieces.length; i++) {
        for (let j = i + 1; j < org.pieces.length; j++) {
          const p1 = org.pieces[i];
          const p2 = org.pieces[j];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

          // Render connecting cytoplasmic bridge if close enough
          if (dist < (p1.radius + p2.radius) * 3.5) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            const midX = (p1.x + p2.x) / 2 + Math.sin(time * 3 + i) * 6;
            const midY = (p1.y + p2.y) / 2 + Math.cos(time * 3 + j) * 6;
            ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);

            const filamentAlpha = Math.max(0.15, Math.min(0.65, 1 - dist / ((p1.radius + p2.radius) * 3.5)));
            ctx.strokeStyle = org.ciliaColor;
            ctx.globalAlpha = filamentAlpha;
            ctx.lineWidth = Math.max(2, (p1.radius + p2.radius) * 0.035);
            ctx.stroke();

            // Glowing cytoplasmic vesicles along bridge
            ctx.beginPath();
            ctx.arc(midX, midY, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    for (const piece of org.pieces) {
      if (this.isOutsideViewport(piece.x, piece.y, piece.radius * 3)) continue;

      // Draw Remerge Cooldown Ring if split
      if (piece.remergeTimer > 0) {
        ctx.save();
        ctx.translate(piece.x, piece.y);

        const totalTime = Math.max(0.1, piece.totalRemergeTime || 14);
        const progress = Math.min(1, Math.max(0, piece.remergeTimer / totalTime));
        const ringRadius = piece.radius + 12;

        // Background dashed guide ring
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Active progress arc
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress, false);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([]);
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Countdown second badge above cell
        ctx.font = "700 11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = '#6ee7b7';
        ctx.shadowBlur = 4;
        ctx.fillText(`${Math.ceil(piece.remergeTimer)}s`, 0, -ringRadius - 6);

        ctx.restore();
      }

      ctx.save();
      ctx.translate(piece.x, piece.y);

      // 1. Render undulating cilia / flagella hair tentacles behind cell
      const headingAngle = Math.atan2(org.targetHeading.y, org.targetHeading.x);
      const tailAngle = headingAngle + Math.PI;

      ctx.strokeStyle = org.ciliaColor;
      ctx.lineWidth = Math.max(2, piece.radius * 0.045);
      ctx.lineCap = 'round';

      const ciliaCount = 9;
      for (let i = 0; i < ciliaCount; i++) {
        const spread = (i - (ciliaCount - 1) / 2) * 0.22;
        const currentAngle = tailAngle + spread;
        const rootX = Math.cos(currentAngle) * (piece.radius * 0.85);
        const rootY = Math.sin(currentAngle) * (piece.radius * 0.85);

        const tentacleLen = piece.radius * (0.65 + Math.sin(time * 3 + i) * 0.15);
        const wave = Math.sin(time * 5 + i * 1.2) * (piece.radius * 0.25);

        const tipX = rootX + Math.cos(currentAngle) * tentacleLen - Math.sin(currentAngle) * wave;
        const tipY = rootY + Math.sin(currentAngle) * tentacleLen + Math.cos(currentAngle) * wave;

        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.quadraticCurveTo(
          rootX + (tipX - rootX) * 0.5 + Math.sin(time * 4) * 5,
          rootY + (tipY - rootY) * 0.5 + Math.cos(time * 4) * 5,
          tipX,
          tipY
        );
        ctx.stroke();
      }

      // 2. Soft-Body Cell Membrane (16 wobbly vertices with smooth curves)
      const vertexCount = piece.wobbleOffsets.length;
      ctx.beginPath();

      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < vertexCount; i++) {
        const angle = (i / vertexCount) * Math.PI * 2;
        // Directional squish/stretch along velocity
        const speed = Math.hypot(piece.vx, piece.vy);
        const velocityAlignment = Math.cos(angle - headingAngle);
        const stretch = 1 + (speed / 400) * velocityAlignment * 0.12;

        const r = (piece.radius + piece.wobbleOffsets[i]) * stretch;
        points.push({
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
        });
      }

      // Curve through points
      ctx.moveTo((points[0].x + points[vertexCount - 1].x) / 2, (points[0].y + points[vertexCount - 1].y) / 2);
      for (let i = 0; i < vertexCount; i++) {
        const next = points[(i + 1) % vertexCount];
        const midX = (points[i].x + next.x) / 2;
        const midY = (points[i].y + next.y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }
      ctx.closePath();

      // Organic Cytoplasm Fill Gradient
      const cytoGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, piece.radius);
      cytoGrad.addColorStop(0, org.ciliaColor); // Bright inner glow
      cytoGrad.addColorStop(0.65, org.color); // Rich body
      cytoGrad.addColorStop(1, org.secondaryColor); // Membrane edge
      ctx.fillStyle = cytoGrad;
      ctx.fill();

      // Glowing bioluminescent outer lipid bilayer membrane
      ctx.lineWidth = Math.max(3, piece.radius * 0.08);
      ctx.strokeStyle = org.ciliaColor;
      ctx.shadowColor = org.color;
      ctx.shadowBlur = org.isPlayer ? 18 : 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Inner Cellular Organelles: Nucleus & Mitochondria
      const nucleusRadius = piece.radius * 0.28;
      ctx.beginPath();
      ctx.arc(piece.radius * 0.08, -piece.radius * 0.08, nucleusRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fill();

      // Chromatin dense core
      ctx.beginPath();
      ctx.arc(piece.radius * 0.08, -piece.radius * 0.08, nucleusRadius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();

      // Player special crown/ring indicator
      if (org.isPlayer) {
        ctx.beginPath();
        ctx.arc(0, 0, piece.radius * 0.95, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();

      // 4. Render Microbe Name & Mass Tag
      ctx.save();
      ctx.translate(piece.x, piece.y);

      const fontSize = Math.max(12, Math.min(22, piece.radius * 0.35));
      ctx.font = `700 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text stroke for high contrast readability
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.strokeText(org.name, 0, 0);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(org.name, 0, 0);

      // Mass numeral underneath
      const massFontSize = Math.max(10, Math.min(16, fontSize * 0.8));
      ctx.strokeText(Math.round(piece.mass).toString(), 0, fontSize * 0.9);
      ctx.fillStyle = '#fde047';
      ctx.fillText(Math.round(piece.mass).toString(), 0, fontSize * 0.9);

      // 5. Royal Crown floating above leader cell (Grand scaled crown for the biggest microbe)
      if (org.hasCrown && piece === org.pieces[0]) {
        const crownScale = Math.max(1.15, Math.min(2.5, piece.radius / 30));
        const crownY = -piece.radius - (22 * crownScale) + Math.sin(performance.now() * 0.0035) * 4;
        ctx.save();
        ctx.translate(0, crownY);
        ctx.scale(crownScale, crownScale);

        let crownGlow = '#f59e0b';
        let crownFill = '#fbbf24';
        let crownStroke = '#fef08a';
        if (org.crownType === 'immune') {
          crownGlow = '#06b6d4';
          crownFill = '#38bdf8';
          crownStroke = '#e0f2fe';
        } else if (org.crownType === 'pathogen') {
          crownGlow = '#e11d48';
          crownFill = '#f43f5e';
          crownStroke = '#ffe4e6';
        }

        ctx.shadowColor = crownGlow;
        ctx.shadowBlur = 14;

        // 5-Pointed Royal Crown
        ctx.beginPath();
        ctx.moveTo(-16, 7);
        ctx.lineTo(-20, -7);
        ctx.lineTo(-10, -2);
        ctx.lineTo(0, -14);
        ctx.lineTo(10, -2);
        ctx.lineTo(20, -7);
        ctx.lineTo(16, 7);
        ctx.closePath();
        ctx.fillStyle = crownFill;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = crownStroke;
        ctx.stroke();

        // Crown Jewels / Pearls
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-20, -7, 2.5, 0, Math.PI * 2);
        ctx.arc(0, -14, 3, 0, Math.PI * 2);
        ctx.arc(20, -7, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 6. Active Superpower Bioluminescent Visual Aura around player cell
      if (org.isPlayer && this.activeSuperpower) {
        ctx.save();
        const superTime = performance.now() * 0.004;

        if (this.activeSuperpower.type === 'shield_capsule') {
          // Emerald Forcefield Barrier
          const shieldRadius = piece.radius * 1.25 + Math.sin(superTime * 4) * 4;
          ctx.beginPath();
          ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 18;
          ctx.stroke();

          // Hexagonal forcefield shield segments
          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const sAngle = (s / 6) * Math.PI * 2 + superTime;
            const sx = Math.cos(sAngle) * shieldRadius;
            const sy = Math.sin(sAngle) * shieldRadius;
            if (s === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (this.activeSuperpower.type === 'magnet_pill') {
          // Cyan Magnetic Flux Whirlpool
          const ringR = piece.radius * 1.35 + Math.sin(superTime * 3) * 5;
          ctx.beginPath();
          ctx.arc(0, 0, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 8]);
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 14;
          ctx.stroke();
        } else if (this.activeSuperpower.type === 'speed_capsule') {
          // Amber Sonic Speed Streaks
          const speedR = piece.radius * 1.2;
          ctx.beginPath();
          ctx.arc(0, 0, speedR, 0, Math.PI * 2);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 20;
          ctx.stroke();
        } else if (this.activeSuperpower.type === 'toxic_nanobot') {
          // Magenta Acidic Pulse Aura
          const toxicR = piece.radius * 1.28 + Math.sin(superTime * 6) * 5;
          ctx.beginPath();
          ctx.arc(0, 0, toxicR, 0, Math.PI * 2);
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 6]);
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 16;
          ctx.stroke();
        } else if (this.activeSuperpower.type === 'mega_shield') {
          // Sapphire Plasma Mega-Shield Barrier
          const megaR = piece.radius * 1.35 + Math.sin(superTime * 3) * 6;
          ctx.beginPath();
          ctx.arc(0, 0, megaR, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 25;
          ctx.stroke();
          // Hexagon shield matrix
          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const sAngle = (s / 6) * Math.PI * 2 - superTime * 0.8;
            const sx = Math.cos(sAngle) * megaR;
            const sy = Math.sin(sAngle) * megaR;
            if (s === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (this.activeSuperpower.type === 'growth_serum') {
          // Golden Titan Solar Halo
          const titanR = piece.radius * 1.25 + Math.sin(superTime * 5) * 5;
          ctx.beginPath();
          ctx.arc(0, 0, titanR, 0, Math.PI * 2);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ca8a04';
          ctx.shadowBlur = 22;
          ctx.stroke();
        } else if (this.activeSuperpower.type === 'frost_blast') {
          // Crystalline Glacial Frost Aura
          const frostR = piece.radius * 1.3 + Math.sin(superTime * 4) * 4;
          ctx.beginPath();
          ctx.arc(0, 0, frostR, 0, Math.PI * 2);
          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([3, 5]);
          ctx.shadowColor = '#0ea5e9';
          ctx.shadowBlur = 18;
          ctx.stroke();
        } else if (this.activeSuperpower.type === 'cloaking_ghost') {
          // Violet Ghost Phasing Ring
          const ghostR = piece.radius * 1.22 + Math.sin(superTime * 2.5) * 6;
          ctx.beginPath();
          ctx.arc(0, 0, ghostR, 0, Math.PI * 2);
          ctx.strokeStyle = '#c4b5fd';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);
          ctx.shadowColor = '#8b5cf6';
          ctx.shadowBlur = 20;
          ctx.stroke();
        } else if (this.activeSuperpower.type === 'quantum_fission') {
          // Teal Atomic Mitosis Orbital Rings
          const quantR = piece.radius * 1.26;
          ctx.save();
          ctx.rotate(superTime * 2);
          ctx.beginPath();
          ctx.ellipse(0, 0, quantR * 1.2, quantR * 0.7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = '#5eead4';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#14b8a6';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      }

      ctx.restore();
    }
  }

  // Render Patrol Antibodies (The Immune System Threat)
  private renderAntibodies(ctx: CanvasRenderingContext2D) {
    const time = performance.now() * 0.003;

    for (const ab of this.antibodies) {
      if (this.isOutsideViewport(ab.x, ab.y, ab.radius * 3)) continue;

      ctx.save();
      ctx.translate(ab.x, ab.y);

      // Alert Warning Radar Ring when on high alert
      if (ab.alertLevel > 0.05) {
        ctx.save();
        ctx.beginPath();
        const pulse = (Math.sin(time * 6) + 1) * 0.5;
        ctx.arc(0, 0, ab.radius * 1.8 + pulse * 18, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${ab.alertLevel * 0.8})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.restore();
      }

      ctx.rotate(ab.rotation);

      // Draw Thorny Spikes around perimeter
      ctx.fillStyle = ab.alertLevel > 0.4 ? '#ef4444' : '#64748b'; // Red alert vs slate security
      for (let i = 0; i < ab.spikeCount; i++) {
        const angle = (i / ab.spikeCount) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(ab.radius * 0.7, -ab.radius * 0.16);
        ctx.lineTo(ab.radius * 1.45, 0);
        ctx.lineTo(ab.radius * 0.7, ab.radius * 0.16);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Outer Biomechanical Shell
      ctx.beginPath();
      ctx.arc(0, 0, ab.radius * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = ab.alertLevel > 0.4 ? '#f87171' : '#94a3b8';
      ctx.stroke();

      // Central Bio-Core / Glowing Red Surveillance Eye
      ctx.beginPath();
      ctx.arc(0, 0, ab.radius * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = ab.alertLevel > 0.3 ? '#dc2626' : '#475569';
      ctx.shadowColor = ab.alertLevel > 0.3 ? '#ef4444' : 'transparent';
      ctx.shadowBlur = 15;
      ctx.fill();

      // Scanner slit
      ctx.beginPath();
      ctx.arc(0, 0, ab.radius * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();

      // Draw targeting laser line if locked onto an oversized mite
      if (ab.targetOrganismId && ab.alertLevel > 0.5) {
        const targetOrg = this.player?.id === ab.targetOrganismId ? this.player : this.bots.find((b) => b.id === ab.targetOrganismId);
        if (targetOrg && targetOrg.pieces.length > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(ab.x, ab.y);
          ctx.lineTo(targetOrg.pieces[0].x, targetOrg.pieces[0].y);
          ctx.strokeStyle = `rgba(239, 68, 68, ${ab.alertLevel * 0.6})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.restore();
    }
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 16px 'Plus Jakarta Sans', sans-serif`;

    for (const t of this.floatingTexts) {
      ctx.globalAlpha = t.alpha;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }

  // Frustum culling helper
  private isOutsideViewport(x: number, y: number, margin: number): boolean {
    const halfW = (this.canvas.width / 2) / this.cameraZoom + margin;
    const halfH = (this.canvas.height / 2) / this.cameraZoom + margin;
    return (
      x < this.cameraX - halfW ||
      x > this.cameraX + halfW ||
      y < this.cameraY - halfH ||
      y > this.cameraY + halfH
    );
  }
}
