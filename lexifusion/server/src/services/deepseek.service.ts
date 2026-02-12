/**
 * DeepSeek AI 创意融合服务
 * 利用大模型实现真正智能的词汇概念融合
 * 支持多结果（每次返回3个不同角度的融合）
 */
import OpenAI from 'openai';

// ─── 配置 ──────────────────────────────────────────────────────
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }
    client = new OpenAI({
      apiKey: DEEPSEEK_API_KEY,
      baseURL: DEEPSEEK_BASE_URL,
    });
  }
  return client;
}

// ─── 类型 ──────────────────────────────────────────────────────
export interface AIFusionResult {
  result: string;
  meaning: string;
  concept: string;
  association: string;
  suggestedWords: string[];
  example: string;
  icon: string;
  type: 'compound' | 'phrase' | 'creative';
  etymology?: string;
  memoryTip?: string;
}

// ─── 缓存 ──────────────────────────────────────────────────────
const fusionCache = new Map<string, AIFusionResult[]>();

function cacheKey(wordA: string, wordB: string): string {
  return [wordA, wordB].sort().join('⊕');
}

// ─── 核心 Prompt（多结果版） ───────────────────────────────────
function buildFusionPrompt(
  wordA: { word: string; meaning: string; category: string },
  wordB: { word: string; meaning: string; category: string }
): string {
  return `你是一位精通英语教育的语言专家。你的任务是将两个英语单词进行"概念融合"，从不同角度给出3个融合结果，帮助用户通过创意联想高效记忆真实英语词汇。

## 两个待融合的词汇

**词A**: ${wordA.word}（${wordA.meaning}）— 类别：${wordA.category}
**词B**: ${wordB.word}（${wordB.meaning}）— 类别：${wordB.category}

## 严格规则（必须遵守）

### 【最重要】只输出真实存在的英语单词！
- result 字段：必须是一个真实存在于英语词典中的单词或词组
- 绝对禁止自创词！词典里查不到的组合严禁输出
- suggestedWords 中的每个词也必须是真实英语单词
- 3个结果的 result 必须是3个不同的词！

### 【融合优先级】按直观程度从高到低
1. **优先**：真实复合词（如 sun+flower→sunflower、rain+drop→raindrop）或真实短语（如 morning dew）
2. **其次**：语义相近/场景相关的真实词（两词共同场景、共同用途、近义词）
3. **最后**：抽象联想（仅当前两者都无法找到合理结果时）

### 3个结果的角度（务必遵循优先级）
1. **第一个**：最直接、最直观的融合（优先复合词/短语，其次语义相关，避免牵强抽象）
2. **第二个**：从场景/画面角度的联想（仍需有清晰语义关联）
3. **第三个**：从功能/用途角度的联想（实用、可解释）

### 每个结果包含
- result：真实英语单词
- meaning：简洁中文释义（8字以内）
- concept：画面描述（中文，30-50字，诗意）
- association：联想关键词
- suggestedWords：4个相关真实词汇
- example：自然英语例句
- icon：最能代表的emoji
- type：compound/phrase/creative
- etymology：词源小知识（可选）
- memoryTip：记忆技巧（可选）

## 输出格式（严格 JSON）

{
  "results": [
    {
      "result": "词1",
      "meaning": "释义",
      "concept": "画面描述",
      "association": "联想关键词",
      "suggestedWords": ["词1", "词2", "词3", "词4"],
      "example": "例句",
      "icon": "emoji",
      "type": "compound/phrase/creative",
      "etymology": "词源",
      "memoryTip": "记忆技巧"
    },
    { ... },
    { ... }
  ]
}

只输出 JSON，不要其他内容。`;
}

// ─── 验证单个结果 ──────────────────────────────────────────────
function validateResult(
  parsed: any,
  wordA: { word: string; meaning: string },
  wordB: { word: string; meaning: string }
): AIFusionResult {
  return {
    result: parsed.result || `${wordA.word} ${wordB.word}`,
    meaning: parsed.meaning || `${wordA.meaning}与${wordB.meaning}的融合`,
    concept: parsed.concept || `${wordA.meaning}与${wordB.meaning}相遇，产生新的意象`,
    association: parsed.association || '创意融合',
    suggestedWords: Array.isArray(parsed.suggestedWords) ? parsed.suggestedWords.slice(0, 5) : [],
    example: parsed.example || `This is a fusion of ${wordA.word} and ${wordB.word}.`,
    icon: parsed.icon || '✨',
    type: (['compound', 'phrase', 'creative'].includes(parsed.type) ? parsed.type : 'creative') as AIFusionResult['type'],
    etymology: parsed.etymology || undefined,
    memoryTip: parsed.memoryTip || undefined,
  };
}

// ─── AI 融合主函数（多结果版） ──────────────────────────────────
export async function aiFusionMulti(
  wordA: { word: string; meaning: string; category: string },
  wordB: { word: string; meaning: string; category: string }
): Promise<AIFusionResult[]> {
  const key = cacheKey(wordA.word, wordB.word);

  const cached = fusionCache.get(key);
  if (cached) {
    console.log(`[DeepSeek] Cache hit (multi): ${wordA.word} + ${wordB.word}`);
    return cached;
  }

  console.log(`[DeepSeek] Fusing (multi): ${wordA.word} + ${wordB.word}`);

  const openai = getClient();
  const prompt = buildFusionPrompt(wordA, wordB);

  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一位英语词汇教育专家。融合优先级：①复合词/短语 ②语义/场景相关词 ③抽象联想（最后才用）。只输出真实英语单词，绝不自创。输出严格JSON格式，每次3个不同结果。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from DeepSeek');

    const parsed = JSON.parse(content);

    let results: AIFusionResult[];
    if (Array.isArray(parsed.results) && parsed.results.length > 0) {
      results = parsed.results.slice(0, 3).map((r: any) => validateResult(r, wordA, wordB));
    } else {
      // Fallback: old single-result format
      results = [validateResult(parsed, wordA, wordB)];
    }

    // Deduplicate by result word
    const seen = new Set<string>();
    results = results.filter((r) => {
      const key = r.result.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    fusionCache.set(key, results);
    console.log(`[DeepSeek] Results: ${results.map((r) => r.result).join(', ')}`);
    return results;
  } catch (err: any) {
    console.error(`[DeepSeek] Error:`, err.message);
    throw err;
  }
}

// ─── 向后兼容：单结果版 ─────────────────────────────────────────
export async function aiFusion(
  wordA: { word: string; meaning: string; category: string },
  wordB: { word: string; meaning: string; category: string }
): Promise<AIFusionResult> {
  const results = await aiFusionMulti(wordA, wordB);
  return results[0];
}

// ─── 检查是否可用 ─────────────────────────────────────────────
export function isDeepSeekAvailable(): boolean {
  return !!DEEPSEEK_API_KEY;
}

export function getCacheStats() {
  return { size: fusionCache.size, keys: Array.from(fusionCache.keys()) };
}
