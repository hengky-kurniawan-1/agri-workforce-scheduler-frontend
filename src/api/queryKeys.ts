export const queryKeys = {
	health: ['health'] as const,
	tasks: ['tasks'] as const,
	fields: ['fields'] as const,
	agronomists: ['agronomists'] as const,
	assignments: ['assignments'] as const,
	conversationMessages: (conversationId: string) =>
		['conversations', conversationId, 'messages'] as const,
};
