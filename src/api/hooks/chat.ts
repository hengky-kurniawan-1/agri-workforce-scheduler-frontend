import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import { clearConversationId, loadConversationId, saveConversationId } from '@/lib/chatSession';
import type { ChatMessage, ChatResponse, ChatUiFlags } from '../generated';
import {
	getConversationMessagesConversationsConversationIdMessagesGet,
	postChatChatPost,
} from '../generated';
import { invalidateOnChatFlags } from '../invalidateOnChatFlags';
import { queryKeys } from '../queryKeys';
import { getErrorMessage } from './core';

type UseChatOpts = {
	/**
	 * Called when the server sets `flags.map_updated`, `flags.schedule_updated`, or
	 * `flags.roster_updated` (schedule or assignments changed; refetch to refresh the UI).
	 */
	onChatFlags?: (flags: ChatUiFlags) => void;
};

export function useChat(opts?: UseChatOpts) {
	const queryClient = useQueryClient();
	const onChatFlags = opts?.onChatFlags;
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [conversationId, setConversationId] = useState<string | null>(() => loadConversationId());
	const conversationIdRef = useRef(conversationId);
	conversationIdRef.current = conversationId;

	const clearConversation = useCallback(() => {
		clearConversationId();
		conversationIdRef.current = null;
		setConversationId(null);
		setError(null);
	}, []);

	const send = useCallback(
		async (message: string): Promise<ChatResponse> => {
			setSubmitting(true);
			setError(null);
			try {
				const id = conversationIdRef.current;
				const requestBody = id != null ? { message, conversation_id: id } : { message };
				const res = await postChatChatPost({ requestBody });
				saveConversationId(res.conversation_id);
				conversationIdRef.current = res.conversation_id;
				setConversationId(res.conversation_id);
				const flags = res.flags;
				if (flags && (flags.map_updated || flags.schedule_updated || flags.roster_updated)) {
					invalidateOnChatFlags(flags, queryClient);
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
		[onChatFlags, queryClient]
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

	const query = useQuery({
		queryKey:
			conversationId != null
				? queryKeys.conversationMessages(conversationId)
				: ['conversations', 'none', 'messages'],
		queryFn: () =>
			getConversationMessagesConversationsConversationIdMessagesGet({
				conversationId: conversationId as string,
			}),
		enabled: conversationId != null && enabled,
	});

	useEffect(() => {
		if (!conversationId || !enabled) {
			setMessages([]);
			return;
		}
		if (query.data) {
			setMessages(displayMessages(query.data));
		}
	}, [conversationId, enabled, query.data]);

	const setMessagesWrapped = useCallback<Dispatch<SetStateAction<ChatMessage[]>>>((value) => {
		setMessages(value);
	}, []);

	return {
		messages,
		setMessages: setMessagesWrapped,
		loading: query.isLoading,
		error: query.error ? getErrorMessage(query.error) : null,
	};
}
