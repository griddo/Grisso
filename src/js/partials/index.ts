import type { PartialFn } from "../types.js";
import backgrounds from "./backgrounds.js";
import borders from "./borders.js";
import effects from "./effects.js";
import flexAndGrid from "./flex-and-grid.js";
import icons from "./icons.js";
import layout from "./layout.js";
import sizing from "./sizing.js";
import spacingPartial from "./spacing.js";
import typography from "./typography.js";

/**
 * Registry de partials en el orden de importación de grisso.scss.
 * El orden determina la cascada CSS.
 */
const partials: PartialFn[] = [
	layout,
	flexAndGrid,
	spacingPartial,
	sizing,
	backgrounds,
	borders,
	typography,
	effects,
	icons,
];

export default partials;
