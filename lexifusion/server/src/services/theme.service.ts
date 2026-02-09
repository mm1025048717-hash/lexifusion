import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Safely parse a JSON string field, return null if invalid */
function parseJson(value: string | null): any {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

/** Get all active themes with word count and fusion count */
export async function getAllThemes() {
  const themes = await prisma.theme.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { words: true } },
    },
  });

  // Also get fusion counts per theme (fusion rules reference words, which reference themes)
  const result = await Promise.all(
    themes.map(async (theme) => {
      const fusionCount = await prisma.fusionRule.count({
        where: {
          wordA: { themeId: theme.id },
        },
      });
      return {
        id: theme.id,
        name: theme.name,
        nameEn: theme.nameEn,
        description: theme.description,
        coverEmoji: theme.coverEmoji,
        wordCount: theme._count.words,
        fusionCount,
      };
    })
  );

  return result;
}

/** Get a single theme with all its words */
export async function getThemeById(id: string) {
  const theme = await prisma.theme.findUnique({
    where: { id },
    include: {
      words: {
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!theme) return null;

  return {
    id: theme.id,
    name: theme.name,
    nameEn: theme.nameEn,
    description: theme.description,
    coverEmoji: theme.coverEmoji,
    words: theme.words.map((w) => ({
      id: w.id,
      word: w.word,
      phonetic: w.phonetic,
      meaning: w.meaning,
      icon: w.icon,
      imageUrl: w.imageUrl,
      category: w.category,
    })),
  };
}

/** Get all fusion rules for a theme */
export async function getThemeFusions(themeId: string) {
  const fusions = await prisma.fusionRule.findMany({
    where: {
      wordA: { themeId },
    },
    orderBy: { id: 'asc' },
  });

  return fusions.map((f) => ({
    id: f.id,
    from: [f.wordAId, f.wordBId],
    result: f.result,
    meaning: f.meaning,
    type: f.type,
    example: f.example,
    icon: f.icon,
    concept: f.concept,
    suggestedWords: parseJson(f.suggestedWords),
    association: f.association,
    imageUrl: f.imageUrl,
    imageUrls: parseJson(f.imageUrls),
  }));
}
