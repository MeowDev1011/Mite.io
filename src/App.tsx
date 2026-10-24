/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GameEngine } from './game/engine';
import { soundEngine } from './audio/soundEngine';
import { profileStorage, CytesRewardBreakdown } from './storage/profileStorage';
import { GameState, GameStats, LeaderboardEntry, MutationId, GameMode, Faction, RoomInvitation } from './game/types';
import { detectDeviceLanguage, getTranslations } from './i18n/languages';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { EvolutionModal } from './components/EvolutionModal';
import { TutorialModal } from './components/TutorialModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SkinsModal } from './components/SkinsModal';
import { ShopModal } from './components/ShopModal';
import { AchievementToast } from './components/AchievementToast';
import { ActivePlayersModal } from './components/ActivePlayersModal';
import { InvitationToast } from './components/InvitationToast';
import { VirtualJoystick } from './components/VirtualJoystick';
import { BattleTutorialModal } from './components/BattleTutorialModal';
import { HomeUpgradesModal } from './components/HomeUpgradesModal';
import { ShareModal } from './components/ShareModal';
import { ReportModal } from './components/ReportModal';
import { DevAdminModal } from './components/DevAdminModal';
import { DailyLeaderboardModal } from './components/DailyLeaderboardModal';
import { reportStorage, InteractiveWarningEntry } from './storage/reportStorage';
import { AlertTriangle, Send, Ban } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Internationalization state (strictly auto-detects device language, no manual in-game selector)
  const [currentLang, setCurrentLang] = useState<string>(() => detectDeviceLanguage());

  useEffect(() => {
    const detected = detectDeviceLanguage();
    setCurrentLang(detected);
    profileStorage.setPreferredLanguage(detected);

    const onLangChange = () => {
      const next = detectDeviceLanguage();
      setCurrentLang(next);
      profileStorage.setPreferredLanguage(next);
    };
    window.addEventListener('languagechange', onLangChange);
    return () => window.removeEventListener('languagechange', onLangChange);
  }, []);

  const t = useMemo(() => getTranslations(currentLang), [currentLang]);

  // React state for HUD and modals
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [antibodyAlert, setAntibodyAlert] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [pendingMilestone, setPendingMilestone] = useState<number | null>(null);
  const [currentMutations, setCurrentMutations] = useState<Set<MutationId>>(new Set());

  // Additional Modals & Multiplayer State
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showSkins, setShowSkins] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showActivePlayers, setShowActivePlayers] = useState<boolean>(false);
  const [activeInvitation, setActiveInvitation] = useState<RoomInvitation | null>(null);
  const [activePlayerCount, setActivePlayerCount] = useState<number>(1);
  const [inviteToast, setInviteToast] = useState<string | null>(null);
  const [achievementToastId, setAchievementToastId] = useState<string | null>(null);
  const [currentOrgan, setCurrentOrgan] = useState<string>('Corazón (Aorta)');
  const [lastReward, setLastReward] = useState<CytesRewardBreakdown | null>(null);
  const [showBattleTutorial, setShowBattleTutorial] = useState<boolean>(false);
  const [showHomeUpgrades, setShowHomeUpgrades] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showDevModal, setShowDevModal] = useState<boolean>(false);
  const [showDailyLeaderboard, setShowDailyLeaderboard] = useState<boolean>(false);
  const [isCurrentUserDev, setIsCurrentUserDev] = useState<boolean>(() => reportStorage.getDevConfig().isDev);
  const achievementQueueRef = useRef<string[]>([]);
  const isShowingAchToastRef = useRef<boolean>(false);
  const liveGameStateRef = useRef<GameState>(gameState);
  const liveOrganRef = useRef<string>(currentOrgan);
  const liveStatsRef = useRef<GameStats | null>(stats);

  useEffect(() => {
    liveGameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    liveOrganRef.current = currentOrgan;
  }, [currentOrgan]);

  useEffect(() => {
    liveStatsRef.current = stats;
  }, [stats]);

  // Real-time Moderation & Interactive Warning State
  const [activeInteractiveWarning, setActiveInteractiveWarning] = useState<InteractiveWarningEntry | null>(null);
  const [warningAnswerInput, setWarningAnswerInput] = useState<string>('');
  const [banStatusMessage, setBanStatusMessage] = useState<string | null>(null);
  const lastModTriggersRef = useRef<{
    drainMass: number;
    boostMass: number;
    cytesOverride: number;
    resetUpgrades: number;
    stripOrgans: number;
    resetSkins: number;
    forcedName: number;
    kickMatch: number;
  }>({
    drainMass: 0,
    boostMass: 0,
    cytesOverride: 0,
    resetUpgrades: 0,
    stripOrgans: 0,
    resetSkins: 0,
    forcedName: 0,
    kickMatch: 0,
  });

  // Entities positions for radar minimap, King tracking, and offscreen indicators
  const [radarData, setRadarData] = useState<{
    playerPos: { x: number; y: number };
    antibodies: { x: number; y: number; alert: number }[];
    otherMicrobes: { x: number; y: number; isBig: boolean; isKing?: boolean }[];
    kingPos: { x: number; y: number; isPlayer: boolean; mass: number } | null;
    nearbyMicrobes: { x: number; y: number; mass: number; isLarger: boolean }[];
  }>({
    playerPos: { x: 0, y: 0 },
    antibodies: [],
    otherMicrobes: [],
    kingPos: null,
    nearbyMicrobes: [],
  });

  // Initialize Game Engine on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.onStateChange = (nextState: GameState) => {
      setGameState(nextState);
    };

    engine.onStatsUpdate = (newStats: GameStats) => {
      setStats(newStats);
      if (engine.player && engine.player.pieces.length > 0) {
        const centroid = engine.calculateCentroid(engine.player);
        const kingData = engine.getKingData();
        const nearby = engine.getNearbyMicrobes(6);

        setRadarData({
          playerPos: centroid,
          antibodies: engine.antibodies.map((ab) => ({ x: ab.x, y: ab.y, alert: ab.alertLevel })),
          otherMicrobes: engine.bots
            .filter((b) => b.isAlive && b.pieces.length > 0)
            .map((b) => ({
              x: b.pieces[0].x,
              y: b.pieces[0].y,
              isBig: engine.calculateTotalMass(b) > 150,
              isKing: Boolean(
                kingData &&
                !kingData.isPlayer &&
                Math.hypot(b.pieces[0].x - kingData.x, b.pieces[0].y - kingData.y) < 80
              ),
            })),
          kingPos: kingData,
          nearbyMicrobes: nearby,
        });
      }
    };

    engine.onLeaderboardUpdate = (lb: LeaderboardEntry[]) => {
      setLeaderboard(lb);
    };

    engine.onMutationTrigger = (milestone: number) => {
      setPendingMilestone(milestone);
    };

    engine.onAntibodyAlertChange = (alert: boolean) => {
      setAntibodyAlert(alert);
    };

    engine.onOrganChange = (organName: string) => {
      setCurrentOrgan(organName);
    };

    engine.onGameOverWithReward = (reward: CytesRewardBreakdown) => {
      setLastReward(reward);
    };

    const showNextQueuedAchievement = () => {
      if (achievementQueueRef.current.length === 0) {
        isShowingAchToastRef.current = false;
        setAchievementToastId(null);
        return;
      }
      isShowingAchToastRef.current = true;
      const nextId = achievementQueueRef.current.shift()!;
      setAchievementToastId(nextId);
      setTimeout(() => {
        showNextQueuedAchievement();
      }, 2600);
    };

    engine.onAchievementUnlocked = (achId: string) => {
      if (!achievementQueueRef.current.includes(achId)) {
        achievementQueueRef.current.push(achId);
      }
      if (!isShowingAchToastRef.current) {
        showNextQueuedAchievement();
      }
    };

    // Start engine render loop
    engine.start();

    // Mouse steering
    const handleMouseMove = (e: MouseEvent) => {
      if (engineRef.current) {
        engineRef.current.mousePos = { x: e.clientX, y: e.clientY };
      }
    };

    // Keyboard handlers (edge-triggered + held states)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      // Register held keys for continuous movement
      engineRef.current.keysHeld[e.code] = true;

      // Edge triggered actions
      if (e.code === 'Space') {
        e.preventDefault();
        engineRef.current.splitPlayer();
      } else if (e.code === 'KeyW') {
        engineRef.current.ejectPlayerSpore();
      } else if (e.code === 'KeyC') {
        engineRef.current.conquerTerritory();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (engineRef.current.state === 'PLAYING') {
          engineRef.current.pauseGame();
        } else if (engineRef.current.state === 'PAUSED') {
          engineRef.current.resumeGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      delete engineRef.current.keysHeld[e.code];
    };

    // Touch handlers for mobile / tablet
    const handleTouchStart = (e: TouchEvent) => {
      if (!engineRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = touch.clientX - centerX;
      const dy = touch.clientY - centerY;
      const len = Math.hypot(dx, dy) || 1;
      engineRef.current.isTouchActive = true;
      engineRef.current.touchHeading = { x: dx / len, y: dy / len };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!engineRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = touch.clientX - centerX;
      const dy = touch.clientY - centerY;
      const len = Math.hypot(dx, dy) || 1;
      engineRef.current.isTouchActive = true;
      engineRef.current.touchHeading = { x: dx / len, y: dy / len };
    };

    const handleTouchEnd = () => {
      if (engineRef.current) {
        engineRef.current.isTouchActive = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      engine.stop();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Heartbeat, Real-Time Online Multiplayer Sync, DEV Status Verification, and 20-Function Moderation Enforcement
  useEffect(() => {
    const deviceId = profileStorage.getDeviceId();
    reportStorage
      .fetchDevRegistry()
      .then((reg) => {
        const isMeDev = reg.firstDevId === deviceId || reg.devIds.includes(deviceId);
        setIsCurrentUserDev(isMeDev);
        if (engineRef.current) {
          engineRef.current.isPlayerDev = isMeDev;
          engineRef.current.playerDevBadge = isMeDev ? reportStorage.getDevConfig() : null;
        }
      })
      .catch(() => {});

    const checkInvitations = async () => {
      try {
        const res = await fetch(`/api/invitations/poll/${deviceId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.invitation) {
            setActiveInvitation(json.invitation);
          }
        }
      } catch {}
    };

    const sendHeartbeat = async () => {
      try {
        const profile = profileStorage.getProfile();
        const playerCentroid =
          engineRef.current?.player && engineRef.current.player.pieces.length > 0
            ? engineRef.current.calculateCentroid(engineRef.current.player)
            : { x: 1500, y: 1500 };
        const liveMass =
          engineRef.current?.player && engineRef.current.player.pieces.length > 0
            ? Math.round(engineRef.current.calculateTotalMass(engineRef.current.player))
            : liveStatsRef.current?.currentMass || profile.stats?.highestMass || 18;
        const liveSurvivalSec = Math.max(
          liveStatsRef.current?.survivalTime || 0,
          profile.stats?.longestSurvivalSec || 0
        );
        const topBotsPayload =
          engineRef.current && Array.isArray(engineRef.current.bots)
            ? engineRef.current.bots
                .filter((b) => b.isAlive && !b.isRemotePlayer && b.pieces.length > 0)
                .map((b) => ({
                  name: b.name,
                  mass: Math.round(engineRef.current!.calculateTotalMass(b)),
                  personality: b.aiPersonality || 'opportunist',
                  faction: b.faction || 'pathogen',
                  survivalSec: Math.max(30, liveStatsRef.current?.survivalTime || 60),
                }))
                .sort((a, b) => b.mass - a.mass)
                .slice(0, 6)
            : [];

        const hbRes = await fetch('/api/players/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            name: profile.name,
            status: liveGameStateRef.current === 'PLAYING' ? 'in_game' : 'online',
            currentOrgan: liveOrganRef.current,
            mass: liveMass,
            survivalSec: liveSurvivalSec,
            cytes: profile.cytes || 0,
            topBots: topBotsPayload,
            faction: engineRef.current?.playerFaction || 'immune',
            x: Math.round(playerCentroid.x),
            y: Math.round(playerCentroid.y),
          }),
        });

        if (hbRes.ok) {
          const hbJson = await hbRes.json();
          if (typeof hbJson.isDev === 'boolean') {
            setIsCurrentUserDev(hbJson.isDev);
            if (engineRef.current) {
              engineRef.current.isPlayerDev = hbJson.isDev;
              engineRef.current.playerDevBadge = hbJson.isDev ? reportStorage.getDevConfig() : null;
            }
          }

          // Real-Time Online Players Detection & Live Multiplayer Sync
          if (typeof hbJson.activeCount === 'number') {
            setActivePlayerCount(hbJson.activeCount);
          }
          if (Array.isArray(hbJson.activePlayers) && engineRef.current) {
            engineRef.current.syncRemotePlayers(hbJson.activePlayers, deviceId);
          }

          const mod = hbJson.moderation || {};

          // 1. Live engine physics & ability locks (Freeze, Slow 50%, Lock Split, Lock Spores, Invert Controls)
          if (engineRef.current) {
            engineRef.current.modFrozen = Boolean(mod.isFrozen);
            engineRef.current.modSlowed = Boolean(mod.isSlowed);
            engineRef.current.modSplitLocked = Boolean(mod.isSplitLocked);
            engineRef.current.modEjectLocked = Boolean(mod.isEjectLocked);
            engineRef.current.modInvertControls = Boolean(mod.isInvertedControls);
          }

          // 2. Drain Mass Trigger (#5)
          if (mod.drainMassTrigger && mod.drainMassTrigger > lastModTriggersRef.current.drainMass) {
            lastModTriggersRef.current.drainMass = mod.drainMassTrigger;
            engineRef.current?.drainPlayerMassToBase();
          }

          // 3. Boost Mass +500 Trigger (#6)
          if (mod.boostMassTrigger && mod.boostMassTrigger > lastModTriggersRef.current.boostMass) {
            lastModTriggersRef.current.boostMass = mod.boostMassTrigger;
            engineRef.current?.boostPlayerMass(500);
          }

          // 4. Cytes Custom / Gift / Fine / Reset Trigger (#9, #10, #11, #12)
          if (mod.cytesOverrideTrigger && mod.cytesOverrideTrigger > lastModTriggersRef.current.cytesOverride) {
            lastModTriggersRef.current.cytesOverride = mod.cytesOverrideTrigger;
            if (typeof mod.cytesOverride === 'number') {
              profileStorage.setCytesBalance(mod.cytesOverride);
            }
          }

          // 5. Reset Upgrades Trigger (#13)
          if (mod.resetUpgradesTrigger && mod.resetUpgradesTrigger > lastModTriggersRef.current.resetUpgrades) {
            lastModTriggersRef.current.resetUpgrades = mod.resetUpgradesTrigger;
            profileStorage.resetUpgradesToZero();
          }

          // 6. Strip Conquered Organs Trigger (#14)
          if (mod.stripOrgansTrigger && mod.stripOrgansTrigger > lastModTriggersRef.current.stripOrgans) {
            lastModTriggersRef.current.stripOrgans = mod.stripOrgansTrigger;
            profileStorage.clearConqueredOrgans();
          }

          // 7. Reset Skins & Spores Trigger (#15)
          if (mod.resetSkinsTrigger && mod.resetSkinsTrigger > lastModTriggersRef.current.resetSkins) {
            lastModTriggersRef.current.resetSkins = mod.resetSkinsTrigger;
            profileStorage.resetSkinsAndSporesToDefault();
          }

          // 8. Force Sanctioned Name Trigger (#16)
          if (mod.forcedNameTrigger && mod.forcedNameTrigger > lastModTriggersRef.current.forcedName) {
            lastModTriggersRef.current.forcedName = mod.forcedNameTrigger;
            if (mod.forcedName) {
              profileStorage.setPlayerName(mod.forcedName);
              if (engineRef.current?.player) {
                engineRef.current.player.name = mod.forcedName;
              }
            }
          }

          // 9. Kick from Match / Temp Ban / Permanent Ban (#18, #19, #20)
          const isTempBanned = Boolean(mod.tempBanUntil && mod.tempBanUntil > Date.now());
          if (mod.isBanned) {
            setBanStatusMessage(t.bannedAccountNotice);
          } else if (isTempBanned) {
            setBanStatusMessage(t.tempBannedAccountNotice);
          } else {
            setBanStatusMessage(null);
          }

          if (
            (mod.kickMatchTrigger && mod.kickMatchTrigger > lastModTriggersRef.current.kickMatch) ||
            mod.isBanned ||
            isTempBanned
          ) {
            if (mod.kickMatchTrigger) {
              lastModTriggersRef.current.kickMatch = mod.kickMatchTrigger;
            }
            if (engineRef.current && (engineRef.current.state === 'PLAYING' || engineRef.current.state === 'PAUSED')) {
              soundEngine.stopBGM();
              engineRef.current.returnToMenu();
              setGameState('TITLE_MENU');
            }
          }

          // 10. Check for Unanswered Interactive Warning with Custom Message & Mandatory Question (#1)
          if (Array.isArray(mod.interactiveWarnings)) {
            const unanswered = mod.interactiveWarnings.find((w: InteractiveWarningEntry) => !w.answered);
            setActiveInteractiveWarning((prev) => {
              if (prev && prev.id.startsWith('PREVIEW-')) return prev;
              return unanswered || null;
            });
          }
        }
      } catch {}
    };

    const invInterval = setInterval(checkInvitations, 3000);
    const hbInterval = setInterval(sendHeartbeat, 2000);
    sendHeartbeat();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearInterval(invInterval);
      clearInterval(hbInterval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [t.bannedAccountNotice, t.tempBannedAccountNotice]);

  const handleStartGame = useCallback(
    (playerName: string, mode: GameMode = 'ffa', faction: Faction = 'immune', humansOnly: boolean = false) => {
      if (banStatusMessage) {
        setInviteToast(banStatusMessage);
        setTimeout(() => setInviteToast(null), 4000);
        return;
      }
      soundEngine.startBGM();
      if (engineRef.current) {
        engineRef.current.isPlayerDev = isCurrentUserDev;
        engineRef.current.playerDevBadge = isCurrentUserDev ? reportStorage.getDevConfig() : null;
        engineRef.current.startGame(playerName, mode, faction, humansOnly);
      }
    },
    [banStatusMessage, isCurrentUserDev]
  );

  const handleSubmitWarningAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInteractiveWarning || !warningAnswerInput.trim()) return;
    if (activeInteractiveWarning.id.startsWith('PREVIEW-')) {
      setActiveInteractiveWarning(null);
      setWarningAnswerInput('');
      return;
    }
    const ok = await reportStorage.respondToWarning(activeInteractiveWarning.id, warningAnswerInput.trim());
    if (ok) {
      setActiveInteractiveWarning(null);
      setWarningAnswerInput('');
    }
  };

  const handleConquerTerritory = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.conquerTerritory();
    }
  }, []);

  const handleAcceptInvitation = useCallback(
    async (invitation: RoomInvitation, selectedFaction?: Faction) => {
      try {
        await fetch('/api/invitations/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invitationId: invitation.id,
            accepted: true,
            guestFaction: selectedFaction,
          }),
        });
      } catch {}

      setActiveInvitation(null);
      const faction = selectedFaction || invitation.guestFaction || 'immune';
      const profile = profileStorage.getProfile();
      handleStartGame(profile.name, invitation.mode as GameMode, faction, invitation.mode !== 'bots');
    },
    [handleStartGame]
  );

  const handleDeclineInvitation = useCallback(async (invitationId: string) => {
    try {
      await fetch('/api/invitations/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          accepted: false,
        }),
      });
    } catch {}
    setActiveInvitation(null);
  }, []);

  const handleInviteSent = useCallback((msg: string) => {
    setInviteToast(msg);
    setTimeout(() => setInviteToast(null), 4000);
  }, []);

  const handlePause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pauseGame();
    }
  }, []);

  const handleResume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
  }, []);

  const handleReturnToHome = useCallback(() => {
    soundEngine.stopBGM();
    if (engineRef.current) {
      engineRef.current.returnToMenu();
    }
    setGameState('TITLE_MENU');
  }, []);

  const handleSplit = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.splitPlayer();
    }
  }, []);

  const handleEject = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.ejectPlayerSpore();
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  const handleJoystickMove = useCallback((heading: { x: number; y: number }, _intensity: number) => {
    if (engineRef.current) {
      engineRef.current.setJoystickHeading(heading.x, heading.y);
    }
  }, []);

  const handleJoystickRelease = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.clearJoystickHeading();
    }
  }, []);

  const handleSelectLanguage = useCallback((lang: string) => {
    setCurrentLang(lang);
    profileStorage.setPreferredLanguage(lang);
  }, []);

  const handleSelectMutation = useCallback((mutationId: MutationId) => {
    if (engineRef.current) {
      engineRef.current.applyMutation(mutationId);
      setCurrentMutations((prev) => new Set([...prev, mutationId]));
    }
    setPendingMilestone(null);
  }, []);

  const handleDismissMutation = useCallback(() => {
    setPendingMilestone(null);
  }, []);

  const handleSkinChanged = useCallback(() => {
    // If playing, re-apply skin colors to player
    if (engineRef.current && engineRef.current.player) {
      const profile = profileStorage.getProfile();
      import('./game/skins').then(({ MICROBE_SKINS }) => {
        const skin = MICROBE_SKINS.find((s) => s.id === profile.selectedSkinId);
        if (skin && engineRef.current && engineRef.current.player) {
          engineRef.current.player.color = skin.color;
          engineRef.current.player.secondaryColor = skin.secondaryColor;
          engineRef.current.player.ciliaColor = skin.ciliaColor;
        }
      });
    }
  }, []);

  return (
    <div className="relative w-full max-w-[100vw] h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#080204]">
      {/* 60fps Canvas Render Target */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />

      {/* Microscope optical lens vignette overlay */}
      <div className="absolute inset-0 microscope-vignette pointer-events-none" />

      {/* Celebratory Achievement Toast */}
      <AchievementToast
        achievementId={achievementToastId}
        onClose={() => setAchievementToastId(null)}
        t={t}
      />

      {/* Title Screen Overlay */}
      {gameState === 'TITLE_MENU' && (
        <TitleScreen
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          currentLang={currentLang}
          onSelectLanguage={handleSelectLanguage}
          t={t}
          onOpenTutorial={() => setShowTutorial(true)}
          onOpenBattleTutorial={() => setShowBattleTutorial(true)}
          onOpenHomeUpgrades={() => setShowHomeUpgrades(true)}
          onOpenShare={() => setShowShareModal(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenSkins={() => setShowSkins(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenActivePlayers={() => setShowActivePlayers(true)}
          onOpenDailyLeaderboard={() => setShowDailyLeaderboard(true)}
          onOpenReport={() => setShowReportModal(true)}
          onOpenDevPanel={isCurrentUserDev ? () => setShowDevModal(true) : undefined}
          activePlayerCount={activePlayerCount}
        />
      )}

      {/* Active Game HUD */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <GameHUD
          stats={stats}
          leaderboard={leaderboard}
          antibodyAlert={antibodyAlert}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onSplit={handleSplit}
          onEject={handleEject}
          onOpenTutorial={() => setShowTutorial(true)}
          onOpenBattleTutorial={() => setShowBattleTutorial(true)}
          onOpenShare={() => setShowShareModal(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenReport={() => setShowReportModal(true)}
          onOpenDevPanel={isCurrentUserDev ? () => setShowDevModal(true) : undefined}
          onConquerTerritory={handleConquerTerritory}
          onAdministerTreatment={(type) => {
            if (engineRef.current) {
              engineRef.current.applyMedicalTreatment(type);
            }
          }}
          currentLang={currentLang}
          onSelectLanguage={handleSelectLanguage}
          t={t}
          currentOrgan={currentOrgan}
          cytesBalance={profileStorage.getProfile().cytes}
          playerPos={radarData.playerPos}
          antibodies={radarData.antibodies}
          otherMicrobes={radarData.otherMicrobes}
          kingPos={radarData.kingPos}
          nearbyMicrobes={radarData.nearbyMicrobes}
        />
      )}

      {/* Virtual On-Screen Joystick Control Panel (drag inner ball to move and slide in map) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <VirtualJoystick
          onMove={handleJoystickMove}
          onRelease={handleJoystickRelease}
        />
      )}

      {/* Real-Time Room Invitation Toast */}
      <InvitationToast
        invitation={activeInvitation}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
        t={t}
      />

      {/* Outgoing Invitation Confirmation Toast */}
      {inviteToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-xs font-bold shadow-[0_0_25px_rgba(6,182,212,0.5)] backdrop-blur-md animate-fade-in pointer-events-auto">
          {inviteToast}
        </div>
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          t={t}
        />
      )}

      {/* Game Over Modal with Home and Share Buttons */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
          onReturnToHome={handleReturnToHome}
          t={t}
          rewardBreakdown={lastReward}
          onOpenShop={() => setShowShop(true)}
          onOpenShare={() => setShowShareModal(true)}
        />
      )}

      {/* Evolution Milestone Choice Modal */}
      {pendingMilestone !== null && (
        <EvolutionModal
          milestone={pendingMilestone}
          currentMutations={currentMutations}
          onSelectMutation={handleSelectMutation}
          onDismiss={handleDismissMutation}
          t={t}
        />
      )}

      {/* Interactive Step-by-Step Tutorial */}
      {showTutorial && (
        <TutorialModal
          t={t}
          onClose={() => setShowTutorial(false)}
        />
      )}

      {/* Battle Mode Dedicated Tutorial Modal */}
      {showBattleTutorial && (
        <BattleTutorialModal
          t={t}
          onClose={() => setShowBattleTutorial(false)}
        />
      )}

      {/* Home Upgrades Modal (Levels up to 1500 for the 5 stats) */}
      {showHomeUpgrades && (
        <HomeUpgradesModal
          t={t}
          onClose={() => setShowHomeUpgrades(false)}
        />
      )}

      {/* Rich Multi-Platform & Device Share Modal */}
      {showShareModal && (
        <ShareModal
          t={t}
          currentLang={currentLang}
          stats={stats}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Achievements Gallery */}
      {showAchievements && (
        <AchievementsModal
          onClose={() => setShowAchievements(false)}
          t={t}
        />
      )}

      {/* Skins & Spores Customization Locker */}
      {showSkins && (
        <SkinsModal
          onClose={() => setShowSkins(false)}
          onSkinChanged={handleSkinChanged}
          t={t}
        />
      )}

      {/* Cytes Red Blood Cell Shop Modal */}
      {showShop && (
        <ShopModal
          onClose={() => setShowShop(false)}
          onSkinChanged={handleSkinChanged}
          t={t}
        />
      )}

      {/* Live Active Players & Room Invitation Modal */}
      {showActivePlayers && (
        <ActivePlayersModal
          onClose={() => setShowActivePlayers(false)}
          onInviteSent={handleInviteSent}
          t={t}
        />
      )}

      {/* User Report Modal for Bugs, Cheats, Desync & Behavior */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          t={t}
        />
      )}

      {/* 24-Hour Daily Leaderboard Modal (Players [No-Bots] & Bots, Cytes / Survival / Mass) */}
      {showDailyLeaderboard && (
        <DailyLeaderboardModal
          onClose={() => setShowDailyLeaderboard(false)}
          t={t}
        />
      )}

      {/* Official DEV & Admin Command Center (Strictly Exclusive to DEVs) */}
      {showDevModal && isCurrentUserDev && (
        <DevAdminModal
          onClose={() => {
            setShowDevModal(false);
            if (engineRef.current) {
              engineRef.current.playerDevBadge = isCurrentUserDev ? reportStorage.getDevConfig() : null;
            }
          }}
          t={t}
          onPreviewWarning={(msg, question) => {
            setActiveInteractiveWarning({
              id: `PREVIEW-${Date.now()}`,
              message: msg,
              question: question,
              timestamp: Date.now(),
              answered: false,
            });
          }}
        />
      )}

      {/* Ban / Temp-Ban Banner */}
      {banStatusMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-rose-950/95 border-2 border-rose-500 text-rose-100 text-xs sm:text-sm font-black shadow-[0_0_30px_rgba(244,63,94,0.6)] flex items-center gap-2 pointer-events-auto">
          <Ban className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{banStatusMessage}</span>
        </div>
      )}

      {/* Mandatory Interactive DEV Warning & Question Modal */}
      {activeInteractiveWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg pointer-events-auto select-none animate-fade-in">
          <form
            onSubmit={handleSubmitWarningAnswer}
            className="w-full max-w-lg p-6 rounded-3xl bg-neutral-950 border-2 border-orange-500/80 shadow-[0_0_60px_rgba(249,115,22,0.4)] space-y-4 text-left"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-11 h-11 rounded-2xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-orange-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-orange-300 uppercase tracking-wider">
                  {t.playerWarningModalTitle}
                </h3>
                <p className="text-xs text-neutral-300">{t.playerWarningModalSubtitle}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-950/40 border border-orange-500/40 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-300 block">
                {t.playerWarningMessageHeader}
              </span>
              <p className="text-sm font-bold text-white leading-relaxed">
                {activeInteractiveWarning.message}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                {t.playerWarningQuestionHeader}
              </span>
              <p className="text-sm font-black text-amber-100">
                {activeInteractiveWarning.question}
              </p>
              <input
                type="text"
                value={warningAnswerInput}
                onChange={(e) => setWarningAnswerInput(e.target.value)}
                placeholder={t.playerWarningAnswerPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-amber-500/50 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(249,115,22,0.4)] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t.playerWarningSubmitBtn}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
