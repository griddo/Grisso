# Grisso

> Librería de utility CSS de Griddo con variantes responsive y de estado, basada en CSS custom properties (design tokens).

> [!WARNING]
> En la versión estable 2.0, el paquete se moverá a `@griddo/grisso`. El nombre actual `@hiscovega/grisso` dejará de recibir actualizaciones a partir de ese momento.

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

### Categorías

| Categoría      | Ejemplos                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| **Layout**     | `flex`, `block`, `hidden`, `relative`, `absolute`, `overflow-hidden`, `inset-0`, `inset-x-sm`, `z-10` |
| **Flex/Grid**  | `flex-col`, `flex-wrap`, `items-center`, `justify-between`, `gap-md`                                  |
| **Spacing**    | `p-sm`, `pt-lg`, `mx-auto`, `mt-xs`, `mb-md`                                                          |
| **Sizing**     | `w-full`, `h-full`, `w-1/2`, `w-2/3`, `h-1/4`, `max-w-full`                                           |
| **Tipografía** | `text-1`, `text-center`, `font-bold`, `font-light`, `leading-snug`, `tracking-tight`                  |
| **Fondos**     | `bg-1`, `bg-ui`, `bg-cover`, `bg-center`                                                              |
| **Bordes**     | `border-sm`, `border-1`, `border-t-sm`, `divide-x`, `outline-none`                                    |
| **Efectos**    | `shadow-md`, `opacity-3`, `overlay-2`                                                                 |
| **Iconos**     | `icon-1`, `icon-3`                                                                                    |

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
