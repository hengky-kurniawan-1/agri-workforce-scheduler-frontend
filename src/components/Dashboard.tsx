import { useEffect, useMemo, useState } from 'react';
import { useAssignments, useScenario } from '@/api/hooks';
import { DecisionTimeline } from './DecisionTimeline';
import { ForceAssignPanel } from './ForceAssignPanel';
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

  const loading = scenarioLoading || assignmentsLoading;
  const error = scenarioError ?? assignmentsError;

  const afterMutation = () => {
    void refetchAssignments({ refresh: false });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-soil-900 sm:text-4xl">
            Operations dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-soil-600">
            Scenario tasks, OR-Tools schedule, and LLM reasoning from the hybrid solver. Use force-assign to pin a
            worker and re-optimize.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-soil-700">Scenario</span>
          {SCENARIO_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSid(id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
                sid === id
                  ? 'bg-leaf-600 text-white ring-2 ring-leaf-300'
                  : 'border border-soil-200 bg-white text-soil-800 hover:border-soil-300'
              }`}
            >
              {id}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void refetchAssignments({ refresh: true })}
            disabled={assignmentsLoading}
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
          >
            Recompute (LLM + solver)
          </button>
        </div>
      </header>

      {scenario?.fields && scenario.fields.length > 0 ? (
        <section className="mb-8" aria-label="Field map and agronomist routes">
          <ScenarioRouteMap
            fields={scenario.fields}
            agronomists={agronomists}
            tasks={tasks}
            assignments={assignments}
            mapKey={routeMapKey}
          />
        </section>
      ) : scenario && !scenarioLoading ? (
        <p className="mb-8 rounded-xl border border-soil-200 bg-soil-50/80 px-4 py-3 text-sm text-soil-700">
          Field coordinates are not included in the scenario API response. Regenerate the client from an API that
          exposes <code className="rounded bg-soil-100 px-1 font-mono text-xs">ScenarioInfo.fields</code>.
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-semibold text-soil-800">Tasks</h2>
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

        <div className="space-y-6 lg:col-span-3">
          {assignmentsResult ? (
            <div className="rounded-2xl border border-soil-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
              <h2 className="font-display text-lg font-semibold text-soil-900">Solver result</h2>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
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

          <div className="rounded-2xl border border-soil-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
            <h2 className="font-display text-lg font-semibold text-soil-900">Selected task</h2>
            {!selectedTaskId ? (
              <p className="mt-3 text-sm text-soil-600">Select a task from the list.</p>
            ) : (
              <div className="mt-3 space-y-4 text-sm text-soil-800">
                <p>
                  <span className="text-soil-500">Task ID</span>{' '}
                  <span className="font-mono font-medium">{selectedTaskId}</span>
                </p>
                {selectedAssignment ? (
                  <div className="rounded-xl bg-soil-50 p-4">
                    <p className="font-medium text-soil-900">Assignment</p>
                    <ul className="mt-2 space-y-1 text-soil-700">
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
                  <div className="rounded-xl border border-leaf-200 bg-leaf-50/50 p-4">
                    <p className="font-medium text-soil-900">LLM step (same task)</p>
                    <p className="mt-2 text-soil-700">{selectedHybrid.llm_reasoning}</p>
                    <p className="mt-2 text-xs text-soil-600">
                      Suggested agronomist: {selectedHybrid.llm_agronomist_id} · OR-Tools check:{' '}
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
        </div>
      </div>
    </div>
  );
}
