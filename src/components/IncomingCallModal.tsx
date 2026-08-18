import React, { useEffect } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { callSounds } from '../utils/callSounds';

interface IncomingCallModalProps {
  caller: {
    id: string;
    name: string;
    avatar: string;
  };
  callType: 'audio' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  caller,
  callType,
  onAccept,
  onDecline
}) => {
  useEffect(() => {
    callSounds.startRingtone();
    return () => {
      callSounds.stopAll();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-sm glass-modal rounded-[32px] p-6 flex flex-col items-center text-center space-y-6 shadow-2xl border border-white/20 animate-scaleUp">
        <div className="space-y-1 pt-2">
          <span className="text-xs uppercase tracking-widest text-[#0095F6] font-bold">
            {callType === 'video' ? 'Incoming Video Call' : 'Incoming Audio Call'}
          </span>
          <h3 className="text-2xl font-extrabold text-white">{caller.name}</h3>
        </div>

        {/* Pulsing Avatar */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute w-36 h-36 rounded-full border-2 border-[#0095F6]/40 animate-ping opacity-40" />
          <div className="absolute w-28 h-28 rounded-full border border-white/30 animate-pulse" />
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/40 shadow-2xl">
            <img
              src={caller.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={caller.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <p className="text-xs text-zinc-400 font-medium">
          Ringing...
        </p>

        {/* Action Buttons: Decline (Red) & Accept (Green) */}
        <div className="w-full flex items-center justify-around pt-2">
          <button
            onClick={() => {
              callSounds.stopAll();
              onDecline();
            }}
            className="flex flex-col items-center space-y-1.5 group"
          >
            <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 group-hover:scale-105">
              <PhoneOff className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold text-zinc-400 group-hover:text-white">Decline</span>
          </button>

          <button
            onClick={() => {
              callSounds.stopAll();
              onAccept();
            }}
            className="flex flex-col items-center space-y-1.5 group"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 group-hover:scale-105 animate-bounce [animation-duration:2s]">
              <Phone className="w-7 h-7" />
            </div>
            <span className="text-xs font-semibold text-zinc-400 group-hover:text-white">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
