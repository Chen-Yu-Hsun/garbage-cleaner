import React from 'react';
import { Pause, Play, Volume2, VolumeX, Flame, Droplet, Shield, Clock, Home } from 'lucide-react';
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
      return { text: '水質清澈', color: 'text-sky-400 bg-sky-950/80 border-sky-800' };
    }
    if (waterQuality === 'GREY') {
      return { text: '灰色警戒', color: 'text-amber-400 bg-amber-950/80 border-amber-800 animate-pulse' };
    }
    return { text: '嚴重污染', color: 'text-red-400 bg-red-950/80 border-red-800' };
  };

  const waterBadge = getWaterBadge();

  // Combo bar percentage (out of 15 seconds)
  const comboPercent = comboCount > 0 ? Math.max(0, Math.min(100, (comboTimer / 15) * 100)) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 z-30">
        {/* Left: Score & Survival Time */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Score Box */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 shadow-md flex items-center gap-2">
            <span className="text-[11px] font-pixel text-slate-400">SCORE</span>
            <span className="text-base font-pixel text-amber-400 tabular-nums">{score}</span>
          </div>

          {/* Time Box */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 shadow-md flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-pixel text-slate-200 tabular-nums">{formatTime(survivalTime)}</span>
          </div>

          {/* Scale Badge */}
          <div className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-pixel-tc text-emerald-300 items-center gap-1">
            <span>體型</span>
            <span className="font-pixel text-[10px] text-emerald-400 font-bold">
              {Math.round(growthScale * 100)}%
            </span>
          </div>
        </div>

        {/* Center: Pollution Meter (0 - 20) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 shadow-md flex items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs font-pixel-tc text-slate-300">
              <Droplet className={`w-3.5 h-3.5 ${waterQuality === 'BLUE' ? 'text-sky-400' : 'text-amber-500'}`} />
              <span>污染</span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-24 sm:w-32 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700 flex">
              <div
                className={`h-full transition-all duration-200 ${
                  pollutionCount < 10
                    ? 'bg-sky-500'
                    : pollutionCount < 18
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${(pollutionCount / 20) * 100}%` }}
              />
            </div>

            <span className="text-xs font-pixel text-slate-200 tabular-nums">
              {pollutionCount}/20
            </span>

            {/* Water Quality Status Badge */}
            <span className={`text-[10px] font-pixel-tc px-2 py-0.5 rounded border ${waterBadge.color}`}>
              {waterBadge.text}
            </span>
          </div>
        </div>

        {/* Right: State & Utility Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Character Mode Indicator */}
          {characterMode === 'MIDORI_INVINCIBLE' && (
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-pixel-tc text-xs font-bold animate-bounce shadow-lg shadow-emerald-500/40">
              ✨ 米多力無敵中！
            </div>
          )}
          {characterMode === 'TRANSFORMING' && (
            <div className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-pixel-tc text-xs font-bold animate-pulse">
              ⚡ 變身中...
            </div>
          )}

          {/* Sound Mute Toggle */}
          <button
            onClick={() => sound.toggleMute()}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="音效開關"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause Toggle */}
          <button
            onClick={onTogglePause}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isPaused ? '繼續遊戲' : '暫停遊戲'}
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Return Home Button */}
          {onReturnHome && (
            <button
              onClick={() => {
                sound.playClick();
                onReturnHome();
              }}
              className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-sky-300 transition-colors cursor-pointer"
              title="返回首頁"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Combo Counter & 15s Countdown Gauge (Top Center below bar) */}
      {comboCount > 0 && (
        <div className="self-center mt-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/95 border border-amber-500/60 shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-400 animate-bounce" />
              <span className="font-pixel text-xs text-amber-300">COMBO</span>
              <span className="font-pixel text-sm text-white font-bold ml-1">{comboCount}</span>
              <span className="text-xs text-slate-400 font-pixel">/ 7</span>
            </div>

            {/* 15s Countdown Progress */}
            <div className="w-20 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-100"
                style={{ width: `${comboPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-pixel text-slate-400 tabular-nums">
              {Math.max(0, comboTimer).toFixed(1)}s
            </span>
          </div>
        </div>
      )}

      {/* Mobile On-Screen Directional Touch Buttons (at bottom corners) */}
      <div className="w-full flex items-center justify-between pointer-events-none mt-auto pb-4 px-2">
        <button
          onTouchStart={onMoveLeftStart}
          onTouchEnd={onMoveLeftEnd}
          onMouseDown={onMoveLeftStart}
          onMouseUp={onMoveLeftEnd}
          onMouseLeave={onMoveLeftEnd}
          className="pointer-events-auto md:hidden w-16 h-16 rounded-2xl bg-slate-900/80 active:bg-amber-500/40 border-2 border-slate-700 text-2xl font-bold flex items-center justify-center text-white active:scale-95 transition-all shadow-xl backdrop-blur-xs select-none touch-none"
        >
          ◀
        </button>

        <button
          onTouchStart={onMoveRightStart}
          onTouchEnd={onMoveRightEnd}
          onMouseDown={onMoveRightStart}
          onMouseUp={onMoveRightEnd}
          onMouseLeave={onMoveRightEnd}
          className="pointer-events-auto md:hidden w-16 h-16 rounded-2xl bg-slate-900/80 active:bg-amber-500/40 border-2 border-slate-700 text-2xl font-bold flex items-center justify-center text-white active:scale-95 transition-all shadow-xl backdrop-blur-xs select-none touch-none"
        >
          ▶
        </button>
      </div>

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-auto z-40">
          <div className="p-6 rounded-2xl bg-slate-900 border-2 border-amber-500/60 text-center space-y-4 max-w-sm shadow-2xl">
            <h2 className="text-2xl font-pixel-tc font-bold text-amber-400">遊戲暫停中</h2>
            <p className="text-xs font-pixel-tc text-slate-300">休息一下，準備繼續保護這條傷心湯河川！</p>
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={onTogglePause}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel-tc font-bold text-sm transition-colors cursor-pointer"
              >
                繼續遊戲
              </button>
              {onReturnHome && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onReturnHome();
                  }}
                  className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-pixel-tc text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4 text-sky-400" />
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
