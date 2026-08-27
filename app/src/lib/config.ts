/**
 * Central runtime configuration. R2/base URLs live here ONLY (PROJECT_SPEC §4:
 * no content URLs hardcoded anywhere else in the UI layer).
 */
import { Platform } from 'react-native';

/**
 * Resolve the content source base URL.
 * Priority: explicit env override > platform-friendly local seed server.
 * - Android emulator reaches host machine via 10.0.2.2 (not localhost).
 * - iOS simulator / web can use localhost directly.
 */
export function resolveBaseUrl(
  envUrl: string | undefined,
  platform: string = Platform.OS,
): string {
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, '');
  if (platform === 'android') return 'http://10.0.2.2:8787';
  return 'http://localhost:8787';
}

export const CONTENT_BASE_URL = resolveBaseUrl(process.env.EXPO_PUBLIC_CONTENT_BASE_URL);
