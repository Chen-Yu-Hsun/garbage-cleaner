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
export function drawPedestrian(ctx: CanvasRenderingContext2D, p: Pedestrian) {
  ctx.save();
  ctx.translate(Math.floor(p.x), Math.floor(p.y));
  ctx.scale(p.direction, 1);

  const bob = Math.sin(p.walkFrame * 8) * 2;
  const legSwing = Math.sin(p.walkFrame * 8) * 4;
  ctx.strokeStyle = '#26201b';
  ctx.lineWidth = 1.2;

  switch (p.type) {
    case 'dog': {
      ctx.fillStyle = '#c27125';
      ctx.fillRect(-10, -10 + bob, 20, 10);
      ctx.strokeRect(-10, -10 + bob, 20, 10);
      ctx.fillRect(8, -16 + bob, 8, 8);
      ctx.strokeRect(8, -16 + bob, 8, 8);
      ctx.fillRect(16, -13 + bob, 4, 4);
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(19, -13 + bob, 2, 2);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(9, -16 + bob, 3, 5);
      ctx.fillStyle = '#c27125';
      ctx.fillRect(-13, -14 + bob, 3, 5);
      ctx.fillRect(-8 + legSwing, 0, 3, 5);
      ctx.fillRect(4 - legSwing, 0, 3, 5);
      break;
    }

    case 'child': {
      ctx.fillStyle = '#f5d0a9';
      ctx.fillRect(-4, -22 + bob, 8, 8);
      ctx.strokeRect(-4, -22 + bob, 8, 8);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-5, -24 + bob, 10, 3);
      ctx.fillStyle = p.color;
      ctx.fillRect(-4, -14 + bob, 8, 10);
      ctx.strokeRect(-4, -14 + bob, 8, 10);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3 + legSwing, -4, 3, 6);
      ctx.fillRect(1 - legSwing, -4, 3, 6);
      if (p.balloonColor) {
        ctx.strokeStyle = '#57534e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(2, -10 + bob);
        ctx.lineTo(-6, -34 + bob * 0.5);
        ctx.stroke();
        ctx.fillStyle = p.balloonColor;
        ctx.strokeStyle = '#26201b';
        ctx.beginPath();
        ctx.arc(-8, -40 + bob * 0.5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }

    case 'elder': {
      ctx.fillStyle = '#d6d3d1';
      ctx.fillRect(-5, -28 + bob, 8, 8);
      ctx.strokeRect(-5, -28 + bob, 8, 8);
      ctx.fillStyle = '#57534e';
      ctx.fillRect(-5, -20 + bob, 10, 14);
      ctx.strokeRect(-5, -20 + bob, 10, 14);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(8, -16 + bob, 2, 20);
      ctx.fillRect(6, -18 + bob, 4, 2);
      ctx.fillStyle = '#292524';
      ctx.fillRect(-4 + legSwing * 0.6, -6, 3, 8);
      ctx.fillRect(1 - legSwing * 0.6, -6, 3, 8);
      break;
    }

    case 'teen': {
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-5, -28 + bob, 9, 8);
      ctx.strokeRect(-5, -28 + bob, 9, 8);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-6, -26 + bob, 2, 5);
      ctx.fillRect(3, -26 + bob, 2, 5);
      ctx.fillRect(-6, -29 + bob, 11, 2);
      ctx.fillStyle = p.color;
      ctx.fillRect(-6, -20 + bob, 12, 14);
      ctx.strokeRect(-6, -20 + bob, 12, 14);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-4 + legSwing, -6, 4, 8);
      ctx.fillRect(1 - legSwing, -4, 4, 8);
      break;
    }

    case 'adult':
    default: {
      ctx.fillStyle = '#44403c';
      ctx.fillRect(-5, -30 + bob, 9, 8);
      ctx.strokeRect(-5, -30 + bob, 9, 8);
      ctx.fillStyle = p.color;
      ctx.fillRect(-6, -22 + bob, 12, 15);
      ctx.strokeRect(-6, -22 + bob, 12, 15);
      ctx.fillStyle = '#334155';
      ctx.fillRect(-4 + legSwing, -7, 4, 9);
      ctx.fillRect(1 - legSwing, -7, 4, 9);
      break;
    }
  }

  ctx.restore();
}

