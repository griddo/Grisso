import { complexClass } from "../generators.js";
import type { GrissoConfig } from "../types.js";

export default function backgrounds(config: GrissoConfig): string {
	const { breakpoints, backgroundColors } = config;
	let css = "";

	// background-color
	css += complexClass("bg-", "background-color", backgroundColors, breakpoints);

	// background-attachment
	const bgAttachment: Record<string, string> = {
		fixed: "fixed",
		local: "local",
		scroll: "scroll",
	};
	css += complexClass(
		"bg-",
		"background-attachment",
		bgAttachment,
		breakpoints,
	);

	// background-clip
	const bgClip: Record<string, string> = {
		border: "border-box",
		padding: "padding-box",
		content: "content-box",
		text: "text",
	};
	css += complexClass("bg-clip-", "background-clip", bgClip, breakpoints);

	// background-origin
	const bgOrigin: Record<string, string> = {
		border: "border-box",
		padding: "padding-box",
		content: "content-box",
	};
	css += complexClass(
		"bg-origin-",
		"background-origin",
		bgOrigin,
		breakpoints,
	);

	// background-position
	const bgPosition: Record<string, string> = {
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
		"bg-",
		"background-position",
		bgPosition,
		breakpoints,
	);

	// background-repeat
	const bgRepeat: Record<string, string> = {
		repeat: "repeat",
		"no-repeat": "no-repeat",
		"repeat-x": "repeat-x",
		"repeat-y": "repeat-y",
		"repeat-round": "round",
		"repeat-space": "space",
	};
	css += complexClass("bg-", "background-repeat", bgRepeat, breakpoints);

	// background-size
	const bgSize: Record<string, string> = {
		auto: "auto",
		cover: "cover",
		contain: "contain",
		inherit: "inherit",
		initial: "initial",
		revert: "revert",
		unset: "unset",
	};
	css += complexClass("bg-", "background-size", bgSize, breakpoints);

	return css;
}
