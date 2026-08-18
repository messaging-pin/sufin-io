import React from 'react';
import { UserCheck, MessageSquare, Sparkles } from 'lucide-react';
import { Chat } from '../types';

interface PeopleViewProps {
  contacts: Chat[];
  onSelectChat: (chat: Chat) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  contacts,
  onSelectChat
}) => {
  const activeContacts = contacts.filter((c) => c.isOnline);
  const otherContacts = contacts.filter((c) => !c.isOnline);

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-2 space-y-5 no-scrollbar">
      <div className="pt-2">
        <h2 className="text-[26px] font-bold text-white">People</h2>
      </div>

      {/* Active Now Horizontal Grid */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs uppercase font-semibold text-zinc-500 tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Now ({activeContacts.length})</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {activeContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectChat(contact)}
              className="p-3.5 rounded-2xl bg-[#161619] border border-zinc-800/60 hover:border-brand-orange/40 cursor-pointer flex flex-col items-center text-center space-y-2 transition-all duration-200 group"
            >
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-14 h-14 rounded-full object-cover border border-zinc-700 group-hover:scale-105 transition"
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white truncate max-w-[120px]">
                  {contact.name}
                </p>
                <p className="text-[12px] text-zinc-400 truncate max-w-[120px]">
                  @{contact.username}
                </p>
              </div>
              <button className="w-full bg-brand-orange/15 hover:bg-brand-orange text-brand-orange hover:text-white text-xs font-semibold py-1.5 rounded-xl transition flex items-center justify-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All Contacts */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">
          All Friends
        </span>

        <div className="space-y-1.5">
          {otherContacts.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectChat(c)}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#161619] hover:bg-[#1f1f24] cursor-pointer transition"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-11 h-11 rounded-full object-cover border border-zinc-800"
                />
                <div>
                  <h4 className="text-[15px] font-semibold text-white">{c.name}</h4>
                  <p className="text-xs text-zinc-400">@{c.username}</p>
                </div>
              </div>

              <button className="p-2 text-zinc-400 hover:text-brand-orange transition">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
