import { complexClass, simpleClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";
import { fractionPercent } from "../utils.js";

export default function sizing(config: GrissoConfig): string {
	const { columns, breakpoints } = config;
	let css = "";

	// width
	const width: Record<string, string> = {
		auto: "auto",
		"0": "0",
		full: "100%",
		screen: "100vw",
		min: "min-content",
		max: "max-content",
		fit: "fit-content",
	};
	css += complexClass("w-", "width", width, breakpoints);
	for (let i = 1; i <= columns; i++) {
		css += simpleClass(
			`w-${i}`,
			"width",
			fractionPercent(i, columns),
			breakpoints,
		);
	}
	css += complexClass("min-w-", "min-width", width, breakpoints);
	css += complexClass("max-w-", "max-width", width, breakpoints);

	// height
	const height: Record<string, string> = {
		auto: "auto",
		"0": "0",
		full: "100%",
		screen: "100vh",
		min: "min-content",
		max: "max-content",
		fit: "fit-content",
	};
	css += complexClass("h-", "height", height, breakpoints);
	for (let i = 1; i <= columns; i++) {
		css += simpleClass(
			`h-${i}`,
			"height",
			fractionPercent(i, columns),
			breakpoints,
		);
	}
	css += complexClass("min-h-", "min-height", height, breakpoints);
	css += complexClass("max-h-", "max-height", height, breakpoints);

	return css;
}
