export interface PurgeOptions {
	/** Rutas glob de archivos a escanear */
	content: string[];
	/** Patrones greedy adicionales a preservar */
	safelist?: RegExp[];
}

/**
 * Elimina clases CSS no utilizadas mediante PurgeCSS.
 * Import dinámico para que los consumidores que no necesiten tree-shaking
 * no paguen el coste de cargar purgecss.
 */
export async function purgeCSS(
	css: string,
	options: PurgeOptions,
): Promise<string> {
	const { PurgeCSS } = await import("purgecss");

	const purgecss = new PurgeCSS();
	const [result] = await purgecss.purge({
		content: options.content,
		css: [{ raw: css }],
		extractors: [
			{
				// Extractor para uso directo en HTML/JSX: class="flex gap-md hover:bg-1 w-1/2"
				extractor: (content: string) =>
					content.match(/[A-Za-z0-9_/:.-]+/g) || [],
				extensions: ["html", "jsx", "tsx", "js", "ts"],
			},
			{
				// Extractor para CSS: composes: ... from global y @grisso directives
				extractor: (content: string) => {
					const classes: string[] = [];

					// composes: flex gap-md from global
					const composes =
						content.match(/composes:\s*([^;]+)\s*from\s+global/g) || [];
					for (const match of composes) {
						const classStr = match
							.replace(/composes:\s*/, "")
							.replace(/\s*from\s+global/, "");
						classes.push(...classStr.trim().split(/\s+/));
					}

					// @grisso flex hover:text-2 tablet:p-lg;
					const grissoMatches = content.match(/@grisso\s+([^;}]+)/g) || [];
					for (const match of grissoMatches) {
						const tokens = match
							.replace(/@grisso\s+/, "")
							.trim()
							.split(/\s+/);
						for (const token of tokens) {
							// Token completo (e.g. "hover:text-2") para preservar variantes
							classes.push(token);
							// Clase base sin prefijos (e.g. "text-2") para preservar regla base
							const base = token.split(":").pop();
							if (base && base !== token) classes.push(base);
						}
					}

					return classes;
				},
				extensions: ["css"],
			},
		],
		safelist: {
			greedy: options.safelist ?? [],
		},
	});

	return result ? result.css : css;
}
