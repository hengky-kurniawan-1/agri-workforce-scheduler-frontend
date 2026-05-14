export const SCENARIO_QUERY_KEY = 'scenario';

export const SCENARIO_IDS = ['1', '2'] as const;

const VALID = new Set<string>(SCENARIO_IDS);

export function resolvedScenarioId(searchParams: URLSearchParams): string {
  const raw = searchParams.get(SCENARIO_QUERY_KEY);
  if (raw && VALID.has(raw)) return raw;
  return '1';
}

/** True when `scenario` is present in the URL but not a supported id (normalize to 1). */
export function scenarioSearchParamNeedsReplace(searchParams: URLSearchParams): boolean {
  if (!searchParams.has(SCENARIO_QUERY_KEY)) return false;
  const raw = searchParams.get(SCENARIO_QUERY_KEY);
  return !raw || !VALID.has(raw);
}

export function urlSearchParamsWithScenario(
  current: URLSearchParams,
  id: (typeof SCENARIO_IDS)[number]
): URLSearchParams {
  const next = new URLSearchParams(current);
  next.set(SCENARIO_QUERY_KEY, id);
  return next;
}

export const TASK_QUERY_KEY = 'task';

export function resolvedTaskId(
  searchParams: URLSearchParams,
  tasks: readonly { id: string }[]
): string | null {
  const raw = searchParams.get(TASK_QUERY_KEY);
  if (!raw || !tasks.some((t) => t.id === raw)) return null;
  return raw;
}

export function urlSearchParamsWithTask(
  current: URLSearchParams,
  taskId: string | null
): URLSearchParams {
  const next = new URLSearchParams(current);
  if (taskId == null || taskId === '') next.delete(TASK_QUERY_KEY);
  else next.set(TASK_QUERY_KEY, taskId);
  return next;
}
