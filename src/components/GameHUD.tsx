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
  waterQuality,
  comboCount,
  comboTimer,
  characterMode,
  growthScale,
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

  const getWaterBadge = () => {
    if (waterQuality === 'BLUE') {
      return {
        text: '水質清澈',
        color: 'text-white bg-[#1e6fa8] border-[#0f4a75] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]',
      };
    }
    if (waterQuality === 'GREY') {
      return {
        text: '灰色警戒',
        color: 'text-white bg-[#b46914] border-[#783f08] animate-pulse',
      };
    }
    return {
      text: '嚴重污染',
      color: 'text-white bg-[#b91c1c] border-[#7f1d1d]',
    };
  };

  const waterBadge = getWaterBadge();

  // Combo bar percentage (out of 15 seconds)
  const comboPercent = comboCount > 0 ? Math.max(0, Math.min(100, (comboTimer / 15) * 100)) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5 sm:p-3.5 select-none">
      {/* Top HUD Section */}
      <div className="flex flex-col gap-2 z-30">
        {/* Row 1: Score / Time / Scale on Left, Pollution Meter on Right */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Score, Survival Time, Scale */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Score Box */}
            <div className="pencil-hud-pill px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs font-pixel text-[#e7e2d8] tracking-wide">SCORE</span>
              <span className="text-base sm:text-lg font-pixel text-[#facc15] drop-shadow-[1px_1px_0px_#1c1917] tabular-nums">
                {score}
              </span>
            </div>

            {/* Time Box */}
            <div className="pencil-hud-pill px-3 py-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#d6d0c4]" />
              <span className="text-xs sm:text-sm font-pixel text-[#f5f2eb] tabular-nums">
                {formatTime(survivalTime)}
              </span>
            </div>

            {/* Scale Badge */}
            <div className="hidden sm:flex pencil-hud-pill px-2.5 py-1.5 text-xs font-pixel-tc items-center gap-1">
              <span className="text-[#d6d0c4]">體型</span>
              <span className="font-pixel text-xs text-[#6ee7b7] font-bold">
                {Math.round(growthScale * 100)}%
              </span>
            </div>
          </div>

          {/* Right: Pollution Meter (0 - 20) */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="pencil-hud-pill px-3 py-1.5 flex items-center gap-2.5">
              <div className="flex items-center gap-1 text-xs font-pixel-tc text-[#f5f2eb]">
                <Droplet
                  className={`w-3.5 h-3.5 ${
                    waterQuality === 'BLUE' ? 'text-[#38bdf8]' : 'text-[#fbbf24]'
                  }`}
                />
                <span>污染</span>
              </div>

              {/* Hand-drawn Colored Pencil Gauge Bar */}
              <div className="w-24 sm:w-36 h-3 bg-[#24211e] rounded-full overflow-hidden border-2 border-[#171513] flex shadow-inner">
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

              {/* Water Quality Status Badge */}
              <span
                className={`text-[11px] font-pixel-tc px-2 py-0.5 rounded-md border font-bold ${waterBadge.color}`}
              >
                {waterBadge.text}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Utility Controls (Left under Score, matching mockup) & Character Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Sound Mute Toggle */}
            <button
              onClick={() => sound.toggleMute()}
              className="pencil-hud-pill p-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              title="音效開關"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#f87171]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#6ee7b7]" />
              )}
            </button>

            {/* Pause Toggle */}
            <button
              onClick={onTogglePause}
              className="pencil-hud-pill p-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              title={isPaused ? '繼續遊戲' : '暫停遊戲'}
            >
              {isPaused ? (
                <Play className="w-4 h-4 text-[#facc15]" />
              ) : (
                <Pause className="w-4 h-4 text-[#f5f2eb]" />
              )}
            </button>

            {/* Return Home Button */}
            {onReturnHome && (
              <button
                onClick={() => {
                  sound.playClick();
                  onReturnHome();
                }}
                className="pencil-hud-pill p-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                title="返回首頁"
              >
                <Home className="w-4 h-4 text-[#f5f2eb]" />
              </button>
            )}
          </div>

          {/* Character Mode Indicator */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {characterMode === 'MIDORI_INVINCIBLE' && (
              <div className="pencil-combo-pill px-3 py-1 bg-[#1e6fa8] text-white font-pixel-tc text-xs font-bold animate-bounce">
                ✨ 米多力無敵淨化中！
              </div>
            )}
            {characterMode === 'TRANSFORMING' && (
              <div className="pencil-combo-pill px-3 py-1 text-[#fde047] font-pixel-tc text-xs font-bold animate-pulse">
                ⚡ 變身米多力...
              </div>
            )}
          </div>
        </div>

        {/* Combo Counter & 15s Countdown Gauge (Centered, matching mockup) */}
        {comboCount > 0 && (
          <div className="self-center -mt-6 pointer-events-auto">
            <div className="pencil-combo-pill px-4 py-1.5 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-[#f59e0b] text-[#facc15] animate-bounce" />
                <span className="font-pixel text-xs text-[#facc15] tracking-wide">COMBO</span>
                <span className="font-pixel text-sm sm:text-base text-white font-bold ml-0.5">
                  {comboCount}
                </span>
                <span className="text-xs text-[#d6d0c4] font-pixel">/ 7</span>
              </div>

              {/* 15s Rainbow Colored-Pencil Progress Bar */}
              <div className="w-24 sm:w-28 h-2.5 bg-[#24211e] rounded-full overflow-hidden border-2 border-[#171513]">
                <div
                  className="h-full bg-gradient-to-r from-[#ef4444] via-[#facc15] to-[#10b981] transition-all duration-100 rounded-full"
                  style={{ width: `${comboPercent}%` }}
                />
              </div>
              <span className="text-xs font-pixel text-[#e7e2d8] tabular-nums">
                {Math.max(0, comboTimer).toFixed(1)}s
              </span>
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

      {/* Paused Overlay (Sketchbook Card Style) */}
      {isPaused && (
        <div className="absolute inset-0 bg-[#2c2520]/60 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-auto z-40 p-4">
          <div className="pencil-card p-6 text-center space-y-4 max-w-sm w-full">
            <h2 className="text-2xl font-pixel-tc font-bold text-[#8c521c]">遊戲暫停中</h2>
            <p className="text-xs font-pixel-tc text-[#5c4d3c]">
              休息一下，準備繼續用色鉛筆守護這條傷心湯河川！
            </p>
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
                  <span>結束並返回首頁</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
