/**
 * 融合发现与收藏的本地存储（Web 端使用 localStorage，避免 AsyncStorage 在 Web 上的模块解析问题）
 */
import type { FusionResult } from '@/data/themes';
import type { StoredFusion } from './fusionStoreTypes';

export type { StoredFusion } from './fusionStoreTypes';

const KEY_DISCOVERED = '@lexifusion/discovered';
const KEY_FAVORITES = '@lexifusion/favorites';

function getItem(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota / security errors
  }
}

export async function getDiscoveredFusions(): Promise<StoredFusion[]> {
  const raw = getItem(KEY_DISCOVERED);
  if (!raw) return [];
  try {
    const list: StoredFusion[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function addDiscoveredFusion(fusion: FusionResult): Promise<void> {
  const list = await getDiscoveredFusions();
  if (list.some((f) => f.id === fusion.id)) return;
  const stored: StoredFusion = { ...fusion, discoveredAt: Date.now() };
  list.unshift(stored);
  setItem(KEY_DISCOVERED, JSON.stringify(list.slice(0, 200)));
}

export async function getFavoriteIds(): Promise<string[]> {
  const raw = getItem(KEY_FAVORITES);
  if (!raw) return [];
  try {
    const list: string[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(fusionId: string): Promise<boolean> {
  const ids = await getFavoriteIds();
  const i = ids.indexOf(fusionId);
  if (i >= 0) {
    ids.splice(i, 1);
  } else {
    ids.push(fusionId);
  }
  setItem(KEY_FAVORITES, JSON.stringify(ids));
  return ids.includes(fusionId);
}

export async function isFavorite(fusionId: string): Promise<boolean> {
  const ids = await getFavoriteIds();
  return ids.includes(fusionId);
}
