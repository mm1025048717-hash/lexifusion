/**
 * 融合发现与收藏的本地存储
 * 在 SSR/静态生成环境（无 window）下不访问 AsyncStorage，避免 500
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FusionResult } from '@/data/themes';

const KEY_DISCOVERED = '@lexifusion/discovered';
const KEY_FAVORITES = '@lexifusion/favorites';

/** 是否在可安全使用 AsyncStorage 的环境（有 window 的浏览器；Node 下为 false，避免 SSR/静态生成 500） */
const canUseStorage = typeof window !== 'undefined';

/** 带时间戳的融合记录，用于去重与排序 */
export type StoredFusion = FusionResult & { discoveredAt: number };

export async function getDiscoveredFusions(): Promise<StoredFusion[]> {
  if (!canUseStorage) return [];
  try {
    const raw = await AsyncStorage.getItem(KEY_DISCOVERED);
    if (!raw) return [];
    const list: StoredFusion[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function addDiscoveredFusion(fusion: FusionResult): Promise<void> {
  if (!canUseStorage) return;
  const list = await getDiscoveredFusions();
  if (list.some((f) => f.id === fusion.id)) return;
  const stored: StoredFusion = { ...fusion, discoveredAt: Date.now() };
  list.unshift(stored);
  await AsyncStorage.setItem(KEY_DISCOVERED, JSON.stringify(list.slice(0, 200)));
}

export async function getFavoriteIds(): Promise<string[]> {
  if (!canUseStorage) return [];
  try {
    const raw = await AsyncStorage.getItem(KEY_FAVORITES);
    if (!raw) return [];
    const list: string[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(fusionId: string): Promise<boolean> {
  if (!canUseStorage) return false;
  const ids = await getFavoriteIds();
  const i = ids.indexOf(fusionId);
  if (i >= 0) {
    ids.splice(i, 1);
  } else {
    ids.push(fusionId);
  }
  await AsyncStorage.setItem(KEY_FAVORITES, JSON.stringify(ids));
  return ids.includes(fusionId);
}

export async function isFavorite(fusionId: string): Promise<boolean> {
  if (!canUseStorage) return false;
  const ids = await getFavoriteIds();
  return ids.includes(fusionId);
}
