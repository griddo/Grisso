import { generateCSS } from "./lib/index.js";
import { purgeCSS } from "./lib/purge.js";

/**
 * PostCSS plugin de Grisso.
 * Genera CSS desde JS y aplica tree-shaking usando PurgeCSS
 * si se pasan rutas de contenido.
 *
 * No aplica optimización (el consumidor tiene su propio pipeline PostCSS).
 *
 * @param {Object} options
 * @param {string[]} [options.content] - Rutas glob de archivos a escanear para tree-shaking.
 *   Si se omite, se incluye todo el CSS de Grisso (útil en desarrollo).
 * @param {string} [options.config] - Ruta a grisso.config.mjs del consumidor.
 *
 * @example
 * // postcss.config.js del proyecto consumidor
 * import grisso from "@griddo/grisso/plugin";
 * export default {
 *   plugins: [
 *     grisso({ content: ["./src/**\/*.{js,ts,jsx,tsx,css}"] })
 *   ]
 * }
 */
export default function grissoPlugin(options = {}) {
	const { content, config: configPath } = options;

	return {
		postcssPlugin: "postcss-grisso",
		async Once(root, { parse }) {
			let css = await generateCSS(configPath);

			if (content && content.length > 0) {
				css = await purgeCSS(css, { content });
			}

			const grissoRoot = parse(css);
			grissoRoot.each((node) => root.prepend(node.clone()));
		},
	};
}

grissoPlugin.postcss = true;
