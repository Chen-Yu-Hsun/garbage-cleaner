import React from 'react';

interface StageCurtainProps {
  isClosed: boolean;
  onClosedTransitionEnd?: () => void;
  onOpenedTransitionEnd?: () => void;
}

export const StageCurtain: React.FC<StageCurtainProps> = ({
  isClosed,
  onClosedTransitionEnd,
  onOpenedTransitionEnd,
}) => {
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // Only respond to the transform transition of the curtain panel itself
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    if (isClosed) {
      onClosedTransitionEnd?.();
    } else {
      onOpenedTransitionEnd?.();
    }
  };

  return (
    <div
      className={`absolute inset-0 z-50 overflow-hidden pointer-events-none transition-colors duration-500 select-none ${
        isClosed ? 'pointer-events-auto bg-black/20' : ''
      }`}
    >
      {/* =========================================================================
          LEFT STAGE CURTAIN (左布幕)
          ========================================================================= */}
      <div
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: isClosed ? 'translate3d(0, 0, 0)' : 'translate3d(-102%, 0, 0)',
          transition: isClosed
            ? 'transform 550ms cubic-bezier(0.25, 1, 0.5, 1)'
            : 'transform 650ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="absolute top-0 left-0 w-[51%] h-full shadow-[6px_0px_25px_rgba(0,0,0,0.65)] will-change-transform flex"
      >
        {/* Velvet Vertical Drapery Pleats */}
        <div
          className="w-full h-full relative"
          style={{
            background:
              'repeating-linear-gradient(90deg, #3d0505 0px, #7f1d1d 16px, #991b1b 32px, #b91c1c 48px, #7f1d1d 64px, #3d0505 80px)',
          }}
        >
          {/* Hand-Drawn Colored-Pencil Diagonal Shading Hatch Texture */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-33deg, #fff 0px, #fff 1.5px, transparent 1.5px, transparent 5.5px)',
            }}
          />

          {/* Golden Center Fringe & Cord Border (右側中央垂飾) */}
          <div className="absolute top-0 right-0 w-3.5 h-full bg-gradient-to-l from-[#eab308] via-[#ca8a04] to-[#854d0e] border-l border-[#fef08a]/60 shadow-md">
            {/* Scalloped Gold Tassel Fringe Pattern */}
            <div
              className="w-full h-full opacity-60"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 100% 50%, #fef08a 2px, transparent 2.5px)',
                backgroundSize: '12px 16px',
              }}
            />
          </div>

          {/* Bottom Gold Fringe Border */}
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-[#ca8a04] to-[#eab308] border-t border-[#fef08a]/80 shadow-md flex items-center justify-around overflow-hidden">
            <div
              className="w-full h-full opacity-50"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #78350f 0px, #78350f 2px, transparent 2px, transparent 6px)',
              }}
            />
          </div>

          {/* Golden Rope Sash Tie-Back when opened (開門幕繩) */}
          <div
            className={`absolute top-1/2 left-4 w-7 h-36 -translate-y-1/2 rounded-full border-2 border-[#ca8a04] bg-[#eab308] shadow-lg transition-opacity duration-300 flex flex-col items-center justify-center ${
              isClosed ? 'opacity-0' : 'opacity-85'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#facc15] border border-[#a16207] shadow-sm mb-1" />
            <div className="w-1.5 h-16 bg-[#ca8a04] rounded-full" />
            <div className="w-5 h-6 rounded-b-full bg-[#eab308] border border-[#a16207] shadow-sm mt-1" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT STAGE CURTAIN (右布幕)
          ========================================================================= */}
      <div
        style={{
          transform: isClosed ? 'translate3d(0, 0, 0)' : 'translate3d(102%, 0, 0)',
          transition: isClosed
            ? 'transform 550ms cubic-bezier(0.25, 1, 0.5, 1)'
            : 'transform 650ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="absolute top-0 right-0 w-[51%] h-full shadow-[-6px_0px_25px_rgba(0,0,0,0.65)] will-change-transform flex"
      >
        {/* Velvet Vertical Drapery Pleats */}
        <div
          className="w-full h-full relative"
          style={{
            background:
              'repeating-linear-gradient(90deg, #3d0505 0px, #7f1d1d 16px, #991b1b 32px, #b91c1c 48px, #7f1d1d 64px, #3d0505 80px)',
          }}
        >
          {/* Hand-Drawn Colored-Pencil Diagonal Shading Hatch Texture */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-33deg, #fff 0px, #fff 1.5px, transparent 1.5px, transparent 5.5px)',
            }}
          />

          {/* Golden Center Fringe & Cord Border (左側中央垂飾) */}
          <div className="absolute top-0 left-0 w-3.5 h-full bg-gradient-to-r from-[#eab308] via-[#ca8a04] to-[#854d0e] border-r border-[#fef08a]/60 shadow-md">
            <div
              className="w-full h-full opacity-60"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 0% 50%, #fef08a 2px, transparent 2.5px)',
                backgroundSize: '12px 16px',
              }}
            />
          </div>

          {/* Bottom Gold Fringe Border */}
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-[#ca8a04] to-[#eab308] border-t border-[#fef08a]/80 shadow-md flex items-center justify-around overflow-hidden">
            <div
              className="w-full h-full opacity-50"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #78350f 0px, #78350f 2px, transparent 2px, transparent 6px)',
              }}
            />
          </div>

          {/* Golden Rope Sash Tie-Back when opened (開門幕繩) */}
          <div
            className={`absolute top-1/2 right-4 w-7 h-36 -translate-y-1/2 rounded-full border-2 border-[#ca8a04] bg-[#eab308] shadow-lg transition-opacity duration-300 flex flex-col items-center justify-center ${
              isClosed ? 'opacity-0' : 'opacity-85'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#facc15] border border-[#a16207] shadow-sm mb-1" />
            <div className="w-1.5 h-16 bg-[#ca8a04] rounded-full" />
            <div className="w-5 h-6 rounded-b-full bg-[#eab308] border border-[#a16207] shadow-sm mt-1" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          CENTER THEATRE EMBLEM (舞台閉幕中央金色徽章)
          ========================================================================= */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300 pointer-events-none ${
          isClosed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <div className="px-6 py-2.5 rounded-2xl bg-[#450a0a] border-2 border-[#eab308] shadow-[0_8px_25px_rgba(0,0,0,0.8),inset_0_2px_0_rgba(255,235,180,0.4)] flex items-center gap-3 text-[#fef08a]">
          <span className="text-xl">🎭</span>
          <span className="font-pixel-tc text-sm sm:text-base font-black tracking-widest text-[#facc15] drop-shadow-sm">
            傷心湯 · 舞台劇場
          </span>
          <span className="text-xl">🎭</span>
        </div>
      </div>

      {/* =========================================================================
          TOP THEATRICAL VALANCE (舞台頂部橫楣拱幔)
          Retracts upward when the curtain opens so it never blocks the game!
          ========================================================================= */}
      <div
        style={{
          transform: isClosed ? 'translate3d(0, 0, 0)' : 'translate3d(0, -105%, 0)',
          transition: isClosed
            ? 'transform 450ms cubic-bezier(0.25, 1, 0.5, 1)'
            : 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="absolute top-0 inset-x-0 h-9 sm:h-11 z-40 pointer-events-none shadow-md overflow-hidden flex will-change-transform"
      >
        {/* Scalloped Arch Drapes (5 arches across width) */}
        {[0, 1, 2, 3, 4].map((idx) => (
          <div key={idx} className="flex-1 h-full relative">
            {/* Scalloped Red Velvet Arch */}
            <div
              className="w-full h-full rounded-b-[28px] border-b-2 border-[#ca8a04] shadow-md relative overflow-hidden"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, #b91c1c 0%, #7f1d1d 70%, #450a0a 100%)',
              }}
            >
              {/* Colored-pencil texture */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(-33deg, #fff 0px, #fff 1.5px, transparent 1.5px, transparent 4.5px)',
                }}
              />
              {/* Golden Fringe along Arch bottom */}
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#eab308] border-t border-[#fef08a]" />
            </div>

            {/* Little Golden Hanging Tassel between arches */}
            {idx < 4 && (
              <div className="absolute -right-1.5 top-0 w-3 h-8 z-10 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#facc15] border border-[#a16207] shadow-sm" />
                <div className="w-1 h-3.5 bg-[#ca8a04]" />
                <div className="w-2.5 h-3.5 rounded-b-md bg-[#eab308] border-t border-[#fef08a]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StageCurtain;
