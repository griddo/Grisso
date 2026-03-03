import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildCSS } from "./build.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleHTML = path.join(__dirname, "__fixtures__/sample.html");

describe("buildCSS", () => {
	it("genera CSS minificado con todas las utilidades", async () => {
		const css = await buildCSS();
		expect(css.length).toBeGreaterThan(0);
		// Debe contener utilidades básicas
		expect(css).toContain("flex");
		expect(css).toContain("block");
		expect(css).toContain("grid");
	});

	it("genera CSS legible cuando minify: false", async () => {
		const minified = await buildCSS({ minify: true });
		const unminified = await buildCSS({ minify: false });
		expect(unminified.length).toBeGreaterThan(minified.length);
	});

	it("tree-shaking reduce el tamaño significativamente", async () => {
		const full = await buildCSS();
		const treeshaken = await buildCSS({
			content: [sampleHTML],
		});
		// Tree-shaken debe ser mucho menor que el full
		expect(treeshaken.length).toBeLessThan(full.length * 0.5);
	});

	it("tree-shaken output contiene las clases usadas", async () => {
		const css = await buildCSS({
			content: [sampleHTML],
			minify: false,
		});
		// Clases presentes en sample.html
		expect(css).toContain("flex");
		expect(css).toContain("gap-md");
		expect(css).toContain("p-sm");
	});

	it("acepta config personalizada", async () => {
		const configPath = path.join(__dirname, "__fixtures__/test.config.mjs");
		const css = await buildCSS({ config: configPath, minify: false });
		expect(css.length).toBeGreaterThan(0);
		// El fixture reemplaza spacing, así que debe tener los valores custom
		expect(css).toContain("8px");
	});
});
