import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, BatteryCharging, Wifi } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('11:50');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const mins = now.getMinutes();
      setTimeStr(`${hours}:${mins < 10 ? `0${mins}` : mins}`);
    };
    update();
    const timer = setInterval(update, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full pt-2 pb-1 px-5 flex items-center justify-between text-white text-[13px] font-sans font-medium select-none z-30 pointer-events-none bg-black">
      {/* Left: Time + Photo icon */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold tracking-tight">{timeStr}</span>
        <ImageIcon className="w-3.5 h-3.5 text-zinc-400 opacity-90" />
      </div>

      {/* Right: VoLTE, Signal, 9% Battery */}
      <div className="flex items-center space-x-2 text-zinc-300">
        <div className="text-[10px] font-bold tracking-tighter border border-zinc-500 px-1 py-[0.5px] rounded-[3px] scale-90">
          Vo) LTE+
        </div>

        {/* Signal bars */}
        <div className="flex items-end space-x-[2px] h-3">
          <div className="w-[3px] h-1 bg-white rounded-[0.5px]"></div>
          <div className="w-[3px] h-2 bg-white rounded-[0.5px]"></div>
          <div className="w-[3px] h-2.5 bg-white rounded-[0.5px]"></div>
          <div className="w-[3px] h-3 bg-white rounded-[0.5px]"></div>
        </div>

        {/* Battery with 9% */}
        <div className="flex items-center space-x-1">
          <span className="text-[12px] font-medium text-white">9%</span>
          <div className="w-4 h-2.5 border border-white/90 rounded-[2px] p-[1px] flex items-center">
            <div className="h-full w-[25%] bg-red-500 rounded-[0.5px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
