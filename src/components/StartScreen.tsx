import React, { useState } from 'react';
import { Play, Trophy, HelpCircle, Volume2, VolumeX, Film } from 'lucide-react';
import { sound } from '../audio/soundManager';
import { MossMonsterSprite } from './MossMonsterSprite';
import { WaterSpiritSprite } from './WaterSpiritSprite';

interface StartScreenProps {
  nickname: string;
  onNicknameChange: (name: string) => void;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenInstructions: () => void;
  onReplayIntro?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  nickname,
  onNicknameChange,
  onStartGame,
  onOpenLeaderboard,
  onOpenInstructions,
  onReplayIntro,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [errorMsg, setErrorMsg] = useState('');
  const [monsterCatching, setMonsterCatching] = useState(false);
  const [midoriCatching, setMidoriCatching] = useState(false);

  const handleMonsterClick = () => {
    sound.playCatchTrash();
    setMonsterCatching(true);
    setTimeout(() => setMonsterCatching(false), 800);
  };

  const handleMidoriClick = () => {
    sound.playCatchRaindrop();
    setMidoriCatching(true);
    setTimeout(() => setMidoriCatching(false), 800);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nickname.trim();
    if (clean.length < 2 || clean.length > 12) {
      setErrorMsg('暱稱長度需介於 2 至 12 個字元！');
      sound.playSplash();
      return;
    }
    setErrorMsg('');
    sound.playClick();
    onStartGame();
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full h-full min-h-[480px] sm:min-h-[520px] flex flex-col justify-between items-center p-4 sm:p-6 pencil-paper-bg text-[#2c2520] select-none overflow-y-auto sm:overflow-hidden">
      {/* Decorative Colored-Pencil Sky Top & River Bottom */}
      <div
        className="absolute top-0 inset-x-0 h-28 pointer-events-none opacity-45"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-33deg, rgba(59, 130, 246, 0.35) 0px, rgba(59, 130, 246, 0.35) 1.5px, transparent 1.5px, transparent 5px)',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none opacity-55"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-26deg, rgba(14, 165, 233, 0.42) 0px, rgba(13, 148, 136, 0.42) 2px, transparent 2px, transparent 5px)',
          maskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)',
        }}
      />

      {/* Top Controls Bar */}
      <div className="w-full max-w-2xl flex items-center justify-end z-10 gap-2">
        {onReplayIntro && (
          <button
            onClick={() => {
              sound.playClick();
              onReplayIntro();
            }}
            className="pencil-hud-pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-pixel-tc hover:brightness-110 transition-all cursor-pointer"
            title="片頭影片"
          >
            <Film className="w-3.5 h-3.5 text-[#facc15]" />
            <span>片頭</span>
          </button>
        )}

        <button
          onClick={() => {
            sound.playClick();
            onOpenInstructions();
          }}
          className="pencil-hud-pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-pixel-tc hover:brightness-110 transition-all cursor-pointer"
          title="遊戲說明"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#7dd3fc]" />
          <span>說明</span>
        </button>

        <button
          onClick={handleToggleMute}
          className="pencil-hud-pill p-2 hover:brightness-110 transition-all cursor-pointer"
          title="音效開關"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-[#f87171]" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#6ee7b7]" />
          )}
        </button>
      </div>

      {/* Center Game Logo & Hero Title */}
      <div className="z-10 text-center my-auto space-y-6 max-w-lg w-full">
        {/* Main Title - Clean and Impactful, No Subtitles */}
        <h1 className="text-3xl md:text-5xl font-black font-pixel-tc text-[#2b221a] tracking-wider drop-shadow-[2px_2px_0px_rgba(255,250,240,0.95)]">
          醜泥怪：河川守護者
        </h1>

        {/* Character Avatar Icon Colored-Pencil Preview with Interactive Exaggerated Mouth Eating */}
        <div className="flex items-center justify-center gap-6 py-1">
          <div
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
            onClick={handleMonsterClick}
            onMouseEnter={() => setMonsterCatching(true)}
            onMouseLeave={() => setMonsterCatching(false)}
            title="點擊看張嘴吃垃圾動作！"
          >
            <div className="w-18 h-18 pencil-card bg-[#eef5e6] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 active:scale-95 shadow-md">
              <MossMonsterSprite size={52} isCatching={monsterCatching} />
            </div>
            <span className="text-sm font-pixel-tc text-[#3d5a2b] font-bold">醜泥怪</span>
          </div>

          <span className="pencil-hud-pill px-3 py-1 text-[#facc15] font-pixel text-xs">
            ➔ 7連擊 ➔
          </span>

          <div
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
            onClick={handleMidoriClick}
            onMouseEnter={() => setMidoriCatching(true)}
            onMouseLeave={() => setMidoriCatching(false)}
            title="點擊看張嘴淨化動作！"
          >
            <div className="w-18 h-18 pencil-card bg-[#e6f6fa] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 active:scale-95 shadow-md">
              <WaterSpiritSprite size={52} isCatching={midoriCatching} />
            </div>
            <span className="text-sm font-pixel-tc text-[#18647d] font-bold">米多力</span>
          </div>
        </div>

        {/* Nickname Input & Start Form - Layout Speaks for Itself */}
        <form onSubmit={handleStart} className="space-y-4 pencil-card p-5 max-w-md mx-auto">
          <div className="text-left space-y-1">
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                onNicknameChange(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="請輸入守護者暱稱..."
              maxLength={12}
              className="w-full px-4 py-2.5 rounded-xl bg-[#fffdf8] border-2 border-[#4a3b2c] text-[#2c2520] font-pixel-tc text-sm focus:outline-none focus:border-[#4d8b55] focus:ring-2 focus:ring-[#4d8b55]/30 shadow-inner transition-colors text-center"
            />
            {errorMsg && (
              <p className="text-xs text-[#dc2626] font-pixel-tc font-bold text-center animate-bounce">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 pencil-btn-green font-bold font-pixel-tc text-base transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>開始遊戲</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenLeaderboard();
              }}
              className="flex items-center justify-center gap-2 py-3 px-5 pencil-btn-amber font-bold font-pixel-tc text-sm transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#fffdf7]" />
              <span>排行榜</span>
            </button>
          </div>
        </form>
      </div>

      {/* Clean bottom padding without cluttered instructions */}
      <div className="h-2" />
    </div>
  );
};
