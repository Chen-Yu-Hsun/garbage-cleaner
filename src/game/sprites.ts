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

/**
 * Pre-render High-Definition 醜泥怪 (Ugly Mud/Moss Monster)
 * Faithfully modeled after the official character illustration:
 * - Tall pear/mound-shaped silhouette covered in long, flowing olive-moss hair locks
 * - Hand-painted gouache / colored-pencil vertical streaky hair texture & dark umber lock crevices
 * - Signature droopy, half-lidded world-weary eyes with cream sclera & dark pupils
 * - Small maroon-red open bean mouth with 2 upper tiny white fangs and 1 lower tiny tooth
 */
let mossMonsterCanvasCache: HTMLCanvasElement | null = null;

function getMossMonsterCanvas(): HTMLCanvasElement {
  if (mossMonsterCanvasCache) return mossMonsterCanvasCache;
  if (typeof document === 'undefined') return null as any;

  const w = 240;
  const h = 268;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d');
  if (!c) return canvas;

  const rand = seededRandom(2026);
  const cx = w * 0.48; // Slightly left-centered crown & face, with right hair locks sweeping wider

  // Helper to trace the organic tall mound silhouette of 醜泥怪
  const traceSilhouette = () => {
    c.beginPath();
    // Top rounded crown
    c.moveTo(cx - 4, h * 0.055);
    // Upper-left head & left shoulder bulge
    c.bezierCurveTo(cx - 52, h * 0.06, cx - 76, h * 0.24, cx - 82, h * 0.46);
    // Mid-left slight waist curve down to bottom-left base
    c.bezierCurveTo(cx - 86, h * 0.60, cx - 74, h * 0.74, cx - 76, h * 0.88);
    c.quadraticCurveTo(cx - 76, h * 0.945, cx - 54, h * 0.955);
    // Broad flat-ish bottom base
    c.bezierCurveTo(cx - 18, h * 0.97, cx + 34, h * 0.965, cx + 82, h * 0.945);
    // Sweeping lower-right moss locks
    c.quadraticCurveTo(cx + 98, h * 0.93, cx + 92, h * 0.84);
    c.bezierCurveTo(cx + 84, h * 0.68, cx + 76, h * 0.50, cx + 68, h * 0.34);
    // Upper-right head slope back to crown
    c.bezierCurveTo(cx + 58, h * 0.16, cx + 34, h * 0.055, cx - 4, h * 0.055);
    c.closePath();
  };

  c.save();
  traceSilhouette();

  // 1. Base Olive-Moss Gouache Shading
  const bodyGrad = c.createLinearGradient(cx - 30, h * 0.06, cx + 35, h * 0.96);
  bodyGrad.addColorStop(0, '#6a8444');
  bodyGrad.addColorStop(0.32, '#5a7339');
  bodyGrad.addColorStop(0.72, '#485e2c');
  bodyGrad.addColorStop(1, '#31421d');
  c.fillStyle = bodyGrad;
  c.fill();
  c.clip();

  // 2. Long Flowing Vertical Wavy Hair-Lock Ribbons (Gouache & Oil-Pastel Brushwork)
  const lockPalette = [
    '#3d5224',
    '#49612c',
    '#567036',
    '#648040',
    '#73914b',
    '#82a158',
    '#91af66',
  ];

  // Broad vertical wavy locks from crown to bottom
  for (let i = 0; i < 140; i++) {
    const startX = cx - 88 + (i / 140) * 186 + (rand() - 0.5) * 6;
    const startY = h * (0.05 + rand() * 0.18);
    const endY = h * (0.65 + rand() * 0.33);
    const driftX = (startX - cx) * 0.22 + (rand() - 0.5) * 18;
    const midX1 = startX + driftX * 0.4 + Math.sin(i * 0.7) * 6;
    const midX2 = startX + driftX * 0.8 - Math.cos(i * 0.5) * 6;

    c.strokeStyle = lockPalette[Math.floor(rand() * lockPalette.length)];
    c.lineWidth = 3.5 + rand() * 5.5;
    c.lineCap = 'round';
    c.globalAlpha = 0.42 + rand() * 0.35;

    c.beginPath();
    c.moveTo(startX, startY);
    c.bezierCurveTo(
      midX1,
      startY + (endY - startY) * 0.33,
      midX2,
      startY + (endY - startY) * 0.66,
      startX + driftX,
      endY
    );
    c.stroke();
  }

  // 3. Chalky Colored-Pencil / Dry-Brush Vertical Highlights & Deep Moss Strands
  for (let s = 0; s < 780; s++) {
    const sx = cx - 86 + rand() * 182;
    const sy = h * 0.06 + rand() * (h * 0.88);
    const len = 14 + rand() * 28;
    // Slight natural wave following the locks downward
    const slope = ((sx - cx) / 160) * 0.28 + Math.sin(sy * 0.04 + sx * 0.03) * 0.14;
    const ex = sx + Math.sin(slope) * len;
    const ey = sy + Math.cos(slope) * len;

    const isLight = sy < h * 0.68 && rand() > 0.48;
    c.strokeStyle = isLight
      ? ['#7f9c56', '#8eab64', '#9cb872', '#6c8845'][Math.floor(rand() * 4)]
      : ['#2c3b19', '#384a21', '#455929', '#222e13'][Math.floor(rand() * 4)];
    c.lineWidth = 0.8 + rand() * 1.4;
    c.globalAlpha = 0.45 + rand() * 0.38;

    c.beginPath();
    c.moveTo(sx, sy);
    c.quadraticCurveTo((sx + ex) * 0.5 + (rand() - 0.5) * 3, (sy + ey) * 0.5, ex, ey);
    c.stroke();
  }

  // Subtle Bluish-Teal Paint Smudge to the Left of Left Eye (Authentic detail from reference photo)
  const tealSmudge = c.createRadialGradient(cx - 50, h * 0.33, 2, cx - 50, h * 0.33, 16);
  tealSmudge.addColorStop(0, 'rgba(36, 128, 102, 0.48)');
  tealSmudge.addColorStop(1, 'rgba(36, 128, 102, 0)');
  c.globalAlpha = 1;
  c.fillStyle = tealSmudge;
  c.beginPath();
  c.arc(cx - 50, h * 0.33, 16, 0, Math.PI * 2);
  c.fill();

  // Deep shadow gradient at bottom base & under-eye area
  const bottomShade = c.createLinearGradient(0, h * 0.72, 0, h * 0.96);
  bottomShade.addColorStop(0, 'rgba(28, 38, 16, 0)');
  bottomShade.addColorStop(1, 'rgba(22, 30, 12, 0.68)');
  c.fillStyle = bottomShade;
  c.fillRect(0, h * 0.72, w, h * 0.26);

  // 4. Signature Dark Umber-Brown Hair Lock Crevices & Forehead Bangs Parting
  c.lineCap = 'round';
  c.lineJoin = 'round';
  const drawCrevice = (pts: [number, number][], width: number, alpha: number = 0.82) => {
    c.save();
    c.strokeStyle = '#2b2116';
    c.lineWidth = width;
    c.globalAlpha = alpha;
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i][0] + pts[i + 1][0]) / 2;
      const yc = (pts[i][1] + pts[i + 1][1]) / 2;
      c.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
    }
    c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    c.stroke();
    c.restore();
  };

  // Forehead parting & central bang tuft hanging between the eyes
  drawCrevice(
    [
      [cx - 42, h * 0.30],
      [cx - 28, h * 0.25],
      [cx - 12, h * 0.19],
    ],
    2.4,
    0.78
  );
  // Left cheek long lock crevice running down from outer left eye
  drawCrevice(
    [
      [cx - 41, h * 0.28],
      [cx - 46, h * 0.36],
      [cx - 53, h * 0.45],
    ],
    2.6,
    0.85
  );
  // Central pointed bang strand dipping between the two eyes
  drawCrevice(
    [
      [cx - 7, h * 0.20],
      [cx - 8, h * 0.26],
      [cx - 10, h * 0.32],
    ],
    2.5,
    0.88
  );
  drawCrevice(
    [
      [cx + 6, h * 0.18],
      [cx - 2, h * 0.25],
      [cx - 9, h * 0.32],
    ],
    2.5,
    0.88
  );
  // Right brow & long S-curve lock crevices cascading down right side
  drawCrevice(
    [
      [cx + 5, h * 0.20],
      [cx + 18, h * 0.27],
      [cx + 35, h * 0.35],
      [cx + 48, h * 0.43],
      [cx + 58, h * 0.56],
    ],
    2.8,
    0.88
  );
  drawCrevice(
    [
      [cx + 26, h * 0.19],
      [cx + 35, h * 0.27],
      [cx + 52, h * 0.39],
      [cx + 64, h * 0.54],
      [cx + 70, h * 0.68],
    ],
    2.6,
    0.82
  );
  drawCrevice(
    [
      [cx + 46, h * 0.22],
      [cx + 58, h * 0.34],
      [cx + 69, h * 0.48],
      [cx + 76, h * 0.62],
    ],
    2.2,
    0.72
  );
  // Subtle lower vertical lock crevices
  drawCrevice(
    [
      [cx - 22, h * 0.52],
      [cx - 25, h * 0.68],
      [cx - 24, h * 0.86],
    ],
    2.0,
    0.45
  );
  drawCrevice(
    [
      [cx + 12, h * 0.54],
      [cx + 15, h * 0.72],
      [cx + 18, h * 0.88],
    ],
    2.0,
    0.45
  );

  // 5. Signature Droopy, Half-Lidded Melancholic Eyes (厭世下垂半瞇眼)
  const drawDroopyEye = (
    ex: number,
    ey: number,
    rx: number,
    ry: number,
    lidTiltRad: number,
    pupilOffsetX: number
  ) => {
    c.save();
    c.translate(ex, ey);
    c.rotate(lidTiltRad);

    // Subtle dark olive under-eye bag / shadow strokes
    c.fillStyle = 'rgba(34, 46, 20, 0.55)';
    c.beginPath();
    c.ellipse(0, ry * 0.35, rx * 1.12, ry * 0.82, 0, 0, Math.PI);
    c.fill();

    // Half-lidded eye shape: flat/gently arched top cut, full rounded bottom bowl
    const traceEyeShape = () => {
      c.beginPath();
      c.moveTo(-rx, -ry * 0.22);
      c.quadraticCurveTo(0, -ry * 0.36, rx, -ry * 0.20);
      c.bezierCurveTo(rx * 1.04, ry * 0.68, rx * 0.48, ry * 0.96, 0, ry * 0.96);
      c.bezierCurveTo(-rx * 0.48, ry * 0.96, -rx * 1.04, ry * 0.68, -rx, -ry * 0.22);
      c.closePath();
    };

    traceEyeShape();
    const scleraGrad = c.createRadialGradient(-2, 2, 2, 0, 2, rx * 1.1);
    scleraGrad.addColorStop(0, '#f7f4e6');
    scleraGrad.addColorStop(0.75, '#eae5d0');
    scleraGrad.addColorStop(1, '#c7c1aa');
    c.fillStyle = scleraGrad;
    c.fill();

    // Clip to eye interior for the dark round pupil tucked against the upper lid
    c.save();
    traceEyeShape();
    c.clip();

    const px = pupilOffsetX;
    const py = -ry * 0.02;
    const pr = 6.2;

    c.fillStyle = '#261a14';
    c.beginPath();
    c.arc(px, py, pr, 0, Math.PI * 2);
    c.fill();

    // Tiny crisp white catchlight dot on upper-left of pupil
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(px - 2.2, py - 1.8, 1.4, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Subtle lower rim outline
    traceEyeShape();
    c.strokeStyle = 'rgba(42, 33, 22, 0.55)';
    c.lineWidth = 1.3;
    c.stroke();

    // Heavy droopy upper eyelid line
    c.strokeStyle = '#281e14';
    c.lineWidth = 2.6;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-rx * 1.05, -ry * 0.20);
    c.quadraticCurveTo(0, -ry * 0.38, rx * 1.05, -ry * 0.18);
    c.stroke();

    c.restore();
  };

  // Left eye (viewer's left, tilted down-left) & Right eye (viewer's right, tilted slightly down-right)
  drawDroopyEye(cx - 25, h * 0.305, 15.5, 12.5, -0.17, 2.2);
  drawDroopyEye(cx + 18, h * 0.310, 15.0, 12.2, 0.08, 0.5);

  // Horizontal dark under-eye crease lines under right eye (as seen in reference)
  c.strokeStyle = 'rgba(38, 50, 22, 0.65)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx + 8, h * 0.362);
  c.quadraticCurveTo(cx + 22, h * 0.370, cx + 34, h * 0.364);
  c.stroke();

  // 6. Signature Small Maroon Open Mouth with 3 Tiny White Fangs (微張紅棕小嘴 + 3顆小尖牙)
  const mx = cx - 4;
  const my = h * 0.395;
  const mw = 15.5;
  const mh = 9.0;

  c.save();
  c.translate(mx, my);
  c.rotate(-0.04);

  const traceMouth = () => {
    c.beginPath();
    c.moveTo(-mw, 1);
    c.bezierCurveTo(-mw, -mh * 1.05, mw, -mh * 1.05, mw, 1);
    c.bezierCurveTo(mw * 1.05, mh * 0.78, mw * 0.45, mh * 0.85, 0, mh * 0.82);
    c.bezierCurveTo(-mw * 0.45, mh * 0.85, -mw * 1.05, mh * 0.78, -mw, 1);
    c.closePath();
  };

  traceMouth();
  const mouthGrad = c.createLinearGradient(0, -mh, 0, mh);
  mouthGrad.addColorStop(0, '#591512');
  mouthGrad.addColorStop(0.45, '#801f1b');
  mouthGrad.addColorStop(1, '#a62c26');
  c.fillStyle = mouthGrad;
  c.fill();

  c.save();
  traceMouth();
  c.clip();

  // Upper-left tiny white fang
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.moveTo(-mw * 0.56, -mh * 0.62);
  c.lineTo(-mw * 0.42, -mh * 0.15);
  c.lineTo(-mw * 0.28, -mh * 0.68);
  c.closePath();
  c.fill();

  // Upper-right tiny white fang
  c.beginPath();
  c.moveTo(mw * 0.28, -mh * 0.68);
  c.lineTo(mw * 0.42, -mh * 0.15);
  c.lineTo(mw * 0.56, -mh * 0.62);
  c.closePath();
  c.fill();

  // Lower tiny white tooth speck
  c.beginPath();
  c.moveTo(mw * 0.08, mh * 0.85);
  c.lineTo(mw * 0.18, mh * 0.42);
  c.lineTo(mw * 0.28, mh * 0.85);
  c.closePath();
  c.fill();

  c.restore();

  traceMouth();
  c.strokeStyle = '#3d120e';
  c.lineWidth = 1.4;
  c.stroke();

  c.restore();
  c.restore(); // silhouette clip

  // Soft outer fibrous moss edge strokes along the silhouette perimeter
  c.save();
  c.strokeStyle = '#4a612d';
  c.lineWidth = 1.6;
  c.globalAlpha = 0.65;
  traceSilhouette();
  c.stroke();
  c.restore();

  mossMonsterCanvasCache = canvas;
  return canvas;
}

