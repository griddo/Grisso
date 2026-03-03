# Grisso - CLAUDE.md

## What is Grisso

Grisso (`@hiscovega/grisso`) is Griddo's CSS utility class library, similar in concept to Tailwind CSS. It generates responsive utility classes from TypeScript using generator functions. All values reference CSS custom properties (design tokens), enabling theming. Consumers can extend or override tokens via `grisso.config.mjs`.

## Project Structure

```
src/                       # TypeScript source
├── index.ts              # Entry: generateCSS(configPath?)
├── cli.ts                # CLI entry point: grisso build [opciones]
├── types.ts              # Shared types: GrissoConfig, PartialFn, TokenMap...
├── defaults.ts           # Default config (breakpoints, spacing, colors, etc.)
├── generators.ts         # Core generators: simpleClass, complexClass, customClass (with CSS escaping)
├── resolve-config.ts     # Loads grisso.config.mjs, merges with defaults
├── utils.ts              # Helpers: omit(), fractionPercent()
├── build.ts              # buildCSS() — generate, purge, optimize pipeline
├── purge.ts              # purgeCSS() — tree-shaking via PurgeCSS
├── optimize.ts           # optimizeCSS() — media query merge + Lightning CSS
├── partials/
│   ├── index.ts           # Ordered registry of generators
│   ├── layout.ts          # display, position, overflow, z-index, visibility, columns, inset...
│   ├── flex-and-grid.ts   # flex/grid direction, wrap, align, justify, gap...
│   ├── spacing.ts         # margin, padding (with directional variants)
│   ├── sizing.ts          # width, height (with Tailwind fraction support: w-1/2, h-1/3...)
│   ├── backgrounds.ts     # bg colors, attachment, clip, position, size...
│   ├── borders.ts         # width, style, color, border-{side}-width, divide_*, outline_*
│   ├── typography.ts      # text colors, align, weight, tracking (semantic), line-height...
│   ├── effects.ts         # opacity, shadows, overlay
│   └── icons.ts           # icon colors
└── __tests__/
    ├── __fixtures__/      # Test fixtures (config, HTML, CSS samples)
    ├── utils.test.ts
    ├── generators.test.ts
    ├── defaults.test.ts
    ├── resolve-config.test.ts
    ├── optimize.test.ts
    ├── purge.test.ts
    ├── build.test.ts
    └── cli.test.ts

lib/                       # Compiled JS output from tsc (gitignored, published via npm)

dist/
└── grisso.css             # Generated output — do not edit manually

tokens-example.css         # Example CSS custom properties for consumers
playground/
├── index.html             # Visual test page
├── grisso.config.mjs      # Example consumer config (extends defaults)
├── grisso.css             # Generated tree-shaken CSS (gitignored)
└── themes/                # Token CSS files (global, light, dark)

grisso-reduce/
└── index.ts               # Alternative tree-shaking tool (composes-based)
```

## Build

```bash
npm run build       # tsc + Lightning CSS → dist/grisso.css (full, ~156 KB)
npm run typecheck   # Type-check sin emitir (tsc --noEmit)
npm run lint        # Lint con Biome
npm test            # Vitest (run once)
npm run test:watch  # Vitest (watch mode)
npm run playground  # Build + tree-shake + open playground/index.html
```

**Pipeline:** `src/*.ts` → tsc → `lib/` → generators produce raw CSS string → Lightning CSS (autoprefixer, media query merge, minify) → `dist/grisso.css`

**CLI (`grisso build`):**
```bash
grisso build                                              # CSS completo a stdout
grisso build --output dist/grisso.css                     # Escribir a archivo
grisso build --config path/to/config.mjs                  # Custom config
grisso build --content "src/**/*.html" --output out.css   # Tree-shaken build
grisso build --safelist "^p-" --safelist "^m-"            # Proteger clases del purge
grisso build --no-minify                                  # Sin minificar
grisso --help                                             # Ayuda general
grisso --version                                          # Versión
```

Sin `--output`, el CSS va a stdout (mensajes de estado a stderr). Convención Unix para pipear: `grisso build | pbcopy`, `grisso build > out.css`.

## Distribution (npm package)

The package exposes:
- `grisso` CLI → `lib/cli.js` (via `bin` in package.json, usable with `npx grisso build`)
- `@hiscovega/grisso` → `dist/grisso.css` (pre-compiled CSS, style export)
- `@hiscovega/grisso/build` → `lib/build.js` (programmatic API: `buildCSS()`)
- `@hiscovega/grisso/config` → `lib/defaults.js` (default config for reference/extension)
- `@hiscovega/grisso/tokens-example.css` → example CSS custom properties

**Consumer usage (programmatic):**
```js
import { buildCSS } from "@hiscovega/grisso/build";

// Full CSS, minified
const css = await buildCSS();

// Tree-shaken + custom config
const css = await buildCSS({
  content: ["./src/**/*.{js,ts,jsx,tsx,css}"],
  config: "./grisso.config.mjs",
  safelist: ["^p-", /^m-/], // se mergea con config.safelist
  minify: true, // default
});
```

`buildCSS()` runs the full pipeline: generate → purge (if `content`) → optimize (Lightning CSS: media query merge, autoprefixer, minification).

## Consumer Configuration (`grisso.config.mjs`)

