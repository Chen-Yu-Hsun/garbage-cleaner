/**
 * 2D Pixel Art Sprites & Procedural Renderers
 * Pure canvas pixel art drawing routines optimized for 60fps retro graphics.
 */

import { TrashType, WaterQuality, Pedestrian } from '../types/game';

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

let mossMonsterCanvasCache: HTMLCanvasElement | null = null;

function getMossMonsterCanvas(): HTMLCanvasElement {
  if (mossMonsterCanvasCache) return mossMonsterCanvasCache;
  if (typeof document === 'undefined') return null as any;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 38;
  const cCtx = canvas.getContext('2d');
  if (cCtx) {
    for (let y = 0; y < MOSS_SPRITE_DATA.length; y++) {
      const row = MOSS_SPRITE_DATA[y];
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        const color = MOSS_PALETTE[char];
        if (color && color !== 'transparent') {
          cCtx.fillStyle = color;
          cCtx.fillRect(x, y, 1, 1);
        }
      }
    }
  }
  mossMonsterCanvasCache = canvas;
  return canvas;
}

/**
 * Draw 醜泥怪 (Mud Monster)
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
  isFlashing: boolean
) {
  ctx.save();
  ctx.translate(Math.floor(centerX), Math.floor(bottomY));

  // If flashing during transformation
  if (isFlashing) {
    ctx.filter = 'brightness(1.8) contrast(1.4)';
  }

  const bob = isMoving ? Math.sin(walkCycle * 8) * 3 : Math.sin(walkCycle * 3) * 1.5;
  const squash = isMoving ? 1 + Math.sin(walkCycle * 8) * 0.05 : 1;

  // Shadow under monster
  ctx.fillStyle = 'rgba(20, 32, 16, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 0, baseWidth * 0.42, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const spriteCanvas = getMossMonsterCanvas();
  if (spriteCanvas) {
    const drawW = baseWidth * squash;
    const drawH = baseHeight / squash;
    const drawX = -drawW / 2;
    const drawY = -drawH + bob;

    // Nearest-neighbor rendering for pure crisp pixel edges
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spriteCanvas, drawX, drawY, drawW, drawH);

    // If catching, render animated mouth open
    if (isCatching) {
      ctx.fillStyle = '#a32c27';
      ctx.fillRect(drawX + drawW * 0.42, drawY + drawH * 0.41, drawW * 0.16, drawH * 0.09);
      ctx.fillStyle = '#f2efdf';
      ctx.fillRect(drawX + drawW * 0.45, drawY + drawH * 0.40, drawW * 0.1, drawH * 0.025);
    }
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
  if (typeof document === 'undefined') return null as any;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 38;
  const cCtx = canvas.getContext('2d');
  if (cCtx) {
    for (let y = 0; y < WATER_SPIRIT_SPRITE_DATA.length; y++) {
      const row = WATER_SPIRIT_SPRITE_DATA[y];
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        const color = WATER_SPIRIT_PALETTE[char];
        if (color && color !== 'transparent') {
          cCtx.fillStyle = color;
          cCtx.fillRect(x, y, 1, 1);
        }
      }
    }
  }
  waterSpiritCanvasCache = canvas;
  return canvas;
}

/**
 * Draw 米多力 (Midori - Divine Clean River Spirit)
 */