/**
 * Draw 醜泥怪 (Mud Monster - Faithful to Official Illustration)
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

  if (flipX) {
    ctx.scale(-1, 1);
  }

  if (isFlashing) {
    ctx.filter = 'brightness(1.5) contrast(1.2)';
  }

  const bob = isMoving ? Math.sin(walkCycle * 8) * 3.2 : Math.sin(walkCycle * 3) * 1.5;
  const squash = isMoving ? 1 + Math.sin(walkCycle * 8) * 0.045 : 1;
  const tilt = isMoving ? Math.cos(walkCycle * 8) * 0.04 : 0;

  // Water Ripple & Ambient Occlusion Shadow under 醜泥怪
  const shadowGrad = ctx.createRadialGradient(0, 0, baseWidth * 0.1, 0, 0, baseWidth * 0.54);
  shadowGrad.addColorStop(0, 'rgba(15, 25, 12, 0.58)');
  shadowGrad.addColorStop(0.65, 'rgba(20, 38, 18, 0.28)');
  shadowGrad.addColorStop(1, 'rgba(20, 38, 18, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 1, baseWidth * 0.54, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dynamic water ring around submerged base
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 1, baseWidth * (0.48 + Math.sin(walkCycle * 5) * 0.03), 5.2, 0, 0, Math.PI * 2);
  ctx.stroke();

  const spriteCanvas = getMossMonsterCanvas();
  if (spriteCanvas) {
    // Preserve the tall mound aspect ratio of the official 醜泥怪 illustration
    const drawW = baseWidth * 1.06 * squash;
    const drawH = Math.max(baseHeight * 1.12, baseWidth * 1.15) / squash;
    const drawX = -drawW / 2;
    const drawY = -drawH + bob + 3;

    ctx.save();
    ctx.rotate(tilt);
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(spriteCanvas, drawX, drawY, drawW, drawH);

    // Wide-Open Maroon Mouth Catching Animation (張大紅棕嘴與小尖牙接垃圾動作)
    if (isCatching) {
      const mouthX = -drawW * 0.02;
      const mouthY = drawY + drawH * 0.42;
      const mouthRx = drawW * 0.19;
      const mouthRy = drawH * 0.12;

      ctx.save();
      const mGrad = ctx.createLinearGradient(mouthX, mouthY - mouthRy, mouthX, mouthY + mouthRy);
      mGrad.addColorStop(0, '#4a100d');
      mGrad.addColorStop(0.5, '#7f1d18');
      mGrad.addColorStop(1, '#ad2e28');
      ctx.fillStyle = mGrad;
      ctx.strokeStyle = '#330c09';
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, mouthRx, mouthRy, -0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, mouthRx, mouthRy, -0.04, 0, Math.PI * 2);
      ctx.clip();

      // Signature 2 upper white fangs & 1 lower white tooth scaled up for catching
      ctx.fillStyle = '#ffffff';
      // Upper left fang
      ctx.beginPath();
      ctx.moveTo(mouthX - mouthRx * 0.52, mouthY - mouthRy * 0.95);
      ctx.lineTo(mouthX - mouthRx * 0.36, mouthY - mouthRy * 0.25);
      ctx.lineTo(mouthX - mouthRx * 0.20, mouthY - mouthRy * 0.95);
      ctx.fill();
      // Upper right fang
      ctx.beginPath();
      ctx.moveTo(mouthX + mouthRx * 0.20, mouthY - mouthRy * 0.95);
      ctx.lineTo(mouthX + mouthRx * 0.36, mouthY - mouthRy * 0.25);
      ctx.lineTo(mouthX + mouthRx * 0.52, mouthY - mouthRy * 0.95);
      ctx.fill();
      // Lower tooth
      ctx.beginPath();
      ctx.moveTo(mouthX + mouthRx * 0.05, mouthY + mouthRy * 0.98);
      ctx.lineTo(mouthX + mouthRx * 0.18, mouthY + mouthRy * 0.38);
      ctx.lineTo(mouthX + mouthRx * 0.30, mouthY + mouthRy * 0.98);
      ctx.fill();

      ctx.restore();
    }

    ctx.imageSmoothingEnabled = prevSmooth;
    ctx.restore();
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

/**
 * Pre-render High-Definition 米多力 (Midori - Cute Aqua Water Spirit)
 * Faithfully modeled after the official character illustration:
 * - Soft pastel-shaded sky-blue / aqua water-spirit body with stubby raised arms & curved tail base
 * - Signature sculpted pompadour water-wave hair crest curling up to a sharp peak on the upper-left
 * - Big round white eyes with large inward-looking dark brown pupils & rosy pink cheek blushes
 * - Cheerful coral-orange open smile with 2 upper tiny white teeth and 1 lower tiny tooth
 * - Signature sandy-yellow square crossbody bag with a cyan water droplet & concentric ripple rings
 */
