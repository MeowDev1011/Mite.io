// Game Types and Interfaces for Mite.io

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface Vector2D {
  x: number;
  y: number;
}

export type MutationId = 
  | 'flagella_boost'
  | 'rapid_fission'
  | 'erythrocyte_affinity'
  | 'toxic_spores'
  | 'antibody_cloak'
  | 'dense_membrane';

export interface Mutation {
  id: MutationId;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

// A single physical cell node of a player or bot microbe
export interface CellPiece {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  targetRadius: number;
  radius: number;
  remergeTimer: number; // Seconds until it can recombine with other cells of same owner
  totalRemergeTime: number; // Initial cooldown duration for progress ring
  wobbleOffsets: number[]; // Smooth organic membrane ripple vertices
  wobbleSpeed: number;
  impulseX: number; // High speed ejection decay
  impulseY: number;
}

export type GameMode = 'ffa' | 'team';
export type Faction = 'immune' | 'pathogen';

export interface Organism {
  id: string;
  name: string;
  isPlayer: boolean;
  color: string;
  secondaryColor: string;
  ciliaColor: string;
  pieces: CellPiece[];
  targetHeading: Vector2D;
  speedMultiplier: number;
  mutations: Set<MutationId>;
  isAlive: boolean;
  score: number;
  kills: number;
  mode?: GameMode;
  faction?: Faction;
  hasCrown?: boolean;
  crownType?: 'gold' | 'immune' | 'pathogen';
  // Bot AI specific fields
  aiPersonality?:
    | 'sniper'
    | 'zigzagger'
    | 'opportunist'
    | 'hormone_hunter'
    | 'farmer'
    | 'baiter'
    | 'casual'
    | 'aggressive'
    | 'scavenger'
    | 'balanced'
    | 'cautious';
  aiDecisionTimer?: number;
  aiWeavePhase?: number;
  aiWeaveFreq?: number;
  aiWeaveAmp?: number;
  aiPreferredOrganIdx?: number;
}

export interface Protein {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  mass: number;
  vx: number;
  vy: number;
}

export interface RedBloodCell {
  id: string;
  x: number;
  y: number;
  radius: number;
  mass: number;
  rotation: number;
  rotationSpeed: number;
  vx: number;
  vy: number;
  biconcaveScale: number;
}

export interface EjectedSpore {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
  isToxic?: boolean;
  lifespan: number;
}

export interface AntibodyPatrol {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  radius: number;
  spikeCount: number;
  rotation: number;
  rotationSpeed: number;
  patrolAngle: number;
  patrolCenter: Vector2D;
  targetOrganismId: string | null;
  alertLevel: number; // 0 to 1 (triggers siren and red radar glow)
  laserCooldown: number;
}

export interface BiologicalParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  mass: number;
  isPlayer: boolean;
  faction?: Faction;
  hasCrown?: boolean;
  crownType?: 'gold' | 'immune' | 'pathogen';
  isDev?: boolean;
  devBadge?: {
    isDev?: boolean;
    title?: string;
    enabled?: boolean;
    label?: string;
    color: string;
    iconPreset1?: string;
    iconPreset2?: string;
    customSvg1?: string;
    customSvg2?: string;
    svgPreset?: string;
    customSvgPath?: string;
    customSvgCode?: string;
  } | null;
}

export interface GameStats {
  currentMass: number;
  peakMass: number;
  rank: number;
  totalMicrobes: number;
  cellsCount: number;
  proteinsEaten: number;
  redCellsEaten: number;
  rivalsEaten: number;
  timeAliveSec: number;
  causeOfDeath: string;
  canConquer?: boolean;
  conqueredOrgansCount?: number;
  immunePercentage?: number;
  pathogenPercentage?: number;
  gameMode?: GameMode;
  playerFaction?: Faction;
  activeSuperpower?: ActiveSuperpower | null;
  activeHormoneBuff?: ActiveHormoneBuff | null;
  hostStatus?: HostHumanStatus;
}

export type MedicalTreatmentType =
  | 'antibiotic'      // Antibiótico Amoxicilina IV
  | 'analgesic'       // Analgésico Ibuprofeno
  | 'vaccine'         // Vacuna ARNm Inmunizante
  | 'antiviral_pill'  // Pastilla Antiviral
  | 'iv_serum'        // Suero Electrolítico IV
  | 'antipyretic';    // Antipirético Metamizol

export interface ActiveMedicalTreatment {
  type: MedicalTreatmentType;
  name: string;
  clinicalEffect: string;
  color: string;
  remainingTime: number;
  totalDuration: number;
}

export interface MedicalTreatmentEntity {
  id: string;
  type: MedicalTreatmentType;
  name: string;
  clinicalEffect: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  pillColorA: string;
  pillColorB: string;
  symbol: string;
  respawnTimer: number;
  isAvailable: boolean;
  rotation: number;
}

