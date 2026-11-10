import React, { useEffect, useState } from 'react';
import { RotateCcw, Trophy, Clock, CheckCircle2, AlertTriangle, Sparkles, Home } from 'lucide-react';
import { PlayerStats, TRASH_TYPES, TrashType } from '../types/game';
import { sound } from '../audio/soundManager';

interface GameOverModalProps {
  stats: PlayerStats;
  nickname: string;
  playerId: string;
  onPlayAgain: () => void;
  onOpenLeaderboard: () => void;
  onReturnHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  nickname,
  playerId,
  onPlayAgain,
  onOpenLeaderboard,
  onReturnHome,
}) => {
  const [submitting, setSubmitting] = useState(true);
  const [submitResult, setSubmitResult] = useState<{ rank?: number; error?: string } | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}分 ${s}秒`;
  };

  // Submit score to cloud leaderboard on mount
  useEffect(() => {
    let isCancelled = false;

    async function submitScore() {
      try {
        setSubmitting(true);
        const payload = {
          playerId,
          nickname,
          score: stats.score,
          totalCatches: stats.totalCatches,
          trashBreakdown: stats.trashBreakdown,
          survivalTime: Math.round(stats.survivalTime * 10) / 10,
        };

        const res = await fetch('/api/scores/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (isCancelled) return;

        if (data.success) {
          setSubmitResult({ rank: data.rank });
        } else {
          setSubmitResult({ error: data.error || '提交未通過' });
        }
      } catch {
        if (!isCancelled) {
          try {
            const localKey = 'river_guardian_offline_scores';
            const localScores = JSON.parse(localStorage.getItem(localKey) || '[]');
            localScores.push({
              nickname,
              score: stats.score,
              totalCatches: stats.totalCatches,
              trashBreakdown: stats.trashBreakdown,
              survivalTime: stats.survivalTime,
              createdAt: new Date().toISOString(),
            });
            localStorage.setItem(localKey, JSON.stringify(localScores));
            setSubmitResult({ rank: 1 });
          } catch {
            setSubmitResult({ error: '連線逾時' });
          }
        }
      } finally {
        if (!isCancelled) {
          setSubmitting(false);
        }
      }
    }

    submitScore();
    return () => {
      isCancelled = true;
    };
  }, [playerId, nickname, stats]);

  const trashKeys: TrashType[] = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06'];

  return (
    <div className="absolute inset-0 bg-[#2c2520]/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none overflow-y-auto">
      <div className="w-full max-w-md pencil-card p-6 space-y-4 text-[#2c2520] my-auto animate-in fade-in duration-300">
        {/* Header - Direct and Clean */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl md:text-3xl font-black font-pixel-tc text-[#2b221a]">
            結算報告
          </h2>
          <div className="inline-block px-3 py-0.5 rounded-full bg-[#f3ead8] border border-[#5c4a38] text-xs font-pixel-tc text-[#5c4a38] font-bold">
            守護者：{nickname}
          </div>
        </div>

        {/* Cloud Ranking Confirmation Card */}
        <div className="p-3 pencil-hud-pill flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#facc15] shrink-0" />
            <div className="text-xs font-pixel-tc text-[#f5f2eb]">
              {submitting ? (
                <span className="text-[#d6d0c4] animate-pulse">成績同步中...</span>
              ) : submitResult?.rank ? (
                <span className="text-[#6ee7b7] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 全球排名 #{submitResult.rank}
                </span>
              ) : (
                <span className="text-[#facc15] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 本機已保存
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="px-2.5 py-1 pencil-btn-amber text-xs font-pixel-tc font-bold shrink-0 cursor-pointer"
          >
            排行榜
          </button>
        </div>

        {/* Primary Scores Grid - Let Numbers Speak for Themselves */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#f3ead8] border-2 border-[#4a3b2c] shadow-[1.5px_2px_0px_#4a3b2c] text-center">
            <div className="text-xs font-pixel text-[#6b5744]">SCORE</div>
            <div className="text-3xl font-black font-pixel text-[#b45309] tabular-nums pt-1">
              {stats.score}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#e8f4f8] border-2 border-[#2b546a] shadow-[1.5px_2px_0px_#2b546a] text-center">
            <div className="text-xs font-pixel text-[#2b546a] flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#0284c7]" />
              <span>TIME</span>
            </div>
            <div className="text-2xl font-bold font-pixel text-[#0369a1] tabular-nums pt-1.5">
              {formatTime(stats.survivalTime)}
            </div>
          </div>
        </div>

        {/* Detailed 6 Trash Breakdown */}
        <div className="grid grid-cols-3 gap-2">
          {trashKeys.map((k) => {
            const info = TRASH_TYPES[k];
            const count = stats.trashBreakdown[k] || 0;
            return (
              <div
                key={k}
                className="p-1.5 rounded-lg bg-[#fffdf8] border-2 border-[#5c4a38] flex items-center justify-between shadow-[1px_1.5px_0px_#5c4a38]"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-[#2c2520] shrink-0"
                    style={{ backgroundColor: info.color }}
                  />
                  <span className="text-xs font-pixel-tc text-[#2c2520] font-bold">{info.name}</span>
                </div>
                <span className="font-pixel text-xs text-[#b45309] font-bold tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Milestones in clean inline row */}
        <div className="flex items-center justify-around p-2 rounded-lg bg-[#eef5e6] border-2 border-[#3d5a2b] text-xs font-pixel-tc text-[#2c3b20] font-bold">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#15803d]" />
            <span>米多力：</span>
            <span className="font-pixel text-[#15803d]">{stats.transformCount} 次</span>
          </div>
          <div className="h-3 w-px bg-[#3d5a2b]/30" />
          <div>
            <span>最高連擊：</span>
            <span className="font-pixel text-[#b45309]">{stats.maxCombo}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 pencil-btn-green font-bold font-pixel-tc text-sm transition-transform active:translate-y-0.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再次挑戰</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onReturnHome();
            }}
            className="flex items-center justify-center gap-1.5 py-3 px-4 pencil-btn-paper font-bold font-pixel-tc text-sm transition-transform active:translate-y-0.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>回首頁</span>
          </button>
        </div>
      </div>
    </div>
  );
};
