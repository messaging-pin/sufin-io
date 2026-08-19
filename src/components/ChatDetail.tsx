import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Info,
  Smile,
  Mic,
  Image as ImageIcon,
  Heart,
  CornerUpLeft,
  MoreHorizontal,
  Send,
  ArrowLeft,
  X,
  Trash2,
  Square
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { MessageActionMenu } from './MessageActionMenu';
import { SwipeableMessage } from './SwipeableMessage';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { MessageStatus } from './MessageStatus';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { uploadChatAttachment } from '../lib/supabase';
import { uploadMediaToSupabase } from '../lib/uploadMedia';
import { formatTime, formatDayHeader, shouldShowTimeHeader } from '../utils/dateUtils';
import { Chat, Message } from '../types';

interface ChatDetailProps {
  chat: Chat;
  allChats?: Chat[];
  onBack: () => void;
  onSendMessage: (chatId: string, messageText: string, mediaType?: 'image' | 'video' | 'voice' | 'link', replyTo?: Message, mediaUrl?: string) => void;
  onForwardMessage?: (message: Message, targetChatId: string) => void;
  onDeleteMessage?: (chatId: string, messageId: string) => void;
  onReactMessage?: (chatId: string, messageId: string, emoji: string) => void;
  onStartCall?: (chat: Chat, type: 'audio' | 'video') => void;
  isMobileView?: boolean;
  isPartnerTyping?: boolean;
  onTyping?: (isTyping: boolean) => void;
  /** Fired when this thread is actually open and rendered on screen. */
  onSeen?: (chat: Chat) => void;
}

