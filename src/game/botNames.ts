// Realistic Multilingual & Casual Player Presets for Mite.io
// Features 110 authentic gamer tags: ~95% normal Latin/casual tags (aabc, 123, catinthelad, Spanish, Portuguese, English, French, Italian, German)
// and only a tiny handful (6) of non-Latin script names, with 7 distinct human-like movement personalities.

import { Faction } from './types';

export type BotPersonality =
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

export interface BotPreset {
  name: string;
  color: string;
  secondaryColor: string;
  ciliaColor: string;
  personality: BotPersonality;
  faction?: Faction;
}

const COLOR_PALETTES = [
  { color: '#06b6d4', secondaryColor: '#0891b2', ciliaColor: '#67e8f9' },
  { color: '#8b5cf6', secondaryColor: '#6d28d9', ciliaColor: '#c4b5fd' },
  { color: '#ec4899', secondaryColor: '#be185d', ciliaColor: '#fbcfe8' },
  { color: '#10b981', secondaryColor: '#047857', ciliaColor: '#6ee7b7' },
  { color: '#f59e0b', secondaryColor: '#d97706', ciliaColor: '#fde68a' },
  { color: '#f43f5e', secondaryColor: '#be123c', ciliaColor: '#fda4af' },
  { color: '#14b8a6', secondaryColor: '#0f766e', ciliaColor: '#5eead4' },
  { color: '#3b82f6', secondaryColor: '#1d4ed8', ciliaColor: '#93c5fd' },
  { color: '#6366f1', secondaryColor: '#4338ca', ciliaColor: '#a5b4fc' },
  { color: '#e11d48', secondaryColor: '#9f1239', ciliaColor: '#fda4af' },
  { color: '#84cc16', secondaryColor: '#4d7c0f', ciliaColor: '#bef264' },
  { color: '#eab308', secondaryColor: '#a16207', ciliaColor: '#fef08a' },
];

const PERSONALITIES: BotPersonality[] = [
  'sniper',
  'zigzagger',
  'opportunist',
  'hormone_hunter',
  'farmer',
  'baiter',
  'casual',
];

// 110 Realistic Human-Style Gamer Names (104 Latin/Casual + only 6 Non-Latin scripts)
export const REALISTIC_PLAYER_NAMES: string[] = [
  // Casual / Quirky tags specifically requested
  'aabc',
  '123',
  'catinthelad',
  'qwerty',
  '777',
  'zzZ',
  'xX_leo_Xx',
  'momo',
  'kiki_07',
  'pepe_gamer',
  'noob_pro',
  'gg_ez',
  'lol_xd',
  'user_404',
  'nachito',
  'toto_99',
  'lucho',
  'mati_10',
  'nico_ok',
  'fran_22',
  'agus_x',
  'tomi_7',
  'bauti',
  'santi_pro',
  'juani_08',
  'fede_king',
  'facu_gg',
  'gonza_11',
  'valen_x',
  'cami_luz',
  'sofi_star',
  'martu_04',
  'luli_pop',
  'pablo_88',
  'diego_10',
  'marcos_v',
  'ivan_kr',
  'kevin_x',
  'bryan_01',
  'axel_fire',
  'gael_mx',
  'iker_77',
  'thiago_br',
  'enzo_9',
  'dante_x',
  // Spanish & Latin American
  'ElProfe',
  'SombraLetal',
  'TacoMaster',
  'Milanesa',
  'RayoVeloz',
  'Firu_23',
  'CazadorMX',
  'MateCocido',
  'Mateo_AR',
  'Sebas99',
  'ChurroLoco',
  'PanchoVilla',
  'ArepaPower',
  'LoboGris',
  'FenixRojo',
  'TormentaX',
  'Fantasma7',
  'Capitan Sur',
  'DragoNero',
  'TitanAzul',
  // Portuguese (Brazil & Portugal)
  'JoãoBR',
  'MeninoNey',
  'LoboSolitário',
  'TubarãoRJ',
  'CaçadorBR',
  'BraboDemais',
  'Pedrinho7',
  'RaposaVeloz',
  'LucasBR',
  'Guga_SP',
  'ZecaBala',
  'Biel_011',
  'Kaua_RJ',
  'Vini_Jr7',
  'Rafa_Sul',
  // English & European Latin Script
  'ShadowWolf',
  'PixelQueen',
  'NightHawk',
  'ghost_rider',
  'lunar_eclipse',
  'sunny_day',
  'LePetitPrince',
  'Blitz_99',
  'GeceKurdu',
  'SkyWalker',
  'FrostByte',
  'CyberNinja',
  'Vortex_X',
  'SilverFox',
  'DarkMatter',
  'Starlight',
  'BlueFalcon',
  'IronClad',
  'SwiftArrow',
  'CrimsonTide',
  'GoldenEagle',
  'WildCat',
  'NeonPulse',
  'AstroBoy',
  // Only 6 Non-Latin Script Names ("solo algunos, no todos, son muy pocos")
  '星辰大海',
  '小猫咪',
  '김민수',
  'さくら',
  'Дмитрий',
  'طارق',
];

