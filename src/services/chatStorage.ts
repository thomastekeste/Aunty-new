/**
 * chatStorage — Persist and retrieve per-aunty chat histories.
 *
 * Each aunty gets her own AsyncStorage key so conversations are independent.
 * Caps at MAX_MESSAGES per aunty to prevent unbounded growth.
 * Writes are debounced at 800 ms so rapid message bursts don't thrash storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuntyId } from '../constants/aunties';

const KEY_PREFIX = 'chat_history_v1_';
const MAX_MESSAGES = 200;

export interface StoredMessage {
  id: string;
  text: string;
  sender: 'user' | 'aunty';
  timestamp: string;
  imageUri?: string;
}

function storageKey(auntyId: AuntyId): string {
  return `${KEY_PREFIX}${auntyId}`;
}

export async function loadChat(auntyId: AuntyId): Promise<StoredMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(auntyId));
    if (!raw) return [];
    return JSON.parse(raw) as StoredMessage[];
  } catch {
    return [];
  }
}

export async function saveChat(
  auntyId: AuntyId,
  messages: StoredMessage[],
): Promise<void> {
  try {
    // Trim to most recent MAX_MESSAGES before writing
    const trimmed = messages.length > MAX_MESSAGES
      ? messages.slice(messages.length - MAX_MESSAGES)
      : messages;
    await AsyncStorage.setItem(storageKey(auntyId), JSON.stringify(trimmed));
  } catch {
    // Silent — data stays in memory for the session
  }
}

export async function clearChat(auntyId: AuntyId): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKey(auntyId));
  } catch {
    // Silent
  }
}

// ─── Debounced save helper ─────────────────────────────────────

const _saveTimers: Partial<Record<AuntyId, ReturnType<typeof setTimeout>>> = {};

export function debouncedSaveChat(
  auntyId: AuntyId,
  messages: StoredMessage[],
  delayMs = 800,
): void {
  const existing = _saveTimers[auntyId];
  if (existing) clearTimeout(existing);
  _saveTimers[auntyId] = setTimeout(() => {
    saveChat(auntyId, messages);
    delete _saveTimers[auntyId];
  }, delayMs);
}
