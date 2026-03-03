import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import { generateCSS } from "../lib/index.js";
import postcssConfig from "../postcss.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parsear flags --config, --output, --content
function parseArgs() {
	const args = process.argv.slice(2);
	let configPath;
	let outputPath;
	const content = [];
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--config" && args[i + 1]) {
			configPath = args[++i];
		} else if (args[i] === "--output" && args[i + 1]) {
			outputPath = args[++i];
		} else if (args[i] === "--content" && args[i + 1]) {
			content.push(args[++i]);
		}
	}
	return { configPath, outputPath, content };
}

async function build() {
	const { configPath, outputPath, content } = parseArgs();
	const output = outputPath
		? path.resolve(outputPath)
		: path.resolve(__dirname, "../dist/grisso.css");

	let css;

	if (content.length > 0) {
		// Tree-shaking: usar el plugin con PurgeCSS
		console.log("Generating tree-shaken CSS...");
		const grissoPlugin = (await import("../plugin.js")).default;
		const plugin = grissoPlugin({ content, config: configPath });
		const result = await postcss([plugin]).process("", { from: undefined });
		css = result.css;
	} else {
		// Full build: generar todo + PostCSS pipeline
		console.log("Generating CSS...");
		const rawCSS = await generateCSS(configPath);
		console.log("Running PostCSS pipeline...");
		const result = await postcss(postcssConfig.plugins).process(rawCSS, {
			from: undefined,
		});
		css = result.css;
	}

	const dir = path.dirname(output);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	fs.writeFileSync(output, css);
	const kb = (Buffer.byteLength(css, "utf8") / 1024).toFixed(1);
	console.log(`Built ${path.relative(process.cwd(), output)} (${kb} KB)`);
}

build().catch((err) => {
	console.error(err);
	process.exit(1);
});
