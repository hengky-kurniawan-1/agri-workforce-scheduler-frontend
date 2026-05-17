import { useCallback, useMemo } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import type { AssignmentsResult, ChatUiFlags } from '@/api/generated';
import type { Agronomist, Assignment, Field, HybridStep, Task } from '@/api/generated/types.gen';
import { useAgronomists, useAssignments, useFields, useTasks } from '@/api/hooks';
import { ChatProvider } from '@/context/ChatContext';

export type OperationsOutletContext = {
	assignmentsResult: AssignmentsResult | null;
	tasks: Task[];
	fields: Field[];
	assignments: Assignment[];
	agronomists: Agronomist[];
	hybridSteps: HybridStep[];
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

export function OperationsLayout() {
	const {
		data: tasksData,
		loading: tasksLoading,
		error: tasksError,
		refetch: refetchTasks,
	} = useTasks();
	const {
		data: fieldsData,
		loading: fieldsLoading,
		error: fieldsError,
		refetch: refetchFields,
	} = useFields();
	const {
		data: agronomistsData,
		loading: agronomistsLoading,
		error: agronomistsError,
		refetch: refetchAgronomists,
	} = useAgronomists();
	const {
		data: assignmentsResult,
		loading: assignmentsLoading,
		error: assignmentsError,
		refetch: refetchAssignments,
	} = useAssignments();

	const tasks = tasksData ?? [];
	const fields = fieldsData ?? [];
	const assignments = assignmentsResult?.assignments ?? [];
	const agronomists = agronomistsData ?? [];
	const hybridSteps = assignmentsResult?.hybrid_steps ?? [];

	const loading = tasksLoading || fieldsLoading || agronomistsLoading || assignmentsLoading;
	const error = tasksError ?? fieldsError ?? agronomistsError ?? assignmentsError;

	const onChatFlags = useCallback(
		(flags: ChatUiFlags) => {
			if (flags.map_updated) {
				void refetchFields();
				void refetchAssignments({ refresh: false });
			}
			if (flags.schedule_updated) {
				void refetchTasks();
				void refetchAssignments({ refresh: false });
			}
			if (flags.roster_updated) {
				void refetchAgronomists();
			}
		},
		[refetchTasks, refetchFields, refetchAgronomists, refetchAssignments]
	);

	const outletContext = useMemo(
		(): OperationsOutletContext => ({
			assignmentsResult,
			tasks,
			fields,
			assignments,
			agronomists,
			hybridSteps,
			tasksLoading,
			fieldsLoading,
			agronomistsLoading,
			assignmentsLoading,
			loading,
			error,
			refetchTasks,
			refetchFields,
			refetchAgronomists,
			refetchAssignments,
		}),
		[
			assignmentsResult,
			tasks,
			fields,
			assignments,
			agronomists,
			hybridSteps,
			tasksLoading,
			fieldsLoading,
			agronomistsLoading,
			assignmentsLoading,
			loading,
			error,
			refetchTasks,
			refetchFields,
			refetchAgronomists,
			refetchAssignments,
		]
	);

	return (
		<div className="mx-auto flex w-full max-w-[1920px] min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-6 xl:px-8">
			<ChatProvider onChatFlags={onChatFlags}>
				<Outlet context={outletContext} />
			</ChatProvider>
		</div>
	);
}
