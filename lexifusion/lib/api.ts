/**
 * API 客户端：统一封装后端 HTTP 请求
 * - 自动附加 JWT token
 * - 错误处理与重试
 * - 开发/生产环境自动切换 base URL
 */
import { Platform } from 'react-native';
import { getToken } from './auth';

// In dev, web uses localhost directly; native uses the machine IP
const DEV_API_BASE = Platform.select({
  web: 'http://localhost:3001',
  default: 'http://localhost:3001', // change to your machine IP for real device testing
});

// 生产环境使用相对路径（同域名 Vercel Serverless Function）
const PROD_API_BASE = '';

const API_BASE = __DEV__ ? DEV_API_BASE : PROD_API_BASE;

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
}

class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, requireAuth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, config);

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, data?.error || `HTTP ${res.status}`, data);
  }

  return res.json();
}

// ─── Auth API ───────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: { id: string; deviceId: string; nickname: string | null; email: string | null };
  isNew: boolean;
}

export function apiRegister(deviceId: string): Promise<AuthResponse> {
  return request('/api/auth/register', {
    method: 'POST',
    body: { deviceId },
  });
}

export function apiBindEmail(email: string): Promise<any> {
  return request('/api/auth/bind-email', {
    method: 'POST',
    body: { email },
    requireAuth: true,
  });
}

// ─── Themes API ─────────────────────────────────────────────

export interface ThemeSummary {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  coverEmoji: string;
  wordCount: number;
  fusionCount: number;
}

export interface WordDTO {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  icon: string | null;
  imageUrl: string | null;
  category: string | null;
}

export interface ThemeDetail {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  coverEmoji: string;
  words: WordDTO[];
}

export interface FusionDTO {
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
  isCreative?: boolean;
  /** 词源/文化小知识 (AI) */
  etymology?: string | null;
  /** 记忆技巧 (AI) */
  memoryTip?: string | null;
}

export async function apiGetThemes(): Promise<ThemeSummary[]> {
  const data = await request<{ themes: ThemeSummary[] }>('/api/themes');
  return data.themes;
}

export async function apiGetTheme(id: string): Promise<ThemeDetail> {
  const data = await request<{ theme: ThemeDetail }>(`/api/themes/${id}`);
  return data.theme;
}

export async function apiGetThemeFusions(themeId: string): Promise<FusionDTO[]> {
  const data = await request<{ fusions: FusionDTO[] }>(`/api/themes/${themeId}/fusions`);
  return data.fusions;
}

// ─── Words API (global search) ──────────────────────────────

export interface WordItem {
  id: string;
  word: string;
  meaning: string;
  icon: string | null;
  category: string | null;
  phonetic?: string | null;
}

export async function apiSearchWords(q?: string, category?: string): Promise<WordItem[]> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category && category !== 'all') params.set('category', category);
  params.set('limit', '500');
  const data = await request<{ words: WordItem[] }>(`/api/words?${params.toString()}`);
  return data.words;
}

export async function apiGetRandomPair(): Promise<{ wordA: WordItem; wordB: WordItem }> {
  return request<{ wordA: WordItem; wordB: WordItem }>('/api/words/random-pair');
}

export async function apiGetCategories(): Promise<{ id: string; name: string; count: number }[]> {
  const data = await request<{ categories: { id: string; name: string; count: number }[] }>('/api/words/categories');
  return data.categories;
}

// ─── Fusions API ────────────────────────────────────────────

export async function apiResolveFusion(wordAId: string, wordBId: string): Promise<FusionDTO> {
  const data = await request<{ fusion: FusionDTO }>('/api/fusions/resolve', {
    method: 'POST',
    body: { wordAId, wordBId },
  });
  return data.fusion;
}

/** Resolve fusion — returns multiple results for horizontal browsing */
export async function apiResolveFusionMulti(wordAId: string, wordBId: string): Promise<FusionDTO[]> {
  const data = await request<{ fusions: FusionDTO[] }>('/api/fusions/resolve', {
    method: 'POST',
    body: { wordAId, wordBId },
  });
  return data.fusions ?? [data.fusion];
}

/** Chain fusion by text — for virtual words (fusion results used as input) */
export async function apiResolveFusionByText(
  wordA: { word: string; meaning: string; category: string },
  wordB: { word: string; meaning: string; category: string }
): Promise<FusionDTO[]> {
  // 使用 Vercel Serverless Function
  const data = await request<{ fusions: FusionDTO[]; fusion: FusionDTO }>('/api/fusion', {
    method: 'POST',
    body: { wordA, wordB },
  });
  return data.fusions ?? [data.fusion];
}

export interface DiscoveryDTO {
  discoveryId: string;
  fusion: FusionDTO;
  discoveredAt: string;
  isFavorite: boolean;
}

export async function apiRecordDiscovery(
  wordAId: string,
  wordBId: string,
  fusion: FusionDTO
): Promise<any> {
  return request('/api/fusions/discoveries', {
    method: 'POST',
    body: { wordAId, wordBId, fusion },
    requireAuth: true,
  });
}

export async function apiGetDiscoveries(): Promise<DiscoveryDTO[]> {
  const data = await request<{ discoveries: DiscoveryDTO[] }>('/api/fusions/discoveries', {
    requireAuth: true,
  });
  return data.discoveries;
}

// ─── Favorites API ──────────────────────────────────────────

export async function apiToggleFavorite(discoveryId: string): Promise<boolean> {
  const data = await request<{ isFavorite: boolean }>(`/api/fusions/favorites/${discoveryId}`, {
    method: 'POST',
    requireAuth: true,
  });
  return data.isFavorite;
}

export interface FavoriteDTO {
  favoriteId: string;
  discoveryId: string;
  fusion: FusionDTO;
  discoveredAt: string;
  favoritedAt: string;
}

export async function apiGetFavorites(): Promise<FavoriteDTO[]> {
  const data = await request<{ favorites: FavoriteDTO[] }>('/api/fusions/favorites', {
    requireAuth: true,
  });
  return data.favorites;
}

// ─── User API ───────────────────────────────────────────────

export interface UserProfile {
  user: {
    id: string;
    deviceId: string;
    email: string | null;
    nickname: string | null;
    createdAt: string;
    lastActiveAt: string;
  };
  stats: {
    discoveryCount: number;
    favoriteCount: number;
  };
}

export async function apiGetMe(): Promise<UserProfile> {
  return request<UserProfile>('/api/users/me', { requireAuth: true });
}

export async function apiUpdateMe(data: { nickname?: string }): Promise<any> {
  return request('/api/users/me', {
    method: 'PATCH',
    body: data,
    requireAuth: true,
  });
}

export { ApiError };