let waterSpiritCanvasCache: HTMLCanvasElement | null = null;

function getWaterSpiritCanvas(): HTMLCanvasElement {
  if (waterSpiritCanvasCache) return waterSpiritCanvasCache;
  if (typeof document === 'undefined') return null as any;

  const w = 240;
  const h = 280;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d');
  if (!c) return canvas;

  const rand = seededRandom(3088);
  const cx = w * 0.50;

  // 1. Lower Body, Stubby Arms & Gently Curved Water-Spirit Tail Base
  c.save();
  const traceBodyAndArms = () => {
    c.beginPath();
    // Left neck join
    c.moveTo(cx - 32, h * 0.50);
    // Outward to left stubby arm (raised slightly in a cute greeting)
    c.bezierCurveTo(cx - 46, h * 0.50, cx - 64, h * 0.45, cx - 68, h * 0.49);
    c.bezierCurveTo(cx - 72, h * 0.54, cx - 58, h * 0.60, cx - 40, h * 0.60);
    // Left torso down to tapered lower-left hip
    c.bezierCurveTo(cx - 40, h * 0.72, cx - 34, h * 0.84, cx - 18, h * 0.91);
    // Curved water-spirit tail base sweeping toward bottom-right
    c.bezierCurveTo(cx + 4, h * 0.96, cx + 42, h * 0.96, cx + 52, h * 0.92);
    c.bezierCurveTo(cx + 58, h * 0.89, cx + 40, h * 0.80, cx + 38, h * 0.64);
    // Outward to right stubby arm
    c.bezierCurveTo(cx + 54, h * 0.64, cx + 70, h * 0.59, cx + 68, h * 0.53);
    c.bezierCurveTo(cx + 66, h * 0.49, cx + 48, h * 0.54, cx + 34, h * 0.53);
    c.closePath();
  };

  traceBodyAndArms();
  const bodyGrad = c.createRadialGradient(cx - 12, h * 0.62, 10, cx + 4, h * 0.70, 78);
  bodyGrad.addColorStop(0, '#a8eefb');
  bodyGrad.addColorStop(0.35, '#64d0e8');
  bodyGrad.addColorStop(0.78, '#45b7d1');
  bodyGrad.addColorStop(1, '#2694b0');
  c.fillStyle = bodyGrad;
  c.fill();

  c.save();
  traceBodyAndArms();
  c.clip();

  // Soft icy-white highlight on chest/belly (above the crossbody bag)
  const bellyGlow = c.createRadialGradient(cx - 18, h * 0.60, 2, cx - 18, h * 0.60, 26);
  bellyGlow.addColorStop(0, 'rgba(228, 251, 255, 0.85)');
  bellyGlow.addColorStop(1, 'rgba(228, 251, 255, 0)');
  c.fillStyle = bellyGlow;
  c.beginPath();
  c.arc(cx - 18, h * 0.60, 26, 0, Math.PI * 2);
  c.fill();

  // Deeper teal neck-under-chin shadow
  const neckShade = c.createLinearGradient(0, h * 0.49, 0, h * 0.57);
  neckShade.addColorStop(0, 'rgba(18, 126, 154, 0.55)');
  neckShade.addColorStop(1, 'rgba(18, 126, 154, 0)');
  c.fillStyle = neckShade;
  c.fillRect(cx - 45, h * 0.49, 90, h * 0.08);

  c.restore(); // body clip
  c.restore();

  // 2. Plump, Wide, Adorable Rounded Head (Tilted slightly clockwise like reference photo)
  c.save();
  const traceHead = () => {
    c.beginPath();
    // Start top-left forehead
    c.moveTo(cx - 46, h * 0.25);
    // Left plump cheek
    c.bezierCurveTo(cx - 64, h * 0.33, cx - 64, h * 0.48, cx - 36, h * 0.53);
    // Soft rounded chin & jawline
    c.bezierCurveTo(cx - 12, h * 0.56, cx + 16, h * 0.57, cx + 38, h * 0.54);
    // Right plump cheek up to right temple
    c.bezierCurveTo(cx + 64, h * 0.49, cx + 66, h * 0.31, cx + 48, h * 0.22);
    c.closePath();
  };

  traceHead();
  const headGrad = c.createRadialGradient(cx - 8, h * 0.36, 12, cx + 2, h * 0.39, 66);
  headGrad.addColorStop(0, '#8ee5f7');
  headGrad.addColorStop(0.45, '#5ecbe3');
  headGrad.addColorStop(0.82, '#43b6d0');
  headGrad.addColorStop(1, '#2493b0');
  c.fillStyle = headGrad;
  c.fill();

  c.save();
  traceHead();
  c.clip();

  // Deeper teal shadow directly under the overhanging wave hair crest
  c.strokeStyle = '#1486a3';
  c.lineWidth = 5.5;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - 44, h * 0.27);
  c.bezierCurveTo(cx - 18, h * 0.33, cx + 8, h * 0.26, cx + 38, h * 0.27);
  c.stroke();

  // Subtle curved teal eyebrow-crease on right forehead (visible in photo)
  c.strokeStyle = '#1689a6';
  c.lineWidth = 2.0;
  c.beginPath();
  c.moveTo(cx + 12, h * 0.255);
  c.quadraticCurveTo(cx + 28, h * 0.252, cx + 40, h * 0.278);
  c.stroke();

  // 3. Soft Rosy-Pink Cheek Blushes (粉嫩圓形腮紅)
  const drawCheekBlush = (bx: number, by: number, br: number) => {
    const bGrad = c.createRadialGradient(bx, by, 1.5, bx, by, br);
    bGrad.addColorStop(0, 'rgba(246, 136, 134, 0.85)');
    bGrad.addColorStop(0.55, 'rgba(250, 172, 170, 0.48)');
    bGrad.addColorStop(1, 'rgba(250, 172, 170, 0)');
    c.fillStyle = bGrad;
    c.beginPath();
    c.arc(bx, by, br, 0, Math.PI * 2);
    c.fill();
  };
  drawCheekBlush(cx - 38, h * 0.425, 13.5);
  drawCheekBlush(cx + 22, h * 0.475, 13.5);

  // 4. Big Round White Eyes with Inward-Looking Dark Brown Pupils (圓潤大眼)
  const drawMidoriEye = (ex: number, ey: number, rx: number, ry: number, pupilDX: number, pupilDY: number) => {
    c.save();
    c.translate(ex, ey);

    // Subtle teal eye-socket rim shading
    c.fillStyle = 'rgba(20, 130, 158, 0.42)';
    c.beginPath();
    c.ellipse(-0.8, -0.8, rx + 1.5, ry + 1.5, 0.08, 0, Math.PI * 2);
    c.fill();

    // Crisp white eyeball
    const eyeGrad = c.createRadialGradient(2, 2, 2, 0, 0, rx);
    eyeGrad.addColorStop(0, '#ffffff');
    eyeGrad.addColorStop(0.85, '#f8feff');
    eyeGrad.addColorStop(1, '#cbeff7');
    c.fillStyle = eyeGrad;
    c.beginPath();
    c.ellipse(0, 0, rx, ry, 0.08, 0, Math.PI * 2);
    c.fill();

    // Clip to eyeball for the large dark chocolate-brown pupil
    c.beginPath();
    c.ellipse(0, 0, rx, ry, 0.08, 0, Math.PI * 2);
    c.clip();

    c.fillStyle = '#362015';
    c.beginPath();
    c.ellipse(pupilDX, pupilDY, rx * 0.56, ry * 0.68, 0.06, 0, Math.PI * 2);
    c.fill();

    c.restore();
  };

  // Left eye (higher) & Right eye (slightly lower, matching head tilt)
  drawMidoriEye(cx - 22, h * 0.355, 13.2, 14.2, 3.8, -0.8);
  drawMidoriEye(cx + 21, h * 0.390, 13.2, 14.2, -3.4, -0.6);

  // 5. Cheerful Coral-Orange Open Smile with 3 Tiny White Teeth (開朗橘紅笑口 + 3顆小白牙)
  c.save();
  c.translate(cx - 3, h * 0.448);
  c.rotate(0.14);

  const mw = 13.0;
  const mh = 10.5;
  const traceSmile = () => {
    c.beginPath();
    c.moveTo(-mw, -mh * 0.35);
    c.quadraticCurveTo(0, -mh * 0.22, mw, -mh * 0.35);
    c.bezierCurveTo(mw * 1.02, mh * 0.65, mw * 0.45, mh * 0.95, 0, mh * 0.95);
    c.bezierCurveTo(-mw * 0.45, mh * 0.95, -mw * 1.02, mh * 0.65, -mw, -mh * 0.35);
    c.closePath();
  };

  traceSmile();
  const smileGrad = c.createLinearGradient(0, -mh * 0.3, 0, mh);
  smileGrad.addColorStop(0, '#d94b22');
  smileGrad.addColorStop(0.4, '#eb6034');
  smileGrad.addColorStop(1, '#f07146');
  c.fillStyle = smileGrad;
  c.fill();

  c.save();
  traceSmile();
  c.clip();

  // 3 Tiny White Teeth (2 top corners, 1 bottom-right)
  c.fillStyle = '#ffffff';
  // Top-left tooth
  c.beginPath();
  c.ellipse(-mw * 0.52, -mh * 0.25, 2.2, 2.6, 0, 0, Math.PI * 2);
  c.fill();
  // Top-right tooth
  c.beginPath();
  c.ellipse(mw * 0.52, -mh * 0.25, 2.2, 2.6, 0, 0, Math.PI * 2);
  c.fill();
  // Bottom-right tooth
  c.beginPath();
  c.ellipse(mw * 0.14, mh * 0.86, 2.1, 2.3, 0, 0, Math.PI * 2);
  c.fill();

  c.restore();

  // Subtle darker coral-brown upper lip outline
  c.strokeStyle = '#9e3519';
  c.lineWidth = 1.3;
  traceSmile();
  c.stroke();

  c.restore(); // smile
  c.restore(); // head clip
  c.restore();

  // 6. Signature Sculpted Pompadour Water-Wave Hair Crest (標誌性左上翹起水波浪花劉海)
  c.save();
  const traceWaveCrest = () => {
    c.beginPath();
    // Start at sharp upper-left wave tip!
    c.moveTo(cx - 48, h * 0.025);
    // Outer-left curve of the wave sweeping down and tucking into the forehead
    c.bezierCurveTo(cx - 68, h * 0.12, cx - 64, h * 0.25, cx - 34, h * 0.285);
    // Bottom overhang edge sweeping across forehead to the right temple
    c.bezierCurveTo(cx - 10, h * 0.305, cx + 16, h * 0.24, cx + 44, h * 0.245);
    // Rounded right cushion of the wave hair
    c.bezierCurveTo(cx + 52, h * 0.19, cx + 38, h * 0.11, cx + 10, h * 0.11);
    // Upper concave sweep curling up into the sharp upper-left wave peak
    c.bezierCurveTo(cx - 18, h * 0.11, cx - 36, h * 0.08, cx - 48, h * 0.025);
    c.closePath();
  };

  traceWaveCrest();
  const waveGrad = c.createLinearGradient(cx - 50, h * 0.04, cx + 20, h * 0.29);
  waveGrad.addColorStop(0, '#6ed6ec');
  waveGrad.addColorStop(0.45, '#8ce5f7');
  waveGrad.addColorStop(0.78, '#46bad4');
  waveGrad.addColorStop(1, '#1d96b3');
  c.fillStyle = waveGrad;
  c.fill();

  c.save();
  traceWaveCrest();
  c.clip();

  // Luminous pale-aqua / icy-white highlight band curving along the wave ridge
  c.strokeStyle = 'rgba(220, 250, 255, 0.78)';
  c.lineWidth = 11;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - 40, h * 0.13);
  c.bezierCurveTo(cx - 18, h * 0.19, cx + 12, h * 0.17, cx + 30, h * 0.18);
  c.stroke();

  c.restore(); // wave clip
  c.restore();

  // 7. Signature Sandy-Yellow Crossbody Bag with Water-Drop & Concentric Ripples (斜背水滴波紋小方包)
  c.save();
  // Crossbody Straps
  c.strokeStyle = '#cbb068';
  c.lineWidth = 2.6;
  c.lineCap = 'round';
  // Left vertical strap (up to left armpit)
  c.beginPath();
  c.moveTo(cx - 41, h * 0.585);
  c.lineTo(cx - 41, h * 0.67);
  c.stroke();
  // Long diagonal strap across chest to right shoulder
  c.beginPath();
  c.moveTo(cx - 6, h * 0.675);
  c.quadraticCurveTo(cx + 16, h * 0.59, cx + 41, h * 0.535);
  c.stroke();

  // 3D Bag Pouch rested on lower-left torso
  const bagX = cx - 25;
  const bagY = h * 0.745;
  c.translate(bagX, bagY);
  c.rotate(0.05);

  // Shaded 3D bottom/right gusset of the bag
  c.fillStyle = '#b5984e';
  c.beginPath();
  c.roundRect(-19, -18, 41, 41, 6);
  c.fill();

  // Main sandy-yellow front face of the bag
  const bagGrad = c.createLinearGradient(-20, -20, 18, 18);
  bagGrad.addColorStop(0, '#e6cf86');
  bagGrad.addColorStop(1, '#d4b96a');
  c.fillStyle = bagGrad;
  c.beginPath();
  c.roundRect(-21, -20, 39, 38, 5);
  c.fill();

  // Clip to front face of bag for the Water-Drop & 4 Concentric Ripple Rings Emblem
  c.save();
  c.beginPath();
  c.roundRect(-21, -20, 39, 38, 5);
  c.clip();

  // 4 Concentric circular cyan-blue ripple rings
  c.strokeStyle = '#259bb8';
  c.lineWidth = 1.15;
  for (const r of [4.8, 8.2, 11.6, 15.0]) {
    c.beginPath();
    c.arc(-1, 1, r, 0, Math.PI * 2);
    c.stroke();
  }

  // Bold cyan-blue Water Droplet icon in the center-top of the ripples
  c.fillStyle = '#0e8fb0';
  c.beginPath();
  c.moveTo(-1, -15);
  c.bezierCurveTo(-5.5, -7, -6.2, -1, -1, 2.5);
  c.bezierCurveTo(4.2, -1, 3.5, -7, -1, -15);
  c.closePath();
  c.fill();

  c.restore(); // bag face clip
  c.restore(); // bag transform

  // 8. Subtle Soft Chalk / Pastel Grain along Edges (Authentic Picture-Book Texture)
  c.save();
  for (let i = 0; i < 220; i++) {
    const gx = cx - 65 + rand() * 130;
    const gy = h * 0.06 + rand() * (h * 0.86);
    c.fillStyle = rand() > 0.5 ? 'rgba(255, 255, 255, 0.18)' : 'rgba(18, 128, 156, 0.12)';
    c.fillRect(gx, gy, 1.3, 1.3);
  }
  c.restore();

  waterSpiritCanvasCache = canvas;
  return canvas;
}

