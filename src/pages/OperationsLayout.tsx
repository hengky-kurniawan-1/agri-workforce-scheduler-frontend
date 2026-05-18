import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useAgronomists, useAssignments, useFields, useTasks } from '@/api/hooks';
import { ChatProvider } from '@/context/ChatContext';
import type { OperationsOutletContext } from '@/context/OperationsContext';

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

	const loading = tasksLoading || fieldsLoading || agronomistsLoading || assignmentsLoading;
	const error = tasksError ?? fieldsError ?? agronomistsError ?? assignmentsError;

	const outletContext = useMemo(
		(): OperationsOutletContext => ({
			assignmentsResult,
			tasks,
			fields,
			assignments,
			agronomists,
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
			<ChatProvider>
				<Outlet context={outletContext} />
			</ChatProvider>
		</div>
	);
}
