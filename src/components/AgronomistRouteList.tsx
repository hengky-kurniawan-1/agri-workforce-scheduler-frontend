import type { AgronomistRoutePlan } from '@/lib/routeGeometry';

type Props = {
  routes: AgronomistRoutePlan[];
};

export function AgronomistRouteList({ routes }: Props) {
  return (
    <section className="rounded-lg border border-soil-200 bg-white p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-soil-500">Route by agronomist</h2>
      <ul className="mt-3 space-y-3 text-sm text-soil-800">
        {routes.map((r) => (
          <li key={r.agronomistId} className="rounded-lg border border-soil-100 bg-soil-50/80 p-3">
            <p className="font-medium text-soil-900">
              <span className="mr-2 inline-block h-2 w-6 rounded-sm align-middle" style={{ background: r.color }} />
              {r.agronomistName}{' '}
              <span className="font-mono text-xs font-normal text-soil-500">({r.agronomistId})</span>
            </p>
            {r.stops.length === 0 ? (
              <p className="mt-2 text-soil-600">No stops (missing field data or no assignments).</p>
            ) : (
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-soil-700">
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
        ))}
      </ul>
    </section>
  );
}
