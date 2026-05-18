import type { Agronomist, Assignment, Task } from '@/api/generated';
import { ErrorAlert } from '@/components/async/ErrorAlert';
import { LoadingCard } from '@/components/async/LoadingCard';

type Props = {
	tasks: Task[];
	assignments: Assignment[];
	agronomists: Agronomist[];
	loading: boolean;
	error: string | null;
};

function agronomistLabel(agronomists: Agronomist[], id: string): string {
	const a = agronomists.find((x) => x.id === id);
	return a ? `${a.name} (${id})` : id;
}

export function TaskList({ tasks, assignments, agronomists, loading, error }: Props) {
	if (loading) {
		return <LoadingCard label="Loading tasks…" />;
	}

	if (error) {
		return <ErrorAlert message={error} />;
	}

	if (!tasks.length) {
		return (
			<div className="rounded-lg border border-soil-200 bg-white p-4 text-sm text-soil-600">
				No tasks yet.
			</div>
		);
	}

	const byTask = Object.fromEntries(assignments.map((a) => [a.task_id, a]));

	return (
		<ul className="space-y-2">
			{tasks.map((task) => {
				const asg = byTask[task.id];
				return (
					<li
						key={task.id}
						className="rounded-lg border border-soil-200 bg-white px-3 py-2.5 text-sm shadow-sm"
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
					</li>
				);
			})}
		</ul>
	);
}
