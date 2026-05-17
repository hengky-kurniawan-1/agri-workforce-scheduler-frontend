import { useOperationsOutlet } from '@/pages/OperationsLayout';

export function FieldsPage() {
	const { fields, loading, error } = useOperationsOutlet();

	if (loading) {
		return (
			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
				<div className="flex items-center gap-2 rounded-lg border border-soil-200 bg-white p-4 text-sm text-soil-600">
					<span className="inline-block h-2 w-2 animate-pulse-soft rounded-full bg-leaf-500" />
					Loading fields…
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
				<div
					className="rounded-lg border border-red-200 bg-red-50/90 p-4 text-sm text-red-800"
					role="alert"
				>
					{error}
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
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
		</div>
	);
}
