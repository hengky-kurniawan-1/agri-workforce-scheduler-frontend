import type { AxiosError } from 'axios';
import { ApiError } from '../generated/core/ApiError';

export function getErrorMessage(err: unknown): string {
	if (err instanceof ApiError) {
		const body = err.body as { detail?: string | Array<{ msg?: string }> } | undefined;
		if (body?.detail !== undefined) {
			if (typeof body.detail === 'string') return body.detail;
			if (Array.isArray(body.detail)) {
				return body.detail.map((d) => d.msg ?? JSON.stringify(d)).join('; ') || err.message;
			}
		}
		return err.message;
	}
	const ax = err as AxiosError<{ detail?: string }>;
	if (ax.response?.data?.detail) return String(ax.response.data.detail);
	const code = ax.code;
	if (code === 'ERR_NETWORK' || ax.message === 'Network Error') {
		return 'Cannot reach the API. In dev, ensure the backend is running and VITE_API_URL in .env matches it, then restart npm run dev. For production builds, set VITE_API_URL and ensure CORS allows this origin.';
	}
	if (code === 'ECONNABORTED') {
		return 'Request timed out. Check that the API is responding and try again.';
	}
	if (ax.message) return ax.message;
	if (err instanceof Error) return err.message;
	return 'Unknown error';
}