export function drawMidori(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  bottomY: number,
  baseWidth: number,
  baseHeight: number,
  isMoving: boolean,
  walkCycle: number,
  isCatching: boolean
) {
  ctx.save();
  ctx.translate(Math.floor(centerX), Math.floor(bottomY));

  const bob = isMoving ? Math.sin(walkCycle * 10) * 4 : Math.sin(walkCycle * 4) * 2;
  const squash = isMoving ? 1 + Math.sin(walkCycle * 10) * 0.05 : 1;

  // Outer Divine Water Aura / Glow
  const auraGradient = ctx.createRadialGradient(0, -baseHeight * 0.5 + bob, baseWidth * 0.2, 0, -baseHeight * 0.5 + bob, baseWidth * 0.75);
  auraGradient.addColorStop(0, 'rgba(100, 197, 218, 0.6)');
  auraGradient.addColorStop(0.5, 'rgba(39, 142, 165, 0.3)');
  auraGradient.addColorStop(1, 'rgba(188, 235, 245, 0)');
  ctx.fillStyle = auraGradient;
  ctx.beginPath();
  ctx.arc(0, -baseHeight * 0.5 + bob, baseWidth * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Shadow under Midori
  ctx.fillStyle = 'rgba(22, 105, 122, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 0, baseWidth * 0.42, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const spriteCanvas = getWaterSpiritCanvas();
  if (spriteCanvas) {
    const drawW = baseWidth * squash;
    const drawH = baseHeight / squash;
    const drawX = -drawW / 2;
    const drawY = -drawH + bob;

    // Nearest-neighbor crisp pixel rendering
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spriteCanvas, drawX, drawY, drawW, drawH);

    // If catching, render joyful mouth glow
    if (isCatching) {
      ctx.fillStyle = '#eb6536';
      ctx.fillRect(drawX + drawW * 0.42, drawY + drawH * 0.48, drawW * 0.16, drawH * 0.08);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(drawX + drawW * 0.46, drawY + drawH * 0.47, drawW * 0.08, drawH * 0.02);
    }
  }

  // Pure clean water sparkling particles
  ctx.fillStyle = '#bcebf5';
  const p1 = Math.sin(walkCycle * 8) * 12;
  const p2 = Math.cos(walkCycle * 7) * 12;
  ctx.fillRect(-baseWidth * 0.45 + p1, -baseHeight * 0.6, 4, 4);
  ctx.fillRect(baseWidth * 0.45 - p2, -baseHeight * 0.4, 4, 4);
  ctx.fillRect(0, -baseHeight - 6 + p1, 5, 5);

  ctx.restore();
}

