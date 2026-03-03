import type { TokenMap } from "./types.js";

/**
 * Elimina keys de un objeto.
 * Equivalente a sass:map.remove()
 */
export function omit(obj: TokenMap, ...keys: string[]): TokenMap {
	const result = { ...obj };
	for (const key of keys) {
		delete result[key];
	}
	return result;
}

/**
 * Calcula un porcentaje con 10 decimales (paridad con Dart Sass).
 * fractionPercent(1, 12) → "8.3333333333%"
 * fractionPercent(3, 12) → "25%"
 */
export function fractionPercent(numerator: number, denominator: number): string {
	const value = ((numerator / denominator) * 100).toFixed(10);
	return value.replace(/\.?0+$/, "") + "%";
}
