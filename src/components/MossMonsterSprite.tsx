import React from 'react';

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
}

export const MossMonsterSprite: React.FC<MossMonsterSpriteProps> = ({ size = 220, flipX = false, className = "" }) => {
  return (
    <svg
      width={size}
      height={(size * 38) / 32}
      viewBox="0 0 32 38"
      shapeRendering="crispEdges"
      style={{ transform: flipX ? 'scaleX(-1)' : undefined }}
      className={className}
    >
      {SPRITE_DATA.map((row, y) =>
        row.split('').map((char, x) =>
          char !== '.' ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={PALETTE[char]}
            />
          ) : null
        )
      )}
    </svg>
  );
};

export default MossMonsterSprite;
