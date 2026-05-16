import { useCallback, useMemo } from 'react';
import { buildAgronomistRoutes } from '@/lib/routeGeometry';
import { useOperationsOutlet } from '@/pages/OperationsLayout';
import { AgronomistRouteList } from './AgronomistRouteList';
import { ScenarioChatPanel } from './ScenarioChatPanel';
import { ScenarioRouteMap } from './ScenarioRouteMap';

export function Dashboard() {
  const {
    sid,
    scenario,
    tasks,
    fields,
    assignments,
    agronomists,
    scenarioLoading,
    refetchAssignments,
  } = useOperationsOutlet();

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

  const onChatMapUpdated = useCallback(() => {
    void refetchAssignments({ refresh: false });
  }, [refetchAssignments]);

  const hasFields = fields.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 max-xl:flex-col xl:grid xl:h-full xl:min-h-0 xl:grid-cols-[minmax(260px,22vw)_1fr_minmax(280px,24vw)] xl:gap-5">
      <aside className="max-xl:order-2 flex min-h-0 flex-col gap-4 overflow-y-auto xl:col-start-1 xl:row-start-1 xl:h-full xl:max-h-full">
        <AgronomistRouteList routes={routes} />
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
  );
}
