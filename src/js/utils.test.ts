import { describe, it, expect } from "vitest";
import { omit, fractionPercent } from "./utils.js";

describe("omit", () => {
	it("elimina las keys indicadas", () => {
		const obj = { a: "1", b: "2", c: "3" };
		expect(omit(obj, "b")).toEqual({ a: "1", c: "3" });
	});

	it("elimina múltiples keys", () => {
		const obj = { a: "1", b: "2", c: "3", d: "4" };
		expect(omit(obj, "a", "c")).toEqual({ b: "2", d: "4" });
	});

	it("preserva el objeto original (no muta)", () => {
		const obj = { a: "1", b: "2" };
		omit(obj, "a");
		expect(obj).toEqual({ a: "1", b: "2" });
	});

	it("ignora keys inexistentes sin error", () => {
		const obj = { a: "1" };
		expect(omit(obj, "z")).toEqual({ a: "1" });
	});

	it("devuelve copia del objeto si no se pasan keys", () => {
		const obj = { a: "1", b: "2" };
		const result = omit(obj);
		expect(result).toEqual(obj);
		expect(result).not.toBe(obj);
	});
});

describe("fractionPercent", () => {
	it("calcula fracciones limpias", () => {
		expect(fractionPercent(1, 4)).toBe("25%");
		expect(fractionPercent(1, 2)).toBe("50%");
		expect(fractionPercent(3, 4)).toBe("75%");
	});

	it("calcula fracciones periódicas con precisión de 10 decimales", () => {
		expect(fractionPercent(1, 3)).toBe("33.3333333333%");
		expect(fractionPercent(1, 12)).toBe("8.3333333333%");
		expect(fractionPercent(5, 12)).toBe("41.6666666667%");
	});

	it("maneja 1/1 como 100%", () => {
		expect(fractionPercent(1, 1)).toBe("100%");
	});

	it("maneja fracciones de 12 columnas", () => {
		expect(fractionPercent(3, 12)).toBe("25%");
		expect(fractionPercent(4, 12)).toBe("33.3333333333%");
		expect(fractionPercent(6, 12)).toBe("50%");
	});
});
