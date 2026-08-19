import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Message, Chat } from '../types';
import { formatTime, formatChatListTime } from '../utils/dateUtils';
import { getReadReceiptsEnabled } from './useReadReceipts';

interface UseSupabaseChatProps {
  currentUser: { id: string; display_name: string; avatar_url: string } | null;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  selectedChat: Chat | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Best-effort persistence of a status transition; ignores schema gaps and non-UUID dummy IDs. */
const persistStatus = async (messageIds: string[], status: 'delivered' | 'read', readAt?: string) => {
  const validIds = messageIds.filter((id) => UUID_REGEX.test(id));
  if (validIds.length === 0) return;
  try {
    const updatePayload: any = { status };
    if (status === 'read' && readAt) {
      updatePayload.read_at = readAt;
    }
    await supabase.from('messages').update(updatePayload).in('id', validIds);
  } catch (e) {
    console.warn('Status persist notice:', e);
  }
};

export function useSupabaseChat({
  currentUser,
  setChats,
  selectedChat,
  setSelectedChat
}: UseSupabaseChatProps) {
  const [partnerTyping, setPartnerTyping] = useState<{ [chatId: string]: boolean }>({});
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    callerId: string;
    callerName: string;
    callerAvatar: string;
    callType: 'audio' | 'video';
  } | null>(null);
  const [callSignalState, setCallSignalState] = useState<{
    type: 'offered' | 'answered' | 'declined' | 'ended';
    payload?: any;
    timestamp?: number;
  } | null>(null);
  const [webRTCSignal, setWebRTCSignal] = useState<{
    senderId: string;
    signal: any;
    _seq: number;
  } | null>(null);
  const webRTCSeqRef = useRef(0);
  const webRTCSignalListeners = useRef<Set<(payload: { senderId: string; signal: any }) => void>>(new Set());

  const registerWebRTCSignalListener = useCallback((listener: (payload: { senderId: string; signal: any }) => void) => {
    webRTCSignalListeners.current.add(listener);
    return () => {
      webRTCSignalListeners.current.delete(listener);
    };
  }, []);

  const channelRef = useRef<any>(null);
  const channelReadyRef = useRef(false);
  const selectedChatRef = useRef<Chat | null>(null);
  const hasLoadedHistory = useRef(false);
  const ackedReadIds = useRef<Set<string>>(new Set());

