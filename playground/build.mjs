/**
 * Procesa playground/example.module.css con el plugin grisso-apply.
 * Genera playground/example.processed.css con las clases inlineadas.
 */
import { readFileSync, writeFileSync } from "node:fs";
import postcss from "postcss";
import grissoApply from "../lib/postcss.js";

const input = readFileSync("playground/example.module.css", "utf8");
const result = await postcss([
	grissoApply({ config: "playground/grisso.config.mjs" }),
]).process(input, { from: "playground/example.module.css" });

for (const warning of result.warnings()) {
	console.warn("⚠", warning.text);
}

writeFileSync("playground/example.processed.css", result.css);
console.log("✓ playground/example.processed.css");
