// World map dimensions (Human body vascular anatomy)
import { Mutation } from './types';

export const WORLD_RADIUS = 2800; // 5600px full body circulation
export const WORLD_CENTER_X = 0;
export const WORLD_CENTER_Y = 0;

// Anatomical Organs of the Human Body
export interface OrganZone {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  description: string;
  nutrientBonus: number;
}

export const ANATOMICAL_ORGANS: OrganZone[] = [
  {
    id: 'brain',
    name: 'Cerebro',
    x: 0,
    y: -1900,
    radius: 650,
    color: '#8b5cf6',
    glowColor: '#a78bfa',
    description: 'Sinapsis neurales y líquido cefalorraquídeo. Velocidad aumentada.',
    nutrientBonus: 1.2,
  },
  {
    id: 'heart',
    name: 'Corazón (Aorta)',
    x: 0,
    y: -400,
    radius: 540,
    color: '#ef4444',
    glowColor: '#f87171',
    description: 'Bomba central de alta presión. Densas concentraciones de glóbulos rojos.',
    nutrientBonus: 1.5,
  },
  {
    id: 'left_lung',
    name: 'Pulmón Izquierdo',
    x: -650,
    y: -950,
    radius: 460,
    color: '#06b6d4',
    glowColor: '#38bdf8',
    description: 'Alvéolos oxigenados. Movimiento suave y plasma límpido.',
    nutrientBonus: 1.1,
  },
  {
    id: 'right_lung',
    name: 'Pulmón Derecho',
    x: 650,
    y: -950,
    radius: 460,
    color: '#06b6d4',
    glowColor: '#38bdf8',
    description: 'Alvéolos oxigenados. Movimiento suave y plasma límpido.',
    nutrientBonus: 1.1,
  },
  {
    id: 'liver',
    name: 'Hígado',
    x: 550,
    y: 350,
    radius: 540,
    color: '#d97706',
    glowColor: '#fbbf24',
    description: 'Reserva de glucógeno y proteínas metabólicas abundantes.',
    nutrientBonus: 1.6,
  },
  {
    id: 'stomach',
    name: 'Estómago e Intestino',
    x: -450,
    y: 500,
    radius: 560,
    color: '#10b981',
    glowColor: '#34d399',
    description: 'Área rica en aminoácidos y nutrientes absorbidos.',
    nutrientBonus: 1.4,
  },
  {
    id: 'kidneys',
    name: 'Riñones',
    x: 0,
    y: 1300,
    radius: 520,
    color: '#e11d48',
    glowColor: '#fb7185',
    description: 'Filtración celular y depuración de toxinas.',
    nutrientBonus: 1.2,
  },
  {
    id: 'femoral',
    name: 'Vasos Femorales',
    x: 0,
    y: 2250,
    radius: 480,
    color: '#be123c',
    glowColor: '#f43f5e',
    description: 'Extremidades y válvulas venosas profundas.',
    nutrientBonus: 1.0,
  },
];

// Secret Zone: Lymphatic Crypt (hidden near vascular wall valve)
export const SECRET_ZONE_X = -WORLD_RADIUS * 0.65;
export const SECRET_ZONE_Y = WORLD_RADIUS * 0.55;
export const SECRET_ZONE_RADIUS = 360;

// Food & entities counts
export const PROTEIN_COUNT = 900;
export const RED_BLOOD_CELL_COUNT = 75;
export const ANTIBODY_COUNT = 14;
export const BOT_COUNT = 20;

// Mass & size physics
export const MIN_START_MASS = 18;
export const RADIUS_SCALE = 4.4; // radius = Math.sqrt(mass) * RADIUS_SCALE
export const BASE_SPEED = 280;
export const SPEED_MASS_EXPONENT = 0.38; // Larger cells are slower
export const MIN_SPLIT_MASS = 36; // Minimum mass required to split into two
export const MAX_CELLS_PER_ORGANISM = 8;
export const SPLIT_IMPULSE = 680;
export const REMERGE_BASE_TIME = 14; // Seconds before pieces can recombine
export const EJECT_MASS_COST = 8;
export const EJECT_IMPULSE = 550;

// Antibody Patrol balance rules
export const ANTIBODY_DETECTION_MASS = 160; // When a mite gets bigger than this, antibodies home in!
export const ANTIBODY_BASE_SPEED = 195;
export const ANTIBODY_HUNT_SPEED = 245;
export const ANTIBODY_DAMAGE_RATIO = 0.35; // Cuts mass by 35% on collision and splits violently

// Color palettes for vascular biological aesthetic
export const PROTEIN_COLORS = [
  '#38bdf8', // Light sky blue
  '#34d399', // Emerald glucose
  '#f59e0b', // Amber lipid
  '#fb7185', // Coral amino
  '#a78bfa', // Bioluminescent violet
  '#facc15', // Gold nutrient
];

// Available mutations unlocked by mass milestones
export const MUTATION_DEFINITIONS: Mutation[] = [
  {
    id: 'flagella_boost',
    name: 'Flagelos Hiperactivos',
    description: '+18% velocidad de nado en el plasma sanguíneo.',
    icon: 'zap',
    unlocked: false,
  },
  {
    id: 'rapid_fission',
    name: 'Fisión Acelerada',
    description: 'Tus células divididas se reunifican un 40% más rápido.',
    icon: 'dna',
    unlocked: false,
  },
  {
    id: 'erythrocyte_affinity',
    name: 'Lisis de Glóbulos Rojos',
    description: 'Absorbé 30% más masa al devorar glóbulos rojos.',
    icon: 'blood',
    unlocked: false,
  },
  {
    id: 'toxic_spores',
    name: 'Esporas Inhibidoras',
    description: 'Tus esporas eyectadas ralentizan a los rivales que las toquen.',
    icon: 'biohazard',
    unlocked: false,
  },
  {
    id: 'antibody_cloak',
    name: 'Camuflaje Lipídico',
    description: 'Los Anticuerpos necesitan 50% más de masa para detectarte.',
    icon: 'shield',
    unlocked: false,
  },
  {
    id: 'dense_membrane',
    name: 'Membrana Tenaz',
    description: 'Menor retroceso y un 25% menos de pérdida de masa al chocar.',
    icon: 'diamond',
    unlocked: false,
  },
];
