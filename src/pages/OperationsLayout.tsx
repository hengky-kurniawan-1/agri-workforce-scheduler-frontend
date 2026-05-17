import { useCallback, useEffect, useMemo } from 'react';
import { Outlet, useOutletContext, useSearchParams } from 'react-router-dom';
import type { AssignmentsResult, ScheduleInfo } from '@/api/generated';
import type { Agronomist, Assignment, Field, HybridStep, Task } from '@/api/generated/types.gen';
import { useAssignments, useSchedule } from '@/api/hooks';
import { resolvedTaskId, TASK_QUERY_KEY, urlSearchParamsWithTask } from '@/lib/urlQuery';

export type OperationsOutletContext = {
	searchParams: URLSearchParams;
	setSearchParams: ReturnType<typeof useSearchParams>[1];
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
	selectedTaskId: string | null;
	setSelectedTaskId: (taskId: string) => void;
};

export function useOperationsOutlet(): OperationsOutletContext {
	return useOutletContext<OperationsOutletContext>();
}

export function OperationsLayout() {
	const [searchParams, setSearchParams] = useSearchParams();

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

	useEffect(() => {
		if (!tasks.length) {
			if (searchParams.has(TASK_QUERY_KEY)) {
				setSearchParams(urlSearchParamsWithTask(searchParams, null), { replace: true });
			}
			return;
		}
		if (resolvedTaskId(searchParams, tasks)) return;
		const first = tasks[0]?.id;
		if (first) setSearchParams(urlSearchParamsWithTask(searchParams, first), { replace: true });
	}, [tasks, searchParams, setSearchParams]);

	const selectedTaskId = useMemo(() => {
		const fromUrl = resolvedTaskId(searchParams, tasks);
		if (fromUrl) return fromUrl;
		return tasks[0]?.id ?? null;
	}, [searchParams, tasks]);

	const setSelectedTaskId = useCallback(
		(taskId: string) => {
			setSearchParams(urlSearchParamsWithTask(searchParams, taskId), { replace: true });
		},
		[searchParams, setSearchParams]
	);

	const loading = scheduleLoading || assignmentsLoading;
	const error = scheduleError ?? assignmentsError;

	const outletContext = useMemo(
		(): OperationsOutletContext => ({
			searchParams,
			setSearchParams,
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
			selectedTaskId,
			setSelectedTaskId,
		}),
		[
			searchParams,
			setSearchParams,
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
			selectedTaskId,
			setSelectedTaskId,
		]
	);

	return (
		<div className="mx-auto flex w-full max-w-[1920px] min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-6 xl:px-8">
			<Outlet context={outletContext} />
		</div>
	);
}
