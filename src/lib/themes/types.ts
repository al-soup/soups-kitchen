export interface ThemeColors {
	background: string;
	foreground: string;
	primary: string;
	secondary: string;
	accent: string;
	border: string;
	shadow: string;
}

export interface ThemeTypography {
	fontFamily: string;
	fontWeightNormal: number;
	fontWeightBold: number;
}

export interface ThemeBorders {
	width: string;
	style: string;
	radius: string;
}

export interface ThemeShadows {
	sm: string;
	md: string;
	lg: string;
}

export interface ThemeSpacing {
	xs: string;
	sm: string;
	md: string;
	lg: string;
	xl: string;
}

export interface Theme {
	name: string;
	colors: ThemeColors;
	typography: ThemeTypography;
	borders: ThemeBorders;
	shadows: ThemeShadows;
	spacing: ThemeSpacing;
}