/**
 * Draw 米多力 (Midori - Faithful to Official Illustration)
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

  if (flipX) {
    ctx.scale(-1, 1);
  }

  const bob = isMoving ? Math.sin(walkCycle * 10) * 4 : Math.sin(walkCycle * 4) * 2.2;
  const squash = isMoving ? 1 + Math.sin(walkCycle * 10) * 0.035 : 1;

  // 1. Soft Luminous Aqua Halo & Ripple Aura
  const auraGrad = ctx.createRadialGradient(
    0,
    -baseHeight * 0.54 + bob,
    baseWidth * 0.1,
    0,
    -baseHeight * 0.54 + bob,
    baseWidth * 0.82
  );
  auraGrad.addColorStop(0, 'rgba(186, 230, 253, 0.52)');
  auraGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.22)');
  auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(0, -baseHeight * 0.54 + bob, baseWidth * 0.82, 0, Math.PI * 2);
  ctx.fill();

  // Water surface reflection & concentric ripple rings under Midori
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.72)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 1, baseWidth * (0.48 + Math.sin(walkCycle * 6) * 0.04), 5.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  const spriteCanvas = getWaterSpiritCanvas();
  if (spriteCanvas) {
    // Preserve the tall water-spirit aspect ratio of the official 米多力 illustration
    const drawW = baseWidth * 1.08 * squash;
    const drawH = Math.max(baseHeight * 1.16, baseWidth * 1.20) / squash;
    const drawX = -drawW / 2;
    const drawY = -drawH + bob + 2;

    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(spriteCanvas, drawX, drawY, drawW, drawH);

    // Wide Joyful Coral-Orange Smile & Water Ripple Catching Animation (米多力開朗張嘴淨化動作)
    if (isCatching) {
      const mouthX = -drawW * 0.015;
      const mouthY = drawY + drawH * 0.45;
      const mouthRx = drawW * 0.13;
      const mouthRy = drawH * 0.085;

      ctx.save();
      ctx.translate(mouthX, mouthY);
      ctx.rotate(0.12);

      const mGrad = ctx.createLinearGradient(0, -mouthRy, 0, mouthRy);
      mGrad.addColorStop(0, '#d9481e');
      mGrad.addColorStop(1, '#f26a3d');
      ctx.fillStyle = mGrad;
      ctx.strokeStyle = '#9e3519';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, mouthRx, mouthRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, mouthRx, mouthRy, 0, 0, Math.PI * 2);
      ctx.clip();

      // 3 Cute White Teeth inside wide-open joyful mouth
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-mouthRx * 0.48, -mouthRy * 0.78, mouthRx * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mouthRx * 0.48, -mouthRy * 0.78, mouthRx * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mouthRx * 0.15, mouthRy * 0.82, mouthRx * 0.20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Concentric water-droplet ripple rings pulsing out when Midori catches trash
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, mouthRx * 1.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, mouthRx * 2.35, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
    ctx.imageSmoothingEnabled = prevSmooth;
  }

  // Orbiting Pure Water Droplet Orbs around Midori
  for (let i = 0; i < 3; i++) {
    const ang = walkCycle * 4 + (i * Math.PI * 2) / 3;
    const ox = Math.cos(ang) * (baseWidth * 0.52);
    const oy = -baseHeight * 0.52 + Math.sin(ang * 1.5) * (baseHeight * 0.24) + bob;
    ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
    ctx.beginPath();
    ctx.arc(ox, oy, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ox - 1.1, oy - 1.1, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

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
 * Helper to draw a realistic 3D-shaded translucent glossy balloon with string
 */
