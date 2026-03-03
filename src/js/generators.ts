import type { Breakpoints, TokenMap, Declarations } from "./types.js";

/**
 * Generadores de clases CSS utility.
 * Replican los mixins grisso_simple_class, grisso_complex_class de SCSS.
 */

/**
 * Genera una clase simple con variantes responsive.
 * Equivalente al mixin grisso_simple_class.
 */
export function simpleClass(
	className: string,
	property: string,
	value: string,
	breakpoints: Breakpoints,
): string {
	let css = `.${className} { ${property}: ${value}; }\n`;
	for (const [bp, mq] of Object.entries(breakpoints)) {
		css += `@media ${mq} { .${bp}-${className} { ${property}: ${value}; } }\n`;
	}
	return css;
}

/**
 * Genera clases basadas en un mapa de tokens con variantes responsive.
 * Equivalente al mixin grisso_complex_class.
 */
export function complexClass(
	prefix: string,
	properties: string | string[],
	tokens: TokenMap,
	breakpoints: Breakpoints,
): string {
	const props = Array.isArray(properties) ? properties : [properties];
	let css = "";
	for (const [name, value] of Object.entries(tokens)) {
		for (const prop of props) {
			css += `.${prefix}${name} { ${prop}: ${value}; }\n`;
		}
		for (const [bp, mq] of Object.entries(breakpoints)) {
			for (const prop of props) {
				css += `@media ${mq} { .${bp}-${prefix}${name} { ${prop}: ${value}; } }\n`;
			}
		}
	}
	return css;
}

/**
 * Genera una clase con declaraciones custom y variantes responsive.
 * Para casos especiales: divide >*+*, truncate, smoothing, outline-none, etc.
 */
export function customClass(
	className: string,
	declarations: Declarations,
	breakpoints: Breakpoints,
	selectorSuffix?: string,
): string {
	const suffix = selectorSuffix || "";
	const decls = Object.entries(declarations)
		.map(([p, v]) => `${p}: ${v}`)
		.join("; ");
	let css = `.${className}${suffix} { ${decls}; }\n`;
	for (const [bp, mq] of Object.entries(breakpoints)) {
		css += `@media ${mq} { .${bp}-${className}${suffix} { ${decls}; } }\n`;
	}
	return css;
}
