// Bot Microbe Presets: Personalities, Palettes, and Identifiers

export interface BotPreset {
  name: string;
  color: string;
  secondaryColor: string;
  ciliaColor: string;
  personality: 'aggressive' | 'scavenger' | 'balanced' | 'cautious';
}

export const BOT_PRESETS: BotPreset[] = [
  {
    name: 'Amoeba-X',
    color: '#06b6d4',
    secondaryColor: '#0891b2',
    ciliaColor: '#67e8f9',
    personality: 'aggressive',
  },
  {
    name: 'Phage-99',
    color: '#8b5cf6',
    secondaryColor: '#6d28d9',
    ciliaColor: '#c4b5fd',
    personality: 'aggressive',
  },
  {
    name: 'Streptococcus',
    color: '#ec4899',
    secondaryColor: '#be185d',
    ciliaColor: '#fbcfe8',
    personality: 'balanced',
  },
  {
    name: 'Bacillus-Rex',
    color: '#10b981',
    secondaryColor: '#047857',
    ciliaColor: '#6ee7b7',
    personality: 'aggressive',
  },
  {
    name: 'Nano-Mite',
    color: '#f59e0b',
    secondaryColor: '#d97706',
    ciliaColor: '#fde68a',
    personality: 'cautious',
  },
  {
    name: 'Toxoplasma',
    color: '#f43f5e',
    secondaryColor: '#be123c',
    ciliaColor: '#fda4af',
    personality: 'balanced',
  },
  {
    name: 'Giardia-Z',
    color: '#14b8a6',
    secondaryColor: '#0f766e',
    ciliaColor: '#5eead4',
    personality: 'scavenger',
  },
  {
    name: 'Vibrio-Flux',
    color: '#3b82f6',
    secondaryColor: '#1d4ed8',
    ciliaColor: '#93c5fd',
    personality: 'scavenger',
  },
  {
    name: 'Rotifer-Prime',
    color: '#84cc16',
    secondaryColor: '#4d7c0f',
    ciliaColor: '#bef264',
    personality: 'aggressive',
  },
  {
    name: 'Lactobacillus',
    color: '#eab308',
    secondaryColor: '#a16207',
    ciliaColor: '#fef08a',
    personality: 'scavenger',
  },
  {
    name: 'Spirillum-7',
    color: '#a855f7',
    secondaryColor: '#7e22ce',
    ciliaColor: '#d8b4fe',
    personality: 'cautious',
  },
  {
    name: 'Clostridium',
    color: '#fb923c',
    secondaryColor: '#c2410c',
    ciliaColor: '#fed7aa',
    personality: 'balanced',
  },
  {
    name: 'Staph-Alpha',
    color: '#ef4444',
    secondaryColor: '#b91c1c',
    ciliaColor: '#fca5a5',
    personality: 'aggressive',
  },
  {
    name: 'Micro-Titan',
    color: '#6366f1',
    secondaryColor: '#4338ca',
    ciliaColor: '#a5b4fc',
    personality: 'aggressive',
  },
  {
    name: 'Trypanosoma',
    color: '#22c55e',
    secondaryColor: '#15803d',
    ciliaColor: '#86efac',
    personality: 'cautious',
  },
  {
    name: 'Leishmania',
    color: '#d946ef',
    secondaryColor: '#a21caf',
    ciliaColor: '#f0abfc',
    personality: 'scavenger',
  },
  {
    name: 'Paramecium',
    color: '#0ea5e9',
    secondaryColor: '#0369a1',
    ciliaColor: '#7dd3fc',
    personality: 'balanced',
  },
  {
    name: 'Helico-B',
    color: '#f97316',
    secondaryColor: '#ea580c',
    ciliaColor: '#fdba74',
    personality: 'scavenger',
  },
];
