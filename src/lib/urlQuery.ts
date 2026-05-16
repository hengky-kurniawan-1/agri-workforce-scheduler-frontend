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
