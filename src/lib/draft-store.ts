'use client';

import { useSyncExternalStore } from 'react';

export interface ArticleDraftItem {
  id: string; // 'draft-' + timestamp or unique ID
  title: string;
  slug?: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
  tags: string;
  coverImage?: string;
  showOnLandingPage: boolean;
  updatedAt: string; // ISO string
}

export const ARTICLE_DRAFTS_STORAGE_KEY = 'amelia_saved_article_drafts_v1';
export const ARTICLE_DRAFTS_UPDATED_EVENT = 'amelia-drafts-updated';

let cachedRaw: string | null = null;
let cachedDrafts: ArticleDraftItem[] = [];
const emptyDrafts: ArticleDraftItem[] = [];

function dispatchDraftsUpdatedEvent(): void {
  cachedRaw = null;
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(ARTICLE_DRAFTS_UPDATED_EVENT));
    } catch {
      // Ignore errors in environments that restrict CustomEvent
    }
  }
}

/**
 * Safely retrieves all saved article drafts from localStorage,
 * sorted descending by updatedAt (most recently modified first).
 */
export function getSavedDrafts(): ArticleDraftItem[] {
  if (typeof window === 'undefined') return emptyDrafts;

  try {
    const raw = localStorage.getItem(ARTICLE_DRAFTS_STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedDrafts;
    }
    cachedRaw = raw;
    if (!raw) {
      cachedDrafts = emptyDrafts;
      return cachedDrafts;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cachedDrafts = emptyDrafts;
      return cachedDrafts;
    }

    const drafts: ArticleDraftItem[] = parsed
      .filter((item): item is Record<string, unknown> => item && typeof item === 'object')
      .map((item) => ({
        id: String(item.id || `draft-${Date.now()}`),
        title: String(item.title || ''),
        slug: item.slug ? String(item.slug) : undefined,
        category: String(item.category || 'Kesehatan Mental Islami'),
        readTime: String(item.readTime || '1 menit baca'),
        excerpt: String(item.excerpt || ''),
        content: String(item.content || ''),
        tags: String(item.tags || ''),
        coverImage: item.coverImage ? String(item.coverImage) : undefined,
        showOnLandingPage: Boolean(item.showOnLandingPage),
        updatedAt: String(item.updatedAt || new Date().toISOString()),
      }));

    // Sort descending by updatedAt
    cachedDrafts = drafts.sort((a, b) => {
      const timeA = new Date(a.updatedAt).getTime() || 0;
      const timeB = new Date(b.updatedAt).getTime() || 0;
      return timeB - timeA;
    });

    return cachedDrafts;
  } catch {
    return emptyDrafts;
  }
}

/**
 * Saves a new draft or updates an existing draft.
 * If draft.id is provided and exists, updates in place with new updatedAt timestamp.
 * Otherwise creates a new ID and prepends to the collection.
 */
export function saveDraft(
  draft: Omit<ArticleDraftItem, 'id' | 'updatedAt'> & { id?: string }
): ArticleDraftItem {
  const currentDrafts = getSavedDrafts();
  const now = new Date().toISOString();

  const draftId = draft.id || `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const itemToSave: ArticleDraftItem = {
    ...draft,
    id: draftId,
    updatedAt: now,
  };

  const existingIndex = currentDrafts.findIndex((d) => d.id === draftId);
  let updatedList: ArticleDraftItem[];

  if (existingIndex >= 0) {
    updatedList = [...currentDrafts];
    updatedList[existingIndex] = itemToSave;
    // Move updated draft to front
    const [moved] = updatedList.splice(existingIndex, 1);
    updatedList.unshift(moved);
  } else {
    updatedList = [itemToSave, ...currentDrafts];
  }

  // Cap maximum saved drafts to 20 to protect localStorage capacity
  if (updatedList.length > 20) {
    updatedList = updatedList.slice(0, 20);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ARTICLE_DRAFTS_STORAGE_KEY, JSON.stringify(updatedList));
      dispatchDraftsUpdatedEvent();
    } catch {
      // Storage full or restricted
    }
  }

  return itemToSave;
}

/**
 * Deletes a draft by ID.
 */
export function deleteDraft(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const currentDrafts = getSavedDrafts();
    const updated = currentDrafts.filter((d) => d.id !== id);
    localStorage.setItem(ARTICLE_DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    dispatchDraftsUpdatedEvent();
  } catch {}
}

/**
 * Retrieves a single draft by ID.
 */
export function getDraftById(id: string): ArticleDraftItem | null {
  const drafts = getSavedDrafts();
  return drafts.find((d) => d.id === id) || null;
}

/**
 * Clears all saved drafts from localStorage.
 */
export function clearAllDrafts(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ARTICLE_DRAFTS_STORAGE_KEY);
    dispatchDraftsUpdatedEvent();
  } catch {}
}

/**
 * Subscribes to changes in saved article drafts.
 */
export function subscribeArticleDrafts(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleUpdate = () => {
    cachedRaw = null;
    callback();
  };

  window.addEventListener(ARTICLE_DRAFTS_UPDATED_EVENT, handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener(ARTICLE_DRAFTS_UPDATED_EVENT, handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

/**
 * Reactive React hook to observe saved article drafts via useSyncExternalStore.
 */
export function useArticleDrafts(): ArticleDraftItem[] {
  return useSyncExternalStore(
    subscribeArticleDrafts,
    getSavedDrafts,
    () => emptyDrafts
  );
}

/**
 * Formats ISO string into localized human-readable date and time.
 */
export function formatDraftDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Baru saja';

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  } catch {
    return 'Baru saja';
  }
}