/**
 * Draw 6 types of Trash items (T01 - T06)
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

  switch (type) {
    // T01: 菸蒂 (Cigarette butt)
    case 'T01': {
      // White paper body
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-halfW * 0.6, -halfH, halfW * 1.2, halfH * 1.2);
      // Yellow filter
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-halfW * 0.6, halfH * 0.2, halfW * 1.2, halfH * 0.8);
      // Burned ash tip
      ctx.fillStyle = '#475569';
      ctx.fillRect(-halfW * 0.6, -halfH, halfW * 1.2, halfH * 0.35);
      // Glowing red ember
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-halfW * 0.3, -halfH - 2, halfW * 0.6, 3);
      break;
    }

    // T02: 寶特瓶 (PET bottle)
    case 'T02': {
      // Cyan translucent bottle body
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-halfW * 0.65, -halfH * 0.4, halfW * 1.3, halfH * 1.35);
      // Bottle neck
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-halfW * 0.35, -halfH * 0.8, halfW * 0.7, halfH * 0.45);
      // Blue cap
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(-halfW * 0.4, -halfH, halfW * 0.8, halfH * 0.25);
      // Label wrap
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(-halfW * 0.65, -halfH * 0.1, halfW * 1.3, halfH * 0.5);
      // White highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-halfW * 0.45, -halfH * 0.3, 2, halfH * 1.0);
      break;
    }

    // T03: 玻璃瓶 (Glass bottle)
    case 'T03': {
      // Dark green glass body
      ctx.fillStyle = '#047857';
      ctx.fillRect(-halfW * 0.6, -halfH * 0.3, halfW * 1.2, halfH * 1.3);
      // Slender neck
      ctx.fillStyle = '#059669';
      ctx.fillRect(-halfW * 0.25, -halfH * 0.85, halfW * 0.5, halfH * 0.6);
      // Golden crown cap
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-halfW * 0.35, -halfH, halfW * 0.7, halfH * 0.2);
      // Beer / Soda label
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-halfW * 0.55, -halfH * 0.05, halfW * 1.1, halfH * 0.5);
      // Glossy shine
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(-halfW * 0.45, -halfH * 0.2, 2, halfH * 1.0);
      break;
    }

    // T04: 鋁箔飲料盒 (Juice box)
    case 'T04': {
      // Brick box body (Orange-Red)
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-halfW * 0.75, -halfH * 0.8, halfW * 1.5, halfH * 1.7);
      // Carton top crease
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(-halfW * 0.75, -halfH, halfW * 1.5, halfH * 0.25);
      // Fruit illustration on carton
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -halfH * 0.05, halfW * 0.4, 0, Math.PI * 2);
      ctx.fill();
      // Little white & red angled straw
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-halfW * 0.2, -halfH - 8, 3, 10);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-halfW * 0.2, -halfH - 5, 3, 2);
      break;
    }

    // T05: 餅乾包裝 (Snack wrapper)
    case 'T05': {
      // Crinkled chip / cookie foil bag
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.8, -halfH * 0.8);
      ctx.lineTo(halfW * 0.8, -halfH * 0.9);
      ctx.lineTo(halfW * 0.9, halfH * 0.9);
      ctx.lineTo(-halfW * 0.9, halfH * 0.8);
      ctx.closePath();
      ctx.fill();
      // Zigzag crimped foil edges
      ctx.fillStyle = '#be185d';
      ctx.fillRect(-halfW * 0.85, -halfH, halfW * 1.7, 4);
      ctx.fillRect(-halfW * 0.85, halfH - 4, halfW * 1.7, 4);
      // Shiny foil reflection
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(-halfW * 0.4, -halfH * 0.4, halfW * 0.8, halfH * 0.3);
      break;
    }

    // T06: 排泄物 (Poop / excrement)
    case 'T06': {
      // Classic 3-tiered pixel swirled poop
      const c1 = '#713f12';
      const c2 = '#854d0e';
      const c3 = '#a16207';
      // Bottom tier
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.ellipse(0, halfH * 0.5, halfW * 0.85, halfH * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      // Middle tier
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.ellipse(0, 0, halfW * 0.65, halfH * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      // Top swirled peak
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.ellipse(0, -halfH * 0.45, halfW * 0.42, halfH * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tip curl
      ctx.fillRect(halfW * 0.1, -halfH * 0.85, 3, 5);
      // Stinky fly
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-halfW * 0.6, -halfH * 0.7, 3, 3);
      break;
    }
  }

  ctx.restore();
}

/**
 * Draw Raindrop Item (雨滴道具 - 2/3 of normal trash size)
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

  // Glowing water halo
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, width * 0.9);
  glow.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
  glow.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, width * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Water drop shape
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(0, -height * 0.65);
  ctx.bezierCurveTo(width * 0.65, 0, width * 0.65, height * 0.55, 0, height * 0.65);
  ctx.bezierCurveTo(-width * 0.65, height * 0.55, -width * 0.65, 0, 0, -height * 0.65);
  ctx.fill();

  // Inner bright cyan drop
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(0, -height * 0.5);
  ctx.bezierCurveTo(width * 0.45, 0, width * 0.45, height * 0.45, 0, height * 0.5);
  ctx.bezierCurveTo(-width * 0.45, height * 0.45, -width * 0.45, 0, 0, -height * 0.5);
  ctx.fill();

  // Crystal sparkle highlight
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-width * 0.2, -height * 0.15, width * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Little twinkle
  const twinkle = Math.sin(cycle * 12) > 0;
  if (twinkle) {
    ctx.fillRect(width * 0.25, height * 0.2, 3, 3);
  }

  ctx.restore();
}

/**
 * Draw Pedestrians on the Bridge
 */
