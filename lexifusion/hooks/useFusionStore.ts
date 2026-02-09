/**
 * Fusion store hook: manages discovered fusions and favorites.
 * Strategy: 纯本地存储（无后端数据库）
 *  - 所有数据保存在本地 AsyncStorage
 *  - 支持离线使用
 */
import { useState, useEffect, useCallback } from 'react';
import { FusionDTO } from '@/lib/api';
import {
  getDiscoveredFusions as getLocalDiscoveries,
  addDiscoveredFusion as addLocalDiscovery,
  getFavoriteIds as getLocalFavoriteIds,
  toggleFavorite as toggleLocalFavorite,
} from '@/lib/fusionStore';
import type { StoredFusion } from '@/lib/fusionStoreTypes';

/** Unified discovery item used by UI */
export interface DiscoveryItem {
  discoveryId: string;
  id: string; // fusion id for compatibility
  from: [string, string];
  result: string;
  meaning: string;
  type: string;
  example?: string | null;
  icon?: string | null;
  concept?: string | null;
  suggestedWords?: string[] | null;
  association?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  discoveredAt: number;
  isFavorite: boolean;
}

function localFusionToItem(f: StoredFusion, favoriteIds: string[]): DiscoveryItem {
  return {
    discoveryId: f.id, // use fusion id as discovery id
    id: f.id,
    from: f.from as [string, string],
    result: f.result,
    meaning: f.meaning,
    type: f.type,
    example: f.example,
    icon: f.icon,
    concept: f.concept,
    suggestedWords: f.suggestedWords,
    association: f.association,
    imageUrl: f.imageUrl,
    imageUrls: f.imageUrls,
    discoveredAt: f.discoveredAt,
    isFavorite: favoriteIds.includes(f.id),
  };
}

export function useFusionStore() {
  const [discovered, setDiscovered] = useState<DiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // 直接使用本地存储
      const [localList, localFavIds] = await Promise.all([
        getLocalDiscoveries(),
        getLocalFavoriteIds(),
      ]);
      const items = localList.map((f) => localFusionToItem(f, localFavIds));
      setDiscovered(items);
    } catch {
      setDiscovered([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDiscovered = useCallback(async (fusion: FusionDTO, _wordAId: string, _wordBId: string) => {
    // 保存到本地存储
    const localFusion = {
      id: fusion.id,
      from: fusion.from as [string, string],
      result: fusion.result,
      meaning: fusion.meaning,
      type: fusion.type as 'compound' | 'phrase' | 'creative',
      example: fusion.example ?? undefined,
      icon: fusion.icon ?? undefined,
      concept: fusion.concept ?? undefined,
      suggestedWords: fusion.suggestedWords ?? undefined,
      association: fusion.association ?? undefined,
      imageUrl: fusion.imageUrl ?? undefined,
      imageUrls: fusion.imageUrls ?? undefined,
    };
    await addLocalDiscovery(localFusion);
    await refresh();
  }, [refresh]);

  const toggleFavorite = useCallback(async (discoveryId: string) => {
    // 使用本地存储切换收藏状态
    await toggleLocalFavorite(discoveryId);
    setDiscovered((prev) =>
      prev.map((d) =>
        d.discoveryId === discoveryId ? { ...d, isFavorite: !d.isFavorite } : d
      )
    );
    const item = discovered.find((d) => d.discoveryId === discoveryId);
    return item ? !item.isFavorite : false;
  }, [discovered]);

  const favorites = discovered.filter((d) => d.isFavorite);
  const favoriteIds = favorites.map((d) => d.id);

  return {
    discovered,
    favorites,
    favoriteIds,
    loading,
    refresh,
    addDiscovered,
    toggleFavorite,
  };
}
