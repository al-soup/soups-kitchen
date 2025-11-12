import type { Theme } from './types';

export const neoBrutalistTheme: Theme = {
	name: 'neo-brutalist',
	colors: {
		background: '#FFFFFF',
		foreground: '#000000',
		primary: '#FFA500', // Orange
		secondary: '#FFD700', // Gold/Yellow
		accent: '#FF8C00', // Dark Orange
		border: '#000000',
		shadow: '#000000'
	},
	typography: {
		fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
		fontWeightNormal: 400,
		fontWeightBold: 700
	},
	borders: {
		width: '3px',
		style: 'solid',
		radius: '0px'
	},
	shadows: {
		sm: '2px 2px 0px #000000',
		md: '4px 4px 0px #000000',
		lg: '6px 6px 0px #000000'
	},
	spacing: {
		xs: '0.5rem',
		sm: '1rem',
		md: '1.5rem',
		lg: '2rem',
		xl: '3rem'
	}
};
