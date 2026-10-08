'use client';

import { useSyncExternalStore } from 'react';

export interface DeviceBookingRecord {
  code: string;
  name?: string;
  category?: string;
  date?: string;
  timeSlot?: string;
  savedAt: string;
}

const STORAGE_KEY = 'amel_device_bookings_history';

let cachedRaw: string | null = null;
let cachedRecords: DeviceBookingRecord[] = [];
const emptyBookings: DeviceBookingRecord[] = [];

/**
 * Retrieve saved booking references from current device/browser localStorage
 */
export function getDeviceBookings(): DeviceBookingRecord[] {
  if (typeof window === 'undefined') return emptyBookings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedRecords = emptyBookings;
      return cachedRecords;
    }
    if (raw === cachedRaw) {
      return cachedRecords;
    }
    cachedRaw = raw;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cachedRecords = emptyBookings;
      return cachedRecords;
    }
    cachedRecords = parsed.filter(
      (item): item is DeviceBookingRecord =>
        Boolean(item && typeof item === 'object' && typeof item.code === 'string')
    );
    return cachedRecords;
  } catch {
    return emptyBookings;
  }
}

/**
 * Subscribe to changes in device bookings history (cross-tab and within-app)
 */
export function subscribeDeviceBookings(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('amel_booking_storage_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('amel_booking_storage_change', callback);
  };
}

function notifySubscribers() {
  if (typeof window !== 'undefined') {
    cachedRaw = null;
    cachedRecords = [];
    window.dispatchEvent(new Event('amel_booking_storage_change'));
  }
}

/**
 * React hook using useSyncExternalStore to subscribe to device bookings
 */
export function useDeviceBookings(): DeviceBookingRecord[] {
  return useSyncExternalStore(
    subscribeDeviceBookings,
    getDeviceBookings,
    () => emptyBookings
  );
}

/**
 * Persist a newly created or tracked booking reference to current device
 */
export function saveDeviceBooking(entry: {
  code: string;
  name?: string;
  category?: string;
  date?: string;
  timeSlot?: string;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanCode = entry.code.trim().toUpperCase();
    if (!cleanCode) return;

    const existing = getDeviceBookings();
    // Remove if already exists to move it to the top
    const filtered = existing.filter((b) => b.code.toUpperCase() !== cleanCode);

    const newRecord: DeviceBookingRecord = {
      code: cleanCode,
      name: entry.name,
      category: entry.category,
      date: entry.date,
      timeSlot: entry.timeSlot,
      savedAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...filtered].slice(0, 20); // Keep max 20 recent bookings
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    cachedRaw = null;
    cachedRecords = [];
    notifySubscribers();
  } catch {
    // localStorage might be unavailable in private browsing mode
  }
}

/**
 * Remove a specific booking reference from current device
 */
export function removeDeviceBooking(code: string): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanCode = code.trim().toUpperCase();
    const existing = getDeviceBookings();
    const updated = existing.filter((b) => b.code.toUpperCase() !== cleanCode);
    if (updated.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    cachedRaw = null;
    cachedRecords = [];
    notifySubscribers();
  } catch {
    // ignore
  }
}

/**
 * Clear all booking references from current device
 */
export function clearAllDeviceBookings(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    cachedRaw = null;
    cachedRecords = [];
    notifySubscribers();
  } catch {
    // ignore
  }
}
