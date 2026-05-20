import type { ReactNode } from 'react';
import { useApiHealth } from '@/api/hooks';
import { ApiConnectingOverlay } from '@/components/async/ApiConnectingOverlay';

type Props = {
	children: ReactNode;
};

export function ApiConnectivityGate({ children }: Props) {
	const { loading, error, refetch } = useApiHealth();

	if (loading || error) {
		return (
			<ApiConnectingOverlay
				status={loading ? 'connecting' : 'error'}
				errorMessage={error ?? undefined}
				onRetry={() => void refetch()}
			/>
		);
	}

	return children;
}
