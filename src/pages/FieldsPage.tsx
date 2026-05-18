import { AsyncPageShell } from '@/components/async/AsyncPageShell';
import { useOperationsOutlet } from '@/context/OperationsContext';

export function FieldsPage() {
	const { fields, loading, error } = useOperationsOutlet();

	return (
		<AsyncPageShell loading={loading} error={error} loadingLabel="Loading fields…">
			<div className="min-w-0">
				<h2 className="text-sm font-semibold text-soil-900">Fields</h2>
				<p className="mt-0.5 text-xs text-soil-500">All fields from the API.</p>
			</div>

			{!fields.length ? (
				<div className="rounded-lg border border-soil-200 bg-white p-4 text-sm text-soil-600">
					No fields yet.
				</div>
			) : (
				<ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{fields.map((f) => {
						const [lat, lon] = f.location;
						return (
							<li
								key={f.id}
								className="rounded-lg border border-soil-200 bg-white px-3 py-2.5 text-sm shadow-sm"
							>
								<p className="font-medium text-soil-900">{f.name}</p>
								<p className="mt-1 font-mono text-xs text-soil-600">{f.id}</p>
								<p className="mt-1 text-xs text-soil-500">
									{lat.toFixed(5)}, {lon.toFixed(5)}
								</p>
							</li>
						);
					})}
				</ul>
			)}
		</AsyncPageShell>
	);
}
