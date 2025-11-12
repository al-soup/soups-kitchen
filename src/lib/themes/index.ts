import type { Theme } from './types';
import { neoBrutalistTheme } from './neo-brutalist';

export * from './types';
export * from './neo-brutalist';

export const themes: Record<string, Theme> = {
	'neo-brutalist': neoBrutalistTheme
};

export const defaultTheme = neoBrutalistTheme;
