export const CHAT_CONVERSATION_KEY = 'agri-chat-conversation-id';

export function loadConversationId(): string | null {
	try {
		return sessionStorage.getItem(CHAT_CONVERSATION_KEY);
	} catch {
		return null;
	}
}

export function saveConversationId(id: string): void {
	try {
		sessionStorage.setItem(CHAT_CONVERSATION_KEY, id);
	} catch {
		/* sessionStorage unavailable */
	}
}

export function clearConversationId(): void {
	try {
		sessionStorage.removeItem(CHAT_CONVERSATION_KEY);
	} catch {
		/* sessionStorage unavailable */
	}
}
