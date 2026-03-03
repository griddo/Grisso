import { resolveConfig } from "./resolve-config.js";
import type { GrissoConfig, TokenMap } from "./types.js";

export interface TokensOptions {
	/** Ruta a grisso.config.mjs del consumidor */
	config?: string;
	/** Formato de salida: CSS scaffold o JSON (default: "css") */
	format?: "css" | "json";
}

/** Orden fijo de secciones — matchea defaults.ts y tokens-example.css */
const TOKEN_MAP_KEYS = [
	"spacing",
	"brandColors",
	"foregroundColors",
	"iconColors",
	"supportColors",
	"backgroundColors",
	"overlayColors",
	"borderWidth",
	"opacity",
	"shadows",
	"borderColors",
] as const;

/** Labels para los headers CSS de cada sección */
const SECTION_LABELS: Record<string, string> = {
	spacing: "Spacing",
	brandColors: "Colors: marca",
	foregroundColors: "Colors: texto",
	iconColors: "Colors: iconos",
	supportColors: "Colors: soporte",
	backgroundColors: "Colors: fondo",
	overlayColors: "Colors: overlays",
	borderWidth: "Border widths",
	opacity: "Opacidad",
	shadows: "Sombras",
	borderColors: "Colors: bordes",
};

/** Keys que NO son token maps */
const NON_TOKEN_KEYS = new Set([
	"columns",
	"breakpoints",
	"safelist",
	"extend",
]);

const VAR_RE = /var\(--([\w-]+)\)/g;

/** Extrae nombres de custom properties de un token map, deduplicados y en orden */
function extractVarNames(tokenMap: TokenMap): string[] {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const value of Object.values(tokenMap)) {
		for (const match of value.matchAll(VAR_RE)) {
			const name = match[1];
			if (!seen.has(name)) {
				seen.add(name);
				result.push(name);
			}
		}
	}
	return result;
}

/** Genera scaffold CSS con todas las custom properties */
function formatCSS(config: GrissoConfig): string {
	const lines: string[] = [];
	lines.push(
		"/* @hiscovega/grisso — tokens scaffold",
		"   Define estas variables en :root o en el scope que prefieras.",
		"   Generado desde la config resuelta de Grisso.",
		"*/",
		"",
		":root {",
	);

	let hasSections = false;

	// Secciones conocidas en orden fijo
	for (const key of TOKEN_MAP_KEYS) {
		const map = config[key] as TokenMap | undefined;
		if (!map || typeof map !== "object") continue;
		const vars = extractVarNames(map);
		if (vars.length === 0) continue;

		const label = SECTION_LABELS[key] || key;
		if (hasSections) lines.push("");
		lines.push(
			`\t/* ─── ${label} ${"─".repeat(Math.max(1, 55 - label.length))} */`,
		);
		for (const name of vars) {
			lines.push(`\t--${name}: ;`);
		}
		hasSections = true;
	}

	// Secciones custom del consumidor (keys desconocidas que sean objetos)
	for (const [key, value] of Object.entries(config)) {
		if (NON_TOKEN_KEYS.has(key)) continue;
		if (TOKEN_MAP_KEYS.includes(key as (typeof TOKEN_MAP_KEYS)[number]))
			continue;
		if (!value || typeof value !== "object" || Array.isArray(value)) continue;
		const vars = extractVarNames(value as TokenMap);
		if (vars.length === 0) continue;

		if (hasSections) lines.push("");
		lines.push(
			`\t/* ─── ${key} ${"─".repeat(Math.max(1, 55 - key.length))} */`,
		);
		for (const name of vars) {
			lines.push(`\t--${name}: ;`);
		}
		hasSections = true;
	}

	lines.push("}", "");
	return lines.join("\n");
}

/** Genera JSON con los token maps de la config resuelta */
function formatJSON(config: GrissoConfig): string {
	const result: Record<string, TokenMap> = {};

	for (const key of TOKEN_MAP_KEYS) {
		const map = config[key] as TokenMap | undefined;
		if (map && typeof map === "object") {
			result[key] = map;
		}
	}

	// Incluir token maps custom del consumidor
	for (const [key, value] of Object.entries(config)) {
		if (NON_TOKEN_KEYS.has(key)) continue;
		if (TOKEN_MAP_KEYS.includes(key as (typeof TOKEN_MAP_KEYS)[number]))
			continue;
		if (!value || typeof value !== "object" || Array.isArray(value)) continue;
		result[key] = value as TokenMap;
	}

	return JSON.stringify(result, null, "\t");
}

/**
 * Extrae tokens de la config resuelta y genera un scaffold CSS o JSON.
 *
 * @example
 * const css = await extractTokens();
 * const json = await extractTokens({ format: "json" });
 */
export async function extractTokens(
	options: TokensOptions = {},
): Promise<string> {
	const { config: configPath, format = "css" } = options;
	const config = await resolveConfig(configPath);

	if (format === "json") {
		return formatJSON(config);
	}
	return formatCSS(config);
}
