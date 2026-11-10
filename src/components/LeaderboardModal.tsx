import React, { useEffect, useState } from 'react';
import { X, Trophy, RefreshCw, Medal, Clock, ShieldCheck, User } from 'lucide-react';
import { LeaderboardRecord } from '../types/game';
import { sound } from '../audio/soundManager';

interface LeaderboardModalProps {
  currentPlayerId: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  currentPlayerId,
  onClose,
}) => {
  const [scores, setScores] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success && Array.isArray(data.scores)) {
        setScores(data.scores);
      } else {
        setError('無法取得雲端排行榜資料');
      }
    } catch {
      setError('無法連接排行榜伺服器');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const formatSurvival = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none overflow-hidden">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-pixel-tc text-white flex items-center gap-2">
                <span>河川守護者 · 雲端排行榜</span>
                <span className="text-[10px] font-pixel text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  TOP 50
                </span>
              </h2>
              <p className="text-xs font-pixel-tc text-slate-400">
                依成功攔截垃圾總數排序 · 同分依存活時間決勝
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                fetchLeaderboard();
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="重新整理"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="關閉"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Leaderboard Table List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-400 font-pixel-tc text-sm">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <span>載入雲端紀錄中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-xs font-pixel-tc text-red-400">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-pixel-tc text-white"
              >
                重試連接
              </button>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12 text-xs font-pixel-tc text-slate-400">
              尚無排名紀錄，快來搶下世界第一名！
            </div>
          ) : (
            <div className="space-y-1.5">
              {scores.map((item, index) => {
                const rank = index + 1;
                const isCurrentPlayer = item.playerId === currentPlayerId;

                let rankBadge = (
                  <span className="w-6 text-center font-pixel text-xs text-slate-400">#{rank}</span>
                );
                if (rank === 1) {
                  rankBadge = (
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Medal className="w-4 h-4" />
                    </div>
                  );
                } else if (rank === 2) {
                  rankBadge = (
                    <div className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 flex items-center justify-center">
                      <Medal className="w-4 h-4" />
                    </div>
                  );
                } else if (rank === 3) {
                  rankBadge = (
                    <div className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 flex items-center justify-center">
                      <Medal className="w-4 h-4" />
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      isCurrentPlayer
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Rank & Nickname */}
                    <div className="flex items-center gap-3 min-w-0">
                      {rankBadge}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-pixel-tc text-sm font-bold text-white truncate">
                            {item.nickname}
                          </span>
                          {isCurrentPlayer && (
                            <span className="text-[10px] font-pixel-tc px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              你
                            </span>
                          )}
                          {item.verified && (
                            <span title="防作弊驗證通過">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-pixel-tc text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Stats: Score & Survival Time */}
                    <div className="flex items-center gap-5 text-right shrink-0">
                      <div>
                        <div className="text-[10px] font-pixel text-slate-400">CATCHES</div>
                        <div className="text-sm font-pixel text-amber-400 font-bold tabular-nums">
                          {item.totalCatches}
                        </div>
                      </div>

                      <div className="min-w-[60px]">
                        <div className="text-[10px] font-pixel text-slate-400 flex items-center justify-end gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>TIME</span>
                        </div>
                        <div className="text-xs font-pixel text-slate-300 tabular-nums">
                          {formatSurvival(item.survivalTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-pixel-tc text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>雲端伺服器防作弊驗證已啟用</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-pixel-tc transition-colors cursor-pointer"
          >
            返回遊戲
          </button>
        </div>
      </div>
    </div>
  );
};
