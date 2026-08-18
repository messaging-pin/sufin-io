import React from 'react';
import { X, CheckSquare, Bell, SlidersHorizontal, Shield, Eye } from 'lucide-react';
import { useReadReceipts } from '../hooks/useReadReceipts';

interface OptionsMenuModalProps {
  onClose: () => void;
}

export const OptionsMenuModal: React.FC<OptionsMenuModalProps> = ({ onClose }) => {
  const [readReceipts, setReadReceipts] = useReadReceipts();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[340px] bg-[#1a1a1e] border border-zinc-800 rounded-[28px] overflow-hidden shadow-2xl p-4 space-y-3 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-[17px] font-bold text-white">Options & Settings</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Items */}
        <div className="space-y-1">
          <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-zinc-800 text-left text-zinc-200 transition">
            <CheckSquare className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium">Select Messages</span>
          </button>

          <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-zinc-800 text-left text-zinc-200 transition">
            <Bell className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium">Notification Preferences</span>
          </button>

          <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-zinc-800 text-left text-zinc-200 transition">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium">Privacy & Security</span>
          </button>

          <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-zinc-800 text-left text-zinc-200 transition">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium">End-to-End Encryption</span>
          </button>

          {/* Read receipts are a two-way trade, so the cost is spelled out. */}
          <div className="flex items-start justify-between p-3 rounded-xl text-zinc-200">
            <div className="flex items-start space-x-3 pr-3 min-w-0">
              <Eye className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-sm font-medium">Show Read Receipts</span>
                <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                  {readReceipts
                    ? 'People can see when you’ve opened their messages.'
                    : 'Your “Seen” is hidden — and so is everyone else’s.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReadReceipts(!readReceipts)}
              aria-label="Toggle read receipts"
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                readReceipts ? 'bg-[#0095F6]' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  readReceipts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
