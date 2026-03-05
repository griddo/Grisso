# Grisso - CLAUDE.md

## What is Grisso

Grisso (`@hiscovega/grisso`) is Griddo's CSS utility class library, similar in concept to Tailwind CSS. It generates responsive and state-variant utility classes from TypeScript using generator functions. All values reference CSS custom properties (design tokens), enabling theming. Consumers can extend or override tokens via `grisso.config.mjs`.

## Project Structure

```
src/                       # TypeScript source
├── index.ts              # Entry: generateCSS(configPath?)
├── cli.ts                # CLI entry point: grisso build | grisso tokens
├── tokens.ts             # extractTokens() — token scaffold generation (CSS/JSON)
├── types.ts              # Shared types: GrissoConfig, PartialFn, TokenMap, States...
├── defaults.ts           # Default config (breakpoints, states, spacing, colors, etc.)
├── generators.ts         # Core generators: simpleClass, complexClass, customClass (with CSS escaping)
├── resolve-config.ts     # Loads grisso.config.mjs, merges with defaults
├── utils.ts              # Helpers: omit(), fractionPercent()
├── build.ts              # buildCSS() — generate, purge, optimize pipeline
├── purge.ts              # purgeCSS() — tree-shaking via PurgeCSS
├── optimize.ts           # optimizeCSS() — media query merge + Lightning CSS
├── postcss.ts            # PostCSS plugin: @grisso directive (inline classes with `:` separator)
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
    ├── tokens.test.ts
    ├── cli.test.ts
    └── postcss.test.ts

lib/                       # Compiled JS output from tsc (gitignored, published via npm)

dist/
└── grisso.css             # Generated output — do not edit manually

tokens-example.css         # Example CSS custom properties for consumers
vscode-css-custom-data.json # VS Code custom data: registers @grisso at-rule
playground/
├── index.html             # Visual test page
├── grisso.config.mjs      # Example consumer config (extends defaults)
├── grisso.css             # Generated tree-shaken CSS (gitignored)
├── example.module.css     # CSS Modules demo using @grisso directive
├── example.processed.css  # Output of PostCSS processing (gitignored)
├── build.mjs              # Script: process example.module.css with grisso-apply
└── themes/                # Token CSS files (global, light, dark)

grisso-reduce/
└── index.ts               # Alternative tree-shaking tool (composes-based)
```

## Build

```bash
npm run build       # tsc + Lightning CSS → dist/grisso.css (full, ~800 KB)
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

**CLI (`grisso tokens`):**
```bash
grisso tokens                                              # Scaffold CSS a stdout
grisso tokens --output tokens.css                          # Escribir a archivo
grisso tokens --config path/to/config.mjs                  # Usa config custom
grisso tokens --format json                                # Config resuelta como JSON
grisso tokens --help                                       # Ayuda del comando
```

Genera un scaffold CSS (o JSON) con todas las custom properties referenciadas en la config resuelta. El consumidor lo usa como punto de partida para definir sus tokens.

## Distribution (npm package)

The package exposes:
- `grisso` CLI → `lib/cli.js` (via `bin` in package.json, usable with `npx grisso build`)
- `@hiscovega/grisso` → `dist/grisso.css` (pre-compiled CSS, style export)
- `@hiscovega/grisso/build` → `lib/build.js` (programmatic API: `buildCSS()`)
- `@hiscovega/grisso/tokens` → `lib/tokens.js` (programmatic API: `extractTokens()`)
- `@hiscovega/grisso/config` → `lib/defaults.js` (default config for reference/extension)
- `@hiscovega/grisso/postcss` → `lib/postcss.js` (PostCSS plugin: `@grisso` directive)
- `@hiscovega/grisso/tokens-example.css` → example CSS custom properties
- `vscode-css-custom-data.json` → VS Code custom CSS data (registers `@grisso` at-rule)

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

**PostCSS plugin (`@grisso`):**

Alternative to using utility classes directly in HTML. Allows using Grisso classes inside CSS files (including `.module.css`) with the `:` separator for states and breakpoints:

```js
// postcss.config.mjs
import grissoApply from "@hiscovega/grisso/postcss";

export default {
  plugins: [grissoApply({ config: "./grisso.config.mjs" })],
};
```

```css
/* Input: component.module.css */
.card {
  border-radius: 8px;
  @grisso flex flex-col p-md bg-ui shadow-lg hover:shadow-xl tablet:p-lg;
}

/* Output: */
.card { border-radius: 8px; display: flex; flex-direction: column; padding: var(--spc-md); background-color: var(--bg-ui); box-shadow: var(--box-shadow-lg); }
.card:hover { box-shadow: var(--box-shadow-xl); }
@media (min-width: 700px) { .card { padding: var(--spc-lg); } }
```

Prefix syntax: `clase`, `estado:clase`, `breakpoint:clase`, `bp:estado:clase` (order flexible).
Requires `postcss` as peer dependency (`^8.1.0`). Empty rules are auto-cleaned.

**Token extraction (programmatic):**
```js
import { extractTokens } from "@hiscovega/grisso/tokens";

