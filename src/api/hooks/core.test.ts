import { describe, expect, it } from 'vitest';
import { ApiError } from '../generated/core/ApiError';
import { getErrorMessage } from './core';

describe('getErrorMessage', () => {
	it('returns ApiError string detail', () => {
		const err = new ApiError(
			{ url: '/x', method: 'GET', headers: {} },
			{ url: '/x', ok: false, status: 400, statusText: 'Bad', body: { detail: 'Invalid input' } },
			'Bad Request'
		);
		expect(getErrorMessage(err)).toBe('Invalid input');
	});

	it('joins ApiError validation array detail', () => {
		const err = new ApiError(
			{ url: '/x', method: 'GET', headers: {} },
			{
				url: '/x',
				ok: false,
				status: 422,
				statusText: 'Unprocessable',
				body: { detail: [{ msg: 'required' }, { msg: 'too short' }] },
			},
			'Validation failed'
		);
		expect(getErrorMessage(err)).toBe('required; too short');
	});

	it('returns axios response detail when present', () => {
		const err = {
			response: { data: { detail: 'Not found' } },
			message: 'Request failed',
		};
		expect(getErrorMessage(err)).toBe('Not found');
	});

	it('returns network guidance for ERR_NETWORK', () => {
		const err = { code: 'ERR_NETWORK', message: 'Network Error' };
		expect(getErrorMessage(err)).toContain('Cannot reach the API');
	});

	it('returns timeout guidance for ECONNABORTED', () => {
		const err = { code: 'ECONNABORTED', message: 'timeout' };
		expect(getErrorMessage(err)).toContain('timed out');
	});

	it('falls back to Error message', () => {
		expect(getErrorMessage(new Error('boom'))).toBe('boom');
	});
});
