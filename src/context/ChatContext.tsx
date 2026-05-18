import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import type { ChatMessage, ChatResponse } from '@/api/generated';
import { useChat, useConversationMessages } from '@/api/hooks';
import { loadConversationId } from '@/lib/chatSession';

type ChatContextValue = {
	messages: ChatMessage[];
	setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
	send: (message: string) => Promise<ChatResponse>;
	submitting: boolean;
	sendError: string | null;
	historyLoading: boolean;
	historyError: string | null;
	shouldFetchHistory: boolean;
	conversationId: string | null;
	clearConversation: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

type ChatProviderProps = {
	children: ReactNode;
};

export function ChatProvider({ children }: ChatProviderProps) {
	const restoredConversationId = useRef(loadConversationId()).current;
	const { send, submitting, error: sendError, conversationId, clearConversation } = useChat();
	const shouldFetchHistory = conversationId != null && conversationId === restoredConversationId;
	const {
		messages,
		setMessages,
		loading: historyLoading,
		error: historyError,
	} = useConversationMessages(conversationId, { enabled: shouldFetchHistory });

	useEffect(() => {
		if (historyError && shouldFetchHistory) clearConversation();
	}, [historyError, shouldFetchHistory, clearConversation]);

	const value = useMemo(
		(): ChatContextValue => ({
			messages,
			setMessages,
			send,
			submitting,
			sendError,
			historyLoading,
			historyError,
			shouldFetchHistory,
			conversationId,
			clearConversation,
		}),
		[
			messages,
			setMessages,
			send,
			submitting,
			sendError,
			historyLoading,
			historyError,
			shouldFetchHistory,
			conversationId,
			clearConversation,
		]
	);

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextValue {
	const ctx = useContext(ChatContext);
	if (!ctx) {
		throw new Error('useChatContext must be used within ChatProvider');
	}
	return ctx;
}
