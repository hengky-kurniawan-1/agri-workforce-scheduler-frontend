import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const apiTarget = env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

	return {
		plugins: [react()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
		server: {
			port: 5173,
			proxy: {
				'^/(health|fields|schedule|assignments|force-assign|chat|jobs|reoptimize|add-task)': {
					target: apiTarget,
					changeOrigin: true,
				},
			},
		},
	};
});
