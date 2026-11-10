/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameHUD } from './components/GameHUD';
import { IntroCutscene } from './components/IntroCutscene';
import { InstructionModal } from './components/InstructionModal';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PlayerStats, WaterQuality, CharacterMode, GrowthStage } from './types/game';
import { sound } from './audio/soundManager';
import { StageCurtain } from './components/StageCurtain';

type GameFlowState = 'INTRO_VIDEO' | 'INSTRUCTIONS' | 'START_SCREEN' | 'PLAYING' | 'GAME_OVER';

export default function App() {
  const [flowState, setFlowState] = useState<GameFlowState>('INTRO_VIDEO');
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('river_guardian_nickname') || '河川小怪獸';
  });
  const [playerId] = useState<string>(() => {
    const existing = localStorage.getItem('river_guardian_player_id');
    if (existing) return existing;
    const newId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem('river_guardian_player_id', newId);
    return newId;
  });

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Engine state mirror for React HUD
  const [hudState, setHudState] = useState({
    score: 0,
    survivalTime: 0,
    pollutionCount: 0,
    waterQuality: 'BLUE' as WaterQuality,
    comboCount: 0,
    comboTimer: 0,
    characterMode: 'NORMAL' as CharacterMode,
    growthScale: 1.0 as GrowthStage,
    isPaused: false,
  });

  const [finalStats, setFinalStats] = useState<PlayerStats | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Stage Curtain Transition State (舞台開閉幕過場)
  // Initially true so that when the intro video starts, the stage curtain pulls open!
  const [isCurtainClosed, setIsCurtainClosed] = useState(true);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const executeWithCurtain = useCallback((action: () => void) => {
    sound.playCurtain();
    setIsCurtainClosed(true);
    pendingActionRef.current = action;
  }, []);

  const handleCurtainClosed = useCallback(() => {
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
    }
    // Brief pause at closed curtain before opening stage
    setTimeout(() => {
      sound.playCurtain();
      setIsCurtainClosed(false);
    }, 140);
  }, []);

  // Pull open curtain when intro video starts playing
  const handleVideoStart = useCallback(() => {
    if (isCurtainClosed) {
      sound.playCurtain();
      setIsCurtainClosed(false);
    }
  }, [isCurtainClosed]);

  // Initial mount fallback to ensure curtain pulls open even if browser autoplay is delayed
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCurtainClosed((prev) => {
        if (prev) {
          sound.playCurtain();
          return false;
        }
        return false;
      });
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // Save nickname when changed
  const handleNicknameChange = (name: string) => {
    setNickname(name);
    localStorage.setItem('river_guardian_nickname', name);
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (flowState !== 'PLAYING') return;

      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        if (engineRef.current) engineRef.current.moveLeft = true;
      }
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        if (engineRef.current) engineRef.current.moveRight = true;
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (engineRef.current) {
          engineRef.current.pause();
          setHudState((prev) => ({ ...prev, isPaused: engineRef.current?.isPaused || false }));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (flowState !== 'PLAYING') return;

      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        if (engineRef.current) engineRef.current.moveLeft = false;
      }
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        if (engineRef.current) engineRef.current.moveRight = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [flowState]);

  // Start the Game
  const handleStartGame = useCallback(() => {
    setFlowState('PLAYING');
    setTimeout(() => {
      if (canvasRef.current) {
        if (!engineRef.current) {
          engineRef.current = new GameEngine(canvasRef.current);
          engineRef.current.onStateUpdate = (engine) => {
            setHudState({
              score: engine.stats.score,
              survivalTime: engine.stats.survivalTime,
              pollutionCount: engine.pollutionCount,
              waterQuality: engine.waterQuality,
              comboCount: engine.comboCount,
              comboTimer: engine.comboTimer,
              characterMode: engine.characterMode,
              growthScale: engine.currentScale,
              isPaused: engine.isPaused,
            });
          };

          engineRef.current.onGameOver = (stats) => {
            setFinalStats(stats);
            setTimeout(() => {
              executeWithCurtain(() => {
                setFlowState('GAME_OVER');
              });
            }, 450);
          };
        }
        engineRef.current.start();
      }
    }, 50);
  }, []);

  // Play Again after Game Over
  const handlePlayAgain = () => {
    setFinalStats(null);
    setFlowState('PLAYING');
    if (engineRef.current) {
      engineRef.current.start();
    }
  };

  // Return to Start Screen (Home)
  const handleReturnHome = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setFinalStats(null);
    setFlowState('START_SCREEN');
  }, []);

  // Touch / Pointer controls on Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || flowState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = engineRef.current.V_WIDTH / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;

    engineRef.current.isTouching = true;
    engineRef.current.targetTouchX = clientX;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || !engineRef.current.isTouching) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = engineRef.current.V_WIDTH / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;

    engineRef.current.targetTouchX = clientX;
  };

  const handlePointerUp = () => {
    if (!engineRef.current) return;
    engineRef.current.isTouching = false;
    engineRef.current.targetTouchX = null;
  };

  return (
    <main
      className={`w-screen h-screen flex flex-col items-center justify-center pencil-paper-bg overflow-hidden select-none ${
        flowState === 'INTRO_VIDEO' ? 'p-0' : 'p-0 sm:p-2 md:p-4'
      }`}
    >
      {/* Dynamically Responsive Container - Full-bleed (滿板) for intro video */}
      <div
        className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300 ${
          flowState === 'INTRO_VIDEO'
            ? 'w-full h-full max-w-none max-h-none rounded-none border-0 shadow-none bg-black'
            : 'max-w-[1280px] max-h-[96vh] sm:aspect-[16/9] bg-[#fcf8f0] sm:rounded-2xl border-0 sm:border-[3.5px] border-[#3d3228] shadow-[4px_6px_0px_#3d3228,0_18px_40px_rgba(60,45,30,0.28)] pencil-viewport-overlay'
        }`}
      >
        {/* Intro Cutscene State (滿板影片 + 開播時布幕拉起特效) */}
        {flowState === 'INTRO_VIDEO' && (
          <IntroCutscene
            onVideoStart={handleVideoStart}
            onComplete={() => executeWithCurtain(() => setFlowState('INSTRUCTIONS'))}
          />
        )}

        {/* Step-by-step Instructions State */}
        {flowState === 'INSTRUCTIONS' && (
          <InstructionModal onComplete={() => executeWithCurtain(() => setFlowState('START_SCREEN'))} />
        )}

        {/* Start Screen State */}
        {flowState === 'START_SCREEN' && (
          <StartScreen
            nickname={nickname}
            onNicknameChange={handleNicknameChange}
            onStartGame={() => executeWithCurtain(handleStartGame)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenInstructions={() => setShowInstructions(true)}
            onReplayIntro={() => executeWithCurtain(() => setFlowState('INTRO_VIDEO'))}
          />
        )}

        {/* Game Canvas Viewport */}
        <div
          className={`relative w-full h-full ${
            flowState === 'PLAYING' || flowState === 'GAME_OVER' ? 'block' : 'hidden'
          }`}
        >
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full object-contain cursor-crosshair touch-none"
          />

          {/* Active Gameplay HUD */}
          {flowState === 'PLAYING' && (
            <GameHUD
              score={hudState.score}
              survivalTime={hudState.survivalTime}
              pollutionCount={hudState.pollutionCount}
              waterQuality={hudState.waterQuality}
              comboCount={hudState.comboCount}
              comboTimer={hudState.comboTimer}
              characterMode={hudState.characterMode}
              growthScale={hudState.growthScale}
              isPaused={hudState.isPaused}
              onTogglePause={() => {
                if (engineRef.current) {
                  engineRef.current.pause();
                  setHudState((prev) => ({ ...prev, isPaused: engineRef.current?.isPaused || false }));
                }
              }}
              onMoveLeftStart={() => {
                if (engineRef.current) engineRef.current.moveLeft = true;
              }}
              onMoveLeftEnd={() => {
                if (engineRef.current) engineRef.current.moveLeft = false;
              }}
              onMoveRightStart={() => {
                if (engineRef.current) engineRef.current.moveRight = true;
              }}
              onMoveRightEnd={() => {
                if (engineRef.current) engineRef.current.moveRight = false;
              }}
              onReturnHome={() => executeWithCurtain(handleReturnHome)}
            />
          )}

          {/* Game Over Settlement Modal */}
          {flowState === 'GAME_OVER' && finalStats && (
            <GameOverModal
              stats={finalStats}
              nickname={nickname}
              playerId={playerId}
              onPlayAgain={() => executeWithCurtain(handlePlayAgain)}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onReturnHome={() => executeWithCurtain(handleReturnHome)}
            />
          )}
        </div>

        {/* Standalone Leaderboard Modal */}
        {showLeaderboard && (
          <LeaderboardModal
            currentPlayerId={playerId}
            onClose={() => setShowLeaderboard(false)}
          />
        )}

        {/* Standalone Tutorial Modal from Start Screen */}
        {showInstructions && (
          <div className="absolute inset-0 z-50">
            <InstructionModal onComplete={() => setShowInstructions(false)} />
          </div>
        )}

        {/* Theatrical Stage Curtain Transition Overlay (舞台開閉幕過場) */}
        <StageCurtain
          isClosed={isCurtainClosed}
          onClosedTransitionEnd={handleCurtainClosed}
        />
      </div>
    </main>
  );
}
