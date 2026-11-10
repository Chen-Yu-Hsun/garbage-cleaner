import React, { useState, useEffect, useCallback } from 'react';
import { SkipForward, ChevronRight, Keyboard, Sparkles } from 'lucide-react';
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
      kicker: '故事背景 · 傷心湯的危機',
      text: '橋上的行人們常常隨手丟棄垃圾，美麗的河川即將變成「傷心湯」……',
      icon: '🌉',
      tip: '六種垃圾隨機由橋面墜落，河川存亡就掌握在你的手中。',
    },
    {
      step: '02',
      kicker: '基本操作 · 接住垃圾',
      text: '你是生活在橋下的「醜泥怪」，請左右移動接住所有掉落的垃圾，保護水質！',
      icon: '👾',
      tip: '電腦按【A / D】或【← / →】鍵移動；手機可直接在螢幕上滑動拖曳。',
    },
    {
      step: '03',
      kicker: '污染警戒 · 河水顏色變化',
      text: '注意！一般狀態下若垃圾落入水中，河面污染數量將增加，達到 20 時遊戲便宣告失敗！',
      icon: '⚠️',
      tip: '污染 0–9 藍水正常；10–19 灰色警戒且音樂急促；20 黑色 Game Over！',
    },
    {
      step: '04',
      kicker: '淨化道具 · 神奇雨滴',
      text: '天降的「雨滴」是淨化神器，接住雨滴可以使河川污染數量減少 1 點！',
      icon: '💧',
      tip: '雨滴體型較小，成功接取不會增加分數或影響連擊，漏接也不受罰。',
    },
    {
      step: '05',
      kicker: '核心機制 · 米多力變身',
      text: '在 15 秒內連續接住 7 個垃圾，醜泥怪將變身為無敵「米多力」，體型成長且接取範圍擴大！',
      icon: '✨',
      tip: '變身時凍結 1 秒，隨後獲得 2 秒無敵；無敵期間漏接不增污染並產生消散特效！',
    },
    {
      step: '06',
      kicker: '爭奪榮耀 · 雲端排行榜',
      text: '化身河川守護者，創造最高接取紀錄，登上全伺服器雲端排行榜吧！',
      icon: '🏆',
      tip: '輸入暱稱即刻啟程，遊戲將依總接取數與存活時間計算您的世界排名。',
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
      {/* Top Colored-Pencil Sky Border Accent */}
      <div
        className="absolute top-0 inset-x-0 h-20 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-33deg, rgba(59, 130, 246, 0.35) 0px, rgba(59, 130, 246, 0.35) 1.5px, transparent 1.5px, transparent 5px)',
          maskImage: 'linear-gradient(to bottom, black 35%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 35%, transparent 100%)',
        }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="pencil-hud-pill px-3 py-1.5 flex items-center gap-2">
          <span className="font-pixel text-xs text-[#facc15]">TUTORIAL</span>
          <span className="text-[#a8a29e]">·</span>
          <span className="text-xs font-pixel-tc text-[#f5f2eb]">手繪操作繪本</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            onComplete();
          }}
          className="pencil-hud-pill flex items-center gap-1.5 px-3 py-1.5 text-xs font-pixel-tc hover:brightness-110 transition-all cursor-pointer"
        >
          <span>跳過說明</span>
          <SkipForward className="w-3.5 h-3.5 text-[#facc15]" />
        </button>
      </div>

      {/* Main Sketchbook Dialogue Card */}
      <div className="z-10 max-w-xl mx-auto w-full my-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 pencil-card bg-[#fffdf8] flex items-center justify-center text-2xl overflow-hidden shrink-0">
            {current.step === '02' ? (
              <MossMonsterSprite size={42} />
            ) : current.step === '05' ? (
              <WaterSpiritSprite size={42} />
            ) : (
              current.icon
            )}
          </div>
          <div>
            <div className="text-xs font-pixel text-[#b45309] font-bold">
              STEP {current.step} / 06
            </div>
            <h2 className="text-lg md:text-xl font-bold font-pixel-tc text-[#2b221a]">
              {current.kicker}
            </h2>
          </div>
        </div>

        {/* Main Dialogue Box */}
        <div className="p-6 pencil-card space-y-4">
          <p className="text-base md:text-lg font-pixel-tc leading-relaxed text-[#2c2520] font-bold min-h-[3.5rem]">
            {current.text}
          </p>

          <div className="pt-3 border-t-2 border-dashed border-[#cbbba0] flex items-start gap-2 text-xs font-pixel-tc text-[#5c4a38]">
            <Sparkles className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
            <span>{current.tip}</span>
          </div>
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

      {/* Bottom Prompt */}
      <div className="flex items-center justify-between z-10 pt-2 border-t-2 border-[#d8cbb8]">
        <div className="flex items-center gap-2 text-xs font-pixel-tc text-[#5c4a38] font-bold">
          <Keyboard className="w-4 h-4 text-[#8c5828]" />
          <span>按 Enter、空白鍵 或 點擊畫面繼續</span>
        </div>

        <div className="pencil-btn-green px-3.5 py-1.5 flex items-center gap-1 text-xs font-pixel-tc font-bold">
          <span>{stepIndex === instructions.length - 1 ? '進入遊戲' : '下一步'}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
