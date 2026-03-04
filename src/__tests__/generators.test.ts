import { describe, expect, it } from "vitest";
import { complexClass, customClass, simpleClass } from "../generators.js";
import type { Breakpoints, States, TokenMap } from "../types.js";

const breakpoints: Breakpoints = {
	tablet: "(min-width: 700px)",
	desktop: "(min-width: 1024px)",
};

const states: States = {
	hover: ":hover",
	focus: ":focus",
};

describe("simpleClass", () => {
	it("genera clase base", () => {
		const css = simpleClass("flex", "display", "flex", breakpoints);
		expect(css).toContain(".flex { display: flex; }");
	});

	it("genera variantes responsive", () => {
		const css = simpleClass("flex", "display", "flex", breakpoints);
		expect(css).toContain(
			"@media (min-width: 700px) { .tablet\\:flex { display: flex; } }",
		);
		expect(css).toContain(
			"@media (min-width: 1024px) { .desktop\\:flex { display: flex; } }",
		);
	});

	it("genera una variante por breakpoint", () => {
		const css = simpleClass("hidden", "display", "none", breakpoints);
		const mediaCount = (css.match(/@media/g) || []).length;
		expect(mediaCount).toBe(Object.keys(breakpoints).length);
	});

	it("escapa / en classNames", () => {
		const css = simpleClass("w-1/2", "width", "50%", breakpoints);
		expect(css).toContain(".w-1\\/2 { width: 50%; }");
		expect(css).toContain(".tablet\\:w-1\\/2 { width: 50%; }");
	});

	it("genera variantes de estado", () => {
		const css = simpleClass("flex", "display", "flex", breakpoints, states);
		expect(css).toContain(".hover\\:flex:hover { display: flex; }");
		expect(css).toContain(".focus\\:flex:focus { display: flex; }");
	});

	it("genera variantes responsive + estado", () => {
		const css = simpleClass("flex", "display", "flex", breakpoints, states);
		expect(css).toContain(
			"@media (min-width: 700px) { .tablet\\:hover\\:flex:hover { display: flex; } }",
		);
		expect(css).toContain(
			"@media (min-width: 1024px) { .desktop\\:focus\\:flex:focus { display: flex; } }",
		);
	});

	it("sin states no genera variantes de estado (backward compat)", () => {
		const css = simpleClass("flex", "display", "flex", breakpoints);
		expect(css).not.toContain("hover");
		expect(css).not.toContain("focus");
	});

	it("escapa / en classNames con states", () => {
		const css = simpleClass("w-1/2", "width", "50%", breakpoints, states);
		expect(css).toContain(".hover\\:w-1\\/2:hover { width: 50%; }");
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
			"@media (min-width: 700px) { .tablet\\:p-sm { padding: var(--spc-sm); } }",
		);
		expect(css).toContain(
			"@media (min-width: 1024px) { .desktop\\:p-md { padding: var(--spc-md); } }",
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

	it("escapa / en token names", () => {
		const fractionTokens: TokenMap = { "1/2": "50%", "1/3": "33.3333%" };
		const css = complexClass("w-", "width", fractionTokens, breakpoints);
		expect(css).toContain(".w-1\\/2 { width: 50%; }");
		expect(css).toContain(".w-1\\/3 { width: 33.3333%; }");
		expect(css).toContain(".tablet\\:w-1\\/2");
	});

	it("genera variantes de estado por token", () => {
		const css = complexClass("p-", "padding", tokens, breakpoints, states);
		expect(css).toContain(".hover\\:p-sm:hover { padding: var(--spc-sm); }");
		expect(css).toContain(".focus\\:p-md:focus { padding: var(--spc-md); }");
	});

	it("genera variantes responsive + estado", () => {
		const css = complexClass("p-", "padding", tokens, breakpoints, states);
		expect(css).toContain(
			"@media (min-width: 700px) { .tablet\\:hover\\:p-sm:hover { padding: var(--spc-sm); } }",
		);
	});

	it("sin states no genera variantes de estado (backward compat)", () => {
		const css = complexClass("p-", "padding", tokens, breakpoints);
		expect(css).not.toContain("hover");
	});

	it("escapa / en token names con states", () => {
		const fractionTokens: TokenMap = { "1/2": "50%" };
		const css = complexClass(
			"w-",
			"width",
			fractionTokens,
			breakpoints,
			states,
		);
		expect(css).toContain(".hover\\:w-1\\/2:hover { width: 50%; }");
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
		expect(css).toContain(".tablet\\:truncate");
		expect(css).toContain(".desktop\\:truncate");
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
		expect(css).toContain(".tablet\\:divide-x > * + *");
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

	it("genera variantes de estado", () => {
		const css = customClass(
			"truncate",
			{ overflow: "hidden", "text-overflow": "ellipsis" },
			breakpoints,
			undefined,
			states,
		);
		expect(css).toContain(
			".hover\\:truncate:hover { overflow: hidden; text-overflow: ellipsis; }",
		);
		expect(css).toContain(
			".focus\\:truncate:focus { overflow: hidden; text-overflow: ellipsis; }",
		);
	});

	it("pseudo va antes del selectorSuffix en state variants", () => {
		const css = customClass(
			"divide-x",
			{ "border-left-width": "1px" },
			breakpoints,
			" > * + *",
			states,
		);
		expect(css).toContain(".hover\\:divide-x:hover > * + *");
		expect(css).toContain(".tablet\\:hover\\:divide-x:hover > * + *");
	});

	it("genera variantes responsive + estado", () => {
		const css = customClass(
			"truncate",
			{ overflow: "hidden" },
			breakpoints,
			undefined,
			states,
		);
		expect(css).toContain(
			"@media (min-width: 700px) { .tablet\\:hover\\:truncate:hover { overflow: hidden; } }",
		);
	});

	it("sin states no genera variantes de estado (backward compat)", () => {
		const css = customClass("truncate", { overflow: "hidden" }, breakpoints);
		expect(css).not.toContain("hover");
	});
});
