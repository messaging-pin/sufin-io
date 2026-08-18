import React, { useState } from 'react';
import { MoreHorizontal, ChevronDown, SquarePen, Check } from 'lucide-react';
import { FilterFolderType } from '../types';

interface HeaderProps {
  currentFolder: FilterFolderType;
  onSelectFolder: (folder: FilterFolderType) => void;
  onNewMessage: () => void;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentFolder,
  onSelectFolder,
  onNewMessage,
  onOpenMenu
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const folders: FilterFolderType[] = ['All Messages', 'Unread', 'Groups', 'Archived'];

  return (
    <div className="relative px-5 pt-4 pb-2.5 flex items-center justify-between z-30 select-none glass-header">
      {/* Left 3 Dots Button with Liquid Glass Pill */}
      <button
        onClick={onOpenMenu}
        className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition active:scale-95"
        aria-label="Options menu"
      >
        <MoreHorizontal className="w-5 h-5 stroke-[2]" />
      </button>

      {/* Center "All Messages" with Liquid Glass Pill */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-1.5 py-1.5 px-4 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.09] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] text-white transition active:scale-98 group"
        >
          <span className="text-[16px] font-bold tracking-tight text-zinc-100 group-hover:text-white">
            {currentFolder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 stroke-[2.5] transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {/* Liquid Glass Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 glass-modal rounded-2xl shadow-2xl p-1.5 z-50 animate-fadeIn">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => {
                    onSelectFolder(folder);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-sm rounded-xl transition ${
                    currentFolder === folder
                      ? 'bg-white/[0.15] text-white font-semibold shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.25)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{folder}</span>
                  {currentFolder === folder && (
                    <Check className="w-4 h-4 text-[#0095F6]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Compose Button with Liquid Glass Pill */}
      <button
        onClick={onNewMessage}
        className="w-10 h-10 -mr-1 rounded-full flex items-center justify-center text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition active:scale-95"
        aria-label="New message"
      >
        <SquarePen className="w-4 h-4 stroke-[2.2]" />
      </button>
    </div>
  );
};
