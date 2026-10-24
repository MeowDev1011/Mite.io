// World map dimensions (Human body vascular anatomy)
import { Mutation, SuperpowerType, HormoneType, EndocrineBarZone, MedicalTreatmentType } from './types';

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
  // Body 1 (Left: Anterior - Circulation & Digestion, Center X = -1050)
  {
    id: 'brain',
    name: 'Cerebro (Hemisferio Anterior)',
    x: -1050,
    y: -1900,
    radius: 550,
    color: '#8b5cf6',
    glowColor: '#a78bfa',
    description: 'Sinapsis neurales y líquido cefalorraquídeo frontal. +15% velocidad.',
    nutrientBonus: 1.2,
  },
  {
    id: 'heart',
    name: 'Corazón (Aorta)',
    x: -1050,
    y: -400,
    radius: 540,
    color: '#ef4444',
    glowColor: '#f87171',
    description: 'Bomba central de alta presión. Densas concentraciones de glóbulos rojos.',
    nutrientBonus: 1.5,
  },
  {
    id: 'left_lung',
    name: 'Pulmones (Alvéolos)',
    x: -1450,
    y: -750,
    radius: 460,
    color: '#06b6d4',
    glowColor: '#38bdf8',
    description: 'Red alveolar oxigenada y plasma fluido de alta oxigenación.',
    nutrientBonus: 1.1,
  },
  {
    id: 'liver',
    name: 'Hígado (Metabolismo)',
    x: -750,
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
    x: -1250,
    y: 550,
    radius: 520,
    color: '#10b981',
    glowColor: '#34d399',
    description: 'Área rica en aminoácidos y nutrientes absorbidos.',
    nutrientBonus: 1.4,
  },
  {
    id: 'kidneys',
    name: 'Riñones (Filtración)',
    x: -1050,
    y: 1250,
    radius: 480,
    color: '#e11d48',
    glowColor: '#fb7185',
    description: 'Filtración celular y depuración de toxinas en la nefrona.',
    nutrientBonus: 1.2,
  },
  {
    id: 'femoral',
    name: 'Vasos Femorales',
    x: -1050,
    y: 2250,
    radius: 480,
    color: '#be123c',
    glowColor: '#f43f5e',
    description: 'Extremidades y válvulas venosas profundas.',
    nutrientBonus: 1.0,
  },

  // Body 2 (Right: Posterior - Immune & Lymphatic System, Center X = +1050)
  {
    id: 'cerebellum',
    name: 'Cerebelo & Médula Espinal',
    x: 1050,
    y: -1900,
    radius: 550,
    color: '#6366f1',
    glowColor: '#818cf8',
    description: 'Centro de control postural dorsal y columna vertebral.',
    nutrientBonus: 1.2,
  },
  {
    id: 'thymus',
    name: 'Timo & Nódulos Torácicos',
    x: 1050,
    y: -400,
    radius: 520,
    color: '#3b82f6',
    glowColor: '#60a5fa',
    description: 'Maduración de linfocitos T y vigilancia inmunológica activa.',
    nutrientBonus: 1.4,
  },
  {
    id: 'spleen',
    name: 'Bazo (Filtro Linfático)',
    x: 1450,
    y: 250,
    radius: 500,
    color: '#a855f7',
    glowColor: '#c084fc',
    description: 'Cementerio de eritrocitos y reserva concentrada de macrófagos.',
    nutrientBonus: 1.5,
  },
  {
    id: 'lymph_nodes',
    name: 'Ganglios Linfáticos Lumbares',
    x: 1050,
    y: 1100,
    radius: 480,
    color: '#14b8a6',
    glowColor: '#2dd4bf',
    description: 'Filtro linfa dorsal y barrera contra patógenos invasores.',
    nutrientBonus: 1.3,
  },
  {
    id: 'dorsal_popliteal',
    name: 'Vasos Poplíteos Dorsales',
    x: 1050,
    y: 2250,
    radius: 480,
    color: '#9333ea',
    glowColor: '#c084fc',
    description: 'Red venosa dorsal y retorno circulatorio de extremidades.',
    nutrientBonus: 1.1,
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
export const BOT_COUNT = 100; // Minimum 100 bots active in the bloodstream

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

// Superpowers in the Middle of the Map (10s duration)
export const SUPERPOWER_DURATION_SEC = 10;
export const SUPERPOWER_RESPAWN_SEC = 20;

export interface SuperpowerConfig {
  type: SuperpowerType;
  name: string;
  desc: string;
  color: string;
  glowColor: string;
  pillColorA: string;
  pillColorB: string;
}

export const SUPERPOWER_DEFS: Record<SuperpowerType, SuperpowerConfig> = {
  magnet_pill: {
    type: 'magnet_pill',
    name: 'Pastilla Hiper-Atracción',
    desc: 'Mega-imán celular: absorbe nutrientes y proteínas desde enorme distancia por 10s.',
    color: '#06b6d4',
    glowColor: '#22d3ee',
    pillColorA: '#0891b2',
    pillColorB: '#67e8f9',
  },
  speed_capsule: {
    type: 'speed_capsule',
    name: 'Ampolla de Adrenalina',
    desc: 'Impulso turbo: +85% de velocidad y fisión acelerada instantánea por 10s.',
    color: '#eab308',
    glowColor: '#facc15',
    pillColorA: '#ca8a04',
    pillColorB: '#fef08a',
  },
  shield_capsule: {
    type: 'shield_capsule',
    name: 'Cápsula Escudo Inmune',
    desc: 'Blindaje plasmático: invulnerable ante anticuerpos y microbios gigantes por 10s.',
    color: '#10b981',
    glowColor: '#34d399',
    pillColorA: '#059669',
    pillColorB: '#a7f3d0',
  },
  toxic_nanobot: {
    type: 'toxic_nanobot',
    name: 'Nanobot Lítico Viral',
    desc: 'Descarga lítica: pulsos de bio-ácido que debilitan y encogen a los rivales por 10s.',
    color: '#ec4899',
    glowColor: '#f472b6',
    pillColorA: '#db2777',
    pillColorB: '#fbcfe8',
  },
  mega_shield: {
    type: 'mega_shield',
    name: 'Burbuja Mega-Escudo',
    desc: 'Escudo impenetrable de plasma: 100% invulnerable y regenera +4 masa/seg por 15s.',
    color: '#0284c7',
    glowColor: '#38bdf8',
    pillColorA: '#0369a1',
    pillColorB: '#bae6fd',
  },
  growth_serum: {
    type: 'growth_serum',
    name: 'Suero Hiper-Crecimiento',
    desc: 'Metabolismo de Titán: 2.8x ganancia de masa de nutrientes y tamaño aumentado por 15s.',
    color: '#ca8a04',
    glowColor: '#facc15',
    pillColorA: '#a16207',
    pillColorB: '#fef08a',
  },
  frost_blast: {
    type: 'frost_blast',
    name: 'Crio-Espora Glacial',
    desc: 'Vórtice bajo cero: congela el plasma y ralentiza un 70% a rivales y anticuerpos por 15s.',
    color: '#0ea5e9',
    glowColor: '#7dd3fc',
    pillColorA: '#0284c7',
    pillColorB: '#e0f2fe',
  },
  cloaking_ghost: {
    type: 'cloaking_ghost',
    name: 'Camuflaje Bio-Fantasma',
    desc: 'Invisibilidad celular: membrana translúcida que evade el rastreo de anticuerpos por 15s.',
    color: '#8b5cf6',
    glowColor: '#c4b5fd',
    pillColorA: '#7c3aed',
    pillColorB: '#ede9fe',
  },
  quantum_fission: {
    type: 'quantum_fission',
    name: 'Fisión Cuántica Turbo',
    desc: 'Mitosis instantánea sin límite y recombinación celular magnética inmediata (0s) por 15s.',
    color: '#14b8a6',
    glowColor: '#5eead4',
    pillColorA: '#0d9488',
    pillColorB: '#ccfbf1',
  },
};

// 3 Endocrine Bars / Hormone Hubs in the Middle & Strategic Junctions of the Map
export const ENDOCRINE_BARS: EndocrineBarZone[] = [
  {
    id: 'bar_hypothalamic_north',
    name: 'Bar Hipotalámico Norte',
    subtitle: 'Surtidor de Neuro-Hormonas (Dopamina, Serotonina, Melatonina, GH)',
    x: 0,
    y: -1550,
    radius: 310,
    color: '#a855f7',
    glowColor: '#d8b4fe',
  },
  {
    id: 'bar_solar_plexus_center',
    name: 'Bar Endocrino Central (Plexo Solar)',
    subtitle: 'Oasis de Hormonas Metabólicas en Medio del Mapa (Insulina, Glucagón, T4, Oxitocina)',
    x: 0,
    y: 0,
    radius: 350,
    color: '#f59e0b',
    glowColor: '#fde047',
  },
  {
    id: 'bar_adrenal_south',
    name: 'Bar Suprarrenal Sur',
    subtitle: 'Reserva de Adrenalina, Noradrenalina, Cortisol y Eritropoyetina (EPO)',
    x: 0,
    y: 1350,
    radius: 310,
    color: '#ec4899',
    glowColor: '#f9a8d4',
  },
];

export interface HormoneDefinition {
  type: HormoneType;
  name: string;
  symbol: string;
  organOrigin: string;
  effectDesc: string;
  color: string;
  glowColor: string;
  massBonus: number;
  cytesBonus: number;
  speedBoost?: number;
  preferredX: number;
  preferredY: number;
  spreadRadius: number;
}

export const HORMONE_DEFS: Record<HormoneType, HormoneDefinition> = {
  adrenaline: {
    type: 'adrenaline',
    name: 'Hormona Adrenalina',
    symbol: 'EPI',
    organOrigin: 'Riñones / Bar Suprarrenal',
    effectDesc: '+65% Velocidad explosiva +25 Masa',
    color: '#ef4444',
    glowColor: '#fca5a5',
    massBonus: 25,
    cytesBonus: 5,
    speedBoost: 1.65,
    preferredX: -520,
    preferredY: 1300,
    spreadRadius: 650,
  },
  noradrenaline: {
    type: 'noradrenaline',
    name: 'Hormona Noradrenalina',
    symbol: 'NOR',
    organOrigin: 'Corazón / Bar Suprarrenal',
    effectDesc: '+50% Impulso arterial +28 Masa',
    color: '#f97316',
    glowColor: '#fdba74',
    massBonus: 28,
    cytesBonus: 5,
    speedBoost: 1.5,
    preferredX: -450,
    preferredY: -200,
    spreadRadius: 650,
  },
  insulin: {
    type: 'insulin',
    name: 'Hormona Insulina',
    symbol: 'INS',
    organOrigin: 'Estómago / Bar Endocrino Central',
    effectDesc: 'Síntesis Glucídica: +48 Masa celular inmediata',
    color: '#10b981',
    glowColor: '#6ee7b7',
    massBonus: 48,
    cytesBonus: 6,
    preferredX: -480,
    preferredY: 320,
    spreadRadius: 650,
  },
  glucagon: {
    type: 'glucagon',
    name: 'Hormona Glucagón',
    symbol: 'GLU',
    organOrigin: 'Hígado / Bar Endocrino Central',
    effectDesc: 'Glucogenólisis: +36 Masa +35% Velocidad',
    color: '#f59e0b',
    glowColor: '#fde047',
    massBonus: 36,
    cytesBonus: 6,
    speedBoost: 1.35,
    preferredX: -320,
    preferredY: 180,
    spreadRadius: 600,
  },
  somatotropin_gh: {
    type: 'somatotropin_gh',
    name: 'Somatotropina (GH)',
    symbol: 'GH',
    organOrigin: 'Cerebro / Bar Hipotalámico',
    effectDesc: 'Hormona del Crecimiento: +62 Masa celular',
    color: '#8b5cf6',
    glowColor: '#c4b5fd',
    massBonus: 62,
    cytesBonus: 8,
    preferredX: -380,
    preferredY: -1650,
    spreadRadius: 680,
  },
  melatonin: {
    type: 'melatonin',
    name: 'Hormona Melatonina',
    symbol: 'MEL',
    organOrigin: 'Glándula Pineal / Bar Hipotalámico',
    effectDesc: 'Calma anticuerpos cercanos +30 Masa',
    color: '#6366f1',
    glowColor: '#a5b4fc',
    massBonus: 30,
    cytesBonus: 7,
    preferredX: 380,
    preferredY: -1650,
    spreadRadius: 680,
  },
  thyroxine_t4: {
    type: 'thyroxine_t4',
    name: 'Hormona Tiroxina (T4)',
    symbol: 'T4',
    organOrigin: 'Timo / Bar Endocrino Central',
    effectDesc: 'Hiper-Metabolismo: +40 Masa +40% Velocidad',
    color: '#06b6d4',
    glowColor: '#67e8f9',
    massBonus: 40,
    cytesBonus: 7,
    speedBoost: 1.4,
    preferredX: 350,
    preferredY: -350,
    spreadRadius: 650,
  },
  cortisol: {
    type: 'cortisol',
    name: 'Hormona Cortisol',
    symbol: 'COR',
    organOrigin: 'Corteza Suprarrenal / Bar Sur',
    effectDesc: 'Resistencia de Membrana: +42 Masa +8 Cytes',
    color: '#eab308',
    glowColor: '#fef08a',
    massBonus: 42,
    cytesBonus: 8,
    preferredX: 420,
    preferredY: 1250,
    spreadRadius: 650,
  },
  dopamine: {
    type: 'dopamine',
    name: 'Hormona Dopamina',
    symbol: 'DOP',
    organOrigin: 'Sinapsis / Bar Hipotalámico Norte',
    effectDesc: 'Euforia Neural: +55% Velocidad +12 Cytes',
    color: '#ec4899',
    glowColor: '#f9a8d4',
    massBonus: 32,
    cytesBonus: 12,
    speedBoost: 1.55,
    preferredX: 0,
    preferredY: -1500,
    spreadRadius: 620,
  },
  serotonin: {
    type: 'serotonin',
    name: 'Hormona Serotonina',
    symbol: '5HT',
    organOrigin: 'Plexo Entérico / Bar Central',
    effectDesc: 'Fusión celular instantánea +38 Masa',
    color: '#14b8a6',
    glowColor: '#5eead4',
    massBonus: 38,
    cytesBonus: 9,
    preferredX: 0,
    preferredY: 80,
    spreadRadius: 600,
  },
  oxytocin: {
    type: 'oxytocin',
    name: 'Hormona Oxitocina',
    symbol: 'OXT',
    organOrigin: 'Corazón / Bar Endocrino Central',
    effectDesc: 'Regeneración Vascular: +45 Masa +10 Cytes',
    color: '#f43f5e',
    glowColor: '#fda4af',
    massBonus: 45,
    cytesBonus: 10,
    preferredX: -120,
    preferredY: -120,
    spreadRadius: 600,
  },
  erythropoietin: {
    type: 'erythropoietin',
    name: 'Eritropoyetina (EPO)',
    symbol: 'EPO',
    organOrigin: 'Riñones / Bar Suprarrenal Sur',
    effectDesc: 'Génesis de Eritrocitos: +20 Cytes +35 Masa',
    color: '#dc2626',
    glowColor: '#f87171',
    massBonus: 35,
    cytesBonus: 20,
    speedBoost: 1.3,
    preferredX: 0,
    preferredY: 1350,
    spreadRadius: 620,
  },
};

export interface MedicalTreatmentDefinition {
  type: MedicalTreatmentType;
  name: string;
  symbol: string;
  clinicalEffect: string;
  color: string;
  glowColor: string;
  pillColorA: string;
  pillColorB: string;
  durationSec: number;
}

export const MEDICAL_TREATMENT_DEFS: Record<MedicalTreatmentType, MedicalTreatmentDefinition> = {
  antibiotic: {
    type: 'antibiotic',
    name: 'Antibiótico Amoxicilina IV',
    symbol: 'ABX',
    clinicalEffect: 'Lisis bacteriana: -22 ml Pus, debilita Patógenos (-20% masa) y +10% Salud Paciente',
    color: '#06b6d4',
    glowColor: '#22d3ee',
    pillColorA: '#0891b2',
    pillColorB: '#ecfeff',
    durationSec: 12,
  },
  analgesic: {
    type: 'analgesic',
    name: 'Analgésico Ibuprofeno',
    symbol: 'ALG',
    clinicalEffect: 'Antiinflamatorio: -0.6 °C Fiebre, +14% Energía ATP y +30% Velocidad celular',
    color: '#f59e0b',
    glowColor: '#fbbf24',
    pillColorA: '#d97706',
    pillColorB: '#fef3c7',
    durationSec: 12,
  },
  vaccine: {
    type: 'vaccine',
    name: 'Vacuna ARNm Inmunizante',
    symbol: 'VAC',
    clinicalEffect: 'Memoria Inmune: +35% Velocidad y Escudo a Leucocitos, +14% Salud y -16 ml Pus',
    color: '#10b981',
    glowColor: '#34d399',
    pillColorA: '#059669',
    pillColorB: '#d1fae5',
    durationSec: 14,
  },
  antiviral_pill: {
    type: 'antiviral_pill',
    name: 'Pastilla Antiviral',
    symbol: 'AVR',
    clinicalEffect: 'Inhibidor de Replicación: Ralentiza Patógenos (-30%), -14 ml Pus y +9% Salud',
    color: '#8b5cf6',
    glowColor: '#c4b5fd',
    pillColorA: '#7c3aed',
    pillColorB: '#ede9fe',
    durationSec: 12,
  },
  iv_serum: {
    type: 'iv_serum',
    name: 'Suero Electrolítico IV',
    symbol: 'SUE',
    clinicalEffect: 'Rehidratación Plasmática: +22% Hidratación, +18% Energía ATP y +35 Masa',
    color: '#3b82f6',
    glowColor: '#60a5fa',
    pillColorA: '#2563eb',
    pillColorB: '#dbeafe',
    durationSec: 12,
  },
  antipyretic: {
    type: 'antipyretic',
    name: 'Antipirético Metamizol',
    symbol: 'ATP',
    clinicalEffect: 'Termorregulación Hipotalámica: Baja Fiebre (-1.1 °C), evita Shock Séptico y +8% Salud',
    color: '#ec4899',
    glowColor: '#f472b6',
    pillColorA: '#db2777',
    pillColorB: '#fce7f3',
    durationSec: 12,
  },
};


