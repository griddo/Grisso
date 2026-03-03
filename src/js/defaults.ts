import type { GrissoConfig } from "./types.js";

/**
 * Configuración por defecto de Grisso.
 * Equivale a grisso.config.scss.
 */
const defaults: GrissoConfig = {
	columns: 12,

	breakpoints: {
		tablet: "(min-width: 700px)",
		desktop: "(min-width: 1024px)",
		ultrawide: "(min-width: 1680px)",
	},

	spacing: {
		auto: "auto",
		zero: "0",
		"0": "0",
		"4xs": "var(--spc-4xs)",
		"3xs": "var(--spc-3xs)",
		"2xs": "var(--spc-2xs)",
		xs: "var(--spc-xs)",
		sm: "var(--spc-sm)",
		md: "var(--spc-md)",
		lg: "var(--spc-lg)",
		xl: "var(--spc-xl)",
		"2xl": "var(--spc-2xl)",
		"3xl": "var(--spc-3xl)",
		"4xl": "var(--spc-4xl)",
		"5xl": "var(--spc-5xl)",
	},

	brandColors: {
		"1": "var(--brand-1)",
		"2": "var(--brand-2)",
		"3": "var(--brand-3)",
	},

	foregroundColors: {
		"1": "var(--text-1)",
		"2": "var(--text-2)",
		"3": "var(--text-3)",
		"4": "var(--text-4)",
	},

	iconColors: {
		"1": "var(--icon-1)",
		"2": "var(--icon-2)",
		"3": "var(--icon-3)",
		"4": "var(--icon-4)",
		disabled: "var(--icon-disabled)",
	},

	supportColors: {
		success: "var(--success)",
		error: "var(--error)",
		warning: "var(--warning)",
	},

	backgroundColors: {
		ui: "var(--bg-ui)",
		"1": "var(--bg-1)",
		"2": "var(--bg-2)",
		"3": "var(--bg-3)",
		"4": "var(--bg-4)",
		"5": "var(--bg-5)",
		disabled: "var(--bg-disabled)",
	},

	overlayColors: {
		"1": "var(--overlay-1)",
		"2": "var(--overlay-2)",
		"3": "var(--overlay-3)",
		"4": "var(--overlay-4)",
	},

	borderWidth: {
		none: "var(--border-width-none)",
		xs: "var(--border-width-xs)",
		sm: "var(--border-width-sm)",
		md: "var(--border-width-md)",
		lg: "var(--border-width-lg)",
	},

	opacity: {
		"0": "0",
		"1": "var(--opacity-1)",
		"2": "var(--opacity-2)",
		"3": "var(--opacity-3)",
		"4": "var(--opacity-4)",
		"5": "var(--opacity-5)",
		"6": "var(--opacity-6)",
	},

	shadows: {
		sm: "var(--box-shadow-sm)",
		md: "var(--box-shadow-md)",
		lg: "var(--box-shadow-lg)",
		xl: "var(--box-shadow-xl)",
	},

	borderColors: {
		"1": "var(--border-1)",
		"2": "var(--border-2)",
		"3": "var(--border-3)",
		"4": "var(--border-4)",
		disabled: "var(--border-disabled)",
	},
};

export default defaults;
