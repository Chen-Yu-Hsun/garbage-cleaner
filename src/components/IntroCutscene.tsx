import React, { useState, useEffect } from 'react';
import { Play, SkipForward, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface IntroCutsceneProps {
  onComplete: () => void;
}

export const IntroCutscene: React.FC<IntroCutsceneProps> = ({ onComplete }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const scenes = [
    {
      title: '美麗河川的日常',
      subtitle: '清澈的溪水曾是這座城鎮的靈魂，生命在此靜靜流淌……',
      waterColor: 'from-sky-700 to-sky-950',
      waterDesc: '清澈碧藍',
      imageEmoji: '🌊',
      bannerText: '和平年代',
    },
    {
      title: '無止境的拋棄',
      subtitle: '隨著橋上人潮湧現，菸蒂、塑膠瓶、排泄物隨意丟入水中……',
      waterColor: 'from-amber-900 to-slate-950',
      waterDesc: '日漸混濁',
      imageEmoji: '🗑️',
      bannerText: '垃圾傾瀉',
    },
    {
      title: '傷心湯的誕生',
      subtitle: '河川哭泣了，原本的活水逐漸凝滯為滿是油污與惡臭的「傷心湯」……',
      waterColor: 'from-stone-800 to-stone-950',
      waterDesc: '重度污染',
      imageEmoji: '⚠️',
      bannerText: '第一關：傷心湯',
    },
    {
      title: '醜泥怪挺身而出！',
      subtitle: '居住在橋下的醜泥怪不願看著家園毀滅，它決定張開大嘴，攔截每一件掉落的垃圾！',
      waterColor: 'from-emerald-900 to-slate-950',
      waterDesc: '河川守護者',
      imageEmoji: '👾',
      bannerText: '覺醒時刻',
    },
  ];

  useEffect(() => {
    // Auto advance scenes every 4 seconds or allow manual click
    const timer = setInterval(() => {
      setSceneIndex((prev) => {
        if (prev < scenes.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          onComplete();
          return prev;
        }
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [scenes.length, onComplete]);

  const handleNext = () => {
    sound.playClick();
    if (sceneIndex < scenes.length - 1) {
      setSceneIndex(sceneIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const currentScene = scenes[sceneIndex];

  return (
    <div
      onClick={handleNext}
      className={`relative w-full h-full min-h-[500px] flex flex-col justify-between p-6 bg-gradient-to-b ${currentScene.waterColor} text-white cursor-pointer select-none overflow-hidden transition-colors duration-1000`}
    >
      {/* Top Bar with Title, Volume, Skip Button */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-pixel text-xs">
            0{sceneIndex + 1}
          </div>
          <span className="font-pixel-tc text-sm tracking-wider text-slate-300">
            宣傳片頭 · 河川的前世今生
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className="p-2 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
            title="音效開關"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onComplete();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-600 text-xs font-pixel-tc text-slate-200 hover:text-white transition-all shadow-md"
          >
            <span>跳過片頭</span>
            <SkipForward className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Center Cinematic Pixel Art Showcase */}
      <div className="flex flex-col items-center justify-center my-auto text-center z-20 max-w-2xl mx-auto space-y-6">
        <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-pixel tracking-widest uppercase">
          {currentScene.bannerText}
        </div>

        <div className="text-7xl animate-bounce filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
          {currentScene.imageEmoji}
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-black font-pixel-tc tracking-wide text-white drop-shadow-md">
            {currentScene.title}
          </h2>
          <p className="text-sm md:text-base font-pixel-tc text-slate-200 leading-relaxed max-w-xl mx-auto">
            {currentScene.subtitle}
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar & Prompt */}
      <div className="flex flex-col items-center gap-3 z-20">
        <div className="flex gap-2">
          {scenes.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === sceneIndex ? 'w-10 bg-amber-400' : 'w-3 bg-slate-700'
              }`}
            />
          ))}
        </div>
        <div className="text-xs font-pixel-tc text-slate-400 animate-pulse">
          點擊畫面任意處即可進入下一頁 ({sceneIndex + 1} / {scenes.length})
        </div>
      </div>
    </div>
  );
};
