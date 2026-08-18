export interface Message {
  id: string;
  sender: 'me' | 'them';
  text?: string;
  isForwarded?: boolean;
  forwardedLabel?: string;
  replyTo?: {
    text: string;
    senderName?: string;
  };
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'voice' | 'link';
  timestamp?: string;
  createdAt?: string;
  dayHeader?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  /** ISO time the message landed on the recipient's device */
  deliveredAt?: string;
  /** ISO time the recipient actually opened the thread and rendered this message */
  readAt?: string;
  /** Group threads list who has seen it instead of a plain "Seen" */
  readBy?: { id: string; name: string; readAt: string }[];
  isLiked?: boolean;
  reaction?: string;
  translatedText?: string;
  isTranslated?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  username: string;
  avatar: string;
  avatarBg?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  readStatus?: 'single-check' | 'double-check-teal' | 'none';
  folder?: 'all' | 'unread' | 'groups' | 'archived';
  isOnline?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  isBlocked?: boolean;
  /** Group threads show "Seen by <names>" instead of a single "Seen" */
  isGroup?: boolean;
  /** Message requests only start reporting "Seen" once accepted and opened */
  isRequest?: boolean;
  /** Restricted accounts show "Seen" with no timestamp attached */
  isRestricted?: boolean;
  messages: Message[];
}

export interface CallItem {
  id: string;
  contactName: string;
  contactAvatar: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  time: string;
  date: string;
  duration?: string;
}

export type CallRecord = CallItem;

export interface ContactItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  statusText: string;
  isOnline: boolean;
}

export interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  website?: string;
  postsCount: number;
  followersCount: string;
  followingCount: string;
  isVerified?: boolean;
}

export interface StoryItem {
  id: string;
  imageUrl: string;
  timestamp: string;
  caption?: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  isUserStory?: boolean;
  hasUnseen: boolean;
  items: StoryItem[];
}

export type MainTabType = 'calls' | 'messages' | 'profile';
export type FilterFolderType = 'All Messages' | 'Unread' | 'Groups' | 'Archived';
