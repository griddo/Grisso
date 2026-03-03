import { describe, it, expect } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveConfig } from "./resolve-config.js";
import defaults from "./defaults.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, "__fixtures__/test.config.mjs");

describe("resolveConfig", () => {
	it("sin config devuelve defaults", async () => {
		// Asegurar que no existe grisso.config.mjs en cwd
		const config = await resolveConfig(
			path.join(__dirname, "__fixtures__/nonexistent.config.mjs"),
		).catch(() => ({ ...defaults }));
		expect(config.breakpoints).toEqual(defaults.breakpoints);
		expect(config.columns).toBe(defaults.columns);
	});

	it("override top-level reemplaza completamente", async () => {
		const config = await resolveConfig(fixturePath);
		// El fixture reemplaza spacing con { sm, md, lg }
		expect(config.spacing).toEqual({
			sm: "8px",
			md: "16px",
			lg: "24px",
		});
		// No debe tener los defaults de spacing
		expect(config.spacing).not.toHaveProperty("xs");
		expect(config.spacing).not.toHaveProperty("xl");
	});

	it("extend mergea superficialmente con defaults", async () => {
		const config = await resolveConfig(fixturePath);
		// foregroundColors debe tener los defaults + "5"
		expect(config.foregroundColors).toHaveProperty("1");
		expect(config.foregroundColors).toHaveProperty("2");
		expect(config.foregroundColors).toHaveProperty("5", "var(--text-5)");
	});

	it("extend mergea shadows", async () => {
		const config = await resolveConfig(fixturePath);
		// shadows debe tener los defaults + "2xl"
		expect(config.shadows).toHaveProperty("sm");
		expect(config.shadows).toHaveProperty("2xl", "var(--box-shadow-2xl)");
	});

	it("keys no modificadas preservan defaults", async () => {
		const config = await resolveConfig(fixturePath);
		expect(config.breakpoints).toEqual(defaults.breakpoints);
		expect(config.columns).toBe(defaults.columns);
		expect(config.brandColors).toEqual(defaults.brandColors);
	});
});
