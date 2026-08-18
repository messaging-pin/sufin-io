import React from 'react';
import {
  Pin,
  Mail,
  BellOff,
  Archive,
  Trash2,
  ShieldAlert,
  MessageCircle,
  Plus
} from 'lucide-react';
import { Chat } from '../types';

interface ChatContextMenuProps {
  chat: Chat;
  onClose: () => void;
  onTogglePin: (chatId: string) => void;
  onToggleMute: (chatId: string) => void;
  onToggleRead: (chatId: string) => void;
  onToggleArchive: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onBlockChat: (chatId: string) => void;
  onQuickReaction: (chatId: string, emoji: string) => void;
  onOpenChat: (chat: Chat) => void;
}

export const ChatContextMenu: React.FC<ChatContextMenuProps> = ({
  chat,
  onClose,
  onTogglePin,
  onToggleMute,
  onToggleRead,
  onToggleArchive,
  onDeleteChat,
  onBlockChat,
  onQuickReaction,
  onOpenChat
}) => {
  const emojis = ['❤️', '😂', '🔥', '😮', '😢', '👏', '🌮', '💯'];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[300px] flex flex-col space-y-3 animate-scaleUp z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Quick Reaction Bar */}
        <div className="glass-pill rounded-full px-3 py-2 flex items-center justify-between shadow-2xl">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onQuickReaction(chat.id, emoji);
                onClose();
              }}
              className="text-xl hover:scale-130 active:scale-95 transition-transform p-0.5"
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => {
              onQuickReaction(chat.id, '🎉');
              onClose();
            }}
            className="w-6 h-6 rounded-full bg-white/[0.08] text-zinc-300 hover:text-white flex items-center justify-center transition border border-white/10"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Peek Preview Card */}
        <div
          onClick={() => onOpenChat(chat)}
          className="glass-card rounded-[22px] p-3.5 flex items-center space-x-3 cursor-pointer shadow-lg hover:border-white/20 transition group"
        >
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-12 h-12 rounded-full object-cover border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-[15px] font-bold text-white tracking-tight truncate">
                {chat.name}
              </h4>
              <span className="text-[11px] text-zinc-400 font-normal">
                {chat.lastMessageTime}
              </span>
            </div>
            <p className="text-[13px] text-zinc-400 truncate mt-0.5">
              {chat.lastMessage}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="glass-modal rounded-[26px] overflow-hidden shadow-2xl py-1.5 divide-y divide-white/[0.06]">
          <div className="space-y-0.5">
            {/* Open Chat */}
            <button
              onClick={() => onOpenChat(chat)}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-white/[0.08] text-white transition text-left text-[14px]"
            >
              <MessageCircle className="w-4 h-4 text-[#0095F6]" />
              <span>Open Chat</span>
            </button>

            {/* Pin / Unpin */}
            <button
              onClick={() => {
                onTogglePin(chat.id);
                onClose();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-white/[0.08] text-white transition text-left text-[14px]"
            >
              <Pin className="w-4 h-4 text-zinc-300" />
              <span>{chat.isPinned ? 'Unpin from Top' : 'Pin to Top'}</span>
            </button>

            {/* Mark as Read / Unread */}
            <button
              onClick={() => {
                onToggleRead(chat.id);
                onClose();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-white/[0.08] text-white transition text-left text-[14px]"
            >
              <Mail className="w-4 h-4 text-zinc-300" />
              <span>
                {chat.unreadCount && chat.unreadCount > 0
                  ? 'Mark as Read'
                  : 'Mark as Unread'}
              </span>
            </button>

            {/* Mute / Unmute */}
            <button
              onClick={() => {
                onToggleMute(chat.id);
                onClose();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-white/[0.08] text-white transition text-left text-[14px]"
            >
              <BellOff className="w-4 h-4 text-zinc-300" />
              <span>{chat.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
            </button>

            {/* Archive / Unarchive */}
            <button
              onClick={() => {
                onToggleArchive(chat.id);
                onClose();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-white/[0.08] text-white transition text-left text-[14px]"
            >
              <Archive className="w-4 h-4 text-zinc-300" />
              <span>{chat.isArchived ? 'Unarchive' : 'Archive'}</span>
            </button>

            {/* Block / Unblock */}
            <button
              onClick={() => {
                onBlockChat(chat.id);
                onClose();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-white/[0.08] text-amber-400 transition text-left text-[14px]"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{chat.isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
            </button>

            {/* Delete Chat */}
            <button
              onClick={() => {
                onDeleteChat(chat.id);
                onClose();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-500/15 text-red-400 transition text-left text-[14px]"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Delete Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
