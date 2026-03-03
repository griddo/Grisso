import { complexClass, customClass, simpleClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";
import { omit } from "../utils.js";

export default function typography(config: GrissoConfig): string {
	const { breakpoints, states, foregroundColors, spacing } = config;
	let css = "";

	// text-color
	css += complexClass("text-", "color", foregroundColors, breakpoints, states);

	// text-align
	const textAlign: Record<string, string> = {
		left: "left",
		center: "center",
		right: "right",
		justify: "justify",
		start: "start",
		end: "end",
	};
	css += complexClass("text-", "text-align", textAlign, breakpoints, states);

	// text-transform
	const textTransform: Record<string, string> = {
		uppercase: "uppercase",
		lowercase: "lowercase",
		capitalize: "capitalize",
		"normal-case": "none",
	};
	css += complexClass("", "text-transform", textTransform, breakpoints, states);

	// text-overflow
	const textOverflow: Record<string, string> = {
		ellipsis: "ellipsis",
		clip: "clip",
	};
	css += complexClass(
		"text-",
		"text-overflow",
		textOverflow,
		breakpoints,
		states,
	);
	css += customClass(
		"truncate",
		{
			overflow: "hidden",
			"text-overflow": "ellipsis",
			"white-space": "nowrap",
		},
		breakpoints,
		undefined,
		states,
	);

	// vertical-align
	const verticalAlign: Record<string, string> = {
		baseline: "baseline",
		top: "top",
		middle: "middle",
		bottom: "bottom",
		"text-top": "text-top",
		"text-bottom": "text-bottom",
		sub: "sub",
		super: "super",
	};
	css += complexClass(
		"align-",
		"vertical-align",
		verticalAlign,
		breakpoints,
		states,
	);

	// white-space
	const whiteSpace: Record<string, string> = {
		normal: "normal",
		nowrap: "nowrap",
		pre: "pre",
		"pre-line": "pre-line",
		"pre-wrap": "pre-wrap",
		"break-spaces": "break-spaces",
	};
	css += complexClass(
		"whitespace-",
		"white-space",
		whiteSpace,
		breakpoints,
		states,
	);

	// word-break
	const wordBreak: Record<string, string> = {
		all: "break-all",
		keep: "keep-all",
	};
	css += complexClass("break-", "word-break", wordBreak, breakpoints, states);
	css += simpleClass(
		"break-words",
		"overflow-wrap",
		"break-word",
		breakpoints,
		states,
	);
	css += customClass(
		"break-normal",
		{ "overflow-wrap": "normal", "word-break": "normal" },
		breakpoints,
		undefined,
		states,
	);

	// font-smoothing
	css += customClass(
		"antialiased",
		{
			"-webkit-font-smoothing": "antialiased",
			"-moz-osx-font-smoothing": "grayscale",
		},
		breakpoints,
		undefined,
		states,
	);
	css += customClass(
		"subpixel-antialiased",
		{
			"-webkit-font-smoothing": "auto",
			"-moz-osx-font-smoothing": "auto",
		},
		breakpoints,
		undefined,
		states,
	);

	// font-style
	const fontStyle: Record<string, string> = {
		italic: "italic",
		"not-italic": "normal",
	};
	css += complexClass("", "font-style", fontStyle, breakpoints, states);

	// font-weight
	const fontWeight: Record<string, string> = {
		thin: "100",
		extralight: "200",
		light: "300",
		normal: "400",
		medium: "500",
		semibold: "600",
		bold: "700",
		extrabold: "800",
		black: "900",
	};
	css += complexClass("font-", "font-weight", fontWeight, breakpoints, states);

	// letter-spacing
	const letterSpacing: Record<string, string> = {
		tighter: "-0.05em",
		tight: "-0.025em",
		normal: "0em",
		wide: "0.025em",
		wider: "0.05em",
		widest: "0.1em",
	};
	css += complexClass(
		"tracking-",
		"letter-spacing",
		letterSpacing,
		breakpoints,
		states,
	);

	// line-height
	const lineHeight = omit(spacing, "auto", "zero");
	const extendedLineHeight: Record<string, string> = {
		...lineHeight,
		none: "1",
		tight: "1.25",
		snug: "1.375",
		normal: "1.5",
		relaxed: "1.625",
		loose: "2",
	};
	css += complexClass(
		"leading-",
		"line-height",
		extendedLineHeight,
		breakpoints,
		states,
	);

	return css;
}
