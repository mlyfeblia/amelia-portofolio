'use client';

import { useSyncExternalStore } from 'react';
import type { DimensionKey } from '@/data/assessment-data';

export interface DimensionRecordSummary {
  key: DimensionKey;
  name: string;
  shortName: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'optimal' | 'moderate' | 'need_attention';
  advice?: string;
}

export interface DeviceAssessmentRecord {
  id: string;
  savedAt: string; // ISO string
  dateFormatted: string; // Readable Indonesian date
  totalScore: number;
  maxScore: number;
  percentage: number;
  level: string;
  category: string;
  summary: string;
  dimensions: DimensionRecordSummary[];
  recs: string[];
}

const STORAGE_KEY = 'amel_device_assessment_history';

let cachedRaw: string | null = null;
let cachedRecords: DeviceAssessmentRecord[] = [];
const emptyAssessments: DeviceAssessmentRecord[] = [];

function formatIndonesianDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Baru Saja';
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Baru Saja';
  }
}

/**
 * Retrieve saved assessment records from current device/browser localStorage
 */
export function getDeviceAssessments(): DeviceAssessmentRecord[] {
  if (typeof window === 'undefined') return emptyAssessments;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedRecords;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedRecords = emptyAssessments;
      return cachedRecords;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cachedRecords = emptyAssessments;
      return cachedRecords;
    }
    cachedRecords = parsed.filter(
      (item): item is DeviceAssessmentRecord =>
        Boolean(item && typeof item === 'object' && typeof item.id === 'string' && typeof item.totalScore === 'number')
    );
    return cachedRecords;
  } catch {
    return emptyAssessments;
  }
}

/**
 * Subscribe to changes in assessment history (cross-tab and within-app)
 */
export function subscribeDeviceAssessments(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('amel_assessment_storage_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('amel_assessment_storage_change', callback);
  };
}

function notifySubscribers() {
  if (typeof window !== 'undefined') {
    cachedRaw = null;
    window.dispatchEvent(new Event('amel_assessment_storage_change'));
  }
}

/**
 * React hook using useSyncExternalStore to subscribe to device assessments
 */
export function useDeviceAssessments(): DeviceAssessmentRecord[] {
  return useSyncExternalStore(
    subscribeDeviceAssessments,
    getDeviceAssessments,
    () => emptyAssessments
  );
}

/**
 * Persist a newly completed assessment result to this device
 */
export function saveDeviceAssessment(
  entry: Omit<DeviceAssessmentRecord, 'id' | 'savedAt' | 'dateFormatted'>
): DeviceAssessmentRecord {
  const now = new Date();
  const id = `as_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const savedAt = now.toISOString();
  const dateFormatted = formatIndonesianDateTime(savedAt);

  const newRecord: DeviceAssessmentRecord = {
    ...entry,
    id,
    savedAt,
    dateFormatted,
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = getDeviceAssessments();
      // Keep up to 20 most recent assessments
      const updated = [newRecord, ...existing].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifySubscribers();
    } catch {
      // Fallback for private mode or quota
    }
  }

  return newRecord;
}

/**
 * Delete a single assessment record by its id
 */
export function deleteDeviceAssessment(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getDeviceAssessments();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifySubscribers();
  } catch {
    // Ignore
  }
}

/**
 * Clear all assessment records from this device
 */
export function clearDeviceAssessments(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    notifySubscribers();
  } catch {
    // Ignore
  }
}