export const ChatDetail: React.FC<ChatDetailProps> = ({
  chat,
  allChats = [chat],
  onBack,
  onSendMessage,
  onForwardMessage,
  onDeleteMessage,
  onReactMessage,
  onStartCall,
  isPartnerTyping = false,
  onTyping,
  onSeen
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeMenuMessage, setActiveMenuMessage] = useState<Message | null>(null);
  const [reactionToRemove, setReactionToRemove] = useState<{ messageId: string; emoji: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording
  } = useVoiceRecorder();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentRealTimeDayHeader = formatDayHeader(new Date());

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [chat.id]);

  useEffect(() => {
    scrollToBottom(true);
  }, [chat.messages, isPartnerTyping]);

  /**
   * Report "Seen" only while the thread is genuinely on screen. Opening the
   * app to a different tab, or just reading the notification banner, must not
   * flip the sender's label — so we also wait for the tab to become visible.
   */
  useEffect(() => {
    if (!onSeen) return;

    const report = () => {
      if (document.visibilityState === 'visible') onSeen(chat);
    };

    report();
    document.addEventListener('visibilitychange', report);
    window.addEventListener('focus', report);
    return () => {
      document.removeEventListener('visibilitychange', report);
      window.removeEventListener('focus', report);
    };
  }, [chat.id, chat.messages.length, onSeen]);

  const typingTimeoutRef = useRef<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend) return;

    if (onTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTyping(false);
    }

    onSendMessage(chat.id, textToSend, undefined, replyingTo || undefined);
    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);

    // Keep mobile virtual keyboard open continuously across sent messages
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleTriggerReply = (msg: Message) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  };

  const handleDoubleTapLike = (messageId: string) => {
    if (onReactMessage) {
      onReactMessage(chat.id, messageId, '❤️');
    }
  };

  const emojis = ['❤️', '😂', '🔥', '😮', '😢', '👏', '🌮', '🦇', '💯'];

  return (
    <div className="flex flex-col h-full w-full bg-transparent text-white select-none relative overflow-hidden font-sans min-h-0">
      {/* Top Liquid Glass Header */}
      <header className="flex-shrink-0 w-full h-[68px] flex items-center justify-between px-6 glass-header z-20">
        {/* Left: Contact Profile */}
        <div className="flex items-center space-x-3.5">
          {/* Mobile Back button */}
          <button
            onClick={onBack}
            className="p-1.5 -ml-2 text-zinc-300 hover:text-white rounded-full hover:bg-white/[0.08] transition active:scale-95 md:hidden"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          <div className="flex items-center space-x-3.5 cursor-pointer">
            <UserAvatar
              name={chat.name}
              src={chat.avatar}
              size="md"
            />
            <div className="flex flex-col justify-center">
              <span className="text-[16px] font-bold text-white tracking-tight leading-none">
                {chat.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-2 text-white relative">
          {onStartCall && (
            <button
              onClick={() => onStartCall(chat, 'audio')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition active:scale-95 cursor-pointer"
              title="Start audio call"
            >
              <Phone className="w-4 h-4 stroke-[2]" />
            </button>
          )}

          {/* Information Icon Button */}
          <div className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition active:scale-95 cursor-pointer ${
                showInfo
                  ? 'bg-[#0095F6] text-white border-blue-400'
                  : 'text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]'
              }`}
              title="Information"
            >
              <Info className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Info Popover Card */}
            {showInfo && (
              <div
                className="absolute top-12 right-0 w-64 glass-modal rounded-2xl p-3.5 shadow-2xl border border-white/20 animate-scaleUp text-left backdrop-blur-xl z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between space-x-2 pb-1.5 border-b border-white/10">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                    <Heart className="w-3.5 h-3.5 text-[#E60023] fill-[#E60023] animate-pulse" />
                    <span>Special Note</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInfo(false)}
                    className="text-zinc-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[12.5px] text-zinc-100 font-medium leading-relaxed mt-2 select-text">
                  "Built by Finny for his fav closest person"
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Message Feed Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-12 py-4 space-y-3.5 no-scrollbar">
        {/* Message Items with Swipe to Reply Gesture */}
        {chat.messages.map((msg, index) => {
          const isMe = msg.sender === 'me';
          const isHovered = hoveredMessageId === msg.id;
          const isLastMessage = index === chat.messages.length - 1;

          // Determine if we should show a time header (at start of chat, or >= 1 hour interval)
          const prevMsg = index > 0 ? chat.messages[index - 1] : null;
          const showTimeDivider = shouldShowTimeHeader(msg, prevMsg);

          return (
            <React.Fragment key={msg.id}>
              {/* 1-Hour Interval Weekday & Time Glass Pill Separator */}
              {showTimeDivider && (
                <div className="w-full flex justify-center py-2.5">
                  <span className="text-[12px] font-semibold text-zinc-300 tracking-wide bg-white/[0.06] backdrop-blur-md px-3.5 py-1 rounded-full border border-white/[0.08] shadow-sm">
                    {msg.dayHeader || currentRealTimeDayHeader}
                  </span>
                </div>
              )}

              <SwipeableMessage
                message={msg}
                isMe={isMe}
                onReply={handleTriggerReply}
                onOpenMenu={(m) => setActiveMenuMessage(m)}
                onDoubleTap={() => handleDoubleTapLike(msg.id)}
              >
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full animate-message-in`}>
                  {/* Forwarded label above message */}
                  {!isMe && msg.isForwarded && (
                    <div className="text-[12px] text-zinc-400 pl-11 mb-1 font-normal flex items-center space-x-1">
                      <span>{chat.name} forwarded a message</span>
                    </div>
                  )}

                  {/* Quoted Reply Preview Header (Visible to both Sender & Recipient) */}
                  {msg.replyTo && (
                    <div
                      className={`flex flex-col mb-1.5 max-w-[82%] md:max-w-[65%] lg:max-w-[55%] ${
                        isMe ? 'items-end' : 'items-start ml-11'
                      }`}
                    >
                      <span className="text-[12px] text-zinc-400 mb-1 mx-1 font-medium">
                        {isMe ? `You replied to ${chat.name}` : `${chat.name} replied`}
                      </span>
                      <div className="bg-white/[0.08] backdrop-blur-md text-zinc-300 text-[13px] px-3.5 py-2 rounded-[16px] border-l-[3px] border-[#0095F6] border-white/10 opacity-90 truncate max-w-full shadow-sm">
                        {msg.replyTo.text}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble Row with Continuous Hit-Area Hover Actions */}
                  <div
                    className={`relative flex items-end max-w-[85%] md:max-w-[70%] lg:max-w-[58%] ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                    onMouseEnter={() => {
                      if (window.innerWidth >= 768) setHoveredMessageId(msg.id);
                    }}
                    onMouseLeave={() => {
                      if (hoveredMessageId === msg.id) setHoveredMessageId(null);
                    }}
                  >
                    {/* Contact avatar on left for received messages */}
                    {!isMe && (
                      <UserAvatar
                        name={chat.name}
                        src={chat.avatar}
                        size="sm"
                        className="flex-shrink-0 mr-2.5 mb-1 shadow-md"
                      />
                    )}

                    {/* Bubble Container with Bridged Absolute Hover Actions */}
                    <div className="relative group cursor-grab active:cursor-grabbing min-w-0 max-w-full">
                      {/* Left Hover Actions for Sent Messages (ABSOLUTE POS with continuous hit area) */}
                      {isMe && (
                        <div
                          className={`hidden md:flex items-center space-x-1.5 text-zinc-400 absolute right-full top-1/2 -translate-y-1/2 whitespace-nowrap z-30 transition-opacity duration-150 pr-2 pl-4 py-1.5 ${
                            isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                          }`}
                        >
                          <span className="text-[11px] text-zinc-400 font-medium select-none">
                            {msg.timestamp}
                          </span>
                          <button
                            onClick={() => handleDoubleTapLike(msg.id)}
                            className="p-1 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
                            title="React"
                          >
                            <Smile className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTriggerReply(msg)}
                            className="p-1 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
                            title="Reply"
                          >
                            <CornerUpLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveMenuMessage(msg)}
                            className="p-1 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
                            title="More options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* The Message Bubble */}
                      <div
                        className={`px-4 py-2.5 rounded-[20px] text-[15px] leading-relaxed select-text break-words whitespace-pre-wrap [overflow-wrap:anywhere] overflow-hidden ${
                          isMe
                            ? 'glass-bubble-sent text-white rounded-br-[4px]'
                            : 'glass-bubble-received text-zinc-100 rounded-bl-[4px]'
                        }`}
                      >
                        {msg.mediaType === 'voice' ? (
                          <VoiceNotePlayer audioUrl={msg.mediaUrl} isMe={isMe} />
                        ) : msg.mediaType === 'video' && msg.mediaUrl ? (
                          <div className="space-y-1.5">
                            <video
                              src={msg.mediaUrl}
                              controls
                              playsInline
                              preload="metadata"
                              className="max-h-60 max-w-full rounded-xl cursor-pointer hover:opacity-95 transition"
                            />
                            {msg.text && (
                              <span className="break-words whitespace-pre-wrap [overflow-wrap:anywhere] block">
                                {msg.text}
                              </span>
                            )}
                          </div>
                        ) : msg.mediaType === 'image' && msg.mediaUrl ? (
                          <div className="space-y-1.5">
                            <img
                              src={msg.mediaUrl}
                              alt="Attachment"
                              className="max-h-60 rounded-xl object-cover cursor-pointer hover:opacity-95 transition"
                            />
                            {msg.text && (
                              <span className="break-words whitespace-pre-wrap [overflow-wrap:anywhere] block">
                                {msg.text}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
                            {msg.text}
                          </span>
                        )}
                      </div>

                      {/* Right Hover Actions for Received Messages (ABSOLUTE POS with continuous hit area) */}
                      {!isMe && (
                        <div
                          className={`hidden md:flex items-center space-x-1.5 text-zinc-400 absolute left-full top-1/2 -translate-y-1/2 whitespace-nowrap z-30 transition-opacity duration-150 pl-2 pr-4 py-1.5 ${
                            isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                          }`}
                        >
                          <button
                            onClick={() => handleDoubleTapLike(msg.id)}
                            className="p-1 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
                            title="React"
                          >
                            <Smile className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTriggerReply(msg)}
                            className="p-1 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
                            title="Reply"
                          >
                            <CornerUpLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveMenuMessage(msg)}
                            className="p-1 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
                            title="More options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] text-zinc-400 font-medium select-none">
                            {msg.timestamp}
                          </span>
                        </div>
                      )}

                      {/* Reaction badge (Tap to Remove) - Sleek Circular Pill */}
                      {msg.reaction && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReactionToRemove({
                              messageId: msg.id,
                              emoji: msg.reaction || '❤️'
                            });
                          }}
                          className={`absolute -bottom-2.5 ${
                            isMe ? 'right-2' : 'left-2'
                          } w-6 h-6 rounded-full bg-[#1b1b22] border border-white/20 flex items-center justify-center shadow-lg transition-transform active:scale-90 animate-badge-pop text-[12px] z-20 cursor-pointer hover:border-white/40`}
                          title="Tap to remove reaction"
                        >
                          <span className="leading-none">{msg.reaction}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/*
                    Sent / Delivered / Seen sits under your own last message
                    only — the moment they reply it is no longer the last
                    message and the label falls away, exactly like Instagram.
                  */}
                  {isMe && isLastMessage && <MessageStatus message={msg} chat={chat} />}
                </div>
              </SwipeableMessage>
            </React.Fragment>
          );
        })}

        {/* Partner Live Typing Indicator Bubble */}
        {isPartnerTyping && (
          <div className="flex items-center space-x-2.5 animate-fadeIn pl-2 py-2 mb-1">
            <UserAvatar
              name={chat.name}
              src={chat.avatar}
              size="sm"
              className="flex-shrink-0 shadow-md"
            />
            <div className="glass-bubble-received px-4 py-2.5 rounded-[18px] rounded-bl-[4px] flex items-center space-x-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4 flex-shrink-0" />
      </div>

      {/* Replying banner if active with Liquid Glass banner */}
      {replyingTo && (
        <div className="flex-shrink-0 px-4 md:px-12 py-2.5 glass-panel border-t border-white/[0.08] flex-shrink-0 z-20 animate-fadeIn">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-6 h-6 rounded-full bg-[#0095F6]/20 text-[#0095F6] flex items-center justify-center flex-shrink-0">
              <CornerUpLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs text-[#0095F6] font-semibold">
                Replying to {replyingTo.sender === 'me' ? 'yourself' : chat.name}
              </span>
              <span className="text-xs text-zinc-300 truncate max-w-md font-normal">
                {replyingTo.text}
              </span>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message Input Footer with Liquid Glass styling */}
      <footer className="px-3 pt-2 pb-3 md:px-6 md:py-3.5 glass-panel border-t border-white/[0.08] flex-shrink-0 z-20">
        <div
          className="glass-card flex items-center rounded-full px-3.5 py-1.5 md:py-2 border border-white/[0.14] focus-within:border-white/30 transition-all shadow-md w-full min-h-[42px]"
        >
          {isRecording ? (
            /* Active Live Voice Recording Pill */
            <div className="flex-1 flex items-center justify-between px-2 text-white">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-mono text-red-400 font-semibold">
                  {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-zinc-300">Recording voice note...</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="p-1.5 text-zinc-400 hover:text-red-400 transition"
                  title="Cancel Recording"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const recorded = await stopRecording();
                    if (recorded) {
                      // Upload voice blob to Supabase Storage for cross-account access
                      const publicUrl = await uploadMediaToSupabase(recorded.blob, 'voice-notes', 'webm');
                      const finalUrl = publicUrl || recorded.url; // fallback to local blob if upload fails
                      onSendMessage(chat.id, '', 'voice', replyingTo || undefined, finalUrl);
                      setReplyingTo(null);
                    }
                  }}
                  className="p-1.5 bg-[#0095F6] text-white rounded-full hover:bg-blue-600 transition"
                  title="Send Voice Note"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Left Emoji Picker Trigger */}
              <div className="relative flex-shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-zinc-400 hover:text-white transition"
                  title="Choose emoji"
                >
                  <Smile className="w-5 h-5 stroke-[1.8]" />
                </button>

                {/* Quick Emoji Bar Popup */}
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 glass-pill p-2 flex items-center space-x-2 rounded-2xl shadow-2xl z-40 border border-white/15 animate-scaleUp">
                    {['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-xl hover:scale-125 transition-transform active:scale-95 p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Composer Textarea (Disables Android Autofill Key/Card Bar completely) */}
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message..."
                enterKeyHint="send"
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="sentences"
                spellCheck={false}
                className="flex-1 bg-transparent text-[15.5px] text-white placeholder-zinc-400 focus:outline-none min-w-0 font-normal leading-[1.4] px-2.5 py-1 resize-none h-[34px] max-h-[100px] overflow-y-auto no-scrollbar"
              />

              {/* Right Action Icons */}
              {inputText.trim() ? (
                <button
                  type="button"
                  onClick={() => handleSend()}
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="text-[#0095F6] hover:text-blue-400 font-bold text-[14.5px] px-2.5 py-1 transition flex-shrink-0 drop-shadow-[0_1px_4px_rgba(0,149,246,0.5)] active:scale-95 cursor-pointer"
                >
                  Send
                </button>
              ) : (
                <div className="flex items-center space-x-2.5 text-zinc-300 flex-shrink-0 pr-0.5">
                  {/* Microphone: Click to Start Live Recording */}
                  <button
                    type="button"
                    onClick={() => startRecording()}
                    className="hover:text-white transition p-1"
                    title="Record voice note"
                  >
                    <Mic className="w-5 h-5 stroke-[1.8]" />
                  </button>

                  {/* Gallery Image Upload */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="hover:text-white transition p-1"
                    title="Add photo or video"
                  >
                    <ImageIcon className="w-5 h-5 stroke-[1.8]" />
                  </button>

                  {/* Heart reaction button */}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSendMessage(chat.id, '❤️');
                      requestAnimationFrame(() => inputRef.current?.focus());
                    }}
                    className="hover:text-red-500 transition p-1"
                    title="Send a heart"
                  >
                    <Heart className="w-5 h-5 stroke-[1.8] hover:fill-red-500" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const isVideo = file.type.startsWith('video/');
              const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
              const folder = isVideo ? 'videos' : 'images';

              // Upload to Supabase Storage for cross-account access
              const publicUrl = await uploadMediaToSupabase(file, folder, ext);
              const fallbackUrl = publicUrl || await uploadChatAttachment(file);

              if (fallbackUrl) {
                const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';
                onSendMessage(chat.id, '', mediaType, replyingTo || undefined, fallbackUrl);
                setReplyingTo(null);
              }
            }
            // Reset input so the same file can be re-selected
            e.target.value = '';
          }}
          accept="image/*,video/*"
          className="hidden"
        />
      </footer>

      {/* Remove Reaction Confirmation Modal with Liquid Glass */}
      {reactionToRemove && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn"
          onClick={() => setReactionToRemove(null)}
        >
          <div
            className="w-full max-w-[280px] glass-modal rounded-[28px] p-5 flex flex-col items-center text-center space-y-3.5 shadow-2xl animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-3xl shadow-inner">
              {reactionToRemove.emoji}
            </div>

            <div className="space-y-1">
              <h4 className="text-[16px] font-bold text-white">Remove reaction?</h4>
              <p className="text-[12px] text-zinc-400">
                You reacted {reactionToRemove.emoji} to this message.
              </p>
            </div>

            <div className="w-full space-y-2 pt-1 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  if (onReactMessage) {
                    onReactMessage(chat.id, reactionToRemove.messageId, '');
                  }
                  setReactionToRemove(null);
                }}
                className="w-full py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-semibold rounded-xl text-[14px] transition flex items-center justify-center space-x-1.5 active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>

              <button
                onClick={() => setReactionToRemove(null)}
                className="w-full py-2 text-zinc-400 hover:text-white text-[13px] font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Context Options & Super React Modal */}
      {activeMenuMessage && (
        <MessageActionMenu
          message={activeMenuMessage}
          chat={chat}
          allChats={allChats}
          onClose={() => setActiveMenuMessage(null)}
          onReact={(messageId, emoji) => {
            if (onReactMessage) onReactMessage(chat.id, messageId, emoji);
          }}
          onReply={(msg) => handleTriggerReply(msg)}
          onForward={(msg, targetChatId) => {
            if (onForwardMessage) onForwardMessage(msg, targetChatId);
          }}
          onUnsend={(messageId) => {
            if (onDeleteMessage) onDeleteMessage(chat.id, messageId);
          }}
        />
      )}
    </div>
  );
};
