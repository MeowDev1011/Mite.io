// Internationalization (i18n) Engine for Mite.io supporting 35 languages
// Auto-detects device language and provides manual switching with full fallback.

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'ES' },
  { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: 'PT' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: 'FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'DE' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'IT' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: 'JA' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'KO' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: 'ZH' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: 'TW' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'AR' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'HI' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: 'TR' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: 'PL' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: 'NL' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: 'SV' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: 'NO' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: 'DA' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: 'FI' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: 'EL' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: 'CS' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: 'HU' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: 'RO' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: 'UK' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: 'VI' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: 'TH' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: 'ID' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: 'MS' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', flag: 'PH' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: 'HE' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: 'BN' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: 'FA' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: 'SW' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: 'CA' },
];

export interface TranslationStrings {
  title: string;
  subtitle: string;
  bioZone: string;
  invadeBtn: string;
  inputPlaceholder: string;
  soundOn: string;
  soundOff: string;
  massDilemma: string;
  massDilemmaDesc: string;
  sporeFission: string;
  sporeFissionDesc: string;
  antibodies: string;
  antibodiesDesc: string;
  controlsTitle: string;
  controlMove: string;
  controlSplit: string;
  controlEject: string;
  controlPause: string;
  // HUD
  cellularMass: string;
  rank: string;
  cells: string;
  erythrocytes: string;
  knockouts: string;
  antibodyWarning: string;
  leadersTitle: string;
  capillaryRadar: string;
  ejectBtn: string;
  splitBtn: string;
  // Modals & Menu
  pauseTitle: string;
  pauseSubtitle: string;
  resumeBtn: string;
  restartBtn: string;
  gameOverTitle: string;
  peakMass: string;
  survivalTime: string;
  reviveBtn: string;
  tutorialBtn: string;
  achievementsBtn: string;
  skinsBtn: string;
  secretZoneDiscovered: string;
  deviceType: string;
  // Tutorial
  tutorialTitle: string;
  tutorialStep1Title: string;
  tutorialStep1Desc: string;
  tutorialStep2Title: string;
  tutorialStep2Desc: string;
  tutorialStep3Title: string;
  tutorialStep3Desc: string;
  tutorialStep4Title: string;
  tutorialStep4Desc: string;
  tutorialStep5Title: string;
  tutorialStep5Desc: string;
  tutorialGotIt: string;
  tutorialNext: string;
  tutorialPrev: string;
  // Cytes & Shop & Organs
  cytes: string;
  cytesEarned: string;
  shopBtn: string;
  shopTitle: string;
  shopSubtitle: string;
  buyBtn: string;
  equipped: string;
  insufficientCytes: string;
  currentOrgan: string;
  organBrain: string;
  organHeart: string;
  organLungs: string;
  organLiver: string;
  organStomach: string;
  organKidneys: string;
  organVessels: string;
  territoryCovered: string;
  conquerBtn: string;
  conquerDesc: string;
  conqueredSuccess: string;
  selectBacteria: string;
  bacteriaTab: string;
  freeLabel: string;
  // Game Over & Return
  backToHome: string;
  shareBtn: string;
  shareModalTitle: string;
  shareModalDesc: string;
  shareNativeBtn: string;
  copyLinkBtn: string;
  linkCopied: string;
  // Human Host Status (Battle Mode)
  hostStatusTitle: string;
  hostStatusDesc: string;
  hostHealthLabel: string;
  hostFeverLabel: string;
  hostHydrationLabel: string;
  hostEnergyLabel: string;
  hostPusLabel: string;
  hostSymptomsTitle: string;
  symptomInflammation: string;
  symptomPurulentExudate: string;
  symptomFeverPeak: string;
  symptomCytokineStorm: string;
  symptomImmuneSurge: string;
  // Battle Mode Tutorial
  battleTutorialBtn: string;
  battleTutorialTitle: string;
  battleStep1Title: string;
  battleStep1Desc: string;
  battleStep2Title: string;
  battleStep2Desc: string;
  battleStep3Title: string;
  battleStep3Desc: string;
  battleStep4Title: string;
  battleStep4Desc: string;
  // 5 Aspect Upgrades up to Level 1500
  upgradeTabTitle: string;
  upgradeLevelLabel: string;
  upgradeCostLabel: string;
  upgradeMaxReached: string;
  statAttractionTitle: string;
  statAttractionDesc: string;
  statSpeedTitle: string;
  statSpeedDesc: string;
  statArmorTitle: string;
  statArmorDesc: string;
  statMetabolismTitle: string;
  statMetabolismDesc: string;
  statSporesFissionTitle: string;
  statSporesFissionDesc: string;
  quickUpgrade10: string;
  quickUpgrade50: string;
  quickUpgradeMax: string;
  // Boosters tab in Shop
  boostersTab: string;
  boostersTitle: string;
  boostersSubtitle: string;
  activeBooster: string;
  // Sharing options (Rich Social & Device Share)
  shareWhatsApp: string;
  shareTelegram: string;
  shareTwitter: string;
  shareFacebook: string;
  shareReddit: string;
  shareQrCode: string;
  scanQrToPlay: string;
  shareTitle: string;
  shareMessageText: string;
  // Radar 2D Mobile Controls
  radarToggleBtn: string;
  radarMinimizeBtn: string;
  radarShowBtn: string;
  // Battle Mode & Pus & Symptoms
  pusPustules: string;
  cleansePus: string;
  absorbPus: string;
  symptomSepticShock: string;
  symptomCellNecrosis: string;
  hostStatusBadge: string;
  humanTemperature: string;
  humanHydration: string;
  humanEnergy: string;
  humanHealth: string;
  pusLevelLabel: string;
  // Home Upgrades
  homeUpgradesBtn: string;
  upgradesHeroTitle: string;
  upgradesHeroSubtitle: string;
  quickUpgrade1: string;
  quickUpgrade100: string;
  totalAffordable: string;
  // Expanded Social Sharing
  shareLinkedIn: string;
  shareDiscord: string;
  shareEmail: string;
  shareSMS: string;
  sharePinterest: string;
  shareDownloadCard: string;
  shareCardDownloaded: string;
  shareDiscordCopied: string;
  shareDirectTitle: string;
  shareSocialTitle: string;
  shareCardTitle: string;
  shareCardSubtitle: string;
  // Game modes & factions
  modeFfa: string;
  modeTeam: string;
  modeBots: string;
  factionImmuneTitle: string;
  factionImmuneDesc: string;
  factionPathogenTitle: string;
  factionPathogenDesc: string;
  changeBacteriaBtn: string;
  realMultiplayerToggle: string;
  realMultiplayerDesc: string;
  // PWA Modal
  installPwaBtn: string;
  installPwaTitle: string;
  installPwaSubtitle: string;
  installAndroidTitle: string;
  installAndroidDesc: string;
  installIosTitle: string;
  installIosDesc: string;
  installDesktopTitle: string;
  installDesktopDesc: string;
  understoodBtn: string;
  // In-Game HUD & Leaderboard
  leaderboardFaction: string;
  foldTable: string;
  conquerExtraCytes: string;
  anteriorLabel: string;
  posteriorLabel: string;
  hiddenCrypt: string;
  ejectSporeHint: string;
  splitTwoHint: string;
  immuneDefenders: string;
  pathogenInfection: string;
  // Shop tabs & details
  totalInvested: string;
  levelsLabel: string;
  bacteriaTabTitle: string;
  bundlesTabTitle: string;
  skinsTabTitle: string;
  sporesTabTitle: string;
  territoryTabTitle: string;
  // Upgrades and Battle Tutorial extra keys
  upgradeSuccessLevel: string;
  sporesRangeBase: string;
  speedBase: string;
  armorBase: string;
  metabolismBase: string;
  attractionBase: string;
  sporesRangeBonus: string;
  speedBonusLabel: string;
  armorBonusLabel: string;
  metabolismBonusLabel: string;
  attractionBonusLabel: string;
  pusPathogenEffect: string;
  pusImmuneEffect: string;
  pusTitle: string;
  battleWinConditionTitle: string;
  battleWinConditionDesc: string;
  factionsConflictBadge: string;
  hostBiometricsBadge: string;
  quickBuyMode: string;
  bioProgressLabel: string;
  battleTacticalGuide: string;
  immuneFactionTutorial: string;
  pathogenFactionTutorial: string;
  battlePusModalDesc: string;
  battleHostModalDesc: string;
  bioMarketTitle: string;
  bioMarketSubtitle: string;
  currentlyEquipped: string;
  equipThisStrain: string;
  unlockForCytes: string;
  statPerkSpeed: string;
  statPerkArmor: string;
  statPerkConquest: string;
  colonizedColonies: string;
  bundleEquipped: string;
  equipBundle: string;
  acquireBundle: string;
  upgradeFunctionsTitle: string;
  upgradeFunctionsSubtitle: string;
  maxLevelReached5: string;
  upgradeToLevel: string;
  inUse: string;
  equip: string;
  unlock: string;
  humanBodyDominance: string;
  conquerOrganTip: string;
  colonizedOrgansLabel: string;
  colonizedStatus: string;
  unconqueredStatus: string;
  conquestRewardLabel: string;
  conquestRewardValue: string;
}

