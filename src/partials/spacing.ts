import { complexClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";
import { omit } from "../utils.js";

export default function spacingPartial(config: GrissoConfig): string {
	const { breakpoints, states, spacing } = config;
	let css = "";

	// margin (incluye "auto")
	css += complexClass("m-", "margin", spacing, breakpoints, states);
	css += complexClass("mt-", "margin-top", spacing, breakpoints, states);
	css += complexClass("mr-", "margin-right", spacing, breakpoints, states);
	css += complexClass("mb-", "margin-bottom", spacing, breakpoints, states);
	css += complexClass("ml-", "margin-left", spacing, breakpoints, states);
	css += complexClass("mx-", "margin-inline", spacing, breakpoints, states);
	css += complexClass("my-", "margin-block", spacing, breakpoints, states);

	// padding (sin "auto")
	const padding = omit(spacing, "auto");
	css += complexClass("p-", "padding", padding, breakpoints, states);
	css += complexClass("pt-", "padding-top", padding, breakpoints, states);
	css += complexClass("pr-", "padding-right", padding, breakpoints, states);
	css += complexClass("pb-", "padding-bottom", padding, breakpoints, states);
	css += complexClass("pl-", "padding-left", padding, breakpoints, states);
	css += complexClass("px-", "padding-inline", padding, breakpoints, states);
	css += complexClass("py-", "padding-block", padding, breakpoints, states);

	return css;
}
