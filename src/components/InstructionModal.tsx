import React, { useState, useEffect, useCallback } from 'react';
import { SkipForward, ChevronRight, Keyboard, Sparkles } from 'lucide-react';
import { sound } from '../audio/soundManager';
import { MossMonsterSprite } from './MossMonsterSprite';

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
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext]);

  const current = instructions[stepIndex];

  return (
    <div
      onClick={handleNext}
      className="relative w-full h-full min-h-[460px] sm:min-h-[500px] flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-[#1b2e28] via-[#13221e] to-[#0c1614] text-slate-100 cursor-pointer select-none overflow-y-auto sm:overflow-hidden"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-xs text-[#fbbf24]">TUTORIAL</span>
          <span className="text-[#5a786c]">·</span>
          <span className="text-xs font-pixel-tc text-[#9bb5a8]">操作說明</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            onComplete();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182a24] hover:bg-[#223931] border border-[#2d453b] text-xs font-pixel-tc text-[#c9ded5] hover:text-white transition-colors cursor-pointer shadow-sm"
        >
          <span>跳過說明</span>
          <SkipForward className="w-3.5 h-3.5 text-[#fbbf24]" />
        </button>
      </div>

      {/* Main Dialogue Card */}
      <div className="z-10 max-w-xl mx-auto w-full my-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#20332c] border-2 border-[#10b981]/60 flex items-center justify-center text-2xl shadow-inner shadow-black/40 overflow-hidden">
            {current.step === '02' ? <MossMonsterSprite size={36} /> : current.icon}
          </div>
          <div>
            <div className="text-xs font-pixel text-[#fbbf24]">STEP {current.step} / 06</div>
            <h3 className="text-sm font-pixel-tc text-[#e2ece7] font-semibold">{current.kicker}</h3>
          </div>
        </div>

        {/* Narrative Box with retro pixel border */}
        <div className="p-6 rounded-2xl bg-[#162722]/95 border-2 border-[#2b4238] shadow-2xl relative">
          <p className="text-lg md:text-xl font-bold font-pixel-tc text-white leading-relaxed tracking-wide">
            {current.text}
          </p>

          <div className="mt-4 pt-4 border-t border-[#263c33] flex items-start gap-2 text-xs font-pixel-tc text-[#9bb5a8]">
            <span className="text-[#fbbf24] shrink-0 font-bold">提示：</span>
            <span>{current.tip}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Action Guidance */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 z-10 pt-4 border-t border-[#1e332a]">
        <div className="flex items-center gap-2 text-xs font-pixel-tc text-[#8fa89b]">
          <Keyboard className="w-4 h-4 text-[#34d399]" />
          <span>點擊螢幕或按【Enter】繼續</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {instructions.map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full ${
                  idx === stepIndex ? 'bg-[#fbbf24] ring-2 ring-[#fbbf24]/30' : 'bg-[#2b4238]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs font-pixel-tc text-[#fbbf24] font-bold">
            <span>{stepIndex === instructions.length - 1 ? '開始守護河川' : '下一句'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
