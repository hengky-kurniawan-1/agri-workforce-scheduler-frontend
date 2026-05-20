import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { useConversationMessages } from './chat';

function wrapper(queryClient: QueryClient) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe('useConversationMessages', () => {
	it('keeps local messages when conversationId is set but history fetch is disabled', async () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const { result, rerender } = renderHook(
			({ conversationId, enabled }) => useConversationMessages(conversationId, { enabled }),
			{
				wrapper: wrapper(queryClient),
				initialProps: { conversationId: null as string | null, enabled: false },
			}
		);

		act(() => {
			result.current.setMessages([{ role: 'user', content: 'hi' }]);
		});
		await waitFor(() => expect(result.current.messages).toHaveLength(1));

		rerender({ conversationId: 'new-conversation-id', enabled: false });

		await waitFor(() => {
			expect(result.current.messages).toEqual([{ role: 'user', content: 'hi' }]);
		});
	});

	it('clears messages when conversationId becomes null', async () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const { result, rerender } = renderHook(
			({ conversationId, enabled }) => useConversationMessages(conversationId, { enabled }),
			{
				wrapper: wrapper(queryClient),
				initialProps: { conversationId: 'existing-id' as string | null, enabled: false },
			}
		);

		act(() => {
			result.current.setMessages([{ role: 'user', content: 'hi' }]);
		});
		await waitFor(() => expect(result.current.messages).toHaveLength(1));

		rerender({ conversationId: null, enabled: false });

		await waitFor(() => {
			expect(result.current.messages).toEqual([]);
		});
	});
});
