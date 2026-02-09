import { PrismaClient } from '@prisma/client';
import { aiFusion, aiFusionMulti, isDeepSeekAvailable, type AIFusionResult } from './deepseek.service';

const prisma = new PrismaClient();

/** Safely parse a JSON string field */
function parseJson(value: string | null): any {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

// ─── Fallback: template-based creative fusion (used when AI unavailable) ──

type ConceptCategory = 'animal' | 'food' | 'object' | 'place' | 'abstract' | 'nature' | 'other';

function fusionKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

function hashPair(a: string, b: string): number {
  const s = [a, b].sort().join('|');
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

function pickFromPool<T>(pool: T[], seed: number, count: number): T[] {
  if (pool.length === 0) return [];
  const seen = new Set<T>();
  const out: T[] = [];
  for (let i = 0; i < count * 2 && out.length < count; i++) {
    const idx = (seed + i * 31) % pool.length;
    const item = pool[idx];
    if (!seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out.length ? out : [pool[seed % pool.length]];
}

type CreativeTemplate = {
  conceptSuffixes: string[];
  suggestedWordsPool: string[];
  associationVariants: string[];
};

const CREATIVE_TEMPLATES: Record<string, CreativeTemplate> = {
  'animal+animal': {
    conceptSuffixes: ['新物种的想象', '生命与生命的交织', '生物融合的意象', '另一种生灵的可能'],
    suggestedWordsPool: ['hybrid', 'creature', 'species', 'wild', 'nature', 'instinct', 'pack', 'bond'],
    associationVariants: ['生物融合', '想象与自然', '生命意象'],
  },
  'food+food': {
    conceptSuffixes: ['可成饮品或料理', '厨房中的碰撞', '味觉与搭配', '餐桌上的创意'],
    suggestedWordsPool: ['recipe', 'dish', 'blend', 'smoothie', 'sauce', 'mix', 'flavor', 'taste', 'kitchen', 'meal'],
    associationVariants: ['厨房、餐桌', '料理与饮品', '味觉联想'],
  },
  'food+object': {
    conceptSuffixes: ['与日常物关联的场景', '生活中的一处画面', '物与食的交织'],
    suggestedWordsPool: ['kitchen', 'table', 'recipe', 'plate', 'cup', 'breakfast', 'dining', 'setting'],
    associationVariants: ['生活场景', '厨房与物', '日常画面'],
  },
  'object+object': {
    conceptSuffixes: ['新场景或新物件', '空间与物的组合', '画面中的并置'],
    suggestedWordsPool: ['scene', 'setting', 'combination', 'space', 'layout', 'design', 'place', 'corner'],
    associationVariants: ['空间与画面', '场景联想', '物与物'],
  },
  'animal+object': {
    conceptSuffixes: ['场景与情感', '陪伴与归属', '家的意象'],
    suggestedWordsPool: ['home', 'companion', 'warmth', 'happiness', 'family', 'comfort', 'nest', 'place'],
    associationVariants: ['家的温暖、陪伴', '情感与空间', '归属感'],
  },
  'abstract+animal': {
    conceptSuffixes: ['抽象情感与生命的结合', '情感在生灵中的投射', '意象与生命'],
    suggestedWordsPool: ['joy', 'love', 'comfort', 'freedom', 'peace', 'trust', 'bond', 'soul'],
    associationVariants: ['情感与意象', '生命与情感', '心灵联想'],
  },
  'abstract+object': {
    conceptSuffixes: ['抽象与具象的交织', '记忆与物', '氛围与场景'],
    suggestedWordsPool: ['memory', 'feeling', 'atmosphere', 'mood', 'moment', 'story', 'symbol', 'trace'],
    associationVariants: ['联想与隐喻', '记忆与物', '意境'],
  },
  'abstract+abstract': {
    conceptSuffixes: ['概念的叠加与延伸', '思想的碰撞', '抽象与抽象'],
    suggestedWordsPool: ['idea', 'notion', 'concept', 'thought', 'sense', 'theme', 'fusion', 'blend'],
    associationVariants: ['思想融合', '概念延伸', '抽象联想'],
  },
  'nature+nature': {
    conceptSuffixes: ['自然意象的融合', '天地之间的画面', '自然与自然'],
    suggestedWordsPool: ['landscape', 'scene', 'atmosphere', 'weather', 'season', 'horizon', 'sky', 'earth'],
    associationVariants: ['自然与画面', '天地意象', '自然联想'],
  },
  'object+place': {
    conceptSuffixes: ['空间与物的关系', '场所与物件', '一地一物'],
    suggestedWordsPool: ['place', 'space', 'setting', 'spot', 'room', 'corner', 'site', 'location'],
    associationVariants: ['场景联想', '空间与物', '场所感'],
  },
  'animal+nature': {
    conceptSuffixes: ['自然与生命的交织', '生灵与天地', '栖息与自由'],
    suggestedWordsPool: ['habitat', 'wild', 'nature', 'life', 'nest', 'migration', 'forest', 'sky'],
    associationVariants: ['自然、生灵', '栖息与自然', '生命与自然'],
  },
  'food+nature': {
    conceptSuffixes: ['自然馈赠与餐桌', '时令与味道', '大地与食物'],
    suggestedWordsPool: ['harvest', 'fresh', 'organic', 'season', 'farm', 'garden', 'ripe', 'natural'],
    associationVariants: ['时令、新鲜', '自然与餐桌', '大地馈赠'],
  },
  'abstract+nature': {
    conceptSuffixes: ['抽象情感与自然意象', '心境与风景', '意境与自然'],
    suggestedWordsPool: ['mood', 'atmosphere', 'feeling', 'scene', 'dream', 'light', 'shadow', 'breeze'],
    associationVariants: ['意境、画面', '心境与自然', '情感与风景'],
  },
  'nature+object': {
    conceptSuffixes: ['自然与物件的结合', '户外与物', '景致与物'],
    suggestedWordsPool: ['outdoor', 'garden', 'view', 'space', 'path', 'bench', 'window', 'terrace'],
    associationVariants: ['户外、景致', '自然与物', '空间与自然'],
  },
  'abstract+other': {
    conceptSuffixes: ['与抽象概念的联结', '概念的延伸', '联想与想象'],
    suggestedWordsPool: ['idea', 'notion', 'mood', 'sense', 'theme', 'fusion', 'link', 'spark'],
    associationVariants: ['自由联想', '概念延伸', '抽象联想'],
  },
  'animal+other': {
    conceptSuffixes: ['与生命的关联', '生灵与意象', '生命感'],
    suggestedWordsPool: ['companion', 'nature', 'life', 'wild', 'bond', 'creature', 'soul', 'instinct'],
    associationVariants: ['生命意象', '生灵与物', '自然联想'],
  },
  'food+other': {
    conceptSuffixes: ['与味觉或餐桌的关联', '厨房与生活', '饮食联想'],
    suggestedWordsPool: ['taste', 'recipe', 'meal', 'kitchen', 'flavor', 'table', 'dish', 'blend'],
    associationVariants: ['餐桌联想', '味觉与物', '生活场景'],
  },
  'nature+other': {
    conceptSuffixes: ['与自然意象的联结', '天地与物', '自然联想'],
    suggestedWordsPool: ['landscape', 'scene', 'atmosphere', 'season', 'weather', 'earth', 'sky', 'breeze'],
    associationVariants: ['自然与画面', '天地意象', '自然联想'],
  },
  'object+other': {
    conceptSuffixes: ['与物件的并置', '场景与物', '空间联想'],
    suggestedWordsPool: ['scene', 'setting', 'place', 'space', 'combination', 'layout', 'corner', 'design'],
    associationVariants: ['空间与画面', '场景联想', '物与物'],
  },
  'other+place': {
    conceptSuffixes: ['与场所的关系', '空间与意象', '地点联想'],
    suggestedWordsPool: ['place', 'space', 'location', 'spot', 'site', 'setting', 'room', 'area'],
    associationVariants: ['场所感', '空间联想', '地点与物'],
  },
  'other+other': {
    conceptSuffixes: ['两种概念的碰撞', '跨域联想', '自由融合'],
    suggestedWordsPool: ['fusion', 'blend', 'combination', 'bridge', 'link', 'mix', 'spark', 'idea'],
    associationVariants: ['自由联想', '概念碰撞', '跨域联想'],
  },
};

const DEFAULT_CREATIVE_TEMPLATE: CreativeTemplate = {
  conceptSuffixes: ['两种概念的碰撞与联想', '概念融合', '自由联想'],
  suggestedWordsPool: ['fusion', 'blend', 'combination', 'idea', 'mix', 'bridge', 'link', 'spark'],
  associationVariants: ['自由联想', '概念碰撞', '跨域联想'],
};

interface WordInfo {
  id: string;
  word: string;
  meaning: string;
  category: string | null;
}

function generateCreativeFusion(wordA: WordInfo, wordB: WordInfo) {
  const catA = (wordA.category || 'other') as ConceptCategory;
  const catB = (wordB.category || 'other') as ConceptCategory;
  const key = fusionKey(wordA.id, wordB.id);
  const id = `creative-${key}`;
  const seed = hashPair(wordA.id, wordB.id);
  const pair = [catA, catB].sort().join('+');
  const tpl = CREATIVE_TEMPLATES[pair] ?? DEFAULT_CREATIVE_TEMPLATE;

  const conceptSuffix = tpl.conceptSuffixes[seed % tpl.conceptSuffixes.length];
  const concept = `${wordA.meaning}与${wordB.meaning}的融合——${conceptSuffix}`;

  const pool = tpl.suggestedWordsPool;
  const resultWord = pool[seed % pool.length];
  const rest = pickFromPool(pool.filter((w) => w !== resultWord), seed + 1, 4);
  const suggestedWords = [resultWord, ...rest];

  const association = tpl.associationVariants[seed % tpl.associationVariants.length];

  return {
    id,
    from: [wordA.id, wordB.id] as [string, string],
    result: resultWord,
    meaning: concept,
    type: 'creative' as const,
    icon: '✨',
    concept,
    suggestedWords: suggestedWords.slice(0, 5),
    association,
  };
}

// ─── AI-powered creative fusion (multi-result) ─────────────────
function aiResultToDTO(aiResult: AIFusionResult, wordA: WordInfo, wordB: WordInfo, idx: number): FusionResultDTO {
  const key = fusionKey(wordA.id, wordB.id);
  return {
    id: idx === 0 ? `ai-${key}` : `ai-${key}-${idx}`,
    from: [wordA.id, wordB.id],
    result: aiResult.result,
    meaning: aiResult.meaning,
    type: aiResult.type,
    icon: aiResult.icon,
    concept: aiResult.concept,
    suggestedWords: aiResult.suggestedWords,
    association: aiResult.association,
    example: aiResult.example,
    etymology: aiResult.etymology,
    memoryTip: aiResult.memoryTip,
    imageUrl: null,
    imageUrls: null,
    isCreative: true,
  };
}

async function generateAIFusionMulti(wordA: WordInfo, wordB: WordInfo): Promise<FusionResultDTO[]> {
  const results = await aiFusionMulti(
    { word: wordA.word, meaning: wordA.meaning, category: wordA.category || 'other' },
    { word: wordB.word, meaning: wordB.meaning, category: wordB.category || 'other' },
  );
  return results.map((r, i) => aiResultToDTO(r, wordA, wordB, i));
}

async function generateAIFusion(wordA: WordInfo, wordB: WordInfo): Promise<FusionResultDTO> {
  const results = await generateAIFusionMulti(wordA, wordB);
  return results[0];
}

// ─── Public API ─────────────────────────────────────────────

export interface FusionResultDTO {
  id: string;
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
  isCreative: boolean;
  /** 词源/文化小知识 (AI) */
  etymology?: string | null;
  /** 记忆技巧 (AI) */
  memoryTip?: string | null;
}

/**
 * Resolve fusion between two words.
 * Priority: 1) exact DB match → 2) DeepSeek AI fusion → 3) template fallback
 */
export async function resolveFusion(wordAId: string, wordBId: string): Promise<FusionResultDTO> {
  const [sortedA, sortedB] = [wordAId, wordBId].sort();

  // 1) Try exact match in fusion_rules
  const rule = await prisma.fusionRule.findUnique({
    where: {
      wordAId_wordBId: { wordAId: sortedA, wordBId: sortedB },
    },
  });

  if (rule) {
    return {
      id: rule.id,
      from: [rule.wordAId, rule.wordBId],
      result: rule.result,
      meaning: rule.meaning,
      type: rule.type,
      example: rule.example,
      icon: rule.icon,
      concept: rule.concept,
      suggestedWords: parseJson(rule.suggestedWords) as string[] | null,
      association: rule.association,
      imageUrl: rule.imageUrl,
      imageUrls: parseJson(rule.imageUrls) as string[] | null,
      isCreative: false,
    };
  }

  // Fetch word data
  const [wordA, wordB] = await Promise.all([
    prisma.word.findUnique({ where: { id: sortedA } }),
    prisma.word.findUnique({ where: { id: sortedB } }),
  ]);

  if (!wordA || !wordB) {
    throw new Error(`Word not found: ${!wordA ? sortedA : sortedB}`);
  }

  // 2) Try DeepSeek AI fusion
  if (isDeepSeekAvailable()) {
    try {
      const aiFusionResult = await generateAIFusion(wordA, wordB);
      return {
        ...aiFusionResult,
        imageUrl: null,
        imageUrls: null,
        isCreative: true,
      };
    } catch (err) {
      console.warn('[resolveFusion] AI fusion failed, falling back to template:', (err as Error).message);
    }
  }

  // 3) Fallback: template-based creative fusion
  const creative = generateCreativeFusion(wordA, wordB);
  return {
    ...creative,
    example: null,
    imageUrl: null,
    imageUrls: null,
    isCreative: true,
  };
}

/**
 * Resolve fusion between two words — returns ALL results (multiple).
 * Priority: 1) exact DB match → 2) DeepSeek AI multi-fusion → 3) template fallback
 */
export async function resolveFusionMulti(wordAId: string, wordBId: string): Promise<FusionResultDTO[]> {
  const [sortedA, sortedB] = [wordAId, wordBId].sort();

  // 1) Try exact match in fusion_rules
  const rule = await prisma.fusionRule.findUnique({
    where: {
      wordAId_wordBId: { wordAId: sortedA, wordBId: sortedB },
    },
  });

  if (rule) {
    return [{
      id: rule.id,
      from: [rule.wordAId, rule.wordBId],
      result: rule.result,
      meaning: rule.meaning,
      type: rule.type,
      example: rule.example,
      icon: rule.icon,
      concept: rule.concept,
      suggestedWords: parseJson(rule.suggestedWords) as string[] | null,
      association: rule.association,
      imageUrl: rule.imageUrl,
      imageUrls: parseJson(rule.imageUrls) as string[] | null,
      isCreative: false,
    }];
  }

  // Fetch word data
  const [wordA, wordB] = await Promise.all([
    prisma.word.findUnique({ where: { id: sortedA } }),
    prisma.word.findUnique({ where: { id: sortedB } }),
  ]);

  if (!wordA || !wordB) {
    throw new Error(`Word not found: ${!wordA ? sortedA : sortedB}`);
  }

  // 2) Try DeepSeek AI fusion (multi)
  if (isDeepSeekAvailable()) {
    try {
      const results = await generateAIFusionMulti(wordA, wordB);
      return results.map((r) => ({
        ...r,
        imageUrl: null,
        imageUrls: null,
        isCreative: true,
      }));
    } catch (err) {
      console.warn('[resolveFusionMulti] AI failed, falling back:', (err as Error).message);
    }
  }

  // 3) Fallback: template-based creative fusion
  const creative = generateCreativeFusion(wordA, wordB);
  return [{
    ...creative,
    example: null,
    imageUrl: null,
    imageUrls: null,
    isCreative: true,
  }];
}

/**
 * Resolve fusion by raw text (for chain fusion with virtual words).
 * Skips DB lookup — goes straight to AI or template fallback.
 */
export async function resolveFusionByText(
  wordA: { word: string; meaning: string; category: string },
  wordB: { word: string; meaning: string; category: string }
): Promise<FusionResultDTO[]> {
  const wordInfoA: WordInfo = {
    id: `virtual-${wordA.word.toLowerCase()}`,
    word: wordA.word,
    meaning: wordA.meaning,
    category: wordA.category,
  };
  const wordInfoB: WordInfo = {
    id: `virtual-${wordB.word.toLowerCase()}`,
    word: wordB.word,
    meaning: wordB.meaning,
    category: wordB.category,
  };

  // 1) Try DeepSeek AI fusion (multi)
  if (isDeepSeekAvailable()) {
    try {
      const results = await generateAIFusionMulti(wordInfoA, wordInfoB);
      return results.map((r) => ({
        ...r,
        imageUrl: null,
        imageUrls: null,
        isCreative: true,
      }));
    } catch (err) {
      console.warn('[resolveFusionByText] AI failed, falling back:', (err as Error).message);
    }
  }

  // 2) Fallback: template-based
  const creative = generateCreativeFusion(wordInfoA, wordInfoB);
  return [{
    ...creative,
    example: null,
    imageUrl: null,
    imageUrls: null,
    isCreative: true,
  }];
}

/**
 * Record a user's discovery.
 */
export async function recordDiscovery(
  userId: string,
  wordAId: string,
  wordBId: string,
  fusionData: FusionResultDTO
) {
  const [sortedA, sortedB] = [wordAId, wordBId].sort();

  // Upsert: don't create duplicate discoveries
  const existing = await prisma.userDiscovery.findUnique({
    where: {
      userId_wordAId_wordBId: {
        userId,
        wordAId: sortedA,
        wordBId: sortedB,
      },
    },
  });

  if (existing) return existing;

  return prisma.userDiscovery.create({
    data: {
      userId,
      fusionRuleId: fusionData.isCreative ? null : fusionData.id,
      wordAId: sortedA,
      wordBId: sortedB,
      isCreative: fusionData.isCreative,
      creativeData: fusionData.isCreative ? JSON.stringify(fusionData) : null,
    },
  });
}

/**
 * Get all discoveries for a user, with fusion data.
 */
export async function getUserDiscoveries(userId: string) {
  const discoveries = await prisma.userDiscovery.findMany({
    where: { userId },
    include: {
      fusionRule: true,
      favorites: { where: { userId } },
    },
    orderBy: { discoveredAt: 'desc' },
  });

  return discoveries.map((d) => {
    const isFav = d.favorites.length > 0;
    if (d.fusionRule) {
      return {
        discoveryId: d.id,
        fusion: {
          id: d.fusionRule.id,
          from: [d.fusionRule.wordAId, d.fusionRule.wordBId],
          result: d.fusionRule.result,
          meaning: d.fusionRule.meaning,
          type: d.fusionRule.type,
          example: d.fusionRule.example,
          icon: d.fusionRule.icon,
          concept: d.fusionRule.concept,
          suggestedWords: parseJson(d.fusionRule.suggestedWords),
          association: d.fusionRule.association,
          imageUrl: d.fusionRule.imageUrl,
          imageUrls: parseJson(d.fusionRule.imageUrls),
          isCreative: false,
        },
        discoveredAt: d.discoveredAt.toISOString(),
        isFavorite: isFav,
      };
    } else {
      // Creative fusion stored in creativeData
      const creative = parseJson(d.creativeData) || {};
      return {
        discoveryId: d.id,
        fusion: {
          ...creative,
          isCreative: true,
        },
        discoveredAt: d.discoveredAt.toISOString(),
        isFavorite: isFav,
      };
    }
  });
}

/**
 * Toggle favorite on a discovery.
 */
export async function toggleFavorite(userId: string, discoveryId: string): Promise<boolean> {
  const existing = await prisma.userFavorite.findUnique({
    where: {
      userId_discoveryId: { userId, discoveryId },
    },
  });

  if (existing) {
    await prisma.userFavorite.delete({ where: { id: existing.id } });
    return false; // no longer favorite
  } else {
    await prisma.userFavorite.create({
      data: { userId, discoveryId },
    });
    return true; // now favorite
  }
}

/**
 * Get all favorites for a user.
 */
export async function getUserFavorites(userId: string) {
  const favorites = await prisma.userFavorite.findMany({
    where: { userId },
    include: {
      discovery: {
        include: { fusionRule: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map((f) => {
    const d = f.discovery;
    if (d.fusionRule) {
      return {
        favoriteId: f.id,
        discoveryId: d.id,
        fusion: {
          id: d.fusionRule.id,
          from: [d.fusionRule.wordAId, d.fusionRule.wordBId],
          result: d.fusionRule.result,
          meaning: d.fusionRule.meaning,
          type: d.fusionRule.type,
          example: d.fusionRule.example,
          icon: d.fusionRule.icon,
          concept: d.fusionRule.concept,
          suggestedWords: parseJson(d.fusionRule.suggestedWords),
          association: d.fusionRule.association,
          isCreative: false,
        },
        discoveredAt: d.discoveredAt.toISOString(),
        favoritedAt: f.createdAt.toISOString(),
      };
    } else {
      const creative = parseJson(d.creativeData) || {};
      return {
        favoriteId: f.id,
        discoveryId: d.id,
        fusion: {
          ...creative,
          isCreative: true,
        },
        discoveredAt: d.discoveredAt.toISOString(),
        favoritedAt: f.createdAt.toISOString(),
      };
    }
  });
}
