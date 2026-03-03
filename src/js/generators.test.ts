import { describe, expect, it } from "vitest";
import { complexClass, customClass, simpleClass } from "./generators.js";
import type { Breakpoints, TokenMap } from "./types.js";

const breakpoints: Breakpoints = {
	tablet: "(min-width: 700px)",
	desktop: "(min-width: 1024px)",
};

describe("simpleClass", () => {
	it("genera clase base", () => {
		const css = simpleClass("flex", "display", "flex", breakpoints);
		expect(css).toContain(".flex { display: flex; }");
	});

	it("genera variantes responsive", () => {
		const css = simpleClass("flex", "display", "flex", breakpoints);
		expect(css).toContain(
			"@media (min-width: 700px) { .tablet-flex { display: flex; } }",
		);
		expect(css).toContain(
			"@media (min-width: 1024px) { .desktop-flex { display: flex; } }",
		);
	});

	it("genera una variante por breakpoint", () => {
		const css = simpleClass("hidden", "display", "none", breakpoints);
		const mediaCount = (css.match(/@media/g) || []).length;
		expect(mediaCount).toBe(Object.keys(breakpoints).length);
	});
});

describe("complexClass", () => {
	const tokens: TokenMap = {
		sm: "var(--spc-sm)",
		md: "var(--spc-md)",
	};

	it("itera tokens generando clase por cada uno", () => {
		const css = complexClass("p-", "padding", tokens, breakpoints);
		expect(css).toContain(".p-sm { padding: var(--spc-sm); }");
		expect(css).toContain(".p-md { padding: var(--spc-md); }");
	});

	it("genera variantes responsive por token", () => {
		const css = complexClass("p-", "padding", tokens, breakpoints);
		expect(css).toContain(
			"@media (min-width: 700px) { .tablet-p-sm { padding: var(--spc-sm); } }",
		);
		expect(css).toContain(
			"@media (min-width: 1024px) { .desktop-p-md { padding: var(--spc-md); } }",
		);
	});

	it("acepta array de properties", () => {
		const css = complexClass(
			"px-",
			["padding-left", "padding-right"],
			{ sm: "var(--spc-sm)" },
			breakpoints,
		);
		expect(css).toContain(".px-sm { padding-left: var(--spc-sm); }");
		expect(css).toContain(".px-sm { padding-right: var(--spc-sm); }");
	});

	it("usa el prefijo correcto", () => {
		const css = complexClass("mt-", "margin-top", tokens, breakpoints);
		expect(css).toContain(".mt-sm");
		expect(css).toContain(".mt-md");
		expect(css).not.toContain(".p-");
	});
});

describe("customClass", () => {
	it("genera clase con múltiples declarations", () => {
		const css = customClass(
			"truncate",
			{
				overflow: "hidden",
				"text-overflow": "ellipsis",
				"white-space": "nowrap",
			},
			breakpoints,
		);
		expect(css).toContain("overflow: hidden");
		expect(css).toContain("text-overflow: ellipsis");
		expect(css).toContain("white-space: nowrap");
		expect(css).toContain(".truncate");
	});

	it("genera variantes responsive", () => {
		const css = customClass("truncate", { overflow: "hidden" }, breakpoints);
		expect(css).toContain(".tablet-truncate");
		expect(css).toContain(".desktop-truncate");
	});

	it("aplica selectorSuffix", () => {
		const css = customClass(
			"divide-x",
			{ "border-right-width": "0", "border-left-width": "1px" },
			breakpoints,
			" > * + *",
		);
		expect(css).toContain(".divide-x > * + *");
	});

	it("aplica selectorSuffix en variantes responsive", () => {
		const css = customClass(
			"divide-x",
			{ "border-left-width": "1px" },
			breakpoints,
			" > * + *",
		);
		expect(css).toContain(".tablet-divide-x > * + *");
	});

	it("funciona sin selectorSuffix", () => {
		const css = customClass(
			"sr-only",
			{ position: "absolute", width: "1px" },
			breakpoints,
		);
		expect(css).toContain(".sr-only {");
		expect(css).not.toContain(".sr-only >");
	});
});
