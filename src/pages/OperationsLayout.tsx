import { useCallback, useEffect, useMemo } from 'react';
import { Outlet, useOutletContext, useSearchParams } from 'react-router-dom';
import { useAssignments, useScenario } from '@/api/hooks';
import type { AssignmentsResult, ScenarioInfo } from '@/api/generated';
import type { Agronomist, Assignment, Field, HybridStep, Task } from '@/api/generated/types.gen';
import {
  SCENARIO_IDS,
  resolvedScenarioId,
  resolvedTaskId,
  scenarioSearchParamNeedsReplace,
  TASK_QUERY_KEY,
  urlSearchParamsWithScenario,
  urlSearchParamsWithTask,
} from '@/lib/scenarioQuery';

export type OperationsOutletContext = {
  sid: string;
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
  scenario: ScenarioInfo | null;
  assignmentsResult: AssignmentsResult | null;
  tasks: Task[];
  fields: Field[];
  assignments: Assignment[];
  agronomists: Agronomist[];
  hybridSteps: HybridStep[];
  scenarioLoading: boolean;
  assignmentsLoading: boolean;
  loading: boolean;
  error: string | null;
  refetchAssignments: ReturnType<typeof useAssignments>['refetch'];
  refetchScenario: ReturnType<typeof useScenario>['refetch'];
  selectedTaskId: string | null;
  setSelectedTaskId: (taskId: string) => void;
};

export function useOperationsOutlet(): OperationsOutletContext {
  return useOutletContext<OperationsOutletContext>();
}

export function OperationsLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sid = resolvedScenarioId(searchParams);

  useEffect(() => {
    if (!scenarioSearchParamNeedsReplace(searchParams)) return;
    setSearchParams(urlSearchParamsWithScenario(searchParams, '1'), { replace: true });
  }, [searchParams, setSearchParams]);

  const {
    data: scenario,
    loading: scenarioLoading,
    error: scenarioError,
    refetch: refetchScenario,
  } = useScenario(sid);
  const {
    data: assignmentsResult,
    loading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useAssignments(sid);

  const tasks = scenario?.tasks ?? [];
  const fields = scenario?.fields ?? [];
  const assignments = assignmentsResult?.assignments ?? [];
  const agronomists = scenario?.agronomists ?? [];
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

  const loading = scenarioLoading || assignmentsLoading;
  const error = scenarioError ?? assignmentsError;

  const outletContext = useMemo(
    (): OperationsOutletContext => ({
      sid,
      searchParams,
      setSearchParams,
      scenario,
      assignmentsResult,
      tasks,
      fields,
      assignments,
      agronomists,
      hybridSteps,
      scenarioLoading,
      assignmentsLoading,
      loading,
      error,
      refetchAssignments,
      refetchScenario,
      selectedTaskId,
      setSelectedTaskId,
    }),
    [
      sid,
      searchParams,
      setSearchParams,
      scenario,
      assignmentsResult,
      tasks,
      fields,
      assignments,
      agronomists,
      hybridSteps,
      scenarioLoading,
      assignmentsLoading,
      loading,
      error,
      refetchAssignments,
      refetchScenario,
      selectedTaskId,
      setSelectedTaskId,
    ]
  );

  return (
    <div className="mx-auto flex w-full max-w-[1920px] min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-6 xl:min-h-[calc(100vh-9.5rem)] xl:px-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-soil-200/80 pb-4">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-soil-900">Operations</h1>
          <p className="mt-0.5 text-xs text-soil-500">Scenario, schedule, and assistant</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-soil-500">Scenario</span>
          <div className="flex gap-1">
            {SCENARIO_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setSearchParams(urlSearchParamsWithScenario(searchParams, id), { replace: true })
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  sid === id
                    ? 'bg-soil-900 text-white'
                    : 'border border-soil-200 bg-white text-soil-700 hover:border-soil-300'
                }`}
              >
                {id}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void refetchAssignments({ refresh: true })}
            disabled={assignmentsLoading}
            className="rounded-lg border border-soil-200 bg-white px-3 py-1.5 text-xs font-medium text-soil-800 hover:bg-soil-50 disabled:opacity-50"
          >
            Recompute
          </button>
        </div>
      </header>

      <Outlet context={outletContext} />
    </div>
  );
}
