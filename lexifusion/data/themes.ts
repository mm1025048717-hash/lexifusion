/**
 * 主题词库与融合规则
 * 理念：本体论融合 —— 先融合「概念/物」，再落到词；任何两个概念都可产生联想，没有不能融合的。
 */

/** 概念类别：用于创意融合时的联想规则 */
export type ConceptCategory = 'animal' | 'food' | 'object' | 'place' | 'abstract' | 'nature' | 'other';

export type WordBubble = {
  id: string;
  word: string;
  phonetic?: string;
  meaning: string;
  icon?: string;
  /** 气泡展示用真实图片 URL，不设则用 getImageForWord(word) */
  imageUrl?: string;
  /** 概念类别，用于无精确匹配时生成创意融合 */
  category?: ConceptCategory;
};

export type FusionResult = {
  id: string;
  from: [string, string];
  /** 融合后的词/短语（可空缺，创意融合用 concept 描述） */
  result: string;
  meaning: string;
  type: 'compound' | 'phrase' | 'creative';
  example?: string;
  icon?: string;
  /** 主结果配图（真实图片 URL，与单词绑定） */
  imageUrl?: string;
  /** 联想词/可搭配词对应的配图，与 suggestedWords 一一对应 */
  imageUrls?: string[];
  /** 创意融合：概念/画面描述（超越语言） */
  concept?: string;
  /** 联想词、可搭配词汇 */
  suggestedWords?: string[];
  /** 联想方向（如：厨房、家的温暖） */
  association?: string;
};

export type Theme = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  coverEmoji: string;
  words: WordBubble[];
  fusions: FusionResult[];
};

export function fusionKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

