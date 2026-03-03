import { complexClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";

export default function effects(config: GrissoConfig): string {
	const { breakpoints, opacity, shadows, overlayColors } = config;
	let css = "";

	// opacity
	css += complexClass("opacity-", "opacity", opacity, breakpoints);

	// box-shadow
	const extendedShadows: Record<string, string> = {
		...shadows,
		inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
		none: "0 0 #0000",
	};
	css += complexClass("shadow-", "box-shadow", extendedShadows, breakpoints);

	// overlay (background-color)
	css += complexClass(
		"overlay-",
		"background-color",
		overlayColors,
		breakpoints,
	);

	return css;
}
