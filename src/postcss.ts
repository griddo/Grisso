import type { PluginCreator } from "postcss";
import { generateCSS, resolveConfig } from "./index.js";
import type { Breakpoints, States } from "./types.js";

export interface GrissoApplyOptions {
	/** Ruta a grisso.config.mjs del consumidor */
	config?: string;
}

type DeclMap = Map<string, string>;

/**
 * Plugin PostCSS que permite usar clases Grisso con `@grisso` dentro de reglas CSS.
 * Soporta prefijos de estado y responsive con separador `:`.
 *
 * @example
 * ```css
 * .title {
 *   font-size: 24px;
 *   @grisso text-1 hover:text-2 tablet:text-3;
 * }
 * ```
 *
 * Genera:
 * ```css
 * .title { font-size: 24px; color: var(--text-1); }
 * .title:hover { color: var(--text-2); }
 * @media (min-width: 700px) { .title { color: var(--text-3); } }
 * ```
 */
const plugin: PluginCreator<GrissoApplyOptions> = (opts = {}) => {
	// Cache del mapa de clases (se reutiliza entre archivos)
	let classMap: Map<string, DeclMap> | null = null;
	let breakpoints: Breakpoints;
	let states: States;

	return {
		postcssPlugin: "grisso-apply",

		async Once(root, { result, postcss }) {
			// Early exit si no hay @grisso
			let hasGrisso = false;
			root.walkAtRules("grisso", () => {
				hasGrisso = true;
			});
			if (!hasGrisso) return;

			// Construir mapa de clases (lazy, una sola vez)
			if (!classMap) {
				const config = await resolveConfig(opts?.config);
				breakpoints = config.breakpoints;
				states = config.states;

				const rawCSS = await generateCSS(opts?.config);
				const grissoRoot = postcss.parse(rawCSS);
				classMap = new Map();

				grissoRoot.walkRules((rule) => {
					// Solo reglas top-level (no dentro de @media)
					if (rule.parent?.type !== "root") return;

					// Saltar variantes de estado (contienen pseudo-clase)
					if (rule.selector.includes(":")) return;

					// Extraer nombre de clase del selector
					const match = rule.selector.match(/^\.([^\s>~+{]+)/);
					if (!match) return;

					// Unescape (e.g. w-1\/2 → w-1/2)
					const className = match[1].replace(/\\/g, "");

					// Merge declaraciones (complexClass con array de properties genera múltiples reglas)
					if (!classMap!.has(className)) {
						classMap!.set(className, new Map());
					}
					const existing = classMap!.get(className)!;
					rule.walkDecls((decl) => {
						existing.set(decl.prop, decl.value);
					});
				});
			}

			// Recopilar @grisso rules (para no mutar durante walk)
			const grissoRules: import("postcss").AtRule[] = [];
			root.walkAtRules("grisso", (atRule) => {
				grissoRules.push(atRule);
			});

			for (const atRule of grissoRules) {
				const parentRule = atRule.parent;
				if (!parentRule || parentRule.type !== "rule") {
					result.warn("@grisso debe estar dentro de una regla CSS", {
						node: atRule,
					});
					continue;
				}

				const params = atRule.params.trim();
				if (!params) {
					result.warn("@grisso requiere al menos una clase", {
						node: atRule,
					});
					atRule.remove();
					continue;
				}

				const tokens = params.split(/\s+/);
				const selector = (parentRule as import("postcss").Rule).selector;

				// Agrupar declaraciones por contexto
				const baseDecls: [string, string][] = [];
				const stateGroups = new Map<string, [string, string][]>();
				const bpGroups = new Map<string, [string, string][]>();
				const bpStateGroups = new Map<
					string,
					Map<string, [string, string][]>
				>();

				for (const token of tokens) {
					const parts = token.split(":");
					let bp: string | null = null;
					let state: string | null = null;
					let className: string;

					if (parts.length === 1) {
						className = parts[0];
					} else if (parts.length === 2) {
						const prefix = parts[0];
						className = parts[1];
						if (prefix in breakpoints) {
							bp = prefix;
						} else if (prefix in states) {
							state = prefix;
						} else {
							result.warn(
								`Prefijo desconocido "${prefix}" en "${token}"`,
								{ node: atRule },
							);
							continue;
						}
					} else if (parts.length === 3) {
						const [a, b, c] = parts;
						className = c;
						if (a in breakpoints && b in states) {
							bp = a;
							state = b;
						} else if (a in states && b in breakpoints) {
							state = a;
							bp = b;
						} else {
							result.warn(
								`Prefijos inválidos en "${token}"`,
								{ node: atRule },
							);
							continue;
						}
					} else {
						result.warn(`Demasiados prefijos en "${token}"`, {
							node: atRule,
						});
						continue;
					}

					const decls = classMap.get(className);
					if (!decls) {
						result.warn(
							`Clase Grisso desconocida "${className}"`,
							{ node: atRule, word: className },
						);
						continue;
					}

					const entries: [string, string][] = [...decls.entries()];

					if (!bp && !state) {
						baseDecls.push(...entries);
					} else if (state && !bp) {
						const arr = stateGroups.get(state) || [];
						arr.push(...entries);
						stateGroups.set(state, arr);
					} else if (bp && !state) {
						const arr = bpGroups.get(bp) || [];
						arr.push(...entries);
						bpGroups.set(bp, arr);
					} else if (bp && state) {
						let stateMap = bpStateGroups.get(bp);
						if (!stateMap) {
							stateMap = new Map();
							bpStateGroups.set(bp, stateMap);
						}
						const arr = stateMap.get(state) || [];
						arr.push(...entries);
						stateMap.set(state, arr);
					}
				}

				// 1. Declaraciones base — insertar en la regla actual
				for (const [prop, value] of baseDecls) {
					atRule.before(postcss.decl({ prop, value }));
				}

				// Nodos a insertar después de la regla padre
				const newNodes: (
					| import("postcss").Rule
					| import("postcss").AtRule
				)[] = [];

				// 2. Variantes de estado
				for (const [stateName, entries] of stateGroups) {
					const pseudo = states[stateName];
					const rule = postcss.rule({
						selector: `${selector}${pseudo}`,
					});
					for (const [prop, value] of entries) {
						rule.append(postcss.decl({ prop, value }));
					}
					newNodes.push(rule);
				}

				// 3. Variantes responsive
				for (const [bpName, entries] of bpGroups) {
					const mq = breakpoints[bpName];
					const media = postcss.atRule({
						name: "media",
						params: mq,
					});
					const rule = postcss.rule({ selector });
					for (const [prop, value] of entries) {
						rule.append(postcss.decl({ prop, value }));
					}
					media.append(rule);
					newNodes.push(media);
				}

				// 4. Variantes responsive + estado
				for (const [bpName, stateMap] of bpStateGroups) {
					const mq = breakpoints[bpName];
					for (const [stateName, entries] of stateMap) {
						const pseudo = states[stateName];
						const media = postcss.atRule({
							name: "media",
							params: mq,
						});
						const rule = postcss.rule({
							selector: `${selector}${pseudo}`,
						});
						for (const [prop, value] of entries) {
							rule.append(postcss.decl({ prop, value }));
						}
						media.append(rule);
						newNodes.push(media);
					}
				}

				// Insertar nodos después de la regla padre (en orden)
				let insertAfter: import("postcss").ChildNode = parentRule;
				for (const node of newNodes) {
					insertAfter.after(node);
					insertAfter = node;
				}

				// Eliminar @grisso
				atRule.remove();

				// Limpiar regla padre si queda vacía (e.g. solo tenía @grisso con prefijos)
				if (
					parentRule.nodes &&
					parentRule.nodes.length === 0
				) {
					parentRule.remove();
				}
			}
		},
	};
};

plugin.postcss = true;
export default plugin;
