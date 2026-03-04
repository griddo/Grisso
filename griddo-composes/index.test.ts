import { describe, expect, it } from "vitest";
import { escapeGrissoComposes } from "./index.js";

describe("escapeGrissoComposes", () => {
	it("escapa : en clases con prefijo de estado", () => {
		const input = ".wrapper { composes: flex hover:bg-1 from global; }";
		const result = escapeGrissoComposes(input);
		expect(result).toContain("composes: flex hover\\:bg-1 from global");
	});

	it("escapa : en clases con prefijo responsive", () => {
		const input = ".wrapper { composes: tablet:p-sm from global; }";
		const result = escapeGrissoComposes(input);
		expect(result).toContain("composes: tablet\\:p-sm from global");
	});

	it("escapa : en clases con prefijo responsive + estado", () => {
		const input = ".wrapper { composes: tablet:hover:bg-1 from global; }";
		const result = escapeGrissoComposes(input);
		expect(result).toContain("composes: tablet\\:hover\\:bg-1 from global");
	});

	it("no modifica clases sin :", () => {
		const input = ".wrapper { composes: flex gap-md p-sm from global; }";
		const result = escapeGrissoComposes(input);
		expect(result).toContain("composes: flex gap-md p-sm from global");
	});

	it("maneja múltiples composes declarations", () => {
		const input = `.a { composes: flex hover:bg-1 from global; }
.b { composes: tablet:p-sm from global; }`;
		const result = escapeGrissoComposes(input);
		expect(result).toContain("composes: flex hover\\:bg-1 from global");
		expect(result).toContain("composes: tablet\\:p-sm from global");
	});

	it("no modifica composes sin from global", () => {
		const input = '.wrapper { composes: base from "./other.css"; }';
		const result = escapeGrissoComposes(input);
		expect(result).toBe(input);
	});

	it("preserva el resto del CSS intacto", () => {
		const input = `.wrapper {
	color: red;
	composes: hover:text-1 from global;
	background: blue;
}`;
		const result = escapeGrissoComposes(input);
		expect(result).toContain("color: red;");
		expect(result).toContain("background: blue;");
		expect(result).toContain("composes: hover\\:text-1 from global");
	});
});
