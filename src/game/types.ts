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
  // Bot AI specific fields
  aiPersonality?: 'aggressive' | 'scavenger' | 'balanced' | 'cautious';
  aiDecisionTimer?: number;
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
}
