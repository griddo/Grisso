import { complexClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";

export default function icons(config: GrissoConfig): string {
	const { breakpoints, iconColors } = config;
	return complexClass("icon-", "color", iconColors, breakpoints);
}
