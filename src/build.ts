import { generateCSS } from "./index.js";
import { optimizeCSS } from "./optimize.js";
import { purgeCSS } from "./purge.js";
import { resolveConfig } from "./resolve-config.js";

export interface BuildOptions {
	/** Ruta a grisso.config.mjs del consumidor */
	config?: string;
	/** Rutas glob de archivos a escanear para tree-shaking */
	content?: string[];
	/** Minificar el CSS de salida (default: true) */
	minify?: boolean;
	/** Patrones de clases protegidas del tree-shaking (se mergean con config.safelist) */
	safelist?: (string | RegExp)[];
}

/** Convierte strings a RegExp, deja RegExp intactos */
function toRegExpArray(list?: (string | RegExp)[]): RegExp[] {
	if (!list) return [];
	return list.map((item) => (item instanceof RegExp ? item : new RegExp(item)));
}

/**
 * API principal de Grisso — genera, purga y optimiza CSS
 * sin depender de PostCSS.
 *
 * @example
 * // Build completo (todo el CSS, minificado)
 * const css = await buildCSS();
 *
 * // Build con tree-shaking
 * const css = await buildCSS({
 *   content: ["./src/**\/*.{js,ts,jsx,tsx,css}"],
 *   config: "./grisso.config.mjs",
 * });
 */
export async function buildCSS(options: BuildOptions = {}): Promise<string> {
	const { config, content, minify = true, safelist: optsSafelist } = options;

	// 1. Generar CSS raw desde los generators
	let css = await generateCSS(config);

	// 2. Tree-shaking si hay rutas de contenido
	if (content && content.length > 0) {
		// Resolver config para extraer safelist configurada
		const resolved = await resolveConfig(config);
		const mergedSafelist = [
			...toRegExpArray(resolved.safelist),
			...toRegExpArray(optsSafelist),
		];
		css = await purgeCSS(css, { content, safelist: mergedSafelist });
	}

	// 3. Optimizar (nesting, autoprefixer, minificación)
	css = await optimizeCSS(css, { minify });

	return css;
}
