import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Persistent leaderboard data store
const DATA_DIR = path.resolve(__dirname, 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

export interface ScoreEntry {
  id: string;
  playerId: string;
  nickname: string;
  score: number;
  totalCatches: number;
  trashBreakdown: {
    T01: number; // 菸蒂
    T02: number; // 寶特瓶
    T03: number; // 玻璃瓶
    T04: number; // 鋁箔飲料盒
    T05: number; // 餅乾包裝
    T06: number; // 排泄物
  };
  survivalTime: number; // in seconds
  createdAt: string;
  verified: boolean;
}

// Seed initial leaderboard with community champions to give immediate competitive fun
const SEED_SCORES: ScoreEntry[] = [
  {
    id: 'seed-1',
    playerId: 'river-hero-99',
    nickname: '河川守護神阿東',
    score: 88,
    totalCatches: 88,
    trashBreakdown: { T01: 16, T02: 15, T03: 14, T04: 15, T05: 14, T06: 14 },
    survivalTime: 145.2,
    createdAt: '2026-11-09T18:30:00.000Z',
    verified: true,
  },
  {
    id: 'seed-2',
    playerId: 'green-midori-7',
    nickname: '米多力大師',
    score: 65,
    totalCatches: 65,
    trashBreakdown: { T01: 12, T02: 11, T03: 10, T04: 11, T05: 11, T06: 10 },
    survivalTime: 112.5,
    createdAt: '2026-11-09T19:15:00.000Z',
    verified: true,
  },
  {
    id: 'seed-3',
    playerId: 'eco-warrior-01',
    nickname: '傷心湯洗清者',
    score: 52,
    totalCatches: 52,
    trashBreakdown: { T01: 9, T02: 8, T03: 9, T04: 9, T05: 9, T06: 8 },
    survivalTime: 95.8,
    createdAt: '2026-11-09T20:00:00.000Z',
    verified: true,
  },
  {
    id: 'seed-4',
    playerId: 'clean-water-22',
    nickname: '淨水小尖兵',
    score: 41,
    totalCatches: 41,
    trashBreakdown: { T01: 7, T02: 7, T03: 7, T04: 7, T05: 7, T06: 6 },
    survivalTime: 78.4,
    createdAt: '2026-11-09T21:10:00.000Z',
    verified: true,
  },
  {
    id: 'seed-5',
    playerId: 'mud-catcher-55',
    nickname: '超級醜泥怪',
    score: 30,
    totalCatches: 30,
    trashBreakdown: { T01: 5, T02: 5, T03: 5, T04: 5, T05: 5, T06: 5 },
    survivalTime: 62.0,
    createdAt: '2026-11-09T22:05:00.000Z',
    verified: true,
  },
];

let leaderboardScores: ScoreEntry[] = [];

// Initialize data storage
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(LEADERBOARD_FILE)) {
    const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
    leaderboardScores = JSON.parse(raw);
  } else {
    leaderboardScores = [...SEED_SCORES];
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboardScores, null, 2), 'utf-8');
  }
} catch (e) {
  console.warn('Failed to read leaderboard file, falling back to memory store:', e);
  leaderboardScores = [...SEED_SCORES];
}

function saveScores() {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboardScores, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving leaderboard:', err);
  }
}

// In-memory rate limiting map: playerId -> last submission timestamp
const submissionRateMap = new Map<string, number>();

// Leaderboard sort: totalCatches DESC, then survivalTime DESC, then createdAt ASC
function sortScores(scores: ScoreEntry[]) {
  return [...scores].sort((a, b) => {
    if (b.totalCatches !== a.totalCatches) {
      return b.totalCatches - a.totalCatches;
    }
    if (b.survivalTime !== a.survivalTime) {
      return b.survivalTime - a.survivalTime;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

// API Routes
app.get('/api/leaderboard', (req, res) => {
  const sorted = sortScores(leaderboardScores).slice(0, 50);
  res.json({
    success: true,
    count: sorted.length,
    scores: sorted,
  });
});

app.post('/api/scores/submit', (req, res) => {
  const { playerId, nickname, score, totalCatches, trashBreakdown, survivalTime } = req.body;

  // 1. Nickname check (2-12 characters, trimmed)
  if (!nickname || typeof nickname !== 'string') {
    return res.status(400).json({ success: false, error: '請輸入有效的玩家暱稱' });
  }
  const cleanNick = nickname.trim();
  if (cleanNick.length < 2 || cleanNick.length > 12) {
    return res.status(400).json({ success: false, error: '暱稱長度需介於 2 至 12 字元' });
  }

  // 2. Anonymous ID check
  if (!playerId || typeof playerId !== 'string' || playerId.length < 4) {
    return res.status(400).json({ success: false, error: '無效的玩家識別碼' });
  }

  // 3. Rate limiting (minimum 5s between submissions per player)
  const now = Date.now();
  const lastSub = submissionRateMap.get(playerId) || 0;
  if (now - lastSub < 5000) {
    return res.status(429).json({ success: false, error: '提交過於頻繁，請稍候重試' });
  }
  submissionRateMap.set(playerId, now);

  // 4. Data verification: Score & Trash breakdown consistency
  if (typeof score !== 'number' || typeof totalCatches !== 'number' || typeof survivalTime !== 'number') {
    return res.status(400).json({ success: false, error: '成績格式錯誤' });
  }

  if (score !== totalCatches || score < 0) {
    return res.status(400).json({ success: false, error: '接取總數與分數不一致' });
  }

  if (!trashBreakdown || typeof trashBreakdown !== 'object') {
    return res.status(400).json({ success: false, error: '缺少垃圾分類統計資料' });
  }

  const sumCategories =
    (Number(trashBreakdown.T01) || 0) +
    (Number(trashBreakdown.T02) || 0) +
    (Number(trashBreakdown.T03) || 0) +
    (Number(trashBreakdown.T04) || 0) +
    (Number(trashBreakdown.T05) || 0) +
    (Number(trashBreakdown.T06) || 0);

  if (sumCategories !== totalCatches) {
    return res.status(400).json({
      success: false,
      error: '分類垃圾總和與成功接取總數不符',
    });
  }

  // 5. Anti-cheat feasibility check
  // Theoretical spawn rate: normal ~1.5s/trash, Midori ~0.75s/trash.
  // In the most extreme case, maximum theoretical spawn is ~ 1.5 trash/second + starting buffer.
  const maxPossibleCatches = Math.ceil(survivalTime * 1.8) + 5;
  if (totalCatches > maxPossibleCatches && survivalTime > 2) {
    return res.status(400).json({
      success: false,
      error: '成績超出合理物理上限，驗證未通過',
    });
  }

  const newEntry: ScoreEntry = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    playerId,
    nickname: cleanNick,
    score,
    totalCatches,
    trashBreakdown: {
      T01: Number(trashBreakdown.T01) || 0,
      T02: Number(trashBreakdown.T02) || 0,
      T03: Number(trashBreakdown.T03) || 0,
      T04: Number(trashBreakdown.T04) || 0,
      T05: Number(trashBreakdown.T05) || 0,
      T06: Number(trashBreakdown.T06) || 0,
    },
    survivalTime: Math.round(survivalTime * 10) / 10,
    createdAt: new Date().toISOString(),
    verified: true,
  };

  leaderboardScores.push(newEntry);
  saveScores();

  const allSorted = sortScores(leaderboardScores);
  const rank = allSorted.findIndex((e) => e.id === newEntry.id) + 1;

  res.json({
    success: true,
    entry: newEntry,
    rank,
    totalEntries: allSorted.length,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`醜泥怪：河川守護者 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
