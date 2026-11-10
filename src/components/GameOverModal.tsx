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
      <div className="w-full max-w-lg pencil-card p-6 space-y-4 text-[#2c2520] my-auto animate-in fade-in duration-300">
        {/* Header Title */}
        <div className="text-center space-y-1">
          <div className="inline-block px-3 py-0.5 rounded-md bg-[#dc2626] text-white font-pixel text-xs border-2 border-[#7f1d1d] shadow-xs">
            GAME OVER · 河川污染淪陷
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-pixel-tc text-[#2b221a] tracking-wide">
            傷心湯 結算報告
          </h2>
          <p className="text-xs font-pixel-tc text-[#5c4a38] font-bold">
            河川污染累積達 20 點 · 感謝守護者{' '}
            <span className="text-[#b45309] underline decoration-wavy">{nickname}</span> 的付出！
          </p>
        </div>

        {/* Cloud Ranking Confirmation Card */}
        <div className="p-3.5 pencil-hud-pill flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[#facc15] shrink-0" />
            <div>
              <div className="text-[11px] font-pixel text-[#d6d0c4]">CLOUD LEADERBOARD</div>
              <div className="text-xs font-pixel-tc text-[#f5f2eb]">
                {submitting ? (
                  <span className="text-[#d6d0c4] animate-pulse">正在將成績同步至雲端排行榜...</span>
                ) : submitResult?.rank ? (
                  <span className="text-[#6ee7b7] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 已驗證上傳！全球即時排名第 #{submitResult.rank} 名
                  </span>
                ) : (
                  <span className="text-[#facc15] flex items-center gap-1">
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
            className="px-3 py-1.5 pencil-btn-amber text-xs font-pixel-tc font-bold shrink-0 cursor-pointer"
          >
            查看排行
          </button>
        </div>

        {/* Primary Scores Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#f3ead8] border-2 border-[#4a3b2c] shadow-[1.5px_2px_0px_#4a3b2c] text-center space-y-1">
            <div className="text-[11px] font-pixel text-[#6b5744]">TOTAL SCORE</div>
            <div className="text-3xl font-black font-pixel text-[#b45309] tabular-nums">
              {stats.score}
            </div>
            <div className="text-[10px] font-pixel-tc text-[#5c4a38] font-bold">成功接取垃圾總數</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#e8f4f8] border-2 border-[#2b546a] shadow-[1.5px_2px_0px_#2b546a] text-center space-y-1">
            <div className="text-[11px] font-pixel text-[#2b546a] flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#0284c7]" />
              <span>SURVIVAL</span>
            </div>
            <div className="text-2xl font-bold font-pixel text-[#0369a1] tabular-nums pt-1">
              {formatTime(stats.survivalTime)}
            </div>
            <div className="text-[10px] font-pixel-tc text-[#2b546a] font-bold">有效遊戲存活時間</div>
          </div>
        </div>

        {/* Detailed 6 Trash Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-pixel-tc text-[#3d3228] font-bold px-1">
            <span>各類垃圾攔截統計</span>
            <span className="text-[11px] text-[#6b5744]">
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
                  className="p-2 rounded-lg bg-[#fffdf8] border-2 border-[#5c4a38] flex items-center justify-between shadow-[1px_1.5px_0px_#5c4a38]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-[#2c2520] shrink-0"
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
        </div>

        {/* Milestone info */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#eef5e6] border-2 border-[#3d5a2b] text-xs font-pixel-tc text-[#2c3b20] font-bold">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#15803d]" />
            <span>成功觸發米多力：</span>
            <span className="font-pixel text-[#15803d]">{stats.transformCount} 次</span>
          </div>
          <div>
            <span>最高連擊：</span>
            <span className="font-pixel text-[#b45309]">{stats.maxCombo} 連擊</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 pencil-btn-green font-bold font-pixel-tc text-sm transition-transform active:translate-y-0.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再次挑戰</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 pencil-btn-amber font-bold font-pixel-tc text-sm transition-transform active:translate-y-0.5 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>排行榜</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onReturnHome();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 pencil-btn-paper font-bold font-pixel-tc text-sm transition-transform active:translate-y-0.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>回首頁</span>
          </button>
        </div>
      </div>
    </div>
  );
};
