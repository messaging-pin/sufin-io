import React from 'react';
import { Chat, Message } from '../types';
import { formatSeenLabel, formatSeenByLabel } from '../utils/dateUtils';
import { useReadReceipts, useNow } from '../hooks/useReadReceipts';

interface MessageStatusProps {
  message: Message;
  chat: Chat;
}

/**
 * Text-only status indicator that sits under your own last message.
 * Displays clean words only ("Sent", "Sending", "Seen") without tick mark icons.
 */
export const MessageStatus: React.FC<MessageStatusProps> = ({ message, chat }) => {
  const [receiptsEnabled] = useReadReceipts();
  const now = useNow();

  const isGroup = Boolean(chat.isGroup) || chat.folder === 'groups';

  // With our own receipts switched off, a read message presents as Sent
  const status = !receiptsEnabled && message.status === 'read' ? 'sent' : message.status;

  let label: string;
  let tone = 'text-zinc-500';

  switch (status) {
    case 'read': {
      label = isGroup
        ? formatSeenByLabel(message.readBy)
        : formatSeenLabel(message.readAt, now, Boolean(chat.isRestricted));
      tone = 'text-zinc-400';
      break;
    }
    case 'sending':
      label = 'Sending';
      break;
    case 'delivered':
    case 'sent':
    default:
      label = 'Sent';
      tone = 'text-zinc-500';
      break;
  }

  return (
    <div
      className={`flex items-center justify-end pr-1 pt-1 text-[11px] font-medium tracking-wide select-none animate-fadeIn ${tone}`}
      title={message.readAt && status === 'read' ? new Date(message.readAt).toLocaleString() : undefined}
    >
      <span>{label}</span>
    </div>
  );
};

