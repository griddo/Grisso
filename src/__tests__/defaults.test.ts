import { describe, expect, it } from "vitest";
import defaults from "../defaults.js";

describe("defaults", () => {
	it("tiene todas las keys esperadas del GrissoConfig", () => {
		const expectedKeys = [
			"columns",
			"breakpoints",
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
		];
		for (const key of expectedKeys) {
			expect(defaults).toHaveProperty(key);
		}
	});

	it("tiene 3 breakpoints", () => {
		expect(Object.keys(defaults.breakpoints)).toHaveLength(3);
		expect(defaults.breakpoints).toHaveProperty("tablet");
		expect(defaults.breakpoints).toHaveProperty("desktop");
		expect(defaults.breakpoints).toHaveProperty("ultrawide");
	});

	it("breakpoints usan formato media query", () => {
		for (const mq of Object.values(defaults.breakpoints)) {
			expect(mq).toMatch(/^\(min-width: \d+px\)$/);
		}
	});

	it("columns es 12", () => {
		expect(defaults.columns).toBe(12);
	});

	it("tokens de spacing usan formato var(--...)", () => {
		const { auto, zero, "0": zero2, ...rest } = defaults.spacing;
		for (const value of Object.values(rest)) {
			expect(value).toMatch(/^var\(--spc-.+\)$/);
		}
	});

	it("tokens de color usan formato var(--...)", () => {
		for (const value of Object.values(defaults.foregroundColors)) {
			expect(value).toMatch(/^var\(--text-\d+\)$/);
		}
		for (const value of Object.values(defaults.brandColors)) {
			expect(value).toMatch(/^var\(--brand-\d+\)$/);
		}
	});

	it("tokens de sombra usan formato var(--...)", () => {
		for (const value of Object.values(defaults.shadows)) {
			expect(value).toMatch(/^var\(--box-shadow-.+\)$/);
		}
	});
});