// Translations dictionary
export const TRANSLATIONS: Record<string, Partial<TranslationStrings>> = {
  es: {
    title: 'Mite.io',
    subtitle: 'Invasión celular en tiempo real dentro del cuerpo humano. Recorré los órganos, devorá recursos, dividite para emboscar y eludí a los implacables anticuerpos.',
    bioZone: 'Cuerpo Humano · Anatomía Vascular',
    invadeBtn: 'Invadir',
    inputPlaceholder: 'Nombre de tu microbio...',
    soundOn: 'Audio Activo',
    soundOff: 'Silenciado',
    massDilemma: 'Dilema de Masa',
    massDilemmaDesc: 'Al crecer tu masa, te volvés más lento. ¡Los ácaros pequeños son más ágiles!',
    sporeFission: 'Fisión Celular',
    sporeFissionDesc: 'Presioná Espacio para lanzar la mitad de tu cuerpo hacia adelante y cazar.',
    antibodies: 'Anticuerpos Patrulla',
    antibodiesDesc: 'Cazan a los microbios gigantes con espinas biológicas para equilibrar el mapa.',
    controlsTitle: 'Controles',
    controlMove: 'Mouse / WASD Moverse',
    controlSplit: 'Espacio Dividir',
    controlEject: 'W Disparar Espora',
    controlPause: 'Esc Pausa',
    cellularMass: 'Masa Celular',
    rank: 'Rango',
    cells: 'células',
    erythrocytes: 'glóbulos',
    knockouts: 'K.O.',
    antibodyWarning: '¡ALERTA DE ANTICUERPO! Tu masa atrae patrullas espinosas',
    leadersTitle: 'Líderes del Torrente',
    capillaryRadar: 'Radar Capilar',
    ejectBtn: 'EYECTAR',
    splitBtn: 'DIVIDIR',
    pauseTitle: 'Pausa',
    pauseSubtitle: 'Torrente Sanguíneo en Suspensión',
    resumeBtn: 'Reanudar',
    restartBtn: 'Reiniciar Partida',
    gameOverTitle: 'Célula Destruida',
    peakMass: 'Masa Máxima',
    survivalTime: 'Supervivencia',
    reviveBtn: 'Revivir en el Torrente',
    tutorialBtn: 'Cómo Jugar',
    achievementsBtn: 'Logros',
    skinsBtn: 'Estilos y Esporas',
    secretZoneDiscovered: '¡Zona Secreta Encontrada: Nódulo Linfático!',
    deviceType: 'Dispositivo detectado',
    tutorialTitle: 'Guía de Invasión Celular',
    tutorialStep1Title: '1. Absorción de Nutrientes',
    tutorialStep1Desc: 'Navegá hacia las proteínas brillantes (puntos de colores) para ganar tus primeros niveles de masa.',
    tutorialStep2Title: '2. Lisis de Glóbulos Rojos',
    tutorialStep2Desc: 'Los eritrocitos (discos rojos) otorgan mucha masa, pero sólo podés devorarlos cuando seas más grande que ellos.',
    tutorialStep3Title: '3. Mecánica de División (Fisión)',
    tutorialStep3Desc: '¡CLAVE! Al presionar [ESPACIO], tu célula se divide en dos lanzando una mitad con tremendo impulso hacia adelante para cazar a microbios veloces o escapar. Un indicador circular muestra el tiempo de espera hasta que se vuelvan a fusionar.',
    tutorialStep4Title: '4. Peligro: Anticuerpos Patrulla',
    tutorialStep4Desc: 'Si superás 160 de masa, los anticuerpos con espinas activarán sus sirenas y te cazarán. Al chocar, destrozan tu membrana y te dividen a la fuerza. ¡Los microbios pequeños pueden esconderse cerca de ellos sin peligro!',
    tutorialStep5Title: '5. Secretos y Evolución',
    tutorialStep5Desc: 'Buscá el nódulo linfático secreto cerca de las paredes capilares y desbloqueá mutaciones genéticas al alcanzar hitos de masa.',
    tutorialGotIt: '¡Entendido, a jugar!',
    tutorialNext: 'Siguiente',
    tutorialPrev: 'Anterior',
    // Cytes & Shop & Organs
    cytes: 'Cytes',
    cytesEarned: 'Cytes Obtenidos',
    shopBtn: 'Tienda Cyte',
    shopTitle: 'Mercado de Cytes',
    shopSubtitle: 'Canjeá glóbulos rojos (Cytes) por skins mutantes, estelas y bio-auras',
    buyBtn: 'Comprar',
    equipped: 'Equipado',
    insufficientCytes: 'Cytes insuficientes',
    currentOrgan: 'Órgano actual',
    organBrain: 'Cerebro (Sinapsis)',
    organHeart: 'Corazón (Aorta)',
    organLungs: 'Pulmones (Alvéolos)',
    organLiver: 'Hígado (Glucógeno)',
    organStomach: 'Estómago e Intestinos',
    organKidneys: 'Riñones (Filtro)',
    organVessels: 'Vasos Sanguíneos Principales',
    territoryCovered: 'Territorio Invadido',
    conquerBtn: 'Conquistar Territorio',
    conquerDesc: 'Sacrificá masa para colonizar y renacer ágil',
    conqueredSuccess: '¡Territorio Conquistado!',
    selectBacteria: 'Elegir Bacteria',
    bacteriaTab: 'Bacterias',
    freeLabel: 'Gratis',
    // Game Over & Return
    backToHome: 'Regresar al Inicio',
    shareBtn: 'Compartir Juego',
    shareModalTitle: 'Compartir Mite.io',
    shareModalDesc: 'Invitá a tus amigos al torrente sanguíneo mediante cualquier red o app de tu dispositivo.',
    shareNativeBtn: 'Compartir en tu Dispositivo',
    copyLinkBtn: 'Copiar Enlace',
    linkCopied: '¡Enlace copiado al portapapeles!',
    // Human Host Status (Battle Mode)
    hostStatusTitle: 'Fisiología del Huésped',
    hostStatusDesc: 'Biometría en tiempo real del cuerpo humano infectado',
    hostHealthLabel: 'Salud del Huésped',
    hostFeverLabel: 'Temperatura / Fiebre',
    hostHydrationLabel: 'Hidratación',
    hostEnergyLabel: 'Energía Celular (ATP)',
    hostPusLabel: 'Exudado de Pus',
    hostSymptomsTitle: 'Síntomas Activos del Huésped',
    symptomInflammation: 'Inflamación Tisular',
    symptomPurulentExudate: 'Exudado Purulento (Pus Activo)',
    symptomFeverPeak: 'Pico Febril Vasodilatador',
    symptomCytokineStorm: 'Tormenta de Citoquinas',
    symptomImmuneSurge: 'Respuesta Inmunológica Alta',
    // Battle Mode Tutorial
    battleTutorialBtn: 'Tutorial Modo Batalla',
    battleTutorialTitle: 'Guía de Batalla: Inmune vs Infección',
    battleStep1Title: '1. Dos Bandos en Guerra',
    battleStep1Desc: 'El Sistema Inmune defiende los tejidos y purga la infección. Los Patógenos colonizan órganos y desatan toxinas.',
    battleStep2Title: '2. Fiebre y Pus en el Huésped',
    battleStep2Desc: 'Al chocar leucocitos y bacterias, se genera exudado purulento (pus) y la temperatura del cuerpo humano se eleva en picos de fiebre.',
    battleStep3Title: '3. Colonización de Órganos',
    battleStep3Desc: 'Alcanzá 100 de masa sobre un órgano (Corazón, Cerebro, Pulmones, Hígado, Bazo) para reclamarlo y asegurar bonificaciones estratégicas.',
    battleStep4Title: '4. Condición de Victoria',
    battleStep4Desc: 'El bando que logre 100% de dominancia en el torrente asegura el destino del huésped humano.',
    // 5 Aspect Upgrades up to Level 1500
    upgradeTabTitle: 'Mejoras Celulares (Nivel 1500)',
    upgradeLevelLabel: 'Nivel',
    upgradeCostLabel: 'Costo',
    upgradeMaxReached: 'Nivel Máximo (1500)',
    statAttractionTitle: 'Atracción Magnética',
    statAttractionDesc: 'Aumenta el alcance y la fuerza gravitacional para succionar nutrientes y glóbulos rojos.',
    statSpeedTitle: 'Velocidad e Hidrodinámica',
    statSpeedDesc: 'Incrementa la velocidad de nado por el plasma y la aceleración en capilares estrechos.',
    statArmorTitle: 'Armadura Inmunológica',
    statArmorDesc: 'Refuerza la membrana plasmática, reduciendo drásticamente el daño de choques y anticuerpos.',
    statMetabolismTitle: 'Metabolismo Digestivo',
    statMetabolismDesc: 'Mayor ganancia de masa al devorar nutrientes y fusión celular acelerada tras dividirte.',
    statSporesFissionTitle: 'Esporas y Fisión Balística',
    statSporesFissionDesc: 'Incrementa el alcance y velocidad de eyección [W] y la propulsión de mitosis [Espacio].',
    quickUpgrade10: '+10 Niveles',
    quickUpgrade50: '+50 Niveles',
    quickUpgradeMax: 'Máximo',
    // Boosters tab in Shop
    boostersTab: 'Potenciadores',
    boostersTitle: 'Consumibles Tácticos de Arranque',
    boostersSubtitle: 'Inyectores y sueros de biomasa para activar ventajas instantáneas en tus partidas',
    activeBooster: 'Activo para próxima partida',
    // Sharing options (Rich Social & Device Share)
    shareWhatsApp: 'WhatsApp',
    shareTelegram: 'Telegram',
    shareTwitter: 'X (Twitter)',
    shareFacebook: 'Facebook',
    shareReddit: 'Reddit',
    shareQrCode: 'Código QR Móvil',
    scanQrToPlay: 'Escaneá con tu celular para unirte al torrente',
    shareTitle: '¡Unite a la invasión celular en Mite.io!',
    shareMessageText: '¡Entrá a jugar Mite.io conmigo! Invadí el torrente sanguíneo, devorá glóbulos rojos y evolucioná en tiempo real: ',
    // Radar 2D Mobile Controls
    radarToggleBtn: 'Radar Anatómico 2D',
    radarMinimizeBtn: 'Minimizar Radar',
    radarShowBtn: 'Mostrar Mapa 2D',
    // Battle Mode & Pus & Symptoms
    pusPustules: 'Pústulas de Pus',
    cleansePus: 'Neutralizar Pus (+3% Salud)',
    absorbPus: 'Absorber Pus (+35 Masa)',
    symptomSepticShock: 'Shock Séptico Terminal',
    symptomCellNecrosis: 'Necrosis Celular Tisular',
    hostStatusBadge: 'Estado del Humano',
    humanTemperature: 'Temperatura',
    humanHydration: 'Hidratación',
    humanEnergy: 'Energía ATP',
    humanHealth: 'Salud',
    pusLevelLabel: 'Exudado de Pus',
    // Home Upgrades
    homeUpgradesBtn: 'Mejoras (Nivel 1500)',
    upgradesHeroTitle: 'Evolución & Mejoras Celulares',
    upgradesHeroSubtitle: 'Subí hasta el nivel 1500 en los 5 aspectos biológicos para dominar el torrente',
    quickUpgrade1: '+1 Nivel',
    quickUpgrade100: '+100 Niveles',
    totalAffordable: 'Máximo Posible',
    // Expanded Social Sharing
    shareLinkedIn: 'LinkedIn',
    shareDiscord: 'Discord',
    shareEmail: 'Correo Electrónico',
    shareSMS: 'Mensaje SMS',
    sharePinterest: 'Pinterest',
    shareDownloadCard: 'Descargar Tarjeta Bio',
    shareCardDownloaded: '¡Tarjeta Bio Guardada!',
    shareDiscordCopied: '¡Formato para Discord copiado al portapapeles!',
    shareDirectTitle: 'Enlace Directo & Dispositivo',
    shareSocialTitle: 'Redes Sociales & Mensajería',
    shareCardTitle: 'Tarjeta de Identidad Microbiana',
    shareCardSubtitle: 'Comparte tu tarjeta con código QR para invitar a amigos',
    // Game modes & factions
    modeFfa: 'Individual (FFA)',
    modeTeam: 'Batalla en Equipo',
    modeBots: 'Práctica con Bots',
    factionImmuneTitle: 'Sistema Inmune',
    factionImmuneDesc: 'Glóbulos blancos, macrófagos y probióticos benéficos.',
    factionPathogenTitle: 'Infección',
    factionPathogenDesc: 'Bacterias malas, virus agresivos y toxinas celulares.',
    changeBacteriaBtn: 'Cambiar Cepa',
    realMultiplayerToggle: 'Multijugador Real',
    realMultiplayerDesc: 'Solo humanos en línea',
    // PWA Modal
    installPwaBtn: 'Instalar App',
    installPwaTitle: 'Instalar Mite.io (PWA)',
    installPwaSubtitle: 'Juega a pantalla completa sin barras de navegador',
    installAndroidTitle: 'Android & Google Chrome',
    installAndroidDesc: 'Toca los tres puntos ⋮ en la esquina superior derecha y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".',
    installIosTitle: 'iPhone / iPad (iOS Safari)',
    installIosDesc: 'Toca el botón Compartir (cuadrado con flecha hacia arriba) en la barra inferior de Safari y elige "Añadir a pantalla de inicio".',
    installDesktopTitle: 'PC / Mac / Chrome / Edge',
    installDesktopDesc: 'Haz clic en el icono de Instalar en la barra de direcciones o en el menú de tres puntos > "Instalar Mite.io".',
    understoodBtn: 'Entendido',
    // In-Game HUD & Leaderboard
    leaderboardFaction: 'Líderes de Bando',
    foldTable: 'Plegar / Desplegar Tabla',
    conquerExtraCytes: '(+80 Cytes e impulso)',
    anteriorLabel: 'ANT',
    posteriorLabel: 'POST',
    hiddenCrypt: 'Cripta Linfática Oculta',
    ejectSporeHint: 'Eyectar Esporas [W]',
    splitTwoHint: 'Dividirse en dos [ESPACIO]',
    immuneDefenders: 'Defensores / Inmune',
    pathogenInfection: 'Infección / Patógenos',
    // Shop tabs & details
    totalInvested: 'Total Invertido',
    levelsLabel: 'Niveles',
    bacteriaTabTitle: 'Cepas de Bacteria',
    bundlesTabTitle: 'Conjuntos / Packs',
    skinsTabTitle: 'Aspectos Celulares',
    sporesTabTitle: 'Estilos de Esporas',
    territoryTabTitle: 'Conquista de Órganos',
    // Upgrades and Battle Tutorial extra keys
    upgradeSuccessLevel: '¡nivel(es) mejorado(s)! Nivel actual:',
    sporesRangeBase: 'Fisión base',
    speedBase: 'Velocidad base',
    armorBase: 'Blindaje estándar',
    metabolismBase: 'Metabolismo estándar',
    attractionBase: 'Atracción estándar',
    sporesRangeBonus: '% Alcance de Esporas & Mitosis',
    speedBonusLabel: '% Velocidad Base en Plasma',
    armorBonusLabel: '% Resistencia a Impactos & Anticuerpos',
    metabolismBonusLabel: '% Masa Extra al Comer',
    attractionBonusLabel: '% Radio de Atracción Magnética',
    pusPathogenEffect: 'Patógenos: +35 Masa',
    pusImmuneEffect: 'Inmune: +3% Salud +Cytes',
    pusTitle: 'Pústula de Pus',
    battleWinConditionTitle: 'Condición de Victoria',
    factionsConflictBadge: 'Facciones en Conflicto',
    hostBiometricsBadge: 'Biometría Fisiológica',
    quickBuyMode: 'Modo de Compra Rápida:',
    bioProgressLabel: 'Progreso Biológico',
    battleTacticalGuide: 'Guía Táctica de Fisiología & Infección',
    immuneFactionTutorial: 'Defiende al huésped, purga bacterias y neutraliza el pus para curar al humano.',
    pathogenFactionTutorial: 'Drena la salud del cuerpo humano, genera exudado de pus y prolifera en masa.',
    battlePusModalDesc: 'Las pústulas de pus biológico son glóbulos viscosos amarillos-verdosos que brotan en el torrente. Si eres Patógeno, absorbelas para ganar +35 de masa y aumentar la infección. Si eres Inmune, higienizalas para devolver salud al humano (+3%).',
    battleHostModalDesc: 'En la esquina superior de la pantalla monitoreás los signos vitales del huésped humano en tiempo real: Salud, Temperatura / Fiebre, Hidratación, Energía ATP y Nivel de Pus.',
    bioMarketTitle: 'Mercado Biológico',
    bioMarketSubtitle: 'Canjeá tus Cytes por cepas bacterianas, aspectos y esporas',
    currentlyEquipped: 'Equipada Actualmente',
    equipThisStrain: 'Equipar Esta Cepa',
    unlockForCytes: 'Desbloquear por',
    statPerkSpeed: 'Velocidad',
    statPerkArmor: 'Blindaje',
    statPerkConquest: 'Conquista',
    colonizedColonies: 'Colonias Anatómicas',
    bundleEquipped: 'Conjunto Equipado',
    equipBundle: 'Equipar Conjunto',
    acquireBundle: 'Adquirir Conjunto',
    upgradeFunctionsTitle: 'Funciones de Mejora Biológica',
    upgradeFunctionsSubtitle: 'Aumentá la atracción de nutrientes, velocidad, resistencia y metabolismo permanente con tus Cytes.',
    maxLevelReached5: 'Nivel Máximo (5/5)',
    upgradeToLevel: 'Mejorar a Nivel',
    inUse: 'En Uso',
    equip: 'Equipar',
    unlock: 'Desbloquear',
    humanBodyDominance: 'Dominio del Cuerpo Humano',
    conquerOrganTip: 'Alcanzá 100 de Masa durante una partida para activar el botón de Conquistar Territorio.',
    colonizedOrgansLabel: 'Órganos Colonizados',
    colonizedStatus: 'Colonizado',
    unconqueredStatus: 'Sin Conquistar',
    conquestRewardLabel: 'Recompensa de Conquista:',
    conquestRewardValue: '+80 Cytes & Impulso',
  },
  en: {
    title: 'Mite.io',
    subtitle: 'Real-time cellular invasion inside the human body. Navigate through organs, devour resources, split to ambush, and evade relentless antibodies.',
    bioZone: 'Human Body · Vascular Anatomy',
    invadeBtn: 'Invade',
    inputPlaceholder: 'Microbe name...',
    soundOn: 'Audio On',
    soundOff: 'Muted',
    massDilemma: 'Mass Dilemma',
    massDilemmaDesc: 'As mass grows, you become slower. Smaller mites are nimble and fast!',
    sporeFission: 'Cellular Fission',
    sporeFissionDesc: 'Press Space to launch half your body forward at high speed to hunt or escape.',
    antibodies: 'Patrol Antibodies',
    antibodiesDesc: 'Spiked security drones hunt giant microbes to keep the bloodstream balanced.',
    controlsTitle: 'Controls',
    controlMove: 'Mouse / WASD Move',
    controlSplit: 'Space Split',
    controlEject: 'W Eject Spore',
    controlPause: 'Esc Pause',
    cellularMass: 'Cell Mass',
    rank: 'Rank',
    cells: 'cells',
    erythrocytes: 'RBCs',
    knockouts: 'K.O.',
    antibodyWarning: 'ANTIBODY ALERT! High mass detected by security patrols',
    leadersTitle: 'Bloodstream Leaders',
    capillaryRadar: 'Anatomy Radar',
    ejectBtn: 'EJECT',
    splitBtn: 'SPLIT',
    pauseTitle: 'Paused',
    pauseSubtitle: 'Bloodstream Suspended',
    resumeBtn: 'Resume',
    restartBtn: 'Restart Game',
    gameOverTitle: 'Cell Destroyed',
    peakMass: 'Peak Mass',
    survivalTime: 'Survival Time',
    reviveBtn: 'Revive in Stream',
    tutorialBtn: 'How to Play',
    achievementsBtn: 'Achievements',
    skinsBtn: 'Skins & Spores',
    secretZoneDiscovered: 'Secret Zone Discovered: Lymphatic Nodule!',
    deviceType: 'Device detected',
    tutorialTitle: 'Cellular Invasion Guide',
    tutorialStep1Title: '1. Nutrient Absorption',
    tutorialStep1Desc: 'Swim into glowing proteins (colored dots) to gain your first levels of mass.',
    tutorialStep2Title: '2. Red Blood Cell Consumption',
    tutorialStep2Desc: 'Red blood cells provide rich mass, but you must be larger than them to consume them.',
    tutorialStep3Title: '3. Fission / Split Mechanic',
    tutorialStep3Desc: 'KEY MECHANIC! Press [SPACE] to split in half, launching one piece forward at extreme burst speed to catch smaller prey or escape. Circular rings count down until pieces safely recombine.',
    tutorialStep4Title: '4. Hazard: Patrol Antibodies',
    tutorialStep4Desc: 'If your mass exceeds 160, spiked antibodies trigger warning sirens and hunt you. Colliding shreds your membrane and causes forced fragmentation. Small mites can safely hide behind them!',
    tutorialStep5Title: '5. Secret Zone & Evolution',
    tutorialStep5Desc: 'Seek the hidden lymphatic nodule near the vascular wall valves and unlock genetic mutations at mass milestones.',
    tutorialGotIt: 'Got it, let\'s play!',
    tutorialNext: 'Next',
    tutorialPrev: 'Back',
    // Cytes & Shop & Organs
    cytes: 'Cytes',
    cytesEarned: 'Cytes Earned',
    shopBtn: 'Cyte Shop',
    shopTitle: 'Cyte Biological Market',
    shopSubtitle: 'Exchange red blood cell tokens (Cytes) for mutant skins, trails, and bio-auras',
    buyBtn: 'Purchase',
    equipped: 'Equipped',
    insufficientCytes: 'Insufficient Cytes',
    currentOrgan: 'Current Organ',
    organBrain: 'Brain (Synapses)',
    organHeart: 'Heart (Aorta)',
    organLungs: 'Lungs (Alveoli)',
    organLiver: 'Liver (Glycogen)',
    organStomach: 'Stomach & Intestines',
    organKidneys: 'Kidneys (Filtration)',
    organVessels: 'Major Vascular Arteries',
    territoryCovered: 'Territory Invaded',
    conquerBtn: 'Conquer Territory',
    conquerDesc: 'Sacrifice mass to colonize and be reborn nimble',
    conqueredSuccess: 'Territory Conquered!',
    selectBacteria: 'Select Bacteria',
    bacteriaTab: 'Bacteria',
    freeLabel: 'Free',
    // Game Over & Return
    backToHome: 'Return to Home',
    shareBtn: 'Share Game',
    shareModalTitle: 'Share Mite.io',
    shareModalDesc: 'Invite friends to the bloodstream through any social network or native device app.',
    shareNativeBtn: 'Share via Device',
    copyLinkBtn: 'Copy Link',
    linkCopied: 'Link copied to clipboard!',
    // Human Host Status (Battle Mode)
    hostStatusTitle: 'Host Human Physiology',
    hostStatusDesc: 'Real-time telemetry of the infected human body',
    hostHealthLabel: 'Host Health',
    hostFeverLabel: 'Temperature / Fever',
    hostHydrationLabel: 'Hydration',
    hostEnergyLabel: 'Cellular Energy (ATP)',
    hostPusLabel: 'Purulent Exudate (Pus)',
    hostSymptomsTitle: 'Active Host Symptoms',
    symptomInflammation: 'Tissue Inflammation',
    symptomPurulentExudate: 'Purulent Exudate (Active Pus)',
    symptomFeverPeak: 'Vasodilator Fever Spike',
    symptomCytokineStorm: 'Cytokine Storm',
    symptomImmuneSurge: 'Elevated Immune Surge',
    symptomSepticShock: 'Terminal Septic Shock',
    symptomCellNecrosis: 'Tissue Cell Necrosis',
    hostStatusBadge: 'Human Host State',
    humanTemperature: 'Temperature',
    humanHydration: 'Hydration',
    humanEnergy: 'ATP Energy',
    humanHealth: 'Health',
    pusLevelLabel: 'Pus Exudate',
    // Battle Mode Tutorial
    battleTutorialBtn: 'Battle Mode Tutorial',
    battleTutorialTitle: 'Battle Guide: Immune vs Infection',
    battleStep1Title: '1. Two Warring Factions',
    battleStep1Desc: 'The Immune System defends tissues and purges infection. Pathogens colonize organs and unleash cytotoxic toxins.',
    battleStep2Title: '2. Fever & Pus in the Host',
    battleStep2Desc: 'When leukocytes and bacteria clash, purulent exudate (pus) pools form and the human body temperature spikes in fever.',
    battleStep3Title: '3. Organ Colonization',
    battleStep3Desc: 'Reach 100 mass over an organ (Heart, Brain, Lungs, Liver, Kidneys) to claim it and secure tactical perks.',
    battleStep4Title: '4. Victory Condition',
    battleStep4Desc: 'The faction that secures 100% bloodstream dominance decides the fate of the human host.',
    // 5 Aspect Upgrades up to Level 1500
    upgradeTabTitle: 'Cellular Upgrades (Level 1500)',
    upgradeLevelLabel: 'Level',
    upgradeCostLabel: 'Cost',
    upgradeMaxReached: 'Max Level (1500)',
    statAttractionTitle: 'Magnetic Bio-Attraction',
    statAttractionDesc: 'Increases gravitational suction reach to pull proteins and red cells from greater distance.',
    statSpeedTitle: 'Speed & Hydrodynamics',
    statSpeedDesc: 'Boosts swimming velocity through plasma and acceleration in narrow capillaries.',
    statArmorTitle: 'Immune Armor Membrane',
    statArmorDesc: 'Reinforces cell wall density, drastically reducing collision knockback and antibody damage.',
    statMetabolismTitle: 'Metabolism & Digestion',
    statMetabolismDesc: 'Greater mass yield per devoured nutrient and accelerated mitosis recombination.',
    statSporesFissionTitle: 'Spores & Ballistic Fission',
    statSporesFissionDesc: 'Boosts ejection speed/range [W] and mitotic burst propulsion [Space].',
    quickUpgrade1: '+1 Level',
    quickUpgrade10: '+10 Levels',
    quickUpgrade50: '+50 Levels',
    quickUpgrade100: '+100 Levels',
    quickUpgradeMax: 'Max',
    totalAffordable: 'Max Affordable',
    homeUpgradesBtn: 'Upgrades (Level 1500)',
    upgradesHeroTitle: 'Cellular Evolution & Upgrades',
    upgradesHeroSubtitle: 'Upgrade up to level 1500 across 5 biological traits to rule the bloodstream',
    // Boosters tab in Shop
    boostersTab: 'Bio-Boosters',
    boostersTitle: 'Tactical Starter Consumables',
    boostersSubtitle: 'Biomass injectors and serums to trigger instant match perks',
    activeBooster: 'Active for next match',
    // Sharing options (Rich Social & Device Share)
    shareWhatsApp: 'WhatsApp',
    shareTelegram: 'Telegram',
    shareTwitter: 'X (Twitter)',
    shareFacebook: 'Facebook',
    shareReddit: 'Reddit',
    shareQrCode: 'Mobile QR Code',
    scanQrToPlay: 'Scan with your phone to join the bloodstream',
    shareTitle: 'Join the cellular invasion in Mite.io!',
    shareMessageText: 'Come play Mite.io with me! Invade the bloodstream, devour red cells, and evolve live: ',
    // Radar 2D Mobile Controls
    radarToggleBtn: '2D Anatomy Radar',
    radarMinimizeBtn: 'Minimize Radar',
    radarShowBtn: 'Show 2D Map',
    // Battle Mode & Pus & Symptoms
    pusPustules: 'Pus Pustules',
    cleansePus: 'Sanitize Pus (+3% Health)',
    absorbPus: 'Absorb Pus (+35 Mass)',
    // Expanded Social Sharing
    shareLinkedIn: 'LinkedIn',
    shareDiscord: 'Discord',
    shareEmail: 'Email',
    shareSMS: 'SMS Text Message',
    sharePinterest: 'Pinterest',
    shareDownloadCard: 'Download Bio Card',
    shareCardDownloaded: 'Bio Card Saved!',
    shareDiscordCopied: 'Discord invite markdown copied to clipboard!',
    shareDirectTitle: 'Direct Link & Device',
    shareSocialTitle: 'Social Networks & Direct Messaging',
    shareCardTitle: 'Microbial Identity Card',
    shareCardSubtitle: 'Share your player identity card with QR code to invite friends',
    // Game modes & factions
    modeFfa: 'Free For All (FFA)',
    modeTeam: 'Team Battle',
    modeBots: 'Bot Practice',
    factionImmuneTitle: 'Immune System',
    factionImmuneDesc: 'White blood cells, macrophages and beneficial probiotics.',
    factionPathogenTitle: 'Pathogen Infection',
    factionPathogenDesc: 'Aggressive bacteria, harmful viruses and cellular toxins.',
    changeBacteriaBtn: 'Change Strain',
    realMultiplayerToggle: 'Real Multiplayer',
    realMultiplayerDesc: 'Humans only online',
    // PWA Modal
    installPwaBtn: 'Install App',
    installPwaTitle: 'Install Mite.io (PWA)',
    installPwaSubtitle: 'Play full-screen with no browser address bar',
    installAndroidTitle: 'Android & Google Chrome',
    installAndroidDesc: 'Tap the three dots ⋮ in the top right corner and select "Install app" or "Add to Home screen".',
    installIosTitle: 'iPhone / iPad (iOS Safari)',
    installIosDesc: 'Tap the Share button (square with arrow up) in Safari bottom bar and choose "Add to Home Screen".',
    installDesktopTitle: 'PC / Mac / Chrome / Edge',
    installDesktopDesc: 'Click the Install icon in the address bar or via the three dots menu > "Install Mite.io".',
    understoodBtn: 'Got it',
    // In-Game HUD & Leaderboard
    leaderboardFaction: 'Faction Leaders',
    foldTable: 'Collapse / Expand Table',
    conquerExtraCytes: '(+80 Cytes & impulse boost)',
    anteriorLabel: 'ANT',
    posteriorLabel: 'POST',
    hiddenCrypt: 'Hidden Lymphatic Crypt',
    ejectSporeHint: 'Eject Spores [W]',
    splitTwoHint: 'Split into two [SPACE]',
    immuneDefenders: 'Defenders / Immune',
    pathogenInfection: 'Infection / Pathogens',
    // Shop tabs & details
    totalInvested: 'Total Invested',
    levelsLabel: 'Levels',
    bacteriaTabTitle: 'Bacteria Strains',
    bundlesTabTitle: 'Bundles & Packs',
    skinsTabTitle: 'Cellular Skins',
    sporesTabTitle: 'Spore Styles',
    territoryTabTitle: 'Organ Conquest',
    // Upgrades and Battle Tutorial extra keys
    upgradeSuccessLevel: 'level(s) upgraded! Current level:',
    sporesRangeBase: 'Base fission',
    speedBase: 'Base speed',
    armorBase: 'Standard membrane',
    metabolismBase: 'Standard metabolism',
    attractionBase: 'Standard suction',
    sporesRangeBonus: '% Spore Range & Mitosis Burst',
    speedBonusLabel: '% Base Velocity in Plasma',
    armorBonusLabel: '% Impact & Antibody Resistance',
    metabolismBonusLabel: '% Extra Mass from RBCs',
    attractionBonusLabel: '% Magnetic Suction Reach',
    pusPathogenEffect: 'Pathogens: +35 Mass',
    pusImmuneEffect: 'Immune: +3% Health +Cytes',
    pusTitle: 'Pus Pustule',
    battleWinConditionTitle: 'Victory Condition',
    battleWinConditionDesc: 'Colonize organs at 100 mass, collect Cytes, overcome the enemy faction and decide the fate of the human body.',
    factionsConflictBadge: 'Factions in Conflict',
    hostBiometricsBadge: 'Physiological Biometrics',
    quickBuyMode: 'Quick Buy Mode:',
    bioProgressLabel: 'Biological Progress',
    battleTacticalGuide: 'Tactical Guide: Physiology & Infection',
    immuneFactionTutorial: 'Defends host, purges bacteria and cleanses pus to heal the human.',
    pathogenFactionTutorial: 'Drains human host health, secretes pus exudate and proliferates in mass.',
    battlePusModalDesc: 'Biological pus pustules are viscous yellow-green globules that erupt in the bloodstream. If Pathogen, absorb them for +35 mass. If Immune, cleanse them to restore host health (+3%).',
    battleHostModalDesc: 'In the upper corner of the screen, monitor the human host\'s vital signs in real time: Health, Temperature / Fever, Hydration, ATP Energy, and Pus Exudate.',
    bioMarketTitle: 'Biological Market',
    bioMarketSubtitle: 'Exchange your Cytes for bacterial strains, skins and spores',
    currentlyEquipped: 'Currently Equipped',
    equipThisStrain: 'Equip This Strain',
    unlockForCytes: 'Unlock for',
    statPerkSpeed: 'Speed',
    statPerkArmor: 'Armor',
    statPerkConquest: 'Conquest',
    colonizedColonies: 'Anatomical Colonies',
    bundleEquipped: 'Bundle Equipped',
    equipBundle: 'Equip Bundle',
    acquireBundle: 'Acquire Bundle',
    upgradeFunctionsTitle: 'Biological Upgrade Functions',
    upgradeFunctionsSubtitle: 'Increase nutrient suction, speed, resistance and permanent metabolism with your Cytes.',
    maxLevelReached5: 'Max Level (5/5)',
    upgradeToLevel: 'Upgrade to Level',
    inUse: 'In Use',
    equip: 'Equip',
    unlock: 'Unlock',
    humanBodyDominance: 'Human Body Dominance',
    conquerOrganTip: 'Reach 100 Mass during a match to activate the Conquer Territory button.',
    colonizedOrgansLabel: 'Colonized Organs',
    colonizedStatus: 'Colonized',
    unconqueredStatus: 'Unconquered',
    conquestRewardLabel: 'Conquest Reward:',
    conquestRewardValue: '+80 Cytes & Boost',
  },
  pt: {
    title: 'Mite.io',
    subtitle: 'Invasão celular em tempo real no fluxo sanguíneo. Devore recursos, divida-se para emboscar e fuja dos anticorpos.',
    bioZone: 'Biosfera Vascular 01 · Fluxo Ativo',
    invadeBtn: 'Invadir',
    inputPlaceholder: 'Nome do micróbio...',
    soundOn: 'Áudio Ativo',
    soundOff: 'Mudo',
    massDilemma: 'Dilema de Massa',
    massDilemmaDesc: 'Mais massa deixa você mais lento. Micróbios menores são ágeis!',
    sporeFission: 'Fissão Celular',
    sporeFissionDesc: 'Pressione Espaço para lançar metade do corpo para frente com grande impulso.',
    antibodies: 'Anticorpos Patrulha',
    antibodiesDesc: 'Caçam micróbios gigantes com espinhos para equilibrar o mapa.',
    controlsTitle: 'Controles',
    controlMove: 'Mouse / WASD Mover',
    controlSplit: 'Espaço Dividir',
    controlEject: 'W Ejetar Esporo',
    controlPause: 'Esc Pausa',
    cellularMass: 'Massa Celular',
    rank: 'Posição',
    cells: 'células',
    erythrocytes: 'glóbulos',
    knockouts: 'K.O.',
    antibodyWarning: 'ALERTA DE ANTICORPO! Massa excessiva detectada',
    leadersTitle: 'Líderes do Fluxo',
    capillaryRadar: 'Radar Capilar',
    ejectBtn: 'EJETAR',
    splitBtn: 'DIVIDIR',
    pauseTitle: 'Pausa',
    pauseSubtitle: 'Fluxo Sanguíneo Suspenso',
    resumeBtn: 'Retomar',
    restartBtn: 'Reiniciar',
    gameOverTitle: 'Célula Destruída',
    peakMass: 'Massa Máxima',
    survivalTime: 'Sobrevivência',
    reviveBtn: 'Renascer no Fluxo',
    tutorialBtn: 'Como Jogar',
    achievementsBtn: 'Conquistas',
    skinsBtn: 'Estilos e Esporos',
    secretZoneDiscovered: 'Zona Secreta Encontrada: Nódulo Linfático!',
    deviceType: 'Dispositivo detectado',
    tutorialTitle: 'Guia de Invasão',
    tutorialStep1Title: '1. Absorção de Nutrientes',
    tutorialStep1Desc: 'Nade até as proteínas brilhantes para absorver massa inicial.',
    tutorialStep2Title: '2. Consumo de Glóbulos Vermelhos',
    tutorialStep2Desc: 'Glóbulos vermelhos dão muita massa quando você for maior que eles.',
    tutorialStep3Title: '3. Divisão Celular (Espaço)',
    tutorialStep3Desc: 'Pressione [ESPAÇO] para disparar metade do corpo para a frente a alta velocidade.',
    tutorialStep4Title: '4. Perigo: Anticorpos Patrulha',
    tutorialStep4Desc: 'Se sua massa passar de 160, anticorpos com espinhos vão te caçar.',
    tutorialStep5Title: '5. Zonas Secretas e Mutações',
    tutorialStep5Desc: 'Encontre o nódulo secreto e desbloqueie mutações ao bater recordes de massa.',
    tutorialGotIt: 'Entendido, vamos lá!',
    tutorialNext: 'Próximo',
    tutorialPrev: 'Voltar',
  },
  fr: {
    title: 'Mite.io',
    subtitle: 'Invasion cellulaire en temps réel dans la circulation sanguine. Dévorez des nutriments, divisez-vous et fuyez les anticorps.',
    bioZone: 'Biosphère Vasculaire 01 · Flux Actif',
    invadeBtn: 'Envahir',
    inputPlaceholder: 'Nom du microbe...',
    soundOn: 'Son Actif',
    soundOff: 'Muet',
    massDilemma: 'Dilemme de Masse',
    massDilemmaDesc: 'Plus vous grossissez, plus vous ralentissez. Les petites cellules sont très agiles !',
    sporeFission: 'Fission Cellulaire',
    sporeFissionDesc: 'Appuyez sur Espace pour propulser la moitié de votre masse vers l\'avant.',
    antibodies: 'Anticorps Patrouilleurs',
    antibodiesDesc: 'Traquent les microbes géants avec des piquants biologiques.',
    controlsTitle: 'Contrôles',
    controlMove: 'Souris / ZQSD Se déplacer',
    controlSplit: 'Espace Diviser',
    controlEject: 'W Éjecter Spore',
    controlPause: 'Échap Pause',
    cellularMass: 'Masse',
    rank: 'Rang',
    cells: 'cellules',
    erythrocytes: 'globules',
    knockouts: 'K.O.',
    antibodyWarning: 'ALERTE ANTICORPS ! Masse excessive détectée',
    leadersTitle: 'Classement',
    capillaryRadar: 'Radar Capillaire',
    ejectBtn: 'ÉJECTER',
    splitBtn: 'DIVISER',
    pauseTitle: 'Pause',
    pauseSubtitle: 'Circulation Suspendue',
    resumeBtn: 'Reprendre',
    restartBtn: 'Recommencer',
    gameOverTitle: 'Cellule Détruite',
    peakMass: 'Masse Max',
    survivalTime: 'Survie',
    reviveBtn: 'Renaître',
    tutorialBtn: 'Tutoriel',
    achievementsBtn: 'Succès',
    skinsBtn: 'Apparences',
    secretZoneDiscovered: 'Zone Secrète Découverte : Nodule Lymphatique !',
    deviceType: 'Appareil détecté',
    tutorialTitle: 'Guide d\'Invasion',
    tutorialStep1Title: '1. Absorption des nutriments',
    tutorialStep1Desc: 'Absorbez les protéines colorées pour grandir rapidement.',
    tutorialStep2Title: '2. Dévoration des globules rouges',
    tutorialStep2Desc: 'Les globules rouges offrent une masse immense une fois plus gros qu\'eux.',
    tutorialStep3Title: '3. Fission [Espace]',
    tutorialStep3Desc: 'Projette la moitié de votre corps vers l\'avant à grande vitesse pour chasser ou fuir.',
    tutorialStep4Title: '4. Anticorps patrouilleurs',
    tutorialStep4Desc: 'Dès 160 de masse, les anticorps fondent sur vous pour déchiqueter votre membrane.',
    tutorialStep5Title: '5. Secrets & Évolution',
    tutorialStep5Desc: 'Découvrez la zone secrète près des parois vasculaires pour muter.',
    tutorialGotIt: 'Compris, jouons !',
    tutorialNext: 'Suivant',
    tutorialPrev: 'Précédent',
  },
  de: {
    title: 'Mite.io',
    subtitle: 'Echtzeit-Zellinvasion im menschlichen Blutkreislauf. Verschlinge Nährstoffe, teile dich und meide Antikörper.',
    bioZone: 'Vaskuläre Biosphäre 01 · Aktiver Strom',
    invadeBtn: 'Eindringen',
    inputPlaceholder: 'Mikrobenname...',
    soundOn: 'Audio Ein',
    soundOff: 'Stumm',
    massDilemma: 'Masse-Dilemma',
    massDilemmaDesc: 'Mehr Masse macht dich langsamer. Kleine Milben sind flink!',
    sporeFission: 'Zellteilung',
    sporeFissionDesc: 'Leertaste drücken, um die Hälfte des Körpers nach vorne zu katapultieren.',
    antibodies: 'Patrouillen-Antikörper',
    antibodiesDesc: 'Jagen Riesenmikroben mit Dornen, um das Spiel auszugleichen.',
    controlsTitle: 'Steuerung',
    controlMove: 'Maus / WASD Bewegen',
    controlSplit: 'Leertaste Teilen',
    controlEject: 'W Spore abwerfen',
    controlPause: 'Esc Pause',
    cellularMass: 'Zellmasse',
    rank: 'Rang',
    cells: 'Zellen',
    erythrocytes: 'Erythrozyten',
    knockouts: 'K.O.',
    antibodyWarning: 'ANTIKÖRPER-ALARM! Hohe Masse entdeckt',
    leadersTitle: 'Bestenliste',
    capillaryRadar: 'Kapillarradar',
    ejectBtn: 'ABWERFEN',
    splitBtn: 'TEILEN',
    pauseTitle: 'Pause',
    pauseSubtitle: 'Blutstrom angehalten',
    resumeBtn: 'Fortsetzen',
    restartBtn: 'Neustart',
    gameOverTitle: 'Zelle zerstört',
    peakMass: 'Spitzenmasse',
    survivalTime: 'Überlebenszeit',
    reviveBtn: 'Wiederbeleben',
    tutorialBtn: 'Anleitung',
    achievementsBtn: 'Erfolge',
    skinsBtn: 'Stile & Sporen',
    secretZoneDiscovered: 'Geheime Zone entdeckt: Lymphknoten!',
    deviceType: 'Gerät erkannt',
    tutorialTitle: 'Invasionshandbuch',
    tutorialStep1Title: '1. Nährstoffe sammeln',
    tutorialStep1Desc: 'Schwimme in leuchtende Proteine für erste Masse.',
    tutorialStep2Title: '2. Rote Blutkörperchen',
    tutorialStep2Desc: 'Erythrozyten geben gewaltige Masse ab.',
    tutorialStep3Title: '3. Zellteilung (Leertaste)',
    tutorialStep3Desc: 'Katapultiert eine Hälfte schnell nach vorne.',
    tutorialStep4Title: '4. Antikörper-Gefahr',
    tutorialStep4Desc: 'Ab 160 Masse jagen dich spitze Antikörper gnadenlos.',
    tutorialStep5Title: '5. Geheimnisse',
    tutorialStep5Desc: 'Finde den geheimen Lymphknoten an den Gefäßwänden.',
    tutorialGotIt: 'Verstanden!',
    tutorialNext: 'Weiter',
    tutorialPrev: 'Zurück',
  },
  it: {
    title: 'Mite.io',
    subtitle: 'Invasione cellulare in tempo reale nel flusso sanguigno. Divora risorse, dividiti e sfuggi agli anticorpi.',
    bioZone: 'Biosfera Vascolare 01 · Flusso Attivo',
    invadeBtn: 'Invadere',
    inputPlaceholder: 'Nome del microbo...',
    soundOn: 'Audio Attivo',
    soundOff: 'Muto',
    massDilemma: 'Dilemma della Massa',
    massDilemmaDesc: 'Più cresci, più sei lento. I piccoli microbi sono agili!',
    sporeFission: 'Fissione Cellulare',
    sporeFissionDesc: 'Premi Spazio per scagliare metà del corpo in avanti per cacciare.',
    antibodies: 'Anticorpi di Pattuglia',
    antibodiesDesc: 'Droni spinati cacciano i microbi giganti per bilanciare la mappa.',
    controlsTitle: 'Controlli',
    controlMove: 'Mouse / WASD Muoviti',
    controlSplit: 'Spazio Dividiti',
    controlEject: 'W Espelli Spora',
    controlPause: 'Esc Pausa',
    cellularMass: 'Massa',
    rank: 'Grado',
    cells: 'cellule',
    erythrocytes: 'globuli',
    knockouts: 'K.O.',
    antibodyWarning: 'ALLARME ANTICORPI! Massa elevata rilevata',
    leadersTitle: 'Classifica',
    capillaryRadar: 'Radar Capillare',
    ejectBtn: 'ESPELLI',
    splitBtn: 'DIVIDI',
    pauseTitle: 'Pausa',
    pauseSubtitle: 'Flusso Sospeso',
    resumeBtn: 'Riprendi',
    restartBtn: 'Ricomincia',
    gameOverTitle: 'Cellula Distrutta',
    peakMass: 'Massa Massima',
    survivalTime: 'Sopravvivenza',
    reviveBtn: 'Rinasci',
    tutorialBtn: 'Tutorial',
    achievementsBtn: 'Obiettivi',
    skinsBtn: 'Stili & Spore',
    secretZoneDiscovered: 'Zona Segreta Trovata: Nodulo Linfatico!',
    deviceType: 'Dispositivo rilevato',
    tutorialTitle: 'Guida all\'Invasione',
    tutorialStep1Title: '1. Assorbimento Nutrienti',
    tutorialStep1Desc: 'Mangia proteine luminose per iniziare a crescere.',
    tutorialStep2Title: '2. Globuli Rossi',
    tutorialStep2Desc: 'Forniscono enorme massa quando sei più grande di loro.',
    tutorialStep3Title: '3. Fissione Cellulare [Spazio]',
    tutorialStep3Desc: 'Lancia una metà in avanti a grande velocità.',
    tutorialStep4Title: '4. Pericolo Anticorpi',
    tutorialStep4Desc: 'Oltre 160 di massa, gli anticorpi spinati ti attaccheranno.',
    tutorialStep5Title: '5. Segreti ed Evoluzione',
    tutorialStep5Desc: 'Trova il nodulo linfatico segreto lungo le pareti dei vasi.',
    tutorialGotIt: 'Capito, giochiamo!',
    tutorialNext: 'Avanti',
    tutorialPrev: 'Indietro',
  },
  ru: {
    title: 'Mite.io',
    subtitle: 'Клеточная битва в реальном времени в кровотоке человека. Поглощайте питательные вещества, делитесь и избегайте антител.',
    bioZone: 'Сосудистая биосфера 01 · Активный кровоток',
    invadeBtn: 'Вторгнуться',
    inputPlaceholder: 'Имя микроба...',
    soundOn: 'Звук Вкл',
    soundOff: 'Без звука',
    massDilemma: 'Дилемма массы',
    massDilemmaDesc: 'С ростом массы скорость падает. Мелкие микробы проворнее!',
    sporeFission: 'Клеточное деление',
    sporeFissionDesc: 'Пробел запускает половину тела вперед с ускорением для атаки.',
    antibodies: 'Патрульные антитела',
    antibodiesDesc: 'Охотятся на крупных микробов с шипами для баланса карты.',
    controlsTitle: 'Управление',
    controlMove: 'Мышь / WASD Движение',
    controlSplit: 'Пробел Разделение',
    controlEject: 'W Сброс споры',
    controlPause: 'Esc Пауза',
    cellularMass: 'Масса',
    rank: 'Ранг',
    cells: 'клетки',
    erythrocytes: 'эритроциты',
    knockouts: 'K.O.',
    antibodyWarning: 'ТРЕВОГА АНТИТЕЛ! Обнаружена огромная масса',
    leadersTitle: 'Таблица лидеров',
    capillaryRadar: 'Капиллярный радар',
    ejectBtn: 'СБРОС',
    splitBtn: 'ДЕЛЕНИЕ',
    pauseTitle: 'Пауза',
    pauseSubtitle: 'Кровоток остановлен',
    resumeBtn: 'Продолжить',
    restartBtn: 'Начать заново',
    gameOverTitle: 'Клетка уничтожена',
    peakMass: 'Пик массы',
    survivalTime: 'Выживание',
    reviveBtn: 'Возродиться',
    tutorialBtn: 'Как играть',
    achievementsBtn: 'Достижения',
    skinsBtn: 'Скины и споры',
    secretZoneDiscovered: 'Секретная зона: Лимфатический узел!',
    deviceType: 'Устройство',
    tutorialTitle: 'Руководство вторжения',
    tutorialStep1Title: '1. Поглощение белков',
    tutorialStep1Desc: 'Собирайте светящиеся белки для набора массы.',
    tutorialStep2Title: '2. Эритроциты',
    tutorialStep2Desc: 'Красные кровяные клетки дают гигантский запас массы.',
    tutorialStep3Title: '3. Разделение [Пробел]',
    tutorialStep3Desc: 'Запускает половину клетки на высокой скорости для захвата добычи.',
    tutorialStep4Title: '4. Патрульные антитела',
    tutorialStep4Desc: 'При массе более 160 шипастые антитела разрывают мембрану.',
    tutorialStep5Title: '5. Секреты',
    tutorialStep5Desc: 'Найдите скрытый лимфатический узел у стенки сосуда.',
    tutorialGotIt: 'Понятно, в бой!',
    tutorialNext: 'Далее',
    tutorialPrev: 'Назад',
  },
  ja: {
    title: 'Mite.io',
    subtitle: '血流内でのリアルタイム細胞侵略ゲーム。栄養を吸収し、分裂して獲物を捕食し、抗体を回避せよ。',
    bioZone: '血管バイオスフィア 01 · 血流循環中',
    invadeBtn: '侵略開始',
    inputPlaceholder: '微生物の名前...',
    soundOn: '音声オン',
    soundOff: 'ミュート',
    massDilemma: '質量のジレンマ',
    massDilemmaDesc: '巨大化すると移動速度が遅くなります。小さな細胞は俊敏です！',
    sporeFission: '細胞分裂',
    sporeFissionDesc: 'スペースキーで体の半分を前方へ高速射出して追撃・脱出します。',
    antibodies: 'パトロール抗体',
    antibodiesDesc: '巨大化した微生物をとげ付き抗体が追跡してゲームバランスを維持します。',
    controlsTitle: '操作方法',
    controlMove: 'マウス / WASD 移動',
    controlSplit: 'スペース 分裂',
    controlEject: 'W 胞子放出',
    controlPause: 'Esc 一時停止',
    cellularMass: '細胞質量',
    rank: '順位',
    cells: '細胞数',
    erythrocytes: '赤血球',
    knockouts: '撃破',
    antibodyWarning: '抗体警告！巨大質量が検知されました',
    leadersTitle: '血流ランキング',
    capillaryRadar: '毛細血管レーダー',
    ejectBtn: '放出',
    splitBtn: '分裂',
    pauseTitle: '一時停止',
    pauseSubtitle: '血流が静止中',
    resumeBtn: '再開',
    restartBtn: '最初から',
    gameOverTitle: '細胞消滅',
    peakMass: '最大質量',
    survivalTime: '生存時間',
    reviveBtn: 'リスポーン',
    tutorialBtn: 'チュートリアル',
    achievementsBtn: '実績',
    skinsBtn: 'スキン・胞子',
    secretZoneDiscovered: '隠しエリア発見：リンパ節ゾーン！',
    deviceType: '検知デバイス',
    tutorialTitle: '侵略ガイド',
    tutorialStep1Title: '1. タンパク質の吸収',
    tutorialStep1Desc: '光るタンパク質を吸収して質量を増やしましょう。',
    tutorialStep2Title: '2. 赤血球の捕食',
    tutorialStep2Desc: '赤血球は巨大な質量を与えますが、それ以上のサイズが必要です。',
    tutorialStep3Title: '3. 分裂アクション [スペース]',
    tutorialStep3Desc: 'スペースキーで半分を高速発射！獲物を急襲したりピンチを脱出できます。',
    tutorialStep4Title: '4. 危険：トゲ抗体',
    tutorialStep4Desc: '質量160を超えると、抗体がサイレンを鳴らして突撃してきます。',
    tutorialStep5Title: '5. 秘密のゾーンと突然変異',
    tutorialStep5Desc: '血管の壁にある隠しリンパ節を見つけて強力な変異を獲得しましょう。',
    tutorialGotIt: '了解、プレイする！',
    tutorialNext: '次へ',
    tutorialPrev: '戻る',
  },
  ko: {
    title: 'Mite.io',
    subtitle: '혈류 속 실시간 세포 침공 게임. 자원을 흡수하고 분열하여 사냥하며 항체를 회피하세요.',
    bioZone: '혈관 바이오스피어 01 · 혈류 활성',
    invadeBtn: '침공 시작',
    inputPlaceholder: '미생물 이름...',
    soundOn: '오디오 켜짐',
    soundOff: '음소거',
    massDilemma: '질량의 딜레마',
    massDilemmaDesc: '질량이 커질수록 느려집니다. 작은 미생물은 민첩합니다!',
    sporeFission: '세포 분열',
    sporeFissionDesc: '스페이스바를 눌러 몸의 절반을 앞으로 발사하여 사냥하거나 탈출하세요.',
    antibodies: '순찰 항체',
    antibodiesDesc: '거대 미생물을 추적하여 찢어발기는 면역 방어체입니다.',
    controlsTitle: '조작법',
    controlMove: '마우스 / WASD 이동',
    controlSplit: '스페이스 분열',
    controlEject: 'W 포자 방출',
    controlPause: 'Esc 일시정지',
    cellularMass: '세포 질량',
    rank: '순위',
    cells: '세포수',
    erythrocytes: '적혈구',
    knockouts: '처치',
    antibodyWarning: '항체 경보! 거대 질량이 감지되었습니다',
    leadersTitle: '혈류 리더보드',
    capillaryRadar: '모세혈관 레이더',
    ejectBtn: '방출',
    splitBtn: '분열',
    pauseTitle: '일시정지',
    pauseSubtitle: '혈류 정지됨',
    resumeBtn: '계속하기',
    restartBtn: '다시하기',
    gameOverTitle: '세포 파괴됨',
    peakMass: '최대 질량',
    survivalTime: '생존 시간',
    reviveBtn: '부활하기',
    tutorialBtn: '튜토리얼',
    achievementsBtn: '업적',
    skinsBtn: '스킨 및 포자',
    secretZoneDiscovered: '비밀 구역 발견: 림프절 노듈!',
    deviceType: '감지된 기기',
    tutorialTitle: '침공 가이드',
    tutorialStep1Title: '1. 영양소 흡수',
    tutorialStep1Desc: '빛나는 단백질을 흡수하여 크기를 키우세요.',
    tutorialStep2Title: '2. 적혈구 사냥',
    tutorialStep2Desc: '적혈구는 엄청난 질량을 제공합니다.',
    tutorialStep3Title: '3. 분열 메커니즘 [스페이스]',
    tutorialStep3Desc: '스페이스바로 반을 발사하여 빠르게 상대를 집어삼키세요.',
    tutorialStep4Title: '4. 순찰 항체 위험',
    tutorialStep4Desc: '질량 160 이상이 되면 가시 항체가 추적합니다.',
    tutorialStep5Title: '5. 비밀 구역과 돌연변이',
    tutorialStep5Desc: '혈관 벽 근처의 비밀 림프절을 찾아 돌연변이를 잠금 해제하세요.',
    tutorialGotIt: '알겠습니다!',
    tutorialNext: '다음',
    tutorialPrev: '이전',
  },
  'zh-CN': {
    title: 'Mite.io',
    subtitle: '人体血管内的实时细胞生存竞争。吞噬养分，分裂突袭，躲避致命抗体巡逻。',
    bioZone: '血管生物圈 01 · 活跃血流',
    invadeBtn: '开始侵入',
    inputPlaceholder: '微生物名称...',
    soundOn: '声音开启',
    soundOff: '静音',
    massDilemma: '质量困境',
    massDilemmaDesc: '质量越大速度越慢。小型微生物更加敏捷！',
    sporeFission: '细胞分裂',
    sporeFissionDesc: '按空格键向前高速射出半数质量，用于猎杀或逃跑。',
    antibodies: '巡逻抗体',
    antibodiesDesc: '带有尖刺的巡逻抗体会追捕巨大微生物以维持平衡。',
    controlsTitle: '操作指南',
    controlMove: '鼠标 / WASD 移动',
    controlSplit: '空格 分裂',
    controlEject: 'W 喷射孢子',
    controlPause: 'Esc 暂停',
    cellularMass: '细胞质量',
    rank: '排名',
    cells: '细胞数',
    erythrocytes: '红细胞',
    knockouts: '击杀',
    antibodyWarning: '抗体警报！检测到过大质量',
    leadersTitle: '血流霸主榜',
    capillaryRadar: '毛细血管雷达',
    ejectBtn: '喷射',
    splitBtn: '分裂',
    pauseTitle: '游戏暂停',
    pauseSubtitle: '血管流动已暂停',
    resumeBtn: '继续',
    restartBtn: '重新开始',
    gameOverTitle: '细胞破裂消亡',
    peakMass: '峰值质量',
    survivalTime: '存活时间',
    reviveBtn: '重新进入血流',
    tutorialBtn: '玩法教学',
    achievementsBtn: '成就系统',
    skinsBtn: '皮肤与孢子',
    secretZoneDiscovered: '发现隐秘区域：淋巴微管结！',
    deviceType: '当前设备',
    tutorialTitle: '侵入指引',
    tutorialStep1Title: '1. 吸收养分',
    tutorialStep1Desc: '游向发光的蛋白质微粒获取初始质量。',
    tutorialStep2Title: '2. 吞噬红细胞',
    tutorialStep2Desc: '红细胞蕴含巨大养分，但体型必须大于它才能吞噬。',
    tutorialStep3Title: '3. 分裂爆发 [空格键]',
    tutorialStep3Desc: '核心技巧！按空格将一半身体向前高速弹射，用于突袭追捕或急速逃脱。倒计时结束后两半细胞会自动重新融合。',
    tutorialStep4Title: '4. 危机：尖刺抗体',
    tutorialStep4Desc: '质量超过160后，抗体会开启警报追踪你，撞击会撕裂细胞并扣除大量质量。弱小微生物可借其掩护！',
    tutorialStep5Title: '5. 隐秘结区与基因变异',
    tutorialStep5Desc: '在血管壁裂缝处寻找隐秘淋巴结，解锁专属基因进化。',
    tutorialGotIt: '了解，马上开始！',
    tutorialNext: '下一步',
    tutorialPrev: '上一步',
  },
  'zh-TW': {
    title: 'Mite.io',
    subtitle: '人體血流中的即時細胞爭霸。吞噬養分，分裂突襲，躲避致命抗體巡邏。',
    bioZone: '血管生態圈 01 · 活躍血流',
    invadeBtn: '展開侵略',
    inputPlaceholder: '微生物名稱...',
    soundOn: '音效開啟',
    soundOff: '靜音',
    massDilemma: '質量困境',
    massDilemmaDesc: '質量越大移動越緩慢。小型微生物更靈敏！',
    sporeFission: '細胞分裂',
    sporeFissionDesc: '按下空白鍵向前高速射出半數質量，進行獵殺或脫逃。',
    antibodies: '巡邏抗體',
    antibodiesDesc: '帶刺的抗體巡警會主動追捕巨大微生物。',
    controlsTitle: '操作',
    controlMove: '滑鼠 / WASD 移動',
    controlSplit: '空白鍵 分裂',
    controlEject: 'W 噴射孢子',
    controlPause: 'Esc 暫停',
    cellularMass: '細胞質量',
    rank: '名次',
    cells: '細胞數',
    erythrocytes: '紅血球',
    knockouts: '擊倒',
    antibodyWarning: '抗體警戒！偵測到龐大微生物',
    leadersTitle: '血流風雲榜',
    capillaryRadar: '毛細血管雷達',
    ejectBtn: '噴射',
    splitBtn: '分裂',
    pauseTitle: '暫停中',
    pauseSubtitle: '血管暫時休眠',
    resumeBtn: '繼續',
    restartBtn: '重新挑戰',
    gameOverTitle: '細胞遭分解',
    peakMass: '巔峰質量',
    survivalTime: '生存時間',
    reviveBtn: '重生血流中',
    tutorialBtn: '遊戲教學',
    achievementsBtn: '成就榮譽',
    skinsBtn: '造型與孢子',
    secretZoneDiscovered: '尋獲神秘區域：淋巴微管！',
    deviceType: '偵測裝置',
    tutorialTitle: '侵略者指引',
    tutorialStep1Title: '1. 吸收養分',
    tutorialStep1Desc: '游向彩色發光蛋白質獲取成長質量。',
    tutorialStep2Title: '2. 吞噬紅血球',
    tutorialStep2Desc: '紅血球能帶來大量質量，但必須比它大才能吞噬。',
    tutorialStep3Title: '3. 空白鍵分裂機制',
    tutorialStep3Desc: '按空白鍵爆發射出半身，倒數結束後會再度融合。',
    tutorialStep4Title: '4. 避開巡邏抗體',
    tutorialStep4Desc: '質量超過160時會被帶刺抗體鎖定獵殺。',
    tutorialStep5Title: '5. 秘境與基因進化',
    tutorialStep5Desc: '探索血管邊界的隱蔽微管，解鎖基因進化能力。',
    tutorialGotIt: '了解，開始作戰！',
    tutorialNext: '下一頁',
    tutorialPrev: '上一頁',
  },
  // Default fallback helper generating smooth consistent strings for remaining languages
};

