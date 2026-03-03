# Grisso - CLAUDE.md

## What is Grisso

Grisso (`@griddo/grisso`) is Griddo's CSS utility class library, similar in concept to Tailwind CSS. It generates responsive utility classes from TypeScript using generator functions. All values reference CSS custom properties (design tokens), enabling theming. Consumers can extend or override tokens via `grisso.config.mjs`.

## Project Structure

```
src/js/                    # TypeScript source
├── index.ts              # Entry: generateCSS(configPath?)
├── types.ts              # Shared types: GrissoConfig, PartialFn, TokenMap...
├── defaults.ts           # Default config (breakpoints, spacing, colors, etc.)
├── generators.ts         # Core generators: simpleClass, complexClass, customClass
├── resolve-config.ts     # Loads grisso.config.mjs, merges with defaults
├── utils.ts              # Helpers: omit(), fractionPercent()
└── partials/
    ├── index.ts           # Ordered registry of generators
    ├── layout.ts          # display, position, overflow, z-index, visibility, columns...
    ├── flex-and-grid.ts   # flex/grid direction, wrap, align, justify, gap...
    ├── spacing.ts         # margin, padding (with directional variants)
    ├── sizing.ts          # width, height (with fraction support)
    ├── backgrounds.ts     # bg colors, attachment, clip, position, size...
    ├── borders.ts         # width, style, divide_*, outline_*
    ├── typography.ts      # text colors, align, weight, spacing, line-height...
    ├── effects.ts         # opacity, shadows, overlay
    └── icons.ts           # icon colors

lib/                       # Compiled JS output from tsc (gitignored, published via npm)

src/                       # Legacy SCSS source (deprecated)
├── grisso.scss
├── grisso.config.scss
├── mixins.scss
└── partials/

dist/
└── grisso.css             # Generated output — do not edit manually

scripts/
└── build.js               # Build script (supports --config, --content, --output)

plugin.js                  # PostCSS plugin: generates CSS from lib/ + PurgeCSS tree-shaking
tokens-example.css         # Example CSS custom properties for consumers
postcss.config.js          # PostCSS plugins: autoprefixer, dedup, sort, minify
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
npm run build       # tsc + PostCSS → dist/grisso.css (full, ~156 KB)
npm run typecheck   # Type-check sin emitir (tsc --noEmit)
npm run lint        # Lint con Biome
npm run playground  # Build + tree-shake + open playground/index.html
```

**Pipeline:** `src/js/*.ts` → tsc → `lib/` → generators produce raw CSS string → PostCSS (autoprefixer, dedup, sort, minify) → `dist/grisso.css`

**Build script flags:**
```bash
node scripts/build.js                                           # Full build → dist/grisso.css
node scripts/build.js --config path/to/config.mjs               # Custom config
node scripts/build.js --content "src/**/*.html" --output out.css # Tree-shaken build
```

## Distribution (npm package)

The package exposes:
- `@griddo/grisso` → `dist/grisso.css` (pre-compiled CSS, style export)
- `@griddo/grisso/plugin` → `plugin.js` (PostCSS plugin with tree-shaking via PurgeCSS)
- `@griddo/grisso/config` → `lib/defaults.js` (default config for reference/extension)
- `@griddo/grisso/tokens-example.css` → example CSS custom properties

**Consumer usage:**
```js
// postcss.config.js
import grisso from "@griddo/grisso/plugin";

export default {
  plugins: [
    grisso({
      content: ["./src/**/*.{js,ts,jsx,tsx,css}"],
      config: "./grisso.config.mjs" // optional
    })
  ]
}
```

## Consumer Configuration (`grisso.config.mjs`)

Consumers can create a `grisso.config.mjs` to customize tokens (Tailwind v3 pattern):

```js
// grisso.config.mjs
export default {
  // Top-level keys REPLACE defaults entirely
  spacing: { sm: "8px", md: "16px", lg: "24px" },

  // `extend` MERGES with defaults
  extend: {
    foregroundColors: { "5": "var(--text-5)" },
    shadows: { "2xl": "var(--box-shadow-2xl)" },
  },
};
```

## Architecture: Three Core Generator Functions

### 1. `simpleClass(className, property, value, breakpoints)`

For single-value utilities. Generates base class + responsive variants.

```js
simpleClass("flex", "display", "flex", breakpoints)
// Output: .flex, .tablet-flex, .desktop-flex, .ultrawide-flex
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
- **Grid:** 12 columns
- **Config is centralized** in `src/js/defaults.ts` — add new scales/tokens there
- **Documentation and comments are in Spanish**

## How to Add a New Utility

1. Edit the appropriate partial in `src/js/partials/{category}.ts`
2. Use `simpleClass`, `complexClass`, or `customClass` with the config tokens
3. Run `npm run build` to compile TS and regenerate CSS

## grisso-reduce (Tree-Shaking)

`grisso-reduce/index.ts` scans project CSS files for `composes: ... from global` declarations, compares against all generated Grisso classes, and removes unused ones using `css-byebye`. Protected classes (e.g. `bg-`) are preserved.

## Dependencies

- **`purgecss`** (via `@fullhuman/postcss-purgecss`) — tree-shaking in `plugin.js`
- **typescript** (dev) — compiles `src/js/*.ts` → `lib/`
- **postcss** + plugins (dev) — CSS optimization pipeline (autoprefixer, dedup, sort, minify)
- **postcss-preset-env** (dev) — modern CSS features, stage 1
- **@biomejs/biome** (dev) — linting and formatting
- **sass** (dev) — legacy SCSS compilation (deprecated)

## Formatting

- Tabs for indentation
- Biome for linting and formatting (`biome.json`)
