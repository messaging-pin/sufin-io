import React, { useState } from 'react';
import { Search, MessageSquare, Phone, UserPlus } from 'lucide-react';
import { ContactItem, Chat } from '../types';

interface ContactsViewProps {
  contacts: ContactItem[];
  onSelectContact: (contact: ContactItem) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onSelectContact
}) => {
  const [search, setSearch] = useState('');

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-2 space-y-4 no-scrollbar">
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-[26px] font-bold text-white tracking-tight">Contacts</h2>
        <button className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center hover:text-white transition">
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative flex items-center bg-[#18181c] rounded-full px-3.5 py-2.5 text-zinc-400">
        <Search className="w-4 h-4 mr-2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full bg-transparent text-[15px] text-white placeholder-zinc-500 focus:outline-none"
        />
      </div>

      {/* Contacts List */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">
          All Contacts ({filtered.length})
        </span>

        <div className="space-y-1.5">
          {filtered.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className="flex items-center justify-between p-3 rounded-[20px] bg-[#161619] hover:bg-[#1f1f24] cursor-pointer transition border border-zinc-800/40"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                  />
                  {contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#161619]" />
                  )}
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-white">{contact.name}</h4>
                  <p className="text-xs text-zinc-400">@{contact.username} · {contact.statusText}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-zinc-400">
                <button className="p-2 hover:text-white transition">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
