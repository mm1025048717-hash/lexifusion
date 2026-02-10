/**
 * Vercel Serverless Function: DeepSeek AI 词汇融合
 * POST /api/fusion
 * Body: { wordA: { word, meaning, category }, wordB: { word, meaning, category } }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// ─── 配置 ──────────────────────────────────────────────────────
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

// ─── 类型 ──────────────────────────────────────────────────────
interface WordInput {
  word: string;
  meaning: string;
  category: string;
}

interface AIFusionResult {
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

interface FusionDTO {
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
  etymology?: string | null;
  memoryTip?: string | null;
}

// ─── Prompt 构建 ──────────────────────────────────────────────
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
- icon：【必须是单个emoji】最能代表融合结果的1个emoji（如🔥、🌊、🦋），绝对不能是多个emoji拼接
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

// ─── 提取第一个 emoji ──────────────────────────────────────────
function extractFirstEmoji(str: string): string {
  if (!str) return '✨';
  // 匹配 emoji 的正则（包括组合 emoji）
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?)/u;
  const match = str.match(emojiRegex);
  return match ? match[0] : '✨';
}

// ─── 验证单个结果 ──────────────────────────────────────────────
function validateResult(parsed: any, wordA: WordInput, wordB: WordInput): AIFusionResult {
  // 确保只取第一个 emoji，避免多个 emoji 拼接
  const rawIcon = parsed.icon || '✨';
  const singleIcon = extractFirstEmoji(rawIcon);
  
  return {
    result: parsed.result || `${wordA.word} ${wordB.word}`,
    meaning: parsed.meaning || `${wordA.meaning}与${wordB.meaning}的融合`,
    concept: parsed.concept || `${wordA.meaning}与${wordB.meaning}相遇，产生新的意象`,
    association: parsed.association || '创意融合',
    suggestedWords: Array.isArray(parsed.suggestedWords) ? parsed.suggestedWords.slice(0, 5) : [],
    example: parsed.example || `This is a fusion of ${wordA.word} and ${wordB.word}.`,
    icon: singleIcon,
    type: (['compound', 'phrase', 'creative'].includes(parsed.type) ? parsed.type : 'creative') as AIFusionResult['type'],
    etymology: parsed.etymology || undefined,
    memoryTip: parsed.memoryTip || undefined,
  };
}

// ─── AI 融合主函数 ──────────────────────────────────────────────
async function aiFusionMulti(wordA: WordInput, wordB: WordInput): Promise<AIFusionResult[]> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  const client = new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: DEEPSEEK_BASE_URL,
  });

  const prompt = buildFusionPrompt(wordA, wordB);

  const response = await client.chat.completions.create({
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

  return results;
}

// ─── 转换为 DTO ──────────────────────────────────────────────
function toFusionDTO(result: AIFusionResult, wordA: WordInput, wordB: WordInput, idx: number): FusionDTO {
  const key = [wordA.word, wordB.word].sort().join('+');
  return {
    id: idx === 0 ? `ai-${key}` : `ai-${key}-${idx}`,
    from: [`virtual-${wordA.word.toLowerCase()}`, `virtual-${wordB.word.toLowerCase()}`],
    result: result.result,
    meaning: result.meaning,
    type: result.type,
    icon: result.icon,
    concept: result.concept,
    suggestedWords: result.suggestedWords,
    association: result.association,
    example: result.example,
    etymology: result.etymology,
    memoryTip: result.memoryTip,
    imageUrl: null,
    imageUrls: null,
    isCreative: true,
  };
}

// ─── Vercel Handler ──────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wordA, wordB } = req.body;

    // Validate input
    if (!wordA?.word || !wordB?.word) {
      return res.status(400).json({ 
        error: 'wordA and wordB with word/meaning/category are required' 
      });
    }

    const inputA: WordInput = {
      word: wordA.word,
      meaning: wordA.meaning || '',
      category: wordA.category || 'other',
    };

    const inputB: WordInput = {
      word: wordB.word,
      meaning: wordB.meaning || '',
      category: wordB.category || 'other',
    };

    // Call DeepSeek AI
    const results = await aiFusionMulti(inputA, inputB);
    const fusions = results.map((r, i) => toFusionDTO(r, inputA, inputB, i));

    return res.status(200).json({
      fusion: fusions[0],
      fusions,
    });
  } catch (err: any) {
    console.error('[api/fusion] Error:', err.message);
    return res.status(500).json({ 
      error: 'Failed to resolve fusion',
      message: err.message 
    });
  }
}
