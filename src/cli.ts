#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Lee la versión desde package.json */
function getVersion(): string {
	const pkg = JSON.parse(
		fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8"),
	);
	return pkg.version;
}

/** Texto de ayuda general */
function printHelp(): void {
	const version = getVersion();
	console.log(`grisso v${version} — Griddo CSS utility class library

Uso:
  grisso <comando> [opciones]

Comandos:
  build     Genera CSS de utilidades
  tokens    Genera scaffold de tokens (custom properties)

Opciones globales:
  --help, -h      Muestra esta ayuda
  --version, -v   Muestra la versión`);
}

/** Texto de ayuda del comando build */
function printBuildHelp(): void {
	console.log(`grisso build — Genera CSS de utilidades

Uso:
  grisso build [opciones]

Opciones:
  --config <ruta>     Ruta a grisso.config.mjs
  --content <glob>    Globs para tree-shaking (repetible)
  --safelist <regex>  Patrones de clases a preservar (repetible)
  --output <ruta>     Archivo de salida (sin --output → stdout)
  --no-minify         Deshabilitar minificación
  --help, -h          Muestra esta ayuda

Ejemplos:
  grisso build                                          # CSS completo a stdout
  grisso build --output dist/grisso.css                 # Escribir a archivo
  grisso build --content "src/**/*.tsx" --output out.css # Tree-shaking
  grisso build --safelist "^p-" --safelist "^m-"        # Proteger clases
  grisso build --no-minify                              # Sin minificar`);
}

/** Comando build: genera CSS */
async function runBuild(argv: string[]): Promise<void> {
	const { values } = parseArgs({
		args: argv,
		options: {
			config: { type: "string" },
			content: { type: "string", multiple: true },
			safelist: { type: "string", multiple: true },
			output: { type: "string" },
			minify: { type: "boolean", default: true },
			help: { type: "boolean", short: "h", default: false },
		},
		strict: true,
		allowNegative: true,
	});

	if (values.help) {
		printBuildHelp();
		return;
	}

	// Import dinámico para que --help sea instantáneo
	const { buildCSS } = await import("./build.js");

	const content =
		values.content && values.content.length > 0 ? values.content : undefined;
	const safelist =
		values.safelist && values.safelist.length > 0 ? values.safelist : undefined;

	if (values.output) {
		const label = content
			? "Generando CSS con tree-shaking..."
			: "Generando CSS...";
		console.error(label);
	}

	const css = await buildCSS({
		config: values.config,
		content,
		minify: values.minify,
		safelist,
	});

	if (values.output) {
		const outputPath = path.resolve(values.output);
		const dir = path.dirname(outputPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(outputPath, css);
		const kb = (Buffer.byteLength(css, "utf8") / 1024).toFixed(1);
		console.error(
			`Generado ${path.relative(process.cwd(), outputPath)} (${kb} KB)`,
		);
	} else {
		process.stdout.write(css);
	}
}

/** Texto de ayuda del comando tokens */
function printTokensHelp(): void {
	console.log(`grisso tokens — Genera scaffold de tokens (custom properties)

Uso:
  grisso tokens [opciones]

Opciones:
  --config <ruta>     Ruta a grisso.config.mjs
  --format <fmt>      Formato de salida: css (default) o json
  --output <ruta>     Archivo de salida (sin --output → stdout)
  --help, -h          Muestra esta ayuda

Ejemplos:
  grisso tokens                                        # Scaffold CSS a stdout
  grisso tokens --output tokens.css                    # Escribir a archivo
  grisso tokens --config grisso.config.mjs             # Usa config custom
  grisso tokens --format json                          # Config como JSON`);
}

/** Comando tokens: genera scaffold de tokens */
async function runTokens(argv: string[]): Promise<void> {
	const { values } = parseArgs({
		args: argv,
		options: {
			config: { type: "string" },
			format: { type: "string" },
			output: { type: "string" },
			help: { type: "boolean", short: "h", default: false },
		},
		strict: true,
	});

	if (values.help) {
		printTokensHelp();
		return;
	}

	const format = values.format as "css" | "json" | undefined;
	if (format && format !== "css" && format !== "json") {
		console.error(`Formato no soportado: ${format} (usa "css" o "json")`);
		process.exit(1);
	}

	// Import dinámico para que --help sea instantáneo
	const { extractTokens } = await import("./tokens.js");

	const output = await extractTokens({ config: values.config, format });

	if (values.output) {
		const outputPath = path.resolve(values.output);
		const dir = path.dirname(outputPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(outputPath, output);
		const kb = (Buffer.byteLength(output, "utf8") / 1024).toFixed(1);
		console.error(
			`Generado ${path.relative(process.cwd(), outputPath)} (${kb} KB)`,
		);
	} else {
		process.stdout.write(output);
	}
}

/** Punto de entrada */
async function main(): Promise<void> {
	const { values, positionals } = parseArgs({
		args: process.argv.slice(2),
		options: {
			help: { type: "boolean", short: "h", default: false },
			version: { type: "boolean", short: "v", default: false },
		},
		strict: false,
		allowPositionals: true,
	});

	if (values.version) {
		console.log(getVersion());
		return;
	}

	const command = positionals[0];

	if (values.help && !command) {
		printHelp();
		return;
	}

	if (!command) {
		printHelp();
		process.exit(1);
	}

	switch (command) {
		case "build":
			// Pasar solo los args después del comando
			await runBuild(process.argv.slice(3));
			break;
		case "tokens":
			await runTokens(process.argv.slice(3));
			break;
		default:
			console.error(`Comando desconocido: ${command}`);
			printHelp();
			process.exit(1);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
