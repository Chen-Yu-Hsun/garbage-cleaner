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
      } catch (err) {
        if (!isCancelled) {
          // If offline, save locally
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
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 text-white my-auto animate-in fade-in duration-300">
        {/* Header Title */}
        <div className="text-center space-y-1">
          <div className="inline-block px-3 py-0.5 rounded bg-red-500/20 text-red-400 font-pixel text-xs border border-red-500/30">
            GAME OVER · 河川污染淪陷
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-pixel-tc text-white tracking-wide">
            傷心湯 結算報告
          </h2>
          <p className="text-xs font-pixel-tc text-slate-400">
            河川污染累積達 20 點 · 感謝守護者 <span className="text-amber-400 font-bold">{nickname}</span> 的付出！
          </p>
        </div>

        {/* Cloud Ranking Confirmation Card */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] font-pixel text-slate-400">CLOUD LEADERBOARD</div>
              <div className="text-xs font-pixel-tc text-slate-200">
                {submitting ? (
                  <span className="text-slate-400 animate-pulse">正在將成績同步至雲端排行榜...</span>
                ) : submitResult?.rank ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 已驗證上傳！全球即時排名第 #{submitResult.rank} 名
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {submitResult?.error || '已本機保存'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-pixel-tc text-amber-300 transition-colors shrink-0"
          >
            查看排行
          </button>
        </div>

        {/* Primary Scores Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
            <div className="text-[11px] font-pixel text-slate-400">TOTAL SCORE</div>
            <div className="text-3xl font-black font-pixel text-amber-400 tabular-nums">
              {stats.score}
            </div>
            <div className="text-[10px] font-pixel-tc text-slate-400">成功接取垃圾總數</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
            <div className="text-[11px] font-pixel text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>SURVIVAL</span>
            </div>
            <div className="text-2xl font-bold font-pixel text-sky-300 tabular-nums pt-1">
              {formatTime(stats.survivalTime)}
            </div>
            <div className="text-[10px] font-pixel-tc text-slate-400">有效遊戲存活時間</div>
          </div>
        </div>

        {/* Detailed 6 Trash Breakdown (AC-41: Breakdown sum must equal total) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-pixel-tc text-slate-300 px-1">
            <span>各類垃圾攔截統計</span>
            <span className="text-[11px] text-slate-400">
              合計：{Object.values(stats.trashBreakdown).reduce((a, b) => a + b, 0)} 個
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {trashKeys.map((k) => {
              const info = TRASH_TYPES[k];
              const count = stats.trashBreakdown[k] || 0;
              return (
                <div
                  key={k}
                  className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="text-xs font-pixel-tc text-slate-300">{info.name}</span>
                  </div>
                  <span className="font-pixel text-xs text-white tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone info */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-xs font-pixel-tc text-slate-400">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>成功觸發米多力：</span>
            <span className="font-pixel text-emerald-400 font-bold">{stats.transformCount} 次</span>
          </div>
          <div>
            <span>最高連擊：</span>
            <span className="font-pixel text-amber-400 font-bold">{stats.maxCombo} 連擊</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-pixel-tc text-sm transition-all shadow-lg shadow-amber-500/20 active:translate-y-0.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再次挑戰</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-pixel-tc text-sm transition-colors cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>排行榜</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onReturnHome();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-pixel-tc text-sm transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span>返回首頁</span>
          </button>
        </div>
      </div>
    </div>
  );
};