// Scaffold CSS con todas las custom properties
const css = await extractTokens();

// JSON con los token maps resueltos
const json = await extractTokens({ format: "json", config: "./grisso.config.mjs" });
```

## Consumer Configuration (`grisso.config.mjs`)

Consumers can create a `grisso.config.mjs` to customize tokens (Tailwind v3 pattern):

```js
// grisso.config.mjs
export default {
  // Top-level keys REPLACE defaults entirely
  spacing: { sm: "8px", md: "16px", lg: "24px" },

  // States: top-level reemplaza los 5 defaults (hover, focus, focus-visible, active, disabled)
  states: { hover: ":hover", focus: ":focus" },

  // Safelist: patrones de clases protegidas del tree-shaking
  // Top-level reemplaza el default []
  safelist: [/^p-/, /^m-/],

  // `extend` MERGES with defaults (arrays se concatenan)
  extend: {
    foregroundColors: { "5": "var(--text-5)" },
    shadows: { "2xl": "var(--box-shadow-2xl)" },
    // extend.safelist se concatena con el default []
    safelist: [/^p-/],
  },
};
```

Safelist acepta `RegExp` y `string` (strings se convierten a `RegExp` internamente).

## Architecture: Three Core Generator Functions

All three generators automatically escape special characters in class names (e.g. `/` → `\/`) via an internal `escapeCSS()` helper, so fraction-based names like `w-1/2` produce valid CSS selectors (`.w-1\/2`).

### 1. `simpleClass(className, property, value, breakpoints, states?)`

For single-value utilities. Generates base class + state variants + responsive variants + responsive+state combos.

```js
simpleClass("flex", "display", "flex", breakpoints, states)
// Output: .flex, .hover-flex:hover, .focus-flex:focus, ...,
//         .tablet-flex, .tablet-hover-flex:hover, ...
```

### 2. `complexClass(prefix, properties, tokens, breakpoints, states?)`

For scale-based utilities. Iterates a token map to generate class + scale + state + responsive variants.

```js
complexClass("p-", "padding", spacing, breakpoints, states)
// Output: .p-sm, .hover-p-sm:hover, .focus-p-sm:focus, ...,
//         .tablet-p-sm, .tablet-hover-p-sm:hover, ...
```

### 3. `customClass(className, declarations, breakpoints, selectorSuffix?, states?)`

For special cases with multiple declarations or custom selectors. Pseudo goes before selectorSuffix.

```js
customClass("truncate", { overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }, breakpoints, undefined, states)
// Output: .truncate { ... }, .hover-truncate:hover { ... }, .tablet-truncate { ... }

customClass("divide-x", { "border-right-width": "0", "border-left-width": "1px" }, breakpoints, " > * + *", states)
// Output: .divide-x > * + * { ... }, .hover-divide-x:hover > * + * { ... }
```

## Key Conventions

- **Naming pattern:** `{breakpoint}-{state}-{property}-{scale}` → e.g. `tablet-mt-lg`, `hover-bg-1`, `tablet-hover-p-sm`
- **Breakpoints (mobile-first):** tablet (700px), desktop (1024px), ultrawide (1680px)
- **States:** hover, focus, focus-visible, active, disabled (configurable via `states` in config)
- **Cascade order:** base → state → responsive → responsive+state
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
| `generators.test.ts` | `simpleClass`, `complexClass`, `customClass`, CSS escaping, state variants |
| `defaults.test.ts` | Default config structure and token format |
| `resolve-config.test.ts` | Config override, extend, merge logic |
| `optimize.test.ts` | Media query merging, minification |
| `purge.test.ts` | Tree-shaking, safelist, CSS Modules extractor |
| `build.test.ts` | Full `buildCSS()` pipeline (integration) |
| `tokens.test.ts` | `extractTokens()` CSS and JSON output |
| `cli.test.ts` | CLI integration (subprocess via `execFile`) |
| `postcss.test.ts` | `@grisso` PostCSS plugin (inline, states, responsive, config, fractions, negatives, nested @media) |

**Fixtures** live in `src/__tests__/__fixtures__/` (test config, sample HTML, sample CSS Module).

## grisso-reduce (Tree-Shaking)

`grisso-reduce/index.ts` scans project CSS files for `composes: ... from global` declarations, compares against all generated Grisso classes, and removes unused ones using `css-byebye`. Protected classes (e.g. `bg-`) are preserved.

## Dependencies

- **`purgecss`** — tree-shaking unused CSS classes
- **`lightningcss`** — CSS optimization (autoprefixer, media query merge, minification)
- **`browserslist`** — target browsers for autoprefixer
- **`postcss`** (peer, optional) — required only for the `@grisso` PostCSS plugin (`^8.1.0`)
- **typescript** (dev) — compiles `src/*.ts` → `lib/`
- **@biomejs/biome** (dev) — linting and formatting
- **vitest** (dev) — test runner
## Formatting

- Tabs for indentation
- Biome for linting and formatting (`biome.json`)
