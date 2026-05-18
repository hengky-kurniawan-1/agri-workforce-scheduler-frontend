import { AsyncPageShell } from '@/components/async/AsyncPageShell';
import { useOperationsOutlet } from '@/context/OperationsContext';

export function AgronomistsPage() {
	const { agronomists, loading, error } = useOperationsOutlet();

	return (
		<AsyncPageShell loading={loading} error={error} loadingLabel="Loading agronomists…">
			<div className="min-w-0">
				<h2 className="text-sm font-semibold text-soil-900">Agronomists</h2>
				<p className="mt-0.5 text-xs text-soil-500">All agronomists from the API.</p>
			</div>

			{!agronomists.length ? (
				<div className="rounded-lg border border-soil-200 bg-white p-4 text-sm text-soil-600">
					No agronomists yet.
				</div>
			) : (
				<ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{agronomists.map((a) => {
						const [lat, lon] = a.home_location;
						return (
							<li
								key={a.id}
								className="rounded-lg border border-soil-200 bg-white px-3 py-2.5 text-sm shadow-sm"
							>
								<p className="font-medium text-soil-900">{a.name}</p>
								<p className="mt-1 font-mono text-xs text-soil-600">{a.id}</p>
								<p className="mt-1 text-xs text-soil-500">{a.skills.join(', ')}</p>
								<p className="mt-1 text-xs text-soil-500">
									{lat.toFixed(5)}, {lon.toFixed(5)}
								</p>
								{a.workday_minutes != null ? (
									<p className="mt-1 text-xs text-soil-500">{a.workday_minutes} min workday</p>
								) : null}
							</li>
						);
					})}
				</ul>
			)}
		</AsyncPageShell>
	);
}
