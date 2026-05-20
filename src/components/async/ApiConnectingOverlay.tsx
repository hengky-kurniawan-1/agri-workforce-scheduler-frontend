import { ErrorAlert } from '@/components/async/ErrorAlert';

type Props = {
	status: 'connecting' | 'error';
	errorMessage?: string;
	onRetry: () => void;
};

export function ApiConnectingOverlay({ status, errorMessage, onRetry }: Props) {
	const connecting = status === 'connecting';

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 p-4 backdrop-blur-md"
			role="dialog"
			aria-modal="true"
			aria-labelledby="api-connectivity-title"
			aria-busy={connecting}
		>
			<div className="w-full max-w-md rounded-xl border border-soil-200 bg-white p-6 shadow-lg">
				<h1 id="api-connectivity-title" className="font-display text-lg font-semibold text-soil-900">
					Agri Workforce Scheduler
				</h1>

				{connecting ? (
					<div className="mt-4 flex items-center gap-2 text-sm text-soil-600">
						<span className="inline-block h-2 w-2 animate-pulse-soft rounded-full bg-leaf-500" />
						Connecting to API…
					</div>
				) : (
					<div className="mt-4 flex flex-col gap-4">
						<ErrorAlert message={errorMessage ?? 'Cannot reach the API.'} />
						<button
							type="button"
							onClick={onRetry}
							className="self-start rounded-md bg-soil-900 px-4 py-2 text-sm font-medium text-white hover:bg-soil-800"
						>
							Retry
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
