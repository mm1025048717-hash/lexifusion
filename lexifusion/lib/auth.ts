/**
 * 认证管理：JWT token 的存储与自动匿名注册
 * - Web 端使用 localStorage
 * - Native 端使用 AsyncStorage
 * - 首次启动自动生成 deviceId 并注册
 */
import { Platform } from 'react-native';

const TOKEN_KEY = '@lexifusion/jwt_token';
const DEVICE_ID_KEY = '@lexifusion/device_id';
const USER_KEY = '@lexifusion/user';

// ─── Platform-agnostic storage ──────────────────────────────

async function storageGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try { return window.localStorage.getItem(key); } catch { return null; }
  } else {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return AsyncStorage.getItem(key);
  }
}

async function storageSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
  } else {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem(key, value);
  }
}

// ─── Device ID ──────────────────────────────────────────────

function generateDeviceId(): string {
  // Simple unique ID: timestamp + random
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 10);
  return `device-${ts}-${rand}`;
}

export async function getDeviceId(): Promise<string> {
  let id = await storageGet(DEVICE_ID_KEY);
  if (!id) {
    id = generateDeviceId();
    await storageSet(DEVICE_ID_KEY, id);
  }
  return id;
}

// ─── Token management ───────────────────────────────────────

let _cachedToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (_cachedToken) return _cachedToken;
  _cachedToken = await storageGet(TOKEN_KEY);
  return _cachedToken;
}

export async function setToken(token: string): Promise<void> {
  _cachedToken = token;
  await storageSet(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  _cachedToken = null;
  await storageSet(TOKEN_KEY, '');
}

// ─── User info ──────────────────────────────────────────────

export interface StoredUser {
  id: string;
  deviceId: string;
  nickname: string | null;
  email: string | null;
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await storageGet(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function setStoredUser(user: StoredUser): Promise<void> {
  await storageSet(USER_KEY, JSON.stringify(user));
}

// ─── Auto-register flow ────────────────────────────────────

let _initPromise: Promise<StoredUser | null> | null = null;

/**
 * Ensure the user is authenticated.
 * On first launch, generates a deviceId and registers anonymously.
 * Returns the user info, or null if offline.
 */
export function ensureAuth(): Promise<StoredUser | null> {
  if (!_initPromise) {
    _initPromise = _doEnsureAuth();
  }
  return _initPromise;
}

async function _doEnsureAuth(): Promise<StoredUser | null> {
  // Check if we already have a token
  const existingToken = await getToken();
  if (existingToken) {
    const existingUser = await getStoredUser();
    if (existingUser) return existingUser;
  }

  // Need to register
  try {
    const deviceId = await getDeviceId();
    // Import api dynamically to avoid circular dependency
    const { apiRegister } = await import('./api');
    const result = await apiRegister(deviceId);
    await setToken(result.token);
    await setStoredUser(result.user);
    return result.user;
  } catch (err) {
    console.warn('[auth] Failed to auto-register, will retry later:', err);
    return null;
  }
}

/**
 * Reset the init promise so ensureAuth will retry on next call.
 */
export function resetAuth(): void {
  _initPromise = null;
}
