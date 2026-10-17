import React from 'react';

// Crisp, high-fidelity SVGs for biological entities, currencies, badges and UI
// Guarantees 0 emojis across the entire Mite.io application.

export const CyteCoinSvg: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <radialGradient id="cyteRim" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ff4d6d" />
        <stop offset="50%" stopColor="#c9184a" />
        <stop offset="100%" stopColor="#590d22" />
      </radialGradient>
      <radialGradient id="cyteDepression" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38040e" />
        <stop offset="70%" stopColor="#590d22" />
        <stop offset="100%" stopColor="#800f2f" />
      </radialGradient>
      <filter id="cyteGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ff4d6d" floodOpacity="0.5" />
      </filter>
    </defs>
    {/* Outer Erythrocyte Disc */}
    <circle cx="16" cy="16" r="14" fill="url(#cyteRim)" stroke="#ff758f" strokeWidth="1.2" filter="url(#cyteGlow)" />
    {/* Biconcave Center Indentation */}
    <ellipse cx="16" cy="16" rx="6.5" ry="5.5" fill="url(#cyteDepression)" />
    {/* Subtle Hemoglobin Highlight Curve */}
    <path
      d="M10 12C12 9 19 9 22 13"
      stroke="#ffb3c1"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

export const ConqueredFlagSvg: React.FC<{ size?: number; className?: string; color?: string }> = ({
  size = 20,
  className = '',
  color = '#10b981',
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 22V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M4 4C8 2 12 6 16 4C18 3 19 3.5 20 4.5V14C19 13 18 12.5 16 13.5C12 15.5 8 11.5 4 13.5V4Z"
      fill={color}
      fillOpacity="0.4"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="8.5" r="2" fill={color} />
  </svg>
);

export const BacteriaIllustrationSvg: React.FC<{
  type: string;
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  className?: string;
}> = ({
  type,
  size = 64,
  primaryColor = '#10b981',
  secondaryColor = '#047857',
  accentColor = '#6ee7b7',
  className = '',
}) => {
  switch (type) {
    case 'rod':
    case 'rod_bacillus':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
          <defs>
            <linearGradient id={`grad_rod_${primaryColor}`} x1="0" y1="0" x2="80" y2="80">
              <stop offset="0%" stopColor={accentColor} />
              <stop offset="50%" stopColor={primaryColor} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>
          {/* Peritrichous Flagella waving strands */}
          <path d="M22 28C14 20 8 22 2 14" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
          <path d="M22 52C12 58 6 56 2 66" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
          <path d="M58 28C68 18 74 22 78 12" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
          <path d="M58 52C68 62 74 58 78 68" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
          {/* Main Rod-Shaped Capsule */}
          <rect
            x="20"
            y="26"
            width="40"
            height="28"
            rx="14"
            fill={`url(#grad_rod_${primaryColor})`}
            stroke={accentColor}
            strokeWidth="2.5"
          />
          {/* Internal Nucleoid Genetic Ribbons */}
          <path
            d="M28 40Q34 33 40 40T52 40"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Ribosome & Plasmid Dots */}
          <circle cx="32" cy="34" r="2" fill="#ffffff" opacity="0.9" />
          <circle cx="48" cy="46" r="2" fill="#ffffff" opacity="0.9" />
          <circle cx="44" cy="33" r="1.5" fill="#ffffff" opacity="0.7" />
        </svg>
      );

    case 'coccus_chain':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
          <defs>
            <radialGradient id={`grad_coc_${primaryColor}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor={accentColor} />
              <stop offset="60%" stopColor={primaryColor} />
              <stop offset="100%" stopColor={secondaryColor} />
            </radialGradient>
          </defs>
          {/* Chained Spherical Cocci */}
          <circle cx="18" cy="50" r="11" fill={`url(#grad_coc_${primaryColor})`} stroke={accentColor} strokeWidth="1.8" />
          <circle cx="34" cy="42" r="13" fill={`url(#grad_coc_${primaryColor})`} stroke={accentColor} strokeWidth="2.2" />
          <circle cx="54" cy="32" r="14" fill={`url(#grad_coc_${primaryColor})`} stroke={accentColor} strokeWidth="2.4" />
          <circle cx="68" cy="22" r="9" fill={`url(#grad_coc_${primaryColor})`} stroke={accentColor} strokeWidth="1.8" />
          {/* Membrane Highlights & Nucleoids */}
          <circle cx="33" cy="40" r="4" fill="#ffffff" opacity="0.8" />
          <circle cx="53" cy="30" r="5" fill="#ffffff" opacity="0.85" />
          <path d="M14 47C16 44 20 44 22 47" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
        </svg>
      );

    case 'spiral':
    case 'spiral_spirillum':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
          {/* Spirillum Helical Wave Body */}
          <path
            d="M16 64C22 50 32 60 40 40C48 20 58 30 64 16"
            stroke={primaryColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 64C22 50 32 60 40 40C48 20 58 30 64 16"
            stroke={accentColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          {/* Polar Flagellar Tufts */}
          <path d="M16 64C10 70 6 72 2 76" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 64C8 66 4 64 0 68" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M64 16C70 10 74 8 78 4" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M64 16C72 14 76 16 80 12" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          {/* Bioluminescent Nodes along the wave */}
          <circle cx="40" cy="40" r="3.5" fill="#ffffff" opacity="0.9" />
          <circle cx="28" cy="54" r="2.5" fill="#ffffff" opacity="0.85" />
          <circle cx="52" cy="26" r="2.5" fill="#ffffff" opacity="0.85" />
        </svg>
      );

    case 'phage':
    case 'phage_t4':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
          {/* Icosahedral Capsid Head */}
          <polygon
            points="40,10 60,22 60,40 40,50 20,40 20,22"
            fill={primaryColor}
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="40" y1="10" x2="40" y2="50" stroke={accentColor} strokeWidth="1.5" opacity="0.75" />
          <line x1="20" y1="22" x2="60" y2="40" stroke={accentColor} strokeWidth="1.2" opacity="0.6" />
          <line x1="60" y1="22" x2="20" y2="40" stroke={accentColor} strokeWidth="1.2" opacity="0.6" />
          {/* Core DNA within Head */}
          <circle cx="40" cy="30" r="5" fill="#ffffff" opacity="0.95" />
          {/* Contractile Sheath Collar & Tail Tube */}
          <rect x="36.5" y="50" width="7" height="15" fill={secondaryColor} stroke={accentColor} strokeWidth="1.5" />
          <line x1="36" y1="54" x2="44" y2="54" stroke={accentColor} strokeWidth="1" />
          <line x1="36" y1="58" x2="44" y2="58" stroke={accentColor} strokeWidth="1" />
          <line x1="36" y1="62" x2="44" y2="62" stroke={accentColor} strokeWidth="1" />
          {/* Baseplate */}
          <polygon points="34,65 46,65 43,68 37,68" fill={accentColor} />
          {/* Jointed Tail Fibers */}
          <path d="M36 67L24 72L14 78" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M44 67L56 72L66 78" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M37 68L30 75L26 80" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M43 68L50 75L54 80" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'vibrio':
    case 'helicobacter':
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
          {/* Curved Vibrio/Helicobacter Comma/Spiral shape */}
          <path
            d="M26 62C20 46 28 30 46 24C58 20 62 26 58 34C50 42 38 48 36 60Z"
            fill={primaryColor}
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Tuft of Polar Sheathed Flagella */}
          <path d="M58 24C68 18 72 10 76 4" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M56 22C64 14 70 8 78 8" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M58 26C68 22 74 16 80 18" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          {/* Nucleoid coil */}
          <path d="M32 48Q42 38 46 32" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="36" cy="40" r="2.5" fill="#ffffff" opacity="0.9" />
        </svg>
      );

    case 'macrophage':
    case 'titan_macrophage':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
          <defs>
            <radialGradient id={`grad_macro_${primaryColor}`} cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor={accentColor} />
              <stop offset="60%" stopColor={primaryColor} />
              <stop offset="100%" stopColor={secondaryColor} />
            </radialGradient>
          </defs>
          {/* Amoeboid Pseudopods Organic Silhouette */}
          <path
            d="M40 12C52 10 66 18 68 32C70 46 62 58 52 66C38 74 22 72 16 58C10 44 14 26 26 16C32 11 36 12 40 12Z"
            fill={`url(#grad_macro_${primaryColor})`}
            stroke={accentColor}
            strokeWidth="2.5"
          />
          {/* Extended Pseudopod Tentacles */}
          <path d="M66 28C74 24 78 28 80 26" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M20 62C12 68 8 66 4 72" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M12 36C4 34 2 28 0 30" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          {/* Massive Central Nucleus & Lysosomes */}
          <ellipse cx="40" cy="40" rx="12" ry="10" fill="#ffffff" opacity="0.85" />
          <ellipse cx="42" cy="38" rx="6" ry="5" fill={secondaryColor} />
          <circle cx="28" cy="30" r="3" fill="#ffffff" opacity="0.75" />
          <circle cx="54" cy="52" r="3" fill="#ffffff" opacity="0.75" />
          <circle cx="48" cy="24" r="2" fill="#ffffff" opacity="0.6" />
        </svg>
      );
  }
};

