import { useEffect, useState } from 'react';
import { useAssignments, useScenario } from '@/api/hooks';
import { DecisionTimeline } from './DecisionTimeline';
import { TaskList } from './TaskList';

type Props = {
  scenarioId: string;
};

export function ScenarioLoader({ scenarioId }: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: scenario, loading: sLoading, error: sError, refetch: refetchScenario } = useScenario(scenarioId);
  const { data: result, loading: aLoading, error: aError, refetch: refetchAssignments } = useAssignments(scenarioId);

  useEffect(() => {
    if (!scenario?.tasks.length) {
      setSelectedTaskId(null);
      return;
    }
    setSelectedTaskId((cur) => {
      if (cur && scenario.tasks.some((t) => t.id === cur)) return cur;
      return scenario.tasks[0]?.id ?? null;
    });
  }, [scenario]);

  if (!scenarioId) {
    return null;
  }

  const loading = sLoading || aLoading;
  const error = sError ?? aError;

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-soil-200 bg-white/60 p-6 text-sm text-soil-600">
        <span className="inline-block h-2 w-2 animate-pulse-soft rounded-full bg-leaf-500" />
        Loading scenario…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-800">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => {
            void refetchScenario();
            void refetchAssignments({ refresh: false });
          }}
          className="mt-3 text-sm font-semibold text-red-900 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!scenario) {
    return null;
  }

  const assignments = result?.assignments ?? [];
  const hybrid = result?.hybrid_steps ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-soil-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="font-display text-xl font-semibold text-soil-900">Scenario {scenario.scenario_id}</h2>
        <p className="mt-2 text-sm text-soil-600">
          {scenario.agronomists.length} agronomists · {scenario.tasks.length} tasks
        </p>
        {result ? (
          <p className="mt-1 text-sm text-soil-600">
            Solver: {result.feasible ? 'feasible' : 'infeasible'} · score {result.score.toFixed(2)}
          </p>
        ) : null}
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-soil-800">Tasks preview</h3>
          <TaskList
            tasks={scenario.tasks}
            assignments={assignments}
            agronomists={scenario.agronomists}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            loading={false}
            error={null}
          />
        </div>
      </div>
      <DecisionTimeline steps={hybrid} title="Hybrid steps" />
    </div>
  );
}
