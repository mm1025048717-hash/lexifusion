/**
 * Fusion store hook: manages discovered fusions and favorites.
 * Strategy: API-first with local cache fallback.
 *  - Reads from API (authoritative source)
 *  - Caches results locally for offline access
 *  - Falls back to local cache when API is unreachable
 */
import { useState, useEffect, useCallback } from 'react';
import {
  apiGetDiscoveries,
  apiToggleFavorite,
  apiRecordDiscovery,
  DiscoveryDTO,
  FusionDTO,
} from '@/lib/api';
import { ensureAuth } from '@/lib/auth';
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

function apiDiscoveryToItem(d: DiscoveryDTO): DiscoveryItem {
  return {
    discoveryId: d.discoveryId,
    id: d.fusion.id,
    from: d.fusion.from,
    result: d.fusion.result,
    meaning: d.fusion.meaning,
    type: d.fusion.type,
    example: d.fusion.example,
    icon: d.fusion.icon,
    concept: d.fusion.concept,
    suggestedWords: d.fusion.suggestedWords,
    association: d.fusion.association,
    imageUrl: d.fusion.imageUrl,
    imageUrls: d.fusion.imageUrls,
    discoveredAt: new Date(d.discoveredAt).getTime(),
    isFavorite: d.isFavorite,
  };
}

function localFusionToItem(f: StoredFusion, favoriteIds: string[]): DiscoveryItem {
  return {
    discoveryId: f.id, // use fusion id as discovery id for local fallback
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
  const [isOnline, setIsOnline] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Try API first
      await ensureAuth();
      const apiDiscoveries = await apiGetDiscoveries();
      const items = apiDiscoveries.map(apiDiscoveryToItem);
      setDiscovered(items);
      setIsOnline(true);
    } catch {
      // Fallback to local storage
      try {
        const [localList, localFavIds] = await Promise.all([
          getLocalDiscoveries(),
          getLocalFavoriteIds(),
        ]);
        const items = localList.map((f) => localFusionToItem(f, localFavIds));
        setDiscovered(items);
        setIsOnline(false);
      } catch {
        setDiscovered([]);
        setIsOnline(false);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDiscovered = useCallback(async (fusion: FusionDTO, wordAId: string, wordBId: string) => {
    // Always save locally first
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

    // Then try API
    try {
      await ensureAuth();
      await apiRecordDiscovery(wordAId, wordBId, fusion);
    } catch {
      // silent fail, local save is the backup
    }

    await refresh();
  }, [refresh]);

  const toggleFavorite = useCallback(async (discoveryId: string) => {
    try {
      await ensureAuth();
      const isFavorite = await apiToggleFavorite(discoveryId);
      setDiscovered((prev) =>
        prev.map((d) =>
          d.discoveryId === discoveryId ? { ...d, isFavorite } : d
        )
      );
      return isFavorite;
    } catch {
      // Fallback: toggle locally by fusion id
      await toggleLocalFavorite(discoveryId);
      setDiscovered((prev) =>
        prev.map((d) =>
          d.discoveryId === discoveryId ? { ...d, isFavorite: !d.isFavorite } : d
        )
      );
      return false;
    }
  }, []);

  const favorites = discovered.filter((d) => d.isFavorite);
  const favoriteIds = favorites.map((d) => d.id);

  return {
    discovered,
    favorites,
    favoriteIds,
    loading,
    isOnline,
    refresh,
    addDiscovered,
    toggleFavorite,
  };
}
