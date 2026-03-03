export interface OptimizeOptions {
	/** Minificar el CSS de salida (default: true) */
	minify?: boolean;
}

/**
 * Agrupa bloques @media con la misma query en un solo bloque.
 * Esto reduce significativamente el tamaño del CSS generado
 * por los generators (cada clase genera su propio @media block).
 */
function mergeMediaQueries(css: string): string {
	const mediaBlocks = new Map<string, string[]>();
	const topLevel: string[] = [];

	let i = 0;
	while (i < css.length) {
		// Saltar whitespace
		while (i < css.length && /\s/.test(css[i])) i++;
		if (i >= css.length) break;

		if (css.startsWith("@media", i)) {
			// Encontrar la llave de apertura
			const braceStart = css.indexOf("{", i);
			if (braceStart === -1) break;
			const query = css.slice(i, braceStart).trim();

			// Encontrar la llave de cierre balanceada
			let depth = 1;
			let j = braceStart + 1;
			while (j < css.length && depth > 0) {
				if (css[j] === "{") depth++;
				else if (css[j] === "}") depth--;
				j++;
			}

			const content = css.slice(braceStart + 1, j - 1).trim();
			if (!mediaBlocks.has(query)) {
				mediaBlocks.set(query, []);
			}
			mediaBlocks.get(query)!.push(content);
			i = j;
		} else {
			// Regla top-level (no @media)
			const braceStart = css.indexOf("{", i);
			if (braceStart === -1) break;
			let depth = 1;
			let j = braceStart + 1;
			while (j < css.length && depth > 0) {
				if (css[j] === "{") depth++;
				else if (css[j] === "}") depth--;
				j++;
			}
			topLevel.push(css.slice(i, j));
			i = j;
		}
	}

	// Reconstruir: reglas top-level primero, luego media queries agrupadas
	let result = topLevel.join("\n");
	for (const [query, contents] of mediaBlocks) {
		result += `\n${query}{\n${contents.join("\n")}\n}`;
	}

	return result;
}

/**
 * Optimiza CSS usando Lightning CSS:
 * - Merge de media queries idénticas
 * - Nesting
 * - Autoprefixing (via browserslist "defaults")
 * - Minificación
 *
 * Imports dinámicos para que solo se carguen cuando se usen.
 */
export async function optimizeCSS(
	css: string,
	options: OptimizeOptions = {},
): Promise<string> {
	const { minify = true } = options;

	// Agrupar media queries idénticas antes de transformar
	const merged = mergeMediaQueries(css);

	const { transform, browserslistToTargets, Features } =
		await import("lightningcss");
	const browserslist = (await import("browserslist")).default;

	const targets = browserslistToTargets(browserslist("defaults"));

	const result = transform({
		filename: "grisso.css",
		code: new TextEncoder().encode(merged),
		minify,
		targets,
		include: Features.Nesting,
	});

	return new TextDecoder().decode(result.code);
}
