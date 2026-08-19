import React from 'react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 w-full h-full h-[100dvh] bg-black text-white flex flex-col overflow-hidden font-sans select-none">
      {/* Main Glass Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden bg-black">
        {children}
      </div>
    </div>
  );
};
