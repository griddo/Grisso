import { generateCSS } from "./lib/index.js";

/**
 * PostCSS plugin de Grisso.
 * Genera CSS desde JS y aplica tree-shaking usando PurgeCSS
 * si se pasan rutas de contenido.
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
			const grissoSource = await generateCSS(configPath);

			if (!content || content.length === 0) {
				// Sin tree-shaking: inyectar todo el CSS
				const grissoRoot = parse(grissoSource);
				grissoRoot.each((node) => root.prepend(node.clone()));
				return;
			}

			// Con tree-shaking: usar PurgeCSS para eliminar clases no usadas
			const { PurgeCSS } = await import("purgecss");

			const purgecss = new PurgeCSS();
			const [result] = await purgecss.purge({
				content,
				css: [{ raw: grissoSource }],
				extractors: [
					{
						// Extractor para uso directo en HTML/JSX: class="flex gap-md"
						extractor: (content) => content.match(/[A-Za-z0-9_-]+/g) || [],
						extensions: ["html", "jsx", "tsx", "js", "ts"],
					},
					{
						// Extractor para CSS Modules: composes: flex gap-md from global
						extractor: (content) => {
							const matches = content.match(/composes:\s*([^;]+)\s*from\s+global/g) || [];
							const classes = [];
							for (const match of matches) {
								const classStr = match.replace(/composes:\s*/, "").replace(/\s*from\s+global/, "");
								classes.push(...classStr.trim().split(/\s+/));
							}
							return classes;
						},
						extensions: ["css", "scss"],
					},
				],
				safelist: {
					// Preservar clases de fondo (bg-) que pueden construirse dinámicamente
					greedy: [/^bg-/],
				},
			});

			const purgedCSS = result ? result.css : grissoSource;
			const grissoRoot = parse(purgedCSS);
			grissoRoot.each((node) => root.prepend(node.clone()));
		},
	};
}

grissoPlugin.postcss = true;
