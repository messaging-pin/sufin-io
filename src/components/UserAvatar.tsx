import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isOnline?: boolean;
}

const GRADIENT_PALETTES = [
  'from-[#a855f7] to-[#ec4899]', // Purple -> Pink
  'from-[#3b82f6] to-[#06b6d4]', // Blue -> Cyan
  'from-[#10b981] to-[#14b8a6]', // Emerald -> Teal
  'from-[#f59e0b] to-[#ef4444]', // Amber -> Red
  'from-[#8b5cf6] to-[#6366f1]', // Violet -> Indigo
  'from-[#ec4899] to-[#f43f5e]', // Pink -> Rose
];

const getGradientByName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  isOnline = false
}) => {
  const [imageError, setImageError] = useState(false);

  const cleanName = (name || '').trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  let initials = 'U';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].substring(0, 2).toUpperCase();
  } else if (words.length === 1) {
    initials = words[0].toUpperCase();
  }

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-24 h-24 text-2xl font-bold'
  };

  const indicatorSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4'
  };

  const gradient = getGradientByName(cleanName || 'User');
  const isValidUrl =
    src &&
    !imageError &&
    !src.includes('unsplash.com/photo-1534528741775-53994a69daeb') &&
    !src.includes('unsplash.com/photo-1535713875002-d1d0cf377fde');

  return (
    <div className={`relative flex-shrink-0 select-none ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center border border-white/10 shadow-sm transition-transform`}
      >
        {isValidUrl ? (
          <img
            src={src!}
            alt={cleanName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold tracking-tight shadow-inner`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Real-time Green Online Status Dot */}
      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 ${indicatorSizes[size]} bg-[#10b981] rounded-full border-2 border-[#121216] shadow-sm`}
        />
      )}
    </div>
  );
};
