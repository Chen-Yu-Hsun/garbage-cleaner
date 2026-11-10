/**
 * Core 2D Pixel Game Engine for 醜泥怪：河川守護者
 * Manages game loop, physics, collisions, combo timers, and state transitions.
 */

import {
  TrashType,
  TrashObject,
  RaindropObject,
  VisibleRiverTrash,
  Particle,
  FloatingText,
  Pedestrian,
  WaterQuality,
  CharacterMode,
  GrowthStage,
  PlayerStats,
  TRASH_TYPES,
} from '../types/game';
import { sound } from '../audio/soundManager';
import { ThreeSceneBackground } from './ThreeSceneBackground';
import {
  drawMudMonster,
  drawMidori,
  drawTrash,
  drawRaindrop,
  drawPedestrian,
  drawBridgeScene,
} from './sprites';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private threeScene: ThreeSceneBackground;

  // Virtual resolution (16:9 standard retro aspect)
  public readonly V_WIDTH = 960;
  public readonly V_HEIGHT = 540;
  public readonly PLAY_MIN_X = 90;
  public readonly PLAY_MAX_X = 870;
  public readonly BRIDGE_DROP_Y = 135; // Exactly 1/4 of 540 vertical resolution
  public readonly RIVER_Y = 430;

  // Player State
  public playerX = 480;
  public playerSpeed = 380; // px/s
  public moveLeft = false;
  public moveRight = false;
  public facingRight = false; // Mirror sprite horizontally when moving right
  public isTouching = false;
  public targetTouchX: number | null = null;
  public walkCycle = 0;
  public isCatchingAnim = 0;

  // Character Transformation & Growth
  public characterMode: CharacterMode = 'NORMAL';
  public transformCount = 0;
  public currentScale: GrowthStage = 1.0;
  public transformTimer = 0; // for 1s freeze + 2s invincible
  public flashCycle = 0;

  // Combo system (15s deadline for 7 catches)
  public comboCount = 0;
  public comboTimer = 0;
  public readonly COMBO_TARGET = 7;
  public readonly COMBO_LIMIT = 15.0; // 15 seconds

  // River Pollution System
  public pollutionCount = 0; // 0 - 20
  public waterQuality: WaterQuality = 'BLUE';
  public visibleRiverTrash: VisibleRiverTrash[] = [];

  // Timing & Spawn Timers
  public effectiveGameTime = 0;
  public trashSpawnTimer = 0;
  public raindropSpawnTimer = 0;
  public nextRaindropInterval = 10.0;
  public isGameOver = false;
  public isPaused = false;

  // Active Entities
  public trashList: TrashObject[] = [];
  public raindropList: RaindropObject[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public pedestrians: Pedestrian[] = [];

  // Stats & Callbacks
  public stats: PlayerStats = {
    score: 0,
    totalCatches: 0,
    trashBreakdown: { T01: 0, T02: 0, T03: 0, T04: 0, T05: 0, T06: 0 },
    survivalTime: 0,
    transformCount: 0,
    maxCombo: 0,
  };

  public onGameOver?: (finalStats: PlayerStats) => void;
  public onStateUpdate?: (engine: GameEngine) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = true;

    // Initialize full-screen Three.js 3D Game World Background (960x540)
    this.threeScene = new ThreeSceneBackground(this.V_WIDTH, this.V_HEIGHT);

    this.initPedestrians();
    this.scheduleNextRaindrop();
  }

  // Calculate current trash fall speed (duration based on effective survival time)
  private getTrashFallSpeed(): number {
    const fallDistance = this.RIVER_Y - this.BRIDGE_DROP_Y; // 315px
    let durationSec = 5.0;
    if (this.effectiveGameTime >= 90) {
      durationSec = 2.0;
    } else if (this.effectiveGameTime >= 60) {
      durationSec = 3.0;
    } else if (this.effectiveGameTime >= 30) {
      durationSec = 4.0;
    }
    return fallDistance / durationSec;
  }

  // Get trash spawn interval (normal: 1.5s, Midori invincible: 0.75s)
  private getTrashSpawnInterval(): number {
    return this.characterMode === 'MIDORI_INVINCIBLE' ? 0.75 : 1.5;
  }

  // Schedule next raindrop interval based on pollution count
  private scheduleNextRaindrop() {
    let min = 8;
    let max = 12;
    if (this.pollutionCount >= 15) {
      min = 2;
      max = 4;
    } else if (this.pollutionCount >= 10) {
      min = 4;
      max = 6;
    } else if (this.pollutionCount >= 5) {
      min = 6;
      max = 9;
    }
    this.nextRaindropInterval = min + Math.random() * (max - min);
    this.raindropSpawnTimer = 0;
  }

  private initPedestrians() {
    this.pedestrians = [
      { id: 'p1', type: 'child', x: 220, y: 104, direction: 1, speed: 42, walkFrame: 0, color: '#0284c7', balloonColor: '#ef4444' },
      { id: 'p2', type: 'cart', x: 480, y: 104, direction: 1, speed: 32, walkFrame: 0, color: '#ea580c', balloonColor: '#facc15' },
      { id: 'p3', type: 'dog', x: 170, y: 106, direction: 1, speed: 60, walkFrame: 1, color: '#b45309' },
      { id: 'p4', type: 'adult', x: 680, y: 104, direction: -1, speed: 46, walkFrame: 2, color: '#475569' },
      { id: 'p5', type: 'elder', x: 820, y: 104, direction: -1, speed: 28, walkFrame: 0, color: '#57534e' },
      { id: 'p6', type: 'teen', x: 360, y: 104, direction: -1, speed: 52, walkFrame: 3, color: '#9333ea' },
    ];
  }

  public start() {
    this.reset();
    sound.playNormalBGM();
    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopMusic();
    sound.stopMidoriLayer();
  }

  public destroy() {
    this.stop();
    if (this.threeScene) {
      this.threeScene.dispose();
    }
  }

  public pause() {
    this.isPaused = !this.isPaused;
  }

  public reset() {
    this.playerX = 480;
    this.moveLeft = false;
    this.moveRight = false;
    this.facingRight = false;
    this.isTouching = false;
    this.targetTouchX = null;
    this.walkCycle = 0;
    this.isCatchingAnim = 0;

    this.characterMode = 'NORMAL';
    this.transformCount = 0;
    this.currentScale = 1.0;
    this.transformTimer = 0;
    this.flashCycle = 0;

    this.comboCount = 0;
    this.comboTimer = 0;

    this.pollutionCount = 0;
    this.waterQuality = 'BLUE';
    this.visibleRiverTrash = [];

    this.effectiveGameTime = 0;
    this.trashSpawnTimer = 0;
    this.raindropSpawnTimer = 0;
    this.isGameOver = false;
    this.isPaused = false;

    this.trashList = [];
    this.raindropList = [];
    this.particles = [];
    this.floatingTexts = [];

    this.stats = {
      score: 0,
      totalCatches: 0,
      trashBreakdown: { T01: 0, T02: 0, T03: 0, T04: 0, T05: 0, T06: 0 },
      survivalTime: 0,
      transformCount: 0,
      maxCombo: 0,
    };

    this.initPedestrians();
    this.scheduleNextRaindrop();
  }

  // Spawn a new random trash item (T01 - T06 equal probability)
  private spawnTrash() {
    const types: TrashType[] = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const margin = 50;
    const x = this.PLAY_MIN_X + margin + Math.random() * (this.PLAY_MAX_X - this.PLAY_MIN_X - margin * 2);
    const speed = this.getTrashFallSpeed();

    this.trashList.push({
      id: `trash-${Date.now()}-${Math.random()}`,
      type: chosenType,
      x,
      y: this.BRIDGE_DROP_Y,
      speedY: speed,
      width: 28,
      height: 32,
      rotation: (Math.random() - 0.5) * 0.4,
      rotationSpeed: (Math.random() - 0.5) * 2,
      isCaught: false,
      isSplashed: false,
      spawnEffectiveTime: this.effectiveGameTime,
    });
  }

  // Spawn raindrop item (AC-24: 3-6s fall duration, 2/3 size)
  private spawnRaindrop() {
    if (this.pollutionCount >= 20) return;
    const margin = 40;
    const x = this.PLAY_MIN_X + margin + Math.random() * (this.PLAY_MAX_X - this.PLAY_MIN_X - margin * 2);
    const fallDuration = 3.0 + Math.random() * 3.0; // 3 to 6 seconds
    const fallDistance = this.RIVER_Y - this.BRIDGE_DROP_Y;
    const speedY = fallDistance / fallDuration;

    this.raindropList.push({
      id: `rain-${Date.now()}-${Math.random()}`,
      x,
      y: this.BRIDGE_DROP_Y,
      speedY,
      width: 18,
      height: 22,
      isCaught: false,
      isSplashed: false,
      spawnEffectiveTime: this.effectiveGameTime,
    });
  }

  // Main Loop
  private loop = (timestamp: number) => {
    const rawDelta = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    if (!this.isPaused && !this.isGameOver) {
      this.update(rawDelta);
    }
    this.render();

    if (this.onStateUpdate) {
      this.onStateUpdate(this);
    }

    if (!this.isGameOver) {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  };

  private update(delta: number) {
    this.walkCycle += delta;
    this.flashCycle += delta;
    if (this.isCatchingAnim > 0) {
      this.isCatchingAnim -= delta;
    }

    // Update pedestrians along bridge
    for (const p of this.pedestrians) {
      p.x += p.speed * p.direction * delta;
      p.walkFrame += delta * (p.speed / 40);
      if (p.direction === 1 && p.x > this.PLAY_MAX_X + 20) {
        p.direction = -1;
      } else if (p.direction === -1 && p.x < this.PLAY_MIN_X - 20) {
        p.direction = 1;
      }
    }

    // 1. Check Transformation Phase 1: 1.0s Freeze Animation
    if (this.characterMode === 'TRANSFORMING') {
      this.transformTimer -= delta;
      if (this.transformTimer <= 0) {
        // Switch to Phase 2: Midori Invincible (2.0s)
        this.characterMode = 'MIDORI_INVINCIBLE';
        this.transformTimer = 2.0;
        sound.startMidoriLayer();
        this.addFloatingText('米多力無敵！', this.playerX, this.RIVER_Y - 90, '#34d399', 18);
      }
      // During 1s animation, all game objects, spawns, and timers are frozen!
      return;
    }

    // 2. Check Midori Invincible Phase 2: 2.0s
    if (this.characterMode === 'MIDORI_INVINCIBLE') {
      this.transformTimer -= delta;
      if (this.transformTimer <= 0) {
        // End of transformation: Revert appearance to Mud Monster, retain permanent scale!
        this.characterMode = 'NORMAL';
        sound.stopMidoriLayer();
        this.addFloatingText('變身結束', this.playerX, this.RIVER_Y - 80, '#f59e0b', 14);
      }
    }

    // Effective game time advances
    this.effectiveGameTime += delta;
    this.stats.survivalTime = this.effectiveGameTime;

    // 3. Player Movement (Desktop + Touch Drag)
    let moveDir = 0;
    if (this.moveLeft) moveDir -= 1;
    if (this.moveRight) moveDir += 1;

    if (this.isTouching && this.targetTouchX !== null) {
      const diff = this.targetTouchX - this.playerX;
      if (Math.abs(diff) > 4) {
        moveDir = Math.sign(diff);
      }
    }

    if (moveDir !== 0) {
      this.playerX += moveDir * this.playerSpeed * delta;
      if (moveDir > 0) {
        this.facingRight = true;
      } else if (moveDir < 0) {
        this.facingRight = false;
      }
    }

    // Clamping to play bounds based on character width
    const baseW = 54;
    const charW = baseW * this.currentScale;
    const halfW = charW * 0.45;
    this.playerX = Math.max(this.PLAY_MIN_X + halfW, Math.min(this.PLAY_MAX_X - halfW, this.playerX));

    // 4. Combo Timer update (15s deadline)
    if (this.comboCount > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        // Combo timeout reset
        this.comboCount = 0;
        this.comboTimer = 0;
        this.addFloatingText('連擊中斷', this.playerX, this.RIVER_Y - 60, '#94a3b8', 12);
      }
    }

    // 5. Trash Spawner
    this.trashSpawnTimer += delta;
    const currentInterval = this.getTrashSpawnInterval();
    if (this.trashSpawnTimer >= currentInterval) {
      this.spawnTrash();
      this.trashSpawnTimer = 0;
    }

    // 6. Raindrop Spawner
    if (this.pollutionCount < 20) {
      this.raindropSpawnTimer += delta;
      if (this.raindropSpawnTimer >= this.nextRaindropInterval) {
        this.spawnRaindrop();
        this.scheduleNextRaindrop();
      }
    }

    // 7. Update Falling Trash & Collisions
    const charH = 44 * this.currentScale;
    const catchTopY = this.RIVER_Y - charH * 0.9;
    const catchBottomY = this.RIVER_Y + 12;

    for (let i = this.trashList.length - 1; i >= 0; i--) {
      const trash = this.trashList[i];
      trash.y += trash.speedY * delta;
      trash.rotation += trash.rotationSpeed * delta;

      // Check collision with player
      const xDist = Math.abs(trash.x - this.playerX);
      const isHorizHit = xDist <= (charW * 0.48 + trash.width * 0.45);
      const isVertHit = trash.y >= catchTopY && trash.y <= catchBottomY;

      if (!trash.isCaught && !trash.isSplashed && isHorizHit && isVertHit) {
        // Successful Catch!
        trash.isCaught = true;
        this.isCatchingAnim = 0.35;
        this.stats.score += 1;
        this.stats.totalCatches += 1;
        this.stats.trashBreakdown[trash.type] += 1;

        sound.playCatchTrash();
        this.spawnCatchParticles(trash.x, trash.y, TRASH_TYPES[trash.type].color);
        this.addFloatingText('+1', trash.x, trash.y - 10, '#fde047', 15);

        // Update Combo
        if (this.comboCount === 0) {
          this.comboTimer = this.COMBO_LIMIT;
        }
        this.comboCount += 1;
        if (this.comboCount > this.stats.maxCombo) {
          this.stats.maxCombo = this.comboCount;
        }

        // Check 7 combo trigger
        if (this.comboCount >= this.COMBO_TARGET) {
          this.triggerTransformation();
        }

        this.trashList.splice(i, 1);
        continue;
      }

      // Check River Splash / Miss
      if (trash.y >= this.RIVER_Y) {
        trash.isSplashed = true;

        if (this.characterMode === 'MIDORI_INVINCIBLE') {
          // Midori Invincible miss (AC-21, AC-22, AC-23):
          // No pollution, combo resets, plays sparkle dissipation!
          this.comboCount = 0;
          this.comboTimer = 0;
          sound.playDissipate();
          this.spawnDissipationParticles(trash.x, this.RIVER_Y);
          this.addFloatingText('消散!', trash.x, this.RIVER_Y - 15, '#34d399', 13);
        } else {
          // Normal Miss: Increase pollution, reset combo, splash sound
          this.comboCount = 0;
          this.comboTimer = 0;
          sound.playSplash();
          this.spawnSplashParticles(trash.x, this.RIVER_Y, '#38bdf8');
          this.increasePollution(trash.type);
        }

        this.trashList.splice(i, 1);
      }
    }

    // 8. Update Raindrops
    for (let i = this.raindropList.length - 1; i >= 0; i--) {
      const rain = this.raindropList[i];
      rain.y += rain.speedY * delta;

      // Check player collision
      const xDist = Math.abs(rain.x - this.playerX);
      const isHorizHit = xDist <= (charW * 0.45 + rain.width * 0.5);
      const isVertHit = rain.y >= catchTopY && rain.y <= catchBottomY;

      if (!rain.isCaught && !rain.isSplashed && isHorizHit && isVertHit) {
        // Raindrop caught (AC-26, AC-27, AC-28):
        // Purify 1 pollution, doesn't add score or affect combo!
        rain.isCaught = true;
        this.isCatchingAnim = 0.35;
        sound.playCatchRaindrop();
        this.spawnCatchParticles(rain.x, rain.y, '#38bdf8');
        this.decreasePollution();
        this.raindropList.splice(i, 1);
        continue;
      }

      // Missed raindrop hits river
      if (rain.y >= this.RIVER_Y) {
        rain.isSplashed = true;
        this.spawnSplashParticles(rain.x, this.RIVER_Y, '#bae6fd');
        this.raindropList.splice(i, 1);
      }
    }

    // 9. Update Particles & Floating Text
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.life += delta;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 25 * delta;
      ft.life += delta;
      ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // Handle Pollution Increase (0 - 20)
  private increasePollution(trashType: TrashType) {
    if (this.pollutionCount >= 20) return;
    this.pollutionCount += 1;

    // Check water quality change (AC-29, AC-30, AC-35)
    if (this.pollutionCount >= 20) {
      // Game Over: river turns black, clear visible trash
      this.waterQuality = 'BLACK';
      this.visibleRiverTrash = [];
      this.triggerGameOver();
      return;
    }

    if (this.pollutionCount === 10) {
      // Transition from BLUE to GREY
      this.waterQuality = 'GREY';
      sound.playPollutionAlert();
      sound.playUrgentBGM();
      this.visibleRiverTrash = []; // Cleared when turning grey! (AC-30)
      this.addFloatingText('水質惡化！灰色警戒！', 480, 240, '#f87171', 18);
    } else {
      // Add visible river trash according to spec Chapter 9
      this.visibleRiverTrash.push({
        id: `vt-${Date.now()}-${Math.random()}`,
        type: trashType,
        x: this.PLAY_MIN_X + 20 + Math.random() * (this.PLAY_MAX_X - this.PLAY_MIN_X - 40),
        y: this.RIVER_Y + 12 + Math.random() * 25,
        rotation: (Math.random() - 0.5) * 1.5,
        bobOffset: Math.random() * Math.PI * 2,
        bobSpeed: 2 + Math.random() * 2,
      });
    }
  }

  // Handle Pollution Decrease via Raindrop
  private decreasePollution() {
    if (this.pollutionCount <= 0) return;
    this.pollutionCount -= 1;
    this.addFloatingText('-1 淨化!', this.playerX, this.RIVER_Y - 40, '#38bdf8', 16);

    // If decreasing from 10 to 9, water restores to BLUE (AC-32, AC-33, AC-38)
    if (this.pollutionCount === 9 && this.waterQuality === 'GREY') {
      this.waterQuality = 'BLUE';
      sound.playNormalBGM();
      this.addFloatingText('水質恢復！清澈藍色！', 480, 240, '#38bdf8', 18);
      // Reconstruct 9 visible trash items on river surface
      this.reconstructVisibleTrash(9);
    } else if (this.visibleRiverTrash.length > 0) {
      this.visibleRiverTrash.pop();
    }
  }

  private reconstructVisibleTrash(count: number) {
    this.visibleRiverTrash = [];
    const types: TrashType[] = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06'];
    for (let i = 0; i < count; i++) {
      this.visibleRiverTrash.push({
        id: `vt-recon-${i}`,
        type: types[i % types.length],
        x: this.PLAY_MIN_X + 30 + Math.random() * (this.PLAY_MAX_X - this.PLAY_MIN_X - 60),
        y: this.RIVER_Y + 10 + Math.random() * 25,
        rotation: (Math.random() - 0.5) * 1.5,
        bobOffset: Math.random() * Math.PI * 2,
        bobSpeed: 2 + Math.random() * 2,
      });
    }
  }

  // Trigger Midori Transformation (AC-09, AC-12..AC-18)
  private triggerTransformation() {
    this.comboCount = 0; // Combo resets
    this.comboTimer = 0;
    this.transformCount += 1;
    this.stats.transformCount = this.transformCount;

    // Growth scale progression:
    // 0: 100%, 1: 200%, 2: 250%, 3+: 300%
    if (this.transformCount === 1) {
      this.currentScale = 2.0;
    } else if (this.transformCount === 2) {
      this.currentScale = 2.5;
    } else {
      this.currentScale = 3.0;
    }

    // Phase 1: 1.0s Freeze Animation
    this.characterMode = 'TRANSFORMING';
    this.transformTimer = 1.0;
    sound.playTransform();
    this.spawnDivineSparkles(this.playerX, this.RIVER_Y - 50);
    this.addFloatingText('變身！米多力！', this.playerX, this.RIVER_Y - 110, '#6ee7b7', 22);
  }

  // Game Over handling
  private triggerGameOver() {
    this.isGameOver = true;
    sound.stopMusic();
    sound.stopMidoriLayer();
    sound.playGameOver();

    if (this.onGameOver) {
      this.onGameOver({ ...this.stats });
    }
  }

  /* ---------------- PARTICLE EFFECTS ---------------- */

  private spawnCatchParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
      const speed = 70 + Math.random() * 100;
      this.particles.push({
        id: `p-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
      });
    }
  }

  private spawnSplashParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        id: `p-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.4,
      });
    }
  }

  // Midori Invincible miss dissipation particles (AC-23)
  private spawnDissipationParticles(x: number, y: number) {
    const colors = ['#34d399', '#38bdf8', '#fde047', '#ffffff'];
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        id: `p-${Math.random()}`,
        x,
        y: y - 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.5,
        shape: 'sparkle',
      });
    }
  }

  private spawnDivineSparkles(x: number, y: number) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 160;
      this.particles.push({
        id: `p-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color: '#6ee7b7',
        alpha: 1,
        life: 0,
        maxLife: 0.8,
        shape: 'sparkle',
      });
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string, fontSize: number = 14) {
    this.floatingTexts.push({
      id: `ft-${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.9,
      fontSize,
    });
  }

  /* ---------------- RENDERING ---------------- */

  public render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

    // 1. Render Full-Screen Three.js 3D World & 3D Entities (Sky, Clouds, Horizon Foliage,
    //    3D Bridge Deck, 3D Pedestrians Crowd, 3D Vertical Arch Supports & Piers,
    //    3D Falling Trash & Raindrops, 3D Floating River Trash, Volumetric God Rays & 3D River Water)
    const hasThreeScene = Boolean(this.threeScene && this.threeScene.isAvailable);
    if (hasThreeScene) {
      this.threeScene.update(this.effectiveGameTime, this.waterQuality, this.playerX, {
        pedestrians: this.pedestrians,
        trashList: this.trashList,
        raindropList: this.raindropList,
        visibleRiverTrash: this.visibleRiverTrash,
      });
      this.threeScene.render();
      ctx.drawImage(this.threeScene.getCanvas(), 0, 0, this.V_WIDTH, this.V_HEIGHT);
    } else {
      drawBridgeScene(ctx, this.V_WIDTH, this.V_HEIGHT, this.waterQuality, this.effectiveGameTime, this.playerX, false);

      // 2D Fallback for Pedestrians & Items when WebGL is unavailable
      for (const p of this.pedestrians) {
        drawPedestrian(ctx, p);
      }
      for (const vt of this.visibleRiverTrash) {
        const bob = Math.sin(this.effectiveGameTime * vt.bobSpeed + vt.bobOffset) * 3;
        drawTrash(ctx, vt.type, vt.x, vt.y + bob, 22, 24, vt.rotation);
      }
      for (const rain of this.raindropList) {
        drawRaindrop(ctx, rain.x, rain.y, rain.width, rain.height, this.effectiveGameTime);
      }
      for (const trash of this.trashList) {
        drawTrash(ctx, trash.type, trash.x, trash.y, trash.width, trash.height, trash.rotation);
      }
    }

    // 6. Draw Player Character
    const baseW = 54;
    const baseH = 44;
    const charW = baseW * this.currentScale;
    const charH = baseH * this.currentScale;
    const isMoving = this.moveLeft || this.moveRight || (this.isTouching && this.targetTouchX !== null);

    if (this.characterMode === 'MIDORI_INVINCIBLE') {
      drawMidori(ctx, this.playerX, this.RIVER_Y, charW, charH, isMoving, this.walkCycle, this.isCatchingAnim > 0, this.facingRight);
    } else if (this.characterMode === 'TRANSFORMING') {
      // Flashes between Mud Monster and Midori during 1s pause
      const flash = Math.sin(this.flashCycle * 25) > 0;
      if (flash) {
        drawMidori(ctx, this.playerX, this.RIVER_Y, charW, charH, false, this.walkCycle, true, this.facingRight);
      } else {
        drawMudMonster(ctx, this.playerX, this.RIVER_Y, charW, charH, false, this.walkCycle, true, true, this.facingRight);
      }
    } else {
      drawMudMonster(ctx, this.playerX, this.RIVER_Y, charW, charH, isMoving, this.walkCycle, this.isCatchingAnim > 0, false, this.facingRight);
    }

    // 7. Draw Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      if (p.shape === 'sparkle') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.fillRect(p.x - p.size, p.y - 1, p.size * 2, 2);
        ctx.fillRect(p.x - 1, p.y - p.size, 2, p.size * 2);
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }

    // 8. Draw Floating Text
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `bold ${ft.fontSize}px "DotGothic16", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#26201b';
      ctx.lineWidth = 3.2;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
