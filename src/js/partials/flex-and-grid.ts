import { complexClass, simpleClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";
import { omit } from "../utils.js";

export default function flexAndGrid(config: GrissoConfig): string {
	const { columns, breakpoints, spacing } = config;
	let css = "";

	// flex-direction
	const direction: Record<string, string> = {
		row: "row",
		"row-reverse": "row-reverse",
		col: "column",
		"col-reverse": "column-reverse",
	};
	css += complexClass("flex-", "flex-direction", direction, breakpoints);

	// flex-wrap
	const wrap: Record<string, string> = {
		wrap: "wrap",
		"wrap-reverse": "wrap-reverse",
		nowrap: "nowrap",
	};
	css += complexClass("flex-", "flex-wrap", wrap, breakpoints);

	// flex (shorthand)
	const flex: Record<string, string> = {
		"1": "1 1 0",
		auto: "1 1 auto",
		initial: "0 1 auto",
		none: "none",
	};
	css += complexClass("flex-", "flex", flex, breakpoints);

	// flex-grow
	css += simpleClass("grow", "flex-grow", "1", breakpoints);
	css += simpleClass("grow-0", "flex-grow", "0", breakpoints);

	// flex-shrink
	css += simpleClass("shrink", "flex-shrink", "1", breakpoints);
	css += simpleClass("shrink-0", "flex-shrink", "0", breakpoints);

	// order
	for (let i = 1; i <= columns; i++) {
		css += simpleClass(`order-${i}`, "order", String(i), breakpoints);
	}
	css += simpleClass("order-first", "order", "-9999", breakpoints);
	css += simpleClass("order-last", "order", "9999", breakpoints);
	css += simpleClass("order-none", "order", "0", breakpoints);

	// justify-items
	const justifyItems: Record<string, string> = {
		start: "start",
		end: "end",
		center: "center",
		stretch: "stretch",
	};
	css += complexClass(
		"justify-items-",
		"justify-items",
		justifyItems,
		breakpoints,
	);

	// justify-content
	const justifyContent: Record<string, string> = {
		normal: "normal",
		start: "flex-start",
		end: "flex-end",
		center: "center",
		between: "space-between",
		around: "space-around",
		evenly: "space-evenly",
		stretch: "stretch",
	};
	css += complexClass(
		"justify-",
		"justify-content",
		justifyContent,
		breakpoints,
	);

	// align-items
	const alignItems: Record<string, string> = {
		start: "flex-start",
		end: "flex-end",
		center: "center",
		baseline: "baseline",
		stretch: "stretch",
	};
	css += complexClass("items-", "align-items", alignItems, breakpoints);

	// align-content
	const alignContent: Record<string, string> = {
		normal: "normal",
		center: "center",
		start: "flex-start",
		end: "flex-end",
		between: "space-between",
		around: "space-around",
		evenly: "space-evenly",
		baseline: "baseline",
		stretch: "stretch",
	};
	css += complexClass("content-", "align-content", alignContent, breakpoints);

	// align-self
	const alignSelf: Record<string, string> = {
		auto: "normal",
		start: "flex-start",
		end: "flex-end",
		center: "center",
		baseline: "baseline",
		stretch: "stretch",
	};
	css += complexClass("self-", "align-self", alignSelf, breakpoints);

	// justify-self
	const justifySelf: Record<string, string> = {
		auto: "auto",
		start: "start",
		end: "end",
		center: "center",
		stretch: "stretch",
	};
	css += complexClass(
		"justify-self-",
		"justify-self",
		justifySelf,
		breakpoints,
	);

	// grid-template-columns
	for (let i = 1; i <= columns; i++) {
		css += simpleClass(
			`grid-cols-${i}`,
			"grid-template-columns",
			`repeat(${i}, minmax(0, 1fr))`,
			breakpoints,
		);
	}
	css += simpleClass(
		"grid-cols-none",
		"grid-template-columns",
		"none",
		breakpoints,
	);

	// grid-column start/end
	css += simpleClass("col-auto", "grid-column", "auto", breakpoints);
	for (let i = 1; i <= columns; i++) {
		css += simpleClass(
			`col-span-${i}`,
			"grid-column",
			`span ${i} / span ${i}`,
			breakpoints,
		);
		css += simpleClass(
			`col-start-${i}`,
			"grid-column-start",
			String(i),
			breakpoints,
		);
		css += simpleClass(
			`col-end-${i}`,
			"grid-column-end",
			String(i),
			breakpoints,
		);
	}
	css += simpleClass("col-end-13", "grid-column-end", "13", breakpoints);
	css += simpleClass("col-span-full", "grid-column", "1 / -1", breakpoints);
	css += simpleClass(
		"col-start-auto",
		"grid-column-start",
		"auto",
		breakpoints,
	);
	css += simpleClass("col-end-auto", "grid-column-end", "auto", breakpoints);

	// grid-template-rows
	for (let i = 1; i <= columns; i++) {
		css += simpleClass(
			`grid-rows-${i}`,
			"grid-template-rows",
			`repeat(${i}, minmax(0, 1fr))`,
			breakpoints,
		);
	}
	css += simpleClass(
		"grid-rows-none",
		"grid-template-rows",
		"none",
		breakpoints,
	);

	// grid-row start/end
	css += simpleClass("row-auto", "grid-row", "auto", breakpoints);
	for (let i = 1; i <= columns; i++) {
		css += simpleClass(
			`row-span-${i}`,
			"grid-row",
			`span ${i} / span ${i}`,
			breakpoints,
		);
		css += simpleClass(
			`row-start-${i}`,
			"grid-row-start",
			String(i),
			breakpoints,
		);
		css += simpleClass(`row-end-${i}`, "grid-row-end", String(i), breakpoints);
	}
	css += simpleClass("row-span-full", "grid-row", "1 / -1", breakpoints);
	css += simpleClass("row-start-auto", "grid-row-start", "auto", breakpoints);
	css += simpleClass("row-end-auto", "grid-row-end", "auto", breakpoints);

	// grid-auto-flow
	const autoFlow: Record<string, string> = {
		row: "row",
		col: "column",
		dense: "dense",
		"row-dense": "row dense",
		"col-dense": "column dense",
	};
	css += complexClass("grid-flow-", "grid-auto-flow", autoFlow, breakpoints);

	// grid-auto-columns
	const autoColumns: Record<string, string> = {
		auto: "auto",
		min: "min-content",
		max: "max-content",
		fr: "minmax(0, 1fr)",
	};
	css += complexClass(
		"auto-cols-",
		"grid-auto-columns",
		autoColumns,
		breakpoints,
	);

	// grid-auto-rows
	const autoRows: Record<string, string> = {
		auto: "auto",
		min: "min-content",
		max: "max-content",
		fr: "minmax(0, 1fr)",
	};
	css += complexClass("auto-rows-", "grid-auto-rows", autoRows, breakpoints);

	// gap
	const gap = omit(spacing, "auto");
	css += complexClass("gap-", "gap", gap, breakpoints);
	css += complexClass("gap-x-", "column-gap", gap, breakpoints);
	css += complexClass("gap-y-", "row-gap", gap, breakpoints);

	// place-content
	const placeContent: Record<string, string> = {
		center: "center",
		start: "start",
		end: "end",
		between: "space-between",
		around: "space-around",
		evenly: "space-evenly",
		baseline: "baseline",
		stretch: "stretch",
	};
	css += complexClass(
		"place-content-",
		"place-content",
		placeContent,
		breakpoints,
	);

	// place-items
	const placeItems: Record<string, string> = {
		start: "start",
		end: "end",
		center: "center",
		baseline: "baseline",
		stretch: "stretch",
	};
	css += complexClass("place-items-", "place-items", placeItems, breakpoints);

	// place-self
	const placeSelf: Record<string, string> = {
		auto: "auto",
		start: "start",
		end: "end",
		center: "center",
		stretch: "stretch",
	};
	css += complexClass("place-self-", "place-self", placeSelf, breakpoints);

	return css;
}
