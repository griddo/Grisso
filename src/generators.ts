import type { Breakpoints, Declarations, States, TokenMap } from "./types.js";

/**
 * Generadores de clases CSS utility.
 * Replican los mixins grisso_simple_class, grisso_complex_class de SCSS.
 */

/** Escapa caracteres especiales en classNames para selectores CSS válidos. */
function escapeCSS(name: string): string {
	return name.replace(/[/:]/g, "\\$&");
}

/**
 * Genera una clase simple con variantes responsive y de estado.
 * Equivalente al mixin grisso_simple_class.
 */
export function simpleClass(
	className: string,
	property: string,
	value: string,
	breakpoints: Breakpoints,
	states?: States,
): string {
	const escaped = escapeCSS(className);
	let css = `.${escaped} { ${property}: ${value}; }\n`;

	// Variantes de estado
	if (states) {
		for (const [state, pseudo] of Object.entries(states)) {
			css += `.${state}\\:${escaped}${pseudo} { ${property}: ${value}; }\n`;
		}
	}

	for (const [bp, mq] of Object.entries(breakpoints)) {
		css += `@media ${mq} { .${bp}\\:${escaped} { ${property}: ${value}; } }\n`;

		// Variantes responsive + estado
		if (states) {
			for (const [state, pseudo] of Object.entries(states)) {
				css += `@media ${mq} { .${bp}\\:${state}\\:${escaped}${pseudo} { ${property}: ${value}; } }\n`;
			}
		}
	}
	return css;
}

/**
 * Genera clases basadas en un mapa de tokens con variantes responsive y de estado.
 * Equivalente al mixin grisso_complex_class.
 */
export function complexClass(
	prefix: string,
	properties: string | string[],
	tokens: TokenMap,
	breakpoints: Breakpoints,
	states?: States,
): string {
	const props = Array.isArray(properties) ? properties : [properties];
	let css = "";
	for (const [name, value] of Object.entries(tokens)) {
		const escaped = escapeCSS(`${prefix}${name}`);
		for (const prop of props) {
			css += `.${escaped} { ${prop}: ${value}; }\n`;
		}

		// Variantes de estado
		if (states) {
			for (const [state, pseudo] of Object.entries(states)) {
				for (const prop of props) {
					css += `.${state}\\:${escaped}${pseudo} { ${prop}: ${value}; }\n`;
				}
			}
		}

		for (const [bp, mq] of Object.entries(breakpoints)) {
			for (const prop of props) {
				css += `@media ${mq} { .${bp}\\:${escaped} { ${prop}: ${value}; } }\n`;
			}

			// Variantes responsive + estado
			if (states) {
				for (const [state, pseudo] of Object.entries(states)) {
					for (const prop of props) {
						css += `@media ${mq} { .${bp}\\:${state}\\:${escaped}${pseudo} { ${prop}: ${value}; } }\n`;
					}
				}
			}
		}
	}
	return css;
}

/**
 * Genera una clase con declaraciones custom y variantes responsive y de estado.
 * Para casos especiales: divide >*+*, truncate, smoothing, outline-none, etc.
 */
export function customClass(
	className: string,
	declarations: Declarations,
	breakpoints: Breakpoints,
	selectorSuffix?: string,
	states?: States,
): string {
	const escaped = escapeCSS(className);
	const suffix = selectorSuffix || "";
	const decls = Object.entries(declarations)
		.map(([p, v]) => `${p}: ${v}`)
		.join("; ");
	let css = `.${escaped}${suffix} { ${decls}; }\n`;

	// Variantes de estado: pseudo va antes del selectorSuffix
	if (states) {
		for (const [state, pseudo] of Object.entries(states)) {
			css += `.${state}\\:${escaped}${pseudo}${suffix} { ${decls}; }\n`;
		}
	}

	for (const [bp, mq] of Object.entries(breakpoints)) {
		css += `@media ${mq} { .${bp}\\:${escaped}${suffix} { ${decls}; } }\n`;

		// Variantes responsive + estado
		if (states) {
			for (const [state, pseudo] of Object.entries(states)) {
				css += `@media ${mq} { .${bp}\\:${state}\\:${escaped}${pseudo}${suffix} { ${decls}; } }\n`;
			}
		}
	}
	return css;
}
