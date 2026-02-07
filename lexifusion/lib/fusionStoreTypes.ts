/**
 * 融合存储相关类型（与平台无关，供 fusionStore / fusionStore.web 共用）
 */
import type { FusionResult } from '@/data/themes';

/** 带时间戳的融合记录，用于去重与排序 */
export type StoredFusion = FusionResult & { discoveredAt: number };
