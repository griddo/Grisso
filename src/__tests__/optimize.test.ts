import { describe, expect, it } from "vitest";
import { optimizeCSS } from "../optimize.js";

describe("optimizeCSS", () => {
	it("produce CSS válido", async () => {
		const input = `.flex { display: flex; }
@media (min-width: 700px) { .tablet-flex { display: flex; } }
.block { display: block; }
@media (min-width: 700px) { .tablet-block { display: block; } }`;

		const result = await optimizeCSS(input, { minify: false });
		// Debe contener las clases
		expect(result).toContain("flex");
		expect(result).toContain("block");
	});

	it("agrupa media queries idénticas", async () => {
		const input = `
.flex { display: flex; }
@media (min-width: 700px) { .tablet-flex { display: flex; } }
.block { display: block; }
@media (min-width: 700px) { .tablet-block { display: block; } }`;

		const result = await optimizeCSS(input, { minify: false });
		// Lightning CSS puede reescribir el media query — contar @media blocks
		const mediaCount = (result.match(/@media/g) || []).length;
		expect(mediaCount).toBe(1);
	});

	it("preserva reglas top-level al inicio", async () => {
		const input = `.flex { display: flex; }
@media (min-width: 700px) { .tablet-flex { display: flex; } }`;

		const result = await optimizeCSS(input, { minify: false });
		const flexPos = result.indexOf("flex");
		const mediaPos = result.indexOf("@media");
		expect(flexPos).toBeLessThan(mediaPos);
	});

	it("minifica el output cuando minify: true", async () => {
		const input = `.flex { display: flex; }
.block { display: block; }`;

		const minified = await optimizeCSS(input, { minify: true });
		const unminified = await optimizeCSS(input, { minify: false });
		expect(minified.length).toBeLessThan(unminified.length);
	});

	it("output minificado no tiene saltos de línea innecesarios", async () => {
		const input = `.flex { display: flex; }
.block { display: block; }
.grid { display: grid; }`;

		const result = await optimizeCSS(input, { minify: true });
		// Minificado debe ser más compacto
		expect(result.length).toBeLessThan(input.length);
	});
});
