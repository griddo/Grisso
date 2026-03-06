import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { purgeCSS } from "../purge.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, "__fixtures__/.tmp");

function setupTmpDir() {
	mkdirSync(tmpDir, { recursive: true });
}

function cleanTmpDir() {
	rmSync(tmpDir, { recursive: true, force: true });
}

const fullCSS = `
.flex { display: flex; }
.block { display: block; }
.grid { display: grid; }
.hidden { display: none; }
.p-sm { padding: var(--spc-sm); }
.p-md { padding: var(--spc-md); }
.gap-md { gap: var(--spc-md); }
.text-1 { color: var(--text-1); }
.font-bold { font-weight: 700; }
.bg-1 { background-color: var(--bg-1); }
.bg-2 { background-color: var(--bg-2); }
`.trim();

describe("purgeCSS", () => {
	it("preserva clases usadas en HTML", async () => {
		setupTmpDir();
		const htmlPath = path.join(tmpDir, "test.html");
		writeFileSync(htmlPath, '<div class="flex p-sm text-1">Hello</div>');

		try {
			const result = await purgeCSS(fullCSS, {
				content: [htmlPath],
			});
			expect(result).toContain(".flex");
			expect(result).toContain(".p-sm");
			expect(result).toContain(".text-1");
		} finally {
			cleanTmpDir();
		}
	});

	it("elimina clases no usadas", async () => {
		setupTmpDir();
		const htmlPath = path.join(tmpDir, "test.html");
		writeFileSync(htmlPath, '<div class="flex">Hello</div>');

		try {
			const result = await purgeCSS(fullCSS, {
				content: [htmlPath],
			});
			expect(result).toContain(".flex");
			// Estas no se usan en el HTML
			expect(result).not.toContain(".grid");
			expect(result).not.toContain(".hidden");
			expect(result).not.toContain(".p-md");
		} finally {
			cleanTmpDir();
		}
	});

	it("preserva safelist (bg-*) cuando se pasa explícitamente", async () => {
		setupTmpDir();
		const htmlPath = path.join(tmpDir, "test.html");
		writeFileSync(htmlPath, '<div class="flex">Hello</div>');

		try {
			const result = await purgeCSS(fullCSS, {
				content: [htmlPath],
				safelist: [/^bg-/],
			});
			expect(result).toContain(".bg-1");
			expect(result).toContain(".bg-2");
		} finally {
			cleanTmpDir();
		}
	});

	it("sin safelist no preserva bg-* automáticamente", async () => {
		setupTmpDir();
		const htmlPath = path.join(tmpDir, "test.html");
		writeFileSync(htmlPath, '<div class="flex">Hello</div>');

		try {
			const result = await purgeCSS(fullCSS, {
				content: [htmlPath],
			});
			expect(result).not.toContain(".bg-1");
			expect(result).not.toContain(".bg-2");
		} finally {
			cleanTmpDir();
		}
	});

	it("extrae clases de CSS Modules (composes: ... from global)", async () => {
		setupTmpDir();
		const cssPath = path.join(tmpDir, "test.css");
		writeFileSync(cssPath, ".wrapper { composes: flex gap-md from global; }");

		try {
			const result = await purgeCSS(fullCSS, {
				content: [cssPath],
			});
			expect(result).toContain(".flex");
			expect(result).toContain(".gap-md");
		} finally {
			cleanTmpDir();
		}
	});

	it("extrae clases base de @grisso en CSS", async () => {
		setupTmpDir();
		const cssPath = path.join(tmpDir, "test.css");
		writeFileSync(
			cssPath,
			".card { @grisso flex p-sm text-1; }",
		);

		try {
			const result = await purgeCSS(fullCSS, {
				content: [cssPath],
			});
			expect(result).toContain(".flex");
			expect(result).toContain(".p-sm");
			expect(result).toContain(".text-1");
			// No usadas
			expect(result).not.toContain(".grid");
			expect(result).not.toContain(".hidden");
		} finally {
			cleanTmpDir();
		}
	});

	it("extrae clases con prefijos de estado/breakpoint de @grisso", async () => {
		setupTmpDir();
		const cssPath = path.join(tmpDir, "test.css");
		writeFileSync(
			cssPath,
			".card { @grisso flex hover:bg-1 tablet:p-md; }",
		);

		try {
			const result = await purgeCSS(fullCSS, {
				content: [cssPath],
			});
			// Clases base
			expect(result).toContain(".flex");
			expect(result).toContain(".bg-1");
			expect(result).toContain(".p-md");
		} finally {
			cleanTmpDir();
		}
	});

	it("combina @grisso y composes en el mismo archivo CSS", async () => {
		setupTmpDir();
		const cssPath = path.join(tmpDir, "test.css");
		writeFileSync(
			cssPath,
			`.wrapper { composes: flex from global; }
.card { @grisso p-sm bg-1; }`,
		);

		try {
			const result = await purgeCSS(fullCSS, {
				content: [cssPath],
			});
			expect(result).toContain(".flex");
			expect(result).toContain(".p-sm");
			expect(result).toContain(".bg-1");
		} finally {
			cleanTmpDir();
		}
	});

	it("acepta safelist adicional", async () => {
		setupTmpDir();
		const htmlPath = path.join(tmpDir, "test.html");
		writeFileSync(htmlPath, "<div>Empty</div>");

		try {
			const result = await purgeCSS(fullCSS, {
				content: [htmlPath],
				safelist: [/^p-/],
			});
			expect(result).toContain(".p-sm");
			expect(result).toContain(".p-md");
		} finally {
			cleanTmpDir();
		}
	});
});
