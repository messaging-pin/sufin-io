import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChange,
  placeholder = 'Search'
}) => {
  return (
    <div className="px-4 pt-1 pb-2 w-full">
      <div className="relative w-full flex items-center glass-input rounded-full px-4 py-2.5 transition-all duration-200">
        <Search className="w-4 h-4 text-zinc-400 mr-2.5 flex-shrink-0 stroke-[2.2]" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] text-white placeholder-zinc-400 font-normal focus:outline-none tracking-normal"
        />
        {query && (
          <button
            onClick={() => onChange('')}
            className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 flex items-center justify-center transition-colors ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
