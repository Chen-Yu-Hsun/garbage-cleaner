# 醜泥怪：河川守護者 (River Guardian)

2D 像素風格網頁遊戲——第一關「傷心湯」。玩家在橋下操作「醜泥怪」接取從橋上掉落的各式垃圾，防止河川水質惡化，累積連擊變身為「米多力」，守護美麗的河川！

---

## 🎮 遊戲特色

- **經典街機接物機制**：操作醜泥怪左右移動（A/D 或 方向鍵），攔截 6 種掉落垃圾（菸蒂、寶特瓶、玻璃瓶、鋁箔盒、餅乾包裝、排泄物）。
- **連擊與變身系統**：連續接取垃圾累積 Combo，觸發變身米多力進入無敵狂熱狀態。
- **水質與成長機制**：水質分為藍色（乾淨）、灰色（輕度污染）、黑色（重度污染）；拾取特定道具可成長體積擴大接物範圍。
- **排行榜與防弊機制**：後端 Express 整合排行榜系統，內建成績合理性驗證與防刷機制。

---

## 🛠️ 技術棧

- **前端**：React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Motion + Lucide React
- **渲染引擎**：HTML5 Canvas 2D 像素動畫渲染
- **後端**：Node.js + Express (支援 Vite 開發中間件與 Production 靜態伺服)
- **環境**：Node.js v24+

---

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 環境變數設定
專案已提供 `.env.example`，可複製為 `.env.local`：
```bash
cp .env.example .env.local
```
*(若後續擴充 AI 生成功能，可在 `.env.local` 中設定 `GEMINI_API_KEY`)*

### 3. 啟動開發伺服器
```bash
npm run dev
```
瀏覽器開啟：`http://localhost:3000`

### 4. 其他指令
- **類型檢查**：`npm run lint` (`tsc --noEmit`)
- **生產建置**：`npm run build` (`vite build`)
- **清理暫存**：`npm run clean`
- **生產啟動**：`npm start`
