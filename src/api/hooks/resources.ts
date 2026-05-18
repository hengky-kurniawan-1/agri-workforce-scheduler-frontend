import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { Agronomist, AssignmentsResult, Field, Task } from '../generated';
import {
	getAgronomistsAgronomistsGet,
	getAssignmentsAssignmentsGet,
	getFieldsFieldsGet,
	getTasksTasksGet,
} from '../generated';
import { queryKeys } from '../queryKeys';
import { getErrorMessage } from './core';

function toAsyncState<T>(query: {
	data: T | undefined;
	isLoading: boolean;
	error: unknown;
	refetch: () => Promise<unknown>;
}) {
	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error ? getErrorMessage(query.error) : null,
		refetch: async () => {
			await query.refetch();
		},
	};
}

export function useTasks() {
	const query = useQuery({
		queryKey: queryKeys.tasks,
		queryFn: getTasksTasksGet,
	});
	return toAsyncState<Task[]>(query);
}

export function useFields() {
	const query = useQuery({
		queryKey: queryKeys.fields,
		queryFn: getFieldsFieldsGet,
	});
	return toAsyncState<Field[]>(query);
}

export function useAgronomists() {
	const query = useQuery({
		queryKey: queryKeys.agronomists,
		queryFn: getAgronomistsAgronomistsGet,
	});
	return toAsyncState<Agronomist[]>(query);
}

export function useAssignments() {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: queryKeys.assignments,
		queryFn: () =>
			getAssignmentsAssignmentsGet({
				refresh: false,
				agronomistId: undefined,
			}),
	});

	const refetch = useCallback(
		async (opts?: { refresh?: boolean }) => {
			if (opts?.refresh) {
				const data = await getAssignmentsAssignmentsGet({
					refresh: true,
					agronomistId: undefined,
				});
				queryClient.setQueryData<AssignmentsResult>(queryKeys.assignments, data);
				return;
			}
			await query.refetch();
		},
		[query, queryClient]
	);

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error ? getErrorMessage(query.error) : null,
		refetch,
	};
}
