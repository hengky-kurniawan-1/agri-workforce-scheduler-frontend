import { useQuery } from '@tanstack/react-query';
import { healthHealthGet } from '../generated';
import { queryKeys } from '../queryKeys';
import { getErrorMessage } from './core';

export function useApiHealth() {
	const query = useQuery({
		queryKey: queryKeys.health,
		queryFn: healthHealthGet,
		retry: 2,
		staleTime: Number.POSITIVE_INFINITY,
		refetchOnWindowFocus: false,
	});

	return {
		loading: query.isLoading,
		error: query.error ? getErrorMessage(query.error) : null,
		refetch: async () => {
			await query.refetch();
		},
	};
}