export const BOT_PRESETS: BotPreset[] = REALISTIC_PLAYER_NAMES.map((name, idx) => {
  const pal = COLOR_PALETTES[idx % COLOR_PALETTES.length];
  const personality = PERSONALITIES[idx % PERSONALITIES.length];
  return {
    name,
    color: pal.color,
    secondaryColor: pal.secondaryColor,
    ciliaColor: pal.ciliaColor,
    personality,
  };
});

export const IMMUNE_BOT_PRESETS: BotPreset[] = REALISTIC_PLAYER_NAMES.slice(0, 55).map((name, idx) => {
  const immunePalettes = [
    { color: '#0284c7', secondaryColor: '#0369a1', ciliaColor: '#7dd3fc' },
    { color: '#06b6d4', secondaryColor: '#0e7490', ciliaColor: '#67e8f9' },
    { color: '#3b82f6', secondaryColor: '#1d4ed8', ciliaColor: '#93c5fd' },
    { color: '#10b981', secondaryColor: '#047857', ciliaColor: '#6ee7b7' },
    { color: '#14b8a6', secondaryColor: '#0f766e', ciliaColor: '#5eead4' },
    { color: '#38bdf8', secondaryColor: '#0284c7', ciliaColor: '#bae6fd' },
  ];
  const pal = immunePalettes[idx % immunePalettes.length];
  return {
    name,
    color: pal.color,
    secondaryColor: pal.secondaryColor,
    ciliaColor: pal.ciliaColor,
    personality: PERSONALITIES[idx % PERSONALITIES.length],
    faction: 'immune',
  };
});

export const PATHOGEN_BOT_PRESETS: BotPreset[] = REALISTIC_PLAYER_NAMES.slice(55).map((name, idx) => {
  const pathogenPalettes = [
    { color: '#ef4444', secondaryColor: '#b91c1c', ciliaColor: '#fca5a5' },
    { color: '#a855f7', secondaryColor: '#7e22ce', ciliaColor: '#e9d5ff' },
    { color: '#f97316', secondaryColor: '#c2410c', ciliaColor: '#fed7aa' },
    { color: '#dc2626', secondaryColor: '#991b1b', ciliaColor: '#fecaca' },
    { color: '#e11d48', secondaryColor: '#9f1239', ciliaColor: '#fda4af' },
    { color: '#d97706', secondaryColor: '#92400e', ciliaColor: '#fde68a' },
  ];
  const pal = pathogenPalettes[idx % pathogenPalettes.length];
  return {
    name,
    color: pal.color,
    secondaryColor: pal.secondaryColor,
    ciliaColor: pal.ciliaColor,
    personality: PERSONALITIES[idx % PERSONALITIES.length],
    faction: 'pathogen',
  };
});
