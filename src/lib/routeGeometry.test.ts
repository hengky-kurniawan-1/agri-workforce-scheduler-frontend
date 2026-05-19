import { describe, expect, it } from 'vitest';
import type { Agronomist, Assignment, Field, Task } from '@/api/generated/types.gen';
import { buildAgronomistRoutes } from './routeGeometry';

describe('buildAgronomistRoutes', () => {
	const fields: Field[] = [
		{ id: 'f1', name: 'North', location: [1, 2] },
		{ id: 'f2', name: 'South', location: [3, 4] },
	];
	const tasks: Task[] = [
		{
			id: 't1',
			field_id: 'f1',
			required_skill: 'irrigation',
			priority: 1,
			duration_minutes: 30,
		},
		{
			id: 't2',
			field_id: 'f2',
			required_skill: 'soil',
			priority: 2,
			duration_minutes: 45,
		},
	];
	const agronomists: Agronomist[] = [
		{ id: 'a1', name: 'Alex', home_location: [0, 0], skills: ['irrigation'] },
	];

	it('starts each route at home and orders tasks by start_minute', () => {
		const assignments: Assignment[] = [
			{ task_id: 't2', agronomist_id: 'a1', start_minute: 120, travel_minutes: 10 },
			{ task_id: 't1', agronomist_id: 'a1', start_minute: 60, travel_minutes: 5 },
		];

		const routes = buildAgronomistRoutes(agronomists, tasks, fields, assignments);
		expect(routes).toHaveLength(1);
		expect(routes[0]?.skills).toEqual(['irrigation']);
		expect(routes[0]?.stops.map((s) => s.kind)).toEqual(['home', 'task', 'task']);
		expect(routes[0]?.stops[1]?.taskId).toBe('t1');
		expect(routes[0]?.stops[1]?.priority).toBe(1);
		expect(routes[0]?.stops[2]?.taskId).toBe('t2');
		expect(routes[0]?.stops[2]?.priority).toBe(2);
	});

	it('collapses consecutive visits to the same field', () => {
		const extraTasks: Task[] = [
			...tasks,
			{
				id: 't3',
				field_id: 'f1',
				required_skill: 'irrigation',
				priority: 1,
				duration_minutes: 20,
			},
		];
		const assignments: Assignment[] = [
			{ task_id: 't1', agronomist_id: 'a1', start_minute: 10, travel_minutes: 5 },
			{ task_id: 't3', agronomist_id: 'a1', start_minute: 20, travel_minutes: 0 },
		];
		const routes = buildAgronomistRoutes(agronomists, extraTasks, fields, assignments);
		const taskStops = routes[0]?.stops.filter((s) => s.kind === 'task') ?? [];
		expect(taskStops).toHaveLength(1);
		expect(taskStops[0]?.fieldId).toBe('f1');
	});
});
