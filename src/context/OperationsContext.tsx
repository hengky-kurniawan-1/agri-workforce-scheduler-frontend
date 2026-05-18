import { useOutletContext } from 'react-router-dom';
import type { AssignmentsResult } from '@/api/generated';
import type { Agronomist, Assignment, Field, Task } from '@/api/generated/types.gen';
import type { useAgronomists, useAssignments, useFields, useTasks } from '@/api/hooks';

/** Shared operations data passed from OperationsLayout to child routes via outlet context. */
export type OperationsOutletContext = {
	assignmentsResult: AssignmentsResult | null;
	tasks: Task[];
	fields: Field[];
	assignments: Assignment[];
	agronomists: Agronomist[];
	tasksLoading: boolean;
	fieldsLoading: boolean;
	agronomistsLoading: boolean;
	assignmentsLoading: boolean;
	loading: boolean;
	error: string | null;
	refetchTasks: ReturnType<typeof useTasks>['refetch'];
	refetchFields: ReturnType<typeof useFields>['refetch'];
	refetchAgronomists: ReturnType<typeof useAgronomists>['refetch'];
	refetchAssignments: ReturnType<typeof useAssignments>['refetch'];
};

export function useOperationsOutlet(): OperationsOutletContext {
	return useOutletContext<OperationsOutletContext>();
}
