import React from 'react';
import { Pause, Play, Volume2, VolumeX, Flame, Droplet, Clock, Home } from 'lucide-react';
import { sound } from '../audio/soundManager';
import { WaterQuality, CharacterMode, GrowthStage } from '../types/game';

interface GameHUDProps {
  score: number;
  survivalTime: number;
  pollutionCount: number;
  waterQuality: WaterQuality;
  comboCount: number;
  comboTimer: number;
  characterMode: CharacterMode;
  growthScale: GrowthStage;
  isPaused: boolean;
  onTogglePause: () => void;
  onReturnHome?: () => void;
  onMoveLeftStart: () => void;
  onMoveLeftEnd: () => void;
  onMoveRightStart: () => void;
  onMoveRightEnd: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  survivalTime,
  pollutionCount,
  waterQuality: _waterQuality,
  comboCount,
  comboTimer,
  characterMode: _characterMode,
  growthScale: _growthScale,
  isPaused,
  onTogglePause,
  onReturnHome,
  onMoveLeftStart,
  onMoveLeftEnd,
  onMoveRightStart,
  onMoveRightEnd,
}) => {
  const isMuted = sound.getMuted();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Combo bar percentage (out of 15 seconds)
  const comboPercent = comboCount > 0 ? Math.max(0, Math.min(100, (comboTimer / 15) * 100)) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5 sm:p-3.5 select-none">
      {/* Top HUD Section - Clean & Visual, Letting the Layout Explain Everything */}
      <div className="flex flex-col gap-2 z-30">
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          {/* Left: Score, Time & Controls in a unified neat row */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Score */}
            <div className="pencil-hud-pill px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-xs font-pixel text-[#facc15] font-bold">★</span>
              <span className="text-base sm:text-lg font-pixel text-[#facc15] drop-shadow-[1px_1px_0px_#1c1917] tabular-nums">
                {score}
              </span>
            </div>

            {/* Time */}
            <div className="pencil-hud-pill px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#d6d0c4]" />
              <span className="text-xs sm:text-sm font-pixel text-[#f5f2eb] tabular-nums">
                {formatTime(survivalTime)}
              </span>
            </div>

            {/* Utility Controls */}
            <div className="flex items-center gap-1 ml-0.5">
              <button
                onClick={() => sound.toggleMute()}
                className="pencil-hud-pill p-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                title="音效"
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-[#f87171]" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-[#6ee7b7]" />
                )}
              </button>

              <button
                onClick={onTogglePause}
                className="pencil-hud-pill p-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                title={isPaused ? '繼續' : '暫停'}
              >
                {isPaused ? (
                  <Play className="w-3.5 h-3.5 text-[#facc15]" />
                ) : (
                  <Pause className="w-3.5 h-3.5 text-[#f5f2eb]" />
                )}
              </button>

              {onReturnHome && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onReturnHome();
                  }}
                  className="pencil-hud-pill p-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  title="回首頁"
                >
                  <Home className="w-3.5 h-3.5 text-[#f5f2eb]" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Pollution Gauge Bar (Droplet + Gauge + 20 Max) */}
          <div className="pencil-hud-pill px-3 py-1.5 flex items-center gap-2">
            <Droplet
              className={`w-4 h-4 transition-colors ${
                pollutionCount < 10
                  ? 'text-[#38bdf8]'
                  : pollutionCount < 18
                  ? 'text-[#fbbf24] animate-pulse'
                  : 'text-[#f87171] animate-pulse'
              }`}
            />

            {/* Colored-Pencil Gauge Bar */}
            <div className="w-24 sm:w-36 h-2.5 bg-[#24211e] rounded-full border border-[#171513] overflow-hidden flex shadow-inner">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  pollutionCount < 10
                    ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8]'
                    : pollutionCount < 18
                    ? 'bg-gradient-to-r from-[#d97706] to-[#fbbf24] animate-pulse'
                    : 'bg-gradient-to-r from-[#dc2626] to-[#f87171] animate-pulse'
                }`}
                style={{ width: `${Math.max(4, (pollutionCount / 20) * 100)}%` }}
              />
            </div>

            <span className="text-xs sm:text-sm font-pixel text-[#f5f2eb] tabular-nums">
              {pollutionCount}/20
            </span>
          </div>
        </div>

        {/* Combo Counter & 15s Rainbow Gauge (Centered, Clean & Wordless) */}
        {comboCount > 0 && (
          <div className="self-center pointer-events-auto -mt-1 sm:-mt-2">
            <div className="pencil-combo-pill px-3.5 py-1 flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 fill-[#f59e0b] text-[#facc15] animate-bounce" />
                <span className="font-pixel text-xs sm:text-sm text-white font-bold">
                  {comboCount}
                </span>
                <span className="text-xs text-[#d6d0c4] font-pixel">/ 7</span>
              </div>

              {/* 15s Rainbow Colored-Pencil Progress Bar */}
              <div className="w-20 sm:w-28 h-2 bg-[#24211e] rounded-full border border-[#171513] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ef4444] via-[#facc15] to-[#10b981] transition-all duration-100 rounded-full"
                  style={{ width: `${comboPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile On-Screen Directional Touch Buttons (at bottom corners) */}
      <div className="w-full flex items-center justify-between pointer-events-none mt-auto pb-4 px-2">
        <button
          onTouchStart={onMoveLeftStart}
          onTouchEnd={onMoveLeftEnd}
          onMouseDown={onMoveLeftStart}
          onMouseUp={onMoveLeftEnd}
          onMouseLeave={onMoveLeftEnd}
          className="pointer-events-auto md:hidden w-16 h-16 pencil-hud-pill text-2xl font-bold flex items-center justify-center text-white active:scale-95 transition-all select-none touch-none"
        >
          ◀
        </button>

        <button
          onTouchStart={onMoveRightStart}
          onTouchEnd={onMoveRightEnd}
          onMouseDown={onMoveRightStart}
          onMouseUp={onMoveRightEnd}
          onMouseLeave={onMoveRightEnd}
          className="pointer-events-auto md:hidden w-16 h-16 pencil-hud-pill text-2xl font-bold flex items-center justify-center text-white active:scale-95 transition-all select-none touch-none"
        >
          ▶
        </button>
      </div>

      {/* Paused Overlay (Clean Card) */}
      {isPaused && (
        <div className="absolute inset-0 bg-[#2c2520]/60 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-auto z-40 p-4">
          <div className="pencil-card p-6 text-center space-y-4 max-w-xs w-full">
            <h2 className="text-2xl font-pixel-tc font-bold text-[#8c521c]">遊戲暫停</h2>
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={onTogglePause}
                className="w-full py-2.5 pencil-btn-amber font-pixel-tc font-bold text-sm transition-transform active:scale-98 cursor-pointer"
              >
                繼續遊戲
              </button>
              {onReturnHome && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onReturnHome();
                  }}
                  className="w-full py-2.5 pencil-btn-paper font-pixel-tc text-xs font-bold transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4 text-[#1e6fa8]" />
                  <span>返回首頁</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
