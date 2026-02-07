import { useState, useEffect, useCallback } from 'react';
import type { FusionResult } from '@/data/themes';
import type { StoredFusion } from '@/lib/fusionStore';
import {
  getDiscoveredFusions,
  getFavoriteIds,
  addDiscoveredFusion as addDiscoveredStorage,
  toggleFavorite as toggleFavoriteStorage,
} from '@/lib/fusionStore';

export function useFusionStore() {
  const [discovered, setDiscovered] = useState<StoredFusion[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [list, ids] = await Promise.all([getDiscoveredFusions(), getFavoriteIds()]);
    setDiscovered(list);
    setFavoriteIds(ids);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDiscovered = useCallback(async (fusion: FusionResult) => {
    await addDiscoveredStorage(fusion);
    await refresh();
  }, [refresh]);

  const toggleFavorite = useCallback(async (fusionId: string) => {
    const isNowFavorite = await toggleFavoriteStorage(fusionId);
    setFavoriteIds((prev) =>
      isNowFavorite ? [...prev, fusionId] : prev.filter((id) => id !== fusionId)
    );
    return isNowFavorite;
  }, []);

  const favorites = discovered.filter((f) => favoriteIds.includes(f.id));

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
