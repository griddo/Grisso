# Grisso - CLAUDE.md

## What is Grisso

Grisso (`@griddo/grisso`) is Griddo's CSS utility class library, similar in concept to Tailwind CSS. It generates responsive utility classes from SCSS using a mixin-based system. All values reference CSS custom properties (design tokens), enabling theming.

## Project Structure

```
src/
├── grisso.scss              # Main entry - imports all partials
├── grisso.config.scss       # Configuration: breakpoints, spacing, colors, etc.
├── mixins.scss              # Core mixins: grisso_simple_class, grisso_complex_class
└── partials/                # Utility class definitions organized by category
    ├── layout/              # display, position, overflow, z-index, visibility...
    ├── flex_and_grid/       # flex/grid direction, wrap, align, justify, gap...
    ├── spacing/             # margin, padding (with directional variants)
    ├── sizing/              # width, height
    ├── backgrounds/         # bg colors, attachment, clip, position, size...
    ├── borders/             # width, style, divide_*, outline_*
    ├── typography/          # text colors, align, weight, spacing, line-height...
    ├── effects/             # opacity, shadows, overlay
    └── icons/               # icon colors

dist/
└── grisso.css               # Generated output — do not edit manually (ignored by git, published via npm)

grisso-reduce/
└── index.ts                 # Alternative tree-shaking tool (composes-based)

plugin.js                    # PostCSS plugin: CSS injection + PurgeCSS tree-shaking
tokens-example.css           # Example CSS custom properties for consumers
postcss.config.js            # PostCSS plugins: autoprefixer, dedup, sort, minify
playground/
├── index.html               # Visual test page
└── tokens.css               # Token values for playground
```

## Build

```bash
npm run build       # SCSS → dist/grisso.css (SASS + PostCSS)
npm run watch       # SASS watch mode for development
npm run playground  # Build + open playground/index.html in browser
```

**Pipeline:** `src/grisso.scss` → SASS compiler → `dist/grisso.css` (raw) → PostCSS (nesting, autoprefixer, dedup, sort, minify) → `dist/grisso.css` (final)

## Distribution (npm package)

The package exposes:
- `@griddo/grisso` → `dist/grisso.css` (pre-compiled CSS, style export)
- `@griddo/grisso/plugin` → `plugin.js` (PostCSS plugin with tree-shaking via PurgeCSS)
- `@griddo/grisso/tokens-example.css` → example CSS custom properties

**Consumer usage:**
```js
// postcss.config.js
module.exports = {
  plugins: [
    require("@griddo/grisso/plugin")({
      content: ["./src/**/*.{js,ts,jsx,tsx,css}"]
    })
  ]
}
```

## Architecture: Two Core Mixin Patterns

### 1. `grisso_simple_class($className, $css)`

For single-value utilities. Generates base class + responsive variants.

```scss
// Input
@include grisso_simple_class("flex", (display, flex));

// Output: .flex, .tablet-flex, .desktop-flex, .ultrawide-flex
```

### 2. `grisso_complex_class($className, $properties, $tokens)`

For scale-based utilities. Iterates a SCSS map to generate class + scale + responsive variants.

```scss
// Input
@include grisso_complex_class("p-", padding, $spacing);

// Output: .p-zero, .p-xs, .p-sm, ..., .tablet-p-xs, .desktop-p-sm, ...
```

## Key Conventions

- **Partials use `_` prefix:** `_padding.scss`, `_display.scss` (SCSS convention)
- **Naming pattern:** `{breakpoint}-{property}-{scale}` → e.g. `tablet-mt-lg`, `desktop-p-sm`
- **Breakpoints (mobile-first):** tablet (700px), desktop (1024px), ultrawide (1680px)
- **All values use CSS custom properties** (`var(--spc-sm)`, `var(--text-1)`) for theming
- **Directional suffixes:** `-t`, `-r`, `-b`, `-l` for sides; `-x`, `-y` for inline/block
- **Grid:** 12 columns
- **Config is centralized** in `grisso.config.scss` — add new scales/tokens there
- **Documentation and comments are in Spanish**

## How to Add a New Utility

1. Create a new partial `src/partials/{category}/_name.scss`
2. Use `grisso_simple_class` or `grisso_complex_class` with appropriate config maps
3. Import the partial in `src/grisso.scss`
4. Run build to regenerate CSS

## grisso-reduce (Tree-Shaking)

`grisso-reduce/index.ts` scans project CSS files for `composes: ... from global` declarations, compares against all generated Grisso classes, and removes unused ones using `css-byebye`. Protected classes (e.g. `bg-`) are preserved.

## Dependencies

- **`@fullhuman/postcss-purgecss`** (runtime) — tree-shaking in `plugin.js`
- **sass** (dev) — SCSS compilation
- **postcss** + plugins (dev) — CSS optimization pipeline (autoprefixer, dedup, sort, minify)
- **postcss-preset-env** (dev) — modern CSS features, stage 1

## Formatting

- Tabs for indentation (`.prettierrc.json`: `useTabs: true`)
- ESLint configured for TypeScript/React (applies to `grisso-reduce`)
