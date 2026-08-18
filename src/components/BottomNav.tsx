import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { MainTabType } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';

interface BottomNavProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadCount = 0
}) => {
  const { user, profile } = useAuth();

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Al Sam';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <nav className="w-full glass-dock px-6 py-2.5 flex items-center justify-around z-20">
      {/* 1. Calls Tab */}
      <button
        onClick={() => onTabChange('calls')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all duration-200 relative ${
          activeTab === 'calls'
            ? 'text-white bg-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
        }`}
        aria-label="Calls"
      >
        <Phone className="w-5 h-5 stroke-[2]" />
        <span className="text-[10px] mt-0.5 font-semibold">Calls</span>
      </button>

      {/* 2. Messages Tab */}
      <button
        onClick={() => onTabChange('messages')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all duration-200 relative ${
          activeTab === 'messages'
            ? 'text-white bg-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
        }`}
        aria-label="Messages"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 stroke-[2]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#FF3B30] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-black shadow">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 font-semibold">Messages</span>
      </button>

      {/* 3. Profile Tab */}
      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all duration-200 relative ${
          activeTab === 'profile'
            ? 'text-white bg-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
        }`}
        aria-label="Profile"
      >
        <div className={`p-0.5 rounded-full ${activeTab === 'profile' ? 'ring-2 ring-white/60 shadow-lg' : ''}`}>
          <UserAvatar
            name={displayName}
            src={avatarUrl}
            size="xs"
            className="w-5 h-5"
          />
        </div>
        <span className="text-[10px] mt-0.5 font-semibold">Profile</span>
      </button>
    </nav>
  );
};
