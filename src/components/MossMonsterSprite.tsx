import React, { useEffect, useRef } from 'react';
import { drawMudMonster } from '../game/sprites';

export interface MossMonsterSpriteProps {
  size?: number;
  flipX?: boolean;
  className?: string;
  isCatching?: boolean;
}

/**
 * High-Definition Realistic 醜泥怪 (Mud & Moss River Guardian) UI Component
 * Uses a high-DPI canvas backed by the realistic volumetric moss renderer.
 */
export const MossMonsterSprite: React.FC<MossMonsterSpriteProps> = ({
  size = 220,
  flipX = false,
  className = '',
  isCatching = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = size;
    const height = Math.round((size * 36) / 32);

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    drawMudMonster(
      ctx,
      width / 2,
      height * 0.92,
      width * 0.86,
      height * 0.82,
      false,
      0.2,
      isCatching,
      false,
      flipX
    );

    ctx.restore();
  }, [size, flipX, isCatching]);

  const displayHeight = Math.round((size * 36) / 32);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${displayHeight}px` }}
      className={className}
    />
  );
};

export default MossMonsterSprite;
