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

  const w = baseWidth;
  const h = baseHeight;
  const bob = isMoving ? Math.sin(walkCycle * 8) * (h * 0.05) : Math.sin(walkCycle * 3) * (h * 0.02);
  const squash = isMoving ? 1 + Math.sin(walkCycle * 8) * 0.06 : 1;

  // Shadow under monster
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 0, (w * 0.45), (h * 0.12), 0, 0, Math.PI * 2);
  ctx.fill();

  // Mud Body Base
  const bodyY = -h + bob;
  const curW = w * squash;
  const curH = h / squash;

  // Sludge blob layers (dark brown, medium brown, mud highlight)
  const cDark = '#3a2210';
  const cMid = '#5d3b1b';
  const cLight = '#825528';
  const cBubble = '#9a6834';

  // Base mud silhouette
  ctx.fillStyle = cDark;
  ctx.beginPath();
  ctx.ellipse(0, bodyY + curH * 0.55, curW * 0.48, curH * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top head hump
  ctx.beginPath();
  ctx.ellipse(0, bodyY + curH * 0.38, curW * 0.38, curH * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Midtone inner body
  ctx.fillStyle = cMid;
  ctx.beginPath();
  ctx.ellipse(0, bodyY + curH * 0.56, curW * 0.42, curH * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, bodyY + curH * 0.4, curW * 0.32, curH * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sludge highlights & drippy bubbles
  ctx.fillStyle = cLight;
  ctx.fillRect(-curW * 0.25, bodyY + curH * 0.2, curW * 0.15, curH * 0.12);
  ctx.fillRect(curW * 0.12, bodyY + curH * 0.24, curW * 0.12, curH * 0.1);
  ctx.fillRect(-curW * 0.32, bodyY + curH * 0.48, curW * 0.1, curH * 0.12);

  // Mud bubble on top
  ctx.fillStyle = cBubble;
  ctx.beginPath();
  const bubbleY = bodyY + curH * 0.12 + Math.sin(walkCycle * 6) * 3;
  ctx.arc(-curW * 0.15, bubbleY, curW * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (Big expressive cartoon eyes looking upwards towards falling trash)
  const eyeRadius = curW * 0.13;
  const eyeY = bodyY + curH * 0.35;
  const eyeSpread = curW * 0.18;

  // Eye whites
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-eyeSpread, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.arc(eyeSpread, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils looking up
  ctx.fillStyle = '#1e1b18';
  const pupilRadius = eyeRadius * 0.55;
  const pupilOffset = isCatching ? -eyeRadius * 0.35 : -eyeRadius * 0.25;
  ctx.beginPath();
  ctx.arc(-eyeSpread, eyeY + pupilOffset, pupilRadius, 0, Math.PI * 2);
  ctx.arc(eyeSpread, eyeY + pupilOffset, pupilRadius, 0, Math.PI * 2);
  ctx.fill();

  // Eye glints
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-eyeSpread + 2, eyeY + pupilOffset - 2, pupilRadius * 0.4, 0, Math.PI * 2);
  ctx.arc(eyeSpread + 2, eyeY + pupilOffset - 2, pupilRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (Opens wide when catching or near trash)
  const mouthY = bodyY + curH * 0.62;
  if (isCatching) {
    ctx.fillStyle = '#261208';
    ctx.beginPath();
    ctx.ellipse(0, mouthY, curW * 0.22, curH * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink tongue
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(0, mouthY + curH * 0.08, curW * 0.14, curH * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Happy wavy sludge smile
    ctx.strokeStyle = '#261208';
    ctx.lineWidth = Math.max(2, curW * 0.04);
    ctx.beginPath();
    ctx.arc(0, mouthY - curH * 0.04, curW * 0.15, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // Waving sludge hands / pseudopods on sides
  ctx.fillStyle = cMid;
  const handBob = Math.sin(walkCycle * 7) * (curH * 0.08);
  ctx.beginPath();
  ctx.ellipse(-curW * 0.42, bodyY + curH * 0.52 + handBob, curW * 0.14, curH * 0.18, -0.3, 0, Math.PI * 2);
  ctx.ellipse(curW * 0.42, bodyY + curH * 0.52 - handBob, curW * 0.14, curH * 0.18, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
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

  const w = baseWidth;
  const h = baseHeight;
  const bob = isMoving ? Math.sin(walkCycle * 10) * (h * 0.07) : Math.sin(walkCycle * 4) * (h * 0.03);

  // Outer Divine Aura / Glow
  const auraGradient = ctx.createRadialGradient(0, -h * 0.5 + bob, w * 0.2, 0, -h * 0.5 + bob, w * 0.7);
  auraGradient.addColorStop(0, 'rgba(52, 211, 153, 0.55)');
  auraGradient.addColorStop(0.6, 'rgba(16, 185, 129, 0.25)');
  auraGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = auraGradient;
  ctx.beginPath();
  ctx.arc(0, -h * 0.5 + bob, w * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Shadow under Midori
  ctx.fillStyle = 'rgba(6, 95, 70, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.45, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyY = -h + bob;
  const curW = w;
  const curH = h;

  // Luminous emerald / cyan body colors
  const cDark = '#065f46';
  const cMid = '#10b981';
  const cLight = '#6ee7b7';
  const cShine = '#d1fae5';

  // Base Midori silhouette
  ctx.fillStyle = cDark;
  ctx.beginPath();
  ctx.ellipse(0, bodyY + curH * 0.54, curW * 0.46, curH * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(0, bodyY + curH * 0.36, curW * 0.38, curH * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner bright emerald body
  ctx.fillStyle = cMid;
  ctx.beginPath();
  ctx.ellipse(0, bodyY + curH * 0.55, curW * 0.4, curH * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, bodyY + curH * 0.38, curW * 0.32, curH * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crystalline highlights
  ctx.fillStyle = cLight;
  ctx.fillRect(-curW * 0.24, bodyY + curH * 0.2, curW * 0.14, curH * 0.1);
  ctx.fillRect(curW * 0.12, bodyY + curH * 0.22, curW * 0.12, curH * 0.08);

  // Sprout / River leaf on head
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.ellipse(0, bodyY + curH * 0.06, curW * 0.1, curH * 0.18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#86efac';
  ctx.beginPath();
  ctx.arc(-2, bodyY + curH * 0.04, curW * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Big sparkling hero eyes
  const eyeRadius = curW * 0.14;
  const eyeY = bodyY + curH * 0.34;
  const eyeSpread = curW * 0.18;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-eyeSpread, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.arc(eyeSpread, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Deep emerald pupil
  ctx.fillStyle = '#064e3b';
  const pupilRadius = eyeRadius * 0.6;
  ctx.beginPath();
  ctx.arc(-eyeSpread, eyeY - eyeRadius * 0.25, pupilRadius, 0, Math.PI * 2);
  ctx.arc(eyeSpread, eyeY - eyeRadius * 0.25, pupilRadius, 0, Math.PI * 2);
  ctx.fill();

  // Double sparkle glints
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-eyeSpread + 2, eyeY - eyeRadius * 0.35, pupilRadius * 0.45, 0, Math.PI * 2);
  ctx.arc(eyeSpread + 2, eyeY - eyeRadius * 0.35, pupilRadius * 0.45, 0, Math.PI * 2);
  ctx.arc(-eyeSpread - 2, eyeY - eyeRadius * 0.05, pupilRadius * 0.25, 0, Math.PI * 2);
  ctx.arc(eyeSpread - 2, eyeY - eyeRadius * 0.05, pupilRadius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  const mouthY = bodyY + curH * 0.6;
  if (isCatching) {
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.ellipse(0, mouthY, curW * 0.22, curH * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(0, mouthY + curH * 0.07, curW * 0.14, curH * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = Math.max(2, curW * 0.04);
    ctx.beginPath();
    ctx.arc(0, mouthY - curH * 0.03, curW * 0.15, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // Pure clean water aura particles
  ctx.fillStyle = cShine;
  const p1 = Math.sin(walkCycle * 8) * 12;
  const p2 = Math.cos(walkCycle * 7) * 12;
  ctx.fillRect(-curW * 0.45 + p1, bodyY + curH * 0.3, 4, 4);
  ctx.fillRect(curW * 0.45 - p2, bodyY + curH * 0.4, 4, 4);
  ctx.fillRect(0, bodyY - 10 + p1, 5, 5);

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
  // 1. Sky Gradient based on water/environmental state
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 200);
  if (waterQuality === 'BLUE') {
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(1, '#bae6fd');
  } else if (waterQuality === 'GREY') {
    skyGrad.addColorStop(0, '#64748b');
    skyGrad.addColorStop(1, '#cbd5e1');
  } else {
    skyGrad.addColorStop(0, '#1e293b');
    skyGrad.addColorStop(1, '#475569');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.45);

  // 2. Pixel clouds
  const cloudOffset = (timeSec * 8) % (width + 200);
  ctx.fillStyle = waterQuality === 'BLACK' ? 'rgba(100, 116, 139, 0.4)' : 'rgba(255, 255, 255, 0.7)';
  // Cloud 1
  const c1x = (width - cloudOffset) % width;
  ctx.fillRect(c1x, 25, 60, 12);
  ctx.fillRect(c1x + 10, 17, 40, 14);
  // Cloud 2
  const c2x = (width * 0.6 - cloudOffset * 0.7) % width;
  ctx.fillRect(c2x, 45, 80, 14);
  ctx.fillRect(c2x + 15, 36, 50, 16);

  // 3. Distant city/mountain silhouette behind bridge
  ctx.fillStyle = waterQuality === 'BLUE' ? '#7dd3fc' : '#94a3b8';
  ctx.fillRect(0, 65, width, 25);
  for (let i = 0; i < width; i += 35) {
    const bHeight = 15 + ((i * 13) % 20);
    ctx.fillRect(i, 65 - bHeight, 22, bHeight);
  }

  // 4. Large Stone Bridge (Spanning across y = 70 to 115)
  const bridgeTop = 75;
  const bridgeHeight = 40;

  // Bridge deck & balustrades
  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, bridgeTop, width, bridgeHeight);

  // Stone brick pattern on bridge
  ctx.fillStyle = '#475569';
  for (let bx = 0; bx < width; bx += 32) {
    ctx.fillRect(bx, bridgeTop + 14, 2, bridgeHeight - 14);
    ctx.fillRect(bx + 16, bridgeTop + 26, 2, bridgeHeight - 26);
  }

  // Top guardrail railing
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, bridgeTop, width, 4);
  for (let rx = 10; rx < width; rx += 24) {
    ctx.fillRect(rx, bridgeTop, 3, 14);
  }

  // Bridge underside dark shadow
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, bridgeTop + bridgeHeight, width, 6);

  // Left Bridge Pier / Abutment
  ctx.fillStyle = '#475569';
  ctx.fillRect(0, bridgeTop, 75, height);
  ctx.fillStyle = '#334155';
  ctx.fillRect(72, bridgeTop, 6, height);
  // Bricks on left pier
  ctx.fillStyle = '#1e293b';
  for (let py = bridgeTop + 10; py < height; py += 24) {
    ctx.fillRect(0, py, 75, 2);
  }

  // Right Bridge Pier / Abutment
  ctx.fillStyle = '#475569';
  ctx.fillRect(width - 75, bridgeTop, 75, height);
  ctx.fillStyle = '#334155';
  ctx.fillRect(width - 78, bridgeTop, 6, height);
  for (let py = bridgeTop + 10; py < height; py += 24) {
    ctx.fillRect(width - 75, py, 75, 2);
  }

  // 5. Embedded Level Name "傷心湯" Banner on the bridge pier/scene
  // Spec Chapter 3.3: 關卡名稱「傷心湯」需整合在遊戲背景中，不遮擋主要遊戲物件
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(8, bridgeTop + 16, 60, 48);
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, bridgeTop + 16, 60, 48);

  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 11px "DotGothic16", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('第一關', 38, bridgeTop + 32);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 14px "DotGothic16", monospace';
  ctx.fillText('傷心湯', 38, bridgeTop + 52);
  ctx.restore();

  // 6. River Water Surface & Animated Pixel Waves
  // River spans from y = 430 down to bottom
  const riverTop = 430;
  const riverHeight = height - riverTop;

  let waterDark = '#0369a1';
  let waterMid = '#0284c7';
  let waterLight = '#38bdf8';
  let foamColor = '#ffffff';

  if (waterQuality === 'GREY') {
    waterDark = '#44403c';
    waterMid = '#57534e';
    waterLight = '#78716c';
    foamColor = '#d6d3d1';
  } else if (waterQuality === 'BLACK') {
    waterDark = '#020617';
    waterMid = '#0f172a';
    waterLight = '#1e293b';
    foamColor = '#334155';
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
