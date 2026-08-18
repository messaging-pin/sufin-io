import React, { useRef } from 'react';
import { Pin, BellOff, MessageSquare, UserPlus, Sparkles } from 'lucide-react';
import { Chat } from '../types';
import { UserAvatar } from './UserAvatar';

export interface GlobalUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_online?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  activeChatId?: string;
  onSelectChat: (chat: Chat) => void;
  onOpenContextMenu: (chat: Chat) => void;
  searchQuery?: string;
  globalUsers?: GlobalUser[];
  onStartChatWithUser?: (user: GlobalUser) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenContextMenu,
  searchQuery = '',
  globalUsers = [],
  onStartChatWithUser
}) => {
  const timerRef = useRef<number | null>(null);

  const handleTouchStart = (chat: Chat) => {
    timerRef.current = window.setTimeout(() => {
      onOpenContextMenu(chat);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Sort pinned chats to top
  const sortedChats = [...chats].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const hasNoResults = sortedChats.length === 0 && globalUsers.length === 0;

  if (hasNoResults && !searchQuery.trim()) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400 space-y-3">
        <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center border border-white/10 text-zinc-400">
          <MessageSquare className="w-6 h-6" />
        </div>
        <p className="text-[15px] font-bold text-white">No messages yet</p>
        <p className="text-[13px] text-zinc-400 max-w-[220px] leading-relaxed">
          Type a username in the search bar above to start a conversation with anyone!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-2.5 pb-6 space-y-4">
      {/* 1. Existing Active Chats */}
      {sortedChats.length > 0 && (
        <div className="space-y-2.5">
          {searchQuery.trim() && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2">
              Your Chats
            </p>
          )}
          {sortedChats.map((chat) => {
            const isSelected = activeChatId === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onOpenContextMenu(chat);
                }}
                onTouchStart={() => handleTouchStart(chat)}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleTouchStart(chat)}
                onMouseUp={handleTouchEnd}
                className={`group relative flex items-center p-3 rounded-[22px] cursor-pointer select-none ${
                  isSelected ? 'glass-card-active' : 'glass-card'
                }`}
              >
                {/* Left Avatar */}
                <div className="mr-3 flex-shrink-0">
                  <UserAvatar
                    name={chat.name}
                    src={chat.avatar}
                    size="md"
                    isOnline={chat.isOnline}
                  />
                </div>

                {/* Middle Content */}
                <div className="flex-1 min-w-0 pr-1">
                  {/* Row 1: Name and Timestamp */}
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-[15px] font-bold text-white tracking-tight truncate">
                        {chat.name}
                      </span>
                      {chat.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-blue-400 fill-blue-400 rotate-45 flex-shrink-0" />
                      )}
                      {chat.isMuted && (
                        <BellOff className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      )}
                    </div>

                    <span className="text-[12px] font-medium text-zinc-400 flex-shrink-0 ml-2">
                      {chat.lastMessageTime}
                    </span>
                  </div>

                  {/* Row 2: Message Snippet */}
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-zinc-400 truncate font-normal leading-snug max-w-[200px]">
                      {chat.lastMessage}
                    </p>

                    <div className="flex items-center space-x-1.5 ml-2 flex-shrink-0">
                      {chat.unreadCount !== undefined && chat.unreadCount > 0 ? (
                        <div className="w-5 h-5 rounded-full bg-[#0095F6] text-white flex items-center justify-center text-[11px] font-bold shadow-[0_2px_8px_rgba(0,149,246,0.5)]">
                          {chat.unreadCount}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Global User Search Results */}
      {searchQuery.trim() && (
        <div className="space-y-2.5 pt-2 border-t border-white/10 animate-fadeIn">
          <div className="flex items-center space-x-1.5 px-2 text-xs font-bold uppercase tracking-wider text-[#0095F6]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Global Users (Start New Chat)</span>
          </div>

          {globalUsers.length > 0 ? (
            globalUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => onStartChatWithUser && onStartChatWithUser(user)}
                className="group flex items-center justify-between p-3 rounded-[22px] glass-card hover:border-[#0095F6]/40 cursor-pointer transition active:scale-98"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <UserAvatar
                    name={user.display_name}
                    src={user.avatar_url}
                    size="md"
                    isOnline={user.is_online}
                  />
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-white tracking-tight truncate">
                      {user.display_name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-1.5 bg-[#0095F6] hover:bg-blue-600 text-white rounded-full text-xs font-semibold shadow-md flex items-center space-x-1 flex-shrink-0 ml-2 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 glass-card rounded-2xl text-center space-y-2">
              <p className="text-xs text-zinc-400">
                No registered user found matching "{searchQuery}".
              </p>
              {/* Quick direct chat button */}
              <button
                onClick={() =>
                  onStartChatWithUser &&
                  onStartChatWithUser({
                    id: `user-${Date.now()}`,
                    username: searchQuery.toLowerCase().replace(/\s+/g, '_'),
                    display_name: searchQuery,
                    avatar_url: undefined,
                    is_online: true
                  })
                }
                className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full font-medium transition"
              >
                Start Chat as "@{searchQuery.toLowerCase().replace(/\s+/g, '_')}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
