import React, { useState, useRef } from 'react';
import { CornerUpLeft } from 'lucide-react';
import { Message } from '../types';

interface SwipeableMessageProps {
  message: Message;
  isMe: boolean;
  onReply: (message: Message) => void;
  onOpenMenu: (message: Message) => void;
  onDoubleTap: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export const SwipeableMessage: React.FC<SwipeableMessageProps> = ({
  message,
  isMe,
  onReply,
  onOpenMenu,
  onDoubleTap,
  children
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const longPressTimerRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);

  const SWIPE_THRESHOLD = 50; // pixels to trigger reply

  const handleStart = (clientX: number) => {
    startXRef.current = clientX;
    currentXRef.current = clientX;
    setIsDragging(true);

    // Long-press timer: Trigger options ONLY when holding for 400ms without dragging
    longPressTimerRef.current = window.setTimeout(() => {
      if (Math.abs(currentXRef.current - startXRef.current) < 8) {
        onOpenMenu(message);
      }
    }, 400);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    currentXRef.current = clientX;
    const deltaX = clientX - startXRef.current;

    // Cancel long press if user is actively dragging / swiping
    if (Math.abs(deltaX) > 8 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Swipe direction resistance
    if (!isMe && deltaX > 0) {
      const clamped = Math.min(80, deltaX * 0.75);
      setOffsetX(clamped);
    } else if (isMe && deltaX < 0) {
      const clamped = Math.max(-80, deltaX * 0.75);
      setOffsetX(clamped);
    }
  };

  const handleEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const deltaX = currentXRef.current - startXRef.current;
    setIsDragging(false);

    // Check if swipe exceeded threshold to trigger reply
    if (Math.abs(offsetX) >= SWIPE_THRESHOLD || Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      onReply(message);
    }

    // Spring back to 0
    setOffsetX(0);
  };

  const handleTapCheck = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      onDoubleTap(e);
    }
    lastTapRef.current = now;
  };

  const isTriggered = Math.abs(offsetX) >= SWIPE_THRESHOLD;

  return (
    <div
      className="relative w-full flex items-center select-none touch-pan-y"
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => {
        // Only primary mouse button on desktop
        if (e.button === 0 && window.innerWidth >= 768) {
          handleStart(e.clientX);
        }
      }}
      onMouseMove={(e) => {
        if (isDragging) handleMove(e.clientX);
      }}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onClick={handleTapCheck}
    >
      {/* Swipe Reply Icon Indicator that emerges behind the bubble */}
      {!isMe && (
        <div
          className={`absolute left-0 z-0 flex items-center justify-center transition-all duration-100 ${
            offsetX > 10 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: `translateX(${Math.min(offsetX * 0.45, 30)}px) scale(${Math.min(1.2, offsetX / SWIPE_THRESHOLD)})`,
          }}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isTriggered
                ? 'bg-[#0095F6] text-white ring-2 ring-blue-400/40'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            <CornerUpLeft className="w-4 h-4 stroke-[2.4]" />
          </div>
        </div>
      )}

      {/* Sent Message Swipe Icon */}
      {isMe && (
        <div
          className={`absolute right-0 z-0 flex items-center justify-center transition-all duration-100 ${
            offsetX < -10 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: `translateX(${Math.max(offsetX * 0.45, -30)}px) scale(${Math.min(1.2, Math.abs(offsetX) / SWIPE_THRESHOLD)})`,
          }}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isTriggered
                ? 'bg-[#0095F6] text-white ring-2 ring-blue-400/40'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            <CornerUpLeft className="w-4 h-4 stroke-[2.4]" />
          </div>
        </div>
      )}

      {/* The Actual Message Bubble with smooth spring transform */}
      <div
        className="w-full relative z-10"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {children}
      </div>
    </div>
  );
};
