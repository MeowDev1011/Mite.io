// Bot Microbe Presets: Personalities, Palettes, and Identifiers for Mite.io
// Distinct presets for Free-for-All, Immune Defenders, and Pathogen Invaders.

import { Faction } from './types';

export interface BotPreset {
  name: string;
  color: string;
  secondaryColor: string;
  ciliaColor: string;
  personality: 'aggressive' | 'scavenger' | 'balanced' | 'cautious';
  faction?: Faction;
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
    name: 'Spirillum-Prime',
    color: '#3b82f6',
    secondaryColor: '#1d4ed8',
    ciliaColor: '#93c5fd',
    personality: 'cautious',
  },
  {
    name: 'Vibrio-Apex',
    color: '#6366f1',
    secondaryColor: '#4338ca',
    ciliaColor: '#a5b4fc',
    personality: 'aggressive',
  },
  {
    name: 'Helico-Speed',
    color: '#e11d48',
    secondaryColor: '#9f1239',
    ciliaColor: '#fda4af',
    personality: 'balanced',
  },
  {
    name: 'Pseudomonas',
    color: '#84cc16',
    secondaryColor: '#4d7c0f',
    ciliaColor: '#bef264',
    personality: 'scavenger',
  },
  {
    name: 'Micro-Titan',
    color: '#eab308',
    secondaryColor: '#a16207',
    ciliaColor: '#fef08a',
    personality: 'aggressive',
  },
];

// Immune System / Defensores del Cuerpo (Glóbulos Blancos, Macrófagos, Probióticos)
export const IMMUNE_BOT_PRESETS: BotPreset[] = [
  {
    name: 'Glóbulo-Blanco-Alfa',
    color: '#0284c7',
    secondaryColor: '#0369a1',
    ciliaColor: '#7dd3fc',
    personality: 'aggressive',
    faction: 'immune',
  },
  {
    name: 'Macrófago-Centinela',
    color: '#06b6d4',
    secondaryColor: '#0e7490',
    ciliaColor: '#67e8f9',
    personality: 'balanced',
    faction: 'immune',
  },
  {
    name: 'Neutrófilo-Guardián',
    color: '#3b82f6',
    secondaryColor: '#1d4ed8',
    ciliaColor: '#93c5fd',
    personality: 'aggressive',
    faction: 'immune',
  },
  {
    name: 'Linfocito-T-Killer',
    color: '#6366f1',
    secondaryColor: '#4338ca',
    ciliaColor: '#a5b4fc',
    personality: 'aggressive',
    faction: 'immune',
  },
  {
    name: 'Probiótico-Lactis',
    color: '#10b981',
    secondaryColor: '#047857',
    ciliaColor: '#6ee7b7',
    personality: 'scavenger',
    faction: 'immune',
  },
  {
    name: 'Célula-Dendrítica',
    color: '#14b8a6',
    secondaryColor: '#0f766e',
    ciliaColor: '#5eead4',
    personality: 'balanced',
    faction: 'immune',
  },
  {
    name: 'Monocito-Titán',
    color: '#38bdf8',
    secondaryColor: '#0284c7',
    ciliaColor: '#bae6fd',
    personality: 'cautious',
    faction: 'immune',
  },
  {
    name: 'Fagocito-Aórtico',
    color: '#0ea5e9',
    secondaryColor: '#0369a1',
    ciliaColor: '#e0f2fe',
    personality: 'balanced',
    faction: 'immune',
  },
];

// Pathogens & Infection / Bacterias Malas & Virus Invasores
export const PATHOGEN_BOT_PRESETS: BotPreset[] = [
  {
    name: 'Virus-Ébola-Apex',
    color: '#ef4444',
    secondaryColor: '#b91c1c',
    ciliaColor: '#fca5a5',
    personality: 'aggressive',
    faction: 'pathogen',
  },
  {
    name: 'Yersinia-Peste',
    color: '#a855f7',
    secondaryColor: '#7e22ce',
    ciliaColor: '#e9d5ff',
    personality: 'aggressive',
    faction: 'pathogen',
  },
  {
    name: 'Salmonella-Virulenta',
    color: '#f97316',
    secondaryColor: '#c2410c',
    ciliaColor: '#fed7aa',
    personality: 'balanced',
    faction: 'pathogen',
  },
  {
    name: 'Clostridium-Alfa',
    color: '#dc2626',
    secondaryColor: '#991b1b',
    ciliaColor: '#fecaca',
    personality: 'aggressive',
    faction: 'pathogen',
  },
  {
    name: 'Staphylococcus-Aureus',
    color: '#d97706',
    secondaryColor: '#92400e',
    ciliaColor: '#fde68a',
    personality: 'cautious',
    faction: 'pathogen',
  },
  {
    name: 'Toxina-Bacteriana-Z',
    color: '#84cc16',
    secondaryColor: '#4d7c0f',
    ciliaColor: '#bef264',
    personality: 'scavenger',
    faction: 'pathogen',
  },
  {
    name: 'Viroide-Lítico',
    color: '#e11d48',
    secondaryColor: '#9f1239',
    ciliaColor: '#fda4af',
    personality: 'balanced',
    faction: 'pathogen',
  },
  {
    name: 'Infección-Necrótica',
    color: '#701a75',
    secondaryColor: '#4a044e',
    ciliaColor: '#f5d0fe',
    personality: 'aggressive',
    faction: 'pathogen',
  },
];
