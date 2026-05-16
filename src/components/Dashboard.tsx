import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChatUiFlags } from '@/api/generated';
import { buildAgronomistRoutes } from '@/lib/routeGeometry';
import { useOperationsOutlet } from '@/pages/OperationsLayout';
import { AgronomistRouteList } from './AgronomistRouteList';
import { ScenarioChatPanel } from './ScenarioChatPanel';
import { ScenarioRouteMap } from './ScenarioRouteMap';

export function Dashboard() {
  const {
    schedule,
    tasks,
    fields,
    assignments,
    agronomists,
    scheduleLoading,
    refetchAssignments,
    refetchSchedule,
  } = useOperationsOutlet();

  const routeMapKey = useMemo(
    () =>
      assignments
        .map((a) => `${a.task_id}:${a.agronomist_id}:${a.start_minute}`)
        .sort()
        .join('|'),
    [assignments]
  );

  const routes = useMemo(
    () => buildAgronomistRoutes(agronomists, tasks, fields, assignments),
    [agronomists, tasks, fields, assignments]
  );

  const [visibleAgronomistIds, setVisibleAgronomistIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const allIds = routes.map((r) => r.agronomistId);
    const idSet = new Set(allIds);

    setVisibleAgronomistIds((prev) => {
      const routeKey = [...idSet].sort().join(',');
      const prevKey = [...prev].sort().join(',');

      if (prev.size === 0) {
        return idSet.size > 0 ? new Set(allIds) : prev;
      }

      if (prevKey !== routeKey) {
        const overlap = [...prev].some((id) => idSet.has(id));
        if (!overlap) return new Set(allIds);

        const next = new Set([...prev].filter((id) => idSet.has(id)));
        for (const id of allIds) {
          if (!prev.has(id)) next.add(id);
        }
        return next;
      }

      return new Set([...prev].filter((id) => idSet.has(id)));
    });
  }, [routes]);

  const visibleRoutes = useMemo(
    () => routes.filter((r) => visibleAgronomistIds.has(r.agronomistId)),
    [routes, visibleAgronomistIds]
  );

  const onToggleAgronomist = useCallback((id: string) => {
    setVisibleAgronomistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onSetAllVisible = useCallback(
    (visible: boolean) => {
      if (visible) {
        setVisibleAgronomistIds(new Set(routes.map((r) => r.agronomistId)));
      } else {
        setVisibleAgronomistIds(new Set());
      }
    },
    [routes]
  );

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

  const hasFields = fields.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 max-xl:flex-col xl:grid xl:h-full xl:min-h-0 xl:grid-cols-[minmax(260px,22vw)_1fr_minmax(280px,24vw)] xl:gap-5">
      <aside className="max-xl:order-2 flex min-h-0 flex-col gap-4 overflow-y-auto xl:col-start-1 xl:row-start-1 xl:h-full xl:max-h-full">
        <AgronomistRouteList
          routes={routes}
          visibleIds={visibleAgronomistIds}
          onToggleAgronomist={onToggleAgronomist}
          onSetAllVisible={onSetAllVisible}
        />
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
            routes={visibleRoutes}
            mapKey={routeMapKey}
          />
        ) : schedule && !scheduleLoading ? (
          <div className="flex min-h-[420px] flex-1 flex-col justify-center rounded-lg border border-soil-200 bg-soil-50/80 px-4 py-6 text-center text-sm text-soil-600 xl:min-h-0">
            Field coordinates are not included in this schedule. Regenerate the client from an API that exposes{' '}
            <code className="rounded bg-soil-100 px-1 font-mono text-xs">ScheduleInfo.fields</code>.
          </div>
        ) : (
          <div className="flex min-h-[240px] flex-1 items-center justify-center rounded-lg border border-dashed border-soil-200 bg-white/60 text-sm text-soil-500 xl:min-h-0">
            Loading schedule…
          </div>
        )}
      </section>

      <aside className="flex max-xl:order-3 min-h-0 flex-col overflow-hidden max-xl:min-h-[min(22rem,45vh)] max-xl:max-h-[min(22rem,45vh)] xl:col-start-3 xl:row-start-1 xl:h-full">
        <ScenarioChatPanel onChatFlags={onChatFlags} className="min-h-0 flex-1" />
      </aside>
    </div>
  );
}
