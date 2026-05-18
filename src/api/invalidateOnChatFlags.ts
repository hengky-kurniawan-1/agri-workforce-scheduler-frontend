import type { QueryClient } from '@tanstack/react-query';
import type { ChatUiFlags } from '@/api/generated';
import { queryKeys } from '@/api/queryKeys';

/** Invalidate cached queries when the chat API reports domain changes. */
export function invalidateOnChatFlags(flags: ChatUiFlags, queryClient: QueryClient): void {
	if (flags.map_updated) {
		void queryClient.invalidateQueries({ queryKey: queryKeys.fields });
		void queryClient.invalidateQueries({ queryKey: queryKeys.assignments });
	}
	if (flags.schedule_updated) {
		void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
		void queryClient.invalidateQueries({ queryKey: queryKeys.assignments });
	}
	if (flags.roster_updated) {
		void queryClient.invalidateQueries({ queryKey: queryKeys.agronomists });
	}
}
