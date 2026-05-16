import { useCallback, useEffect, useMemo } from 'react';
import { Outlet, useOutletContext, useSearchParams } from 'react-router-dom';
import { useAssignments, useSchedule } from '@/api/hooks';
import type { AssignmentsResult, ScheduleInfo } from '@/api/generated';
import type { Agronomist, Assignment, Field, HybridStep, Task } from '@/api/generated/types.gen';
import {
  TASK_QUERY_KEY,
  resolvedTaskId,
  urlSearchParamsWithTask,
} from '@/lib/urlQuery';

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
    <div className="mx-auto flex w-full max-w-[1920px] min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-6 xl:min-h-[calc(100vh-9.5rem)] xl:px-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-soil-200/80 pb-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-soil-900">Operations</h1>
          <p className="mt-0.5 text-xs text-soil-500">Schedule and assistant</p>
        </div>
        <button
          type="button"
          onClick={() => void refetchAssignments({ refresh: true })}
          disabled={assignmentsLoading}
          className="rounded-lg border border-soil-200 bg-white px-3 py-1.5 text-xs font-medium text-soil-800 hover:bg-soil-50 disabled:opacity-50"
        >
          Recompute
        </button>
      </header>

      <Outlet context={outletContext} />
    </div>
  );
}