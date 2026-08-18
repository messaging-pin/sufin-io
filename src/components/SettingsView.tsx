import React, { useState } from 'react';
import {
  Bell,
  Lock,
  Moon,
  Volume2,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useReadReceipts } from '../hooks/useReadReceipts';

interface SettingsViewProps {
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isFrameMode,
  onToggleFrameMode
}) => {
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [readReceipts, setReadReceipts] = useReadReceipts();
  const [activityStatus, setActivityStatus] = useState(true);

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-2 space-y-4 no-scrollbar">
      <div className="pt-2">
        <h2 className="text-[26px] font-bold text-white">Settings</h2>
      </div>

      {/* User Profile Card */}
      <div className="p-4 rounded-2xl bg-[#161619] border border-zinc-800 flex items-center space-x-3.5">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
            alt="Profile"
            className="w-14 h-14 rounded-full object-cover border-2 border-brand-orange"
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-white truncate">Taylor Morgan</h3>
          <p className="text-[13px] text-zinc-400 truncate">@taylormorgan · Online</p>
          <span className="inline-block text-[11px] text-brand-orange font-medium mt-0.5">
            Tap to edit profile
          </span>
        </div>
      </div>

      {/* App Presentation Toggle */}
      <div className="p-3.5 rounded-2xl bg-[#1a1a20] border border-brand-orange/30 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">iPhone 16 Pro Frame View</p>
            <p className="text-xs text-zinc-400">View as realistic phone chassis</p>
          </div>
        </div>
        <button
          onClick={onToggleFrameMode}
          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
            isFrameMode ? 'bg-brand-orange' : 'bg-zinc-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              isFrameMode ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Preferences Section */}
      <div className="space-y-1.5">
        <span className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">
          Preferences
        </span>

        <div className="rounded-2xl bg-[#161619] border border-zinc-800/80 overflow-hidden divide-y divide-zinc-800/50">
          {/* Notifications */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-medium text-white">Push Notifications</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                notifications ? 'bg-brand-orange' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound & Haptics */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-medium text-white">Sound & Haptics</span>
            </div>
            <button
              onClick={() => setSoundEffects(!soundEffects)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                soundEffects ? 'bg-brand-orange' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  soundEffects ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Read Receipts */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3 pr-3">
              <Lock className="w-5 h-5 text-zinc-400 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-white">Show Read Receipts</span>
                <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                  Turning this off also hides other people's "Seen" from you.
                </p>
              </div>
            </div>
            <button
              onClick={() => setReadReceipts(!readReceipts)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                readReceipts ? 'bg-brand-orange' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  readReceipts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Activity Status */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-medium text-white">Show Activity Status</span>
            </div>
            <button
              onClick={() => setActivityStatus(!activityStatus)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                activityStatus ? 'bg-brand-orange' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  activityStatus ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Account actions */}
      <div className="rounded-2xl bg-[#161619] border border-zinc-800/80 overflow-hidden divide-y divide-zinc-800/50">
        <button className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-800/60 transition text-left">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-5 h-5 text-zinc-400" />
            <span className="text-sm font-medium text-white">Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

        <button className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-800/60 transition text-left text-red-400">
          <div className="flex items-center space-x-3">
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium">Log Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>
      </div>
    </div>
  );
};
