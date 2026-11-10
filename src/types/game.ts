export type TrashType = 'T01' | 'T02' | 'T03' | 'T04' | 'T05' | 'T06';

export interface TrashTypeInfo {
  id: TrashType;
  name: string;
  color: string;
  points: number;
}

export const TRASH_TYPES: Record<TrashType, TrashTypeInfo> = {
  T01: { id: 'T01', name: '菸蒂', color: '#f59e0b', points: 1 },
  T02: { id: 'T02', name: '寶特瓶', color: '#06b6d4', points: 1 },
  T03: { id: 'T03', name: '玻璃瓶', color: '#10b981', points: 1 },
  T04: { id: 'T04', name: '鋁箔飲料盒', color: '#f97316', points: 1 },
  T05: { id: 'T05', name: '餅乾包裝', color: '#ec4899', points: 1 },
  T06: { id: 'T06', name: '排泄物', color: '#854d0e', points: 1 },
};

export type WaterQuality = 'BLUE' | 'GREY' | 'BLACK';

export type CharacterMode = 'NORMAL' | 'TRANSFORMING' | 'MIDORI_INVINCIBLE';

export type GrowthStage = 1.0 | 2.0 | 2.5 | 3.0;

export interface TrashObject {
  id: string;
  type: TrashType;
  x: number;
  y: number;
  speedY: number;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  isCaught: boolean;
  isSplashed: boolean;
  spawnEffectiveTime: number;
}

export interface RaindropObject {
  id: string;
  x: number;
  y: number;
  speedY: number;
  width: number;
  height: number;
  isCaught: boolean;
  isSplashed: boolean;
  spawnEffectiveTime: number;
}

export interface VisibleRiverTrash {
  id: string;
  type: TrashType;
  x: number;
  y: number;
  rotation: number;
  bobOffset: number;
  bobSpeed: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'square' | 'circle' | 'sparkle';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  fontSize: number;
}

export interface Pedestrian {
  id: string;
  type: 'elder' | 'child' | 'teen' | 'adult' | 'dog';
  x: number;
  y: number;
  direction: 1 | -1;
  speed: number;
  walkFrame: number;
  color: string;
  balloonColor?: string;
}

export interface PlayerStats {
  score: number;
  totalCatches: number;
  trashBreakdown: Record<TrashType, number>;
  survivalTime: number;
  transformCount: number;
  maxCombo: number;
}

export interface ScoreSubmission {
  playerId: string;
  nickname: string;
  score: number;
  totalCatches: number;
  trashBreakdown: Record<TrashType, number>;
  survivalTime: number;
}

export interface LeaderboardRecord {
  id: string;
  playerId: string;
  nickname: string;
  score: number;
  totalCatches: number;
  trashBreakdown: Record<TrashType, number>;
  survivalTime: number;
  createdAt: string;
  verified: boolean;
}