/** 单词/短语 → 真实图片 URL（一一对应，Unsplash 直链） */
const WORD_IMAGE_URLS: Record<string, string> = {
  // 美食：主词与联想词
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=320&h=240&fit=crop',
  pie: 'https://images.unsplash.com/photo-1535929260-4f18d21770ab?w=320&h=240&fit=crop',
  juice: 'https://images.unsplash.com/photo-1621506247195-586e061017e?w=320&h=240&fit=crop',
  milk: 'https://images.unsplash.com/photo-1550583724-b2562b6794b?w=320&h=240&fit=crop',
  egg: 'https://images.unsplash.com/photo-1582722872443-44d5a4cf77?w=320&h=240&fit=crop',
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=240&fit=crop',
  cake: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  cheese: 'https://images.unsplash.com/photo-1486297677034-891f6a83d6?w=320&h=240&fit=crop',
  fish: 'https://images.unsplash.com/photo-1534609609625-a7b2a3d26f?w=320&h=240&fit=crop',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b?w=320&h=240&fit=crop',
  'apple pie': 'https://images.unsplash.com/photo-1535929260-4f18d21770ab?w=320&h=240&fit=crop',
  'apple juice': 'https://images.unsplash.com/photo-1621506247195-586e061017e?w=320&h=240&fit=crop',
  'milk cake': 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  'cheese cake': 'https://images.unsplash.com/photo-1486297677034-891f6a83d6?w=320&h=240&fit=crop',
  'egg bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=240&fit=crop',
  toast: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=240&fit=crop',
  cinnamon: 'https://images.unsplash.com/photo-1517433670269-937aa9e7c6?w=320&h=240&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  baking: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=320&h=240&fit=crop',
  pastry: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  oven: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=320&h=240&fit=crop',
  fresh: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=320&h=240&fit=crop',
  breakfast: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=240&fit=crop',
  healthy: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=320&h=240&fit=crop',
  refreshing: 'https://images.unsplash.com/photo-1621506247195-586e061017e?w=320&h=240&fit=crop',
  soft: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  sweet: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  cream: 'https://images.unsplash.com/photo-1550583724-b2562b6794b?w=320&h=240&fit=crop',
  'cream cheese': 'https://images.unsplash.com/photo-1486297677034-891f6a83d6?w=320&h=240&fit=crop',
  party: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=320&h=240&fit=crop',
  Asian: 'https://images.unsplash.com/photo-1534609609625-a7b2a3d26f?w=320&h=240&fit=crop',
  fried: 'https://images.unsplash.com/photo-1534609609625-a7b2a3d26f?w=320&h=240&fit=crop',
  'street food': 'https://images.unsplash.com/photo-1534609609625-a7b2a3d26f?w=320&h=240&fit=crop',
  'dim sum': 'https://images.unsplash.com/photo-1534609609625-a7b2a3d26f?w=320&h=240&fit=crop',
  custard: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  'scrambled eggs': 'https://images.unsplash.com/photo-1582722872443-44d5a4cf77?w=320&h=240&fit=crop',
  quiche: 'https://images.unsplash.com/photo-1582722872443-44d5a4cf77?w=320&h=240&fit=crop',
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=320&h=240&fit=crop',
  smoothie: 'https://images.unsplash.com/photo-1621506247195-586e061017e?w=320&h=240&fit=crop',
  milkshake: 'https://images.unsplash.com/photo-1550583724-b2562b6794b?w=320&h=240&fit=crop',
  'fruit milk': 'https://images.unsplash.com/photo-1621506247195-586e061017e?w=320&h=240&fit=crop',
  'fish cake': 'https://images.unsplash.com/photo-1534609609625-a7b2a3d26f?w=320&h=240&fit=crop',
  simple: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=240&fit=crop',
  morning: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=240&fit=crop',
  // 旅行
  vacation: 'https://images.unsplash.com/photo-1507525428034-723603964d?w=320&h=240&fit=crop',
  summer: 'https://images.unsplash.com/photo-1507525428034-723603964d?w=320&h=240&fit=crop',
  holiday: 'https://images.unsplash.com/photo-1507525428034-723603964d?w=320&h=240&fit=crop',
  relax: 'https://images.unsplash.com/photo-1507525428034-723603964d?w=320&h=240&fit=crop',
  book: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  airport: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  departure: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  boarding: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  lobby: 'https://images.unsplash.com/photo-1566073771259-6a94e84e8b6?w=320&h=240&fit=crop',
  pool: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=320&h=240&fit=crop',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=320&h=240&fit=crop',
  'check-in': 'https://images.unsplash.com/photo-1566073771259-6a94e84e8b6?w=320&h=240&fit=crop',
  travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  security: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  'sun and beach': 'https://images.unsplash.com/photo-1507525428034-723603964d?w=320&h=240&fit=crop',
  'flight ticket': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  'hotel map': 'https://images.unsplash.com/photo-1566073771259-6a94e84e8b6?w=320&h=240&fit=crop',
  'passport and luggage': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  // 概念实验室
  lion: 'https://images.unsplash.com/photo-1546182990-dbfafb0f2e?w=320&h=240&fit=crop',
  tiger: 'https://images.unsplash.com/photo-1546182990-dbfafb0f2e?w=320&h=240&fit=crop',
  liger: 'https://images.unsplash.com/photo-1546182990-dbfafb0f2e?w=320&h=240&fit=crop',
  hybrid: 'https://images.unsplash.com/photo-1546182990-dbfafb0f2e?w=320&h=240&fit=crop',
  species: 'https://images.unsplash.com/photo-1546182990-dbfafb0f2e?w=320&h=240&fit=crop',
  tigon: 'https://images.unsplash.com/photo-1546182990-dbfafb0f2e?w=320&h=240&fit=crop',
  home: 'https://images.unsplash.com/photo-1564013792-919d0d0d0d0d?w=320&h=240&fit=crop',
  warmth: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=320&h=240&fit=crop',
  happiness: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=320&h=240&fit=crop',
  companion: 'https://images.unsplash.com/photo-1587300003388-59208f0a0e?w=320&h=240&fit=crop',
  family: 'https://images.unsplash.com/photo-1564013792-919d0d0d0d0d?w=320&h=240&fit=crop',
  joy: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=320&h=240&fit=crop',
  love: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=320&h=240&fit=crop',
  comfort: 'https://images.unsplash.com/photo-1587300003388-59208f0a0e?w=320&h=240&fit=crop',
  garden: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=320&h=240&fit=crop',
  bloom: 'https://images.unsplash.com/photo-1490750960-5a1b433c42b?w=320&h=240&fit=crop',
  spring: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=320&h=240&fit=crop',
  sunshine: 'https://images.unsplash.com/photo-1495616818-4d0c4e0c?w=320&h=240&fit=crop',
  scene: 'https://images.unsplash.com/photo-1507525428034-723603964d?w=320&h=240&fit=crop',
  setting: 'https://images.unsplash.com/photo-1564013792-919d0d0d0d0d?w=320&h=240&fit=crop',
  combination: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  recipe: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=320&h=240&fit=crop',
  dish: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  blend: 'https://images.unsplash.com/photo-1621506247195-586e061017e?w=320&h=240&fit=crop',
  table: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=320&h=240&fit=crop',
  place: 'https://images.unsplash.com/photo-1564013792-919d0d0d0d0d?w=320&h=240&fit=crop',
  space: 'https://images.unsplash.com/photo-1564013792-919d0d0d0d0d?w=320&h=240&fit=crop',
  idea: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  notion: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  concept: 'https://images.unsplash.com/photo-1551024506-0c7d668c2c?w=320&h=240&fit=crop',
  fusion: 'https://images.unsplash.com/photo-1621506247195-586e061017e?w=320&h=240&fit=crop',
  landscape: 'https://images.unsplash.com/photo-1507525428034-723603964d?w=320&h=240&fit=crop',
  atmosphere: 'https://images.unsplash.com/photo-1507525428034-723603964d?w=320&h=240&fit=crop',
  memory: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=320&h=240&fit=crop',
  feeling: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=320&h=240&fit=crop',
  // 概念实验室新增联想词配图
  pets: 'https://images.unsplash.com/photo-1587300003388-59208f0a0e?w=320&h=240&fit=crop',
  play: 'https://images.unsplash.com/photo-1587300003388-59208f0a0e?w=320&h=240&fit=crop',
  latte: 'https://images.unsplash.com/photo-1509042239860-f550ce710b?w=320&h=240&fit=crop',
  cappuccino: 'https://images.unsplash.com/photo-1509042239860-f550ce710b?w=320&h=240&fit=crop',
  library: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  study: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  reading: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  beach: 'https://images.unsplash.com/photo-1507525428034-723603964d?w=320&h=240&fit=crop',
  sunset: 'https://images.unsplash.com/photo-1495616818-4d0c4e0c?w=320&h=240&fit=crop',
  wave: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=320&h=240&fit=crop',
  nest: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=320&h=240&fit=crop',
  cozy: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=320&h=240&fit=crop',
  melody: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=320&h=240&fit=crop',
  wanderlust: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=320&h=240&fit=crop',
  walk: 'https://images.unsplash.com/photo-1587300003388-59208f0a0e?w=320&h=240&fit=crop',
  park: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=320&h=240&fit=crop',
  'sunny home': 'https://images.unsplash.com/photo-1564013792-919d0d0d0d0d?w=320&h=240&fit=crop',
  'garden house': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=320&h=240&fit=crop',
  'spring rain': 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=320&h=240&fit=crop',
  'night garden': 'https://images.unsplash.com/photo-1490750960-5a1b433c42b?w=320&h=240&fit=crop',
  'floral tea': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=320&h=240&fit=crop',
  'night dream': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=320&h=240&fit=crop',
};

