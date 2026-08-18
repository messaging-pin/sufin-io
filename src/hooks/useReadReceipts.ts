import { useSyncExternalStore, useEffect, useState } from 'react';

const STORAGE_KEY = 'pinterest_show_read_receipts';

const readStoredValue = (): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return true; // on by default, like Instagram
    return saved === 'true';
  } catch (e) {
    return true;
  }
};

let enabled = readStoredValue();
const listeners = new Set<() => void>();

/**
 * Read receipts are a two-way trade: while this is off we neither report our
 * own "Seen" to other people, nor surface theirs to us. Kept in a module-level
 * store so the setting screens, the chat thread and the realtime layer all read
 * the exact same value without threading a provider through the tree.
 */
export const getReadReceiptsEnabled = (): boolean => enabled;

export const setReadReceiptsEnabled = (value: boolean) => {
  if (enabled === value) return;
  enabled = value;
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch (e) {}
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function useReadReceipts(): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(subscribe, getReadReceiptsEnabled, getReadReceiptsEnabled);
  return [value, setReadReceiptsEnabled];
}

/**
 * Re-renders on an interval so an aging "Seen just now" rolls over into the
 * exact read time on its own, without a message or navigation event.
 */
export function useNow(intervalMs = 10_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
