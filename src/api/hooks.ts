import type { AxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	clearConversationId,
	loadConversationId,
	saveConversationId,
} from '@/lib/chatSession';
import type {
	AssignmentsResult,
	ChatMessage,
	ChatResponse,
	ChatUiFlags,
	ForceAssignRequest,
	ScheduleInfo,
} from './generated';
import {
	getAssignmentsAssignmentsGet,
	getConversationMessagesConversationsConversationIdMessagesGet,
	getScheduleScheduleGet,
	postChatChatPost,
	postForceAssignForceAssignPost,
} from './generated';
import { ApiError } from './generated/core/ApiError';

type AsyncState<T> = {
	data: T | null;
	loading: boolean;
	error: string | null;
};

function getErrorMessage(err: unknown): string {
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

export function useSchedule(): AsyncState<ScheduleInfo> & { refetch: () => Promise<void> } {
	const [data, setData] = useState<ScheduleInfo | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await getScheduleScheduleGet();
			setData(res);
		} catch (e) {
			setError(getErrorMessage(e));
			setData(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	return { data, loading, error, refetch: load };
}

export function useAssignments(): AsyncState<AssignmentsResult> & {
	refetch: (opts?: { refresh?: boolean }) => Promise<void>;
} {
	const [data, setData] = useState<AssignmentsResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async (opts?: { refresh?: boolean }) => {
		setLoading(true);
		setError(null);
		try {
			const res = await getAssignmentsAssignmentsGet({
				refresh: opts?.refresh ?? false,
				agronomistId: undefined,
			});
			setData(res);
		} catch (e) {
			setError(getErrorMessage(e));
			setData(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load({ refresh: false });
	}, [load]);

	return { data, loading, error, refetch: load };
}

export function useForceAssign() {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const mutate = useCallback(async (body: ForceAssignRequest) => {
		setSubmitting(true);
		setError(null);
		try {
			await postForceAssignForceAssignPost({ requestBody: body });
		} catch (e) {
			setError(getErrorMessage(e));
			throw e;
		} finally {
			setSubmitting(false);
		}
	}, []);

	return { mutate, submitting, error };
}

type UseChatOpts = {
	/**
	 * Called when the server sets `flags.map_updated`, `flags.schedule_updated`, or
	 * `flags.roster_updated` (schedule or assignments changed; refetch to refresh the UI).
	 */
	onChatFlags?: (flags: ChatUiFlags) => void;
};

export function useChat(opts?: UseChatOpts) {
	const onChatFlags = opts?.onChatFlags;
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [conversationId, setConversationId] = useState<string | null>(() =>
		loadConversationId()
	);
	const conversationIdRef = useRef(conversationId);
	conversationIdRef.current = conversationId;

	const clearConversation = useCallback(() => {
		clearConversationId();
		conversationIdRef.current = null;
		setConversationId(null);
	}, []);

	const send = useCallback(
		async (message: string): Promise<ChatResponse> => {
			setSubmitting(true);
			setError(null);
			try {
				const id = conversationIdRef.current;
				const requestBody =
					id != null ? { message, conversation_id: id } : { message };
				const res = await postChatChatPost({ requestBody });
				saveConversationId(res.conversation_id);
				conversationIdRef.current = res.conversation_id;
				setConversationId(res.conversation_id);
				const flags = res.flags;
				if (flags && (flags.map_updated || flags.schedule_updated || flags.roster_updated)) {
					onChatFlags?.(flags);
				}
				return res;
			} catch (e) {
				setError(getErrorMessage(e));
				throw e;
			} finally {
				setSubmitting(false);
			}
		},
		[onChatFlags]
	);

	return { send, submitting, error, conversationId, clearConversation };
}

function displayMessages(messages: ChatMessage[]): ChatMessage[] {
	return messages.filter((m) => m.role !== 'system');
}

type UseConversationMessagesOpts = {
	/** When false, skip GET history but keep local messages (e.g. after first POST /chat). */
	enabled?: boolean;
};

export function useConversationMessages(
	conversationId: string | null,
	opts?: UseConversationMessagesOpts
) {
	const enabled = opts?.enabled ?? true;
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!conversationId) {
			setMessages([]);
			setLoading(false);
			setError(null);
			return;
		}

		if (!enabled) {
			setLoading(false);
			setError(null);
			return;
		}

		let cancelled = false;
		setLoading(true);
		setError(null);

		void (async () => {
			try {
				const res =
					await getConversationMessagesConversationsConversationIdMessagesGet({
						conversationId,
					});
				if (!cancelled) setMessages(displayMessages(res));
			} catch (e) {
				if (!cancelled) {
					setError(getErrorMessage(e));
					setMessages([]);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [conversationId, enabled]);

	return { messages, setMessages, loading, error };
}
