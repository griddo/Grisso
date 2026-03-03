import { complexClass, customClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";

export default function borders(config: GrissoConfig): string {
	const { breakpoints, states, borderWidth, borderColors } = config;
	let css = "";

	// Variables locales (equivale a borders/vars.scss)
	const extendedColors: Record<string, string> = {
		...borderColors,
		inherit: "inherit",
		current: "currentColor",
		transparent: "transparent",
	};

	const borderStyle: Record<string, string> = {
		solid: "solid",
		dashed: "dashed",
		dotted: "dotted",
		double: "double",
		hidden: "hidden",
		none: "none",
	};

	// border-width
	css += complexClass(
		"border-",
		"border-width",
		borderWidth,
		breakpoints,
		states,
	);

	// border-{side}-width
	css += complexClass(
		"border-t-",
		"border-top-width",
		borderWidth,
		breakpoints,
		states,
	);
	css += complexClass(
		"border-r-",
		"border-right-width",
		borderWidth,
		breakpoints,
		states,
	);
	css += complexClass(
		"border-b-",
		"border-bottom-width",
		borderWidth,
		breakpoints,
		states,
	);
	css += complexClass(
		"border-l-",
		"border-left-width",
		borderWidth,
		breakpoints,
		states,
	);

	// border-color
	css += complexClass(
		"border-",
		"border-color",
		extendedColors,
		breakpoints,
		states,
	);

	// border-style
	css += complexClass(
		"border-",
		"border-style",
		borderStyle,
		breakpoints,
		states,
	);

	// divide-color
	for (const [key, value] of Object.entries(extendedColors)) {
		css += customClass(
			`divide-${key}`,
			{ "border-color": value },
			breakpoints,
			" > * + *",
			states,
		);
	}

	// divide-width
	for (const [key, value] of Object.entries(borderWidth)) {
		css += customClass(
			`divide-x-${key}`,
			{ "border-right-width": value, "border-left-width": value },
			breakpoints,
			" > * + *",
			states,
		);
		css += customClass(
			`divide-y-${key}`,
			{ "border-top-width": value, "border-bottom-width": value },
			breakpoints,
			" > * + *",
			states,
		);
	}
	css += customClass(
		"divide-x",
		{ "border-right-width": "0", "border-left-width": "1px" },
		breakpoints,
		" > * + *",
		states,
	);
	css += customClass(
		"divide-y",
		{ "border-top-width": "1px", "border-bottom-width": "0" },
		breakpoints,
		" > * + *",
		states,
	);

	// divide-style
	for (const [key, value] of Object.entries(borderStyle)) {
		css += customClass(
			`divide-${key}`,
			{ "border-style": value },
			breakpoints,
			" > * + *",
			states,
		);
	}

	// outline-color
	css += complexClass(
		"outline-",
		"outline-color",
		extendedColors,
		breakpoints,
		states,
	);

	// outline-width
	css += complexClass(
		"outline-",
		"outline-width",
		borderWidth,
		breakpoints,
		states,
	);

	// outline-style
	const outlineStyle: Record<string, string> = {
		outline: "solid",
		"outline-dashed": "dashed",
		"outline-dotted": "dotted",
		"outline-double": "double",
	};
	css += complexClass("", "outline-style", outlineStyle, breakpoints, states);
	css += customClass(
		"outline-none",
		{ outline: "2px solid transparent", "outline-offset": "2px" },
		breakpoints,
		undefined,
		states,
	);

	// outline-offset
	css += complexClass(
		"outline-offset-",
		"outline-offset",
		borderWidth,
		breakpoints,
		states,
	);

	return css;
}
