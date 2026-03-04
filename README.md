# Grisso

> Librería de utility CSS de Griddo con variantes responsive y de estado, basada en CSS custom properties (design tokens).

> [!WARNING]
> En la versión estable 2.0, el paquete se moverá a `@griddo/grisso`. El nombre actual `@hiscovega/grisso` dejará de recibir actualizaciones a partir de ese momento.

## Tabla de contenido

- [Instalación](#instalación)
- [Uso](#uso)
  - [CLI](#cli)
    - [`grisso tokens`](#grisso-tokens)
  - [API programática](#api-programática)
    - [Ejemplos](#ejemplos)
    - [`extractTokens()`](#extracttokens--scaffold-de-tokens)
- [Configuración personalizada](#configuración-personalizada)
- [Design Tokens (CSS custom properties)](#design-tokens-css-custom-properties)
- [Clases disponibles](#clases-disponibles)
  - [Nomenclatura](#nomenclatura)
  - [Breakpoints](#breakpoints-mobile-first)
  - [State variants](#state-variants)
  - [Categorías](#categorías)
- [Build](#build)
- [Desarrollo: Añadir nuevas utilities](#desarrollo-añadir-nuevas-utilities)
- [Publicación (release)](#publicación-release)
- [grisso-reduce (tree-shaking alternativo)](#grisso-reduce-tree-shaking-alternativo)

## Instalación

```bash
npm install @hiscovega/grisso
```

## Uso

### CLI

Genera CSS desde la terminal. Forma recomendada de usar Grisso, ideal para scripts de build y CI/CD.

```bash
# CSS completo a stdout
npx grisso build

# Escribir a archivo
npx grisso build --output dist/grisso.css

# Con config personalizada
npx grisso build --config grisso.config.mjs --output dist/grisso.css

# Tree-shaking (solo clases usadas)
npx grisso build --content "src/**/*.tsx" --content "src/**/*.css" --output dist/grisso.css

# Proteger clases del tree-shaking
npx grisso build --content "src/**/*.tsx" --safelist "^p-" --safelist "^m-" --output dist/grisso.css

# Sin minificar (útil para depuración)
npx grisso build --no-minify --output dist/grisso.css

# Pipear a otro comando
npx grisso build | pbcopy
```

**Flags de `grisso build`:**

| Flag                 | Descripción                                 |
| -------------------- | ------------------------------------------- |
| `--config <ruta>`    | Ruta a `grisso.config.mjs`                  |
| `--content <glob>`   | Globs para tree-shaking (repetible)         |
| `--safelist <regex>` | Patrones de clases a preservar (repetible)  |
| `--output <ruta>`    | Archivo de salida (sin `--output` → stdout) |
| `--no-minify`        | Deshabilitar minificación                   |
| `--help, -h`         | Ayuda del comando                           |

Sin `--output`, el CSS va a stdout y los mensajes de estado a stderr, siguiendo la convención Unix.

#### `grisso tokens`

Genera un scaffold con todas las CSS custom properties (design tokens) que necesitas definir. Extrae dinámicamente los tokens de la config resuelta.

```bash
# Scaffold CSS a stdout
npx grisso tokens

# Escribir a archivo
npx grisso tokens --output tokens.css

# Con config personalizada (refleja extends/overrides)
npx grisso tokens --config grisso.config.mjs --output tokens.css

# Config resuelta como JSON
npx grisso tokens --format json
```

**Flags de `grisso tokens`:**

| Flag              | Descripción                                       |
| ----------------- | ------------------------------------------------- |
| `--config <ruta>` | Ruta a `grisso.config.mjs`                        |
| `--format <fmt>`  | Formato de salida: `css` (default) o `json`       |
| `--output <ruta>` | Archivo de salida (sin `--output` → stdout)       |
| `--help, -h`      | Ayuda del comando                                 |

El scaffold CSS genera un `:root { }` con todas las properties vacías, agrupadas por sección, listo para rellenar:

```css
:root {
	/* ─── Spacing ─── */
	--spc-4xs: ;
	--spc-3xs: ;
	/* ... */

	/* ─── Colors: marca ─── */
	--brand-1: ;
	--brand-2: ;
	/* ... */
}
```

### API programática

Usa `buildCSS()` directamente desde Node.js. Genera, purga y optimiza CSS — ideal para scripts de build, herramientas custom o integración con cualquier bundler.

```js
import { buildCSS } from "@hiscovega/grisso/build";

// Build completo (todo el CSS, minificado)
const css = await buildCSS();
```

**Opciones de `buildCSS()`:**

| Opción     | Tipo                   | Default | Descripción                                                      |
| ---------- | ---------------------- | ------- | ---------------------------------------------------------------- |
| `config`   | `string`               | —       | Ruta a `grisso.config.mjs` personalizado                         |
| `content`  | `string[]`             | —       | Globs de archivos a escanear para tree-shaking                   |
| `safelist` | `(string \| RegExp)[]` | —       | Patrones de clases a preservar (se mergea con `config.safelist`) |
| `minify`   | `boolean`              | `true`  | Minificar el CSS de salida                                       |

Sin `content`, se incluye todo el CSS. Con `content`, se eliminan las clases no usadas via PurgeCSS.

#### Ejemplos

**Tree-shaking** — solo las clases que usa tu proyecto:

```js
const css = await buildCSS({
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.css"],
});
```

**Config personalizada + tree-shaking:**

```js
const css = await buildCSS({
  config: "./grisso.config.mjs",
  content: ["./src/**/*.{js,ts,jsx,tsx,css}"],
});
```

**CSS sin minificar** (útil para depuración):

```js
const css = await buildCSS({ minify: false });
```

**Script de build** — genera un archivo CSS para producción:

```js
// scripts/build-css.mjs
import { writeFileSync } from "node:fs";
import { buildCSS } from "@hiscovega/grisso/build";

const css = await buildCSS({
  content: ["./src/**/*.{jsx,tsx,css}"],
  config: "./grisso.config.mjs",
});

writeFileSync("./dist/styles.css", css);
console.log(`CSS generado: ${css.length} bytes`);
```

**Integración con Vite** (plugin custom):

```js
// vite.config.js
import { buildCSS } from "@hiscovega/grisso/build";

export default {
  plugins: [
    {
      name: "grisso",
      async buildStart() {
        const css = await buildCSS({
          content: ["./src/**/*.{jsx,tsx,css}"],
        });
        this.emitFile({ type: "asset", fileName: "grisso.css", source: css });
      },
    },
  ],
};
```

#### `extractTokens()` — scaffold de tokens

Usa `extractTokens()` para generar programáticamente el scaffold de custom properties (o JSON) desde la config resuelta.

```js
import { extractTokens } from "@hiscovega/grisso/tokens";

// Scaffold CSS con todas las custom properties
const css = await extractTokens();

// JSON con los token maps resueltos
const json = await extractTokens({
  format: "json",
  config: "./grisso.config.mjs",
});
```

**Opciones de `extractTokens()`:**

| Opción   | Tipo             | Default | Descripción                               |
| -------- | ---------------- | ------- | ----------------------------------------- |
| `config` | `string`         | —       | Ruta a `grisso.config.mjs` personalizado  |
| `format` | `"css" \| "json"` | `"css"` | Formato de salida                         |

**Servidor de desarrollo** — generar CSS on-the-fly:

```js
// Ejemplo con Express
import express from "express";
import { buildCSS } from "@hiscovega/grisso/build";

const app = express();

app.get("/grisso.css", async (req, res) => {
  const css = await buildCSS({ minify: false });
  res.type("text/css").send(css);
});
```

## Configuración personalizada

Crea un `grisso.config.mjs` en la raíz de tu proyecto para extender o reemplazar los tokens por defecto.

```js
// grisso.config.mjs
export default {
  // Las keys de primer nivel REEMPLAZAN los defaults completamente
  spacing: {
    sm: "8px",
    md: "16px",
    lg: "24px",
  },

  // States: reemplaza los 5 defaults (hover, focus, focus-visible, active, disabled)
  // Solo genera variantes para los estados listados
  states: {
    hover: ":hover",
    focus: ":focus",
  },

  // `extend` MERGEA con los defaults (arrays se concatenan)
  extend: {
    foregroundColors: {
      5: "var(--text-5)",
    },
    shadows: {
      "2xl": "var(--box-shadow-2xl)",
    },
    // Se concatena con el default []
    safelist: [/^p-/],
  },
};
```

La `safelist` controla qué clases se protegen del tree-shaking. Por defecto está vacía. En top-level reemplaza, en `extend` se concatena. Acepta `RegExp` y `string`.

Los `states` controlan qué variantes de estado se generan. Cada entrada es `nombre: pseudo-clase`. Top-level reemplaza completamente; `extend.states` mergea con los defaults.

Si no se pasa `config` a `buildCSS()`, busca automáticamente `grisso.config.mjs` en el directorio de trabajo. Si no existe, usa los defaults.

Los defaults se pueden consultar importando `@hiscovega/grisso/config`.

## Design Tokens (CSS custom properties)

Grisso usa CSS custom properties para todos los valores. Genera un scaffold con todas las properties que necesitas definir:

```bash
# Genera scaffold dinámico desde tu config resuelta
npx grisso tokens --output src/tokens.css
```

Alternativamente, copia el ejemplo estático:

```bash
cp node_modules/@hiscovega/grisso/tokens-example.css src/tokens.css
```

```css
/* src/tokens.css */
:root {
  --spc-sm: 16px;
  --spc-md: 24px;
  --text-1: #111827;
  --bg-1: #f9fafb;
  /* ... ver tokens-example.css para la lista completa */
}
```

Importa los tokens antes que Grisso en tu CSS global:

```css
@import "./tokens.css";
@import "@hiscovega/grisso";
```

## Clases disponibles

### Nomenclatura

```
{breakpoint}-{state}-{propiedad}-{escala}
```

Ejemplos: `flex`, `tablet-flex`, `p-md`, `hover-bg-1`, `focus-border-1`, `tablet-hover-p-sm`, `desktop-mt-lg`, `w-1/2`

### Breakpoints (mobile-first)

| Prefijo         | Tamaño  |
| --------------- | ------- |
| _(sin prefijo)_ | 0px+    |
| `tablet-`       | 700px+  |
| `desktop-`      | 1024px+ |
| `ultrawide-`    | 1680px+ |

### State variants

Todas las utilidades generan variantes de estado automáticamente. El tree-shaking elimina las no usadas.

| Prefijo            | Pseudo-clase     |
| ------------------ | ---------------- |
| `hover-`           | `:hover`         |
| `focus-`           | `:focus`         |
| `focus-visible-`   | `:focus-visible` |
| `active-`          | `:active`        |
| `disabled-`        | `:disabled`      |

Se combinan con breakpoints: `tablet-hover-bg-1`, `desktop-focus-p-sm`.

Orden del cascade: base → state → responsive → responsive+state.

### Escalas de tokens (referencia)

| Token              | Valores                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **Spacing**        | `auto` `zero` `0` `4xs` `3xs` `2xs` `xs` `sm` `md` `lg` `xl` `2xl` `3xl` `4xl` `5xl`              |
| **Border width**   | `none` `xs` `sm` `md` `lg`                                                                          |
| **Border color**   | `1` `2` `3` `4` `disabled` `inherit` `current` `transparent`                                        |
| **Background**     | `ui` `1` `2` `3` `4` `5` `disabled`                                                                 |
| **Text color**     | `1` `2` `3` `4`                                                                                     |
| **Icon color**     | `1` `2` `3` `4` `disabled`                                                                          |
| **Opacity**        | `0` `1` `2` `3` `4` `5` `6`                                                                        |
| **Shadows**        | `sm` `md` `lg` `xl` `inner` `none`                                                                  |
| **Overlay**        | `1` `2` `3` `4`                                                                                     |

### Categorías

#### Layout

**Display:**
`block` `inline` `inline-block` `flex` `inline-flex` `grid` `inline-grid` `inline-table` `table` `table-row` `table-caption` `table-cell` `table-column` `table-column-group` `table-footer-group` `table-header-group` `table-row-group` `contents` `flow-root` `list-item` `hidden`

**Columns:**
`columns-1` … `columns-12`

**Float:**
`float-left` `float-right` `float-none`

**Clear:**
`clear-left` `clear-right` `clear-both` `clear-none`

**Object fit:**
`object-contain` `object-cover` `object-fill` `object-none` `object-scale-down`

**Object position:**
`object-bottom` `object-center` `object-left` `object-left-bottom` `object-left-top` `object-right` `object-right-bottom` `object-right-top` `object-top`

**Overflow:**
`overflow-auto` `overflow-hidden` `overflow-clip` `overflow-visible` `overflow-scroll`
`overflow-x-{…}` `overflow-y-{…}` (mismos valores)

**Position:**
`static` `fixed` `absolute` `relative` `sticky`

**Visibility:**
`visible` `invisible` `collapse`

**Z-index:**
`z-auto` `z-0` `z-10` `z-20` `z-30` `z-40` `z-50`
`-z-10` `-z-20` `-z-30` `-z-40` `-z-50`

**Inset / posicionamiento:**
`top-{spacing}` `right-{spacing}` `bottom-{spacing}` `left-{spacing}`
`inset-{spacing}` `inset-x-{spacing}` `inset-y-{spacing}`

---

#### Flex & Grid

**Flex:**
`flex-row` `flex-row-reverse` `flex-col` `flex-col-reverse`
`flex-wrap` `flex-wrap-reverse` `flex-nowrap`
`flex-1` `flex-auto` `flex-initial` `flex-none`
`grow` `grow-0` `shrink` `shrink-0`

**Order:**
`order-1` … `order-12` `order-first` `order-last` `order-none`

**Justify:**
`justify-normal` `justify-start` `justify-end` `justify-center` `justify-between` `justify-around` `justify-evenly` `justify-stretch`
`justify-items-start` `justify-items-end` `justify-items-center` `justify-items-stretch`
`justify-self-auto` `justify-self-start` `justify-self-end` `justify-self-center` `justify-self-stretch`

**Align:**
`items-start` `items-end` `items-center` `items-baseline` `items-stretch`
`content-normal` `content-center` `content-start` `content-end` `content-between` `content-around` `content-evenly` `content-baseline` `content-stretch`
`self-auto` `self-start` `self-end` `self-center` `self-baseline` `self-stretch`

**Place:**
`place-content-center` `place-content-start` `place-content-end` `place-content-between` `place-content-around` `place-content-evenly` `place-content-baseline` `place-content-stretch`
`place-items-start` `place-items-end` `place-items-center` `place-items-baseline` `place-items-stretch`
`place-self-auto` `place-self-start` `place-self-end` `place-self-center` `place-self-stretch`

**Grid template columns:**
`grid-cols-1` … `grid-cols-12` `grid-cols-none`

**Grid column:**
`col-auto` `col-span-1` … `col-span-12` `col-span-full`
`col-start-1` … `col-start-12` `col-start-auto`
`col-end-1` … `col-end-13` `col-end-auto`

**Grid template rows:**
`grid-rows-1` … `grid-rows-12` `grid-rows-none`

**Grid row:**
`row-auto` `row-span-1` … `row-span-12` `row-span-full`
`row-start-1` … `row-start-12` `row-start-auto`
`row-end-1` … `row-end-12` `row-end-auto`

**Grid auto:**
`grid-flow-row` `grid-flow-col` `grid-flow-dense` `grid-flow-row-dense` `grid-flow-col-dense`
`auto-cols-auto` `auto-cols-min` `auto-cols-max` `auto-cols-fr`
`auto-rows-auto` `auto-rows-min` `auto-rows-max` `auto-rows-fr`

**Gap** (escala de spacing sin `auto`):
`gap-{spacing}` `gap-x-{spacing}` `gap-y-{spacing}`

---

#### Spacing

**Margin** (escala completa de spacing):
`m-{spacing}` `mt-{spacing}` `mr-{spacing}` `mb-{spacing}` `ml-{spacing}` `mx-{spacing}` `my-{spacing}`

**Padding** (escala sin `auto`):
`p-{spacing}` `pt-{spacing}` `pr-{spacing}` `pb-{spacing}` `pl-{spacing}` `px-{spacing}` `py-{spacing}`

---

#### Sizing

**Width:**
`w-auto` `w-0` `w-full` `w-screen` `w-min` `w-max` `w-fit`
`w-1/2` `w-1/3` `w-2/3` `w-1/4` `w-2/4` `w-3/4` `w-1/5` `w-2/5` `w-3/5` `w-4/5` `w-1/6` … `w-5/6` `w-1/12` … `w-11/12`
`min-w-{…}` `max-w-{…}` (mismos valores)

**Height:**
`h-auto` `h-0` `h-full` `h-screen` `h-min` `h-max` `h-fit`
`h-1/2` `h-1/3` … `h-11/12` (mismas fracciones que width)
`min-h-{…}` `max-h-{…}` (mismos valores)

---

#### Fondos

**Background color:** `bg-ui` `bg-1` `bg-2` `bg-3` `bg-4` `bg-5` `bg-disabled`
**Background attachment:** `bg-fixed` `bg-local` `bg-scroll`
**Background clip:** `bg-clip-border` `bg-clip-padding` `bg-clip-content` `bg-clip-text`
**Background origin:** `bg-origin-border` `bg-origin-padding` `bg-origin-content`
**Background position:** `bg-bottom` `bg-center` `bg-left` `bg-left-bottom` `bg-left-top` `bg-right` `bg-right-bottom` `bg-right-top` `bg-top`
**Background repeat:** `bg-repeat` `bg-no-repeat` `bg-repeat-x` `bg-repeat-y` `bg-repeat-round` `bg-repeat-space`
**Background size:** `bg-auto` `bg-cover` `bg-contain` `bg-inherit` `bg-initial` `bg-revert` `bg-unset`

---

#### Bordes

**Border width:** `border-none` `border-xs` `border-sm` `border-md` `border-lg`
**Border width (lados):** `border-t-{…}` `border-r-{…}` `border-b-{…}` `border-l-{…}` (misma escala)
**Border color:** `border-1` `border-2` `border-3` `border-4` `border-disabled` `border-inherit` `border-current` `border-transparent`
**Border style:** `border-solid` `border-dashed` `border-dotted` `border-double` `border-hidden` `border-none`

**Divide color:** `divide-1` `divide-2` `divide-3` `divide-4` `divide-disabled` `divide-inherit` `divide-current` `divide-transparent`
**Divide width:** `divide-x` `divide-y` `divide-x-{borderWidth}` `divide-y-{borderWidth}`
**Divide style:** `divide-solid` `divide-dashed` `divide-dotted` `divide-double` `divide-hidden` `divide-none`

**Outline color:** `outline-1` `outline-2` `outline-3` `outline-4` `outline-disabled` `outline-inherit` `outline-current` `outline-transparent`
**Outline width:** `outline-none` `outline-xs` `outline-sm` `outline-md` `outline-lg`
**Outline style:** `outline` `outline-dashed` `outline-dotted` `outline-double` `outline-none`
**Outline offset:** `outline-offset-none` `outline-offset-xs` `outline-offset-sm` `outline-offset-md` `outline-offset-lg`

---

#### Tipografía

**Text color:** `text-1` `text-2` `text-3` `text-4`
**Text align:** `text-left` `text-center` `text-right` `text-justify` `text-start` `text-end`
**Text transform:** `uppercase` `lowercase` `capitalize` `normal-case`
**Text overflow:** `text-ellipsis` `text-clip` `truncate`
**Vertical align:** `align-baseline` `align-top` `align-middle` `align-bottom` `align-text-top` `align-text-bottom` `align-sub` `align-super`
**White space:** `whitespace-normal` `whitespace-nowrap` `whitespace-pre` `whitespace-pre-line` `whitespace-pre-wrap` `whitespace-break-spaces`
**Word break:** `break-all` `break-keep` `break-words` `break-normal`
**Font smoothing:** `antialiased` `subpixel-antialiased`
**Font style:** `italic` `not-italic`
**Font weight:** `font-thin` `font-extralight` `font-light` `font-normal` `font-medium` `font-semibold` `font-bold` `font-extrabold` `font-black`
**Letter spacing:** `tracking-tighter` `tracking-tight` `tracking-normal` `tracking-wide` `tracking-wider` `tracking-widest`
**Line height:** `leading-{spacing}` (sin `auto` ni `zero`), además `leading-none` `leading-tight` `leading-snug` `leading-normal` `leading-relaxed` `leading-loose`

---

#### Efectos

**Opacity:** `opacity-0` `opacity-1` `opacity-2` `opacity-3` `opacity-4` `opacity-5` `opacity-6`
**Box shadow:** `shadow-sm` `shadow-md` `shadow-lg` `shadow-xl` `shadow-inner` `shadow-none`
**Overlay:** `overlay-1` `overlay-2` `overlay-3` `overlay-4`

---

#### Iconos

`icon-1` `icon-2` `icon-3` `icon-4` `icon-disabled`

## Build

```bash
npm run build       # Compila TS + genera dist/grisso.css (~800 KB)
npm run typecheck   # Type-check sin emitir (tsc --noEmit)
npm run lint        # Lint con Biome
npm test            # Tests con Vitest
npm run test:watch  # Tests en modo watch
npm run playground  # Build + tree-shake + abre playground/index.html
```

### CLI

El CLI se usa internamente y está disponible para consumidores via `npx grisso build`. Ver [CLI](#cli) para detalles completos.

Con `--content`, se usa PurgeCSS para eliminar clases no usadas (~800 KB → ~4 KB en el playground).

## Desarrollo: Añadir nuevas utilities

1. Edita el partial correspondiente en `src/partials/{category}.ts`
2. Usa `simpleClass`, `complexClass` o `customClass` con los tokens del config
3. Ejecuta `npm run build`

```ts
// src/partials/layout.ts
import { simpleClass, complexClass } from "../generators.js";

// Clase simple — genera .flex + variantes de estado y responsive
simpleClass("flex", "display", "flex", breakpoints, states);

// Clase basada en tokens — genera .p-xs, .hover-p-xs:hover, .tablet-p-xs, etc.
complexClass("p-", "padding", spacing, breakpoints, states);
```

## Publicación (release)

El proyecto usa [release-it](https://github.com/release-it/release-it) para gestionar versiones y publicación a npm. Antes de publicar se ejecutan automáticamente lint, tests y build.

```bash
npm run release              # Bump interactivo (patch/minor/major)
npm run release -- patch     # Bump patch directo
npm run release -- minor     # Bump minor directo
npm run release -- major     # Bump major directo
```

El flujo de release:

1. Ejecuta `npm run lint`, `npm test` y `npm run build`
2. Bump de versión en `package.json`
3. Commit `chore: release v{version}` + tag `v{version}`
4. Publica a npm

## grisso-reduce (tree-shaking alternativo)

`grisso-reduce/index.ts` es una herramienta alternativa de tree-shaking que escanea declaraciones `composes: ... from global` en archivos CSS y elimina clases no usadas del output.

---

Documentación en español — comentarios en el código en español.
