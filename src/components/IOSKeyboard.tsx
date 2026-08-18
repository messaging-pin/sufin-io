import React, { useState } from 'react';
import { ArrowBigUp, Delete, Globe, Mic, Smile } from 'lucide-react';

interface IOSKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onSend: () => void;
  onQuickWord: (word: string) => void;
}

export const IOSKeyboard: React.FC<IOSKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onSpace,
  onSend,
  onQuickWord
}) => {
  const [isShift, setIsShift] = useState(false);
  const [isNumbers, setIsNumbers] = useState(false);

  const row1 = isNumbers
    ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    : ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];

  const row2 = isNumbers
    ? ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"']
    : ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];

  const row3 = isNumbers
    ? ['.', ',', '?', '!', "'", '#', '%', '*']
    : ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  const handleKey = (char: string) => {
    const output = isShift ? char.toUpperCase() : char.toLowerCase();
    onKeyPress(output);
  };

  return (
    <div className="w-full bg-[#18181a] border-t border-zinc-800/80 pt-1 pb-3 px-1.5 select-none z-30 animate-fadeIn">
      {/* Suggestions Row */}
      <div className="flex items-center justify-around py-1.5 px-2 border-b border-zinc-800/50 mb-1 text-zinc-300 text-[14px] font-normal">
        <button
          onClick={() => onQuickWord('I')}
          className="flex-1 py-1 hover:bg-zinc-800/60 rounded-lg text-center transition active:scale-95"
        >
          I
        </button>
        <div className="w-[1px] h-4 bg-zinc-800" />
        <button
          onClick={() => onQuickWord("I'm")}
          className="flex-1 py-1 hover:bg-zinc-800/60 rounded-lg text-center transition active:scale-95 font-medium text-white"
        >
          I'm
        </button>
        <div className="w-[1px] h-4 bg-zinc-800" />
        <button
          onClick={() => onQuickWord('Hey')}
          className="flex-1 py-1 hover:bg-zinc-800/60 rounded-lg text-center transition active:scale-95"
        >
          Hey
        </button>
      </div>

      {/* Row 1 */}
      <div className="flex justify-center space-x-1.5 mb-2">
        {row1.map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className="flex-1 h-[42px] max-w-[36px] bg-[#3a3a3e] hover:bg-[#48484e] active:bg-[#585860] text-white text-[17px] font-normal rounded-[7px] shadow-sm flex items-center justify-center transition-transform active:scale-95"
          >
            {isShift ? k.toUpperCase() : k.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center space-x-1.5 px-3 mb-2">
        {row2.map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className="flex-1 h-[42px] max-w-[36px] bg-[#3a3a3e] hover:bg-[#48484e] active:bg-[#585860] text-white text-[17px] font-normal rounded-[7px] shadow-sm flex items-center justify-center transition-transform active:scale-95"
          >
            {isShift ? k.toUpperCase() : k.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center space-x-1.5 mb-2">
        {/* Shift key */}
        <button
          onClick={() => setIsShift(!isShift)}
          className={`w-[44px] h-[42px] rounded-[7px] flex items-center justify-center shadow-sm transition active:scale-95 ${
            isShift ? 'bg-white text-black' : 'bg-[#27272a] text-white hover:bg-[#323236]'
          }`}
        >
          <ArrowBigUp className={`w-5 h-5 ${isShift ? 'fill-black' : ''}`} />
        </button>

        {row3.map((k) => (
          <button
            key={k}
            onClick={() => handleKey(k)}
            className="flex-1 h-[42px] max-w-[36px] bg-[#3a3a3e] hover:bg-[#48484e] active:bg-[#585860] text-white text-[17px] font-normal rounded-[7px] shadow-sm flex items-center justify-center transition-transform active:scale-95"
          >
            {isShift ? k.toUpperCase() : k.toLowerCase()}
          </button>
        ))}

        {/* Backspace key */}
        <button
          onClick={onBackspace}
          className="w-[44px] h-[42px] bg-[#27272a] hover:bg-[#323236] active:bg-[#3f3f44] text-white rounded-[7px] flex items-center justify-center shadow-sm transition active:scale-95"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Row 4 (123, space, Go) */}
      <div className="flex justify-center space-x-1.5 mb-2 px-1">
        <button
          onClick={() => setIsNumbers(!isNumbers)}
          className="w-[48px] h-[42px] bg-[#27272a] hover:bg-[#323236] text-white text-[14px] font-medium rounded-[7px] flex items-center justify-center shadow-sm transition active:scale-95"
        >
          {isNumbers ? 'ABC' : '123'}
        </button>

        <button
          onClick={onSpace}
          className="flex-1 h-[42px] bg-[#3a3a3e] hover:bg-[#48484e] active:bg-[#585860] text-zinc-400 text-[14px] rounded-[7px] shadow-sm flex items-center justify-center transition active:scale-98"
        >
          space
        </button>

        <button
          onClick={onSend}
          className="w-[62px] h-[42px] bg-[#27272a] hover:bg-zinc-700 active:bg-zinc-600 text-white text-[14px] font-medium rounded-[7px] flex items-center justify-center shadow-sm transition active:scale-95"
        >
          Go
        </button>
      </div>

      {/* Bottom Icons (Emoji & Voice dictation) */}
      <div className="flex justify-between items-center px-4 pt-1 text-zinc-400">
        <button
          onClick={() => handleKey('😊')}
          className="p-1 hover:text-white transition active:scale-110"
        >
          <Smile className="w-6 h-6" />
        </button>

        <div className="w-32 h-1 bg-white/70 rounded-full" />

        <button
          onClick={() => onQuickWord('🎙️')}
          className="p-1 hover:text-white transition active:scale-110"
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
