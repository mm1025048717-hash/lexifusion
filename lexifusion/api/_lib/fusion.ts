/**
 * 融合解析逻辑 — Vercel Serverless 版
 * 无数据库，使用内存词汇 + DeepSeek AI + 模板 fallback
 */
import { getWordById } from '../_data/words';
import { aiFusionMulti, isDeepSeekAvailable, type AIFusionResult, type WordInput } from './deepseek';

// ─── 类型 ──────────────────────────────────────────────────────

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
  isCreative: boolean;
  etymology?: string | null;
  memoryTip?: string | null;
}

// ─── 辅助函数 ──────────────────────────────────────────────────

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

// ─── 创意模板 ──────────────────────────────────────────────────

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
};

const DEFAULT_CREATIVE_TEMPLATE: CreativeTemplate = {
  conceptSuffixes: ['两种概念的碰撞与联想', '概念融合', '自由联想'],
  suggestedWordsPool: ['fusion', 'blend', 'combination', 'idea', 'mix', 'bridge', 'link', 'spark'],
  associationVariants: ['自由联想', '概念碰撞', '跨域联想'],
};

// ─── 模板 Fallback ─────────────────────────────────────────────

interface WordInfo {
  id: string;
  word: string;
  meaning: string;
  category: string;
}

function generateCreativeFusion(wordA: WordInfo, wordB: WordInfo): FusionResultDTO {
  const catA = wordA.category || 'other';
  const catB = wordB.category || 'other';
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
    from: [wordA.id, wordB.id],
    result: resultWord,
    meaning: concept,
    type: 'creative',
    icon: '✨',
    concept,
    suggestedWords: suggestedWords.slice(0, 5),
    association,
    example: `This is a creative fusion of ${wordA.word} and ${wordB.word}.`,
    isCreative: true,
    etymology: null,
    memoryTip: null,
  };
}

// ─── AI 结果转 DTO ─────────────────────────────────────────────

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

// ─── 公共 API ──────────────────────────────────────────────────

/**
 * 通过词 ID 解析融合（多结果）
 * 优先 AI，失败则用模板 fallback
 */
export async function resolveFusionMulti(wordAId: string, wordBId: string): Promise<FusionResultDTO[]> {
  const [sortedA, sortedB] = [wordAId, wordBId].sort();

  const wordA = getWordById(sortedA);
  const wordB = getWordById(sortedB);

  if (!wordA || !wordB) {
    throw new Error(`Word not found: ${!wordA ? sortedA : sortedB}`);
  }

  const wordInfoA: WordInfo = { id: wordA.id, word: wordA.word, meaning: wordA.meaning, category: wordA.category };
  const wordInfoB: WordInfo = { id: wordB.id, word: wordB.word, meaning: wordB.meaning, category: wordB.category };

  // 1) Try DeepSeek AI fusion (multi)
  if (isDeepSeekAvailable()) {
    try {
      const results = await generateAIFusionMulti(wordInfoA, wordInfoB);
      return results;
    } catch (err) {
      console.warn('[resolveFusionMulti] AI failed, falling back:', (err as Error).message);
    }
  }

  // 2) Fallback: template-based creative fusion
  return [generateCreativeFusion(wordInfoA, wordInfoB)];
}

/**
 * 通过原始文本解析融合（用于连锁融合中的虚拟词）
 * 跳过 ID 查找，直接用 AI 或模板
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
      return results;
    } catch (err) {
      console.warn('[resolveFusionByText] AI failed, falling back:', (err as Error).message);
    }
  }

  // 2) Fallback: template-based
  return [generateCreativeFusion(wordInfoA, wordInfoB)];
}
