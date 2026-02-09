/**
 * Theme data hook: fetches themes from API with local fallback.
 */
import { useState, useEffect, useCallback } from 'react';
import { apiGetThemes, apiGetTheme, ThemeSummary, ThemeDetail } from '@/lib/api';
import { themes as localThemes, getThemeById as getLocalThemeById } from '@/data/themes';

/** Convert local theme data to ThemeSummary format */
function localThemeToSummary(t: typeof localThemes[0]): ThemeSummary {
  return {
    id: t.id,
    name: t.name,
    nameEn: t.nameEn,
    description: t.description,
    coverEmoji: t.coverEmoji,
    wordCount: t.words.length,
    fusionCount: t.fusions.length,
  };
}

/** Hook: get all themes */
export function useThemes() {
  const [themes, setThemes] = useState<ThemeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    try {
      const apiThemes = await apiGetThemes();
      setThemes(apiThemes);
    } catch {
      // Fallback to local data
      setThemes(localThemes.map(localThemeToSummary));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  return { themes, loading, refresh: fetchThemes };
}

/** Hook: get a single theme with words */
export function useThemeDetail(themeId: string | undefined) {
  const [theme, setTheme] = useState<ThemeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!themeId) {
      setTheme(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const apiTheme = await apiGetTheme(themeId);
        if (!cancelled) setTheme(apiTheme);
      } catch {
        // Fallback to local data
        const local = getLocalThemeById(themeId);
        if (!cancelled && local) {
          setTheme({
            id: local.id,
            name: local.name,
            nameEn: local.nameEn,
            description: local.description,
            coverEmoji: local.coverEmoji,
            words: local.words.map((w) => ({
              id: w.id,
              word: w.word,
              phonetic: w.phonetic || null,
              meaning: w.meaning,
              icon: w.icon || null,
              imageUrl: w.imageUrl || null,
              category: w.category || null,
            })),
          });
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [themeId]);

  return { theme, loading };
}
