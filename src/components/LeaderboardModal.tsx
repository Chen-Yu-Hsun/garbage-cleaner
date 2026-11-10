import React, { useEffect, useState } from 'react';
import { X, Trophy, RefreshCw, Medal, Clock, ShieldCheck } from 'lucide-react';
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
    <div className="absolute inset-0 bg-[#2c2520]/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none overflow-hidden">
      <div className="w-full max-w-2xl pencil-card flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#cbbba0] flex items-center justify-between bg-[#f3ead8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 pencil-combo-pill flex items-center justify-center text-[#facc15]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-pixel-tc text-[#2b221a] flex items-center gap-2">
                <span>河川守護者 · 雲端排行榜</span>
                <span className="text-[10px] font-pixel text-white bg-[#4d8b55] px-2 py-0.5 rounded border border-[#264229]">
                  TOP 50
                </span>
              </h2>
              <p className="text-xs font-pixel-tc text-[#5c4a38] font-bold">
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
              className="pencil-hud-pill p-2 hover:brightness-110 transition-all cursor-pointer"
              title="重新整理"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="pencil-hud-pill p-2 hover:brightness-110 transition-all cursor-pointer"
              title="關閉"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Leaderboard Table List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 pencil-paper-bg">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 text-[#5c4a38] font-pixel-tc text-sm font-bold">
              <RefreshCw className="w-8 h-8 animate-spin text-[#d97706]" />
              <span>載入雲端紀錄中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-xs font-pixel-tc text-[#dc2626] font-bold">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="px-4 py-2 pencil-btn-amber text-xs font-pixel-tc font-bold cursor-pointer"
              >
                重試連接
              </button>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12 text-xs font-pixel-tc text-[#5c4a38] font-bold">
              尚無排名紀錄，快來搶下世界第一名！
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map((item, index) => {
                const rank = index + 1;
                const isCurrentPlayer = item.playerId === currentPlayerId;

                let rankBadge = (
                  <span className="w-6 text-center font-pixel text-xs text-[#6b5744]">#{rank}</span>
                );
                if (rank === 1) {
                  rankBadge = (
                    <div className="w-7 h-7 rounded-full bg-[#fef08a] border-2 border-[#b45309] text-[#b45309] flex items-center justify-center">
                      <Medal className="w-4 h-4" />
                    </div>
                  );
                } else if (rank === 2) {
                  rankBadge = (
                    <div className="w-7 h-7 rounded-full bg-[#e2e8f0] border-2 border-[#475569] text-[#475569] flex items-center justify-center">
                      <Medal className="w-4 h-4" />
                    </div>
                  );
                } else if (rank === 3) {
                  rankBadge = (
                    <div className="w-7 h-7 rounded-full bg-[#fed7aa] border-2 border-[#9a3412] text-[#9a3412] flex items-center justify-center">
                      <Medal className="w-4 h-4" />
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${
                      isCurrentPlayer
                        ? 'bg-[#fef9c3] border-[#b45309] shadow-[2px_2.5px_0px_#b45309]'
                        : 'bg-[#fffdf8] border-[#5c4a38] shadow-[1.5px_2px_0px_#5c4a38]'
                    }`}
                  >
                    {/* Rank & Nickname */}
                    <div className="flex items-center gap-3 min-w-0">
                      {rankBadge}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-pixel-tc text-sm font-bold text-[#2b221a] truncate">
                            {item.nickname}
                          </span>
                          {isCurrentPlayer && (
                            <span className="text-[10px] font-pixel-tc px-1.5 py-0.5 rounded bg-[#f59e0b] text-white font-bold">
                              你
                            </span>
                          )}
                          {item.verified && (
                            <span title="防作弊驗證通過">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#15803d] shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-pixel-tc text-[#786552]">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Stats: Score & Survival Time */}
                    <div className="flex items-center gap-5 text-right shrink-0">
                      <div>
                        <div className="text-[10px] font-pixel text-[#786552]">CATCHES</div>
                        <div className="text-sm font-pixel text-[#b45309] font-bold tabular-nums">
                          {item.totalCatches}
                        </div>
                      </div>

                      <div className="min-w-[60px]">
                        <div className="text-[10px] font-pixel text-[#786552] flex items-center justify-end gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>TIME</span>
                        </div>
                        <div className="text-xs font-pixel text-[#0369a1] font-bold tabular-nums">
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
        <div className="p-4 border-t-2 border-[#cbbba0] bg-[#f3ead8] flex items-center justify-between text-xs font-pixel-tc text-[#5c4a38] font-bold">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#15803d]" />
            <span>雲端伺服器防作弊驗證已啟用</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 pencil-btn-amber font-bold font-pixel-tc cursor-pointer"
          >
            返回遊戲
          </button>
        </div>
      </div>
    </div>
  );
};
