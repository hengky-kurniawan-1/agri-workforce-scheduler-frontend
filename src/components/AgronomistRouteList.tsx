import type { AgronomistRoutePlan } from '@/lib/routeGeometry';

type Props = {
  routes: AgronomistRoutePlan[];
  visibleIds: Set<string>;
  onToggleAgronomist: (id: string) => void;
  onSetAllVisible: (visible: boolean) => void;
};

export function AgronomistRouteList({ routes, visibleIds, onToggleAgronomist, onSetAllVisible }: Props) {
  const hasRoutes = routes.length > 0;

  return (
    <section className="rounded-lg border border-soil-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-soil-500">Route by agronomist</h2>
        <div className="flex shrink-0 gap-2 text-xs">
          <button
            type="button"
            disabled={!hasRoutes}
            onClick={() => onSetAllVisible(true)}
            className="font-medium text-soil-600 hover:text-soil-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Show all
          </button>
          <span className="text-soil-300" aria-hidden>
            |
          </span>
          <button
            type="button"
            disabled={!hasRoutes}
            onClick={() => onSetAllVisible(false)}
            className="font-medium text-soil-600 hover:text-soil-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hide all
          </button>
        </div>
      </div>
      <ul className="mt-3 space-y-3 text-sm text-soil-800">
        {routes.map((r) => {
          const visible = visibleIds.has(r.agronomistId);
          return (
            <li
              key={r.agronomistId}
              className={`rounded-lg border border-soil-100 bg-soil-50/80 p-3 transition-opacity ${visible ? '' : 'opacity-50'}`}
            >
              <label className="flex cursor-pointer items-start gap-2 font-medium text-soil-900">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => onToggleAgronomist(r.agronomistId)}
                  aria-label={`Show ${r.agronomistName} route on map`}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-soil-300 text-soil-800 focus:ring-soil-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="mr-2 inline-block h-2 w-6 rounded-sm align-middle" style={{ background: r.color }} />
                  {r.agronomistName}{' '}
                  <span className="font-mono text-xs font-normal text-soil-500">({r.agronomistId})</span>
                </span>
              </label>
              {r.stops.length === 0 ? (
                <p className="mt-2 pl-6 text-soil-600">No stops (missing field data or no assignments).</p>
              ) : (
                <ol className="mt-2 list-decimal space-y-1 pl-10 text-soil-700">
                  {r.stops.map((s, i) => (
                    <li key={`${r.agronomistId}-${i}-${s.fieldId}-${s.taskId ?? 'home'}`}>
                      {s.kind === 'home' ? (
                        <>Home — {s.fieldName} ({s.fieldId})</>
                      ) : (
                        <>
                          Task {s.taskId} @ {s.fieldName} ({s.fieldId})
                          {s.startMinute !== undefined ? (
                            <span className="text-soil-500"> · start {s.startMinute}m</span>
                          ) : null}
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
