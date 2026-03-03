/** Mapa de breakpoints: nombre → media query */
export type Breakpoints = Record<string, string>;

/** Mapa de tokens: nombre → valor CSS */
export type TokenMap = Record<string, string>;

/** Mapa de declaraciones CSS: propiedad → valor */
export type Declarations = Record<string, string>;

/** Configuración completa de Grisso */
export interface GrissoConfig {
	columns: number;
	breakpoints: Breakpoints;
	spacing: TokenMap;
	brandColors: TokenMap;
	foregroundColors: TokenMap;
	iconColors: TokenMap;
	supportColors: TokenMap;
	backgroundColors: TokenMap;
	overlayColors: TokenMap;
	borderWidth: TokenMap;
	opacity: TokenMap;
	shadows: TokenMap;
	borderColors: TokenMap;
	/** Patrones de clases protegidas del tree-shaking */
	safelist: (string | RegExp)[];
	[key: string]: unknown;
}

/** Función parcial que genera CSS a partir de la config */
export type PartialFn = (config: GrissoConfig) => string;
