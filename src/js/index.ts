import partials from "./partials/index.js";
import { resolveConfig } from "./resolve-config.js";

/**
 * Genera el CSS completo de Grisso.
 *
 * @param configPath - Ruta a grisso.config.mjs del consumidor
 * @returns CSS raw (sin minificar, sin vendor prefixes)
 */
export async function generateCSS(configPath?: string): Promise<string> {
	const config = await resolveConfig(configPath);
	let css = "";
	for (const partial of partials) {
		css += partial(config);
	}
	return css;
}

export { resolveConfig };