function drawRealisticBalloon(
  ctx: CanvasRenderingContext2D,
  handX: number,
  handY: number,
  bx: number,
  by: number,
  rx: number,
  ry: number,
  color: string
) {
  ctx.save();
  // Swaying twine string
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.85)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.bezierCurveTo(
    handX + (bx - handX) * 0.3,
    handY - (handY - by) * 0.45,
    bx - 3,
    by + ry + 10,
    bx,
    by + ry + 2
  );
  ctx.stroke();

  // Balloon rubber knot at base
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(bx, by + ry - 1);
  ctx.lineTo(bx - 2.5, by + ry + 3);
  ctx.lineTo(bx + 2.5, by + ry + 3);
  ctx.closePath();
  ctx.fill();

  // 3D Volumetric Balloon Body
  ctx.beginPath();
  ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Radial 3D shading overlay
  const shadeGrad = ctx.createRadialGradient(bx - rx * 0.35, by - ry * 0.35, rx * 0.1, bx, by, ry * 1.1);
  shadeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  shadeGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
  shadeGrad.addColorStop(0.82, 'rgba(0, 0, 0, 0.22)');
  shadeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
  ctx.fillStyle = shadeGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(30, 20, 15, 0.55)';
  ctx.lineWidth = 1.0;
  ctx.stroke();

  // Crisp glossy window specular highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.ellipse(bx - rx * 0.36, by - ry * 0.36, rx * 0.22, ry * 0.14, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Helper to draw an articulated 2-segment human leg (thigh + calf + detailed footwear)
 */
function drawRealisticHumanLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  thighLen: number,
  calfLen: number,
  hipAngle: number,
  kneeBend: number,
  pantsColor: string,
  shoeColor: string,
  soleColor: string,
  legWidth: number,
  isShorts: boolean = false,
  skinColor: string = '#f1c29b'
) {
  const kneeX = hipX + Math.sin(hipAngle) * thighLen;
  const kneeY = hipY + Math.cos(hipAngle) * thighLen;
  const calfAngle = hipAngle - kneeBend;
  const ankleX = kneeX + Math.sin(calfAngle) * calfLen;
  const ankleY = kneeY + Math.cos(calfAngle) * calfLen;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isShorts) {
    // Exposed lower leg skin
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = legWidth * 0.78;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(ankleX, ankleY);
    ctx.stroke();

    // Crew sock
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = legWidth * 0.82;
    ctx.beginPath();
    ctx.moveTo(kneeX + (ankleX - kneeX) * 0.55, kneeY + (ankleY - kneeY) * 0.55);
    ctx.lineTo(ankleX, ankleY);
    ctx.stroke();

    // Shorts thigh segment
    ctx.strokeStyle = pantsColor;
    ctx.lineWidth = legWidth * 1.12;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.stroke();
  } else {
    // Full tailored trouser leg (thigh -> knee -> ankle)
    ctx.strokeStyle = pantsColor;
    ctx.lineWidth = legWidth;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(ankleX, ankleY);
    ctx.stroke();

    // Subtle fabric crease highlight along front of thigh
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(hipX + 1, hipY);
    ctx.lineTo(kneeX + 1, kneeY);
    ctx.stroke();
  }

  // Detailed Realistic Shoe / Sneaker at Ankle
  ctx.save();
  ctx.translate(ankleX, ankleY);
  ctx.rotate(-calfAngle * 0.35);

  // Shoe upper
  ctx.fillStyle = shoeColor;
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(-legWidth * 0.45, -2);
  ctx.lineTo(legWidth * 0.45, -2.5);
  ctx.quadraticCurveTo(legWidth * 1.25, -1, legWidth * 1.35, 2.2);
  ctx.lineTo(-legWidth * 0.5, 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shoe outsole & heel
  ctx.fillStyle = soleColor;
  ctx.fillRect(-legWidth * 0.5, 1.5, legWidth * 1.85, 1.8);

  ctx.restore();
  ctx.restore();
}

/**
 * Helper to draw an articulated 2-segment human arm (upper arm + forearm + realistic hand)
 */
function drawRealisticHumanArm(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  upperLen: number,
  foreLen: number,
  shoulderAngle: number,
  elbowFlex: number,
  sleeveColor: string,
  skinColor: string,
  armWidth: number,
  shortSleeve: boolean = false
): { handX: number; handY: number } {
  const elbowX = shoulderX + Math.sin(shoulderAngle) * upperLen;
  const elbowY = shoulderY + Math.cos(shoulderAngle) * upperLen;
  const foreAngle = shoulderAngle + elbowFlex;
  const handX = elbowX + Math.sin(foreAngle) * foreLen;
  const handY = elbowY + Math.cos(foreAngle) * foreLen;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (shortSleeve) {
    // Bare forearm
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = armWidth * 0.78;
    ctx.beginPath();
    ctx.moveTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Upper sleeve
    ctx.strokeStyle = sleeveColor;
    ctx.lineWidth = armWidth * 1.05;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.stroke();
  } else {
    // Full sleeve
    ctx.strokeStyle = sleeveColor;
    ctx.lineWidth = armWidth;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();
  }

  // Realistic Hand with thumb & fingers contour
  ctx.fillStyle = skinColor;
  ctx.strokeStyle = 'rgba(60, 35, 20, 0.55)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(handX, handY, armWidth * 0.48, armWidth * 0.38, -foreAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  return { handX, handY };
}

/**
 * Helper to draw a realistic side-profile / 3/4 human head with facial anatomy
 */
