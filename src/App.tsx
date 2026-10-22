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

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Internationalization state (auto-detects device language)
  const [currentLang, setCurrentLang] = useState<string>(() => {
    const saved = profileStorage.getProfile().preferredLanguage;
    return saved || detectDeviceLanguage();
  });

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

    engine.onAchievementUnlocked = (achId: string) => {
      setAchievementToastId(achId);
      setTimeout(() => {
        setAchievementToastId((curr) => (curr === achId ? null : curr));
      }, 4500);
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

  // Heartbeat and Room Invitations Polling with Live Server DB
  useEffect(() => {
    const deviceId = profileStorage.getDeviceId();

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
        await fetch('/api/players/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            name: profile.name,
            status: gameState === 'PLAYING' ? 'in_game' : 'online',
            currentOrgan,
            mass: stats?.currentMass || 18,
            faction: engineRef.current?.playerFaction || 'immune',
          }),
        });

        const activeRes = await fetch('/api/players/active');
        if (activeRes.ok) {
          const activeJson = await activeRes.json();
          if (activeJson.players) {
            setActivePlayerCount(activeJson.players.length);
          }
        }
      } catch {}
    };

    const invInterval = setInterval(checkInvitations, 3500);
    const hbInterval = setInterval(sendHeartbeat, 7000);
    sendHeartbeat();

    return () => {
      clearInterval(invInterval);
      clearInterval(hbInterval);
    };
  }, [gameState, currentOrgan, stats?.currentMass]);

  const handleStartGame = useCallback(
    (playerName: string, mode: GameMode = 'ffa', faction: Faction = 'immune', humansOnly: boolean = false) => {
      soundEngine.startBGM();
      if (engineRef.current) {
        engineRef.current.startGame(playerName, mode, faction, humansOnly);
      }
    },
    []
  );

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
    <div className="relative w-screen h-screen overflow-hidden bg-[#080204]">
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
          onOpenReport={() => setShowReportModal(true)}
          onOpenDevPanel={() => setShowDevModal(true)}
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
          onOpenDevPanel={() => setShowDevModal(true)}
          onConquerTerritory={handleConquerTerritory}
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
        />
      )}

      {/* Skins & Spores Customization Locker */}
      {showSkins && (
        <SkinsModal
          onClose={() => setShowSkins(false)}
          onSkinChanged={handleSkinChanged}
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
        />
      )}

      {/* User Report Modal for Bugs, Cheats, Desync & Behavior */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          t={t}
        />
      )}

      {/* Official DEV & Admin Command Center */}
      {showDevModal && (
        <DevAdminModal
          onClose={() => setShowDevModal(false)}
          t={t}
        />
      )}
    </div>
  );
}
