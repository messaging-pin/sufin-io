import React, { useState } from 'react';
import {
  CornerUpLeft,
  Send,
  Copy,
  RotateCcw,
  Plus,
  Check
} from 'lucide-react';
import { formatTime } from '../utils/dateUtils';
import { Message, Chat } from '../types';

interface MessageActionMenuProps {
  message: Message;
  chat: Chat;
  allChats: Chat[];
  onClose: () => void;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onForward: (message: Message, targetChatId: string) => void;
  onUnsend: (messageId: string) => void;
}

export const MessageActionMenu: React.FC<MessageActionMenuProps> = ({
  message,
  chat,
  allChats,
  onClose,
  onReact,
  onReply,
  onForward,
  onUnsend
}) => {
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const superReactEmojis = ['❤️', '😂', '😭', '😮', '🙂', '👍'];
  const isMyMessage = message.sender === 'me';

  // Real-time weekday and time calculation
  const now = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayAbbr = days[now.getDay()];
  const timeFormatted = formatTime(now);
  const realTimeHeader = message.timestamp
    ? `${dayAbbr}, ${message.timestamp}`
    : `${dayAbbr}, ${timeFormatted}`;

  const handleSuperReact = (emoji: string) => {
    onReact(message.id, emoji);
    onClose();
  };

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopiedToast(true);
      setTimeout(() => {
        setCopiedToast(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Toast Notification with Liquid Glass */}
      {copiedToast && (
        <div className="absolute top-12 glass-pill text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl flex items-center space-x-1.5 z-50 animate-bounceShort">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Copied to clipboard</span>
        </div>
      )}

      {/* Forward Modal with Liquid Glass */}
      {showForwardModal ? (
        <div
          className="w-full max-w-[320px] glass-modal rounded-[28px] p-4 space-y-3 z-50 animate-scaleUp shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h4 className="text-[15px] font-bold text-white">Forward Message</h4>
            <button
              onClick={() => setShowForwardModal(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Back
            </button>
          </div>
          <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
            {allChats.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onForward(message, c.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.08] transition"
              >
                <div className="flex items-center space-x-2.5">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                  <span className="text-[14px] text-white font-medium">{c.name}</span>
                </div>
                <Send className="w-4 h-4 text-[#0095F6]" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Action Menu Container */
        <div
          className="w-full max-w-[280px] flex flex-col space-y-2.5 z-50 animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Super React Floating Liquid Glass Pill */}
          <div className="glass-pill rounded-full px-3.5 py-2 flex flex-col items-center shadow-2xl">
            <span className="text-[10px] text-zinc-400 font-medium mb-1">
              Tap and hold to super react
            </span>
            <div className="flex items-center justify-between w-full">
              {superReactEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSuperReact(emoji)}
                  className="text-xl hover:scale-130 active:scale-95 transition-transform p-0.5"
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => handleSuperReact('🔥')}
                className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Options Menu Card with Liquid Glass */}
          <div className="glass-modal rounded-[28px] overflow-hidden shadow-2xl py-2 divide-y divide-white/[0.06]">
            {/* Real-Time Weekday & Time Header */}
            <div className="px-4 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              {realTimeHeader}
            </div>

            {/* Options List */}
            <div className="space-y-0.5 pt-1">
              {/* 1. Reply */}
              <button
                onClick={() => {
                  onReply(message);
                  onClose();
                }}
                className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-white/[0.08] text-white transition text-left text-[14px]"
              >
                <CornerUpLeft className="w-4 h-4 text-zinc-300 stroke-[2]" />
                <span>Reply</span>
              </button>

              {/* 2. Forward */}
              <button
                onClick={() => setShowForwardModal(true)}
                className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-white/[0.08] text-white transition text-left text-[14px]"
              >
                <Send className="w-4 h-4 text-zinc-300 stroke-[2]" />
                <span>Forward</span>
              </button>

              {/* 3. Copy */}
              <button
                onClick={handleCopy}
                className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-white/[0.08] text-white transition text-left text-[14px]"
              >
                <Copy className="w-4 h-4 text-zinc-300 stroke-[2]" />
                <span>Copy</span>
              </button>

              {/* 4. Unsend (ONLY for messages sent by user) */}
              {isMyMessage && (
                <button
                  onClick={() => {
                    onUnsend(message.id);
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-500/15 text-red-400 transition text-left text-[14px]"
                >
                  <RotateCcw className="w-4 h-4 text-red-400 stroke-[2]" />
                  <span>Unsend</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
