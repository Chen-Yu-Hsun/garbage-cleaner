import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface IntroCutsceneProps {
  onComplete: () => void;
}

export const IntroCutscene: React.FC<IntroCutsceneProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(54.66);
  const [needsUserUnmute, setNeedsUserUnmute] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check system sound preference
    const soundMuted = sound.getMuted();
    video.muted = soundMuted;
    setIsMuted(soundMuted);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay with audio was blocked by browser policy; fallback to muted autoplay
          video.muted = true;
          setIsMuted(true);
          setNeedsUserUnmute(true);
          video.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            setIsPlaying(false);
          });
        });
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      setNeedsUserUnmute(false);
    }
  };

  const handleSkip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetRatio = Math.max(0, Math.min(1, clickX / rect.width));
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = targetRatio * duration;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={() => handleTogglePlay()}
      className="relative w-full h-full bg-black text-white flex flex-col justify-between overflow-hidden select-none cursor-pointer group"
    >
      {/* Video Player */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={onComplete}
        className="absolute inset-0 w-full h-full object-contain bg-black"
      />

      {/* Top Header Overlay */}
      <div
        className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-pixel-tc text-xs md:text-sm tracking-wider text-slate-200">
            宣傳片頭 · 醜泥怪：河川守護者
          </span>
        </div>

        <div className="flex items-center gap-3">
          {needsUserUnmute && (
            <button
              onClick={handleUnmuteClick}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-pixel-tc text-xs font-bold shadow-lg animate-bounce transition-transform cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>點擊開啟聲音</span>
            </button>
          )}

          <button
            onClick={handleToggleMute}
            className="p-2 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors shadow cursor-pointer"
            title={isMuted ? '開啟聲音' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel-tc text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="跳過片頭"
          >
            <span>跳過片頭</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Play Watermark (shows when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-2xl">
            <Play className="w-8 h-8 translate-x-0.5 fill-current text-amber-400" />
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className="relative z-20 flex flex-col gap-2 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar (Clickable scrubber) */}
        <div
          onClick={handleSeek}
          className="relative w-full h-2 bg-slate-800/80 hover:h-3 rounded-full cursor-pointer transition-all overflow-hidden border border-slate-700/50"
        >
          <div
            className="h-full bg-amber-400 transition-[width] duration-150 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Time and Quick Actions */}
        <div className="flex items-center justify-between text-xs font-pixel text-slate-300 px-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTogglePlay()}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="text-[11px] font-pixel-tc text-slate-400">
            點擊畫面暫停/播放 · 點擊進度條跳轉 · 可隨時跳過
          </div>
        </div>
      </div>
    </div>
  );
};