export function drawPedestrian(ctx: CanvasRenderingContext2D, p: Pedestrian) {
  ctx.save();
  ctx.translate(Math.floor(p.x), Math.floor(p.y));
  ctx.scale(p.direction, 1);

  const bob = Math.sin(p.walkFrame * 8) * 2;
  const legSwing = Math.sin(p.walkFrame * 8) * 4;

  switch (p.type) {
    case 'dog': {
      // Cute pixel dog
      ctx.fillStyle = '#b45309';
      // Body
      ctx.fillRect(-10, -10 + bob, 20, 10);
      // Head
      ctx.fillRect(8, -16 + bob, 8, 8);
      // Snout
      ctx.fillRect(16, -13 + bob, 4, 4);
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(19, -13 + bob, 2, 2); // Nose
      // Ear
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, -18 + bob, 3, 4);
      // Wagging Tail
      const tailWag = Math.sin(p.walkFrame * 14) * 4;
      ctx.fillRect(-14, -14 + bob + tailWag, 4, 4);
      // Legs
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-8 + legSwing, 0, 3, 6);
      ctx.fillRect(6 - legSwing, 0, 3, 6);
      break;
    }

    case 'child': {
      // Child with balloon
      ctx.fillStyle = p.color;
      // Head
      ctx.fillRect(-4, -22 + bob, 8, 8);
      // Cap
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-5, -24 + bob, 10, 3);
      // Body
      ctx.fillStyle = p.color;
      ctx.fillRect(-4, -14 + bob, 8, 10);
      // Legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3 + legSwing, -4, 3, 6);
      ctx.fillRect(1 - legSwing, -4, 3, 6);
      // Floating balloon string & balloon
      if (p.balloonColor) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(2, -10 + bob);
        ctx.lineTo(-6, -34 + bob * 0.5);
        ctx.stroke();
        // Balloon
        ctx.fillStyle = p.balloonColor;
        ctx.beginPath();
        ctx.arc(-8, -40 + bob * 0.5, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'elder': {
      // Elder with walking cane
      ctx.fillStyle = '#94a3b8'; // Grey hair
      ctx.fillRect(-5, -28 + bob, 8, 8);
      // Brown coat
      ctx.fillStyle = '#44403c';
      ctx.fillRect(-5, -20 + bob, 10, 14);
      // Walking stick / cane
      ctx.fillStyle = '#b45309';
      ctx.fillRect(8, -16 + bob, 2, 20);
      ctx.fillRect(6, -18 + bob, 4, 2);
      // Legs
      ctx.fillStyle = '#292524';
      ctx.fillRect(-4 + legSwing * 0.6, -6, 3, 8);
      ctx.fillRect(1 - legSwing * 0.6, -6, 3, 8);
      break;
    }

    case 'teen': {
      // Teen with headphones
      ctx.fillStyle = '#fde047'; // Hair
      ctx.fillRect(-5, -28 + bob, 9, 8);
      // Big headphones
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-6, -26 + bob, 2, 5);
      ctx.fillRect(3, -26 + bob, 2, 5);
      ctx.fillRect(-6, -29 + bob, 11, 2);
      // Hoodie
      ctx.fillStyle = p.color;
      ctx.fillRect(-6, -20 + bob, 12, 14);
      // Legs
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4 + legSwing, -6, 4, 8);
      ctx.fillRect(1 - legSwing, -4, 4, 8);
      break;
    }

    case 'adult':
    default: {
      // Adult in trenchcoat/suit
      ctx.fillStyle = '#1e293b'; // Hair
      ctx.fillRect(-5, -30 + bob, 9, 8);
      // Suit
      ctx.fillStyle = p.color;
      ctx.fillRect(-6, -22 + bob, 12, 15);
      // Legs
      ctx.fillStyle = '#334155';
      ctx.fillRect(-4 + legSwing, -7, 4, 9);
      ctx.fillRect(1 - legSwing, -7, 4, 9);
      break;
    }
  }

  ctx.restore();
}

/**
 * Draw Bridge Scene & Atmospheric River Water
 */
