import { simpleClass, complexClass, customClass } from "../generators.js";
import { omit } from "../utils.js";
import type { GrissoConfig } from "../types.js";

export default function typography(config: GrissoConfig): string {
	const { breakpoints, foregroundColors, spacing } = config;
	let css = "";

	// text-color
	css += complexClass("text-", "color", foregroundColors, breakpoints);

	// text-align
	const textAlign: Record<string, string> = {
		left: "left",
		center: "center",
		right: "right",
		justify: "justify",
		start: "start",
		end: "end",
	};
	css += complexClass("text-", "text-align", textAlign, breakpoints);

	// text-transform
	const textTransform: Record<string, string> = {
		uppercase: "uppercase",
		lowercase: "lowercase",
		capitalize: "capitalize",
		"normal-case": "none",
	};
	css += complexClass("", "text-transform", textTransform, breakpoints);

	// text-overflow
	const textOverflow: Record<string, string> = {
		ellipsis: "ellipsis",
		clip: "clip",
	};
	css += complexClass("text-", "text-overflow", textOverflow, breakpoints);
	css += customClass(
		"truncate",
		{
			overflow: "hidden",
			"text-overflow": "ellipsis",
			"white-space": "nowrap",
		},
		breakpoints,
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
	css += complexClass("whitespace-", "white-space", whiteSpace, breakpoints);

	// word-break
	const wordBreak: Record<string, string> = {
		all: "break-all",
		keep: "keep-all",
	};
	css += complexClass("break-", "word-break", wordBreak, breakpoints);
	css += simpleClass("break-words", "overflow-wrap", "break-word", breakpoints);
	css += customClass(
		"break-normal",
		{ "overflow-wrap": "normal", "word-break": "normal" },
		breakpoints,
	);

	// font-smoothing
	css += customClass(
		"antialiased",
		{
			"-webkit-font-smoothing": "antialiased",
			"-moz-osx-font-smoothing": "grayscale",
		},
		breakpoints,
	);
	css += customClass(
		"subpixel-antialiased",
		{
			"-webkit-font-smoothing": "auto",
			"-moz-osx-font-smoothing": "auto",
		},
		breakpoints,
	);

	// font-style
	const fontStyle: Record<string, string> = {
		italic: "italic",
		"not-italic": "normal",
	};
	css += complexClass("", "font-style", fontStyle, breakpoints);

	// font-weight
	const fontWeight: Record<string, string> = {
		thin: "100",
		extralight: "200",
		light: "200",
		normal: "400",
		medium: "500",
		semibold: "600",
		bold: "700",
		extrabold: "800",
		black: "900",
	};
	css += complexClass("font-", "font-weight", fontWeight, breakpoints);

	// letter-spacing
	const letterSpacing = omit(spacing, "auto");
	css += complexClass(
		"tracking-",
		"letter-spacing",
		letterSpacing,
		breakpoints,
	);

	// line-height
	const lineHeight = omit(spacing, "auto", "zero");
	const extendedLineHeight: Record<string, string> = {
		...lineHeight,
		none: "1",
		tight: "1.25",
		snug: "1.3755",
		normal: "1.5",
		relaxed: "1.625",
		loose: "2",
	};
	css += complexClass(
		"leading-",
		"line-height",
		extendedLineHeight,
		breakpoints,
	);

	return css;
}
