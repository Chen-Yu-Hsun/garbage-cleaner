import React, { useEffect, useRef } from 'react';
import { drawMidori } from '../game/sprites';

export interface WaterSpiritSpriteProps {
  size?: number;
  flipX?: boolean;
  className?: string;
  isCatching?: boolean;
}

/**
 * High-Definition Realistic 米多力 (Midori - Divine River Spirit) UI Component
 * Uses a high-DPI canvas backed by the realistic water-deity renderer.
 */
export const WaterSpiritSprite: React.FC<WaterSpiritSpriteProps> = ({
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
    const height = Math.round((size * 38) / 32);

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    drawMidori(
      ctx,
      width / 2,
      height * 0.92,
      width * 0.82,
      height * 0.78,
      false,
      0.3,
      isCatching,
      flipX
    );

    ctx.restore();
  }, [size, flipX, isCatching]);

  const displayHeight = Math.round((size * 38) / 32);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${displayHeight}px` }}
      className={className}
    />
  );
};

export default WaterSpiritSprite;