export function drawBridgeScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  waterQuality: WaterQuality,
  timeSec: number
) {
  const bridgeTop = 75;
  const bridgeHeight = 40;
  const riverTop = 430;
  const riverHeight = height - riverTop;

  // 1. Warm Picture-Book Sky (y: 0 to 75 behind bridge)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 80);
  if (waterQuality === 'BLUE') {
    skyGrad.addColorStop(0, '#bae6fd');
    skyGrad.addColorStop(0.6, '#e0f2fe');
    skyGrad.addColorStop(1, '#f0fdf4');
  } else if (waterQuality === 'GREY') {
    skyGrad.addColorStop(0, '#cbd5e1');
    skyGrad.addColorStop(1, '#e2e8f0');
  } else {
    skyGrad.addColorStop(0, '#292524');
    skyGrad.addColorStop(1, '#44403c');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, bridgeTop);

  // 2. Pixel Clouds in the sky
  const cloudOffset = (timeSec * 8) % (width + 200);
  ctx.fillStyle = waterQuality === 'BLACK' ? 'rgba(87, 83, 78, 0.45)' : 'rgba(255, 255, 255, 0.85)';
  // Cloud 1
  const c1x = (width - cloudOffset) % width;
  ctx.fillRect(c1x, 15, 64, 12);
  ctx.fillRect(c1x + 12, 8, 40, 14);
  // Cloud 2
  const c2x = (width * 0.65 - cloudOffset * 0.65) % width;
  ctx.fillRect(c2x, 32, 72, 12);
  ctx.fillRect(c2x + 16, 24, 44, 14);

  // 3. Distant Green Hills & Town Silhouette behind the bridge
  let hillFar = '#86efac';
  let hillNear = '#4ade80';
  if (waterQuality === 'GREY') {
    hillFar = '#94a3b8';
    hillNear = '#64748b';
  } else if (waterQuality === 'BLACK') {
    hillFar = '#57534e';
    hillNear = '#44403c';
  }
  ctx.fillStyle = hillFar;
  ctx.fillRect(0, 48, width, 28);
  for (let i = 0; i < width; i += 45) {
    const h = 14 + ((i * 17) % 18);
    ctx.fillRect(i, 48 - h, 36, h);
  }
  ctx.fillStyle = hillNear;
  for (let i = 15; i < width; i += 38) {
    const h = 10 + ((i * 11) % 15);
    ctx.fillRect(i, 56 - h, 28, h);
  }

  // 4. Under-Bridge River Embankment Wall Backdrop (y: 115 to 430)
  // Instead of an empty black void, a warm stone-brick retaining embankment matching the video picture book!
  const wallTop = bridgeTop + bridgeHeight;
  const wallHeight = riverTop - wallTop;
  const wallGrad = ctx.createLinearGradient(0, wallTop, 0, riverTop);
  if (waterQuality === 'BLUE') {
    wallGrad.addColorStop(0, '#f5efe6');
    wallGrad.addColorStop(0.5, '#ece2d0');
    wallGrad.addColorStop(1, '#ded0be');
  } else if (waterQuality === 'GREY') {
    wallGrad.addColorStop(0, '#e5e5e5');
    wallGrad.addColorStop(1, '#cfcfcf');
  } else {
    wallGrad.addColorStop(0, '#383129');
    wallGrad.addColorStop(1, '#231d17');
  }
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, wallTop, width, wallHeight);

  // Brick seams on embankment wall
  ctx.fillStyle = waterQuality === 'BLACK' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(120, 100, 80, 0.18)';
  for (let wy = wallTop + 24; wy < riverTop; wy += 32) {
    ctx.fillRect(0, wy, width, 2);
    const rowOffset = (wy % 64 === 0) ? 0 : 32;
    for (let wx = rowOffset; wx < width; wx += 64) {
      ctx.fillRect(wx, wy, 2, 32);
    }
  }

  // Creeping river moss & ivy on the embankment wall
  const mossColor = waterQuality === 'BLUE' ? '#658a52' : (waterQuality === 'GREY' ? '#6b7280' : '#44403c');
  const mossHighlight = waterQuality === 'BLUE' ? '#8cb076' : (waterQuality === 'GREY' ? '#9ca3af' : '#57534e');
  ctx.fillStyle = mossColor;
  // Left wall moss cluster
  ctx.fillRect(75, wallTop + 10, 18, 35);
  ctx.fillRect(75, wallTop + 45, 12, 40);
  ctx.fillRect(75, wallTop + 85, 6, 30);
  // Right wall moss cluster
  ctx.fillRect(width - 93, wallTop + 15, 18, 30);
  ctx.fillRect(width - 87, wallTop + 45, 12, 35);
  // Moss highlights
  ctx.fillStyle = mossHighlight;
  ctx.fillRect(80, wallTop + 16, 8, 20);
  ctx.fillRect(width - 90, wallTop + 20, 8, 16);

  // Soft water mist right above riverline
  if (waterQuality === 'BLUE') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(75, riverTop - 12, width - 150, 12);
  }

  // 5. Warm Masonry Bridge (y: 75 to 115)
  const bridgeDeckColor = waterQuality === 'BLUE' ? '#8d7b68' : (waterQuality === 'GREY' ? '#71717a' : '#44403c');
  const bridgeStoneColor = waterQuality === 'BLUE' ? '#746453' : (waterQuality === 'GREY' ? '#52525b' : '#292524');
  const bridgeRailColor = waterQuality === 'BLUE' ? '#4a3f35' : (waterQuality === 'GREY' ? '#3f3f46' : '#1c1917');

  // Bridge deck body
  ctx.fillStyle = bridgeDeckColor;
  ctx.fillRect(0, bridgeTop, width, bridgeHeight);

  // Stone brick pattern on bridge
  ctx.fillStyle = bridgeStoneColor;
  for (let bx = 0; bx < width; bx += 32) {
    ctx.fillRect(bx, bridgeTop + 14, 2, bridgeHeight - 14);
    ctx.fillRect(bx + 16, bridgeTop + 26, 2, bridgeHeight - 26);
  }

  // Top guardrail railing
  ctx.fillStyle = bridgeRailColor;
  ctx.fillRect(0, bridgeTop, width, 4);
  for (let rx = 10; rx < width; rx += 24) {
    ctx.fillRect(rx, bridgeTop, 3, 14);
  }

  // Bridge underside shadow
  ctx.fillStyle = waterQuality === 'BLACK' ? '#1c1917' : '#3e342a';
  ctx.fillRect(0, bridgeTop + bridgeHeight, width, 6);

  // 6. Left & Right Bridge Piers / Abutments
  ctx.fillStyle = bridgeStoneColor;
  ctx.fillRect(0, bridgeTop, 75, height);
  ctx.fillStyle = bridgeRailColor;
  ctx.fillRect(72, bridgeTop, 6, height);
  for (let py = bridgeTop + 10; py < height; py += 24) {
    ctx.fillRect(0, py, 75, 2);
  }

  ctx.fillStyle = bridgeStoneColor;
  ctx.fillRect(width - 75, bridgeTop, 75, height);
  ctx.fillStyle = bridgeRailColor;
  ctx.fillRect(width - 78, bridgeTop, 6, height);
  for (let py = bridgeTop + 10; py < height; py += 24) {
    ctx.fillRect(width - 75, py, 75, 2);
  }

  // 7. Clay/Wood Level Sign "第一關 傷心湯" on left pier
  ctx.save();
  ctx.fillStyle = '#6e4423';
  ctx.fillRect(8, bridgeTop + 16, 60, 48);
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#4d2e16';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, bridgeTop + 16, 60, 48);

  ctx.fillStyle = '#fffbeb';
  ctx.font = 'bold 11px "DotGothic16", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('第一關', 38, bridgeTop + 32);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 14px "DotGothic16", monospace';
  ctx.fillText('傷心湯', 38, bridgeTop + 52);
  ctx.restore();

  // 8. River Water Surface & Multi-Layer Waves
  // Beautiful watercolor river tones matching the video:
  // BLUE: fresh turquoise/teal stream
  // GREY: murky kitchen dishwater
  // BLACK: heavy sad soup broth
  let waterDark = '#0f766e';
  let waterMid = '#0d9488';
  let waterLight = '#2dd4bf';
  let foamColor = '#f0fdfa';

  if (waterQuality === 'GREY') {
    waterDark = '#44403c';
    waterMid = '#57534e';
    waterLight = '#78716c';
    foamColor = '#e7e5e4';
  } else if (waterQuality === 'BLACK') {
    waterDark = '#1c1917';
    waterMid = '#292524';
    waterLight = '#44403c';
    foamColor = '#57534e';
  }

  // Base river fill
  ctx.fillStyle = waterDark;
  ctx.fillRect(0, riverTop, width, riverHeight);

  // Multi-layered animated wave bands
  ctx.fillStyle = waterMid;
  ctx.fillRect(0, riverTop + 12, width, riverHeight - 12);

  // Animated wave crests
  ctx.fillStyle = waterLight;
  const waveW = 32;
  const waveShift = (timeSec * 25) % waveW;
  for (let x = -waveW; x < width + waveW; x += waveW) {
    const waveY = riverTop + Math.sin((x + timeSec * 40) * 0.05) * 3;
    ctx.fillRect(x + waveShift, waveY, 18, 4);
    ctx.fillRect(x + waveShift + 4, waveY + 18, 22, 3);
    ctx.fillRect(x + waveShift - 8, waveY + 40, 16, 3);
  }

  // River water foam crests at top boundary
  ctx.fillStyle = foamColor;
  for (let x = 0; x < width; x += 16) {
    const foamY = riverTop + (Math.sin((x + timeSec * 60) * 0.1) > 0.3 ? 0 : 2);
    ctx.fillRect(x, foamY, 10, 2);
  }
}