export interface ActiveHormoneBuff {
  type: HormoneType;
  name: string;
  symbol: string;
  effectDesc: string;
  color: string;
  remainingTime: number;
  totalDuration: number;
}

export interface HostHumanStatus {
  health: number; // 0 to 100%
  temperature: number; // e.g. 36.8 to 41.2 °C
  hydration: number; // e.g. 40 to 75%
  energyATP: number; // e.g. 30 to 95%
  pusLevel: number; // e.g. 0 to 100 ml de pus/exudado purulento
  activeSymptoms: string[];
  activeTreatment?: ActiveMedicalTreatment | null;
  treatmentsAdministered?: number;
}

export type SuperpowerType =
  | 'magnet_pill'      // Mega-atracción de nutrientes (15s)
  | 'speed_capsule'    // Hiper-velocidad & fisión instantánea (15s)
  | 'shield_capsule'   // Escudo inmunológico e invulnerabilidad (15s)
  | 'toxic_nanobot'    // Fisión lítica & choque ácido contra rivales (15s)
  | 'mega_shield'      // Mega-Escudo de Plasma & Regeneración Continua (15s)
  | 'growth_serum'     // Suero de Hiper-Crecimiento x3 & Aura Titán (15s)
  | 'frost_blast'      // Crio-Espora Glacial & Ralentización Masiva (15s)
  | 'cloaking_ghost'   // Camuflaje Bio-Fantasma & Evasión de Anticuerpos (15s)
  | 'quantum_fission'; // Fisión Cuántica Instantánea & Remitosis Cero (15s);

export interface SuperpowerEntity {
  id: string;
  type: SuperpowerType;
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  name: string;
  desc: string;
  rotation: number;
  respawnTimer: number;
  isAvailable: boolean;
}

export interface ActiveSuperpower {
  type: SuperpowerType;
  name: string;
  desc: string;
  color: string;
  remainingTime: number; // in seconds (starts at 15.0)
  totalDuration: number; // 15.0
}

export interface PlayerUpgrades {
  attraction: number;    // Level 0 - 1500 (Atracción Magnética)
  speed: number;         // Level 0 - 1500 (Velocidad e Hidrodinámica)
  armor: number;         // Level 0 - 1500 (Armadura Inmunológica)
  metabolism: number;    // Level 0 - 1500 (Metabolismo y Digestión)
  sporesFission: number; // Level 0 - 1500 (Capacidad de Esporas y Fisión Mitótica)
  fissionBlast?: number;
  cyteHarvest?: number;
}

export interface TacticalBooster {
  id: string;
  name: string;
  description: string;
  effect: string;
  priceCytes: number;
  durationLabel: string;
  iconName: string;
  themeColor: string;
}

export type HormoneType =
  | 'adrenaline'       // Adrenalina (Epinefrina) - +65% velocidad explosiva y alerta
  | 'noradrenaline'    // Noradrenalina - Impulso de fisión balística y enfoque
  | 'insulin'          // Insulina - Absorción acelerada de glucosa (+45 Masa inmediata)
  | 'glucagon'         // Glucagón - Liberación glucogénica (+35 Masa +Velocidad)
  | 'somatotropin_gh'  // Somatotropina (GH Hormona del Crecimiento) - +60 Masa celular
  | 'melatonin'        // Melatonina - Camuflaje pineal calmante (reduce alerta de anticuerpos)
  | 'thyroxine_t4'     // Tiroxina (T4 Tiroidea) - +50% Metabolismo digestivo por 12s
  | 'cortisol'         // Cortisol - Escudo anti-estrés de membrana (+Resistencia)
  | 'dopamine'         // Dopamina - Euforia sináptica (+Velocidad y +12 Cytes)
  | 'serotonin'        // Serotonina - Armonía celular (Recombinación rápida de células)
  | 'oxytocin'         // Oxitocina - Regeneración vascular (+40 Masa y +10 Cytes)
  | 'erythropoietin';  // Eritropoyetina (EPO Renal) - Síntesis de glóbulos rojos (+20 Cytes y +30 Masa)

export interface HormoneEntity {
  id: string;
  type: HormoneType;
  name: string;
  organOrigin: string;
  effectDesc: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  symbol: string;
  massBonus: number;
  cytesBonus: number;
  speedBoost?: number;
  respawnTimer: number;
  isAvailable: boolean;
  pulsePhase: number;
}

export interface EndocrineBarZone {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
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
  isDev?: boolean;
  devBadge?: {
    enabled?: boolean;
    title?: string;
    label?: string;
    color: string;
    svgPreset?: string;
    iconPreset1?: string;
    iconPreset2?: string;
    customSvg1?: string;
    customSvg2?: string;
    customSvgPath?: string;
    customSvgCode?: string;
  } | null;
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

