import React, { useId } from 'react';

const PALETTE: Record<string, string> = {
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

const SPRITE_DATA = [
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

export interface WaterSpiritSpriteProps {
  size?: number;
  flipX?: boolean;
  className?: string;
  isCatching?: boolean;
}

export const WaterSpiritSprite: React.FC<WaterSpiritSpriteProps> = ({
  size = 220,
  flipX = false,
  className = "",
  isCatching = false,
}) => {
  const rawId = useId().replace(/:/g, '');
  const filterId = `water-pencil-rough-${rawId}`;
  const hatchId = `water-pencil-hatch-${rawId}`;

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
            baseFrequency="0.15 0.11"
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
            stroke="rgba(22, 105, 122, 0.20)"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </pattern>
      </defs>

      {/* Main Spirit Body with Colored-Pencil Texture */}
      <g filter={`url(#${filterId})`}>
        {SPRITE_DATA.map((row, y) =>
          row.split('').map((char, x) => {
            const color = PALETTE[char];
            if (!color || color === 'transparent') return null;

            // When catching/purifying, clear out central face area for exaggerated open mouth & joyful eyes
            if (isCatching) {
              // Mouth area (y: 18..22, x: 8..23)
              if (y >= 18 && y <= 22 && x >= 8 && x <= 23) {
                if (char === 'D' || char === 'O') {
                  // Keep outer outline
                } else {
                  return null;
                }
              }
              // Eyes area (y: 15..17, x: 8..22)
              if (y >= 15 && y <= 17 && x >= 8 && x <= 22) {
                if (char === 'W' || char === 'E') {
                  // Replace with skin tone
                  return (
                    <rect
                      key={`${x}-${y}`}
                      x={x}
                      y={y}
                      width={1.05}
                      height={1.05}
                      rx={0.28}
                      ry={0.28}
                      fill="#8adaea"
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
        x="4"
        y="1"
        width="26"
        height="35"
        fill={`url(#${hatchId})`}
        pointerEvents="none"
        opacity={0.65}
      />

      {/* Exaggerated Eating / Purifying Animation for Midori (米多力歡樂大口吞噬淨化) */}
      {isCatching && (
        <g className="animate-in fade-in duration-100">
          {/* Joyful Upward Arched Eyes (^ ^) */}
          <path
            d="M 9.5 16 Q 11.5 13.5 13.5 16"
            fill="none"
            stroke="#16697a"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <path
            d="M 16.5 16 Q 18.5 13.5 20.5 16"
            fill="none"
            stroke="#16697a"
            strokeWidth="1.1"
            strokeLinecap="round"
          />

          {/* Rosy Colored-Pencil Blush Cheeks */}
          <ellipse cx="8" cy="18" rx="2.0" ry="1.2" fill="rgba(244, 114, 182, 0.75)" />
          <ellipse cx="22" cy="18" rx="2.0" ry="1.2" fill="rgba(244, 114, 182, 0.75)" />

          {/* GIANT JOYFUL GAPING MOUTH (歡樂大口) */}
          <ellipse
            cx="15"
            cy="20.5"
            rx="7.5"
            ry="4.5"
            fill="#b91c1c"
            stroke="#164e63"
            strokeWidth="1.1"
          />

          {/* Cute Upper Teeth (整齊可愛上牙) */}
          <rect x="13.2" y="16.5" width="3.6" height="1.6" rx="0.5" fill="#ffffff" stroke="#164e63" strokeWidth="0.3" />

          {/* Cheerful Bouncy Pink Tongue */}
          <path
            d="M 11 21.5 Q 15 18 19 21.5 Q 17 24.5 13 24.5 Z"
            fill="#f472b6"
            stroke="#db2777"
            strokeWidth="0.5"
          />

          {/* Swirling Purifying Water Suction Ripple Lines (純淨水流吸入渦線) */}
          <path
            d="M 6 12 Q 10 14 12 18"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.8"
            strokeDasharray="2,1.5"
            strokeLinecap="round"
          />
          <path
            d="M 25 12 Q 21 14 18 18"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.8"
            strokeDasharray="2,1.5"
            strokeLinecap="round"
          />
          <path
            d="M 15 10 L 15 15"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.8"
            strokeDasharray="2,1.5"
            strokeLinecap="round"
          />

          {/* Sparkles of Divine Water Purification */}
          <circle cx="5" cy="10" r="0.8" fill="#bcebf5" />
          <circle cx="26" cy="10" r="0.8" fill="#bcebf5" />
          <circle cx="15" cy="5" r="1.0" fill="#ffffff" />
        </g>
      )}
    </svg>
  );
};

export default WaterSpiritSprite;
