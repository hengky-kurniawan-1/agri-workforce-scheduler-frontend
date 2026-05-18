import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { ForceAssignRequest } from '../generated';
import { postForceAssignForceAssignPost } from '../generated';
import { getErrorMessage } from './core';

export function useForceAssign() {
	const [error, setError] = useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: (body: ForceAssignRequest) => postForceAssignForceAssignPost({ requestBody: body }),
	});

	const mutate = useCallback(
		async (body: ForceAssignRequest) => {
			setError(null);
			try {
				await mutation.mutateAsync(body);
			} catch (e) {
				setError(getErrorMessage(e));
				throw e;
			}
		},
		[mutation]
	);

	return {
		mutate,
		submitting: mutation.isPending,
		error: error ?? (mutation.error ? getErrorMessage(mutation.error) : null),
	};
}
