import React, { useId } from 'react';

const PALETTE: Record<string, string> = {
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

const SPRITE_DATA = [
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

export interface MossMonsterSpriteProps {
  size?: number;
  flipX?: boolean;
  className?: string;
  isCatching?: boolean;
}

export const MossMonsterSprite: React.FC<MossMonsterSpriteProps> = ({
  size = 220,
  flipX = false,
  className = "",
  isCatching = false,
}) => {
  const rawId = useId().replace(/:/g, '');
  const filterId = `pencil-rough-${rawId}`;
  const hatchId = `pencil-hatch-${rawId}`;

  return (
    <svg
      width={size}
      height={(size * 38) / 32}
      viewBox="0 0 32 38"
      style={{
        transform: flipX ? 'scaleX(-1)' : undefined,
        overflow: 'visible',
      }}
      className={className}
    >
      <defs>
        {/* Hand-Drawn Colored-Pencil Roughness Filter */}
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.16 0.12"
            numOctaves={3}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={0.7}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
        </filter>

        {/* Diagonal Colored-Pencil Hatching Pattern Overlay */}
        <pattern
          id={hatchId}
          width="3.5"
          height="3.5"
          patternTransform="rotate(-33 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="3.5"
            stroke="rgba(30, 40, 20, 0.22)"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </pattern>
      </defs>

      {/* Main Monster Body with Colored-Pencil Texture */}
      <g filter={`url(#${filterId})`}>
        {SPRITE_DATA.map((row, y) =>
          row.split('').map((char, x) => {
            const color = PALETTE[char];
            if (!color || color === 'transparent') return null;

            // When catching/eating trash, clear out the central mouth and eye rows for the exaggerated expression
            if (isCatching) {
              // Mouth cavern area (y: 15..24, x: 7..25)
              if (y >= 15 && y <= 23 && x >= 7 && x <= 25) {
                // Keep outer border pixels
                if (char === 'O' || char === 'D' || char === 'B') {
                  // Keep outline
                } else {
                  return null;
                }
              }
              // Normal eyes area (y: 10..12, x: 9..22)
              if (y >= 10 && y <= 12 && x >= 9 && x <= 22) {
                if (char === 'W' || char === 'P' || char === 'S') {
                  // Replace with body green
                  return (
                    <rect
                      key={`${x}-${y}`}
                      x={x}
                      y={y}
                      width={1.05}
                      height={1.05}
                      rx={0.28}
                      ry={0.28}
                      fill="#718c54"
                    />
                  );
                }
              }
            }

            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1.05}
                height={1.05}
                rx={0.28}
                ry={0.28}
                fill={color}
              />
            );
          })
        )}
      </g>

      {/* Soft Colored-Pencil Diagonal Shading Overlay */}
      <rect
        x="2"
        y="2"
        width="28"
        height="33"
        fill={`url(#${hatchId})`}
        pointerEvents="none"
        opacity={0.7}
      />

      {/* Exaggerated Eating Trash Mouth Animation (誇張張大嘴吃垃圾動作) */}
      {isCatching && (
        <g className="animate-in fade-in duration-100">
          {/* Exaggerated Cheerful Squinted Cartoon Eyes (> <) */}
          {/* Left Eye > */}
          <path
            d="M 8.5 10.5 L 11.5 12 L 8.5 13.5"
            fill="none"
            stroke="#1e2816"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Eye < */}
          <path
            d="M 23.5 10.5 L 20.5 12 L 23.5 13.5"
            fill="none"
            stroke="#1e2816"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cute Blushing Cheeks */}
          <ellipse cx="6" cy="14" rx="2.2" ry="1.4" fill="rgba(244, 63, 94, 0.75)" />
          <ellipse cx="26" cy="14" rx="2.2" ry="1.4" fill="rgba(244, 63, 94, 0.75)" />

          {/* GIANT GAPING MOUTH CAVERN (巨大開口大胃王) */}
          <ellipse
            cx="16"
            cy="19"
            rx="8.5"
            ry="5.5"
            fill="#3f0707"
            stroke="#1a120b"
            strokeWidth="1.2"
          />

          {/* Bouncy Pink Tongue */}
          <path
            d="M 11 20.5 Q 16 16.5 21 20.5 Q 18.5 24 13.5 23.5 Z"
            fill="#fb7185"
            stroke="#e11d48"
            strokeWidth="0.6"
          />

          {/* Sharp Upper Cartoon Fangs (上排獠牙) */}
          <polygon points="10,14.5 11.5,17 13,14.5" fill="#fffdf5" stroke="#2c1810" strokeWidth="0.4" />
          <polygon points="13.5,14.2 15,16.8 16.5,14.2" fill="#fffdf5" stroke="#2c1810" strokeWidth="0.4" />
          <polygon points="17,14.2 18.5,16.8 20,14.2" fill="#fffdf5" stroke="#2c1810" strokeWidth="0.4" />
          <polygon points="20.5,14.5 22,17 23.5,14.5" fill="#fffdf5" stroke="#2c1810" strokeWidth="0.4" />

          {/* Lower Cute Teeth (下排牙齒) */}
          <polygon points="12.5,23.5 14,21.5 15.5,23.5" fill="#fffdf5" stroke="#2c1810" strokeWidth="0.4" />
          <polygon points="17.5,23.5 19,21.5 20.5,23.5" fill="#fffdf5" stroke="#2c1810" strokeWidth="0.4" />

          {/* Comic Action Sparkles / Chomp Lines around head (嚼咬/大口吞噬狀聲衝擊線) */}
          <line x1="4" y1="10" x2="1.5" y2="8" stroke="#f59e0b" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="3" y1="13" x2="0.5" y2="13" stroke="#f59e0b" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="28" y1="10" x2="30.5" y2="8" stroke="#f59e0b" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="29" y1="13" x2="31.5" y2="13" stroke="#f59e0b" strokeWidth="0.9" strokeLinecap="round" />
          {/* Top excitement marks */}
          <line x1="16" y1="2" x2="16" y2="0" stroke="#f59e0b" strokeWidth="1.0" strokeLinecap="round" />
          <line x1="12" y1="3" x2="10" y2="1" stroke="#f59e0b" strokeWidth="1.0" strokeLinecap="round" />
          <line x1="20" y1="3" x2="22" y2="1" stroke="#f59e0b" strokeWidth="1.0" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

export default MossMonsterSprite;