function drawRealisticHumanHead(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  radius: number,
  skinBase: string,
  skinShade: string,
  hairColor: string,
  hairStyle: 'parted' | 'tousled' | 'child_cap' | 'elder' | 'vendor_cap',
  capColor: string = '#dc2626',
  hasGlasses: boolean = false,
  hasHeadphones: boolean = false
) {
  ctx.save();
  ctx.translate(hx, hy);

  // 1. Neck with sternocleidomastoid shadow
  ctx.fillStyle = skinShade;
  ctx.beginPath();
  ctx.roundRect(-radius * 0.38, radius * 0.65, radius * 0.72, radius * 0.75, 2);
  ctx.fill();

  // 2. Sculpted Cranium & Jawline with 3D Skin Gradient
  const headGrad = ctx.createRadialGradient(radius * 0.25, -radius * 0.1, radius * 0.1, 0, 0, radius * 1.2);
  headGrad.addColorStop(0, skinBase);
  headGrad.addColorStop(1, skinShade);
  ctx.fillStyle = headGrad;
  ctx.strokeStyle = 'rgba(65, 38, 22, 0.65)';
  ctx.lineWidth = 0.9;

  ctx.beginPath();
  // Cranium -> forehead -> nose bridge -> nose tip -> philtrum/lips -> chin -> jawline -> back of head
  ctx.moveTo(-radius * 0.88, -radius * 0.2);
  ctx.bezierCurveTo(-radius * 0.92, -radius * 1.05, radius * 0.82, -radius * 1.05, radius * 0.90, -radius * 0.25);
  // Sculpted nose protrusion
  ctx.lineTo(radius * 1.12, radius * 0.08);
  ctx.lineTo(radius * 0.92, radius * 0.20);
  // Lips & Chin
  ctx.quadraticCurveTo(radius * 0.96, radius * 0.55, radius * 0.62, radius * 0.88);
  ctx.quadraticCurveTo(0, radius * 0.96, -radius * 0.58, radius * 0.68);
  ctx.quadraticCurveTo(-radius * 0.90, radius * 0.35, -radius * 0.88, -radius * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Subtle warm cheek blush
  ctx.fillStyle = 'rgba(239, 100, 100, 0.26)';
  ctx.beginPath();
  ctx.arc(radius * 0.42, radius * 0.28, radius * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // 3. Realistic Eye (Sclera, Iris, Pupil, Upper Lashes & Eyebrow)
  const ex = radius * 0.48;
  const ey = -radius * 0.08;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(ex, ey, radius * 0.22, radius * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e1b18';
  ctx.beginPath();
  ctx.arc(ex + radius * 0.05, ey, radius * 0.11, 0, Math.PI * 2);
  ctx.fill();

  // Eye catchlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ex + radius * 0.02, ey - radius * 0.04, radius * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Upper eyelid & eyebrow
  ctx.strokeStyle = '#292018';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(ex - radius * 0.22, ey - radius * 0.05);
  ctx.quadraticCurveTo(ex, ey - radius * 0.20, ex + radius * 0.24, ey - radius * 0.04);
  ctx.stroke();

  ctx.strokeStyle = hairColor;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(ex - radius * 0.24, ey - radius * 0.28);
  ctx.quadraticCurveTo(ex + radius * 0.05, ey - radius * 0.38, ex + radius * 0.28, ey - radius * 0.24);
  ctx.stroke();

  // Mouth line
  ctx.strokeStyle = 'rgba(140, 65, 55, 0.85)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(radius * 0.55, radius * 0.46);
  ctx.quadraticCurveTo(radius * 0.72, radius * 0.50, radius * 0.88, radius * 0.44);
  ctx.stroke();

  // Glasses (for Elder)
  if (hasGlasses) {
    ctx.strokeStyle = '#d97706';
    ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(ex + radius * 0.04, ey, radius * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex - radius * 0.22, ey);
    ctx.lineTo(-radius * 0.2, ey - radius * 0.05);
    ctx.stroke();
  }

  // 4. Ear with inner helix shadow
  ctx.fillStyle = skinBase;
  ctx.strokeStyle = 'rgba(65, 38, 22, 0.6)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(-radius * 0.18, radius * 0.08, radius * 0.18, radius * 0.26, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Detailed Sculpted Hairstyles & Headwear
  ctx.fillStyle = hairColor;
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 0.9;

  if (hairStyle === 'parted') {
    // Layered side-parted hair with realistic volume and temple taper
    ctx.beginPath();
    ctx.moveTo(-radius * 0.94, radius * 0.28);
    ctx.bezierCurveTo(-radius * 1.12, -radius * 0.55, -radius * 0.65, -radius * 1.25, radius * 0.15, -radius * 1.18);
    ctx.bezierCurveTo(radius * 0.85, -radius * 1.15, radius * 1.12, -radius * 0.65, radius * 0.95, -radius * 0.32);
    ctx.quadraticCurveTo(radius * 0.35, -radius * 0.55, -radius * 0.08, -radius * 0.28);
    ctx.lineTo(-radius * 0.18, radius * 0.08);
    ctx.quadraticCurveTo(-radius * 0.45, -radius * 0.10, -radius * 0.62, radius * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glossy hair strand highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -radius * 0.35, radius * 0.68, Math.PI * 1.15, Math.PI * 1.75);
    ctx.stroke();
  } else if (hairStyle === 'tousled') {
    // Textured tousled youth hair
    ctx.beginPath();
    ctx.moveTo(-radius * 0.95, radius * 0.25);
    ctx.bezierCurveTo(-radius * 1.18, -radius * 0.65, -radius * 0.55, -radius * 1.32, radius * 0.22, -radius * 1.24);
    ctx.bezierCurveTo(radius * 0.95, -radius * 1.18, radius * 1.22, -radius * 0.55, radius * 1.05, -radius * 0.22);
    ctx.quadraticCurveTo(radius * 0.55, -radius * 0.42, radius * 0.12, -radius * 0.25);
    ctx.quadraticCurveTo(-radius * 0.35, -radius * 0.45, -radius * 0.68, radius * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (hairStyle === 'elder') {
    // Neatly combed silver hair at sides & back + mustache
    ctx.beginPath();
    ctx.moveTo(-radius * 0.92, radius * 0.32);
    ctx.bezierCurveTo(-radius * 1.08, -radius * 0.45, -radius * 0.55, -radius * 1.05, radius * 0.25, -radius * 0.98);
    ctx.quadraticCurveTo(-radius * 0.15, -radius * 0.65, -radius * 0.32, -radius * 0.05);
    ctx.lineTo(-radius * 0.62, radius * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Silver mustache
    ctx.beginPath();
    ctx.ellipse(radius * 0.74, radius * 0.35, radius * 0.26, radius * 0.11, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (hairStyle === 'child_cap') {
    // Soft hair locks under baseball cap
    ctx.beginPath();
    ctx.arc(-radius * 0.35, -radius * 0.1, radius * 0.62, Math.PI * 0.6, Math.PI * 1.5);
    ctx.fill();

    // Fitted Baseball Cap Dome
    ctx.fillStyle = capColor;
    ctx.beginPath();
    ctx.arc(0, -radius * 0.25, radius * 0.96, Math.PI * 0.95, Math.PI * 2.02);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Curved Cap Visor Brim
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(radius * 0.65, -radius * 0.35);
    ctx.quadraticCurveTo(radius * 1.55, -radius * 0.38, radius * 1.62, -radius * 0.15);
    ctx.quadraticCurveTo(radius * 1.15, -radius * 0.18, radius * 0.55, -radius * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (hairStyle === 'vendor_cap') {
    // Vintage Tweed Flat Cap (報童帽)
    ctx.beginPath();
    ctx.arc(-radius * 0.35, 0, radius * 0.62, Math.PI * 0.65, Math.PI * 1.4);
    ctx.fill();

    ctx.fillStyle = '#57534e';
    ctx.beginPath();
    ctx.moveTo(-radius * 1.02, -radius * 0.28);
    ctx.bezierCurveTo(-radius * 0.95, -radius * 1.18, radius * 0.75, -radius * 1.15, radius * 1.25, -radius * 0.32);
    ctx.quadraticCurveTo(radius * 1.52, -radius * 0.22, radius * 1.45, -radius * 0.12);
    ctx.lineTo(-radius * 0.95, -radius * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Studio Over-Ear Headphones (for Teen)
  if (hasHeadphones) {
    // Headband arch
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(-radius * 0.08, -radius * 0.15, radius * 1.02, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Padded 3D Earcup over ear
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(-radius * 0.15, radius * 0.06, radius * 0.32, radius * 0.42, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(-radius * 0.15, radius * 0.06, radius * 0.16, radius * 0.24, -0.1, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw Pedestrians on the Bridge (High-Definition Realistic Articulated Figures & Animals)
 */
export function drawPedestrian(ctx: CanvasRenderingContext2D, p: Pedestrian) {
  ctx.save();
  ctx.translate(Math.floor(p.x), Math.floor(p.y));
  // Flip horizontally according to walking direction
  ctx.scale(p.direction, 1);

  const phase = p.walkFrame * 7.5;
  const stride = Math.sin(phase);
  const counterStride = -stride;
  const bob = Math.abs(Math.cos(phase)) * 2.2;

  // Natural knee flexion during forward/backward leg swing
  const frontKnee = Math.max(0, Math.cos(phase)) * 0.42 + 0.08;
  const backKnee = Math.max(0, -Math.cos(phase)) * 0.42 + 0.08;

  // Contact shadow on bridge deck
  const drawGroundShadow = (rx: number, ox: number = 0) => {
    const shGrad = ctx.createRadialGradient(ox, 1, 2, ox, 1, rx);
    shGrad.addColorStop(0, 'rgba(20, 14, 8, 0.48)');
    shGrad.addColorStop(1, 'rgba(20, 14, 8, 0)');
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(ox, 1, rx, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  switch (p.type) {
    // 1. 寫實復古木製攤車與職人攤販 (Artisan Street Vendor pushing Vintage Wooden Cart)
    case 'cart': {
      drawGroundShadow(36, 4);
      const cartBob = Math.sin(phase * 1.2) * 0.9;

      // --- A. Realistic Vendor Figure Walking Behind Cart (x ≈ -24) ---
      const vx = -24;
      const hipY = -22 - bob * 0.8;
      const shoulderY = -42 - bob * 0.8;

      // Back Leg
      drawRealisticHumanLeg(ctx, vx - 1, hipY, 11, 10, counterStride * 0.42, backKnee, '#1e293b', '#451a03', '#1c1917', 5.2);
      // Back Arm reaching to cart handle
      drawRealisticHumanArm(ctx, vx + 1, shoulderY + 2, 9, 9, 0.55, 0.55, '#f8fafc', '#e6b891', 4.4);

      // Vendor Torso (White rolled-sleeve shirt + Barista/Artisan Canvas Apron)
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.roundRect(vx - 6, shoulderY, 12, 21, 4);
      ctx.fill();
      ctx.stroke();

      // Canvas Apron
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(vx - 4.5, shoulderY + 4, 9.5, 18, 2);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.stroke();

      // Front Leg
      drawRealisticHumanLeg(ctx, vx, hipY, 11, 10, stride * 0.42, frontKnee, '#334155', '#5c2406', '#1c1917', 5.4);
      // Front Arm gripping cart handle
      drawRealisticHumanArm(ctx, vx, shoulderY + 2, 9, 9, 0.48, 0.52, '#f8fafc', '#f3c6a0', 4.6, true);

      // Vendor Head with Vintage Flat Cap
      drawRealisticHumanHead(ctx, vx + 1, shoulderY - 7, 6.2, '#f5cba7', '#d9a47e', '#3b2818', 'vendor_cap');

      // --- B. Artisanal Vintage Wooden Street-Food Cart (x ≈ -6 .. +34) ---
      const cx = 14;
      const cy = -12 + cartBob;

      // Curved Iron Push Handles connected to vendor hands
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 8);
      ctx.quadraticCurveTo(cx - 24, cy - 15, vx + 12, shoulderY + 11);
      ctx.stroke();

      // Back Spoked Wheel
      const wheelRot = p.walkFrame * 5;
      const drawSpokedWheel = (wx: number, wy: number, r: number, isFront: boolean) => {
        ctx.save();
        ctx.translate(wx, wy);
        ctx.rotate(wheelRot);
        // Iron outer rim & wooden wheel fellow
        ctx.strokeStyle = isFront ? '#292524' : '#1c1917';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = isFront ? '#b45309' : '#78350f';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, r - 1.2, 0, Math.PI * 2);
        ctx.stroke();

        // 8 Wooden Spokes
        ctx.lineWidth = 1.2;
        for (let s = 0; s < 4; s++) {
          const a = (s * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(-Math.cos(a) * r, -Math.sin(a) * r);
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          ctx.stroke();
        }
        // Brass hubcap
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawSpokedWheel(cx - 8, -9, 8.5, false);

      // Mahogany Wooden Cart Body with paneled carpentry
      const woodGrad = ctx.createLinearGradient(cx - 18, cy - 18, cx + 18, cy);
      woodGrad.addColorStop(0, '#b45309');
      woodGrad.addColorStop(0.5, '#92400e');
      woodGrad.addColorStop(1, '#652b0d');
      ctx.fillStyle = woodGrad;
      ctx.strokeStyle = '#3b1806';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(cx - 18, cy - 18, 36, 17, 2.5);
      ctx.fill();
      ctx.stroke();

      // Recessed decorative wood panels & brass corner brackets
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(cx - 14, cy - 15, 12, 11);
      ctx.strokeRect(cx + 2, cy - 15, 12, 11);

      // Glass Pastry / Snack Display Case on Countertop
      ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2;
      ctx.fillRect(cx - 14, cy - 28, 28, 10);
      ctx.strokeRect(cx - 14, cy - 28, 28, 10);

      // Golden pastries/snacks inside display
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx - 7, cy - 21, 3, 0, Math.PI * 2);
      ctx.arc(cx, cy - 21, 3, 0, Math.PI * 2);
      ctx.arc(cx + 7, cy - 21, 3, 0, Math.PI * 2);
      ctx.fill();

      // Brass Canopy Support Poles
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 18);
      ctx.lineTo(cx - 15, cy - 42);
      ctx.moveTo(cx + 15, cy - 18);
      ctx.lineTo(cx + 15, cy - 42);
      ctx.stroke();

      // Striped Scalloped Awning Canopy
      const stripeCount = 6;
      const canopyW = 38;
      const stripeW = canopyW / stripeCount;
      for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? p.color : '#fffbeb';
        const sx = cx - canopyW / 2 + i * stripeW;
        ctx.beginPath();
        ctx.moveTo(sx + 2, cy - 48);
        ctx.lineTo(sx + stripeW - (i === stripeCount - 1 ? 2 : 0), cy - 48);
        ctx.lineTo(sx + stripeW, cy - 39);
        ctx.arc(sx + stripeW / 2, cy - 39, stripeW / 2, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Front Spoked Wheel
      drawSpokedWheel(cx + 6, -9, 9.0, true);

      // Festive 3D Glossy Balloon tied to front canopy pole
      if (p.balloonColor) {
        drawRealisticBalloon(
          ctx,
          cx + 15,
          cy - 44,
          cx + 20 + Math.sin(phase * 0.5) * 3,
          cy - 78 + cartBob * 0.6,
          10,
          12.5,
          p.balloonColor
        );
      }
      break;
    }

    // 2. 寫實柴犬 / 黃金獵犬 (Realistic Articulated Shiba Inu / Golden Retriever)
    case 'dog': {
      drawGroundShadow(22, 0);
      const dogBob = Math.sin(phase * 1.6) * 1.6;
      const trot = Math.sin(phase * 1.6);

      // Helper for 2-segment canine leg + paw
      const drawCanineLeg = (lx: number, ly: number, swing: number, isBack: boolean, furHex: string, pawHex: string) => {
        const kneeX = lx + Math.sin(swing) * 6;
        const kneeY = ly + 6.5;
        const pawX = kneeX + Math.sin(swing - 0.25) * 6;
        const pawY = 0;

        ctx.save();
        ctx.strokeStyle = furHex;
        ctx.lineWidth = isBack ? 3.6 : 4.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(pawX, pawY - 1.5);
        ctx.stroke();

        // White sock & paw pad
        ctx.fillStyle = pawHex;
        ctx.beginPath();
        ctx.ellipse(pawX + 1.2, pawY - 1.2, 2.8, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // Far-side legs (darker shaded tone)
      drawCanineLeg(-10, -12 + dogBob, -trot * 0.55, true, '#9a5216', '#e7e5e4');
      drawCanineLeg(9, -12 + dogBob, trot * 0.55, true, '#9a5216', '#e7e5e4');

      // Plush Curled Wagging Tail
      const tailWag = Math.sin(p.walkFrame * 16) * 0.25;
      ctx.save();
      ctx.translate(-14, -17 + dogBob);
      ctx.rotate(tailWag);
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.bezierCurveTo(-10, -4, -11, -14, -3, -14);
      ctx.bezierCurveTo(2, -14, 3, -6, 1, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Cream inner tail tip
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(-4, -10, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Anatomical Canine Torso (Deep chest & tucked waist with dorsal-to-belly fur gradient)
      const bodyGrad = ctx.createLinearGradient(0, -22 + dogBob, 0, -8 + dogBob);
      bodyGrad.addColorStop(0, '#c26a1b');
      bodyGrad.addColorStop(0.65, '#e08a38');
      bodyGrad.addColorStop(1, '#fef3c7');
      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = '#5c2d0c';
      ctx.lineWidth = 1.1;

      ctx.beginPath();
      ctx.moveTo(-14, -16 + dogBob);
      ctx.bezierCurveTo(-8, -21 + dogBob, 6, -21 + dogBob, 13, -19 + dogBob);
      ctx.bezierCurveTo(17, -15 + dogBob, 15, -8 + dogBob, 9, -8 + dogBob);
      ctx.bezierCurveTo(2, -8 + dogBob, -6, -10 + dogBob, -12, -10 + dogBob);
      ctx.quadraticCurveTo(-16, -12 + dogBob, -14, -16 + dogBob);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Near-side legs (brighter sunlit tone)
      drawCanineLeg(-9, -12 + dogBob, trot * 0.55, false, '#d97706', '#fffbeb');
      drawCanineLeg(10, -12 + dogBob, -trot * 0.55, false, '#d97706', '#fffbeb');

      // Red Leather Collar & Shiny Gold Bell at Neck
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(9, -20 + dogBob);
      ctx.lineTo(14, -13 + dogBob);
      ctx.stroke();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(14.5, -12.5 + dogBob, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Sculpted Canine Head, Muzzle, Urajiro Cream Cheek & Perky Ears
      const hx = 15;
      const hy = -23 + dogBob * 1.1;

      // Back ear
      ctx.fillStyle = '#9a5216';
      ctx.beginPath();
      ctx.moveTo(hx - 1, hy - 5);
      ctx.lineTo(hx + 2, hy - 12);
      ctx.lineTo(hx + 5, hy - 5);
      ctx.closePath();
      ctx.fill();

      // Cranium & tapering snout
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#5c2d0c';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(hx - 6, hy - 2);
      ctx.bezierCurveTo(hx - 6, hy - 9, hx + 5, hy - 9, hx + 7, hy - 3);
      // Snout bridge
      ctx.lineTo(hx + 12.5, hy - 1.5);
      ctx.quadraticCurveTo(hx + 13, hy + 2.5, hx + 8, hy + 3.2);
      ctx.quadraticCurveTo(hx + 2, hy + 4.5, hx - 5, hy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cream Urajiro lower cheek & muzzle marking
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.moveTo(hx + 1, hy + 0.5);
      ctx.quadraticCurveTo(hx + 7, hy - 0.5, hx + 11.5, hy + 0.5);
      ctx.quadraticCurveTo(hx + 8, hy + 3.5, hx + 1, hy + 3.2);
      ctx.closePath();
      ctx.fill();

      // Front triangular ear with pink/cream inner concha
      ctx.fillStyle = '#c26a1b';
      ctx.beginPath();
      ctx.moveTo(hx - 4, hy - 4);
      ctx.lineTo(hx - 1, hy - 12.5);
      ctx.lineTo(hx + 3, hy - 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wet black nose & expressive dark eye with catchlight
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(hx + 12, hy - 1, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(hx + 4.8, hy - 2.5, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx + 4.4, hy - 3.0, 0.65, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 3. 寫實孩童與立體光澤氣球 (Realistic Child with Backpack, Cap, Puffer Vest & 3D Balloon)
    case 'child': {
      drawGroundShadow(13);
      const hipY = -18 - bob;
      const shoulderY = -34 - bob;

      // Back Leg (Denim shorts + striped crew sock + sneaker)
      drawRealisticHumanLeg(ctx, -1, hipY, 8.5, 8.5, counterStride * 0.52, backKnee, '#1d4ed8', '#dc2626', '#f8fafc', 4.6, true, '#eab68c');

      // Back Arm swinging
      drawRealisticHumanArm(ctx, -1, shoulderY + 2, 7.5, 7, counterStride * 0.45, 0.35, '#f8fafc', '#eab68c', 3.8);

      // School Backpack on back
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.roundRect(-9.5, shoulderY + 1, 6.5, 13, 2.5);
      ctx.fill();
      ctx.stroke();

      // Quilted Puffer Vest over Striped Shirt Torso
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.roundRect(-5.5, shoulderY, 11, 17, 3.5);
      ctx.fill();
      ctx.stroke();

      // Puffer vest horizontal quilt stitch lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.moveTo(-5, shoulderY + 5.5);
      ctx.lineTo(5, shoulderY + 5.5);
      ctx.moveTo(-5, shoulderY + 11);
      ctx.lineTo(5, shoulderY + 11);
      ctx.stroke();

      // Front Leg
      drawRealisticHumanLeg(ctx, 0.5, hipY, 8.5, 8.5, stride * 0.52, frontKnee, '#2563eb', '#ef4444', '#ffffff', 4.8, true, '#f5cba7');

      // Front Arm raised holding balloon string
      const frontHand = drawRealisticHumanArm(ctx, 0.5, shoulderY + 2, 7.5, 7.5, 0.38, 0.65, '#f8fafc', '#f5cba7', 4.0);

      // Child Head with Baseball Cap
      drawRealisticHumanHead(ctx, 0.5, shoulderY - 6.5, 6.2, '#f8d5b8', '#dfb18b', '#451a03', 'child_cap', '#e11d48');

      // High-flying 3D Translucent Glossy Balloon
      if (p.balloonColor) {
        drawRealisticBalloon(
          ctx,
          frontHand.handX,
          frontHand.handY,
          -4 + Math.sin(phase * 0.5) * 3,
          shoulderY - 52 + bob * 0.5,
          10.5,
          13,
          p.balloonColor
        );
      }
      break;
    }

    // 4. 寫實儒雅長者 (Realistic Elderly Gentleman with Glasses, Tweed Jacket, Cardigan & Crook Cane)
    case 'elder': {
      drawGroundShadow(15, 2);
      const elderBob = bob * 0.65;
      const hipY = -22 - elderBob;
      const shoulderY = -43 - elderBob;

      // Back Leg (Pleated wool slacks + leather loafer)
      drawRealisticHumanLeg(ctx, -1.5, hipY, 11, 10.5, counterStride * 0.32, backKnee * 0.7, '#44403c', '#292524', '#1c1917', 5.2);

      // Back Arm
      drawRealisticHumanArm(ctx, -1, shoulderY + 3, 9.5, 9, counterStride * 0.28, 0.3, '#57534e', '#e5c1a1', 4.4);

      // Slightly stooped Tweed Jacket & Warm Burgundy/Amber Cardigan Vest
      ctx.save();
      ctx.translate(0, hipY);
      ctx.rotate(0.09); // Natural gentle forward posture
      ctx.fillStyle = '#78716c';
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.roundRect(-6.5, -22, 13, 23, 4);
      ctx.fill();
      ctx.stroke();

      // Inner warm knit sweater vest & white shirt collar
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(1, -21);
      ctx.lineTo(6.2, -21);
      ctx.lineTo(6.2, -3);
      ctx.lineTo(1, -3);
      ctx.closePath();
      ctx.fill();

      // Jacket lapel
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(1, -21);
      ctx.lineTo(5.5, -11);
      ctx.stroke();
      ctx.restore();

      // Front Leg
      drawRealisticHumanLeg(ctx, 0, hipY, 11, 10.5, stride * 0.32, frontKnee * 0.7, '#57534e', '#451a03', '#1c1917', 5.5);

      // Front Arm extended forward gripping carved wooden walking cane
      const caneHand = drawRealisticHumanArm(ctx, 1.5, shoulderY + 3, 9.5, 9, 0.35 + stride * 0.12, 0.42, '#78716c', '#f1cfaec', 4.6);

      // Carved Wooden Crook Cane with Brass Collar & Rubber Ferrule
      ctx.save();
      const caneTipX = caneHand.handX + 3.5 - stride * 2.5;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // Curved crook handle
      ctx.arc(caneHand.handX - 0.5, caneHand.handY, 2.8, Math.PI, 0, false);
      ctx.lineTo(caneTipX, -1);
      ctx.stroke();
      // Brass collar ring
      ctx.fillStyle = '#eab308';
      ctx.fillRect(caneHand.handX + 1.2, caneHand.handY + 3, 2.4, 1.8);
      // Rubber tip
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(caneTipX - 1.2, -2.2, 2.4, 2.2);
      ctx.restore();

      // Elder Head with Silver Hair, Mustache & Spectacles
      drawRealisticHumanHead(ctx, 2.2, shoulderY - 6.5, 6.4, '#f3d1b3', '#d6ae8b', '#e7e5e4', 'elder', '', true, false);
      break;
    }

    // 5. 寫實潮流青年 (Realistic Streetwear Youth with Studio Headphones, Hoodie, Cargo Pants & Smartphone)
    case 'teen': {
      drawGroundShadow(15);
      const hipY = -23 - bob;
      const shoulderY = -45 - bob;

      // Back Leg (Olive/Slate Cargo Pants + Two-Tone High-Top Sneaker)
      drawRealisticHumanLeg(ctx, -1, hipY, 11.5, 11, counterStride * 0.48, backKnee, '#334155', '#e2e8f0', '#0284c7', 5.6);

      // Back Arm swinging
      drawRealisticHumanArm(ctx, -1, shoulderY + 2, 10, 9.5, counterStride * 0.42, 0.28, p.color, '#eab68c', 4.8);

      // Layered White Undershirt Hem peeking below hoodie
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-6.2, hipY - 2.5, 12.4, 3.5);

      // Oversized Streetwear Hoodie Torso with Draped Hood, Drawstrings & Kangaroo Pocket
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.roundRect(-6.8, shoulderY, 13.6, 22, 4.5);
      ctx.fill();
      ctx.stroke();

      // Draped hood at back of neck
      ctx.beginPath();
      ctx.ellipse(-4.5, shoulderY + 1, 5.2, 3.5, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Kangaroo front pocket & white drawstrings
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.moveTo(-2, hipY - 9);
      ctx.lineTo(5.8, hipY - 9);
      ctx.lineTo(6.4, hipY - 2);
      ctx.lineTo(-3.5, hipY - 2);
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(3.5, shoulderY + 2);
      ctx.lineTo(4.2, shoulderY + 9);
      ctx.moveTo(5.2, shoulderY + 2);
      ctx.lineTo(5.8, shoulderY + 8.5);
      ctx.stroke();

      // Front Leg
      drawRealisticHumanLeg(ctx, 0.5, hipY, 11.5, 11, stride * 0.48, frontKnee, '#475569', '#ffffff', '#ef4444', 5.8);

      // Front Arm bent holding Smartphone
      const phoneHand = drawRealisticHumanArm(ctx, 0.5, shoulderY + 3, 10, 9.5, 0.15, 0.85, p.color, '#f5cba7', 5.0);

      // Sleek Smartphone with glowing screen in hand
      ctx.save();
      ctx.translate(phoneHand.handX + 2.2, phoneHand.handY - 2);
      ctx.rotate(-0.45);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-1.5, -3.5, 3, 6.5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-0.8, -3.0, 2, 5.2);
      ctx.restore();

      // Teen Head with Tousled Hair & Over-Ear Studio Headphones
      drawRealisticHumanHead(ctx, 0.8, shoulderY - 7, 6.4, '#f8d5b8', '#dfb18b', '#ca8a04', 'tousled', '', false, true);
      break;
    }

    // 6. 寫實都市上班族 / 行人 (Realistic Commuter in Tailored Trench Coat with Briefcase & Coffee Cup)
    case 'adult':
    default: {
      drawGroundShadow(16);
      const hipY = -24 - bob;
      const shoulderY = -47 - bob;

      // Back Leg (Tailored Charcoal Slacks + Brown Leather Oxford Shoe)
      drawRealisticHumanLeg(ctx, -1, hipY, 12, 11.5, counterStride * 0.45, backKnee, '#1e293b', '#451a03', '#1c1917', 5.5);

      // Back Arm carrying Structured Leather Briefcase
      const bagHand = drawRealisticHumanArm(ctx, -1, shoulderY + 2.5, 10.5, 10, counterStride * 0.35, 0.22, p.color, '#eab68c', 4.6);

      // Leather Briefcase / Messenger Bag in back hand
      ctx.save();
      ctx.translate(bagHand.handX, bagHand.handY + 2);
      ctx.rotate(counterStride * 0.18);
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#291507';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.roundRect(-7, 0, 14, 10, 2);
      ctx.fill();
      ctx.stroke();
      // Brass clasps
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-4, 2.5, 1.8, 2.2);
      ctx.fillRect(2.2, 2.5, 1.8, 2.2);
      ctx.restore();

      // Tailored Trench Coat / Blazer Torso with Collar, Lapels, Tie & Waist Belt
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-6.5, shoulderY);
      ctx.lineTo(6.5, shoulderY);
      ctx.lineTo(7.8, hipY + 5);
      ctx.lineTo(-7.5, hipY + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crisp White Dress Shirt V-Neck & Red Silk Tie
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(1.5, shoulderY);
      ctx.lineTo(6.2, shoulderY);
      ctx.lineTo(4.2, shoulderY + 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(3.8, shoulderY + 1);
      ctx.lineTo(5.2, shoulderY + 1);
      ctx.lineTo(4.5, shoulderY + 9);
      ctx.closePath();
      ctx.fill();

      // Trench Coat Lapel, Buttons & Waist Belt
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(-6.8, shoulderY + 14, 13.8, 2.6);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(1.5, shoulderY + 13.6, 2.5, 3.4); // Belt buckle

      // Front Leg
      drawRealisticHumanLeg(ctx, 0.5, hipY, 12, 11.5, stride * 0.45, frontKnee, '#334155', '#5c2406', '#1c1917', 5.8);

      // Front Arm bent holding Takeaway Coffee Cup
      const cupHand = drawRealisticHumanArm(ctx, 0.5, shoulderY + 3, 10.5, 9.5, 0.18, 0.78, p.color, '#f5cba7', 4.8);

      // Realistic Takeaway Coffee Cup with Kraft Sleeve & White Dome Lid
      ctx.save();
      ctx.translate(cupHand.handX + 2.5, cupHand.handY - 1.5);
      // Cup body
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-2.6, -4);
      ctx.lineTo(2.6, -4);
      ctx.lineTo(2.0, 3.5);
      ctx.lineTo(-2.0, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Kraft cardboard sleeve
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-2.3, -1.8, 4.6, 3.2);
      // White dome lid
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3.0, -5.4, 6.0, 1.6);
      ctx.strokeRect(-3.0, -5.4, 6.0, 1.6);
      ctx.restore();

      // Adult Head with Parted Layered Hair
      drawRealisticHumanHead(ctx, 0.8, shoulderY - 7.5, 6.6, '#f8d5b8', '#dfb18b', '#292018', 'parted');
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
