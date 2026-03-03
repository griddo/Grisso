import path from "node:path";
import { pathToFileURL } from "node:url";
import defaults from "./defaults.js";
import type { GrissoConfig } from "./types.js";

/**
 * Resuelve la configuración de Grisso.
 * Patrón Tailwind v3:
 * - Top-level keys reemplazan los defaults completamente
 * - `extend` mergea superficialmente con defaults
 */
export async function resolveConfig(configPath?: string): Promise<GrissoConfig> {
	let userConfig: Record<string, unknown>;

	if (configPath) {
		const resolved = path.resolve(configPath);
		const mod = await import(pathToFileURL(resolved).href);
		userConfig = mod.default;
	} else {
		try {
			const defaultPath = path.resolve(process.cwd(), "grisso.config.mjs");
			const mod = await import(pathToFileURL(defaultPath).href);
			userConfig = mod.default;
		} catch {
			return { ...defaults };
		}
	}

	const { extend, ...overrides } = userConfig;

	// Top-level keys reemplazan defaults completamente
	const config: GrissoConfig = { ...defaults };
	for (const [key, value] of Object.entries(overrides)) {
		if (key in config) {
			(config as Record<string, unknown>)[key] = value;
		}
	}

	// extend mergea superficialmente con defaults
	if (extend && typeof extend === "object" && !Array.isArray(extend)) {
		for (const [key, value] of Object.entries(
			extend as Record<string, unknown>,
		)) {
			const current = (config as Record<string, unknown>)[key];
			if (
				key in config &&
				typeof current === "object" &&
				current !== null &&
				!Array.isArray(current)
			) {
				(config as Record<string, unknown>)[key] = {
					...(current as Record<string, unknown>),
					...(value as Record<string, unknown>),
				};
			} else {
				(config as Record<string, unknown>)[key] = value;
			}
		}
	}

	return config;
}
