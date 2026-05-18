import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { invalidateOnChatFlags } from './invalidateOnChatFlags';
import { queryKeys } from './queryKeys';

describe('invalidateOnChatFlags', () => {
	it('invalidates fields and assignments when map_updated', () => {
		const queryClient = new QueryClient();
		const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

		invalidateOnChatFlags({ map_updated: true }, queryClient);

		expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.fields });
		expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.assignments });
		expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.tasks });
	});

	it('invalidates tasks and assignments when schedule_updated', () => {
		const queryClient = new QueryClient();
		const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

		invalidateOnChatFlags({ schedule_updated: true }, queryClient);

		expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.tasks });
		expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.assignments });
	});

	it('invalidates agronomists when roster_updated', () => {
		const queryClient = new QueryClient();
		const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

		invalidateOnChatFlags({ roster_updated: true }, queryClient);

		expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.agronomists });
	});
});
