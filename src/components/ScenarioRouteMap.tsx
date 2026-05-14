import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Agronomist, Assignment, Field, Task } from '@/api/generated/types.gen';
import { buildAgronomistRoutes } from '@/lib/routeGeometry';

type Props = {
  fields: Field[];
  agronomists: Agronomist[];
  tasks: Task[];
  assignments: Assignment[];
  mapKey: string;
};

function FitFields({ fieldPositions }: { fieldPositions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (fieldPositions.length === 0) return;
    const b = L.latLngBounds(fieldPositions);
    map.fitBounds(b, { padding: [40, 40], maxZoom: 14 });
  }, [map, fieldPositions]);
  return null;
}

export function ScenarioRouteMap({ fields, agronomists, tasks, assignments, mapKey }: Props) {
  const routes = useMemo(
    () => buildAgronomistRoutes(agronomists, tasks, fields, assignments),
    [agronomists, tasks, fields, assignments]
  );

  const fieldPositions = useMemo(
    () => fields.map((f) => [f.location[0], f.location[1]] as [number, number]),
    [fields]
  );

  const tasksByField = useMemo(() => {
    const m = new Map<string, string[]>();
    const tById = new Map(tasks.map((t) => [t.id, t]));
    for (const a of assignments) {
      const task = tById.get(a.task_id);
      if (!task) continue;
      const list = m.get(task.field_id);
      if (list) list.push(task.id);
      else m.set(task.field_id, [task.id]);
    }
    return m;
  }, [tasks, assignments]);

  const center = fieldPositions[0] ?? [-6.2, 106.8];

  return (
    <div className="rounded-2xl border border-soil-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
      <h2 className="font-display text-lg font-semibold text-soil-900">Field map and routes</h2>
      <p className="mt-1 text-sm text-soil-600">
        Straight-line paths between field centroids (same model as travel minutes on the server). One color per
        agronomist.
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="h-[min(420px,55vh)] w-full overflow-hidden rounded-xl border border-soil-200/80">
            <MapContainer
              key={mapKey}
              center={center}
              zoom={13}
              className="h-full w-full"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitFields fieldPositions={fieldPositions} />
              {routes.map((r) =>
                r.positions.length >= 2 ? (
                  <Polyline
                    key={r.agronomistId}
                    positions={r.positions}
                    pathOptions={{ color: r.color, weight: 4, opacity: 0.88 }}
                  />
                ) : null
              )}
              {fields.map((f) => {
                const [lat, lng] = f.location;
                const taskIds = tasksByField.get(f.id);
                return (
                  <CircleMarker
                    key={f.id}
                    center={[lat, lng]}
                    radius={9}
                    pathOptions={{
                      color: '#44403c',
                      weight: 2,
                      fillColor: '#fef3c7',
                      fillOpacity: 0.95,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">
                          {f.name} <span className="font-mono text-soil-600">({f.id})</span>
                        </p>
                        {taskIds?.length ? (
                          <p className="mt-1 text-xs text-soil-700">Assigned tasks: {taskIds.join(', ')}</p>
                        ) : (
                          <p className="mt-1 text-xs text-soil-500">No assigned tasks at this field.</p>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-soil-800">Route by agronomist</h3>
          <ul className="mt-3 space-y-4 text-sm text-soil-800">
            {routes.map((r) => (
              <li key={r.agronomistId} className="rounded-xl border border-soil-200/80 bg-soil-50/60 p-3">
                <p className="font-medium text-soil-900">
                  <span className="mr-2 inline-block h-2 w-6 rounded-sm align-middle" style={{ background: r.color }} />
                  {r.agronomistName}{' '}
                  <span className="font-mono text-xs font-normal text-soil-500">({r.agronomistId})</span>
                </p>
                {r.stops.length === 0 ? (
                  <p className="mt-2 text-soil-600">No stops (missing field data or no assignments).</p>
                ) : (
                  <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-soil-700">
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
        </div>
      </div>
    </div>
  );
}
