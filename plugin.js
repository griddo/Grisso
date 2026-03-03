/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const fs = require("fs");

/**
 * PostCSS plugin de Grisso.
 * Inyecta el CSS pre-compilado de Grisso y aplica tree-shaking
 * usando PurgeCSS si se pasan rutas de contenido.
 *
 * @param {Object} options
 * @param {string[]} [options.content] - Rutas glob de archivos a escanear para tree-shaking.
 *   Si se omite, se incluye todo el CSS de Grisso (útil en desarrollo).
 *
 * @example
 * // postcss.config.js del proyecto consumidor
 * const grisso = require("@griddo/grisso/plugin");
 * module.exports = {
 *   plugins: [
 *     grisso({ content: ["./src/**\/*.{js,ts,jsx,tsx,css}"] })
 *   ]
 * }
 */
module.exports = function grissoPlugin(options = {}) {
	const { content } = options;
	const cssPath = path.resolve(__dirname, "dist/grisso.css");

	return {
		postcssPlugin: "postcss-grisso",
		async Once(root, { parse }) {
			const grissoSource = fs.readFileSync(cssPath, "utf8");

			if (!content || content.length === 0) {
				// Sin tree-shaking: inyectar todo el CSS
				const grissoRoot = parse(grissoSource);
				grissoRoot.each((node) => root.prepend(node.clone()));
				return;
			}

			// Con tree-shaking: usar PurgeCSS para eliminar clases no usadas
			const { default: PurgeCSS } = await import("@fullhuman/postcss-purgecss");

			const purgecss = new PurgeCSS();
			const [result] = await purgecss.purge({
				content: content.map((pattern) => ({ raw: pattern, extension: "html" })),
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
};

module.exports.postcss = true;
