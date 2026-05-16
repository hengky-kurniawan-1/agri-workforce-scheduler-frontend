import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Assignment, Field, Task } from '@/api/generated/types.gen';
import { useOsrmRoutes } from '@/hooks/useOsrmRoutes';
import type { AgronomistRoutePlan } from '@/lib/routeGeometry';

const MAP_TILE_OPACITY = 0.45;

type Props = {
  fields: Field[];
  tasks: Task[];
  assignments: Assignment[];
  routes: AgronomistRoutePlan[];
  mapKey: string;
  className?: string;
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

function mapSubtitle(status: ReturnType<typeof useOsrmRoutes>['aggregateStatus']): string {
  switch (status) {
    case 'loading':
      return 'Fetching road paths…';
    case 'ok':
      return 'Road paths (OpenStreetMap + OSRM)';
    case 'fallback':
      return 'Straight-line fallback (routing unavailable)';
    default:
      return 'Toggle routes in the sidebar';
  }
}

export function ScenarioRouteMap({ fields, tasks, assignments, routes, mapKey, className }: Props) {
  const { byAgronomistId, aggregateStatus } = useOsrmRoutes(routes);

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
    <div
      className={`flex min-h-0 flex-1 flex-col rounded-lg border border-soil-200 bg-white ${className ?? ''}`}
    >
      <div className="shrink-0 border-b border-soil-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-soil-900">Map</h2>
        <p className="mt-0.5 text-xs text-soil-500">{mapSubtitle(aggregateStatus)}</p>
      </div>
      <div className="min-h-[420px] flex-1 overflow-hidden p-3 xl:min-h-0">
        <div className="h-full w-full overflow-hidden rounded-md border border-soil-100">
          <MapContainer key={mapKey} center={center} zoom={13} className="h-full w-full" scrollWheelZoom>
            <TileLayer
              opacity={MAP_TILE_OPACITY}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitFields fieldPositions={fieldPositions} />
            {routes.map((r) => {
              if (r.positions.length < 2) return null;
              const osrm = byAgronomistId.get(r.agronomistId);
              const positions = osrm?.roadPositions ?? r.positions;
              const isFallback = osrm?.status === 'fallback';
              return (
                <Polyline
                  key={r.agronomistId}
                  positions={positions}
                  pathOptions={{
                    color: r.color,
                    weight: 4,
                    opacity: isFallback ? 0.55 : 0.88,
                  }}
                />
              );
            })}
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
    </div>
  );
}