/**
 * Cache offscreen static colored-pencil background per WaterQuality
 * so complex diagonal pencil hatching renders at 60fps with zero overhead.
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
  const bridgeTop = 75;
  const bridgeHeight = 40;
  const wallTop = bridgeTop + bridgeHeight; // 115
  const riverTop = 430;
  const wallHeight = riverTop - wallTop; // 315

  // 1. Hand-Drawn Colored Pencil Sky (y: 0..75)
  const skyColors =
    waterQuality === 'BLUE'
      ? ['#60a5fa', '#3b82f6', '#93c5fd', '#2563eb', '#7dd3fc']
      : waterQuality === 'GREY'
      ? ['#94a3b8', '#64748b', '#cbd5e1', '#78716c']
      : ['#44403c', '#292524', '#57534e', '#1c1917'];
  const skyPaper = waterQuality === 'BLACK' ? '#332e2a' : '#fcf9f2';

  fillColoredPencilRect(ctx, 0, 0, width, bridgeTop + 4, skyPaper, skyColors, -32, 2.8, 0.58, 101);

  // 2. Fluffy Colored-Pencil Green Bushes along the Bridge Horizon (y: 38..75)
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
    { x: 18, r: 24 },
    { x: 52, r: 28 },
    { x: 88, r: 22 },
    { x: 122, r: 26 },
    { x: 158, r: 30 },
    { x: 196, r: 23 },
    { x: 232, r: 25 },
    { x: 268, r: 29 },
    { x: 306, r: 22 },
    { x: 342, r: 27 },
    { x: 382, r: 31 },
    { x: 420, r: 24 },
    { x: 458, r: 26 },
    { x: 496, r: 29 },
    { x: 534, r: 23 },
    { x: 570, r: 27 },
    { x: 608, r: 31 },
    { x: 648, r: 25 },
    { x: 684, r: 22 },
    { x: 720, r: 28 },
    { x: 758, r: 26 },
    { x: 796, r: 30 },
    { x: 834, r: 24 },
    { x: 870, r: 27 },
    { x: 908, r: 29 },
    { x: 945, r: 25 },
  ];
  for (const m of moundPositions) {
    ctx.arc(m.x, bridgeTop - 2, m.r, Math.PI, 0, false);
  }
  ctx.lineTo(width, bridgeTop);
  ctx.closePath();
  ctx.clip();

  fillColoredPencilRect(
    ctx,
    0,
    bridgeTop - 36,
    width,
    38,
    waterQuality === 'BLACK' ? '#27272a' : '#ecfccb',
    bushColors,
    -36,
    2.4,
    0.72,
    202
  );
  ctx.restore();

  // Sketchy green pencil outline along bush tops
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

  // 3. Under-Bridge Square-Tiled Cream Embankment Wall (x: 75..885, y: 115..430)
  // Matches the square stone grid wall in the reference illustration!
  const wallLeft = 75;
  const wallRight = width - 75; // 885
  const wallW = wallRight - wallLeft; // 810
  const cols = 15; // 810 / 15 = 54px per tile
  const rows = 6; // 315 / 6 = 52.5px per tile
  const tileW = wallW / cols;
  const tileH = wallHeight / rows;

  const wallPaper =
    waterQuality === 'BLUE' ? '#fcf7ee' : waterQuality === 'GREY' ? '#f1ede6' : '#38322c';
  const wallPencilColors =
    waterQuality === 'BLUE'
      ? ['#ead7bc', '#dfc7a7', '#f3e5d0', '#d4b894', '#e8d2b5']
      : waterQuality === 'GREY'
      ? ['#d6d3d1', '#a8a29e', '#e7e5e4']
      : ['#292524', '#44403c', '#1c1917'];

  fillColoredPencilRect(
    ctx,
    wallLeft,
    wallTop,
    wallW,
    wallHeight,
    wallPaper,
    wallPencilColors,
    -33,
    3.0,
    0.58,
    303
  );

  // Subtle individual tile shading variations & hand-drawn grid lines
  const gridLineColor =
    waterQuality === 'BLACK' ? 'rgba(20, 16, 14, 0.55)' : 'rgba(155, 132, 106, 0.58)';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tx = wallLeft + c * tileW;
      const ty = wallTop + r * tileH;
      // Slight warm tint in alternating tiles
      if ((r + c) % 2 === 0) {
        ctx.fillStyle =
          waterQuality === 'BLACK'
            ? 'rgba(0, 0, 0, 0.08)'
            : 'rgba(210, 182, 145, 0.12)';
        ctx.fillRect(tx + 2, ty + 2, tileW - 4, tileH - 4);
      }
    }
  }

  // Hand-drawn horizontal & vertical mortar lines for the square tile grid
  for (let r = 1; r < rows; r++) {
    const ly = wallTop + r * tileH;
    drawSketchyLine(ctx, wallLeft, ly, wallRight, ly, gridLineColor, 1.4, rand);
  }
  for (let c = 1; c < cols; c++) {
    const lx = wallLeft + c * tileW;
    drawSketchyLine(ctx, lx, wallTop, lx, riverTop, gridLineColor, 1.4, rand);
  }

  // Under-bridge cast shadow along top of tile wall
  ctx.fillStyle =
    waterQuality === 'BLACK' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(110, 75, 40, 0.24)';
  ctx.fillRect(wallLeft, wallTop, wallW, 9);

  // Hanging green moss on top-left and top-right corners under bridge (matches mockup)
  const mossFill =
    waterQuality === 'BLUE'
      ? ['#658a3b', '#84a955', '#4d6e27']
      : waterQuality === 'GREY'
      ? ['#6b7280', '#9ca3af']
      : ['#3f3f46', '#27272a'];

  // Left corner moss cluster
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(wallLeft, wallTop);
  ctx.lineTo(wallLeft + 20, wallTop);
  ctx.quadraticCurveTo(wallLeft + 18, wallTop + 38, wallLeft + 11, wallTop + 52);
  ctx.quadraticCurveTo(wallLeft + 6, wallTop + 72, wallLeft, wallTop + 88);
  ctx.closePath();
  ctx.clip();
  fillColoredPencilRect(ctx, wallLeft, wallTop, 22, 90, '#d9f99d', mossFill, -40, 2.0, 0.85, 404);
  ctx.restore();
  drawSketchyLine(ctx, wallLeft + 16, wallTop, wallLeft + 4, wallTop + 82, '#3f5a1d', 1.4, rand);

  // Right corner moss cluster
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(wallRight, wallTop);
  ctx.lineTo(wallRight - 20, wallTop);
  ctx.quadraticCurveTo(wallRight - 18, wallTop + 38, wallRight - 11, wallTop + 52);
  ctx.quadraticCurveTo(wallRight - 6, wallTop + 72, wallRight, wallTop + 88);
  ctx.closePath();
  ctx.clip();
  fillColoredPencilRect(
    ctx,
    wallRight - 22,
    wallTop,
    22,
    90,
    '#d9f99d',
    mossFill,
    -40,
    2.0,
    0.85,
    405
  );
  ctx.restore();
  drawSketchyLine(
    ctx,
    wallRight - 16,
    wallTop,
    wallRight - 4,
    wallTop + 82,
    '#3f5a1d',
    1.4,
    rand
  );

  // 4. Warm Brown Colored-Pencil Stone Bridge Deck (y: 75..115) & Side Piers
  const bridgePaper = waterQuality === 'BLACK' ? '#3b322b' : '#f2dfc8';
  const bridgePencils =
    waterQuality === 'BLUE'
      ? ['#b87a44', '#9e6230', '#cf9660', '#854d21', '#c48650']
      : waterQuality === 'GREY'
      ? ['#78716c', '#57534e', '#a8a29e', '#44403c']
      : ['#44403c', '#292524', '#1c1917'];
  const stoneOutline = waterQuality === 'BLACK' ? '#1c1917' : '#4a2c14';

  // Bridge horizontal deck
  fillColoredPencilRect(
    ctx,
    0,
    bridgeTop,
    width,
    bridgeHeight,
    bridgePaper,
    bridgePencils,
    -34,
    2.4,
    0.78,
    505
  );

  // Left Pier (x: 0..75, y: 75..430)
  fillColoredPencilRect(
    ctx,
    0,
    bridgeTop,
    wallLeft,
    riverTop - bridgeTop,
    bridgePaper,
    bridgePencils,
    -34,
    2.4,
    0.8,
    506
  );

  // Right Pier (x: 885..960, y: 75..430)
  fillColoredPencilRect(
    ctx,
    wallRight,
    bridgeTop,
    width - wallRight,
    riverTop - bridgeTop,
    bridgePaper,
    bridgePencils,
    -34,
    2.4,
    0.8,
    507
  );

  // Hand-drawn stone blocks on bridge deck
  drawSketchyLine(ctx, 0, bridgeTop, width, bridgeTop, stoneOutline, 2.4, rand);
  drawSketchyLine(ctx, 0, bridgeTop + 6, width, bridgeTop + 6, stoneOutline, 1.5, rand);
  drawSketchyLine(ctx, wallLeft, wallTop, wallRight, wallTop, stoneOutline, 2.4, rand);

  for (let bx = wallLeft; bx <= wallRight; bx += 54) {
    drawSketchyLine(ctx, bx, bridgeTop + 6, bx, wallTop, stoneOutline, 1.4, rand);
  }

  // Hand-drawn stone courses on Left & Right Piers
  drawSketchyLine(ctx, wallLeft, wallTop, wallLeft, riverTop, stoneOutline, 2.4, rand);
  drawSketchyLine(ctx, wallRight, wallTop, wallRight, riverTop, stoneOutline, 2.4, rand);

  for (let py = wallTop + 26; py < riverTop; py += 32) {
    drawSketchyLine(ctx, 0, py, wallLeft, py, stoneOutline, 1.4, rand);
    drawSketchyLine(ctx, wallRight, py, width, py, stoneOutline, 1.4, rand);
  }

  // 5. Wooden Level Sign "第一關 傷心湯" on Left Pier (matches mockup)
  ctx.save();
  // Hanging cords
  drawSketchyLine(ctx, 18, bridgeTop + 4, 18, bridgeTop + 22, '#3b220e', 2, rand);
  drawSketchyLine(ctx, 54, bridgeTop + 4, 54, bridgeTop + 22, '#3b220e', 2, rand);

  // Sign board
  fillColoredPencilRect(
    ctx,
    4,
    bridgeTop + 20,
    64,
    48,
    '#ebd3b0',
    ['#8c5828', '#73441b', '#a66d38'],
    -30,
    2.0,
    0.85,
    606
  );
  ctx.strokeStyle = '#3b220e';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(4, bridgeTop + 20, 64, 48);
  ctx.strokeStyle = 'rgba(255, 235, 200, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(7, bridgeTop + 23, 58, 42);

  ctx.fillStyle = '#fffbeb';
  ctx.font = 'bold 12px "DotGothic16", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('第一關', 36, bridgeTop + 39);
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 14px "DotGothic16", sans-serif';
  ctx.fillText('傷心湯', 36, bridgeTop + 59);
  ctx.restore();

  // 6. Colored-Pencil Base River Water (y: 430..540)
  const riverHeight = height - riverTop;
  const waterPaper = waterQuality === 'BLACK' ? '#1c1917' : '#e0f7fa';
  const waterPencils =
    waterQuality === 'BLUE'
      ? ['#0284c7', '#0d9488', '#0ea5e9', '#0369a1', '#14b8a6', '#2dd4bf']
      : waterQuality === 'GREY'
      ? ['#57534e', '#44403c', '#78716c', '#64748b']
      : ['#1c1917', '#292524', '#44403c', '#0f172a'];

  fillColoredPencilRect(
    ctx,
    0,
    riverTop,
    width,
    riverHeight,
    waterPaper,
    waterPencils,
    -24,
    2.3,
    0.78,
    707
  );

  sceneBackgroundCache[waterQuality] = canvas;
  return canvas;
}

/**
 * Draw Bridge Scene & Atmospheric River Water in Hand-Drawn Colored Pencil Style
 */
