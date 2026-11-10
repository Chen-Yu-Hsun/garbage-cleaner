/**
 * Hand-Drawn Colored Pencil (手繪色鉛筆風) Sprites & Scene Renderers
 * Pre-rendered offscreen colored-pencil hatching textures + organic sketchy linework
 * optimized for 60fps gameplay.
 */

import { TrashType, WaterQuality, Pedestrian } from '../types/game';

// Deterministic pseudo-random generator for stable hand-drawn pencil strokes
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Helper to draw a sketchy hand-drawn line with slight organic wobble
function drawSketchyLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lineWidth: number = 1.5,
  rand: () => number = Math.random
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const dist = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(2, Math.floor(dist / 18));

  // Two light overlapping passes for authentic colored-pencil feel
  for (let pass = 0; pass < 2; pass++) {
    ctx.globalAlpha = pass === 0 ? 0.85 : 0.45;
    ctx.beginPath();
    ctx.moveTo(x1 + (rand() - 0.5) * 1.2, y1 + (rand() - 0.5) * 1.2);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const jitter = i === steps ? 0.6 : 1.5;
      const px = x1 + (x2 - x1) * t + (rand() - 0.5) * jitter;
      const py = y1 + (y2 - y1) * t + (rand() - 0.5) * jitter;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// Fill a rectangular region with diagonal colored-pencil hatching strokes over warm paper
function fillColoredPencilRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  paperColor: string,
  pencilColors: string[],
  angleDeg: number = -34,
  spacing: number = 3.2,
  strokeAlpha: number = 0.65,
  seed: number = 101
) {
  const rand = seededRandom(seed);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Base paper tone
  ctx.fillStyle = paperColor;
  ctx.fillRect(x, y, w, h);

  // Diagonal colored-pencil strokes
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const diag = Math.hypot(w, h);
  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.lineCap = 'round';

  for (let d = -diag; d <= diag; d += spacing) {
    const color = pencilColors[Math.floor(rand() * pencilColors.length)];
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4 + rand() * 1.4;
    ctx.globalAlpha = strokeAlpha * (0.65 + rand() * 0.35);

    // Break long strokes into natural hand-shaded segments
    const segLen = 28 + rand() * 35;
    for (let s = -diag; s < diag; s += segLen * 0.82) {
      const s1 = s + (rand() - 0.5) * 6;
      const s2 = s + segLen + (rand() - 0.5) * 6;
      const offsetD = d + (rand() - 0.5) * 1.8;

      const x1 = cx + s1 * cos - offsetD * sin;
      const y1 = cy + s1 * sin + offsetD * cos;
      const x2 = cx + s2 * cos - offsetD * sin;
      const y2 = cy + s2 * sin + offsetD * cos;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // Subtle paper grain dots (tooth of sketchbook paper)
  const grainCount = Math.floor((w * h) / 90);
  for (let i = 0; i < grainCount; i++) {
    const gx = x + rand() * w;
    const gy = y + rand() * h;
    ctx.fillStyle = rand() > 0.45 ? 'rgba(255, 252, 244, 0.32)' : 'rgba(90, 70, 50, 0.08)';
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  ctx.restore();
}

// Helper to draw a pixel block
export function pixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

const MOSS_PALETTE: Record<string, string> = {
  ".": "transparent",
  "O": "#1e2816",
  "D": "#2c3b20",
  "M": "#445931",
  "G": "#5a7341",
  "L": "#718c54",
  "H": "#87a368",
  "B": "#31261a",
  "W": "#f2efdf",
  "S": "#c4c2b0",
  "P": "#211915",
  "R": "#691b18",
  "T": "#a32c27"
};

const MOSS_SPRITE_DATA = [
  "................................",
  "................................",
  "............OOOOOOOO............",
  "..........OODGGGGGGDOO..........",
  "........OODGGHHHHHHGGDOO........",
  ".......ODGGHHHHHHHHHHGGDO.......",
  "......ODGHHHHLLLLLLHHHHGDO......",
  "......ODGHHHLLLLLLLLHHHGDO......",
  ".....ODGGHHBLGGGGGGLLBHGGDO.....",
  ".....ODGLLDLMDDDDDDMLDLGGDO.....",
  ".....ODGLDLMSWWMMSWWMLDLGDO.....",
  "....ODGGLDLWWPPWGWPPWWLDLGDO....",
  "....ODGGLDLDWWWMDMWWWDDDLGDO....",
  "....ODGGLDLMDDDDDDDDMLDDLGDO....",
  "....ODGGLDLMDDWPPWDDMLDDLGDO....",
  "...ODGGLLDLMDDPRTPDDMLDDLLGDO...",
  "...ODGGLLDLBDDDTTWDDMLDBLLGDO...",
  "...ODGGLGDLGMMMDDDDMMGLDLLGDO...",
  "....ODGLGDLGGLLGGGGLLGGLDLGDO...",
  "....ODGGGDLGGLLGGBLLLGGLLDLGDO..",
  "....ODGGLLGGLLGGDLLGGGLLGDLGDO..",
  "....ODGGLLGGLLBGDLLGGGLLGDLGDO..",
  ".....ODGLLGGLLGGLDLGGGLLGBLGDO..",
  ".....ODGLLGGLDLGLDLGGGLLGDLGDO..",
  ".....ODGLLGBLDLGLBLGGGLLGDLGDO..",
  ".....ODGLLGDLDLGLDLGGGDLMGDLGDO.",
  ".....ODGMMDGMGGMGDLGGGDLMGDLGDO.",
  ".....ODGMMDGMGGMGDLGGGBLMGBLGDO.",
  ".....ODGMMDGMGGMGBLGGGDLMMDLGDO.",
  ".....ODDDMDGMMGMMDGGGGDMMMDLGDO.",
  ".....ODDDMDGMMGMMDGGGGDMMMDLGDO.",
  ".....ODDDMDDMMDDMDGGGGDMMMDDGDO.",
  "......ODDDDDDDDDDDDDDDDDDDDDDO..",
  ".......OODDDDDDDDDDDDDDDDDDOO...",
  ".........OOOOOOOOOOOOOOOOOO.....",
  "................................",
  "................................",
  "................................"
];

/**
 * Render a 32x38 sprite matrix into a high-resolution (5x = 160x190)
 * hand-drawn colored-pencil canvas with organic pencil strokes & paper tooth.
 */
function renderColoredPencilSpriteCanvas(
  spriteData: string[],
  palette: Record<string, string>,
  seed: number
): HTMLCanvasElement {
  if (typeof document === 'undefined') return null as any;
  const scale = 5;
  const cols = 32;
  const rows = spriteData.length;
  const canvas = document.createElement('canvas');
  canvas.width = cols * scale;
  canvas.height = rows * scale;
  const cCtx = canvas.getContext('2d');
  if (!cCtx) return canvas;

  const rand = seededRandom(seed);

  // 1. Soft organic base fill for each pixel cell
  for (let y = 0; y < rows; y++) {
    const row = spriteData[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      const color = palette[char];
      if (!color || color === 'transparent') continue;

      const cx = x * scale + scale / 2;
      const cy = y * scale + scale / 2;

      cCtx.fillStyle = color;
      cCtx.globalAlpha = 0.88;
      cCtx.beginPath();
      cCtx.arc(
        cx + (rand() - 0.5) * 0.9,
        cy + (rand() - 0.5) * 0.9,
        scale * 0.68,
        0,
        Math.PI * 2
      );
      cCtx.fill();
    }
  }

  // 2. Diagonal colored-pencil hatching strokes over every cell
  cCtx.lineCap = 'round';
  for (let y = 0; y < rows; y++) {
    const row = spriteData[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      const color = palette[char];
      if (!color || color === 'transparent') continue;

      const cx = x * scale + scale / 2;
      const cy = y * scale + scale / 2;
      const isOutline = char === 'O' || char === 'D' || char === 'P' || char === 'E';

      cCtx.strokeStyle = color;
      cCtx.lineWidth = isOutline ? 1.8 : 1.35;
      cCtx.globalAlpha = isOutline ? 0.95 : 0.78;

      // 3 angled pencil strokes per cell
      for (let s = 0; s < 3; s++) {
        const ox = (rand() - 0.5) * 2.6;
        const oy = (rand() - 0.5) * 2.6;
        cCtx.beginPath();
        cCtx.moveTo(cx + ox - 2.6, cy + oy + 2.6);
        cCtx.lineTo(cx + ox + 2.6, cy + oy - 2.6);
        cCtx.stroke();
      }

      // Paper tooth highlight speck for organic hand-shaded texture
      if (!isOutline && rand() > 0.52) {
        cCtx.fillStyle = 'rgba(255, 252, 242, 0.32)';
        cCtx.fillRect(cx + (rand() - 0.5) * 2, cy + (rand() - 0.5) * 2, 1.4, 1.4);
      }
    }
  }

  cCtx.globalAlpha = 1;
  return canvas;
}

let mossMonsterCanvasCache: HTMLCanvasElement | null = null;

function getMossMonsterCanvas(): HTMLCanvasElement {
  if (mossMonsterCanvasCache) return mossMonsterCanvasCache;
  mossMonsterCanvasCache = renderColoredPencilSpriteCanvas(MOSS_SPRITE_DATA, MOSS_PALETTE, 307);
  return mossMonsterCanvasCache;
}

/**
 * Draw 醜泥怪 (Mud Monster - Hand-Drawn Colored Pencil Style)
 */
export function drawMudMonster(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  bottomY: number,
  baseWidth: number,
  baseHeight: number,
  isMoving: boolean,
  walkCycle: number,
  isCatching: boolean,
  isFlashing: boolean = false,
  flipX: boolean = false
) {
  ctx.save();
  ctx.translate(Math.floor(centerX), Math.floor(bottomY));

  // Mirror horizontally based on movement direction
  if (flipX) {
    ctx.scale(-1, 1);
  }

  // If flashing during transformation
  if (isFlashing) {
    ctx.filter = 'brightness(1.6) contrast(1.25)';
  }

  const bob = isMoving ? Math.sin(walkCycle * 8) * 3 : Math.sin(walkCycle * 3) * 1.5;
  const squash = isMoving ? 1 + Math.sin(walkCycle * 8) * 0.05 : 1;

  // Hand-shaded pencil shadow under monster
  ctx.fillStyle = 'rgba(42, 52, 30, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 0, baseWidth * 0.44, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const spriteCanvas = getMossMonsterCanvas();
  if (spriteCanvas) {
    const drawW = baseWidth * squash;
    const drawH = baseHeight / squash;
    const drawX = -drawW / 2;
    const drawY = -drawH + bob;

    // Nearest-neighbor / smooth colored-pencil rendering
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(spriteCanvas, drawX, drawY, drawW, drawH);

    // Exaggerated Giant Gaping Mouth Catching / Eating Animation (張大嘴吃垃圾誇張化放大)
    if (isCatching) {
      // 1. Cute rosy cheek blush
      ctx.fillStyle = 'rgba(239, 68, 68, 0.72)';
      ctx.beginPath();
      ctx.ellipse(-drawW * 0.32, drawY + drawH * 0.38, drawW * 0.08, drawH * 0.05, 0, 0, Math.PI * 2);
      ctx.ellipse(drawW * 0.32, drawY + drawH * 0.38, drawW * 0.08, drawH * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Excited squinted anime cartoon eyes (> <)
      ctx.save();
      ctx.strokeStyle = '#1e2816';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Left eye >
      ctx.beginPath();
      ctx.moveTo(-drawW * 0.24, drawY + drawH * 0.27);
      ctx.lineTo(-drawW * 0.13, drawY + drawH * 0.31);
      ctx.lineTo(-drawW * 0.24, drawY + drawH * 0.35);
      ctx.stroke();

      // Right eye <
      ctx.beginPath();
      ctx.moveTo(drawW * 0.24, drawY + drawH * 0.27);
      ctx.lineTo(drawW * 0.13, drawY + drawH * 0.31);
      ctx.lineTo(drawW * 0.24, drawY + drawH * 0.35);
      ctx.stroke();
      ctx.restore();

      // 3. GIANT GAPING CAVERN MOUTH (誇張放大巨嘴)
      const mouthX = 0;
      const mouthY = drawY + drawH * 0.52;
      const mouthRx = drawW * 0.28; // 56% of monster width!
      const mouthRy = drawH * 0.20; // 40% of monster height!

      ctx.save();
      ctx.fillStyle = '#3f0707';
      ctx.strokeStyle = '#1e110a';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, mouthRx, mouthRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Clip inside mouth for tongue and fangs
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, mouthRx, mouthRy, 0, 0, Math.PI * 2);
      ctx.clip();

      // Big bouncy pink tongue
      ctx.fillStyle = '#fb7185';
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY + mouthRy * 0.45, mouthRx * 0.72, mouthRy * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sharp upper cartoon fangs (上排尖牙)
      ctx.fillStyle = '#fffdf5';
      ctx.strokeStyle = '#2c1810';
      ctx.lineWidth = 1.0;
      const fangsTopY = mouthY - mouthRy;
      const fangW = mouthRx * 0.32;
      const fangH = mouthRy * 0.65;

      // Fang 1 (left)
      ctx.beginPath();
      ctx.moveTo(-mouthRx * 0.65, fangsTopY);
      ctx.lineTo(-mouthRx * 0.65 + fangW * 0.5, fangsTopY + fangH);
      ctx.lineTo(-mouthRx * 0.65 + fangW, fangsTopY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fang 2 (center-left)
      ctx.beginPath();
      ctx.moveTo(-mouthRx * 0.25, fangsTopY);
      ctx.lineTo(-mouthRx * 0.25 + fangW * 0.5, fangsTopY + fangH * 1.15);
      ctx.lineTo(-mouthRx * 0.25 + fangW, fangsTopY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fang 3 (center-right)
      ctx.beginPath();
      ctx.moveTo(mouthRx * 0.25 - fangW, fangsTopY);
      ctx.lineTo(mouthRx * 0.25 - fangW * 0.5, fangsTopY + fangH * 1.15);
      ctx.lineTo(mouthRx * 0.25, fangsTopY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fang 4 (right)
      ctx.beginPath();
      ctx.moveTo(mouthRx * 0.65 - fangW, fangsTopY);
      ctx.lineTo(mouthRx * 0.65 - fangW * 0.5, fangsTopY + fangH);
      ctx.lineTo(mouthRx * 0.65, fangsTopY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lower cute fangs (下排獠牙)
      const fangsBotY = mouthY + mouthRy;
      ctx.beginPath();
      ctx.moveTo(-mouthRx * 0.35, fangsBotY);
      ctx.lineTo(-mouthRx * 0.2, fangsBotY - fangH * 0.6);
      ctx.lineTo(-mouthRx * 0.05, fangsBotY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(mouthRx * 0.05, fangsBotY);
      ctx.lineTo(mouthRx * 0.2, fangsBotY - fangH * 0.6);
      ctx.lineTo(mouthRx * 0.35, fangsBotY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore(); // restore clip
      ctx.restore(); // restore mouth

      // 4. Action Chomp Sparkles & Impact Lines (吃入垃圾衝擊線)
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-drawW * 0.48, mouthY - 4);
      ctx.lineTo(-drawW * 0.58, mouthY - 8);
      ctx.moveTo(-drawW * 0.46, mouthY + 5);
      ctx.lineTo(-drawW * 0.56, mouthY + 8);
      ctx.moveTo(drawW * 0.48, mouthY - 4);
      ctx.lineTo(drawW * 0.58, mouthY - 8);
      ctx.moveTo(drawW * 0.46, mouthY + 5);
      ctx.lineTo(drawW * 0.56, mouthY + 8);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-drawW * 0.38, drawY - 4, 3.5, 3.5);
      ctx.fillRect(drawW * 0.38, drawY - 4, 3.5, 3.5);
      ctx.fillRect(0, drawY - 8, 4.5, 4.5);
      ctx.restore();
    }
    ctx.imageSmoothingEnabled = prevSmooth;
  }

  ctx.restore();
}

const WATER_SPIRIT_PALETTE: Record<string, string> = {
  ".": "transparent",
  "O": "#16697a",
  "D": "#278ea5",
  "M": "#45b0c7",
  "C": "#64c5da",
  "L": "#8adaea",
  "H": "#bcebf5",
  "W": "#ffffff",
  "E": "#382215",
  "P": "#f59896",
  "F": "#f7b7b5",
  "R": "#d44627",
  "T": "#eb6536",
  "Y": "#d6be78",
  "B": "#b39754",
  "I": "#1b7a94"
};

const WATER_SPIRIT_SPRITE_DATA = [
  "................................",
  ".......D........................",
  ".......DD.......................",
  "......DDDD......................",
  "......DCCCD.....................",
  "......DCLLCCD...................",
  ".....DCCLLLLCCCD................",
  ".....DCLLHHHHHHHHCCD............",
  ".....DCLLHHHHHHHHMCCD...........",
  "......DCLLMLLLLMCMMCCD..........",
  "......DCCLLLLLLMMMMCCD..........",
  ".......DCCCMMMMMMMMMCCCD........",
  "........DDDDDDDDDDDDDDCD........",
  "........DOOOOOOOOOOOOMLCD.......",
  ".......DCLLWWLLCCCCCLMMCD.......",
  ".......DCLWEEWLCCWWCCLMCD.......",
  ".......DCLWEEWLCWEEWCLMCD.......",
  ".......DCLLWWLLCWEEWCLMCD.......",
  ".......DCFPPFCCWRRWCCLMCD.......",
  ".......DCCFFCCCRTTTFPPMCD.......",
  "........DCLLLLLLTTWFFMCD........",
  ".....DDCCCLLLLLLLLLLMMCD........",
  ".....DCLLLLLLLLLLLLLMYCCCD......",
  "......DCCLHHLLLLLLLMYCCCCD......",
  ".......DCCHHLLLLLMYYCMMMCD......",
  ".........DYLLLLMMYYCCMMCD.......",
  ".........YYYYYYYCCCCMMD.........",
  "........DYYYYYYBCCCCMMD.........",
  "........DYYYIYYBCCCCMMD.........",
  "........DYYIIIYBCCCCMMD.........",
  "........DYYYYYYBCCCMMD..........",
  "........DYYIIIYBCCCMMMD.........",
  "........BBBBBBBBCCCCMMMD........",
  "............DLLCCCCCMMMMD.......",
  "..............DMMCCCCMMMD.......",
  "................DDDDDDDD........",
  "................................",
  "................................"
];

let waterSpiritCanvasCache: HTMLCanvasElement | null = null;

function getWaterSpiritCanvas(): HTMLCanvasElement {
  if (waterSpiritCanvasCache) return waterSpiritCanvasCache;
  waterSpiritCanvasCache = renderColoredPencilSpriteCanvas(
    WATER_SPIRIT_SPRITE_DATA,
    WATER_SPIRIT_PALETTE,
    509
  );
  return waterSpiritCanvasCache;
}

/**
 * Draw 米多力 (Midori - Divine Clean River Spirit in Colored-Pencil Style)
 */
export function drawMidori(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  bottomY: number,
  baseWidth: number,
  baseHeight: number,
  isMoving: boolean,
  walkCycle: number,
  isCatching: boolean,
  flipX: boolean = false
) {
  ctx.save();
  ctx.translate(Math.floor(centerX), Math.floor(bottomY));

  // Mirror horizontally based on movement direction
  if (flipX) {
    ctx.scale(-1, 1);
  }

  const bob = isMoving ? Math.sin(walkCycle * 10) * 4 : Math.sin(walkCycle * 4) * 2;
  const squash = isMoving ? 1 + Math.sin(walkCycle * 10) * 0.05 : 1;

  // Hand-drawn colored-pencil aqua halo rings
  ctx.strokeStyle = 'rgba(70, 176, 199, 0.45)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.arc(0, -baseHeight * 0.52 + bob, baseWidth * 0.62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Soft water aura
  const auraGradient = ctx.createRadialGradient(
    0,
    -baseHeight * 0.5 + bob,
    baseWidth * 0.15,
    0,
    -baseHeight * 0.5 + bob,
    baseWidth * 0.72
  );
  auraGradient.addColorStop(0, 'rgba(138, 218, 234, 0.5)');
  auraGradient.addColorStop(0.6, 'rgba(69, 176, 199, 0.22)');
  auraGradient.addColorStop(1, 'rgba(188, 235, 245, 0)');
  ctx.fillStyle = auraGradient;
  ctx.beginPath();
  ctx.arc(0, -baseHeight * 0.5 + bob, baseWidth * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Shadow under Midori
  ctx.fillStyle = 'rgba(22, 105, 122, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 0, baseWidth * 0.42, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const spriteCanvas = getWaterSpiritCanvas();
  if (spriteCanvas) {
    const drawW = baseWidth * squash;
    const drawH = baseHeight / squash;
    const drawX = -drawW / 2;
    const drawY = -drawH + bob;

    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(spriteCanvas, drawX, drawY, drawW, drawH);

    // Exaggerated Joyful Divine Water Absorption Mouth (米多力歡樂大嘴吸入淨化)
    if (isCatching) {
      // 1. Cheek blush
      ctx.fillStyle = 'rgba(244, 114, 182, 0.75)';
      ctx.beginPath();
      ctx.ellipse(-drawW * 0.30, drawY + drawH * 0.44, drawW * 0.07, drawH * 0.04, 0, 0, Math.PI * 2);
      ctx.ellipse(drawW * 0.30, drawY + drawH * 0.44, drawW * 0.07, drawH * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Joyful arched eyes (^ ^)
      ctx.save();
      ctx.strokeStyle = '#16697a';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-drawW * 0.18, drawY + drawH * 0.38, drawW * 0.09, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(drawW * 0.18, drawY + drawH * 0.38, drawW * 0.09, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.restore();

      // 3. GIANT JOYFUL MOUTH (歡樂大口吞噬淨化)
      const mouthX = 0;
      const mouthY = drawY + drawH * 0.54;
      const mouthRx = drawW * 0.25; // 50% width of spirit!
      const mouthRy = drawH * 0.16;

      ctx.save();
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#164e63';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, mouthRx, mouthRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Clip inside mouth
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, mouthRx, mouthRy, 0, 0, Math.PI * 2);
      ctx.clip();

      // Upper cute teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(mouthX - mouthRx * 0.35, mouthY - mouthRy, mouthRx * 0.7, mouthRy * 0.45);

      // Pink joyful tongue
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY + mouthRy * 0.4, mouthRx * 0.7, mouthRy * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore(); // restore clip
      ctx.restore(); // restore mouth

      // 4. Divine Water Suction Spirals & Sparkles
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, mouthRx * 1.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, mouthRx * 1.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#bcebf5';
      ctx.fillRect(-drawW * 0.45, mouthY - 10, 4, 4);
      ctx.fillRect(drawW * 0.45, mouthY - 10, 4, 4);
      ctx.fillRect(0, drawY - 10, 5, 5);
      ctx.restore();
    }
    ctx.imageSmoothingEnabled = prevSmooth;
  }

  // Sketchy colored-pencil water sparkles
  ctx.strokeStyle = '#278ea5';
  ctx.fillStyle = '#bcebf5';
  const p1 = Math.sin(walkCycle * 8) * 10;
  const p2 = Math.cos(walkCycle * 7) * 10;
  ctx.fillRect(-baseWidth * 0.46 + p1, -baseHeight * 0.62, 4, 4);
  ctx.fillRect(baseWidth * 0.44 - p2, -baseHeight * 0.42, 4, 4);
  ctx.fillRect(0, -baseHeight - 5 + p1, 4, 4);

  ctx.restore();
}

/**
 * Draw 6 types of Trash items (T01 - T06) in Hand-Drawn Colored-Pencil Style
 */
export function drawTrash(
  ctx: CanvasRenderingContext2D,
  type: TrashType,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  ctx.rotate(rotation);

  const halfW = width / 2;
  const halfH = height / 2;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  switch (type) {
    // T01: 菸蒂 (Cigarette butt - hand-drawn pencil style)
    case 'T01': {
      // Paper cylinder
      ctx.fillStyle = '#f5f0e6';
      ctx.strokeStyle = '#3d352e';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-halfW * 0.55, -halfH * 0.9, halfW * 1.1, halfH * 1.8, 3);
      ctx.fill();
      ctx.stroke();

      // Ochre filter tip
      ctx.fillStyle = '#d9822b';
      ctx.beginPath();
      ctx.roundRect(-halfW * 0.55, halfH * 0.15, halfW * 1.1, halfH * 0.75, 2);
      ctx.fill();
      ctx.stroke();

      // Ash tip & ember
      ctx.fillStyle = '#57534e';
      ctx.fillRect(-halfW * 0.5, -halfH * 0.9, halfW, halfH * 0.3);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -halfH * 0.9, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // T02: 寶特瓶 (PET bottle - matches translucent blue bottle in mockup)
    case 'T02': {
      // Translucent sky-blue bottle body with rounded shoulders
      ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-halfW * 0.62, -halfH * 0.45, halfW * 1.24, halfH * 1.38, 5);
      ctx.fill();
      ctx.stroke();

      // Diagonal pencil shading lines inside bottle
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.45, -halfH * 0.2);
      ctx.lineTo(halfW * 0.45, -halfH * 0.4);
      ctx.moveTo(-halfW * 0.45, halfH * 0.5);
      ctx.lineTo(halfW * 0.45, halfH * 0.3);
      ctx.stroke();

      // Bottle neck & deep blue cap
      ctx.fillStyle = '#bae6fd';
      ctx.strokeStyle = '#1e40af';
      ctx.fillRect(-halfW * 0.28, -halfH * 0.78, halfW * 0.56, halfH * 0.34);
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.roundRect(-halfW * 0.34, -halfH * 0.98, halfW * 0.68, halfH * 0.24, 2);
      ctx.fill();
      ctx.stroke();

      // White label band
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(-halfW * 0.58, -halfH * 0.05, halfW * 1.16, halfH * 0.42);
      break;
    }

    // T03: 玻璃瓶 (Glass bottle - hand-shaded emerald green glass)
    case 'T03': {
      ctx.fillStyle = '#15803d';
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-halfW * 0.58, -halfH * 0.3, halfW * 1.16, halfH * 1.25, 4);
      ctx.fill();
      ctx.stroke();

      // Slender neck
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.roundRect(-halfW * 0.24, -halfH * 0.88, halfW * 0.48, halfH * 0.62, 2);
      ctx.fill();
      ctx.stroke();

      // Gold cap & cream label
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-halfW * 0.3, -halfH, halfW * 0.6, halfH * 0.18);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(-halfW * 0.5, 0, halfW, halfH * 0.45);
      break;
    }

    // T04: 鋁箔飲料盒 (Juice carton - warm orange-red colored pencil)
    case 'T04': {
      ctx.fillStyle = '#ea580c';
      ctx.strokeStyle = '#431407';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-halfW * 0.72, -halfH * 0.75, halfW * 1.44, halfH * 1.65, 3);
      ctx.fill();
      ctx.stroke();

      // Straw
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.15, -halfH * 0.75);
      ctx.lineTo(-halfW * 0.15, -halfH * 1.1);
      ctx.lineTo(halfW * 0.2, -halfH * 1.2);
      ctx.stroke();

      // Fruit sticker
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, halfW * 0.36, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // T05: 餅乾包裝 / 垃圾袋 (Tied sack / snack bag - matches mockup brown/ochre tied bag!)
    case 'T05': {
      ctx.fillStyle = '#c27832';
      ctx.strokeStyle = '#452208';
      ctx.lineWidth = 1.6;

      // Plump tied sack body
      ctx.beginPath();
      ctx.ellipse(0, halfH * 0.18, halfW * 0.82, halfH * 0.68, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tied knot & ruffled top ears
      ctx.fillStyle = '#a35e1d';
      ctx.beginPath();
      ctx.moveTo(0, -halfH * 0.42);
      ctx.lineTo(-halfW * 0.45, -halfH * 0.88);
      ctx.lineTo(0, -halfH * 0.72);
      ctx.lineTo(halfW * 0.45, -halfH * 0.88);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tie band
      ctx.fillStyle = '#5c2d0c';
      ctx.fillRect(-halfW * 0.32, -halfH * 0.5, halfW * 0.64, 3.5);
      break;
    }

    // T06: 排泄物 (Coiled poop with sketchy pencil lines)
    case 'T06': {
      ctx.strokeStyle = '#3b1d06';
      ctx.lineWidth = 1.5;

      ctx.fillStyle = '#783f12';
      ctx.beginPath();
      ctx.ellipse(0, halfH * 0.48, halfW * 0.85, halfH * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#8f4f17';
      ctx.beginPath();
      ctx.ellipse(0, 0, halfW * 0.65, halfH * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#a66020';
      ctx.beginPath();
      ctx.ellipse(0, -halfH * 0.42, halfW * 0.42, halfH * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Draw Raindrop Item (雨滴道具 - Colored Pencil Water Droplet)
 */
export function drawRaindrop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  cycle: number
) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  // Soft blue pencil glow
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, width * 0.85);
  glow.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
  glow.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, width * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Hand-drawn droplet with dark blue pencil outline
  ctx.fillStyle = '#38bdf8';
  ctx.strokeStyle = '#0369a1';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -height * 0.65);
  ctx.bezierCurveTo(width * 0.65, 0, width * 0.65, height * 0.55, 0, height * 0.65);
  ctx.bezierCurveTo(-width * 0.65, height * 0.55, -width * 0.65, 0, 0, -height * 0.65);
  ctx.fill();
  ctx.stroke();

  // Diagonal pencil highlight inside droplet
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.arc(-width * 0.16, -height * 0.12, width * 0.14, 0, Math.PI * 2);
  ctx.fill();

  const twinkle = Math.sin(cycle * 12) > 0;
  if (twinkle) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(width * 0.22, height * 0.18, 2.5, 2.5);
  }

  ctx.restore();
}

/**
 * Draw Pedestrians on the Bridge (with sketchy pencil outlines)
 */
/**
 * Draw Pedestrians on the Bridge (Enlarged with rich colored-pencil details)
 */
export function drawPedestrian(ctx: CanvasRenderingContext2D, p: Pedestrian) {
  ctx.save();
  ctx.translate(Math.floor(p.x), Math.floor(p.y));
  // Enlarged 2.3x for prominent, lively bridge street life (matches user request)
  ctx.scale(p.direction * 2.3, 2.3);

  const bob = Math.sin(p.walkFrame * 8) * 1.8;
  const legSwing = Math.sin(p.walkFrame * 8) * 3.5;
  ctx.strokeStyle = '#26201b';
  ctx.lineWidth = 0.9;

  switch (p.type) {
    case 'cart': {
      // Little snack / souvenir wagon cart on wheels with festive floating balloon
      const cartBob = Math.sin(p.walkFrame * 6) * 1.2;
      // Wooden cart chest
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-14, -14 + cartBob, 28, 11);
      ctx.strokeRect(-14, -14 + cartBob, 28, 11);
      // Striped awning / package top
      ctx.fillStyle = p.color;
      ctx.fillRect(-12, -22 + cartBob, 24, 8);
      ctx.strokeRect(-12, -22 + cartBob, 24, 8);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-7, -20 + cartBob, 5, 5);
      ctx.fillRect(2, -20 + cartBob, 5, 5);
      // Spoked wheels
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(-8, -3, 4, 0, Math.PI * 2);
      ctx.arc(8, -3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cart handle
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-14, -12 + cartBob);
      ctx.lineTo(-20, -18 + cartBob);
      ctx.stroke();
      // Floating festive balloon tied to cart
      if (p.balloonColor) {
        ctx.strokeStyle = '#57534e';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(8, -22 + cartBob);
        ctx.quadraticCurveTo(12, -38 + cartBob, 10, -48 + cartBob * 0.5);
        ctx.stroke();
        // Balloon
        ctx.fillStyle = p.balloonColor;
        ctx.strokeStyle = '#26201b';
        ctx.beginPath();
        ctx.arc(10, -56 + cartBob * 0.5, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Highlight reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(8, -58 + cartBob * 0.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'dog': {
      // Golden retriever / shiba inu dog
      ctx.fillStyle = '#c27125';
      ctx.fillRect(-10, -10 + bob, 20, 10);
      ctx.strokeRect(-10, -10 + bob, 20, 10);
      ctx.fillRect(8, -16 + bob, 8, 8);
      ctx.strokeRect(8, -16 + bob, 8, 8);
      ctx.fillRect(16, -13 + bob, 4, 4);
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(19, -13 + bob, 2, 2); // nose
      ctx.fillStyle = '#78350f';
      ctx.fillRect(9, -16 + bob, 3, 5); // ear
      // Collar
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(7, -11 + bob, 2, 6);
      // Wagging tail
      const tailWag = Math.sin(p.walkFrame * 14) * 3;
      ctx.fillStyle = '#c27125';
      ctx.fillRect(-13, -14 + bob + tailWag, 3, 6);
      ctx.fillRect(-8 + legSwing, 0, 3, 5);
      ctx.fillRect(4 - legSwing, 0, 3, 5);
      break;
    }

    case 'child': {
      // Child holding high-flying red balloon
      ctx.fillStyle = '#f5d0a9';
      ctx.fillRect(-4, -22 + bob, 8, 8); // head
      ctx.strokeRect(-4, -22 + bob, 8, 8);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-5, -24 + bob, 10, 3); // hat
      ctx.fillStyle = p.color;
      ctx.fillRect(-4, -14 + bob, 8, 10); // coat
      ctx.strokeRect(-4, -14 + bob, 8, 10);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3 + legSwing, -4, 3, 6);
      ctx.fillRect(1 - legSwing, -4, 3, 6);
      // High-flying colored-pencil balloon
      if (p.balloonColor) {
        ctx.strokeStyle = '#57534e';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(2, -10 + bob);
        ctx.quadraticCurveTo(-2, -32 + bob, -6, -46 + bob * 0.5);
        ctx.stroke();
        // Balloon
        ctx.fillStyle = p.balloonColor;
        ctx.strokeStyle = '#26201b';
        ctx.beginPath();
        ctx.arc(-7, -54 + bob * 0.5, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Highlight reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(-9, -56 + bob * 0.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'elder': {
      // Elder with walking cane
      ctx.fillStyle = '#d6d3d1';
      ctx.fillRect(-5, -28 + bob, 8, 8);
      ctx.strokeRect(-5, -28 + bob, 8, 8);
      ctx.fillStyle = '#57534e';
      ctx.fillRect(-5, -20 + bob, 10, 14);
      ctx.strokeRect(-5, -20 + bob, 10, 14);
      // Walking cane
      ctx.fillStyle = '#92400e';
      ctx.fillRect(8, -16 + bob, 2, 20);
      ctx.fillRect(6, -18 + bob, 4, 2);
      ctx.fillStyle = '#292524';
      ctx.fillRect(-4 + legSwing * 0.6, -6, 3, 8);
      ctx.fillRect(1 - legSwing * 0.6, -6, 3, 8);
      break;
    }

    case 'teen': {
      // Teenager with hoodie & headphones
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-5, -28 + bob, 9, 8); // hair
      ctx.strokeRect(-5, -28 + bob, 9, 8);
      ctx.fillStyle = '#0284c7'; // headphones
      ctx.fillRect(-6, -26 + bob, 2, 5);
      ctx.fillRect(3, -26 + bob, 2, 5);
      ctx.fillRect(-6, -29 + bob, 11, 2);
      ctx.fillStyle = p.color; // jacket
      ctx.fillRect(-6, -20 + bob, 12, 14);
      ctx.strokeRect(-6, -20 + bob, 12, 14);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-4 + legSwing, -6, 4, 8);
      ctx.fillRect(1 - legSwing, -4, 4, 8);
      break;
    }

    case 'adult':
    default: {
      // Adult holding takeaway cup
      ctx.fillStyle = '#44403c';
      ctx.fillRect(-5, -30 + bob, 9, 8); // hair
      ctx.strokeRect(-5, -30 + bob, 9, 8);
      ctx.fillStyle = p.color; // coat
      ctx.fillRect(-6, -22 + bob, 12, 15);
      ctx.strokeRect(-6, -22 + bob, 12, 15);
      ctx.fillStyle = '#334155'; // pants
      ctx.fillRect(-4 + legSwing, -7, 4, 9);
      ctx.fillRect(1 - legSwing, -7, 4, 9);
      // Holding drink cup
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(7, -18 + bob, 4, 6);
      ctx.strokeRect(7, -18 + bob, 4, 6);
      break;
    }
  }

  ctx.restore();
}

/**
 * 3. Monumental Vertical 3D Arch Supports (直立3D拱形支撐)
 * Replaces the square retaining wall with 4 massive vertical 3D stone piers
 * and 3 monumental semicircular arches with cavernous 3D tunnel alcoves,
 * radiating voussoirs, protruding keystones, impost moldings, cutwaters, and spandrels.
 */
function drawVertical3DArchSupports(
  ctx: CanvasRenderingContext2D,
  wallLeft: number,
  wallTop: number,
  wallW: number,
  wallHeight: number,
  riverTop: number,
  waterQuality: WaterQuality
) {
  // Architectural Dimensions:
  // Piers: P0 (75..125), P1 (328..378), P2 (582..632), P3 (835..885)
  // Arches:
  // Arch 0 (left): x: 125..328, span 203, cx: 226.5, r: 101.5
  // Arch 1 (center): x: 378..582, span 204, cx: 480.0, r: 102.0 (framing player at 480!)
  // Arch 2 (right): x: 632..835, span 203, cx: 733.5, r: 101.5
  // Spring line: ySpring = 248. Arch Apex = 248 - 102 = 146.
  // Bridge Soffit = 135.
  const ySpring = 248;
  const piers = [
    { x: 75, w: 50 },
    { x: 328, w: 50 },
    { x: 582, w: 50 },
    { x: 835, w: 50 },
  ];
  const arches = [
    { x1: 125, x2: 328, cx: 226.5, r: 101.5, viewAngle: -1 }, // viewed looking slightly right
    { x1: 378, x2: 582, cx: 480.0, r: 102.0, viewAngle: 0 },  // centered
    { x1: 632, x2: 835, cx: 733.5, r: 101.5, viewAngle: 1 },  // viewed looking slightly left
  ];

  // Palette definitions based on water quality
  const isBlack = waterQuality === 'BLACK';
  const isGrey = waterQuality === 'GREY';

  const tunnelDeep = isBlack ? '#0a0807' : isGrey ? '#1c1a18' : '#140d07';
  const tunnelOuter = isBlack ? '#161311' : isGrey ? '#2c2926' : '#281a10';
  const tunnelRib = isBlack ? 'rgba(0, 0, 0, 0.65)' : isGrey ? 'rgba(30, 26, 22, 0.55)' : 'rgba(25, 12, 5, 0.6)';

  const stoneTints = isBlack
    ? ['#362f28', '#2b2520', '#3e362e', '#241e1a', '#332b24']
    : isGrey
    ? ['#e8e6e3', '#dedbd6', '#f3f1ed', '#cfcac4', '#e2dfda']
    : ['#fbf2e3', '#f5e5cf', '#eed8bc', '#fef8ee', '#e8cfb0'];

  const stoneOutline = isBlack ? '#14110e' : '#331c0a';
  const pierPaper = isBlack ? '#29231d' : isGrey ? '#e8e5e0' : '#faeedd';
  const pierPencils = isBlack
    ? ['#302a24', '#241f1a', '#3b332b', '#1c1713']
    : isGrey
    ? ['#cfcbca', '#beb8b4', '#dedad7', '#a8a29d']
    : ['#dfc5a4', '#d2b48e', '#eedbc3', '#c49f75', '#e9d0b3'];

  // --- 1. SPANDRELS & BASE MASONRY WALL (y: 135..248) ---
  // Fill upper area between bridge deck and arch curve
  fillColoredPencilRect(ctx, wallLeft, wallTop, wallW, ySpring - wallTop + 10, pierPaper, pierPencils, -34, 2.6, 0.72, 310);

  // Horizontal Ashlar Stone courses in spandrels
  ctx.save();
  ctx.strokeStyle = stoneOutline;
  ctx.lineWidth = 1.3;
  ctx.globalAlpha = 0.55;
  for (let sy = wallTop + 18; sy < ySpring; sy += 22) {
    ctx.beginPath();
    ctx.moveTo(wallLeft, sy);
    ctx.lineTo(wallLeft + wallW, sy);
    ctx.stroke();
  }
  ctx.restore();

  // --- 2. DEEP CAVERNOUS ARCH TUNNELS (Alcove Depth) ---
  for (const arch of arches) {
    ctx.save();
    // Tunnel opening path
    ctx.beginPath();
    ctx.moveTo(arch.x1, riverTop);
    ctx.lineTo(arch.x1, ySpring);
    ctx.arc(arch.cx, ySpring, arch.r, Math.PI, 0, false);
    ctx.lineTo(arch.x2, riverTop);
    ctx.closePath();

    // Radial shadow gradient receding deep into cavern
    const grad = ctx.createRadialGradient(arch.cx, ySpring + 30, 15, arch.cx, ySpring + 30, arch.r + 30);
    grad.addColorStop(0, tunnelDeep);
    grad.addColorStop(0.7, tunnelOuter);
    grad.addColorStop(1, tunnelDeep);
    ctx.fillStyle = grad;
    ctx.fill();

    // Perspective Barrel Vault Ceiling Ribs
    ctx.strokeStyle = tunnelRib;
    ctx.lineWidth = 2.0;
    for (let rib = 1; rib <= 4; rib++) {
      const ribR = arch.r * (1 - rib * 0.17);
      const ribY = ySpring - rib * 8;
      ctx.beginPath();
      ctx.arc(arch.cx, ribY, ribR, Math.PI, 0, false);
      ctx.stroke();
    }

    // Tunnel canal waterline shadow
    const tunnelWaterGrad = ctx.createLinearGradient(0, riverTop - 25, 0, riverTop);
    tunnelWaterGrad.addColorStop(0, 'rgba(0,0,0,0)');
    tunnelWaterGrad.addColorStop(1, isBlack ? 'rgba(0,0,0,0.95)' : 'rgba(10,5,2,0.75)');
    ctx.fillStyle = tunnelWaterGrad;
    ctx.fillRect(arch.x1, riverTop - 25, arch.x2 - arch.x1, 25);

    // 3D Perspective Intrados Jamb Shadow / Highlight based on viewing angle
    const jambW = 14;
    if (arch.viewAngle < 0) {
      // Left arch: Right jamb is viewed in profile (catches deep shadow)
      ctx.fillStyle = 'rgba(10, 5, 2, 0.58)';
      ctx.fillRect(arch.x2 - jambW, ySpring, jambW, riverTop - ySpring);
      // Left jamb catches subtle bounce light
      ctx.fillStyle = 'rgba(255, 250, 230, 0.15)';
      ctx.fillRect(arch.x1, ySpring, jambW * 0.7, riverTop - ySpring);
    } else if (arch.viewAngle > 0) {
      // Right arch: Left jamb is viewed in profile (catches shadow from center view)
      ctx.fillStyle = 'rgba(10, 5, 2, 0.58)';
      ctx.fillRect(arch.x1, ySpring, jambW, riverTop - ySpring);
      // Right jamb catches subtle light
      ctx.fillStyle = 'rgba(255, 250, 230, 0.15)';
      ctx.fillRect(arch.x2 - jambW * 0.7, ySpring, jambW * 0.7, riverTop - ySpring);
    } else {
      // Center arch: symmetrical depth jamb shadows
      ctx.fillStyle = 'rgba(10, 5, 2, 0.35)';
      ctx.fillRect(arch.x1, ySpring, jambW * 0.6, riverTop - ySpring);
      ctx.fillRect(arch.x2 - jambW * 0.6, ySpring, jambW * 0.6, riverTop - ySpring);
    }

    ctx.restore();
  }

  // --- 3. ARCH VOUSSOIRS & PROTRUDING KEYSTONES (拱形放射石塊與拱心石) ---
  for (const arch of arches) {
    const rIn = arch.r;
    const rOut = arch.r + 17;
    const numVoussoirs = 15;

    for (let v = 0; v < numVoussoirs; v++) {
      // Skip the center voussoir (index 7), which will be the grand 3D Keystone
      if (v === 7) continue;

      const th1 = Math.PI * (1 - v / numVoussoirs);
      const th2 = Math.PI * (1 - (v + 1) / numVoussoirs);

      ctx.save();
      ctx.beginPath();
      ctx.arc(arch.cx, ySpring, rOut, th1, th2, false);
      ctx.arc(arch.cx, ySpring, rIn, th2, th1, true);
      ctx.closePath();

      // Stone block fill
      const tint = stoneTints[(v * 3 + Math.round(arch.cx)) % stoneTints.length];
      ctx.fillStyle = tint;
      ctx.fill();

      // Mortar outline
      ctx.strokeStyle = stoneOutline;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 3D Sun highlight along outer curved edge
      ctx.strokeStyle = isBlack ? 'rgba(255,255,255,0.18)' : 'rgba(255, 255, 245, 0.85)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(arch.cx, ySpring, rOut - 1.2, th1, th2, false);
      ctx.stroke();

      // 3D Cast shadow along inner curved rim
      ctx.strokeStyle = isBlack ? 'rgba(0,0,0,0.7)' : 'rgba(25, 12, 5, 0.55)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(arch.cx, ySpring, rIn + 1.2, th1, th2, false);
      ctx.stroke();

      // Fine colored-pencil radial shading
      ctx.clip();
      ctx.strokeStyle = isBlack ? 'rgba(255,255,255,0.04)' : 'rgba(150, 105, 60, 0.16)';
      ctx.lineWidth = 1.0;
      const midTh = (th1 + th2) / 2;
      const dirX = Math.cos(midTh);
      const dirY = Math.sin(midTh);
      ctx.beginPath();
      ctx.moveTo(arch.cx + dirX * (rIn + 2), ySpring - dirY * (rIn + 2));
      ctx.lineTo(arch.cx + dirX * (rOut - 2), ySpring - dirY * (rOut - 2));
      ctx.stroke();

      ctx.restore();
    }

    // 3D Monumental Keystone (拱心石) at Apex
    ctx.save();
    const kwTop = 28;
    const kwBot = 20;
    const kh = (rOut - rIn) + 14; // Extends 8px above extrados and 6px below intrados
    const kxCenter = arch.cx;
    const kyApex = ySpring - rOut - 8;

    ctx.beginPath();
    ctx.moveTo(kxCenter - kwTop / 2, kyApex);
    ctx.lineTo(kxCenter + kwTop / 2, kyApex);
    ctx.lineTo(kxCenter + kwBot / 2, kyApex + kh);
    ctx.lineTo(kxCenter - kwBot / 2, kyApex + kh);
    ctx.closePath();

    // Keystone face
    ctx.fillStyle = isBlack ? '#423930' : isGrey ? '#f3f1ec' : '#fff8ed';
    ctx.fill();

    // 3D Keystone Drop Shadow on Right and Bottom
    ctx.fillStyle = isBlack ? 'rgba(0,0,0,0.75)' : 'rgba(25, 12, 5, 0.65)';
    ctx.beginPath();
    ctx.moveTo(kxCenter + kwTop / 2, kyApex);
    ctx.lineTo(kxCenter + kwTop / 2 + 3.5, kyApex + 2);
    ctx.lineTo(kxCenter + kwBot / 2 + 3.5, kyApex + kh + 2);
    ctx.lineTo(kxCenter - kwBot / 2, kyApex + kh);
    ctx.lineTo(kxCenter + kwBot / 2, kyApex + kh);
    ctx.closePath();
    ctx.fill();

    // 3D Keystone Sun Highlight on Top and Left
    ctx.strokeStyle = isBlack ? 'rgba(255,255,255,0.25)' : 'rgba(255, 255, 245, 0.95)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(kxCenter - kwBot / 2, kyApex + kh);
    ctx.lineTo(kxCenter - kwTop / 2, kyApex);
    ctx.lineTo(kxCenter + kwTop / 2, kyApex);
    ctx.stroke();

    // Keystone Outline
    ctx.strokeStyle = stoneOutline;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(kxCenter - kwTop / 2, kyApex);
    ctx.lineTo(kxCenter + kwTop / 2, kyApex);
    ctx.lineTo(kxCenter + kwBot / 2, kyApex + kh);
    ctx.lineTo(kxCenter - kwBot / 2, kyApex + kh);
    ctx.closePath();
    ctx.stroke();

    // Decorative carved central vertical line on keystone
    ctx.strokeStyle = stoneOutline;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(kxCenter, kyApex + 3);
    ctx.lineTo(kxCenter, kyApex + kh - 3);
    ctx.stroke();

    ctx.restore();
  }

  // --- 4. 4 MONUMENTAL VERTICAL 3D PIERS (直立3D石柱) ---
  for (let pIdx = 0; pIdx < piers.length; pIdx++) {
    const pier = piers[pIdx];
    const px = pier.x;
    const pw = pier.w;

    // A. Pier Impost Capital Molding (柱頭線腳 / 拱角裝飾線) at y: 242..252
    const capX = px - 4;
    const capW = pw + 8;
    const capY = ySpring - 6;
    const capH = 10;

    // Capital shadow underneath
    ctx.fillStyle = isBlack ? 'rgba(0,0,0,0.7)' : 'rgba(25, 12, 5, 0.58)';
    ctx.fillRect(capX, capY + capH, capW, 4);

    // Capital body
    ctx.fillStyle = isBlack ? '#382f27' : isGrey ? '#dedad5' : '#eedec8';
    ctx.fillRect(capX, capY, capW, capH);
    ctx.strokeStyle = stoneOutline;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(capX, capY, capW, capH);

    // Capital top ledge highlight
    ctx.fillStyle = isBlack ? 'rgba(255,255,255,0.2)' : 'rgba(255, 255, 245, 0.9)';
    ctx.fillRect(capX, capY, capW, 2.5);

    // B. Vertical Pier Column Shaft (柱身石塊堆疊) from y: 252 down to 416
    const shaftTop = capY + capH;
    const shaftBot = riverTop - 14; // 416
    const shaftH = shaftBot - shaftTop; // ~164px
    const courseH = shaftH / 8; // 8 courses of ~20.5px each

    for (let c = 0; c < 8; c++) {
      const cy = shaftTop + c * courseH;

      // Pier block fill with running bond alternation
      const isTwoBlocks = c % 2 === 1;
      const numB = isTwoBlocks ? 2 : 1;
      const bw = pw / numB;

      for (let b = 0; b < numB; b++) {
        const bx = px + b * bw;
        const tint = stoneTints[(c * 7 + b * 13 + pIdx * 5) % stoneTints.length];

        ctx.fillStyle = tint;
        ctx.fillRect(bx, cy, bw, courseH);

        // Mortar lines
        ctx.strokeStyle = stoneOutline;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(bx, cy, bw, courseH);

        // Course top highlight
        ctx.fillStyle = isBlack ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 245, 0.65)';
        ctx.fillRect(bx, cy, bw, 2);

        // Course bottom shadow
        ctx.fillStyle = isBlack ? 'rgba(0,0,0,0.6)' : 'rgba(30, 15, 6, 0.45)';
        ctx.fillRect(bx, cy + courseH - 2.5, bw, 2.5);

        // Delicate vertical colored-pencil shading
        ctx.save();
        ctx.beginPath();
        ctx.rect(bx + 1, cy + 1, bw - 2, courseH - 2);
        ctx.clip();
        ctx.strokeStyle = isBlack ? 'rgba(255,255,255,0.03)' : 'rgba(150, 110, 70, 0.12)';
        ctx.lineWidth = 1.0;
        for (let s = -bw; s < bw + courseH; s += 7) {
          ctx.beginPath();
          ctx.moveTo(bx + s, cy);
          ctx.lineTo(bx + s + courseH, cy + courseH);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // C. Pier Vertical 3D Edge Lighting (Full Pier Height Highlight & Shadow)
    // Left edge sunlight highlight
    ctx.fillStyle = isBlack ? 'rgba(255,255,255,0.18)' : 'rgba(255, 250, 230, 0.85)';
    ctx.fillRect(px, shaftTop, 2.8, shaftH);

    // Right edge cast shadow
    ctx.fillStyle = isBlack ? 'rgba(0,0,0,0.72)' : 'rgba(25, 12, 5, 0.62)';
    ctx.fillRect(px + pw - 3.2, shaftTop, 3.2, shaftH);

    // D. 3D Cutwater Footing (分水墩 / 分水角) at y: 416..432 dipping into water
    const cutTop = shaftBot;
    const cutBot = riverTop + 2;
    const cutMidX = px + pw / 2;

    // Left face of cutwater (sunlit)
    ctx.beginPath();
    ctx.moveTo(px, cutTop);
    ctx.lineTo(cutMidX, cutBot);
    ctx.lineTo(cutMidX, cutTop);
    ctx.closePath();
    ctx.fillStyle = isBlack ? '#383028' : isGrey ? '#dedad5' : '#f7ebd8';
    ctx.fill();
    ctx.strokeStyle = stoneOutline;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Right face of cutwater (shaded)
    ctx.beginPath();
    ctx.moveTo(cutMidX, cutTop);
    ctx.lineTo(cutMidX, cutBot);
    ctx.lineTo(px + pw, cutTop);
    ctx.closePath();
    ctx.fillStyle = isBlack ? '#221b16' : isGrey ? '#aba49d' : '#ab7e4c';
    ctx.fill();
    ctx.strokeStyle = stoneOutline;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Center prow ridge highlight
    ctx.strokeStyle = isBlack ? 'rgba(255,255,255,0.25)' : 'rgba(255, 255, 245, 0.9)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(cutMidX, cutTop);
    ctx.lineTo(cutMidX, cutBot);
    ctx.stroke();
  }

  // --- 5. HANGING SPANDREL MOSS & IVY TENDRILS ---
  const mossColors = isBlack
    ? ['#27272a', '#3f3f46']
    : isGrey
    ? ['#64748b', '#94a3b8']
    : ['#5b7d34', '#799c47', '#425f23'];

  const mossSpots = [
    { x: 125, y: wallTop + 6, w: 22, h: 32 },
    { x: 328, y: wallTop + 6, w: 26, h: 42 },
    { x: 378, y: wallTop + 6, w: 24, h: 38 },
    { x: 582, y: wallTop + 6, w: 26, h: 42 },
    { x: 632, y: wallTop + 6, w: 24, h: 38 },
    { x: 835, y: wallTop + 6, w: 22, h: 32 },
  ];

  for (const m of mossSpots) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x + m.w, m.y);
    ctx.quadraticCurveTo(m.x + m.w * 0.8, m.y + m.h * 0.6, m.x + m.w * 0.5, m.y + m.h);
    ctx.quadraticCurveTo(m.x + m.w * 0.2, m.y + m.h * 0.6, m.x, m.y);
    ctx.closePath();
    ctx.clip();
    fillColoredPencilRect(ctx, m.x - 2, m.y, m.w + 4, m.h, isBlack ? '#27272a' : '#d9f99d', mossColors, -38, 2.0, 0.8, 412);
    ctx.restore();
  }
}

/**
 * Cache offscreen static 3D stereoscopic colored-pencil background per WaterQuality
 * Pre-renders 3D extruded masonry blocks, perspective side slopes, and structural bridge corbels.
 */
const sceneBackgroundCache: Partial<Record<WaterQuality, HTMLCanvasElement>> = {};

function getColoredPencilSceneBackdrop(
  width: number,
  height: number,
  waterQuality: WaterQuality
): HTMLCanvasElement {
  const cached = sceneBackgroundCache[waterQuality];
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const rand = seededRandom(waterQuality === 'BLUE' ? 777 : waterQuality === 'GREY' ? 888 : 999);
  const bridgeTop = 90;
  const bridgeHeight = 45;
  const wallTop = bridgeTop + bridgeHeight; // 135 (1/4 of 540)
  const riverTop = 430;
  const wallHeight = riverTop - wallTop; // 295

  // 1. 3D Hand-Drawn Colored Pencil Sky (y: 0..90) with subtle atmospheric depth gradient
  const skyColors =
    waterQuality === 'BLUE'
      ? ['#60a5fa', '#3b82f6', '#93c5fd', '#2563eb', '#7dd3fc']
      : waterQuality === 'GREY'
      ? ['#94a3b8', '#64748b', '#cbd5e1', '#78716c']
      : ['#44403c', '#292524', '#57534e', '#1c1917'];
  const skyPaper = waterQuality === 'BLACK' ? '#332e2a' : '#fcf9f2';

  fillColoredPencilRect(ctx, 0, 0, width, bridgeTop + 4, skyPaper, skyColors, -32, 2.8, 0.58, 101);

  // Atmospheric sky horizon glow
  const skyHaze = ctx.createLinearGradient(0, 0, 0, bridgeTop);
  skyHaze.addColorStop(0, 'rgba(255, 255, 255, 0)');
  skyHaze.addColorStop(1, waterQuality === 'BLUE' ? 'rgba(235, 245, 255, 0.35)' : 'rgba(200, 200, 200, 0.2)');
  ctx.fillStyle = skyHaze;
  ctx.fillRect(0, 0, width, bridgeTop);

  // 2. Fluffy Colored-Pencil Green Bushes along Horizon (y: 48..90)
  const bushColors =
    waterQuality === 'BLUE'
      ? ['#4ade80', '#22c55e', '#16a34a', '#86efac', '#15803d']
      : waterQuality === 'GREY'
      ? ['#84a98c', '#6b9080', '#52796f', '#a3b18a']
      : ['#3f3f46', '#27272a', '#52525b'];
  const bushOutline = waterQuality === 'BLUE' ? '#14532d' : '#27272a';

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, bridgeTop);
  const moundPositions = [
    { x: 18, r: 24 }, { x: 52, r: 28 }, { x: 88, r: 22 }, { x: 122, r: 26 },
    { x: 158, r: 30 }, { x: 196, r: 23 }, { x: 232, r: 25 }, { x: 268, r: 29 },
    { x: 306, r: 22 }, { x: 342, r: 27 }, { x: 382, r: 31 }, { x: 420, r: 24 },
    { x: 458, r: 26 }, { x: 496, r: 29 }, { x: 534, r: 23 }, { x: 570, r: 27 },
    { x: 608, r: 31 }, { x: 648, r: 25 }, { x: 684, r: 22 }, { x: 720, r: 28 },
    { x: 758, r: 26 }, { x: 796, r: 30 }, { x: 834, r: 24 }, { x: 870, r: 27 },
    { x: 908, r: 29 }, { x: 945, r: 25 },
  ];
  for (const m of moundPositions) {
    ctx.arc(m.x, bridgeTop - 2, m.r, Math.PI, 0, false);
  }
  ctx.lineTo(width, bridgeTop);
  ctx.closePath();
  ctx.clip();

  fillColoredPencilRect(ctx, 0, bridgeTop - 36, width, 38, waterQuality === 'BLACK' ? '#27272a' : '#ecfccb', bushColors, -36, 2.4, 0.72, 202);
  ctx.restore();

  // Bush outline strokes
  ctx.save();
  ctx.strokeStyle = bushOutline;
  ctx.lineWidth = 1.6;
  ctx.globalAlpha = 0.65;
  for (const m of moundPositions) {
    ctx.beginPath();
    ctx.arc(m.x, bridgeTop - 2, m.r, Math.PI * 1.05, Math.PI * 1.95, false);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Monumental Vertical 3D Arch Supports (直立3D拱形支撐: 4 Vertical Piers & 3 Grand Arches)
  const wallLeft = 75;
  const wallRight = width - 75; // 885
  const wallW = wallRight - wallLeft; // 810
  drawVertical3DArchSupports(ctx, wallLeft, wallTop, wallW, wallHeight, riverTop, waterQuality);

  // 4. 3D Bridge Structure, Overhead Fascia, Recessed Soffit & 3D Corbels
  const bridgePaper = waterQuality === 'BLACK' ? '#3b322b' : '#f2dfc8';
  const bridgePencils =
    waterQuality === 'BLUE'
      ? ['#b87a44', '#9e6230', '#cf9660', '#854d21', '#c48650']
      : waterQuality === 'GREY'
      ? ['#78716c', '#57534e', '#a8a29e', '#44403c']
      : ['#44403c', '#292524', '#1c1917'];
  const stoneOutline = waterQuality === 'BLACK' ? '#1c1917' : '#4a2c14';

  // Upper Bridge deck & parapet (y: 90..116)
  fillColoredPencilRect(ctx, 0, bridgeTop, width, 26, bridgePaper, bridgePencils, -34, 2.4, 0.78, 505);

  // Hand-drawn stone block courses on upper parapet
  drawSketchyLine(ctx, 0, bridgeTop, width, bridgeTop, stoneOutline, 2.4, rand);
  drawSketchyLine(ctx, 0, bridgeTop + 6, width, bridgeTop + 6, stoneOutline, 1.5, rand);
  drawSketchyLine(ctx, 0, bridgeTop + 24, width, bridgeTop + 24, stoneOutline, 2.0, rand);
  for (let bx = 0; bx <= width; bx += 48) {
    drawSketchyLine(ctx, bx, bridgeTop + 6, bx, bridgeTop + 24, stoneOutline, 1.4, rand);
  }

  // 3D Projecting Coping Cornice / Overhang Ledge (y: 114..122)
  ctx.fillStyle = waterQuality === 'BLACK' ? '#2e2620' : '#eedec8';
  ctx.fillRect(0, 114, width, 8);
  ctx.fillStyle = 'rgba(255, 255, 245, 0.95)';
  ctx.fillRect(0, 114, width, 2.5); // Top bright sun highlight
  ctx.fillStyle = 'rgba(30, 18, 8, 0.75)';
  ctx.fillRect(0, 120, width, 2.5); // Bottom overhang cast shadow

  // 3D Recessed Underside Soffit (y: 122..135)
  ctx.fillStyle = waterQuality === 'BLACK' ? '#16120e' : '#422c1b';
  ctx.fillRect(0, 122, width, 13);

  // 3D Structural Stone Corbel Brackets with perspective side facets
  const corbelXList = [95, 175, 255, 335, 415, 495, 575, 655, 735, 815, 895];
  for (const cx of corbelXList) {
    const cw = 18;
    const ch = 14;
    // Front facet
    ctx.fillStyle = waterQuality === 'BLACK' ? '#382f26' : '#dfc4a2';
    ctx.fillRect(cx, 121, cw, ch);
    ctx.strokeStyle = '#281708';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(cx, 121, cw, ch);
    // Top highlight
    ctx.fillStyle = 'rgba(255, 255, 240, 0.75)';
    ctx.fillRect(cx, 121, cw, 2);
    // Left facet highlight
    ctx.fillStyle = 'rgba(255, 250, 220, 0.55)';
    ctx.fillRect(cx, 121, 2.5, ch);
    // Triangular 3D drop shadow cast down onto the stone wall
    ctx.fillStyle = 'rgba(20, 12, 5, 0.52)';
    ctx.beginPath();
    ctx.moveTo(cx + cw, 121 + ch);
    ctx.lineTo(cx + cw + 15, 121 + ch + 24);
    ctx.lineTo(cx, 121 + ch);
    ctx.closePath();
    ctx.fill();
  }

  // Deep Bridge Overhang Ambient Occlusion Shadow along top of wall
  const overhangGrad = ctx.createLinearGradient(0, wallTop, 0, wallTop + 42);
  overhangGrad.addColorStop(0, 'rgba(15, 9, 4, 0.82)');
  overhangGrad.addColorStop(0.35, 'rgba(30, 18, 8, 0.45)');
  overhangGrad.addColorStop(1, 'rgba(40, 25, 12, 0)');
  ctx.fillStyle = overhangGrad;
  ctx.fillRect(wallLeft, wallTop, wallW, 42);

  // 5. 3D Trapezoidal Retaining Walls (Side Piers with 3D Inner Sloping Perspective)
  // Left Pier: Front column (x: 0..48) + 3D Receding Inner Sloping Face (x: 48..75 at top -> 48..54 at bottom)
  fillColoredPencilRect(ctx, 0, bridgeTop + 24, 48, riverTop - (bridgeTop + 24), bridgePaper, bridgePencils, -34, 2.4, 0.8, 506);

  // Left Pier 3D Inner Sloping Face
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(48, bridgeTop + 24);
  ctx.lineTo(wallLeft, wallTop);
  ctx.lineTo(wallLeft, riverTop);
  ctx.lineTo(54, riverTop);
  ctx.closePath();
  ctx.fillStyle = waterQuality === 'BLACK' ? '#221b16' : '#9c6636';
  ctx.fill();
  // Inner sloping face shadow gradient (deepens into channel)
  const leftSlopeGrad = ctx.createLinearGradient(48, 0, wallLeft, 0);
  leftSlopeGrad.addColorStop(0, 'rgba(255, 250, 230, 0.2)');
  leftSlopeGrad.addColorStop(1, 'rgba(20, 10, 4, 0.6)');
  ctx.fillStyle = leftSlopeGrad;
  ctx.fill();
  ctx.strokeStyle = stoneOutline;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // 3D Perspective stone courses on inner slope
  for (let py = wallTop + 24; py < riverTop; py += 32) {
    ctx.beginPath();
    ctx.moveTo(50, py - 4);
    ctx.lineTo(wallLeft, py);
    ctx.stroke();
  }
  ctx.restore();

  // Right Pier: 3D Receding Inner Sloping Face (x: 885..912 at top -> 906..912 at bottom) + Front column (x: 912..960)
  fillColoredPencilRect(ctx, 912, bridgeTop + 24, width - 912, riverTop - (bridgeTop + 24), bridgePaper, bridgePencils, -34, 2.4, 0.8, 507);

  // Right Pier 3D Inner Sloping Face
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(wallRight, wallTop);
  ctx.lineTo(912, bridgeTop + 24);
  ctx.lineTo(906, riverTop);
  ctx.lineTo(wallRight, riverTop);
  ctx.closePath();
  ctx.fillStyle = waterQuality === 'BLACK' ? '#221b16' : '#8f5c2e';
  ctx.fill();
  // Right slope shadow gradient
  const rightSlopeGrad = ctx.createLinearGradient(wallRight, 0, 912, 0);
  rightSlopeGrad.addColorStop(0, 'rgba(20, 10, 4, 0.65)');
  rightSlopeGrad.addColorStop(1, 'rgba(255, 250, 230, 0.15)');
  ctx.fillStyle = rightSlopeGrad;
  ctx.fill();
  ctx.strokeStyle = stoneOutline;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  for (let py = wallTop + 24; py < riverTop; py += 32) {
    ctx.beginPath();
    ctx.moveTo(wallRight, py);
    ctx.lineTo(910, py - 4);
    ctx.stroke();
  }
  ctx.restore();

  // Front Pier Corner Edge Highlights
  ctx.strokeStyle = 'rgba(255, 255, 245, 0.65)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(48, bridgeTop + 24);
  ctx.lineTo(54, riverTop);
  ctx.stroke();

  ctx.strokeStyle = '#261507';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(wallLeft, wallTop);
  ctx.lineTo(wallLeft, riverTop);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(wallRight, wallTop);
  ctx.lineTo(wallRight, riverTop);
  ctx.stroke();

  // 6. Corner Hanging Moss Clusters with 3D drop shadows
  const mossFill =
    waterQuality === 'BLUE'
      ? ['#658a3b', '#84a955', '#4d6e27']
      : waterQuality === 'GREY'
      ? ['#6b7280', '#9ca3af']
      : ['#3f3f46', '#27272a'];

  // Left corner moss
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(wallLeft, wallTop);
  ctx.lineTo(wallLeft + 24, wallTop);
  ctx.quadraticCurveTo(wallLeft + 20, wallTop + 42, wallLeft + 12, wallTop + 58);
  ctx.quadraticCurveTo(wallLeft + 6, wallTop + 78, wallLeft, wallTop + 96);
  ctx.closePath();
  ctx.clip();
  fillColoredPencilRect(ctx, wallLeft, wallTop, 26, 98, '#d9f99d', mossFill, -40, 2.0, 0.85, 404);
  ctx.restore();

  // Right corner moss
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(wallRight, wallTop);
  ctx.lineTo(wallRight - 24, wallTop);
  ctx.quadraticCurveTo(wallRight - 20, wallTop + 42, wallRight - 12, wallTop + 58);
  ctx.quadraticCurveTo(wallRight - 6, wallTop + 78, wallRight, wallTop + 96);
  ctx.closePath();
  ctx.clip();
  fillColoredPencilRect(ctx, wallRight - 26, wallTop, 26, 98, '#d9f99d', mossFill, -40, 2.0, 0.85, 405);
  ctx.restore();

  // 7. Scenic Wooden River Sign "傷心湯" on Left Pier with 3D drop shadow
  ctx.save();
  // Hanging cords
  drawSketchyLine(ctx, 16, bridgeTop + 4, 16, bridgeTop + 20, '#3b220e', 2, rand);
  drawSketchyLine(ctx, 44, bridgeTop + 4, 44, bridgeTop + 20, '#3b220e', 2, rand);

  // 3D Drop shadow of sign board
  ctx.fillStyle = 'rgba(20, 10, 4, 0.45)';
  ctx.fillRect(8, bridgeTop + 20, 54, 38);

  // Sign board face
  fillColoredPencilRect(ctx, 5, bridgeTop + 18, 54, 36, '#ebd3b0', ['#8c5828', '#73441b', '#a66d38'], -30, 2.0, 0.85, 606);
  ctx.strokeStyle = '#3b220e';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(5, bridgeTop + 18, 54, 36);
  ctx.strokeStyle = 'rgba(255, 235, 200, 0.55)';
  ctx.lineWidth = 1;
  ctx.strokeRect(7, bridgeTop + 20, 50, 32);

  ctx.fillStyle = '#fffbeb';
  ctx.font = 'bold 15px "DotGothic16", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('傷心湯', 32, bridgeTop + 42);
  ctx.restore();

  // 8. Bridge Street Recycling & Waste Bins
  const drawBridgeBin = (bx: number, by: number, color: string, lidColor: string) => {
    ctx.save();
    // Drop shadow under bin
    ctx.fillStyle = 'rgba(20, 10, 4, 0.35)';
    ctx.fillRect(bx - 1, by + 24, 18, 4);
    // Bin body
    ctx.fillStyle = color;
    ctx.fillRect(bx, by, 16, 24);
    ctx.strokeStyle = '#26201b';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(bx, by, 16, 24);
    // Bin Lid
    ctx.fillStyle = lidColor;
    ctx.fillRect(bx - 2, by - 5, 20, 6);
    ctx.strokeRect(bx - 2, by - 5, 20, 6);
    // Bin Wheels
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(bx + 1, by + 22, 4, 4);
    ctx.fillRect(bx + 11, by + 22, 4, 4);
    // Bin Recycling Mark
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 4, by + 6, 8, 9);
    ctx.restore();
  };

  drawBridgeBin(180, bridgeTop - 18, '#0284c7', '#0369a1');
  drawBridgeBin(740, bridgeTop - 18, '#16a34a', '#14532d');

  // 9. 3D Colored-Pencil River Base Water (y: 430..540)
  const riverHeight = height - riverTop;
  const waterPaper = waterQuality === 'BLACK' ? '#1c1917' : '#e0f7fa';
  const waterPencils =
    waterQuality === 'BLUE'
      ? ['#0284c7', '#0d9488', '#0ea5e9', '#0369a1', '#14b8a6', '#2dd4bf']
      : waterQuality === 'GREY'
      ? ['#57534e', '#44403c', '#78716c', '#64748b']
      : ['#1c1917', '#292524', '#44403c', '#0f172a'];

  fillColoredPencilRect(ctx, 0, riverTop, width, riverHeight, waterPaper, waterPencils, -24, 2.3, 0.78, 707);

  // Deep Canal Baseline Shadow where wall meets water (y: 430..440)
  const waterBaseShadow = ctx.createLinearGradient(0, riverTop, 0, riverTop + 14);
  waterBaseShadow.addColorStop(0, 'rgba(10, 15, 25, 0.82)');
  waterBaseShadow.addColorStop(1, 'rgba(10, 15, 25, 0)');
  ctx.fillStyle = waterBaseShadow;
  ctx.fillRect(0, riverTop, width, 14);

  sceneBackgroundCache[waterQuality] = canvas;
  return canvas;
}

/**
 * Draw 3D Stereoscopic Bridge Scene with Atmospheric Volumetric Sunbeams & Perspective Water
 */
export function drawBridgeScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  waterQuality: WaterQuality,
  timeSec: number,
  playerX: number = 480,
  skip2DWater: boolean = false
) {
  const riverTop = 430;

  // 3D Parallax offset based on player horizontal position (-12px to +12px)
  const pOffset = ((playerX - 480) / 480) * 12;

  // 1. Draw pre-rendered 3D Colored Pencil Backdrop with parallax perspective
  const backdrop = getColoredPencilSceneBackdrop(width, height, waterQuality);
  ctx.save();
  ctx.drawImage(backdrop, -pOffset * 0.45, 0);
  ctx.restore();

  // 2. Animated Fluffy White Paper Clouds in Sky (y: 6..42) with independent 3D parallax drift
  const cloudOffset = (timeSec * 7) % (width + 220);
  const drawPaperCloud = (cx: number, cy: number, scale: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    ctx.fillStyle =
      waterQuality === 'BLACK' ? 'rgba(120, 113, 108, 0.5)' : 'rgba(253, 251, 246, 0.92)';
    ctx.strokeStyle =
      waterQuality === 'BLUE'
        ? 'rgba(59, 130, 246, 0.45)'
        : 'rgba(100, 116, 139, 0.45)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(0, 6, 13, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(14, 0, 16, Math.PI * 1.0, Math.PI * 1.85);
    ctx.arc(32, 2, 15, Math.PI * 1.15, Math.PI * 1.95);
    ctx.arc(46, 7, 11, Math.PI * 1.4, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const c1x = (((width - cloudOffset) - pOffset * 0.15) % (width + 160)) - 80;
  const c2x = (((width * 0.62 - cloudOffset * 0.7) - pOffset * 0.15) % (width + 160)) - 60;
  drawPaperCloud(c1x, 16, 1.05);
  drawPaperCloud(c2x, 22, 0.9);

  // 3. 3D Atmospheric Volumetric Light Shafts (God Rays / 耶穌光)
  if (waterQuality !== 'BLACK') {
    ctx.save();
    const rayList = [
      { x1: 170 - pOffset * 0.25, w1: 55, x2: 260, w2: 95, alpha: 0.11 },
      { x1: 400 - pOffset * 0.25, w1: 75, x2: 520, w2: 125, alpha: 0.14 },
      { x1: 640 - pOffset * 0.25, w1: 65, x2: 780, w2: 110, alpha: 0.12 },
    ];
    for (const ray of rayList) {
      const grad = ctx.createLinearGradient(0, 135, 0, riverTop + 65);
      grad.addColorStop(0, `rgba(255, 252, 230, ${ray.alpha * 1.3})`);
      grad.addColorStop(0.5, `rgba(255, 245, 205, ${ray.alpha * 0.8})`);
      grad.addColorStop(1, 'rgba(255, 235, 170, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ray.x1, 135);
      ctx.lineTo(ray.x1 + ray.w1, 135);
      ctx.lineTo(ray.x2 + ray.w2, riverTop + 65);
      ctx.lineTo(ray.x2, riverTop + 65);
      ctx.closePath();
      ctx.fill();

      // Soft colored-pencil diagonal light hatch strokes
      ctx.strokeStyle = `rgba(255, 255, 240, ${ray.alpha * 0.35})`;
      ctx.lineWidth = 1.0;
      for (let rx = ray.x1; rx < ray.x1 + ray.w1; rx += 14) {
        ctx.beginPath();
        ctx.moveTo(rx, 135);
        ctx.lineTo(rx + (ray.x2 - ray.x1), riverTop + 65);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // If Three.js is rendering 3D river water, skip procedural 2D sine waves
  if (skip2DWater) {
    // Subtle waterline foam along the 3D pier bases (y = 428..431)
    ctx.save();
    ctx.strokeStyle =
      waterQuality === 'BLUE'
        ? 'rgba(255, 255, 245, 0.75)'
        : waterQuality === 'GREY'
        ? 'rgba(230, 228, 225, 0.5)'
        : 'rgba(100, 95, 90, 0.35)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 16) {
      const wy = riverTop + Math.sin(x * 0.08 + timeSec * 3) * 1.5;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 4. 3D Wall Reflection into Water Plane
  ctx.save();
  const reflectGrad = ctx.createLinearGradient(0, riverTop, 0, riverTop + 55);
  reflectGrad.addColorStop(0, waterQuality === 'BLUE' ? 'rgba(230, 210, 180, 0.28)' : 'rgba(160, 150, 140, 0.18)');
  reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = reflectGrad;
  for (let c = 0; c < 15; c++) {
    const rx = 75 + c * 54 + (Math.sin(timeSec * 3 + c) * 3) - pOffset * 0.45;
    ctx.fillRect(rx, riverTop + 2, 48, 45);
  }
  ctx.restore();

  // 5. 3D Perspective River Water Plane (Foreshortened ripples from deep back to camera foreground)
  const waveStroke =
    waterQuality === 'BLUE'
      ? '#0369a1'
      : waterQuality === 'GREY'
      ? '#292524'
      : '#090d16';
  const waveHighlight =
    waterQuality === 'BLUE'
      ? 'rgba(252, 249, 242, 0.92)'
      : waterQuality === 'GREY'
      ? 'rgba(231, 229, 228, 0.65)'
      : 'rgba(120, 113, 108, 0.45)';

  ctx.save();

  // Top Continuous Wavy Foam Crest (y = 430)
  ctx.strokeStyle = waveHighlight;
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let x = 0; x <= width; x += 12) {
    const wy =
      riverTop +
      Math.sin((x + timeSec * 42) * 0.045) * 2.6 +
      Math.cos((x - timeSec * 25) * 0.09) * 1.2;
    if (x === 0) ctx.moveTo(x, wy);
    else ctx.lineTo(x, wy);
  }
  ctx.stroke();

  // Dark contour shadow along foam crest
  ctx.strokeStyle = waveStroke;
  ctx.lineWidth = 1.8;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 12) {
    const wy =
      riverTop +
      2.6 +
      Math.sin((x + timeSec * 42) * 0.045) * 2.6 +
      Math.cos((x - timeSec * 25) * 0.09) * 1.2;
    if (x === 0) ctx.moveTo(x, wy);
    else ctx.lineTo(x, wy);
  }
  ctx.stroke();

  // 3D Perspective Wave Layers (Foreshortened from distance to foreground)
  // Layer 1: Distance (y = 445) - tight fine ripples
  for (let x = -60 + ((timeSec * 22) % 60); x < width + 60; x += 60) {
    ctx.strokeStyle = waveHighlight;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    for (let dx = 0; dx <= 32; dx += 6) {
      const px = x + dx;
      const py = 445 + Math.sin(px * 0.12) * 1.5;
      if (dx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Layer 2: Mid-ground (y = 472) - medium ripples
  for (let x = -80 + ((timeSec * -30) % 80); x < width + 80; x += 80) {
    ctx.strokeStyle = waveHighlight;
    ctx.lineWidth = 2.2;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    for (let dx = 0; dx <= 46; dx += 8) {
      const px = x + dx;
      const py = 472 + Math.sin(px * 0.07) * 2.8;
      if (dx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.strokeStyle = waveStroke;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    for (let dx = 4; dx <= 50; dx += 8) {
      const px = x + dx;
      const py = 474.5 + Math.sin(px * 0.07) * 2.8;
      if (dx === 4) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Layer 3: Foreground (y = 505..535) - deep rolling 3D waves closest to camera
  const fgRows = [505, 528];
  for (let rIdx = 0; rIdx < fgRows.length; rIdx++) {
    const baseY = fgRows[rIdx];
    const dir = rIdx % 2 === 0 ? 1 : -1;
    const shift = (timeSec * 36 * dir) % 110;

    for (let x = -110 + shift; x < width + 110; x += 110) {
      // Big white foam crest
      ctx.strokeStyle = waveHighlight;
      ctx.lineWidth = 3.2;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (let dx = 0; dx <= 64; dx += 8) {
        const px = x + dx;
        const py = baseY + Math.sin((px + rIdx * 45) * 0.05) * 4.2;
        if (dx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Deep teal rolling wave body
      ctx.strokeStyle = waveStroke;
      ctx.lineWidth = 2.2;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      for (let dx = 6; dx <= 70; dx += 8) {
        const px = x + dx;
        const py = baseY + 3.8 + Math.sin((px + rIdx * 45) * 0.05) * 4.2;
        if (dx === 6) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  // Water Sparkles (Caustics) dancing under volumetric sunrays
  if (waterQuality === 'BLUE') {
    const sparkleSpots = [
      { x: 230, y: 442 }, { x: 285, y: 468 }, { x: 470, y: 450 },
      { x: 540, y: 478 }, { x: 720, y: 445 }, { x: 775, y: 485 },
    ];
    for (let i = 0; i < sparkleSpots.length; i++) {
      const sp = sparkleSpots[i];
      const sparkAlpha = Math.max(0, Math.sin(timeSec * 5 + i * 2.2));
      if (sparkAlpha > 0.1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkAlpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(sp.x + Math.sin(timeSec * 2 + i) * 8, sp.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
