/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['DM Sans', 'system-ui', 'sans-serif'],
				display: ['Fraunces', 'Georgia', 'serif'],
			},
			colors: {
				soil: {
					50: '#faf8f5',
					100: '#f0ebe3',
					200: '#ddd2c4',
					300: '#c4b49e',
					400: '#a89478',
					500: '#8f7a5f',
					600: '#6f5f4a',
					700: '#5a4d3e',
					800: '#4c4236',
					900: '#423a31',
				},
				leaf: {
					50: '#f3faf3',
					100: '#e3f4e5',
					200: '#c8e8cd',
					300: '#9dd4a8',
					400: '#6bb87d',
					500: '#45995c',
					600: '#347c49',
					700: '#2c623c',
					800: '#274f33',
					900: '#21412c',
				},
			},
		},
	},
	plugins: [],
};
