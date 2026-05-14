import { OpenAPI } from './generated/core/OpenAPI';

/**
 * Sync hey-api OpenAPI client base URL with Vite env (used by `sdk.gen` requests).
 * In dev, use same-origin paths so the Vite dev server proxy can reach `VITE_API_URL`
 * without browser CORS. Production builds use the configured API origin.
 */
export function configureOpenAPI(): void {
  if (import.meta.env.DEV) {
    OpenAPI.BASE = '';
    return;
  }
  const raw = import.meta.env.VITE_API_URL;
  const trimmed = typeof raw === 'string' ? raw.replace(/\/$/, '') : '';
  OpenAPI.BASE = trimmed || 'http://localhost:8000';
}
