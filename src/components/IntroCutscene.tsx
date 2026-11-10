import React, { useState, useRef, useEffect } from 'react';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface IntroCutsceneProps {
  onComplete: () => void;
}

export const IntroCutscene: React.FC<IntroCutsceneProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [needsUserUnmute, setNeedsUserUnmute] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Sync system mute state
    const soundMuted = sound.getMuted();
    video.muted = soundMuted;
    setIsMuted(soundMuted);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Playback started successfully
        })
        .catch(() => {
          // Autoplay with audio was prevented by browser policy; fallback to muted autoplay
          video.muted = true;
          setIsMuted(true);
          setNeedsUserUnmute(true);
          video.play().catch(() => {});
        });
    }
  }, []);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    setNeedsUserUnmute(false);
    if (!nextMuted && sound.getMuted()) {
      sound.toggleMute();
    }
  };

  const handleUnmuteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      setIsMuted(false);
      setNeedsUserUnmute(false);
      if (video.paused) {
        video.play().catch(() => {});
      }
    }
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  };

  return (
    <div
      onClick={handleTogglePlay}
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none cursor-pointer"
    >
      {/* Pure Native Video Player - Dynamically responsive to any viewport size */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        playsInline
        preload="auto"
        onEnded={onComplete}
        className="w-full h-full object-contain"
      />

      {/* Discreet floating controls (No timeline / scrubbers - pure native video) */}
      <div
        className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {needsUserUnmute && (
          <button
            onClick={handleUnmuteClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel-tc text-xs font-bold shadow-lg animate-bounce transition-transform cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>開啟聲音</span>
          </button>
        )}

        <button
          onClick={handleToggleMute}
          className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-colors cursor-pointer shadow-md"
          title={isMuted ? '開啟聲音' : '靜音'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 backdrop-blur-md border border-white/20 text-white font-pixel-tc text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          title="跳過片頭"
        >
          <span>跳過</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
