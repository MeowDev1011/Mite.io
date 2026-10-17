// Microbe and Spore Styles / Skins catalog for Mite.io
// Supports Achievement unlocks and Cyte currency purchasing

export interface MicrobeSkin {
  id: string;
  name: string;
  description: string;
  color: string;
  secondaryColor: string;
  ciliaColor: string;
  nucleusColor: string;
  icon: string;
  priceCytes: number;
  unlockRequirement: string;
  requiredAchievementId?: string;
}

export interface SporeStyle {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  trailType: 'sparkle' | 'bubbles' | 'smoke' | 'toxic' | 'electric';
  priceCytes: number;
  unlockRequirement: string;
  requiredAchievementId?: string;
}

export const MICROBE_SKINS: MicrobeSkin[] = [
  {
    id: 'emerald_mite',
    name: 'Mite Esmeralda',
    description: 'El invasor clásico del torrente con membrana verde bioluminiscente.',
    color: '#10b981',
    secondaryColor: '#059669',
    ciliaColor: '#6ee7b7',
    nucleusColor: '#ffffff',
    icon: 'cell',
    priceCytes: 0,
    unlockRequirement: 'Desbloqueado por defecto',
  },
  {
    id: 'crimson_phage',
    name: 'Bacteriófago Carmesí',
    description: 'Microbio hiperagresivo alimentado por hemoglobina pura.',
    color: '#ef4444',
    secondaryColor: '#b91c1c',
    ciliaColor: '#fca5a5',
    nucleusColor: '#fee2e2',
    icon: 'phage',
    priceCytes: 180,
    unlockRequirement: 'Logro: Primera Infección',
    requiredAchievementId: 'first_blood',
  },
  {
    id: 'cyber_cyan',
    name: 'Nanobio Cian Eléctrico',
    description: 'Organismo adaptado a corrientes capilares ultrarrápidas.',
    color: '#06b6d4',
    secondaryColor: '#0e7490',
    ciliaColor: '#67e8f9',
    nucleusColor: '#cffafe',
    icon: 'dna',
    priceCytes: 220,
    unlockRequirement: 'Logro: Maestro de la Fisión',
    requiredAchievementId: 'mitosis_master',
  },
  {
    id: 'royal_gold',
    name: 'Cepa Real Aureolada',
    description: 'Célula titánica con resplandor dorado de dominio total.',
    color: '#eab308',
    secondaryColor: '#a16207',
    ciliaColor: '#fef08a',
    nucleusColor: '#fef9c3',
    icon: 'crown',
    priceCytes: 400,
    unlockRequirement: 'Logro: Titán Vascular (500 Masa)',
    requiredAchievementId: 'mass_500',
  },
  {
    id: 'void_amethyst',
    name: 'Espora Amatista Oculta',
    description: 'Microorganismo mutado en las profundidades de la cripta linfática.',
    color: '#a855f7',
    secondaryColor: '#7e22ce',
    ciliaColor: '#e9d5ff',
    nucleusColor: '#f3e8ff',
    icon: 'portal',
    priceCytes: 350,
    unlockRequirement: 'Logro: Cripta Linfática Oculta',
    requiredAchievementId: 'secret_lymph_node',
  },
  {
    id: 'solar_amber',
    name: 'Ácaro Solar de Fisión',
    description: 'Membrana plasmática cargada de energía celular radiante.',
    color: '#f97316',
    secondaryColor: '#c2410c',
    ciliaColor: '#fed7aa',
    nucleusColor: '#ffedd5',
    icon: 'spark',
    priceCytes: 250,
    unlockRequirement: 'Logro: Evasión Inmunológica',
    requiredAchievementId: 'antibody_survivor',
  },
  // Exclusive Shop Skins purchasable with Cytes
  {
    id: 'chimeric_macrophage',
    name: 'Macrófago Quimérico',
    description: 'Híbrido colosal de seguridad vascular con filamentos biológicos.',
    color: '#ec4899',
    secondaryColor: '#9d174d',
    ciliaColor: '#f472b6',
    nucleusColor: '#fdf2f8',
    icon: 'macrophage',
    priceCytes: 450,
    unlockRequirement: 'Tienda Cyte (450 Cytes)',
  },
  {
    id: 'coronary_titan',
    name: 'Titán Coronario Aórtico',
    description: 'Nacido en las presiones más altas del corazón. Membrana reforzada.',
    color: '#dc2626',
    secondaryColor: '#7f1d1d',
    ciliaColor: '#fca5a5',
    nucleusColor: '#fee2e2',
    icon: 'heart',
    priceCytes: 600,
    unlockRequirement: 'Tienda Cyte (600 Cytes)',
  },
  {
    id: 'neural_wraith',
    name: 'Espectro Neural Sináptico',
    description: 'Flota en el fluido cerebral descargando microimpulsos bioeléctricos.',
    color: '#6366f1',
    secondaryColor: '#3730a3',
    ciliaColor: '#a5b4fc',
    nucleusColor: '#e0e7ff',
    icon: 'zap',
    priceCytes: 500,
    unlockRequirement: 'Tienda Cyte (500 Cytes)',
  },
  {
    id: 'biohazard_mutant',
    name: 'Mutante Bio-Tóxico',
    description: 'Célula contaminada con enzimas líticas que disuelven proteínas ajenas.',
    color: '#84cc16',
    secondaryColor: '#4d7c0f',
    ciliaColor: '#bef264',
    nucleusColor: '#ecfccb',
    icon: 'biohazard',
    priceCytes: 320,
    unlockRequirement: 'Tienda Cyte (320 Cytes)',
  },
  {
    id: 'cryo_leukocyte',
    name: 'Crio-Leucocito Glacial',
    description: 'Membrana cristalina templada en solución salina hipotérmica.',
    color: '#38bdf8',
    secondaryColor: '#0369a1',
    ciliaColor: '#bae6fd',
    nucleusColor: '#f0f9ff',
    icon: 'shield',
    priceCytes: 380,
    unlockRequirement: 'Tienda Cyte (380 Cytes)',
  },
];

