import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { Chat } from '../types';
import { UserAvatar } from './UserAvatar';

interface NewChatModalProps {
  contacts: Chat[];
  onClose: () => void;
  onSelectChat: (chat: Chat) => void;
  onCreateChat: (name: string, username?: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  contacts,
  onClose,
  onSelectChat,
  onCreateChat
}) => {
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateChat(newName.trim(), '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#161619] border border-zinc-800 rounded-[28px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-[18px] font-bold text-white">New Message</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-800/60">
          <div className="relative flex items-center bg-[#232328] rounded-xl px-3 py-2 text-zinc-400">
            <Search className="w-4 h-4 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people by name..."
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Create Direct Contact */}
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/70 text-[#0095F6] transition text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#0095F6]/20 flex items-center justify-center border border-[#0095F6]/30">
              <UserPlus className="w-5 h-5 text-[#0095F6]" />
            </div>
            <span className="text-[15px] font-medium">Add New Contact by Name</span>
          </button>

          {showAddCustom && (
            <form onSubmit={handleCreate} className="p-3 bg-[#1e1e24] rounded-xl space-y-2.5 my-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full Name (e.g. Sarah Connor)"
                className="w-full bg-zinc-900 text-white text-sm px-3 py-2 rounded-lg border border-zinc-700 focus:border-[#0095F6] outline-none"
                required
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-[#0095F6] hover:bg-blue-600 text-white font-medium py-2 rounded-lg text-sm shadow-md transition"
              >
                Start Chatting
              </button>
            </form>
          )}

          {filtered.length > 0 && (
            <>
              <div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Suggested
              </div>

              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectChat(c);
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-zinc-800/70 text-left transition"
                >
                  <UserAvatar
                    name={c.name}
                    src={c.avatar}
                    size="md"
                    isOnline={c.isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-white truncate">{c.name}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
