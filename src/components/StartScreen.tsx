import React, { useState } from 'react';
import { Play, Trophy, HelpCircle, Volume2, VolumeX, Shield, Sparkles, Film } from 'lucide-react';
import { sound } from '../audio/soundManager';

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
  const [errorMsg, setErrorMsg] = useState('');
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    <div className="relative w-full h-full min-h-[480px] sm:min-h-[520px] flex flex-col justify-between items-center p-4 sm:p-6 bg-gradient-to-b from-[#1c322b] via-[#13221e] to-[#0c1614] text-slate-100 select-none overflow-y-auto sm:overflow-hidden">
      {/* Background Decorative Picture-Book River Horizon */}
      <div className="absolute inset-0 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] opacity-5 [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/3 w-full h-px bg-[#263c34]/70" />
      <div className="absolute bottom-0 w-full h-28 bg-gradient-to-t from-[#09352e]/40 to-transparent pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs font-pixel-tc text-[#8fa89b]">
          <Shield className="w-4 h-4 text-[#34d399]" />
          <span>傷心湯 · 河川環境保護行動</span>
        </div>

        <div className="flex items-center gap-2">
          {onReplayIntro && (
            <button
              onClick={() => {
                sound.playClick();
                onReplayIntro();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182a24] hover:bg-[#223931] border border-[#2d453b] text-xs font-pixel-tc text-[#e2ede8] hover:text-[#fbbf24] transition-colors cursor-pointer shadow-sm"
              title="觀看宣傳片頭影片"
            >
              <Film className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>觀看片頭</span>
            </button>
          )}

          <button
            onClick={onOpenInstructions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182a24] hover:bg-[#223931] border border-[#2d453b] text-xs font-pixel-tc text-[#c9ded5] hover:text-white transition-colors cursor-pointer shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>玩法指南</span>
          </button>

          <button
            onClick={handleToggleMute}
            className="p-2 rounded-lg bg-[#182a24] hover:bg-[#223931] border border-[#2d453b] text-slate-200 transition-colors cursor-pointer shadow-sm"
            title="音效開關"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#34d399]" />}
          </button>
        </div>
      </div>

      {/* Center Game Logo & Hero Title */}
      <div className="z-10 text-center my-auto space-y-6 max-w-lg w-full">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#b45309]/20 border border-[#f59e0b]/40 text-[#fbbf24] text-xs font-pixel">
            LEVEL 1: 傷心湯 (SAD SOUP)
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-pixel-tc text-white tracking-wider drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
            醜泥怪：河川守護者
          </h1>
          <p className="text-xs md:text-sm font-pixel-tc text-[#9bb5a8]">
            接取掉落垃圾 · 淨化河川水質 · 7連擊變身米多力
          </p>
        </div>

        {/* Character Avatar Icon Pixel Preview */}
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-xl bg-[#233522]/90 border-2 border-[#527043] flex items-center justify-center text-3xl shadow-lg shadow-black/30">
              👾
            </div>
            <span className="text-[11px] font-pixel-tc text-[#a3e635] font-bold">醜泥怪 (一般)</span>
          </div>
          <span className="text-[#34d399] font-pixel text-sm">→ 7連擊 →</span>
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-xl bg-[#0e3b3a]/90 border-2 border-[#14b8a6] flex items-center justify-center text-3xl shadow-lg shadow-[#14b8a6]/25">
              ✨
            </div>
            <span className="text-[11px] font-pixel-tc text-[#2dd4bf] font-bold">米多力 (無敵)</span>
          </div>
        </div>

        {/* Nickname Input & Start Form */}
        <form onSubmit={handleStart} className="space-y-4 bg-[#162722]/95 p-5 rounded-2xl border-2 border-[#2b4238] shadow-2xl shadow-black/60">
          <div className="text-left space-y-1.5">
            <label className="text-xs font-pixel-tc text-[#c9ded5] font-medium flex items-center justify-between">
              <span>守護者暱稱（2–12 字元）</span>
              <span className="text-[11px] text-[#718f81]">{nickname.trim().length} / 12</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                onNicknameChange(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="請輸入你的暱稱..."
              maxLength={12}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0d1715] border border-[#2d453b] text-white font-pixel-tc text-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
            />
            {errorMsg && (
              <p className="text-xs font-pixel-tc text-red-400 font-semibold">{errorMsg}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#10b981] hover:bg-[#059669] text-slate-950 font-bold font-pixel-tc text-sm transition-all shadow-lg shadow-[#10b981]/25 active:translate-y-0.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>開始守護河川</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenLeaderboard();
              }}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#20342d] hover:bg-[#2b443b] border border-[#375247] text-[#fbbf24] font-pixel-tc text-sm transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#fbbf24]" />
              <span>雲端排行榜</span>
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <div className="z-10 text-center text-[11px] font-pixel-tc text-[#718f81] pt-4">
        <span>鍵盤 A/D 或 ←/→ 移動 · 手機直接觸控拖曳 · 保持河川清澈</span>
      </div>
    </div>
  );
};
