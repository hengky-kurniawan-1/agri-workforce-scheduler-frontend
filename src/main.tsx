import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { configureOpenAPI } from './api/openapi';
import { queryClient } from './api/queryClient';
import './styles/globals.css';
import './styles/animations.css';

configureOpenAPI();

const el = document.getElementById('root');
if (!el) {
	throw new Error('Root element #root not found');
}

createRoot(el).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</StrictMode>
);
