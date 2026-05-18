import type { ReactNode } from 'react';
import { ErrorAlert } from './ErrorAlert';
import { LoadingCard } from './LoadingCard';

type Props = {
	loading: boolean;
	error: string | null;
	loadingLabel: string;
	children: ReactNode;
};

export function AsyncPageShell({ loading, error, loadingLabel, children }: Props) {
	if (loading) {
		return (
			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
				<LoadingCard label={loadingLabel} />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
				<ErrorAlert message={error} />
			</div>
		);
	}

	return <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">{children}</div>;
}
