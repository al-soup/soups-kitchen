import { defaultTheme, themes, type Theme } from '$lib/themes';

let currentTheme = $state<Theme>(defaultTheme);

export const themeStore = {
	get current() {
		return currentTheme;
	},
	setTheme(themeName: string) {
		const theme = themes[themeName];
		if (theme) {
			currentTheme = theme;
			applyTheme(theme);
		}
	},
	reset() {
		currentTheme = defaultTheme;
		applyTheme(defaultTheme);
	}
};

function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;

	const root = document.documentElement;

	// Apply colors
	root.style.setProperty('--color-background', theme.colors.background);
	root.style.setProperty('--color-foreground', theme.colors.foreground);
	root.style.setProperty('--color-primary', theme.colors.primary);
	root.style.setProperty('--color-secondary', theme.colors.secondary);
	root.style.setProperty('--color-accent', theme.colors.accent);
	root.style.setProperty('--color-border', theme.colors.border);
	root.style.setProperty('--color-shadow', theme.colors.shadow);

	// Apply typography
	root.style.setProperty('--font-family', theme.typography.fontFamily);
	root.style.setProperty('--font-weight-normal', theme.typography.fontWeightNormal.toString());
	root.style.setProperty('--font-weight-bold', theme.typography.fontWeightBold.toString());

	// Apply borders
	root.style.setProperty('--border-width', theme.borders.width);
	root.style.setProperty('--border-style', theme.borders.style);
	root.style.setProperty('--border-radius', theme.borders.radius);

	// Apply shadows
	root.style.setProperty('--shadow-sm', theme.shadows.sm);
	root.style.setProperty('--shadow-md', theme.shadows.md);
	root.style.setProperty('--shadow-lg', theme.shadows.lg);

	// Apply spacing
	root.style.setProperty('--spacing-xs', theme.spacing.xs);
	root.style.setProperty('--spacing-sm', theme.spacing.sm);
	root.style.setProperty('--spacing-md', theme.spacing.md);
	root.style.setProperty('--spacing-lg', theme.spacing.lg);
	root.style.setProperty('--spacing-xl', theme.spacing.xl);
}

// Initialize theme on module load
if (typeof document !== 'undefined') {
	applyTheme(defaultTheme);
}
