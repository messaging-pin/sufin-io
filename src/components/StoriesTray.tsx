import React from 'react';
import { Plus } from 'lucide-react';
import { Story } from '../types';

interface StoriesTrayProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onAddStory: () => void;
}

export const StoriesTray: React.FC<StoriesTrayProps> = ({
  stories,
  onSelectStory,
  onAddStory
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-4">
      <div className="flex items-start space-x-3.5 min-w-max">
        {stories.map((story) => {
          const isOwn = story.isUserStory;
          return (
            <button
              key={story.id}
              onClick={() => (isOwn && !story.hasUnseen ? onAddStory() : onSelectStory(story))}
              className="flex flex-col items-center space-y-1.5 group focus:outline-none transition-transform duration-150 active:scale-95"
            >
              {/* Avatar Container with glowing ring if active */}
              <div className="relative">
                {/* Glow & Ring Wrapper */}
                <div
                  className={`relative p-[2.5px] rounded-full transition-all duration-300 ${
                    story.hasUnseen
                      ? 'bg-gradient-to-tr from-[#FF3D00] via-[#FF6600] to-[#FFA800] shadow-[0_0_10px_rgba(255,94,0,0.45)] group-hover:shadow-[0_0_15px_rgba(255,94,0,0.7)]'
                      : isOwn
                      ? 'border border-zinc-700/60 p-[2px]'
                      : 'border border-zinc-800 p-[2px]'
                  }`}
                >
                  <div className="w-[62px] h-[62px] rounded-full overflow-hidden bg-zinc-900 border-[2px] border-black">
                    <img
                      src={story.userAvatar}
                      alt={story.userName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Orange Plus Badge for 'Your story' */}
                {isOwn && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddStory();
                    }}
                    className="absolute bottom-0 right-0 w-[21px] h-[21px] bg-brand-orange text-white rounded-full border-[2.5px] border-black flex items-center justify-center shadow-md hover:bg-brand-orangeLight transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* User Name */}
              <span className="text-[12px] font-medium text-zinc-300 tracking-tight max-w-[68px] truncate text-center group-hover:text-white transition-colors">
                {story.userName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
