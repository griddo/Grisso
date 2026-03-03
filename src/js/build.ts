import { generateCSS } from "./index.js";
import { optimizeCSS } from "./optimize.js";
import { purgeCSS } from "./purge.js";

export interface BuildOptions {
	/** Ruta a grisso.config.mjs del consumidor */
	config?: string;
	/** Rutas glob de archivos a escanear para tree-shaking */
	content?: string[];
	/** Minificar el CSS de salida (default: true) */
	minify?: boolean;
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
	const { config, content, minify = true } = options;

	// 1. Generar CSS raw desde los generators
	let css = await generateCSS(config);

	// 2. Tree-shaking si hay rutas de contenido
	if (content && content.length > 0) {
		css = await purgeCSS(css, { content });
	}

	// 3. Optimizar (nesting, autoprefixer, minificación)
	css = await optimizeCSS(css, { minify });

	return css;
}
