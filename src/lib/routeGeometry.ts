import type { Agronomist, Assignment, Field, Task } from '@/api/generated/types.gen';

export type RouteStop = {
  kind: 'home' | 'task';
  fieldId: string;
  fieldName: string;
  lat: number;
  lng: number;
  taskId?: string;
  startMinute?: number;
};

export type AgronomistRoutePlan = {
  agronomistId: string;
  agronomistName: string;
  color: string;
  stops: RouteStop[];
  /** Leaflet `[lat, lng][]` */
  positions: [number, number][];
};

const ROUTE_COLORS = ['#15803d', '#b45309', '#1d4ed8', '#7e22ce', '#be123c'];

function colorForAgronomistIndex(index: number): string {
  return ROUTE_COLORS[index % ROUTE_COLORS.length] ?? '#15803d';
}

function fieldMap(fields: Field[]): Map<string, Field> {
  return new Map(fields.map((f) => [f.id, f]));
}

function taskMap(tasks: Task[]): Map<string, Task> {
  return new Map(tasks.map((t) => [t.id, t]));
}

function assignmentsByAgronomist(assignments: Assignment[]): Map<string, Assignment[]> {
  const m = new Map<string, Assignment[]>();
  for (const a of assignments) {
    const list = m.get(a.agronomist_id);
    if (list) list.push(a);
    else m.set(a.agronomist_id, [a]);
  }
  for (const list of m.values()) {
    list.sort((x, y) => x.start_minute - y.start_minute);
  }
  return m;
}

/**
 * Ordered stops per agronomist: home field, then assigned task fields by `start_minute`.
 * Consecutive visits to the same field are collapsed to one stop.
 */
export function buildAgronomistRoutes(
  agronomists: Agronomist[],
  tasks: Task[],
  fields: Field[],
  assignments: Assignment[]
): AgronomistRoutePlan[] {
  const fById = fieldMap(fields);
  const tById = taskMap(tasks);
  const byAgr = assignmentsByAgronomist(assignments);

  return agronomists.map((agr, index) => {
    const color = colorForAgronomistIndex(index);
    const mine = byAgr.get(agr.id) ?? [];
    const stops: RouteStop[] = [];

    const [homeLat, homeLng] = agr.home_location;
    stops.push({
      kind: 'home',
      fieldId: `home:${agr.id}`,
      fieldName: `${agr.name} (home)`,
      lat: homeLat,
      lng: homeLng,
    });

    for (const as of mine) {
      const task = tById.get(as.task_id);
      if (!task) continue;
      const field = fById.get(task.field_id);
      if (!field) continue;
      const last = stops[stops.length - 1];
      if (last && last.fieldId === field.id) continue;

      const [lat, lng] = field.location;
      stops.push({
        kind: 'task',
        fieldId: field.id,
        fieldName: field.name,
        lat,
        lng,
        taskId: task.id,
        startMinute: as.start_minute,
      });
    }

    const positions: [number, number][] = stops.map((s) => [s.lat, s.lng]);
    return {
      agronomistId: agr.id,
      agronomistName: agr.name,
      color,
      stops,
      positions,
    };
  });
}