export const SPORE_STYLES: SporeStyle[] = [
  {
    id: 'spore_plasma',
    name: 'Plasma Celular',
    color: '#6ee7b7',
    glowColor: '#10b981',
    trailType: 'bubbles',
    priceCytes: 0,
    unlockRequirement: 'Desbloqueado por defecto',
  },
  {
    id: 'spore_hemoglobin',
    name: 'Hemoglobina Intensa',
    color: '#f87171',
    glowColor: '#dc2626',
    trailType: 'sparkle',
    priceCytes: 120,
    unlockRequirement: 'Logro: Festín de Hemoglobina o 120 Cytes',
    requiredAchievementId: 'erythrocyte_feast',
  },
  {
    id: 'spore_toxic',
    name: 'Viroide Tóxico',
    color: '#a3e635',
    glowColor: '#65a30d',
    trailType: 'toxic',
    priceCytes: 150,
    unlockRequirement: 'Logro: Espora Tóxica o 150 Cytes',
    requiredAchievementId: 'toxic_bomber',
  },
  {
    id: 'spore_cosmic',
    name: 'Cian Cuántico',
    color: '#38bdf8',
    glowColor: '#0284c7',
    trailType: 'sparkle',
    priceCytes: 200,
    unlockRequirement: 'Logro: Rey del Torrente o 200 Cytes',
    requiredAchievementId: 'bloodstream_king',
  },
  {
    id: 'spore_synapse',
    name: 'Chispas de Sinapsis',
    color: '#c084fc',
    glowColor: '#9333ea',
    trailType: 'electric',
    priceCytes: 280,
    unlockRequirement: 'Tienda Cyte (280 Cytes)',
  },
  {
    id: 'spore_mitochondria',
    name: 'Mitocondria ATP',
    color: '#fbbf24',
    glowColor: '#d97706',
    trailType: 'sparkle',
    priceCytes: 320,
    unlockRequirement: 'Tienda Cyte (320 Cytes)',
  },
];
