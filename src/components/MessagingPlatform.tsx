import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { SearchBar } from './SearchBar';
import { ChatList } from './ChatList';
import { ChatDetail } from './ChatDetail';
import { BottomNav } from './BottomNav';
import { ProfileView } from './ProfileView';
import { CallsView } from './CallsView';
import { NewChatModal } from './NewChatModal';
import { AudioCallModal } from './AudioCallModal';
import { IncomingCallModal } from './IncomingCallModal';
import { OptionsMenuModal } from './OptionsMenuModal';
import { ChatContextMenu } from './ChatContextMenu';
import { DeviceFrame } from './DeviceFrame';
import { INITIAL_CHATS, INITIAL_CALLS } from '../data/mockData';
import { Chat, MainTabType, FilterFolderType, Message } from '../types';
import { formatTime, formatDayHeader, formatChatListTime } from '../utils/dateUtils';
import { FaPinterest } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';
import { useSupabaseChat } from '../hooks/useSupabaseChat';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface MessagingPlatformProps {
  onBackToPinterest?: () => void;
}

export const MessagingPlatform: React.FC<MessagingPlatformProps> = ({ onBackToPinterest }) => {
  const { user, profile } = useAuth();

  const currentAuthUser = profile || (user ? {
    id: user.id,
    display_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
    avatar_url: user.user_metadata?.avatar_url || ''
  } : null);

  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const key = currentAuthUser?.id ? `chats_${currentAuthUser.id}` : 'pinterest_real_chats';
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [calls, setCalls] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<MainTabType>('messages');
  const [currentFolder, setCurrentFolder] = useState<FilterFolderType>('All Messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [contextMenuChat, setContextMenuChat] = useState<Chat | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<{ chat: Chat; type: 'audio' | 'video'; isIncoming?: boolean } | null>(null);

  // Persist real chats to localStorage per user
  useEffect(() => {
    if (!currentAuthUser?.id) return;
    try {
      localStorage.setItem(`chats_${currentAuthUser.id}`, JSON.stringify(chats));
    } catch (e) {}
  }, [chats, currentAuthUser?.id]);

  const {
    markChatAsRead,
    pushMessageToSupabase,
    pushReactionToSupabase,
    pushUnsendToSupabase,
    sendTypingStatus,
    partnerTyping,
    incomingCall,
    setIncomingCall,
    callSignalState,
    webRTCSignal,
    registerWebRTCSignalListener,
    sendWebRTCSignal,
    sendCallOffer,
    sendCallAnswer,
    sendCallDecline,
    sendCallEnd
  } = useSupabaseChat({
    currentUser: currentAuthUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat
  });

  // Call Handlers
  const handleStartCall = (chat: Chat, type: 'audio' | 'video' = 'audio') => {
    sendCallOffer(chat.id, chat.name, type);
    setActiveCall({ chat, type, isIncoming: false });

    // Log outgoing call in calls tab
    setCalls((prev) => [
      {
        id: `call-${Date.now()}`,
        contactName: chat.name,
        contactAvatar: chat.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        type,
        direction: 'outgoing',
        time: formatTime(new Date()),
        date: 'Today'
      },
      ...prev
    ]);
  };

  const handleAcceptIncomingCall = () => {
    if (!incomingCall) return;
    sendCallAnswer(incomingCall.callerId, incomingCall.callId);

    const partnerChat: Chat = chats.find((c) => c.id === incomingCall.callerId) || {
      id: incomingCall.callerId,
      name: incomingCall.callerName,
      username: '',
      avatar: incomingCall.callerAvatar,
      isOnline: true,
      lastMessage: 'Audio Call',
      lastMessageTime: 'Just now',
      messages: []
    };

    setActiveCall({ chat: partnerChat, type: incomingCall.callType, isIncoming: true });
    setIncomingCall(null);

    // Log incoming call in calls tab
    setCalls((prev) => [
      {
        id: `call-${Date.now()}`,
        contactName: incomingCall.callerName,
        contactAvatar: incomingCall.callerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        type: incomingCall.callType,
        direction: 'incoming',
        time: formatTime(new Date()),
        date: 'Today'
      },
      ...prev
    ]);
  };

  const handleDeclineIncomingCall = () => {
    if (!incomingCall) return;
    sendCallDecline(incomingCall.callerId, incomingCall.callId);

    // Log missed call in calls tab
    setCalls((prev) => [
      {
        id: `call-${Date.now()}`,
        contactName: incomingCall.callerName,
        contactAvatar: incomingCall.callerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        type: incomingCall.callType,
        direction: 'missed',
        time: formatTime(new Date()),
        date: 'Today'
      },
      ...prev
    ]);

    setIncomingCall(null);
  };

  const handleEndActiveCall = () => {
    if (activeCall) {
      sendCallEnd(activeCall.chat.id, `call-${Date.now()}`);
      setActiveCall(null);
    }
  };
  
  // Auto-detect viewport width
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [globalUsers, setGlobalUsers] = useState<any[]>([]);

  // Search registered users from Supabase profiles table
  useEffect(() => {
    if (!searchQuery.trim()) {
      setGlobalUsers([]);
      return;
    }

    const query = searchQuery.trim();
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, is_online')
          .ilike('display_name', `%${query}%`)
          .limit(8);

        if (!error && data && isMounted) {
          // Filter out yourself and already active chats
          const existingIds = new Set(chats.map((c) => c.id));
          const myId = profile?.id || user?.id;
          const filtered = data.filter((u: any) => !existingIds.has(u.id) && u.id !== myId);
          setGlobalUsers(filtered);
        }
      } catch (err) {
        console.warn('User search notice:', err);
      }
    };

    const timer = setTimeout(fetchUsers, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, chats, user, profile]);

  // Start chat with any searched user
  const handleStartChatWithGlobalUser = (targetUser: any) => {
    const existing = chats.find(
      (c) => c.id === targetUser.id || c.name.toLowerCase() === targetUser.display_name.toLowerCase()
    );

    if (existing) {
      setSelectedChat(existing);
      setSearchQuery('');
      return;
    }

    const newChat: Chat = {
      id: targetUser.id || `chat-${Date.now()}`,
      name: targetUser.display_name,
      username: '',
      avatar: targetUser.avatar_url || '',
      isOnline: targetUser.is_online ?? true,
      lastMessage: 'Started a new conversation',
      lastMessageTime: 'Just now',
      messages: [],
      unreadCount: 0,
      readStatus: 'none',
      folder: 'all'
    };

    setChats((prev) => [newChat, ...prev]);
    setSelectedChat(newChat);
    setSearchQuery('');
  };

  // Filter chats by Folder, Archive status, and Search query
  const filteredChats = chats.filter((c) => {
    if (c.isBlocked) return false;

    if (currentFolder === 'Archived') {
      return c.isArchived;
    }
    if (c.isArchived) return false;

    if (currentFolder === 'Unread' && (!c.unreadCount || c.unreadCount === 0)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Send message handler with real-time day and time formatting
  const handleSendMessage = (
    chatId: string,
    messageText: string,
    mediaType?: 'image' | 'video' | 'voice' | 'link',
    replyTo?: Message,
    mediaUrl?: string
  ) => {
    const now = new Date();
    const realTimeStr = formatTime(now);
    const dayHeaderStr = formatDayHeader(now);
    const chatListTimeStr = formatChatListTime(now);

    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'me',
      text: messageText,
      mediaType,
      mediaUrl: mediaUrl || (mediaType === 'image' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' : undefined),
      replyTo: replyTo
        ? {
            text: replyTo.text || (replyTo.mediaType === 'image' ? 'Photo' : replyTo.mediaType === 'video' ? 'Video' : replyTo.mediaType === 'voice' ? 'Voice message' : 'Media attachment'),
            senderName: replyTo.sender === 'me' ? 'You' : selectedChat?.name,
            mediaUrl: replyTo.mediaUrl,
            mediaType: replyTo.mediaType
          }
        : undefined,
      timestamp: realTimeStr,
      dayHeader: dayHeaderStr,
      createdAt: now.toISOString(),
      status: 'sending'
    };

    // Sync with Supabase Realtime, then settle the bubble on "Sent". Delivered
    // and Seen arrive later as receipts from the recipient's device.
    pushMessageToSupabase(chatId, newMessage, selectedChat?.name).then(() => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id !== chatId) return chat;
          const updatedChat = {
            ...chat,
            messages: chat.messages.map((m) =>
              m.id === newMessage.id && m.status === 'sending'
                ? { ...m, status: 'sent' as const }
                : m
            )
          };
          setSelectedChat((cur) => (cur?.id === chatId ? updatedChat : cur));
          return updatedChat;
        })
      );
    });

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          const displayLastMsg = messageText || (mediaType === 'voice' ? 'Voice message 🎙️' : mediaType === 'video' ? 'Video 🎬' : 'Photo 📷');
          const updatedChat = {
            ...chat,
            lastMessage: displayLastMsg,
            lastMessageTime: chatListTimeStr,
            messages: [...chat.messages, newMessage]
          };
          if (selectedChat?.id === chatId) {
            setSelectedChat(updatedChat);
          }
          return updatedChat;
        }
        return chat;
      })
    );
  };

  const handleSelectChat = (chat: Chat) => {
    const updated = { ...chat, unreadCount: 0 };
    setChats((prev) => prev.map((c) => (c.id === chat.id ? updated : c)));
    setSelectedChat(updated);
    // Opening the thread is what upgrades their label from Delivered to Seen.
    markChatAsRead(updated);
  };

  // Message Actions
  const handleForwardMessage = (message: Message, targetChatId: string) => {
    const now = new Date();
    const forwardedMsg: Message = {
      id: crypto.randomUUID(),
      sender: 'me',
      text: message.text,
      isForwarded: true,
      forwardedLabel: 'Forwarded a message',
      timestamp: formatTime(now),
      dayHeader: formatDayHeader(now),
      createdAt: now.toISOString(),
      status: 'sent'
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === targetChatId
          ? {
              ...c,
              lastMessage: message.text || 'Forwarded message',
              lastMessageTime: formatChatListTime(now),
              messages: [...c.messages, forwardedMsg]
            }
          : c
      )
    );
  };

  const handleDeleteMessage = (chatId: string, messageId: string) => {
    pushUnsendToSupabase(chatId, messageId);

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const updatedMessages = c.messages.filter((m) => m.id !== messageId);
          const updatedChat = { ...c, messages: updatedMessages };
          if (selectedChat?.id === chatId) {
            setSelectedChat(updatedChat);
          }
          return updatedChat;
        }
        return c;
      })
    );
  };

  // Add / Remove Reaction
  const handleReactMessage = (chatId: string, messageId: string, emoji: string) => {
    pushReactionToSupabase(chatId, messageId, emoji);

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const updatedMessages = c.messages.map((m) => {
            if (m.id === messageId) {
              return { ...m, reaction: emoji ? emoji : undefined };
            }
            return m;
          });
          const updatedChat = { ...c, messages: updatedMessages };
          if (selectedChat?.id === chatId) {
            setSelectedChat(updatedChat);
          }
          return updatedChat;
        }
        return c;
      })
    );
  };

  // Context Menu Actions for Chat Card
  const handleTogglePin = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleToggleMute = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isMuted: !c.isMuted } : c))
    );
  };

  const handleToggleRead = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          const newCount = c.unreadCount && c.unreadCount > 0 ? 0 : 1;
          return { ...c, unreadCount: newCount };
        }
        return c;
      })
    );
  };

  const handleToggleArchive = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isArchived: !c.isArchived } : c))
    );
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  };

  const handleBlockChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isBlocked: !c.isBlocked } : c))
    );
  };
  const handleQuickReaction = (chatId: string, emoji: string) => {
    handleSendMessage(chatId, emoji);
  };

  const handleCreateNewChat = (name: string, username?: string) => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      name,
      username: username || '',
      avatar: '',
      lastMessage: 'Started a new conversation',
      lastMessageTime: 'Just now',
      messages: [],
      unreadCount: 0,
      readStatus: 'none',
      folder: 'all'
    };
    setChats((prev) => [newChat, ...prev]);
    setSelectedChat(newChat);
  };

  const activeSelectedChat = selectedChat
    ? chats.find(
        (c) =>
          c.id === selectedChat.id ||
          (c.name && selectedChat.name && c.name.toLowerCase() === selectedChat.name.toLowerCase())
      ) || selectedChat
    : null;

  return (
    <DeviceFrame>
      {/* Back to Pinterest Top Banner (when accessed from outer app) */}
      {onBackToPinterest && (
        <div className="w-full h-11 px-5 flex items-center justify-between border-b border-white/[0.08] bg-black/90 backdrop-blur-md z-40 flex-shrink-0">
          <button
            onClick={onBackToPinterest}
            className="flex items-center space-x-2 text-zinc-300 hover:text-white transition group py-1"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-semibold tracking-wide">Back to Pinterest</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 h-full w-full flex min-h-0 overflow-hidden bg-transparent">
        {isDesktop ? (
          /* ================= DESKTOP EXPANDED 2-COLUMN VIEW ================= */
          <div className="flex h-full w-full min-h-0 overflow-hidden">
            {/* Left Sidebar with Liquid Glass Panel */}
            <div className="w-[360px] lg:w-[400px] h-full flex flex-col justify-between border-r border-white/[0.08] glass-panel flex-shrink-0 min-h-0">
              <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
                {activeTab === 'messages' && (
                  <>
                    <div className="flex-shrink-0">
                      <Header
                        currentFolder={currentFolder}
                        onSelectFolder={setCurrentFolder}
                        onNewMessage={() => setIsNewChatOpen(true)}
                        onOpenMenu={() => setIsOptionsMenuOpen(true)}
                      />
                      <SearchBar query={searchQuery} onChange={setSearchQuery} />
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <ChatList
                        chats={filteredChats}
                        activeChatId={activeSelectedChat?.id}
                        onSelectChat={handleSelectChat}
                        onOpenContextMenu={(chat) => setContextMenuChat(chat)}
                        searchQuery={searchQuery}
                        globalUsers={globalUsers}
                        onStartChatWithUser={handleStartChatWithGlobalUser}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'calls' && (
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <CallsView
                      calls={calls}
                      chats={chats}
                      onStartCall={handleStartCall}
                    />
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <ProfileView />
                  </div>
                )}
              </div>

              {/* Bottom Navigation Dock */}
              <div className="flex-shrink-0">
                <BottomNav
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  unreadCount={chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
                />
              </div>
            </div>

            {/* Right Column: Liquid Glass Chat Panel */}
            <div className="flex-1 h-full min-h-0 bg-transparent flex flex-col overflow-hidden">
              {activeSelectedChat ? (
                <ChatDetail
                  chat={activeSelectedChat}
                  allChats={chats}
                  onBack={() => {}}
                  onSendMessage={handleSendMessage}
                  onForwardMessage={handleForwardMessage}
                  onDeleteMessage={handleDeleteMessage}
                  onReactMessage={handleReactMessage}
                  onStartCall={handleStartCall}
                  isPartnerTyping={Boolean(partnerTyping[activeSelectedChat.id])}
                  onTyping={(isTyping) => sendTypingStatus(activeSelectedChat.id, isTyping)}
                  onSeen={markChatAsRead}
                  isMobileView={false}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-3">
                  <div className="w-16 h-16 rounded-3xl glass-card flex items-center justify-center border border-white/10 shadow-lg">
                    <FaPinterest className="w-9 h-9 text-[#E60023]" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Pinterest Messages</h3>
                  <p className="text-sm text-zinc-400">Select a chat from the left panel to begin</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= MOBILE VIEW (Single Screen) ================= */
          <div className="flex-1 h-full w-full flex flex-col min-h-0 relative bg-transparent overflow-hidden">
            {activeSelectedChat ? (
              /* Active Chat View */
              <ChatDetail
                chat={activeSelectedChat}
                allChats={chats}
                onBack={() => setSelectedChat(null)}
                onSendMessage={handleSendMessage}
                onForwardMessage={handleForwardMessage}
                onDeleteMessage={handleDeleteMessage}
                onReactMessage={handleReactMessage}
                onStartCall={handleStartCall}
                isPartnerTyping={Boolean(partnerTyping[activeSelectedChat.id])}
                onTyping={(isTyping) => sendTypingStatus(activeSelectedChat.id, isTyping)}
                onSeen={markChatAsRead}
                isMobileView={true}
              />
            ) : (
              /* Tab Screens with Liquid Glass Panel */
              <div className="flex-1 h-full flex flex-col justify-between min-h-0 glass-panel">
                <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
                  {activeTab === 'messages' && (
                    <>
                      <div className="flex-shrink-0">
                        <Header
                          currentFolder={currentFolder}
                          onSelectFolder={setCurrentFolder}
                          onNewMessage={() => setIsNewChatOpen(true)}
                          onOpenMenu={() => setIsOptionsMenuOpen(true)}
                        />
                        <SearchBar query={searchQuery} onChange={setSearchQuery} />
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <ChatList
                          chats={filteredChats}
                          onSelectChat={handleSelectChat}
                          onOpenContextMenu={(chat) => setContextMenuChat(chat)}
                          searchQuery={searchQuery}
                          globalUsers={globalUsers}
                          onStartChatWithUser={handleStartChatWithGlobalUser}
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'calls' && (
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <CallsView
                        calls={calls}
                        chats={chats}
                        onStartCall={handleStartCall}
                      />
                    </div>
                  )}

                  {activeTab === 'profile' && (
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <ProfileView />
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <BottomNav
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    unreadCount={chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Long-Press Context Menu Modal */}
      {contextMenuChat && (
        <ChatContextMenu
          chat={contextMenuChat}
          onClose={() => setContextMenuChat(null)}
          onTogglePin={handleTogglePin}
          onToggleMute={handleToggleMute}
          onToggleRead={handleToggleRead}
          onToggleArchive={handleToggleArchive}
          onDeleteChat={handleDeleteChat}
          onBlockChat={handleBlockChat}
          onQuickReaction={handleQuickReaction}
          onOpenChat={(chat) => {
            handleSelectChat(chat);
            setContextMenuChat(null);
          }}
        />
      )}

      {/* Compose Modal */}
      {isNewChatOpen && (
        <NewChatModal
          contacts={chats}
          onClose={() => setIsNewChatOpen(false)}
          onSelectChat={handleSelectChat}
          onCreateChat={handleCreateNewChat}
        />
      )}

      {/* Options Menu Modal */}
      {isOptionsMenuOpen && (
        <OptionsMenuModal
          onClose={() => setIsOptionsMenuOpen(false)}
        />
      )}

      {/* Incoming Call Ringing Modal */}
      {incomingCall && (
        <IncomingCallModal
          caller={{
            id: incomingCall.callerId,
            name: incomingCall.callerName,
            avatar: incomingCall.callerAvatar
          }}
          callType={incomingCall.callType}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />
      )}

      {/* Active Audio / Video Call Screen */}
      {activeCall && (
        <AudioCallModal
          chat={activeCall.chat}
          type={activeCall.type}
          isIncoming={activeCall.isIncoming}
          callSignalState={callSignalState}
          webRTCSignal={webRTCSignal}
          registerWebRTCSignalListener={registerWebRTCSignalListener}
          sendWebRTCSignal={sendWebRTCSignal}
          onEndCall={handleEndActiveCall}
        />
      )}
    </DeviceFrame>
  );
};
