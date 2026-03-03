import { complexClass, customClass, simpleClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";

export default function layout(config: GrissoConfig): string {
	const { columns, breakpoints, states, spacing } = config;
	let css = "";

	// display
	const display: Record<string, string> = {
		block: "block",
		inline: "inline",
		"inline-block": "inline-block",
		flex: "flex",
		"inline-flex": "inline-flex",
		grid: "grid",
		"inline-grid": "inline-grid",
		"inline-table": "inline-table",
		table: "table",
		"table-row": "table-row",
		"table-caption": "table-caption",
		"table-cell": "table-cell",
		"table-column": "table-column",
		"table-column-group": "table-column-group",
		"table-footer-group": "table-footer-group",
		"table-header-group": "table-header-group",
		"table-row-group": "table-row-group",
		contents: "contents",
		"flow-root": "flow-root",
		"list-item": "list-item",
		hidden: "none",
	};
	css += complexClass("", "display", display, breakpoints, states);

	// columns (numeric)
	for (let i = 1; i <= columns; i++) {
		css += simpleClass(
			`columns-${i}`,
			"columns",
			String(i),
			breakpoints,
			states,
		);
	}

	// float
	const float: Record<string, string> = {
		left: "left",
		right: "right",
		none: "none",
	};
	css += complexClass("float-", "float", float, breakpoints, states);

	// clear
	const clear: Record<string, string> = {
		left: "left",
		right: "right",
		both: "both",
		none: "none",
	};
	css += complexClass("clear-", "clear", clear, breakpoints, states);

	// object-fit
	const objectFit: Record<string, string> = {
		contain: "contain",
		cover: "cover",
		fill: "fill",
		none: "none",
		"scale-down": "scale-down",
	};
	css += complexClass("object-", "object-fit", objectFit, breakpoints, states);

	// object-position
	const objectPosition: Record<string, string> = {
		bottom: "bottom",
		center: "center",
		left: "left",
		"left-bottom": "left bottom",
		"left-top": "left top",
		right: "right",
		"right-bottom": "right bottom",
		"right-top": "right top",
		top: "top",
	};
	css += complexClass(
		"object-",
		"object-position",
		objectPosition,
		breakpoints,
		states,
	);

	// overflow
	const overflow: Record<string, string> = {
		auto: "auto",
		hidden: "hidden",
		clip: "clip",
		visible: "visible",
		scroll: "scroll",
	};
	css += complexClass("overflow-", "overflow", overflow, breakpoints, states);
	css += complexClass(
		"overflow-x-",
		"overflow-x",
		overflow,
		breakpoints,
		states,
	);
	css += complexClass(
		"overflow-y-",
		"overflow-y",
		overflow,
		breakpoints,
		states,
	);

	// position
	const position: Record<string, string> = {
		static: "static",
		fixed: "fixed",
		absolute: "absolute",
		relative: "relative",
		sticky: "sticky",
	};
	css += complexClass("", "position", position, breakpoints, states);

	// visibility
	css += simpleClass("visible", "visibility", "visible", breakpoints, states);
	css += simpleClass("invisible", "visibility", "hidden", breakpoints, states);
	css += simpleClass("collapse", "visibility", "collapse", breakpoints, states);

	// z-index
	const zIndex: Record<string, string> = {
		auto: "auto",
		"0": "0",
		"10": "10",
		"20": "20",
		"30": "30",
		"40": "40",
		"50": "50",
	};
	const zIndexNeg: Record<string, string> = {
		"10": "-10",
		"20": "-20",
		"30": "-30",
		"40": "-40",
		"50": "-50",
	};
	css += complexClass("z-", "z-index", zIndex, breakpoints, states);
	css += complexClass("-z-", "z-index", zIndexNeg, breakpoints, states);

	// top/right/bottom/left
	css += complexClass("top-", "top", spacing, breakpoints, states);
	css += complexClass("right-", "right", spacing, breakpoints, states);
	css += complexClass("bottom-", "bottom", spacing, breakpoints, states);
	css += complexClass("left-", "left", spacing, breakpoints, states);

	// inset (top + right + bottom + left)
	css += complexClass("inset-", "inset", spacing, breakpoints, states);

	// inset-x (left + right)
	for (const [key, value] of Object.entries(spacing)) {
		css += customClass(
			`inset-x-${key}`,
			{ left: value, right: value },
			breakpoints,
			undefined,
			states,
		);
	}

	// inset-y (top + bottom)
	for (const [key, value] of Object.entries(spacing)) {
		css += customClass(
			`inset-y-${key}`,
			{ top: value, bottom: value },
			breakpoints,
			undefined,
			states,
		);
	}

	return css;
}
