/**
 * DeepSeek AI 创意融合服务 — Vercel Serverless 版
 * 使用 openai SDK 对接 DeepSeek API，返回3个融合结果
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

export interface WordInput {
  word: string;
  meaning: string;
  category: string;
}

// ─── 缓存 ──────────────────────────────────────────────────────
const fusionCache = new Map<string, AIFusionResult[]>();

function cacheKey(wordA: string, wordB: string): string {
  return [wordA, wordB].sort().join('⊕');
}

// ─── 核心 Prompt（多结果版） ───────────────────────────────────
function buildFusionPrompt(wordA: WordInput, wordB: WordInput): string {
  return `你是一位精通英语教育的语言专家。你的任务是将两个英语单词进行"概念融合"，从不同角度给出3个融合结果，帮助用户通过创意联想高效记忆真实英语词汇。

## 两个待融合的词汇

**词A**: ${wordA.word}（${wordA.meaning}）— 类别：${wordA.category}
**词B**: ${wordB.word}（${wordB.meaning}）— 类别：${wordB.category}

## 严格规则（必须遵守）

### 【最重要】只输出真实存在的英语单词！
- result 字段：必须是一个真实存在于英语词典中的单词或词组
- 优先级：① 真实复合词（如 sunflower, raindrop）→ ② 真实常用搭配/短语（如 morning dew）→ ③ 与两词概念最相关的真实近义词/关联词
- 绝对禁止自创词！词典里查不到的组合严禁输出
- suggestedWords 中的每个词也必须是真实英语单词
- 3个结果的 result 必须是3个不同的词！

### 3个结果的角度
1. **第一个**：最直接、最常见的融合结果（优先复合词或短语）
2. **第二个**：从场景/画面角度联想的词（偏诗意、偏情感）
3. **第三个**：从功能/用途角度联想的词（偏实用、偏延伸）

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
function validateResult(parsed: any, wordA: WordInput, wordB: WordInput): AIFusionResult {
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
  wordA: WordInput,
  wordB: WordInput
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
          content: '你是一位英语词汇教育专家。你只输出真实存在于英语词典中的单词，绝不自创。你总是输出严格的JSON格式，不含任何其他内容。每次给出3个不同角度的融合结果。',
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
      const k = r.result.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
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

// ─── 检查是否可用 ─────────────────────────────────────────────
export function isDeepSeekAvailable(): boolean {
  return !!DEEPSEEK_API_KEY;
}