export function drawBridgeScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  waterQuality: WaterQuality,
  timeSec: number
) {
  const riverTop = 430;

  // 1. Draw pre-rendered Colored Pencil Backdrop (Sky, Bushes, Square-Tile Wall, Bridge, River Base)
  const backdrop = getColoredPencilSceneBackdrop(width, height, waterQuality);
  ctx.drawImage(backdrop, 0, 0);

  // 2. Animated Fluffy White Paper Clouds in the Sky (y: 6..42)
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

  const c1x = ((width - cloudOffset) % (width + 160)) - 80;
  const c2x = ((width * 0.62 - cloudOffset * 0.7) % (width + 160)) - 60;
  drawPaperCloud(c1x, 16, 1.05);
  drawPaperCloud(c2x, 22, 0.9);

  // 3. Animated Hand-Drawn Colored-Pencil River Waves & White Paper Foam Crests
  const waveStroke =
    waterQuality === 'BLUE'
      ? '#0369a1'
      : waterQuality === 'GREY'
      ? '#292524'
      : '#090d16';
  const waveHighlight =
    waterQuality === 'BLUE'
      ? 'rgba(252, 249, 242, 0.88)'
      : waterQuality === 'GREY'
      ? 'rgba(231, 229, 228, 0.65)'
      : 'rgba(120, 113, 108, 0.45)';

  ctx.save();
  // Continuous wavy white foam crest along the top of the river (y = 430)
  ctx.strokeStyle = waveHighlight;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let x = 0; x <= width; x += 12) {
    const wy =
      riverTop +
      Math.sin((x + timeSec * 42) * 0.045) * 2.8 +
      Math.cos((x - timeSec * 25) * 0.09) * 1.2;
    if (x === 0) ctx.moveTo(x, wy);
    else ctx.lineTo(x, wy);
  }
  ctx.stroke();

  // Dark teal colored-pencil contour line right below the foam crest
  ctx.strokeStyle = waveStroke;
  ctx.lineWidth = 1.8;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 12) {
    const wy =
      riverTop +
      2.5 +
      Math.sin((x + timeSec * 42) * 0.045) * 2.8 +
      Math.cos((x - timeSec * 25) * 0.09) * 1.2;
    if (x === 0) ctx.moveTo(x, wy);
    else ctx.lineTo(x, wy);
  }
  ctx.stroke();

  // Animated wavy colored-pencil ripple strokes inside the river body
  const rippleRows = [riverTop + 20, riverTop + 44, riverTop + 70, riverTop + 94];
  for (let rIdx = 0; rIdx < rippleRows.length; rIdx++) {
    const baseY = rippleRows[rIdx];
    const dir = rIdx % 2 === 0 ? 1 : -1;
    const shift = (timeSec * 28 * dir) % 90;

    for (let x = -90 + shift; x < width + 90; x += 90) {
      // White pencil highlight ripple
      ctx.strokeStyle = waveHighlight;
      ctx.lineWidth = 2.0;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      for (let dx = 0; dx <= 48; dx += 8) {
        const px = x + dx;
        const py = baseY + Math.sin((px + rIdx * 30) * 0.08) * 2.5;
        if (dx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Dark teal pencil shadow ripple
      ctx.strokeStyle = waveStroke;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      for (let dx = 6; dx <= 54; dx += 8) {
        const px = x + dx;
        const py = baseY + 2.5 + Math.sin((px + rIdx * 30) * 0.08) * 2.5;
        if (dx === 6) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}
