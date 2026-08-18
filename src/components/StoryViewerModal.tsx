import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Story, StoryItem } from '../types';

interface StoryViewerModalProps {
  stories: Story[];
  initialStoryId: string;
  onClose: () => void;
  onSendMessage: (userName: string, text: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialStoryId,
  onClose,
  onSendMessage
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(() => {
    const idx = stories.findIndex((s) => s.id === initialStoryId);
    return idx !== -1 ? idx : 0;
  });
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(false);

  const currentStory = stories[currentStoryIndex];
  const currentItem = currentStory?.items[currentItemIndex] || currentStory?.items[0];
  const progressTimerRef = useRef<number | null>(null);

  const handleNext = () => {
    if (!currentStory) return;
    if (currentItemIndex < currentStory.items.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setCurrentItemIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      const prevStory = stories[currentStoryIndex - 1];
      setCurrentItemIndex(prevStory ? prevStory.items.length - 1 : 0);
      setProgress(0);
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / 5000) * 100;

    progressTimerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPaused, currentStoryIndex, currentItemIndex]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(true);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#A824FB', '#FF2A6D', '#FFB703', '#FFFFFF']
    });
    setTimeout(() => setLiked(false), 800);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendMessage(currentStory.userName, `Replied to story: "${replyText}"`);
    setReplyText('');
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.9 },
      colors: ['#A824FB', '#FFFFFF']
    });
  };

  if (!currentStory || !currentItem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none">
      <div
        className="relative w-full max-w-[420px] h-full sm:h-[92vh] max-h-[850px] sm:rounded-[36px] overflow-hidden bg-zinc-950 flex flex-col justify-between shadow-2xl border border-zinc-800"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <img
          src={currentItem.imageUrl}
          alt={currentStory.userName}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/85 z-10 pointer-events-none" />

        <div className="absolute inset-0 z-10 flex">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="w-1/3 h-full cursor-pointer"
            aria-label="Previous story"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="w-2/3 h-full cursor-pointer"
            aria-label="Next story"
          />
        </div>

        <div className="relative z-20 pt-4 px-4 space-y-3">
          <div className="flex space-x-1.5 w-full">
            {currentStory.items.map((_: StoryItem, idx: number) => {
              let segProgress = 0;
              if (idx < currentItemIndex) segProgress = 100;
              else if (idx === currentItemIndex) segProgress = progress;

              return (
                <div
                  key={idx}
                  className="flex-1 h-[2.5px] bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                    style={{ width: `${segProgress}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <img
                src={currentStory.userAvatar}
                alt={currentStory.userName}
                className="w-9 h-9 rounded-full object-cover border border-white/40"
              />
              <div className="flex items-center space-x-2">
                <span className="text-[14px] font-semibold text-white">
                  {currentStory.userName}
                </span>
                <span className="text-[12px] text-zinc-300">
                  {currentItem.timestamp}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
                className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {currentItem.caption && (
          <div className="relative z-20 px-6 py-4">
            <span className="inline-block bg-black/60 backdrop-blur-md text-white text-[15px] font-medium px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
              {currentItem.caption}
            </span>
          </div>
        )}

        <div className="relative z-20 p-4 pb-6">
          <form
            onSubmit={handleSendReply}
            className="flex items-center space-x-2.5 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${currentStory.userName}...`}
                className="w-full bg-black/60 backdrop-blur-md text-white placeholder-zinc-400 text-[14px] px-4 py-2.5 rounded-full border border-white/20 focus:outline-none focus:border-purple-500 transition"
              />
              {replyText.trim() && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleLike}
              className={`w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform active:scale-125 ${
                liked ? 'text-purple-400 scale-110' : 'text-white hover:text-purple-400'
              }`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-purple-500' : ''}`} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
