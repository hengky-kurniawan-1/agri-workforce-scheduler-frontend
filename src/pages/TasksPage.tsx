import { TaskList } from '@/components/TaskList';
import { useOperationsOutlet } from '@/context/OperationsContext';

export function TasksPage() {
	const { tasks, assignments, agronomists, loading, error } = useOperationsOutlet();

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
			<div className="min-w-0">
				<h2 className="text-sm font-semibold text-soil-900">Tasks</h2>
				<p className="mt-0.5 text-xs text-soil-500">All tasks from the API.</p>
			</div>
			<TaskList
				tasks={tasks}
				assignments={assignments}
				agronomists={agronomists}
				loading={loading}
				error={error}
			/>
		</div>
	);
}
