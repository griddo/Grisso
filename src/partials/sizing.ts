import { complexClass, simpleClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";
import { fractionPercent } from "../utils.js";

const fractions: [number, number][] = [
	[1, 2],
	[1, 3],
	[2, 3],
	[1, 4],
	[2, 4],
	[3, 4],
	[1, 5],
	[2, 5],
	[3, 5],
	[4, 5],
	[1, 6],
	[2, 6],
	[3, 6],
	[4, 6],
	[5, 6],
	[1, 12],
	[2, 12],
	[3, 12],
	[4, 12],
	[5, 12],
	[6, 12],
	[7, 12],
	[8, 12],
	[9, 12],
	[10, 12],
	[11, 12],
];

export default function sizing(config: GrissoConfig): string {
	const { breakpoints, states } = config;
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
	css += complexClass("w-", "width", width, breakpoints, states);
	for (const [n, d] of fractions) {
		css += simpleClass(
			`w-${n}/${d}`,
			"width",
			fractionPercent(n, d),
			breakpoints,
			states,
		);
	}
	css += complexClass("min-w-", "min-width", width, breakpoints, states);
	css += complexClass("max-w-", "max-width", width, breakpoints, states);

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
	css += complexClass("h-", "height", height, breakpoints, states);
	for (const [n, d] of fractions) {
		css += simpleClass(
			`h-${n}/${d}`,
			"height",
			fractionPercent(n, d),
			breakpoints,
			states,
		);
	}
	css += complexClass("min-h-", "min-height", height, breakpoints, states);
	css += complexClass("max-h-", "max-height", height, breakpoints, states);

	return css;
}
