import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractTokens } from "../tokens.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testConfig = path.join(__dirname, "__fixtures__/test.config.mjs");

describe("extractTokens", () => {
	describe("formato CSS (default)", () => {
		it("genera scaffold con :root y headers de sección", async () => {
			const css = await extractTokens();
			expect(css).toContain(":root {");
			expect(css).toContain("/* ─── Spacing");
			expect(css).toContain("/* ─── Colors: texto");
			expect(css).toContain("/* ─── Colors: fondo");
			expect(css).toContain("/* ─── Sombras");
		});

		it("contiene custom properties conocidas de spacing", async () => {
			const css = await extractTokens();
			expect(css).toContain("--spc-sm: ;");
			expect(css).toContain("--spc-md: ;");
			expect(css).toContain("--spc-4xs: ;");
			expect(css).toContain("--spc-5xl: ;");
		});

		it("contiene custom properties de colors", async () => {
			const css = await extractTokens();
			expect(css).toContain("--text-1: ;");
			expect(css).toContain("--bg-1: ;");
			expect(css).toContain("--brand-1: ;");
			expect(css).toContain("--icon-1: ;");
			expect(css).toContain("--border-1: ;");
		});

		it("contiene custom properties de soporte", async () => {
			const css = await extractTokens();
			expect(css).toContain("--success: ;");
			expect(css).toContain("--error: ;");
			expect(css).toContain("--warning: ;");
		});

		it("contiene overlays, border widths, opacidad y sombras", async () => {
			const css = await extractTokens();
			expect(css).toContain("--overlay-1: ;");
			expect(css).toContain("--border-width-xs: ;");
			expect(css).toContain("--opacity-1: ;");
			expect(css).toContain("--box-shadow-sm: ;");
		});

		it("literales no generan custom properties", async () => {
			const css = await extractTokens();
			// "auto", "0" son valores literales, no deben aparecer como properties
			expect(css).not.toContain("--auto");
			expect(css).not.toContain("--0");
		});

		it("secciones vacías se omiten (config con spacing literal)", async () => {
			const css = await extractTokens({ config: testConfig });
			// test.config.mjs reemplaza spacing con valores literales (8px, 16px, 24px)
			// → no hay var(--...) → sección Spacing no debe existir
			expect(css).not.toContain("/* ─── Spacing");
		});

		it("config custom refleja extends", async () => {
			const css = await extractTokens({ config: testConfig });
			// extend.foregroundColors: { 5: "var(--text-5)" }
			expect(css).toContain("--text-5: ;");
			// extend.shadows: { "2xl": "var(--box-shadow-2xl)" }
			expect(css).toContain("--box-shadow-2xl: ;");
		});
	});

	describe("formato JSON", () => {
		it("genera JSON válido", async () => {
			const json = await extractTokens({ format: "json" });
			expect(() => JSON.parse(json)).not.toThrow();
		});

		it("contiene token maps conocidos", async () => {
			const data = JSON.parse(await extractTokens({ format: "json" }));
			expect(data).toHaveProperty("spacing");
			expect(data).toHaveProperty("brandColors");
			expect(data).toHaveProperty("foregroundColors");
			expect(data).toHaveProperty("backgroundColors");
			expect(data).toHaveProperty("shadows");
			expect(data).toHaveProperty("borderColors");
		});

		it("no incluye columns, breakpoints ni safelist", async () => {
			const data = JSON.parse(await extractTokens({ format: "json" }));
			expect(data).not.toHaveProperty("columns");
			expect(data).not.toHaveProperty("breakpoints");
			expect(data).not.toHaveProperty("safelist");
		});

		it("config custom refleja overrides y extends", async () => {
			const data = JSON.parse(
				await extractTokens({ config: testConfig, format: "json" }),
			);
			// spacing reemplazado completamente
			expect(data.spacing).toEqual({ sm: "8px", md: "16px", lg: "24px" });
			// foregroundColors mergeado
			expect(data.foregroundColors["5"]).toBe("var(--text-5)");
			// shadows mergeado
			expect(data.shadows["2xl"]).toBe("var(--box-shadow-2xl)");
		});
	});
});
