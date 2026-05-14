import type { Agronomist, Assignment, Task } from '@/api/generated';

type Props = {
  tasks: Task[];
  assignments: Assignment[];
  agronomists: Agronomist[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  loading: boolean;
  error: string | null;
};

function agronomistLabel(agronomists: Agronomist[], id: string): string {
  const a = agronomists.find((x) => x.id === id);
  return a ? `${a.name} (${id})` : id;
}

export function TaskList({
  tasks,
  assignments,
  agronomists,
  selectedTaskId,
  onSelectTask,
  loading,
  error,
}: Props) {
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
      <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-800" role="alert">
        {error}
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="rounded-2xl border border-soil-200 bg-white/60 p-6 text-sm text-soil-600">
        No tasks in this scenario.
      </div>
    );
  }

  const byTask = Object.fromEntries(assignments.map((a) => [a.task_id, a]));

  return (
    <ul className="space-y-2">
      {tasks.map((task) => {
        const active = task.id === selectedTaskId;
        const asg = byTask[task.id];
        return (
          <li key={task.id}>
            <button
              type="button"
              onClick={() => onSelectTask(task.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-leaf-400 bg-leaf-50/90 shadow-sm ring-1 ring-leaf-200'
                  : 'border-soil-200/80 bg-white/70 hover:border-soil-300 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-soil-900">
                  {task.field_id} · {task.required_skill}
                </span>
                <span className="shrink-0 rounded-full bg-soil-100 px-2 py-0.5 text-xs text-soil-600">
                  P{task.priority}
                </span>
              </div>
              <p className="mt-1 text-xs text-soil-600">
                {asg
                  ? `→ ${agronomistLabel(agronomists, asg.agronomist_id)}`
                  : 'No assignment row yet'}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
