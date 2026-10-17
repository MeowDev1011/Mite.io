/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GameEngine } from './game/engine';
import { soundEngine } from './audio/soundEngine';
import { profileStorage, CytesRewardBreakdown } from './storage/profileStorage';
import { GameState, GameStats, LeaderboardEntry, MutationId } from './game/types';
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

  // Additional Modals
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showSkins, setShowSkins] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [achievementToastId, setAchievementToastId] = useState<string | null>(null);
  const [currentOrgan, setCurrentOrgan] = useState<string>('Corazón (Aorta)');
  const [lastReward, setLastReward] = useState<CytesRewardBreakdown | null>(null);

  // Entities positions for radar minimap
  const [radarData, setRadarData] = useState<{
    playerPos: { x: number; y: number };
    antibodies: { x: number; y: number; alert: number }[];
    otherMicrobes: { x: number; y: number; isBig: boolean }[];
  }>({
    playerPos: { x: 0, y: 0 },
    antibodies: [],
    otherMicrobes: [],
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
        setRadarData({
          playerPos: centroid,
          antibodies: engine.antibodies.map((ab) => ({ x: ab.x, y: ab.y, alert: ab.alertLevel })),
          otherMicrobes: engine.bots
            .filter((b) => b.isAlive && b.pieces.length > 0)
            .map((b) => ({
              x: b.pieces[0].x,
              y: b.pieces[0].y,
              isBig: engine.calculateTotalMass(b) > 150,
            })),
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

  const handleStartGame = useCallback((playerName: string) => {
    if (engineRef.current) {
      engineRef.current.startGame(playerName);
    }
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
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenSkins={() => setShowSkins(true)}
          onOpenShop={() => setShowShop(true)}
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
          onOpenShop={() => setShowShop(true)}
          currentLang={currentLang}
          onSelectLanguage={handleSelectLanguage}
          t={t}
          currentOrgan={currentOrgan}
          cytesBalance={profileStorage.getProfile().cytes}
          playerPos={radarData.playerPos}
          antibodies={radarData.antibodies}
          otherMicrobes={radarData.otherMicrobes}
        />
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

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
          rewardBreakdown={lastReward}
          onOpenShop={() => setShowShop(true)}
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
        />
      )}
    </div>
  );
}
