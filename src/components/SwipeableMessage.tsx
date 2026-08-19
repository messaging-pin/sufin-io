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
  const startYRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const isGestureActiveRef = useRef<boolean>(false);
  const isHorizontalSwipeRef = useRef<boolean>(false);
  const longPressTimerRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);

  const SWIPE_THRESHOLD = 45; // pixels to trigger reply

  const isTouchOnBubble = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest('.glass-bubble-sent, .glass-bubble-received, [data-message-bubble="true"], .message-bubble-content')
    );
  };

  const handleStart = (clientX: number, clientY: number, target: EventTarget | null) => {
    // ONLY activate swipe if the finger touched directly on the message bubble component!
    if (!isTouchOnBubble(target)) {
      isGestureActiveRef.current = false;
      return;
    }

    startXRef.current = clientX;
    startYRef.current = clientY;
    currentXRef.current = clientX;
    isGestureActiveRef.current = true;
    isHorizontalSwipeRef.current = false;

    // Long-press timer: Trigger options ONLY when holding for 400ms without dragging
    longPressTimerRef.current = window.setTimeout(() => {
      if (Math.abs(currentXRef.current - startXRef.current) < 8) {
        onOpenMenu(message);
      }
    }, 400);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isGestureActiveRef.current) return;
    currentXRef.current = clientX;
    const deltaX = clientX - startXRef.current;
    const deltaY = clientY - startYRef.current;

    // Determine direction intent: if user is scrolling vertically, cancel horizontal swipe
    if (!isHorizontalSwipeRef.current) {
      if (Math.abs(deltaY) > 8 && Math.abs(deltaY) > Math.abs(deltaX)) {
        // Vertical scroll intent — cancel swipe
        isGestureActiveRef.current = false;
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        return;
      }
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe intent on message bubble
        isHorizontalSwipeRef.current = true;
        setIsDragging(true);
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    }

    if (!isHorizontalSwipeRef.current) return;

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

    if (isHorizontalSwipeRef.current) {
      const deltaX = currentXRef.current - startXRef.current;
      // Check if swipe exceeded threshold to trigger reply
      if (Math.abs(offsetX) >= SWIPE_THRESHOLD || Math.abs(deltaX) >= SWIPE_THRESHOLD) {
        onReply(message);
      }
    }

    isGestureActiveRef.current = false;
    isHorizontalSwipeRef.current = false;
    setIsDragging(false);
    setOffsetX(0);
  };

  const handleTapCheck = (e: React.MouseEvent) => {
    if (!isTouchOnBubble(e.target)) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onDoubleTap(e);
    }
    lastTapRef.current = now;
  };

  const isTriggered = Math.abs(offsetX) >= SWIPE_THRESHOLD;

  return (
    <div
      className="relative w-full flex items-center select-none touch-pan-y"
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY, e.target)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => {
        if (e.button === 0 && window.innerWidth >= 768) {
          handleStart(e.clientX, e.clientY, e.target);
        }
      }}
      onMouseMove={(e) => {
        if (isDragging) handleMove(e.clientX, e.clientY);
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
