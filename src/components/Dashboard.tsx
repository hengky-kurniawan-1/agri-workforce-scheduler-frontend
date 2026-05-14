import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAssignments, useScenario } from '@/api/hooks';
import { buildAgronomistRoutes } from '@/lib/routeGeometry';
import { AgronomistRouteList } from './AgronomistRouteList';
import { DecisionTimeline } from './DecisionTimeline';
import { ForceAssignPanel } from './ForceAssignPanel';
import { ScenarioChatPanel } from './ScenarioChatPanel';
import { ScenarioRouteMap } from './ScenarioRouteMap';
import { TaskList } from './TaskList';

const SCENARIO_IDS = ['1', '2'] as const;

export function Dashboard() {
  const [sid, setSid] = useState<string>('1');
  const { data: scenario, loading: scenarioLoading, error: scenarioError } = useScenario(sid);
  const {
    data: assignmentsResult,
    loading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useAssignments(sid);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasks = scenario?.tasks ?? [];
  const fields = scenario?.fields ?? [];
  const assignments = assignmentsResult?.assignments ?? [];
  const agronomists = scenario?.agronomists ?? [];
  const hybridSteps = assignmentsResult?.hybrid_steps ?? [];

  useEffect(() => {
    if (!tasks.length) {
      setSelectedTaskId(null);
      return;
    }
    setSelectedTaskId((current) => {
      if (current && tasks.some((t) => t.id === current)) return current;
      return tasks[0]?.id ?? null;
    });
  }, [tasks]);

  const selectedAssignment = useMemo(
    () => assignments.find((a) => a.task_id === selectedTaskId) ?? null,
    [assignments, selectedTaskId]
  );

  const selectedHybrid = useMemo(
    () => hybridSteps.find((h) => h.task_id === selectedTaskId) ?? null,
    [hybridSteps, selectedTaskId]
  );

  const routeMapKey = useMemo(
    () =>
      `${sid}:${assignments
        .map((a) => `${a.task_id}:${a.agronomist_id}:${a.start_minute}`)
        .sort()
        .join('|')}`,
    [sid, assignments]
  );

  const routes = useMemo(
    () => buildAgronomistRoutes(agronomists, tasks, fields, assignments),
    [agronomists, tasks, fields, assignments]
  );

  const loading = scenarioLoading || assignmentsLoading;
  const error = scenarioError ?? assignmentsError;

  const afterMutation = () => {
    void refetchAssignments({ refresh: false });
  };

  const onChatMapUpdated = useCallback(() => {
    void refetchAssignments({ refresh: false });
  }, [refetchAssignments]);

  const hasFields = fields.length > 0;

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
                onClick={() => setSid(id)}
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

      <div className="flex min-h-0 flex-1 flex-col gap-4 max-xl:flex-col xl:grid xl:h-full xl:min-h-0 xl:grid-cols-[minmax(260px,22vw)_1fr_minmax(280px,24vw)] xl:gap-5">
        <aside className="max-xl:order-2 flex min-h-0 flex-col gap-4 overflow-y-auto xl:col-start-1 xl:row-start-1 xl:h-full xl:max-h-full">
          <AgronomistRouteList routes={routes} />

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-soil-500">Tasks</h2>
            <TaskList
              tasks={tasks}
              assignments={assignments}
              agronomists={agronomists}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
              loading={loading}
              error={error}
            />
          </div>

          {assignmentsResult ? (
            <div className="rounded-lg border border-soil-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-soil-900">Solver</h2>
              <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-soil-500">Feasible</dt>
                  <dd className="font-medium text-soil-900">{assignmentsResult.feasible ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-soil-500">Score</dt>
                  <dd className="font-medium text-soil-900">{assignmentsResult.score.toFixed(2)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-soil-500">Relaxations</dt>
                  <dd className="font-medium text-soil-900">
                    {assignmentsResult.relaxations_applied?.length
                      ? assignmentsResult.relaxations_applied.join(', ')
                      : 'None'}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="rounded-lg border border-soil-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-soil-900">Selected task</h2>
            {!selectedTaskId ? (
              <p className="mt-2 text-xs text-soil-600">Select a task from the list.</p>
            ) : (
              <div className="mt-2 space-y-3 text-xs text-soil-800">
                <p>
                  <span className="text-soil-500">Task ID</span>{' '}
                  <span className="font-mono font-medium">{selectedTaskId}</span>
                </p>
                {selectedAssignment ? (
                  <div className="rounded-md border border-soil-100 bg-soil-50/80 p-3">
                    <p className="font-medium text-soil-900">Assignment</p>
                    <ul className="mt-1.5 space-y-1 text-soil-700">
                      <li>Agronomist: {selectedAssignment.agronomist_id}</li>
                      <li>Start minute: {selectedAssignment.start_minute}</li>
                      <li>Travel minutes: {selectedAssignment.travel_minutes}</li>
                      {selectedAssignment.reasoning ? (
                        <li className="pt-1 text-soil-600">Reasoning: {selectedAssignment.reasoning}</li>
                      ) : null}
                    </ul>
                  </div>
                ) : (
                  <p className="text-soil-600">No assignment row for this task in the current result.</p>
                )}
                {selectedHybrid ? (
                  <div className="rounded-md border border-leaf-200/80 bg-leaf-50/50 p-3">
                    <p className="font-medium text-soil-900">LLM step</p>
                    <p className="mt-1.5 text-soil-700">{selectedHybrid.llm_reasoning}</p>
                    <p className="mt-1.5 text-[11px] text-soil-600">
                      Suggested: {selectedHybrid.llm_agronomist_id} · OR-Tools:{' '}
                      {selectedHybrid.ortools_feasible ? 'ok' : 'failed'} (score {selectedHybrid.ortools_score.toFixed(2)})
                    </p>
                  </div>
                ) : (
                  <p className="text-soil-600">No hybrid step for this task.</p>
                )}
              </div>
            )}
          </div>

          <ForceAssignPanel
            sid={sid}
            agronomists={agronomists}
            selectedTaskId={selectedTaskId}
            onSuccess={afterMutation}
          />

          <DecisionTimeline steps={hybridSteps} />
        </aside>

        <section
          aria-label="Field map"
          className="flex max-xl:order-1 min-h-[420px] flex-1 flex-col xl:col-start-2 xl:row-start-1 xl:h-full xl:min-h-0"
        >
          {hasFields ? (
            <ScenarioRouteMap
              fields={fields}
              tasks={tasks}
              assignments={assignments}
              routes={routes}
              mapKey={routeMapKey}
            />
          ) : scenario && !scenarioLoading ? (
            <div className="flex min-h-[420px] flex-1 flex-col justify-center rounded-lg border border-soil-200 bg-soil-50/80 px-4 py-6 text-center text-sm text-soil-600 xl:min-h-0">
              Field coordinates are not included in this scenario. Regenerate the client from an API that exposes{' '}
              <code className="rounded bg-soil-100 px-1 font-mono text-xs">ScenarioInfo.fields</code>.
            </div>
          ) : (
            <div className="flex min-h-[240px] flex-1 items-center justify-center rounded-lg border border-dashed border-soil-200 bg-white/60 text-sm text-soil-500 xl:min-h-0">
              Loading scenario…
            </div>
          )}
        </section>

        <aside className="flex max-xl:order-3 min-h-0 flex-col max-xl:min-h-[min(22rem,45vh)] xl:col-start-3 xl:row-start-1 xl:h-full">
          <ScenarioChatPanel onMapUpdated={onChatMapUpdated} className="min-h-0 flex-1" />
        </aside>
      </div>
    </div>
  );
}
