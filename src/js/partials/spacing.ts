import { complexClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";
import { omit } from "../utils.js";

export default function spacingPartial(config: GrissoConfig): string {
	const { breakpoints, spacing } = config;
	let css = "";

	// margin (incluye "auto")
	css += complexClass("m-", "margin", spacing, breakpoints);
	css += complexClass("mt-", "margin-top", spacing, breakpoints);
	css += complexClass("mr-", "margin-right", spacing, breakpoints);
	css += complexClass("mb-", "margin-bottom", spacing, breakpoints);
	css += complexClass("ml-", "margin-left", spacing, breakpoints);
	css += complexClass("mx-", "margin-inline", spacing, breakpoints);
	css += complexClass("my-", "margin-block", spacing, breakpoints);

	// padding (sin "auto")
	const padding = omit(spacing, "auto");
	css += complexClass("p-", "padding", padding, breakpoints);
	css += complexClass("pt-", "padding-top", padding, breakpoints);
	css += complexClass("pr-", "padding-right", padding, breakpoints);
	css += complexClass("pb-", "padding-bottom", padding, breakpoints);
	css += complexClass("pl-", "padding-left", padding, breakpoints);
	css += complexClass("px-", "padding-inline", padding, breakpoints);
	css += complexClass("py-", "padding-block", padding, breakpoints);

	return css;
}