Consumers can create a `grisso.config.mjs` to customize tokens (Tailwind v3 pattern):

```js
// grisso.config.mjs
export default {
  // Top-level keys REPLACE defaults entirely
  spacing: { sm: "8px", md: "16px", lg: "24px" },

  // Safelist: patrones de clases protegidas del tree-shaking
  // Top-level reemplaza el default [/^bg-/]
  safelist: [/^p-/, /^m-/],

  // `extend` MERGES with defaults (arrays se concatenan)
  extend: {
    foregroundColors: { "5": "var(--text-5)" },
    shadows: { "2xl": "var(--box-shadow-2xl)" },
    // extend.safelist se concatena con el default [/^bg-/]
    safelist: [/^p-/],
  },
};
```

Safelist acepta `RegExp` y `string` (strings se convierten a `RegExp` internamente).

## Architecture: Three Core Generator Functions

All three generators automatically escape special characters in class names (e.g. `/` → `\/`) via an internal `escapeCSS()` helper, so fraction-based names like `w-1/2` produce valid CSS selectors (`.w-1\/2`).

### 1. `simpleClass(className, property, value, breakpoints)`

For single-value utilities. Generates base class + responsive variants.

```js
simpleClass("flex", "display", "flex", breakpoints)
// Output: .flex, .tablet-flex, .desktop-flex, .ultrawide-flex

simpleClass("w-1/2", "width", "50%", breakpoints)
// Output: .w-1\/2 { width: 50%; }
```

### 2. `complexClass(prefix, properties, tokens, breakpoints)`

For scale-based utilities. Iterates a token map to generate class + scale + responsive variants.

```js
complexClass("p-", "padding", spacing, breakpoints)
// Output: .p-zero, .p-xs, .p-sm, ..., .tablet-p-xs, .desktop-p-sm, ...
```

### 3. `customClass(className, declarations, breakpoints, selectorSuffix?)`

For special cases with multiple declarations or custom selectors.

```js
customClass("truncate", { overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }, breakpoints)
// Output: .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

customClass("divide-x", { "border-right-width": "0", "border-left-width": "1px" }, breakpoints, " > * + *")
// Output: .divide-x > * + * { border-right-width: 0; border-left-width: 1px; }
```

## Key Conventions

- **Naming pattern:** `{breakpoint}-{property}-{scale}` → e.g. `tablet-mt-lg`, `desktop-p-sm`
- **Breakpoints (mobile-first):** tablet (700px), desktop (1024px), ultrawide (1680px)
- **All values use CSS custom properties** (`var(--spc-sm)`, `var(--text-1)`) for theming
- **Directional suffixes:** `-t`, `-r`, `-b`, `-l` for sides; `-x`, `-y` for inline/block
- **Sizing fractions:** Tailwind-style `w-1/2`, `w-2/3`, `h-1/4`, etc. (escaped as `\/` in CSS)
- **z-index:** Tailwind-aligned `z-10`, `z-20`..`z-50` (name = value)
- **Inset utilities:** `inset-{spacing}`, `inset-x-{spacing}`, `inset-y-{spacing}`
- **Tracking:** Semantic scale `tracking-tight`, `tracking-wide`, etc. (not spacing tokens)
- **Border utilities:** `border-{color}`, `border-t-{width}`, `border-r-{width}`, etc.
- **Config is centralized** in `src/defaults.ts` — add new scales/tokens there
- **Documentation and comments are in Spanish**

## How to Add a New Utility

1. Edit the appropriate partial in `src/partials/{category}.ts`
2. Use `simpleClass`, `complexClass`, or `customClass` with the config tokens
3. Run `npm test` to verify
4. Run `npm run build` to compile TS and regenerate CSS

## Tests

Tests live in `src/__tests__/` and are excluded from the `tsc` build via `tsconfig.json`.

```bash
npm test            # Run all tests once
npm run test:watch  # Watch mode
```

**Test modules:**

| File | Covers |
|---|---|
| `utils.test.ts` | `omit()`, `fractionPercent()` |
| `generators.test.ts` | `simpleClass`, `complexClass`, `customClass`, CSS escaping |
| `defaults.test.ts` | Default config structure and token format |
| `resolve-config.test.ts` | Config override, extend, merge logic |
| `optimize.test.ts` | Media query merging, minification |
| `purge.test.ts` | Tree-shaking, safelist, CSS Modules extractor |
| `build.test.ts` | Full `buildCSS()` pipeline (integration) |
| `cli.test.ts` | CLI integration (subprocess via `execFile`) |

**Fixtures** live in `src/__tests__/__fixtures__/` (test config, sample HTML, sample CSS Module).

## grisso-reduce (Tree-Shaking)

`grisso-reduce/index.ts` scans project CSS files for `composes: ... from global` declarations, compares against all generated Grisso classes, and removes unused ones using `css-byebye`. Protected classes (e.g. `bg-`) are preserved.

## Dependencies

- **`purgecss`** — tree-shaking unused CSS classes
- **`lightningcss`** — CSS optimization (autoprefixer, media query merge, minification)
- **`browserslist`** — target browsers for autoprefixer
- **typescript** (dev) — compiles `src/*.ts` → `lib/`
- **@biomejs/biome** (dev) — linting and formatting
- **vitest** (dev) — test runner
## Formatting

- Tabs for indentation
- Biome for linting and formatting (`biome.json`)