// Fallback generator for all 35 languages so every supported language has working strings
export function getTranslations(langCode: string): TranslationStrings {
  const es = TRANSLATIONS['es'] as TranslationStrings;
  const en = (TRANSLATIONS['en'] || {}) as Partial<TranslationStrings>;
  const base = (langCode || '').split('-')[0];
  const baseTrans = (TRANSLATIONS[base] || {}) as Partial<TranslationStrings>;
  const exactTrans = (TRANSLATIONS[langCode] || {}) as Partial<TranslationStrings>;

  // If user is in Spanish locale, use Spanish as top priority, else English default with translations
  if (langCode.toLowerCase().startsWith('es')) {
    return { ...en, ...es, ...baseTrans, ...exactTrans };
  }
  return { ...es, ...en, ...baseTrans, ...exactTrans };
}

// Detect user's device language automatically
export function detectDeviceLanguage(): string {
  try {
    const navLang = navigator.language || (navigator.languages && navigator.languages[0]);
    if (!navLang) return 'es';

    // Direct exact match
    const exactMatch = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === navLang.toLowerCase());
    if (exactMatch) return exactMatch.code;

    // Base match (e.g. 'es-MX' -> 'es')
    const baseCode = navLang.split('-')[0].toLowerCase();
    const baseMatch = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase().startsWith(baseCode));
    if (baseMatch) return baseMatch.code;

    return 'es';
  } catch {
    return 'es';
  }
}

// Detect device form factor (PC Desktop, Tablet, Mobile Phone)
export function detectDeviceType(): 'Móvil' | 'Tablet' | 'Desktop' {
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || (width >= 640 && width <= 1024 && 'ontouchstart' in window)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua) || width < 640) {
    return 'Móvil';
  }
  return 'Desktop';
}
