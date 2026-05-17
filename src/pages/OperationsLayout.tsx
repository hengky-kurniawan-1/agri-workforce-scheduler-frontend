import { useCallback, useMemo } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import type { AssignmentsResult, ChatUiFlags, ScheduleInfo } from '@/api/generated';
import type { Agronomist, Assignment, Field, HybridStep, Task } from '@/api/generated/types.gen';
import { useAssignments, useSchedule } from '@/api/hooks';
import { ChatProvider } from '@/context/ChatContext';

export type OperationsOutletContext = {
	schedule: ScheduleInfo | null;
	assignmentsResult: AssignmentsResult | null;
	tasks: Task[];
	fields: Field[];
	assignments: Assignment[];
	agronomists: Agronomist[];
	hybridSteps: HybridStep[];
	scheduleLoading: boolean;
	assignmentsLoading: boolean;
	loading: boolean;
	error: string | null;
	refetchAssignments: ReturnType<typeof useAssignments>['refetch'];
	refetchSchedule: ReturnType<typeof useSchedule>['refetch'];
};

export function useOperationsOutlet(): OperationsOutletContext {
	return useOutletContext<OperationsOutletContext>();
}

export function OperationsLayout() {
	const {
		data: schedule,
		loading: scheduleLoading,
		error: scheduleError,
		refetch: refetchSchedule,
	} = useSchedule();
	const {
		data: assignmentsResult,
		loading: assignmentsLoading,
		error: assignmentsError,
		refetch: refetchAssignments,
	} = useAssignments();

	const tasks = schedule?.tasks ?? [];
	const fields = schedule?.fields ?? [];
	const assignments = assignmentsResult?.assignments ?? [];
	const agronomists = schedule?.agronomists ?? [];
	const hybridSteps = assignmentsResult?.hybrid_steps ?? [];

	const loading = scheduleLoading || assignmentsLoading;
	const error = scheduleError ?? assignmentsError;

	const onChatFlags = useCallback(
		(flags: ChatUiFlags) => {
			if (flags.schedule_updated || flags.map_updated || flags.roster_updated) {
				void refetchSchedule();
			}
			if (flags.map_updated || flags.schedule_updated) {
				void refetchAssignments({ refresh: false });
			}
		},
		[refetchSchedule, refetchAssignments]
	);

	const outletContext = useMemo(
		(): OperationsOutletContext => ({
			schedule,
			assignmentsResult,
			tasks,
			fields,
			assignments,
			agronomists,
			hybridSteps,
			scheduleLoading,
			assignmentsLoading,
			loading,
			error,
			refetchAssignments,
			refetchSchedule,
		}),
		[
			schedule,
			assignmentsResult,
			tasks,
			fields,
			assignments,
			agronomists,
			hybridSteps,
			scheduleLoading,
			assignmentsLoading,
			loading,
			error,
			refetchAssignments,
			refetchSchedule,
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
