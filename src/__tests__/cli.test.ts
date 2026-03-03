import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.resolve(__dirname, "../../lib/cli.js");
const sampleHTML = path.join(__dirname, "__fixtures__/sample.html");

/** Ejecuta el CLI y devuelve stdout, stderr y código de salida */
async function run(
	args: string[],
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
	try {
		const { stdout, stderr } = await execFileAsync("node", [CLI, ...args]);
		return { stdout, stderr, exitCode: 0 };
	} catch (err: unknown) {
		const e = err as { stdout: string; stderr: string; code: number };
		return { stdout: e.stdout ?? "", stderr: e.stderr ?? "", exitCode: e.code };
	}
}

// Archivos temporales creados por los tests
const tmpFiles: string[] = [];

function tmpOutput(): string {
	const p = path.join(
		os.tmpdir(),
		`grisso-test-${Date.now()}-${Math.random().toString(36).slice(2)}.css`,
	);
	tmpFiles.push(p);
	return p;
}

afterEach(() => {
	for (const f of tmpFiles) {
		try {
			fs.unlinkSync(f);
		} catch {}
	}
	tmpFiles.length = 0;
});

describe("CLI", () => {
	it("--version imprime la versión y exit 0", async () => {
		const { stdout, exitCode } = await run(["--version"]);
		expect(exitCode).toBe(0);
		expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
	});

	it("--help imprime ayuda y exit 0", async () => {
		const { stdout, exitCode } = await run(["--help"]);
		expect(exitCode).toBe(0);
		expect(stdout).toContain("grisso");
		expect(stdout).toContain("build");
	});

	it("sin argumentos imprime ayuda y exit 1", async () => {
		const { stdout, exitCode } = await run([]);
		expect(exitCode).toBe(1);
		expect(stdout).toContain("grisso");
	});

	it("comando desconocido → exit 1", async () => {
		const { stderr, exitCode } = await run(["noexiste"]);
		expect(exitCode).toBe(1);
		expect(stderr).toContain("desconocido");
	});

	it("build --help muestra ayuda del comando", async () => {
		const { stdout, exitCode } = await run(["build", "--help"]);
		expect(exitCode).toBe(0);
		expect(stdout).toContain("--config");
		expect(stdout).toContain("--content");
		expect(stdout).toContain("--output");
	});

	it("build sin --output envía CSS a stdout", async () => {
		const { stdout, exitCode } = await run(["build"]);
		expect(exitCode).toBe(0);
		// El CSS debe contener utilidades básicas
		expect(stdout).toContain("flex");
		expect(stdout).toContain("block");
		expect(stdout.length).toBeGreaterThan(1000);
	}, 30_000);

	it("build --output escribe archivo y muestra tamaño en stderr", async () => {
		const out = tmpOutput();
		const { stderr, exitCode } = await run(["build", "--output", out]);
		expect(exitCode).toBe(0);
		expect(fs.existsSync(out)).toBe(true);
		const css = fs.readFileSync(out, "utf8");
		expect(css).toContain("flex");
		expect(stderr).toContain("KB");
	}, 30_000);

	it("build --no-minify genera CSS más grande", async () => {
		const minOut = tmpOutput();
		const noMinOut = tmpOutput();
		await run(["build", "--output", minOut]);
		await run(["build", "--no-minify", "--output", noMinOut]);
		const minified = fs.statSync(minOut).size;
		const unminified = fs.statSync(noMinOut).size;
		expect(unminified).toBeGreaterThan(minified);
	}, 60_000);

	it("build --content aplica tree-shaking", async () => {
		const fullOut = tmpOutput();
		const shakenOut = tmpOutput();
		await run(["build", "--output", fullOut]);
		await run(["build", "--content", sampleHTML, "--output", shakenOut]);
		const fullSize = fs.statSync(fullOut).size;
		const shakenSize = fs.statSync(shakenOut).size;
		expect(shakenSize).toBeLessThan(fullSize * 0.5);
	}, 60_000);
});
