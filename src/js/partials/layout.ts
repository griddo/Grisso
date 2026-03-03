import { simpleClass, complexClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";

export default function layout(config: GrissoConfig): string {
	const { columns, breakpoints, spacing } = config;
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
	css += complexClass("", "display", display, breakpoints);

	// columns (numeric)
	for (let i = 1; i <= columns; i++) {
		css += simpleClass(`columns-${i}`, "columns", String(i), breakpoints);
	}
	// columns (spacing tokens)
	css += complexClass("columns-", "columns", spacing, breakpoints);

	// float
	const float: Record<string, string> = {
		left: "left",
		right: "right",
		none: "none",
	};
	css += complexClass("float-", "float", float, breakpoints);

	// clear
	const clear: Record<string, string> = {
		left: "left",
		right: "right",
		both: "both",
		none: "none",
	};
	css += complexClass("clear-", "clear", clear, breakpoints);

	// object-fit
	const objectFit: Record<string, string> = {
		contain: "contain",
		cover: "cover",
		fill: "fill",
		none: "none",
		"scale-down": "scale-down",
	};
	css += complexClass("object-", "object-fit", objectFit, breakpoints);

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
	css += complexClass("object-", "object-position", objectPosition, breakpoints);

	// overflow
	const overflow: Record<string, string> = {
		auto: "auto",
		hidden: "hidden",
		clip: "clip",
		visible: "visible",
		scroll: "scroll",
	};
	css += complexClass("overflow-", "overflow", overflow, breakpoints);
	css += complexClass("overflow-x-", "overflow-x", overflow, breakpoints);
	css += complexClass("overflow-y-", "overflow-y", overflow, breakpoints);

	// position
	const position: Record<string, string> = {
		static: "static",
		fixed: "fixed",
		absolute: "absolute",
		relative: "relative",
		sticky: "sticky",
	};
	css += complexClass("", "position", position, breakpoints);

	// visibility
	css += simpleClass("visible", "visibility", "visible", breakpoints);
	css += simpleClass("invisible", "visibility", "hidden", breakpoints);
	css += simpleClass("collapse", "visibility", "collapse", breakpoints);

	// z-index
	const zIndex: Record<string, string> = {
		auto: "auto",
		"0": "0",
		"1": "10",
		"20": "20",
		"30": "30",
		"40": "40",
		"50": "50",
	};
	const zIndexNeg: Record<string, string> = {
		"1": "-10",
		"20": "-20",
		"30": "-30",
		"40": "-40",
		"50": "-50",
	};
	css += complexClass("z-", "z-index", zIndex, breakpoints);
	css += complexClass("-z-", "z-index", zIndexNeg, breakpoints);

	// top/right/bottom/left
	css += simpleClass("top-0", "top", "0", breakpoints);
	css += simpleClass("right-0", "right", "0", breakpoints);
	css += simpleClass("bottom-0", "bottom", "0", breakpoints);
	css += simpleClass("left-0", "left", "0", breakpoints);
	css += complexClass("top-", "top", spacing, breakpoints);
	css += complexClass("right-", "right", spacing, breakpoints);
	css += complexClass("bottom-", "bottom", spacing, breakpoints);
	css += complexClass("left-", "left", spacing, breakpoints);

	return css;
}
