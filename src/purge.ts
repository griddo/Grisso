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
				// Extractor para uso directo en HTML/JSX: class="flex gap-md w-1/2"
				extractor: (content: string) =>
					content.match(/[A-Za-z0-9_/.-]+/g) || [],
				extensions: ["html", "jsx", "tsx", "js", "ts"],
			},
			{
				// Extractor para CSS Modules: composes: flex gap-md from global
				extractor: (content: string) => {
					const matches =
						content.match(/composes:\s*([^;]+)\s*from\s+global/g) || [];
					const classes: string[] = [];
					for (const match of matches) {
						const classStr = match
							.replace(/composes:\s*/, "")
							.replace(/\s*from\s+global/, "");
						classes.push(...classStr.trim().split(/\s+/));
					}
					return classes;
				},
				extensions: ["css"],
			},
		],
		safelist: {
			greedy: [/^bg-/, ...(options.safelist ?? [])],
		},
	});

	return result ? result.css : css;
}
