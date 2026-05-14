import { TaskList } from '@/components/TaskList';
import { useOperationsOutlet } from '@/pages/OperationsLayout';

export function TasksPage() {
  const {
    tasks,
    assignments,
    agronomists,
    selectedTaskId,
    setSelectedTaskId,
    loading,
    error,
  } = useOperationsOutlet();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-soil-900">Tasks</h2>
        <p className="mt-0.5 text-xs text-soil-500">Choose a task; selection is shared with the Dashboard.</p>
      </div>
      <TaskList
        tasks={tasks}
        assignments={assignments}
        agronomists={agronomists}
        selectedTaskId={selectedTaskId}
        onSelectTask={setSelectedTaskId}
        loading={loading}
        error={error}
      />
    </div>
  );
}