/** 为单词/短语提供真实图片 URL。统一用 Picsum（跨域可靠、同一词同一图）。 */
export function getImageForWord(word: string): string {
  const seed = encodeURIComponent(String(word).trim().replace(/\s+/g, '-') || 'word');
  return `https://picsum.photos/seed/${seed}/320/240`;
}

/** 精确匹配：根据两个气泡 id 查融合结果 */
export function getFusion(
  theme: Theme,
  wordIdA: string,
  wordIdB: string
): FusionResult | undefined {
  const key = fusionKey(wordIdA, wordIdB);
  return theme.fusions.find((f) => fusionKey(f.from[0], f.from[1]) === key);
}

/** 获取气泡的概念类别，默认 other */
export function getCategory(theme: Theme, wordId: string): ConceptCategory {
  const w = theme.words.find((x) => x.id === wordId);
  return w?.category ?? 'other';
}

/** 确定性哈希：同一对 (a,b) 永远得到相同整数，用于让每对单词的创意融合结果独一无二 */
function hashPair(a: string, b: string): number {
  const s = [a, b].sort().join('|');
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

/** 从池子里按种子确定性取 N 个不重复项（同一词对永远得到相同顺序） */
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

/** 创意融合模板：每类有多条联想后缀、大词池、多条联想方向，按词对种子选取，保证不同词对结果不同 */
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
  'object+animal': {
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
  'place+object': {
    conceptSuffixes: ['空间与物的关系', '场所与物件', '一地一物'],
    suggestedWordsPool: ['place', 'space', 'setting', 'spot', 'room', 'corner', 'site', 'location'],
    associationVariants: ['场景联想', '空间与物', '场所感'],
  },
  'nature+animal': {
    conceptSuffixes: ['自然与生命的交织', '生灵与天地', '栖息与自由'],
    suggestedWordsPool: ['habitat', 'wild', 'nature', 'life', 'nest', 'migration', 'forest', 'sky'],
    associationVariants: ['自然、生灵', '栖息与自然', '生命与自然'],
  },
  'nature+food': {
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
  'other+abstract': {
    conceptSuffixes: ['与抽象概念的联结', '概念的延伸', '联想与想象'],
    suggestedWordsPool: ['idea', 'notion', 'mood', 'sense', 'theme', 'fusion', 'link', 'spark'],
    associationVariants: ['自由联想', '概念延伸', '抽象联想'],
  },
  'other+animal': {
    conceptSuffixes: ['与生命的关联', '生灵与意象', '生命感'],
    suggestedWordsPool: ['companion', 'nature', 'life', 'wild', 'bond', 'creature', 'soul', 'instinct'],
    associationVariants: ['生命意象', '生灵与物', '自然联想'],
  },
  'other+food': {
    conceptSuffixes: ['与味觉或餐桌的关联', '厨房与生活', '饮食联想'],
    suggestedWordsPool: ['taste', 'recipe', 'meal', 'kitchen', 'flavor', 'table', 'dish', 'blend'],
    associationVariants: ['餐桌联想', '味觉与物', '生活场景'],
  },
  'other+nature': {
    conceptSuffixes: ['与自然意象的联结', '天地与物', '自然联想'],
    suggestedWordsPool: ['landscape', 'scene', 'atmosphere', 'season', 'weather', 'earth', 'sky', 'breeze'],
    associationVariants: ['自然与画面', '天地意象', '自然联想'],
  },
  'other+object': {
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

/** 创意融合：无精确匹配时，按词对 (wordIdA, wordIdB) 确定性生成唯一结果，不同词对必不同 */
export function getCreativeFusion(
  theme: Theme,
  wordIdA: string,
  wordIdB: string,
  wordA: WordBubble,
  wordB: WordBubble
): FusionResult {
  const catA = getCategory(theme, wordIdA);
  const catB = getCategory(theme, wordIdB);
  const key = fusionKey(wordIdA, wordIdB);
  const id = `creative-${key}`;
  const seed = hashPair(wordIdA, wordIdB);
  const pair = [catA, catB].sort().join('+') as string;
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
    from: [wordIdA, wordIdB],
    result: resultWord,
    meaning: concept,
    type: 'creative',
    icon: '✨',
    concept,
    suggestedWords: suggestedWords.slice(0, 5),
    association,
  };
}

/**
 * 规则：任意两个单词都可以融合。
 * 先查预设融合（精确匹配），若无则按两词的概念类别生成创意融合；
 * 未设类别的词按 other 处理，总有默认联想，不存在「不能融合」的情况。
 */
export function getFusionOrCreative(
  theme: Theme,
  wordIdA: string,
  wordIdB: string
): FusionResult {
  const exact = getFusion(theme, wordIdA, wordIdB);
  if (exact) return exact;
  const wordA = theme.words.find((w) => w.id === wordIdA)!;
  const wordB = theme.words.find((w) => w.id === wordIdB)!;
  return getCreativeFusion(theme, wordIdA, wordIdB, wordA, wordB);
}

// ---------- 美食主题（保留原有，补充 category）----------
const foodWords: WordBubble[] = [
  { id: 'f-apple', word: 'apple', meaning: '苹果', icon: '🍎', phonetic: '/ˈæpl/', category: 'food' },
  { id: 'f-pie', word: 'pie', meaning: '馅饼', icon: '🥧', phonetic: '/paɪ/', category: 'food' },
  { id: 'f-juice', word: 'juice', meaning: '果汁', icon: '🧃', phonetic: '/dʒuːs/', category: 'food' },
  { id: 'f-milk', word: 'milk', meaning: '牛奶', icon: '🥛', phonetic: '/mɪlk/', category: 'food' },
  { id: 'f-egg', word: 'egg', meaning: '鸡蛋', icon: '🥚', phonetic: '/eɡ/', category: 'food' },
  { id: 'f-bread', word: 'bread', meaning: '面包', icon: '🍞', phonetic: '/bred/', category: 'food' },
  { id: 'f-cake', word: 'cake', meaning: '蛋糕', icon: '🍰', phonetic: '/keɪk/', category: 'food' },
  { id: 'f-cheese', word: 'cheese', meaning: '奶酪', icon: '🧀', phonetic: '/tʃiːz/', category: 'food' },
  { id: 'f-fish', word: 'fish', meaning: '鱼', icon: '🐟', phonetic: '/fɪʃ/', category: 'food' },
  { id: 'f-coffee', word: 'coffee', meaning: '咖啡', icon: '☕', phonetic: '/ˈkɒfi/', category: 'food' },
];

const foodFusions: FusionResult[] = [
  { id: 'fus-ap', from: ['f-apple', 'f-pie'], result: 'apple pie', meaning: '苹果派', type: 'compound', example: 'I like eating apple pie after dinner.', icon: '🥧', suggestedWords: ['cinnamon', 'dessert', 'baking', 'pastry', 'oven'] },
  { id: 'fus-aj', from: ['f-apple', 'f-juice'], result: 'apple juice', meaning: '苹果汁', type: 'phrase', example: 'Would you like some apple juice?', icon: '🧃', suggestedWords: ['fresh', 'breakfast', 'healthy', 'refreshing'] },
  { id: 'fus-mc', from: ['f-milk', 'f-cake'], result: 'milk cake', meaning: '奶糕', type: 'phrase', example: 'This milk cake is very soft.', icon: '🍰', suggestedWords: ['soft', 'sweet', 'dessert', 'cream'] },
  { id: 'fus-cc', from: ['f-cheese', 'f-cake'], result: 'cheese cake', meaning: '芝士蛋糕', type: 'compound', example: 'Nothing says party like cheese cake.', icon: '🍰', suggestedWords: ['cream cheese', 'dessert', 'party', 'New York'] },
  { id: 'fus-eb', from: ['f-egg', 'f-bread'], result: 'egg bread', meaning: '鸡蛋面包', type: 'phrase', example: 'I had egg and bread for breakfast.', icon: '🍞', suggestedWords: ['breakfast', 'toast', 'simple', 'morning'] },
  { id: 'fus-fc', from: ['f-fish', 'f-cake'], result: 'fish cake', meaning: '鱼饼', type: 'compound', example: 'Fish cake is popular in Asia.', icon: '🐟', suggestedWords: ['Asian', 'fried', 'street food', 'dim sum'] },
  { id: 'fus-em', from: ['f-egg', 'f-milk'], result: 'custard', meaning: '蛋奶羹', type: 'creative', concept: '蛋与奶在厨房中的融合——蛋羹、炒蛋、烘焙', suggestedWords: ['custard', 'scrambled eggs', 'quiche', 'kitchen'], association: '厨房、烘焙', icon: '🍳' },
  { id: 'fus-jm', from: ['f-juice', 'f-milk'], result: 'smoothie', meaning: '奶昔', type: 'creative', concept: '果汁与牛奶的融合——奶昔、果奶', suggestedWords: ['smoothie', 'milkshake', 'fruit milk'], association: '饮品', icon: '🥤' },
];

// ---------- 旅行主题 ----------
const travelWords: WordBubble[] = [
  { id: 't-passport', word: 'passport', meaning: '护照', icon: '🛂', phonetic: '/ˈpɑːspɔːt/', category: 'object' },
  { id: 't-luggage', word: 'luggage', meaning: '行李', icon: '🧳', phonetic: '/ˈlʌɡɪdʒ/', category: 'object' },
  { id: 't-ticket', word: 'ticket', meaning: '票', icon: '🎫', phonetic: '/ˈtɪkɪt/', category: 'object' },
  { id: 't-hotel', word: 'hotel', meaning: '酒店', icon: '🏨', phonetic: '/həʊˈtel/', category: 'place' },
  { id: 't-map', word: 'map', meaning: '地图', icon: '🗺️', phonetic: '/mæp/', category: 'object' },
  { id: 't-sun', word: 'sun', meaning: '太阳', icon: '☀️', phonetic: '/sʌn/', category: 'nature' },
  { id: 't-beach', word: 'beach', meaning: '海滩', icon: '🏖️', phonetic: '/biːtʃ/', category: 'place' },
  { id: 't-flight', word: 'flight', meaning: '航班', icon: '✈️', phonetic: '/flaɪt/', category: 'object' },
  { id: 't-suitcase', word: 'suitcase', meaning: '行李箱', icon: '🧳', phonetic: '/ˈsuːtkeɪs/', category: 'object' },
  { id: 't-camera', word: 'camera', meaning: '相机', icon: '📷', phonetic: '/ˈkæmərə/', category: 'object' },
];

const travelFusions: FusionResult[] = [
  { id: 'fus-sb', from: ['t-sun', 't-beach'], result: 'sun and beach', meaning: '阳光与海滩', type: 'phrase', example: 'We went for sun and beach last summer.', icon: '🏖️', suggestedWords: ['vacation', 'summer', 'holiday', 'relax'] },
  { id: 'fus-ft', from: ['t-flight', 't-ticket'], result: 'flight ticket', meaning: '机票', type: 'phrase', example: 'I need to book a flight ticket.', icon: '🎫', suggestedWords: ['book', 'airport', 'departure', 'boarding'] },
  { id: 'fus-hm', from: ['t-hotel', 't-map'], result: 'hotel map', meaning: '酒店地图', type: 'phrase', example: 'Check the hotel map for the pool.', icon: '🗺️', suggestedWords: ['lobby', 'pool', 'restaurant', 'check-in'] },
  { id: 'fus-pl', from: ['t-passport', 't-luggage'], result: 'passport and luggage', meaning: '护照与行李', type: 'phrase', example: 'Don\'t forget passport and luggage.', icon: '🧳', suggestedWords: ['airport', 'check-in', 'travel', 'security'] },
];

// ---------- 概念实验室：超越语言的本体融合（狮子+老虎→新物种，房子+小狗→幸福 等）----------
const conceptWords: WordBubble[] = [
  { id: 'c-lion', word: 'lion', meaning: '狮子', icon: '🦁', category: 'animal' },
  { id: 'c-tiger', word: 'tiger', meaning: '老虎', icon: '🐯', category: 'animal' },
  { id: 'c-cat', word: 'cat', meaning: '猫', icon: '🐱', category: 'animal' },
  { id: 'c-dog', word: 'dog', meaning: '小狗', icon: '🐕', category: 'animal' },
  { id: 'c-bird', word: 'bird', meaning: '鸟', icon: '🐦', category: 'animal' },
  { id: 'c-egg', word: 'egg', meaning: '鸡蛋', icon: '🥚', category: 'food' },
  { id: 'c-milk', word: 'milk', meaning: '牛奶', icon: '🥛', category: 'food' },
  { id: 'c-juice', word: 'juice', meaning: '果汁', icon: '🧃', category: 'food' },
  { id: 'c-coffee', word: 'coffee', meaning: '咖啡', icon: '☕', category: 'food' },
  { id: 'c-tea', word: 'tea', meaning: '茶', icon: '🍵', category: 'food' },
  { id: 'c-house', word: 'house', meaning: '房子', icon: '🏠', category: 'object' },
  { id: 'c-book', word: 'book', meaning: '书', icon: '📖', category: 'object' },
  { id: 'c-sun', word: 'sun', meaning: '太阳', icon: '☀️', category: 'nature' },
  { id: 'c-moon', word: 'moon', meaning: '月亮', icon: '🌙', category: 'nature' },
  { id: 'c-flower', word: 'flower', meaning: '花', icon: '🌸', category: 'nature' },
  { id: 'c-tree', word: 'tree', meaning: '树', icon: '🌳', category: 'nature' },
  { id: 'c-rain', word: 'rain', meaning: '雨', icon: '🌧️', category: 'nature' },
  { id: 'c-sea', word: 'sea', meaning: '海', icon: '🌊', category: 'nature' },
  { id: 'c-happiness', word: 'happiness', meaning: '幸福', icon: '✨', category: 'abstract' },
  { id: 'c-music', word: 'music', meaning: '音乐', icon: '🎵', category: 'abstract' },
  { id: 'c-dream', word: 'dream', meaning: '梦', icon: '💭', category: 'abstract' },
];

const conceptFusions: FusionResult[] = [
  {
    id: 'c-lt',
    from: ['c-lion', 'c-tiger'],
    result: 'liger',
    meaning: '狮虎兽',
    type: 'creative',
    concept: '两种大猫的融合，诞生全新物种的意象',
    suggestedWords: ['liger', 'tigon', 'hybrid', 'species'],
    association: '生物融合、想象',
    icon: '🦁',
  },
  {
    id: 'c-cd',
    from: ['c-cat', 'c-dog'],
    result: 'pets',
    meaning: '宠物',
    type: 'creative',
    concept: '猫与狗——家中最常见的陪伴，温暖与活力',
    suggestedWords: ['pets', 'companion', 'family', 'love', 'play'],
    association: '陪伴、家的温暖',
    icon: '🐾',
  },
  {
    id: 'c-em',
    from: ['c-egg', 'c-milk'],
    result: 'custard',
    meaning: '蛋奶羹',
    type: 'creative',
    concept: '蛋与奶在厨房中的融合——蛋羹、炒蛋、烘焙',
    suggestedWords: ['custard', 'scrambled eggs', 'quiche', 'kitchen'],
    association: '厨房、料理',
    icon: '🍳',
  },
  {
    id: 'c-jm',
    from: ['c-juice', 'c-milk'],
    result: 'smoothie',
    meaning: '奶昔',
    type: 'creative',
    concept: '果汁与牛奶的融合——奶昔、果奶',
    suggestedWords: ['smoothie', 'milkshake', 'fruit milk'],
    association: '饮品',
    icon: '🥤',
  },
  {
    id: 'c-cm',
    from: ['c-coffee', 'c-milk'],
    result: 'latte',
    meaning: '拿铁',
    type: 'creative',
    concept: '咖啡与牛奶的融合——拿铁、奶咖、清晨的惬意',
    suggestedWords: ['latte', 'cappuccino', 'morning', 'café', 'breakfast'],
    association: '咖啡馆、晨间时光',
    icon: '☕',
  },
  {
    id: 'c-tf',
    from: ['c-tea', 'c-flower'],
    result: 'floral tea',
    meaning: '花茶',
    type: 'creative',
    concept: '茶与花的融合——茉莉花茶、玫瑰花茶、清香与宁静',
    suggestedWords: ['jasmine tea', 'flower tea', 'calm', 'aroma', 'relax'],
    association: '茶香、宁静、东方韵味',
    icon: '🍵',
  },
  {
    id: 'c-hd',
    from: ['c-house', 'c-dog'],
    result: 'home',
    meaning: '家',
    type: 'creative',
    concept: '房子与小狗融合成「有狗的家」——陪伴、归属、幸福',
    suggestedWords: ['home', 'warmth', 'happiness', 'companion', 'family'],
    association: '家的温暖、幸福',
    icon: '🏠',
  },
  {
    id: 'c-hs',
    from: ['c-house', 'c-sun'],
    result: 'sunny home',
    meaning: '阳光之家',
    type: 'creative',
    concept: '房子与太阳——洒满阳光的窗台、暖洋洋的午后',
    suggestedWords: ['sunny', 'bright', 'warm', 'window', 'afternoon'],
    association: '温暖、明亮、生活气息',
    icon: '🏡',
  },
  {
    id: 'c-ht',
    from: ['c-house', 'c-tree'],
    result: 'garden house',
    meaning: '庭院',
    type: 'creative',
    concept: '房子与树——门前有树、院中有荫，安居与自然',
    suggestedWords: ['garden', 'yard', 'shade', 'nature', 'peace'],
    association: '田园、安宁、自然与家',
    icon: '🌳',
  },
  {
    id: 'c-hb',
    from: ['c-house', 'c-book'],
    result: 'library',
    meaning: '书房',
    type: 'creative',
    concept: '房子与书——一角书房、满架书香、精神归宿',
    suggestedWords: ['library', 'study', 'reading', 'quiet', 'knowledge'],
    association: '阅读、安静、精神家园',
    icon: '📚',
  },
  {
    id: 'c-dh',
    from: ['c-dog', 'c-happiness'],
    result: 'joy',
    meaning: '快乐',
    type: 'creative',
    concept: '小狗与幸福——宠物带来的快乐与爱',
    suggestedWords: ['joy', 'love', 'comfort', 'companion'],
    association: '情感、陪伴',
    icon: '💚',
  },
  {
    id: 'c-df',
    from: ['c-dog', 'c-flower'],
    result: 'spring walk',
    meaning: '春日遛狗',
    type: 'creative',
    concept: '小狗与花——花开时节带狗散步，生机与陪伴',
    suggestedWords: ['walk', 'spring', 'park', 'bloom', 'joy'],
    association: '户外、春天、简单幸福',
    icon: '🐕',
  },
  {
    id: 'c-sf',
    from: ['c-sun', 'c-flower'],
    result: 'garden',
    meaning: '花园',
    type: 'creative',
    concept: '太阳与花的融合——花园、绽放、生机',
    suggestedWords: ['garden', 'bloom', 'spring', 'sunshine'],
    association: '自然、画面',
    icon: '🌻',
  },
  {
    id: 'c-ss',
    from: ['c-sun', 'c-sea'],
    result: 'beach',
    meaning: '海边',
    type: 'creative',
    concept: '太阳与海——沙滩、浪花、度假与自由',
    suggestedWords: ['beach', 'sunset', 'wave', 'vacation', 'freedom'],
    association: '度假、自由、开阔',
    icon: '🏖️',
  },
  {
    id: 'c-mf',
    from: ['c-moon', 'c-flower'],
    result: 'night garden',
    meaning: '夜花园',
    type: 'creative',
    concept: '月亮与花——月下赏花、夜色与清香',
    suggestedWords: ['night garden', 'moonlight', 'fragrance', 'serene', 'beauty'],
    association: '夜色、静谧、诗意',
    icon: '🌙',
  },
  {
    id: 'c-rf',
    from: ['c-rain', 'c-flower'],
    result: 'spring rain',
    meaning: '春雨',
    type: 'creative',
    concept: '雨与花——春雨润花、生机与希望',
    suggestedWords: ['spring rain', 'bloom', 'fresh', 'renewal', 'hope'],
    association: '生机、清新、希望',
    icon: '🌧️',
  },
  {
    id: 'c-bt',
    from: ['c-bird', 'c-tree'],
    result: 'nest',
    meaning: '鸟巢',
    type: 'creative',
    concept: '鸟与树——枝头筑巢、鸣叫与归处',
    suggestedWords: ['nest', 'branch', 'song', 'home', 'nature'],
    association: '自然、归属、自由',
    icon: '🐦',
  },
  {
    id: 'c-cb',
    from: ['c-cat', 'c-book'],
    result: 'cozy',
    meaning: '惬意',
    type: 'creative',
    concept: '猫与书——蜷在书旁的猫、慵懒与阅读',
    suggestedWords: ['cozy', 'reading', 'lazy', 'warm', 'quiet'],
    association: '慵懒、温暖、小确幸',
    icon: '📖',
  },
  {
    id: 'c-mh',
    from: ['c-music', 'c-happiness'],
    result: 'melody',
    meaning: '旋律',
    type: 'creative',
    concept: '音乐与幸福——旋律里的快乐与感动',
    suggestedWords: ['melody', 'rhythm', 'joy', 'emotion', 'song'],
    association: '情感、共鸣、治愈',
    icon: '🎵',
  },
  {
    id: 'c-dm',
    from: ['c-dream', 'c-moon'],
    result: 'night dream',
    meaning: '夜梦',
    type: 'creative',
    concept: '梦与月亮——深夜入梦、朦胧与想象',
    suggestedWords: ['dream', 'night', 'imagination', 'sleep', 'story'],
    association: '想象、梦境、诗意',
    icon: '💭',
  },
  {
    id: 'c-ds',
    from: ['c-dream', 'c-sea'],
    result: 'wanderlust',
    meaning: '向往远方',
    type: 'creative',
    concept: '梦与海——对远方的向往、自由与探索',
    suggestedWords: ['wanderlust', 'travel', 'adventure', 'horizon', 'free'],
    association: '旅行、自由、远方',
    icon: '🌊',
  },
];

export const themes: Theme[] = [
  {
    id: 'food',
    name: '美食',
    nameEn: 'Food & Drink',
    description: '从苹果派到芝士蛋糕，掌握餐桌上的常用词',
    coverEmoji: '🍽️',
    words: foodWords,
    fusions: foodFusions,
  },
  {
    id: 'travel',
    name: '旅行',
    nameEn: 'Travel',
    description: '护照、机票、海滩——出行必备词汇',
    coverEmoji: '✈️',
    words: travelWords,
    fusions: travelFusions,
  },
  {
    id: 'concept',
    name: '概念实验室',
    nameEn: 'Concept Fusion',
    description: '超越语言：融合概念与物，再落到词。狮子+老虎→新物种，房子+小狗→幸福',
    coverEmoji: '✨',
    words: conceptWords,
    fusions: conceptFusions,
  },
];

export function getThemeById(id: string): Theme | undefined {
  return themes.find((t) => t.id === id);
}
