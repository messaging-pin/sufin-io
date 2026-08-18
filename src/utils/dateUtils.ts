import { Message } from '../types';

export const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
};

export const formatDayHeader = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[date.getDay()];
  const timeStr = formatTime(date);
  return `${dayName} ${timeStr}`;
};

export const formatChatListTime = (date: Date): string => {
  const now = new Date();
  const isToday =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  if (isToday) {
    return formatTime(date);
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

/**
 * Returns true if a time header divider should be displayed between messages.
 * Only shows for:
 * 1. The first message in conversation
 * 2. When more than 1 hour (60 minutes) has passed since the previous message
 * 3. When the calendar day changes
 */
export const shouldShowTimeHeader = (
  currentMsg: Message,
  prevMsg: Message | null
): boolean => {
  if (!prevMsg) return true;

  const currentMillis = currentMsg.createdAt
    ? new Date(currentMsg.createdAt).getTime()
    : null;
  const prevMillis = prevMsg.createdAt
    ? new Date(prevMsg.createdAt).getTime()
    : null;

  if (currentMillis && prevMillis && !isNaN(currentMillis) && !isNaN(prevMillis)) {
    const diffHours = (currentMillis - prevMillis) / (1000 * 60 * 60);
    if (diffHours >= 1) return true;

    const currentDate = new Date(currentMillis).toDateString();
    const prevDate = new Date(prevMillis).toDateString();
    return currentDate !== prevDate;
  }

  // Fallback if timestamps are string labels
  return false;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Instagram-style "Seen" label. This is a single feature rendered at different
 * ages, not separate statuses — the same receipt reads "Seen just now" in the
 * first minute, then ages into the exact read time, then into a coarser date.
 *
 *   < 1 minute ago   → "Seen just now"
 *   earlier today    → "Seen 3:42 PM"
 *   yesterday        → "Seen yesterday"
 *   this year        → "Seen Mar 4"
 *   older            → "Seen Mar 4, 2024"
 *
 * Restricted accounts get "Seen" with no timestamp attached.
 */
export const formatSeenLabel = (
  readAt?: string,
  now: Date = new Date(),
  withoutTimestamp = false
): string => {
  if (withoutTimestamp || !readAt) return 'Seen';

  const then = new Date(readAt);
  if (isNaN(then.getTime())) return 'Seen';

  // If seen within the first minute (< 60s), show "Seen just now"
  const diffMs = now.getTime() - then.getTime();
  if (diffMs < 60 * 1000) {
    return 'Seen just now';
  }

  // After 1 minute, show the exact tracked time (e.g. "Seen 5:43 am")
  let hours = then.getHours();
  const minutes = then.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  return `Seen ${hours}:${minutesStr} ${ampm}`;
};

/**
 * Group threads name everyone who has opened the thread rather than
 * collapsing to a single "Seen".
 */
export const formatSeenByLabel = (
  readBy: { name: string }[] = [],
  maxNames = 3
): string => {
  const names = readBy.map((r) => r.name).filter(Boolean);
  if (names.length === 0) return 'Seen';
  if (names.length <= maxNames) {
    if (names.length === 1) return `Seen by ${names[0]}`;
    return `Seen by ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  }
  return `Seen by ${names.slice(0, maxNames).join(', ')} +${names.length - maxNames}`;
};
