import React, { useState, useEffect, useCallback } from 'react';
import { SkipForward, ChevronRight } from 'lucide-react';
import { sound } from '../audio/soundManager';
import { MossMonsterSprite } from './MossMonsterSprite';
import { WaterSpiritSprite } from './WaterSpiritSprite';

interface InstructionModalProps {
  onComplete: () => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const instructions = [
    {
      step: '01',
      title: '保護河川',
      text: '阻止行人丟棄的垃圾落入水中，守護這條河川！',
      icon: '🌉',
    },
    {
      step: '02',
      title: '接住垃圾',
      text: '按【A / D】或【方向鍵】左右移動接取垃圾（手機直接滑動拖曳）。',
      icon: '👾',
    },
    {
      step: '03',
      title: '污染警戒',
      text: '漏接垃圾污染 +1，污染累積達 20 點遊戲失敗！',
      icon: '⚠️',
    },
    {
      step: '04',
      title: '神奇雨滴',
      text: '接住天降雨滴可淨化河水，使污染數量減少 1 點！',
      icon: '💧',
    },
    {
      step: '05',
      title: '7連擊變身',
      text: '15 秒內連續接住 7 個垃圾，變身無敵米多力淨化全場！',
      icon: '✨',
    },
    {
      step: '06',
      title: '全球排行',
      text: '挑戰最高接取紀錄，登上世界雲端排行榜！',
      icon: '🏆',
    },
  ];

  const handleNext = useCallback(() => {
    sound.playClick();
    if (stepIndex < instructions.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [stepIndex, instructions.length, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, onComplete]);

  const current = instructions[stepIndex];

  return (
    <div
      onClick={handleNext}
      className="relative w-full h-full min-h-[460px] sm:min-h-[500px] flex flex-col justify-between p-4 sm:p-6 pencil-paper-bg text-[#2c2520] cursor-pointer select-none overflow-y-auto sm:overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="pencil-hud-pill px-3 py-1.5 flex items-center gap-2">
          <span className="font-pixel text-xs text-[#facc15]">TUTORIAL</span>
          <span className="text-[#a8a29e]">·</span>
          <span className="text-xs font-pixel-tc text-[#f5f2eb]">
            {stepIndex + 1} / {instructions.length}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            onComplete();
          }}
          className="pencil-hud-pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-pixel-tc hover:brightness-110 transition-all cursor-pointer"
        >
          <span>跳過</span>
          <SkipForward className="w-3.5 h-3.5 text-[#facc15]" />
        </button>
      </div>

      {/* Main Sketchbook Dialogue Card - Clean & Direct */}
      <div className="z-10 max-w-lg mx-auto w-full my-auto space-y-6">
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 pencil-card bg-[#fffdf8] flex items-center justify-center text-4xl overflow-hidden shadow-lg">
            {current.step === '02' ? (
              <MossMonsterSprite size={56} isCatching={true} />
            ) : current.step === '05' ? (
              <WaterSpiritSprite size={56} isCatching={true} />
            ) : (
              current.icon
            )}
          </div>
        </div>

        {/* Clean Message Box */}
        <div className="p-6 pencil-card text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-black font-pixel-tc text-[#2b221a]">
            {current.title}
          </h2>
          <p className="text-sm md:text-base font-pixel-tc leading-relaxed text-[#4a3b2c] font-bold">
            {current.text}
          </p>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-2.5">
          {instructions.map((item, idx) => (
            <div
              key={item.step}
              className={`h-2.5 rounded-full border border-[#3d3228] transition-all duration-300 ${
                idx === stepIndex
                  ? 'w-8 bg-[#4d8b55]'
                  : idx < stepIndex
                  ? 'w-2.5 bg-[#84a955]'
                  : 'w-2.5 bg-[#e5d7c1]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="flex items-center justify-end z-10 pt-2">
        <div className="pencil-btn-green px-5 py-2 flex items-center gap-1.5 text-sm font-pixel-tc font-bold">
          <span>{stepIndex === instructions.length - 1 ? '開始遊戲' : '下一步'}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
