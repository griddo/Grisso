import { fileURLToPath } from "node:url";
import path from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";
import grissoApply from "../postcss.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureConfig = path.join(__dirname, "__fixtures__/test.config.mjs");

/** Helper: procesa CSS con el plugin y retorna el resultado */
function process(css: string, opts?: { config?: string }) {
	return postcss([grissoApply(opts)]).process(css, { from: undefined });
}

/** Helper: normaliza whitespace para comparaciones más legibles */
function normalize(css: string): string {
	return css.replace(/\s+/g, " ").trim();
}

describe("grisso-apply PostCSS plugin", () => {
	it("inlinea declaraciones de una clase base", async () => {
		const result = await process(".foo { @grisso flex; }");
		expect(result.css).toContain("display: flex");
		expect(result.warnings()).toHaveLength(0);
	});

	it("inlinea clases de token (complexClass)", async () => {
		const result = await process(".foo { @grisso text-1; }");
		expect(result.css).toContain("color: var(--text-1)");
	});

	it("inlinea múltiples clases en un solo @grisso", async () => {
		const result = await process(".foo { @grisso flex text-1 p-sm; }");
		const css = result.css;
		expect(css).toContain("display: flex");
		expect(css).toContain("color: var(--text-1)");
		expect(css).toContain("padding: var(--spc-sm)");
	});

	it("genera variantes de estado con prefijo :", async () => {
		const result = await process(".foo { @grisso hover:text-2; }");
		const css = normalize(result.css);
		expect(css).toContain(".foo:hover");
		expect(css).toContain("color: var(--text-2)");
	});

	it("genera variantes responsive con prefijo :", async () => {
		const result = await process(".foo { @grisso tablet:flex; }");
		const css = normalize(result.css);
		expect(css).toContain("@media (min-width: 700px)");
		expect(css).toContain(".foo");
		expect(css).toContain("display: flex");
	});

	it("genera variantes responsive + estado", async () => {
		const result = await process(
			".foo { @grisso tablet:hover:text-1; }",
		);
		const css = normalize(result.css);
		expect(css).toContain("@media (min-width: 700px)");
		expect(css).toContain(".foo:hover");
		expect(css).toContain("color: var(--text-1)");
	});

	it("soporta orden estado:breakpoint", async () => {
		const result = await process(
			".foo { @grisso hover:tablet:text-1; }",
		);
		const css = normalize(result.css);
		expect(css).toContain("@media (min-width: 700px)");
		expect(css).toContain(".foo:hover");
	});

	it("maneja customClass con múltiples declaraciones (truncate)", async () => {
		const result = await process(".foo { @grisso truncate; }");
		const css = result.css;
		expect(css).toContain("overflow: hidden");
		expect(css).toContain("text-overflow: ellipsis");
		expect(css).toContain("white-space: nowrap");
	});

	it("preserva declaraciones existentes en la regla", async () => {
		const result = await process(
			".foo { font-size: 16px; @grisso text-1; }",
		);
		const css = result.css;
		expect(css).toContain("font-size: 16px");
		expect(css).toContain("color: var(--text-1)");
	});

	it("no modifica archivos sin @grisso", async () => {
		const input = ".foo { color: red; }";
		const result = await process(input);
		expect(result.css).toBe(input);
	});

	it("emite warning para clase desconocida", async () => {
		const result = await process(".foo { @grisso nonexistent-class; }");
		const warnings = result.warnings();
		expect(warnings).toHaveLength(1);
		expect(warnings[0].text).toContain("nonexistent-class");
	});

	it("emite warning para prefijo desconocido", async () => {
		const result = await process(".foo { @grisso unknown:flex; }");
		const warnings = result.warnings();
		expect(warnings).toHaveLength(1);
		expect(warnings[0].text).toContain("unknown");
	});

	it("emite warning si @grisso está fuera de una regla", async () => {
		const result = await process("@grisso flex;");
		const warnings = result.warnings();
		expect(warnings).toHaveLength(1);
		expect(warnings[0].text).toContain("dentro de una regla");
	});

	it("emite warning si @grisso no tiene parámetros", async () => {
		const result = await process(".foo { @grisso ; }");
		const warnings = result.warnings();
		expect(warnings).toHaveLength(1);
		expect(warnings[0].text).toContain("al menos una clase");
	});

	it("combina base + estado + responsive en una sola directiva", async () => {
		const result = await process(
			".card { @grisso p-md hover:bg-2 tablet:p-lg; }",
		);
		const css = normalize(result.css);
		// Base
		expect(css).toContain("padding: var(--spc-md)");
		// Estado
		expect(css).toContain(".card:hover");
		expect(css).toContain("background-color: var(--bg-2)");
		// Responsive
		expect(css).toContain("@media (min-width: 700px)");
		expect(css).toContain("padding: var(--spc-lg)");
	});

	it("genera focus-visible como estado", async () => {
		const result = await process(
			".btn { @grisso focus-visible:text-1; }",
		);
		const css = normalize(result.css);
		expect(css).toContain(".btn:focus-visible");
		expect(css).toContain("color: var(--text-1)");
	});

	it("soporta breakpoint desktop", async () => {
		const result = await process(".foo { @grisso desktop:hidden; }");
		const css = normalize(result.css);
		expect(css).toContain("@media (min-width: 1024px)");
		expect(css).toContain("display: none");
	});

	it("soporta múltiples directivas @grisso en la misma regla", async () => {
		const input = `.foo {
			font-size: 16px;
			@grisso text-1;
			line-height: 1.5;
			@grisso p-sm;
		}`;
		const result = await process(input);
		const css = result.css;
		expect(css).toContain("color: var(--text-1)");
		expect(css).toContain("padding: var(--spc-sm)");
		expect(css).toContain("font-size: 16px");
		expect(css).toContain("line-height: 1.5");
	});

	it("genera active state", async () => {
		const result = await process(".btn { @grisso active:bg-5; }");
		const css = normalize(result.css);
		expect(css).toContain(".btn:active");
		expect(css).toContain("background-color: var(--bg-5)");
	});

	it("genera disabled state", async () => {
		const result = await process(
			".btn { @grisso disabled:bg-disabled disabled:opacity-3; }",
		);
		const css = normalize(result.css);
		expect(css).toContain(".btn:disabled");
		expect(css).toContain("background-color: var(--bg-disabled)");
		expect(css).toContain("opacity: var(--opacity-3)");
	});

	it("soporta breakpoint ultrawide", async () => {
		const result = await process(".foo { @grisso ultrawide:flex; }");
		const css = normalize(result.css);
		expect(css).toContain("@media (min-width: 1680px)");
		expect(css).toContain("display: flex");
	});

	it("múltiples estados en una sola directiva", async () => {
		const result = await process(
			".link { @grisso text-1 hover:text-2 focus:text-3; }",
		);
		const css = normalize(result.css);
		expect(css).toContain(".link { color: var(--text-1)");
		expect(css).toContain(".link:hover { color: var(--text-2)");
		expect(css).toContain(".link:focus { color: var(--text-3)");
	});

	it("funciona con selectores compuestos", async () => {
		const result = await process(
			".card .title { @grisso text-1 hover:text-2; }",
		);
		const css = normalize(result.css);
		expect(css).toContain(".card .title { color: var(--text-1)");
		expect(css).toContain(".card .title:hover { color: var(--text-2)");
	});

	it("emite warning con demasiados prefijos", async () => {
		const result = await process(
			".foo { @grisso a:b:c:d; }",
		);
		const warnings = result.warnings();
		expect(warnings).toHaveLength(1);
		expect(warnings[0].text).toContain("Demasiados prefijos");
	});

	it("orden de salida: base → estado → responsive → responsive+estado", async () => {
		const result = await process(
			".foo { @grisso p-sm hover:p-md tablet:p-lg tablet:hover:p-xl; }",
		);
		const css = result.css;

		const baseIdx = css.indexOf("padding: var(--spc-sm)");
		const stateIdx = css.indexOf(".foo:hover");
		const mediaIdx = css.indexOf("@media (min-width: 700px)");

		expect(baseIdx).toBeGreaterThan(-1);
		expect(stateIdx).toBeGreaterThan(baseIdx);
		expect(mediaIdx).toBeGreaterThan(stateIdx);
	});

	it("patrón CSS Modules real: card con base + hover + responsive", async () => {
		const input = `.card {
			border-radius: 8px;
			transition: box-shadow 0.2s;
			@grisso flex flex-col gap-sm p-md bg-ui shadow-lg hover:shadow-xl tablet:p-lg;
		}`;
		const result = await process(input);
		const css = normalize(result.css);

		// Base
		expect(css).toContain("display: flex");
		expect(css).toContain("flex-direction: column");
		expect(css).toContain("gap: var(--spc-sm)");
		expect(css).toContain("padding: var(--spc-md)");
		expect(css).toContain("background-color: var(--bg-ui)");
		expect(css).toContain("box-shadow: var(--box-shadow-lg)");
		expect(css).toContain("border-radius: 8px");

		// Hover
		expect(css).toContain(".card:hover");
		expect(css).toContain("box-shadow: var(--box-shadow-xl)");

		// Responsive
		expect(css).toContain("@media (min-width: 700px)");
		expect(css).toContain("padding: var(--spc-lg)");
	});

	it("usa config custom via opción config", async () => {
		// test.config.mjs define spacing: { sm: "8px", md: "16px", lg: "24px" }
		const result = await process(".foo { @grisso p-sm; }", {
			config: fixtureConfig,
		});
		// Con config custom, p-sm usa "8px" en vez de "var(--spc-sm)"
		expect(result.css).toContain("padding: 8px");
		expect(result.css).not.toContain("var(--spc-sm)");
	});

	it("config custom con extend genera clases extendidas", async () => {
		// test.config.mjs extiende foregroundColors con "5": "var(--text-5)"
		const result = await process(".foo { @grisso text-5; }", {
			config: fixtureConfig,
		});
		expect(result.css).toContain("color: var(--text-5)");
	});

	it("resuelve clases con fracción (w-1/2)", async () => {
		const result = await process(".foo { @grisso w-1/2; }");
		expect(result.css).toContain("width: 50%");
	});

	it("resuelve fracciones con estado (hover:w-2/3)", async () => {
		const result = await process(".foo { @grisso hover:w-2/3; }");
		const css = normalize(result.css);
		expect(css).toContain(".foo:hover");
		expect(css).toContain("width: 66.6666666667%");
	});

	it("resuelve clases negativas (-z-10)", async () => {
		const result = await process(".foo { @grisso -z-10; }");
		expect(result.css).toContain("z-index: -10");
	});

	it("@grisso dentro de @media existente", async () => {
		const input = `@media (min-width: 500px) {
			.foo { @grisso text-1 hover:text-2; }
		}`;
		const result = await process(input);
		const css = normalize(result.css);
		// Base y estado deben estar dentro del @media existente
		expect(css).toContain("@media (min-width: 500px)");
		expect(css).toContain(".foo { color: var(--text-1)");
		expect(css).toContain(".foo:hover { color: var(--text-2)");
	});

	it("@grisso dentro de @media con variante responsive genera @media anidado", async () => {
		const input = `@media (min-width: 500px) {
			.foo { @grisso text-1 tablet:text-2; }
		}`;
		const result = await process(input);
		const css = result.css;
		// El @media responsive se anida dentro del existente
		expect(css).toContain("@media (min-width: 700px)");
		expect(css).toContain("color: var(--text-2)");
	});

	it("merge de declaraciones del mismo estado (hover:text-1 hover:bg-2)", async () => {
		const result = await process(
			".foo { @grisso hover:text-1 hover:bg-2; }",
		);
		const css = result.css;
		// Solo debe haber UNA regla .foo:hover con ambas declaraciones
		const matches = css.match(/\.foo:hover/g);
		expect(matches).toHaveLength(1);
		expect(css).toContain("color: var(--text-1)");
		expect(css).toContain("background-color: var(--bg-2)");
	});

	it("propiedad duplicada: la última gana (p-sm p-md)", async () => {
		const result = await process(".foo { @grisso p-sm p-md; }");
		const css = result.css;
		// Ambas declaraciones se insertan; CSS cascade hace que la última gane
		expect(css).toContain("padding: var(--spc-sm)");
		expect(css).toContain("padding: var(--spc-md)");
		// p-md debe aparecer después de p-sm
		const smIdx = css.indexOf("padding: var(--spc-sm)");
		const mdIdx = css.indexOf("padding: var(--spc-md)");
		expect(mdIdx).toBeGreaterThan(smIdx);
	});

	it("elimina regla padre vacía si solo tenía @grisso con prefijos", async () => {
		const result = await process(".foo { @grisso hover:text-1; }");
		const css = result.css;
		// La regla .foo {} no debe existir (estaba vacía tras quitar @grisso)
		expect(css).not.toMatch(/\.foo\s*\{\s*\}/);
		// Pero sí debe existir .foo:hover
		expect(css).toContain(".foo:hover");
	});

	it("preserva regla padre si tiene otras declaraciones", async () => {
		const result = await process(
			".foo { color: red; @grisso hover:text-1; }",
		);
		const css = result.css;
		// La regla .foo debe mantenerse con su declaración propia
		expect(css).toContain(".foo");
		expect(css).toContain("color: red");
		expect(css).toContain(".foo:hover");
	});
});
