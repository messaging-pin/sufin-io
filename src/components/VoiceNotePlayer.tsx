import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoiceNotePlayerProps {
  audioUrl?: string;
  isMe?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({ audioUrl, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio playback notice:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetDuration = audioRef.current.duration || duration || 5;

    if (!isNaN(targetDuration)) {
      audioRef.current.currentTime = seekPercent * targetDuration;
      setProgress(seekPercent * 100);
    }
  };

  const formatSeconds = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 24 dynamic waveform bars
  const waveBars = [35, 60, 40, 85, 95, 70, 50, 80, 65, 45, 90, 75, 40, 60, 80, 55, 35, 70, 85, 60, 40, 90, 65, 45];

  return (
    <div className="flex items-center space-x-3 py-1.5 px-1 min-w-[220px] max-w-[280px] select-none">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          playsInline
        />
      )}

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 flex-shrink-0 bg-white text-zinc-900 shadow-md hover:bg-zinc-100 cursor-pointer"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-zinc-900" />
        ) : (
          <Play className="w-4 h-4 fill-zinc-900 ml-0.5" />
        )}
      </button>

      {/* Waveform & Scrubber */}
      <div className="flex-1 flex flex-col justify-center space-y-1.5 min-w-0">
        <div
          onClick={handleSeek}
          className="flex items-center space-x-1 h-6 cursor-pointer group py-1"
        >
          {waveBars.map((height, idx) => {
            const barProgress = (idx / waveBars.length) * 100;
            const isFilled = progress >= barProgress;

            return (
              <div
                key={idx}
                style={{ height: `${height}%` }}
                className={`w-[3px] rounded-full transition-all ${
                  isFilled
                    ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]'
                    : 'bg-white/30 group-hover:bg-white/40'
                }`}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div className="flex justify-between items-center text-[11px] text-zinc-300 font-mono">
          <span>{formatSeconds(currentTime)}</span>
          <span>{duration ? formatSeconds(duration) : '0:05'}</span>
        </div>
      </div>
    </div>
  );
};