// SVG Achievement Badges (100% vector, replacing emojis)
export const AchievementBadgeSvg: React.FC<{ icon: string; size?: number; className?: string }> = ({
  icon,
  size = 24,
  className = '',
}) => {
  switch (icon) {
    case 'blood':
    case 'first_blood':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 2.5C12 2.5 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2.5 12 2.5Z"
            fill="#ef4444"
            stroke="#fca5a5"
            strokeWidth="1.5"
          />
          <path d="M10 13C10 10.5 12 7.5 12 7.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        </svg>
      );

    case 'cell':
    case 'mass_100':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" fill="#10b981" stroke="#6ee7b7" strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="4" ry="3.5" fill="#ffffff" opacity="0.85" />
          <circle cx="15" cy="9" r="1.5" fill="#ffffff" opacity="0.9" />
        </svg>
      );

    case 'crown':
    case 'mass_500':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M3 18L5 8L9.5 12L12 5L14.5 12L19 8L21 18H3Z"
            fill="#eab308"
            stroke="#fef08a"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="5" cy="8" r="1.5" fill="#ffffff" />
          <circle cx="12" cy="5" r="1.5" fill="#ffffff" />
          <circle cx="19" cy="8" r="1.5" fill="#ffffff" />
        </svg>
      );

    case 'dna':
    case 'mitosis_master':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M6 3C10 7 14 11 18 15C19 16 19 18 18 21" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 3C14 7 10 11 6 15C5 16 5 18 6 21" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="6" x2="16" y2="6" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="10" y1="12" x2="14" y2="12" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="8" y1="18" x2="16" y2="18" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
      );

    case 'shield':
    case 'antibody_survivor':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 2L4 6V11C4 16.5 7.4 20.8 12 22C16.6 20.8 20 16.5 20 11V6L12 2Z"
            fill="#f97316"
            stroke="#fed7aa"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9 12L11 14L15 10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'portal':
    case 'secret_lymph_node':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <ellipse cx="12" cy="12" rx="9" ry="9" stroke="#a855f7" strokeWidth="2" />
          <ellipse cx="12" cy="12" rx="6" ry="6" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="3" fill="#ffffff" />
        </svg>
      );

    case 'biohazard':
    case 'toxic_bomber':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" fill="#14b8a6" stroke="#5eead4" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" fill="#ffffff" />
          <path d="M12 3V7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 17L7.5 15" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 17L16.5 15" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};
