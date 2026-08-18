import React from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Plus } from 'lucide-react';
import { CallRecord, Chat } from '../types';

interface CallsViewProps {
  calls: CallRecord[];
  onStartCall: (chat: Chat, type: 'audio' | 'video') => void;
  chats: Chat[];
}

export const CallsView: React.FC<CallsViewProps> = ({
  calls,
  onStartCall,
  chats
}) => {
  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-2 space-y-4 no-scrollbar">
      {/* Header action */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-[26px] font-bold text-white">Calls</h2>
        <button className="flex items-center space-x-1 text-brand-orange bg-brand-orange/10 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-brand-orange/20 transition">
          <Plus className="w-4 h-4" />
          <span>New Call</span>
        </button>
      </div>

      {/* Recent Calls Section */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">
          Recent Calls
        </span>

        <div className="space-y-1.5">
          {calls.map((call) => {
            const correspondingChat = chats.find((c) => c.name.includes(call.contactName.split(' ')[0]));

            return (
              <div
                key={call.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#161619] hover:bg-[#1f1f24] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={call.contactAvatar}
                    alt={call.contactName}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                  />
                  <div>
                    <h3 className={`text-[15px] font-semibold ${call.direction === 'missed' ? 'text-red-400' : 'text-white'}`}>
                      {call.contactName}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mt-0.5">
                      {call.direction === 'incoming' && (
                        <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {call.direction === 'outgoing' && (
                        <PhoneOutgoing className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      {call.direction === 'missed' && (
                        <PhoneMissed className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span>{call.time}</span>
                      {call.duration && (
                        <>
                          <span>•</span>
                          <span>{call.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Call actions */}
                <div className="flex items-center space-x-1 text-brand-orange">
                  <button
                    onClick={() => {
                      if (correspondingChat) onStartCall(correspondingChat, 'audio');
                    }}
                    className="p-2 rounded-full hover:bg-zinc-800 transition"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (correspondingChat) onStartCall(correspondingChat, 'video');
                    }}
                    className="p-2 rounded-full hover:bg-zinc-800 transition"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