  // Load persisted acked read IDs from localStorage on login
  useEffect(() => {
    if (!currentUser?.id) return;
    try {
      const key = `acked_read_${currentUser.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => ackedReadIds.current.add(id));
        }
      }
    } catch (e) {}
  }, [currentUser?.id]);

  // Keep ref in sync with selectedChat prop (avoids stale closures)
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // ─── 1. ONE-TIME Database History Load on Login ───
  useEffect(() => {
    if (!currentUser?.id || hasLoadedHistory.current) return;
    hasLoadedHistory.current = true;

    const loadHistory = async () => {
      const myId = currentUser.id;

      try {
        const { data: allMessages, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true });

        if (error || !allMessages || allMessages.length === 0) return;

        // Filter messages relevant to current user
        const dbMessages = allMessages.filter((row: any) => {
          if (!row) return false;
          if (row.sender_id === myId) return true;
          if (row.recipient_id === myId) return true;
          if (row.conversation_id && row.conversation_id.includes(myId)) return true;
          return false;
        });

        if (dbMessages.length === 0) return;

        // Extract partner IDs
        const partnerIds = new Set<string>();
        dbMessages.forEach((row: any) => {
          if (row.sender_id && row.sender_id !== myId) partnerIds.add(row.sender_id);
          if (row.recipient_id && row.recipient_id !== myId) partnerIds.add(row.recipient_id);
          if (row.conversation_id && row.conversation_id.includes('_')) {
            row.conversation_id.split('_').forEach((p: string) => {
              if (p && p !== myId) partnerIds.add(p);
            });
          }
        });

        // Fetch profiles
        const partnerMap = new Map<string, { display_name: string; avatar_url: string; is_online: boolean }>();
        if (partnerIds.size > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, is_online')
            .in('id', Array.from(partnerIds));
          if (profiles) {
            profiles.forEach((p: any) => {
              partnerMap.set(p.id, {
                display_name: p.display_name || 'User',
                avatar_url: p.avatar_url || '',
                is_online: p.is_online ?? true
              });
            });
          }
        }

        // Build chats from messages
        const chatMap = new Map<string, Chat>();
        dbMessages.forEach((row: any) => {
          let partnerId = '';
          if (row.sender_id && row.sender_id !== myId) partnerId = row.sender_id;
          else if (row.recipient_id && row.recipient_id !== myId) partnerId = row.recipient_id;
          else if (row.conversation_id && row.conversation_id.includes('_')) {
            partnerId = row.conversation_id.split('_').find((p: string) => p !== myId) || '';
          }
          if (!partnerId || partnerId === myId) return;

          const partner = partnerMap.get(partnerId) || { display_name: 'User', avatar_url: '', is_online: true };
          const isMe = row.sender_id === myId;
          const date = row.created_at ? new Date(row.created_at) : new Date();

          const msg: Message = {
            id: row.id,
            sender: isMe ? 'me' : 'them',
            text: row.text || '',
            mediaType: row.media_type || undefined,
            mediaUrl: row.media_url || undefined,
            reaction: row.reaction || undefined,
            isForwarded: row.is_forwarded || false,
            timestamp: formatTime(date),
            dayHeader: date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: 'numeric' }),
            createdAt: date.toISOString(),
            status: row.status || 'sent',
            readAt: row.read_at || (row.status === 'read' ? row.created_at : undefined),
            replyTo: row.reply_to_text ? { text: row.reply_to_text, senderName: row.reply_to_sender || '' } : undefined
          };

          if (!chatMap.has(partnerId)) {
            chatMap.set(partnerId, {
              id: partnerId,
              name: partner.display_name,
              username: '',
              avatar: partner.avatar_url,
              isOnline: partner.is_online,
              lastMessage: msg.text || 'Media',
              lastMessageTime: formatChatListTime(date),
              unreadCount: 0,
              readStatus: 'none',
              folder: 'all',
              messages: [msg]
            });
          } else {
            const chat = chatMap.get(partnerId)!;
            if (!chat.messages.some((m) => m.id === msg.id)) {
              chat.messages.push(msg);
              chat.lastMessage = msg.text || 'Media';
              chat.lastMessageTime = formatChatListTime(date);
            }
          }

          // Remember read message IDs so we never re-broadcast read receipts for old messages
          if (!isMe && row.status === 'read') {
            ackedReadIds.current.add(row.id);
          }
        });

        try {
          const key = `acked_read_${myId}`;
          localStorage.setItem(key, JSON.stringify(Array.from(ackedReadIds.current)));
        } catch (e) {}

        const loadedChats = Array.from(chatMap.values()).reverse();
        if (loadedChats.length > 0) {
          setChats((prev) => {
            const merged = [...loadedChats];
            prev.forEach((pChat) => {
              if (!merged.some((m) => m.id === pChat.id)) {
                merged.push(pChat);
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.warn('History load notice:', err);
      }
    };

    loadHistory();
  }, [currentUser?.id, setChats]);

  // ─── 2. Real-Time WebSocket Channel ───
  useEffect(() => {
    if (!currentUser?.id) return;
    const myId = currentUser.id;

    channelReadyRef.current = false;
    const channel = supabase.channel('pinterest_realtime_v7', {
      config: { broadcast: { self: false } }
    });
    channelRef.current = channel;

    // ── Receipt helpers (shared by the incoming-message and receipt handlers) ──

    const isWindowVisible = () =>
      typeof document === 'undefined' || document.visibilityState === 'visible';

    /**
     * We only report "Seen" for threads we are allowed to report on: receipts
     * must be switched on, and message requests stay silent until accepted.
     */
    const canSendReceipts = (chat: Chat | null) =>
      getReadReceiptsEnabled() && !!chat && !chat.isRequest;

    const sendReceipt = (
      event: 'message_delivered' | 'message_read',
      forSenderId: string,
      messageIds: string[]
    ) => {
      if (!channelRef.current || messageIds.length === 0) return;
      const at = new Date().toISOString();
      channelRef.current.send({
        type: 'broadcast',
        event,
        payload: {
          forSenderId,
          messageIds,
          readerId: myId,
          readerName: currentUser?.display_name || 'User',
          at
        }
      });
      if (event === 'message_read') {
        persistStatus(messageIds, 'read', at);
      }
    };

    /** Applies an inbound receipt to our own outgoing messages. */
    const applyReceipt = (
      messageIds: string[],
      status: 'delivered' | 'read',
      payload: any
    ) => {
      if (messageIds.length === 0) return;
      const ids = new Set(messageIds);
      const at = payload?.at || new Date().toISOString();

      setChats((prevChats: Chat[]) =>
        prevChats.map((chat) => {
          if (!chat.messages.some((m) => ids.has(m.id))) return chat;

          const updatedMessages = chat.messages.map((m) => {
            if (!ids.has(m.id) || m.sender !== 'me') return m;
            // Never walk a message backwards down the ladder.
            if (m.status === 'read') return m;

            if (status === 'delivered') {
              return { ...m, status: 'delivered' as const, deliveredAt: m.deliveredAt || at };
            }

            const readerId = payload?.readerId;
            const readerName = payload?.readerName || 'Someone';
            const readBy = m.readBy ? [...m.readBy] : [];
            if (readerId && !readBy.some((r) => r.id === readerId)) {
              readBy.push({ id: readerId, name: readerName, readAt: at });
            }

            return {
              ...m,
              status: 'read' as const,
              deliveredAt: m.deliveredAt || at,
              readAt: at,
              readBy
            };
          });

          const updated: Chat = { ...chat, messages: updatedMessages };
          if (selectedChatRef.current?.id === chat.id) setSelectedChat(updated);
          return updated;
        })
      );

      persistStatus(messageIds, status, at);
    };

    channel
      .on('broadcast', { event: 'instant_message' }, ({ payload }) => {
        if (!payload || !myId) return;
        const { senderId, senderName, senderAvatar, recipientId, sharedConvId, message } = payload;
        if (senderId === myId) return;

        const isForMe =
          recipientId === myId ||
          (sharedConvId && sharedConvId.includes(myId));
        if (!isForMe) return;

        const incomingMsg: Message = {
          ...message,
          sender: 'them',
          status: 'delivered',
          deliveredAt: new Date().toISOString()
        };

        // It reached this device, so tell the sender "Delivered" right away.
        sendReceipt('message_delivered', senderId, [incomingMsg.id]);

        const threadIsOpen =
          selectedChatRef.current?.id === senderId ||
          (sharedConvId && selectedChatRef.current?.id === sharedConvId) ||
          (selectedChatRef.current?.name && senderName && selectedChatRef.current.name.toLowerCase() === senderName.toLowerCase());
        if (threadIsOpen && canSendReceipts(selectedChatRef.current) && isWindowVisible()) {
          ackedReadIds.current.add(incomingMsg.id);
          try {
            const key = `acked_read_${myId}`;
            localStorage.setItem(key, JSON.stringify(Array.from(ackedReadIds.current)));
          } catch (e) {}
          sendReceipt('message_read', senderId, [incomingMsg.id]);
        }

        setChats((prevChats: Chat[]) => {
          const existingIndex = prevChats.findIndex(
            (c) => c.id === senderId || c.id === sharedConvId
          );

          if (existingIndex !== -1) {
            return prevChats.map((c, i) => {
              if (i === existingIndex) {
                if (c.messages.some((m) => m.id === incomingMsg.id)) return c;
                const updated: Chat = {
                  ...c,
                  name: senderName || c.name,
                  avatar: senderAvatar || c.avatar,
                  lastMessage: incomingMsg.text || 'Media',
                  lastMessageTime: incomingMsg.timestamp || 'Just now',
                  unreadCount: (c.unreadCount || 0) + (selectedChatRef.current?.id === c.id ? 0 : 1),
                  messages: [...c.messages, incomingMsg]
                };
                if (selectedChatRef.current?.id === c.id) {
                  setSelectedChat(updated);
                }
                return updated;
              }
              return c;
            });
          } else {
            const newChat: Chat = {
              id: senderId,
              name: senderName || 'User',
              username: '',
              avatar: senderAvatar || '',
              isOnline: true,
              lastMessage: incomingMsg.text || 'Media',
              lastMessageTime: incomingMsg.timestamp || 'Just now',
              unreadCount: 1,
              readStatus: 'none',
              folder: 'all',
              messages: [incomingMsg]
            };
            return [newChat, ...prevChats];
          }
        });
      })

      .on('broadcast', { event: 'message_delivered' }, ({ payload }) => {
        if (!payload) return;
        applyReceipt(payload.messageIds || [], 'delivered', payload);
      })

      .on('broadcast', { event: 'message_read' }, ({ payload }) => {
        if (!payload) return;
        console.log('[Realtime] Inbound message_read receipt received:', payload);
        // Their receipts reached us, but if ours are switched off we have given
        // up the right to see them — the trade cuts both ways.
        if (!getReadReceiptsEnabled()) {
          applyReceipt(payload.messageIds || [], 'delivered', payload);
          return;
        }
        applyReceipt(payload.messageIds || [], 'read', payload);
      })

      .on('broadcast', { event: 'typing_status' }, ({ payload }) => {
        if (!payload || !myId) return;
        const { senderId, recipientId, isTyping } = payload;
        if (recipientId === myId) {
          setPartnerTyping((prev) => ({ ...prev, [senderId]: isTyping }));
        }
      })

      .on('broadcast', { event: 'instant_reaction' }, ({ payload }) => {
        if (!payload) return;
        const { messageId, emoji, targetId } = payload;
        setChats((prevChats: Chat[]) =>
          prevChats.map((chat) => {
            const hasMsg = chat.messages.some((m) => m.id === messageId);
            if (hasMsg || chat.id === targetId) {
              const updatedMessages = chat.messages.map((m) =>
                m.id === messageId ? { ...m, reaction: emoji || undefined } : m
              );
              const updated: Chat = { ...chat, messages: updatedMessages };
              if (selectedChatRef.current?.id === chat.id) setSelectedChat(updated);
              return updated;
            }
            return chat;
          })
        );
      })

      // ── Call Signaling Listeners ──
      .on('broadcast', { event: 'call_offer' }, ({ payload }) => {
        if (!payload || !myId) return;
        const { callerId, callerName, callerAvatar, recipientId, recipientName, callType, callId } = payload;
        if (callerId === myId) return;

        const isForMe =
          recipientId === myId ||
          (recipientName && currentUser?.display_name && recipientName.toLowerCase() === currentUser.display_name.toLowerCase());

        if (isForMe) {
          setIncomingCall({
            callId,
            callerId,
            callerName: callerName || 'User',
            callerAvatar: callerAvatar || '',
            callType: callType || 'audio'
          });
        }
      })

      .on('broadcast', { event: 'call_answer' }, ({ payload }) => {
        if (!payload || !myId) return;
        const { callerId, recipientId } = payload;
        if (callerId === myId || recipientId === myId) {
          setCallSignalState({ type: 'answered', payload, timestamp: Date.now() });
        }
      })

      .on('broadcast', { event: 'call_decline' }, ({ payload }) => {
        if (!payload || !myId) return;
        const { callerId, recipientId } = payload;
        if (callerId === myId || recipientId === myId) {
          setIncomingCall(null);
          setCallSignalState({ type: 'declined', payload, timestamp: Date.now() });
        }
      })

      .on('broadcast', { event: 'call_end' }, ({ payload }) => {
        if (!payload || !myId) return;
        const { callerId, recipientId } = payload;
        if (callerId === myId || recipientId === myId) {
          setIncomingCall(null);
          setCallSignalState({ type: 'ended', payload, timestamp: Date.now() });
        }
      })

      .on('broadcast', { event: 'webrtc_signal' }, ({ payload }) => {
        if (!payload || !myId) return;
        const { senderId, targetId, signal } = payload;
        console.log('[WebRTC-Signal] Received:', signal?.type, 'from:', senderId, 'target:', targetId, 'myId:', myId, 'isSelf:', senderId === myId);
        if (senderId === myId) return;
        const isForMe =
          !targetId ||
          targetId === myId ||
          (currentUser?.display_name && targetId.toLowerCase() === currentUser.display_name.toLowerCase());
        console.log('[WebRTC-Signal] isForMe:', isForMe);
        if (isForMe) {
          // Immediately notify registered listeners synchronously (no React batching loss)
          webRTCSignalListeners.current.forEach((fn) => {
            try {
              fn({ senderId, signal });
            } catch (err) {
              console.error('[WebRTC] Listener execution error:', err);
            }
          });

          webRTCSeqRef.current += 1;
          setWebRTCSignal({ senderId, signal, _seq: webRTCSeqRef.current });
        }
      })

      // ── Database Fallback Listener: Delivers messages even if broadcast is blocked ──
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const row = payload.new;
          if (!row || row.sender_id === myId) return;
          if (row.recipient_id !== myId && !row.conversation_id?.includes(myId)) return;

          console.log('[Supabase DB Realtime] Inbound message row received:', row.id);

          const date = row.created_at ? new Date(row.created_at) : new Date();
          const incomingMsg: Message = {
            id: row.id,
            sender: 'them',
            text: row.text || '',
            mediaType: row.media_type || undefined,
            mediaUrl: row.media_url || undefined,
            reaction: row.reaction || undefined,
            isForwarded: row.is_forwarded || false,
            timestamp: formatTime(date),
            dayHeader: date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: 'numeric' }),
            createdAt: date.toISOString(),
            status: row.status || 'delivered',
            replyTo: row.reply_to_text ? { text: row.reply_to_text, senderName: row.reply_to_sender || '' } : undefined
          };

          setChats((prevChats: Chat[]) => {
            const senderId = row.sender_id;
            const sharedConvId = row.conversation_id;
            const existingIndex = prevChats.findIndex(
              (c) => c.id === senderId || c.id === sharedConvId
            );

            if (existingIndex !== -1) {
              return prevChats.map((c, i) => {
                if (i === existingIndex) {
                  if (c.messages.some((m) => m.id === incomingMsg.id)) return c;
                  const updated: Chat = {
                    ...c,
                    lastMessage: incomingMsg.text || 'Media',
                    lastMessageTime: incomingMsg.timestamp || 'Just now',
                    unreadCount: (c.unreadCount || 0) + (selectedChatRef.current?.id === c.id ? 0 : 1),
                    messages: [...c.messages, incomingMsg]
                  };
                  if (selectedChatRef.current?.id === c.id) {
                    setSelectedChat(updated);
                  }
                  return updated;
                }
                return c;
              });
            } else {
              const newChat: Chat = {
                id: senderId,
                name: 'User',
                username: '',
                avatar: '',
                isOnline: true,
                lastMessage: incomingMsg.text || 'Media',
                lastMessageTime: incomingMsg.timestamp || 'Just now',
                unreadCount: 1,
                readStatus: 'none',
                folder: 'all',
                messages: [incomingMsg]
              };
              return [newChat, ...prevChats];
            }
          });
        }
      )

      .subscribe((status, err) => {
        console.log('[Supabase Realtime] Channel subscription status:', status, err);
        if (status === 'SUBSCRIBED') {
          channelReadyRef.current = true;
          console.log('[Supabase Realtime] ✅ Channel is SUBSCRIBED and ready for broadcast!');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          channelReadyRef.current = false;
          console.warn('[Supabase Realtime] ⚠️ Channel error/timeout, will retry...');
          // Auto-retry subscription after 3 seconds
          setTimeout(() => {
            try {
              supabase.removeChannel(channel);
            } catch (e) {}
            // The useEffect cleanup + re-run will handle re-subscription
          }, 3000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, currentUser?.display_name, setChats, setSelectedChat]);

  // ─── Report "Seen" for a thread the user has actually opened ───
  /**
   * Called when a thread is opened (and while it stays open in the foreground).
   * Reaching their phone was already reported as "Delivered"; this is the step
   * that upgrades the sender's label to "Seen", and it deliberately requires
   * the thread to be on screen rather than merely notified.
   */
  const markChatAsRead = useCallback(
    (chat: Chat | null) => {
      if (!chat || !currentUser?.id || !channelRef.current) return;
      if (!getReadReceiptsEnabled()) return;
      // A message request stays silent until it is accepted and opened in full.
      if (chat.isRequest) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

      const unacked = chat.messages
        .filter((m) => m.sender === 'them' && !ackedReadIds.current.has(m.id))
        .map((m) => m.id);

      if (unacked.length === 0) return;
      unacked.forEach((id) => ackedReadIds.current.add(id));
      try {
        const key = `acked_read_${currentUser.id}`;
        localStorage.setItem(key, JSON.stringify(Array.from(ackedReadIds.current)));
      } catch (e) {}

      const at = new Date().toISOString();
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'message_read',
          payload: {
            forSenderId: chat.id,
            messageIds: unacked,
            readerId: currentUser.id,
            readerName: currentUser.display_name || 'User',
            at
          }
        });
      }

      // Persist to DB so it remains "Seen" permanently across sessions
      persistStatus(unacked, 'read', at);
    },
    [currentUser?.id, currentUser?.display_name]
  );

  // ─── Send Typing ───
  const sendTypingStatus = useCallback(
    (recipientId: string, isTyping: boolean) => {
      if (channelRef.current && channelReadyRef.current && currentUser?.id) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing_status',
          payload: { senderId: currentUser.id, recipientId, isTyping }
        });
      }
    },
    [currentUser?.id]
  );

  // ─── Send Message (Broadcast + Database Insert) ───
  const pushMessageToSupabase = async (
    targetChatId: string,
    message: Message,
    targetChatName?: string
  ) => {
    if (!currentUser?.id) return;

    const senderId = currentUser.id;
    let recipientId = targetChatId;

    // Resolve UUID if needed
    if (!recipientId.includes('-') && targetChatName) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .ilike('display_name', targetChatName.trim())
        .maybeSingle();
      if (data?.id) recipientId = data.id;
    }

    const sharedConvId = [senderId, recipientId].sort().join('_');

    // Generate a proper UUID for the database row
    const dbUUID = crypto.randomUUID();

    // 1. Broadcast to online clients instantly
    if (channelRef.current && channelReadyRef.current) {
      console.log('[Realtime] Broadcasting instant_message to channel (SUBSCRIBED)');
      channelRef.current.send({
        type: 'broadcast',
        event: 'instant_message',
        payload: {
          senderId,
          senderName: currentUser.display_name,
          senderAvatar: currentUser.avatar_url,
          recipientId,
          recipientName: targetChatName,
          sharedConvId,
          message: { ...message, id: dbUUID }
        }
      });
    } else {
      console.warn('[Realtime] Channel NOT subscribed yet — message will be delivered via DB fallback.');
    }

    // 2. Persist to PostgreSQL (uses UUID so postgres_changes fallback works)
    try {
      const { error } = await supabase.from('messages').insert({
        id: dbUUID,
        conversation_id: sharedConvId,
        sender_id: senderId,
        recipient_id: recipientId,
        text: message.text || '',
        media_type: message.mediaType || null,
        media_url: message.mediaUrl || null,
        reaction: message.reaction || null,
        is_forwarded: message.isForwarded || false,
        status: 'sent',
        reply_to_text: message.replyTo?.text || null,
        reply_to_sender: message.replyTo?.senderName || null,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error('Message DB insert error:', error);
      }
    } catch (e) {
      console.error('Message DB insert exception:', e);
    }
  };

  // Broadcast Reaction
  const pushReactionToSupabase = (chatId: string, messageId: string, emoji: string) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'instant_reaction',
        payload: { targetId: chatId, messageId, emoji }
      });
    }
  };

  // Broadcast Unsend
  const pushUnsendToSupabase = (chatId: string, messageId: string) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'instant_unsend',
        payload: { targetId: chatId, messageId }
      });
    }
  };

  // Send Call Offer
  const sendCallOffer = useCallback((recipientId: string, recipientName: string, callType: 'audio' | 'video' = 'audio', callId: string = `call-${Date.now()}`) => {
    setCallSignalState(null);
    setWebRTCSignal(null);
    if (channelRef.current && currentUser?.id) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'call_offer',
        payload: {
          callId,
          callerId: currentUser.id,
          callerName: currentUser.display_name,
          callerAvatar: currentUser.avatar_url,
          recipientId,
          recipientName,
          callType
        }
      });
    }
  }, [currentUser]);

  // Send Call Answer
  const sendCallAnswer = useCallback((callerId: string, callId: string) => {
    setCallSignalState(null);
    setWebRTCSignal(null);
    if (channelRef.current && currentUser?.id) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'call_answer',
        payload: {
          callId,
          callerId,
          recipientId: currentUser.id
        }
      });
    }
  }, [currentUser]);

  // Send Call Decline
  const sendCallDecline = useCallback((callerId: string, callId: string) => {
    if (channelRef.current && currentUser?.id) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'call_decline',
        payload: {
          callId,
          callerId,
          recipientId: currentUser.id
        }
      });
    }
  }, [currentUser]);

  // Send Call End
  const sendCallEnd = useCallback((partnerId: string, callId: string) => {
    if (channelRef.current && currentUser?.id) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'call_end',
        payload: {
          callId,
          callerId: currentUser.id,
          recipientId: partnerId
        }
      });
    }
  }, [currentUser]);

  // Send WebRTC Signal (SDP offer/answer / ICE candidate)
  const sendWebRTCSignal = useCallback((targetId: string, signal: any) => {
    if (channelRef.current && currentUser?.id) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'webrtc_signal',
        payload: {
          senderId: currentUser.id,
          targetId,
          signal
        }
      });
    }
  }, [currentUser]);

  return {
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
  };
}
