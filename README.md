# Grisso

> Librería de utility CSS de Griddo con valores basados en CSS custom properties (design tokens).

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

  // `extend` MERGEA con los defaults (arrays se concatenan)
  extend: {
    foregroundColors: {
      5: "var(--text-5)",
    },
    shadows: {
      "2xl": "var(--box-shadow-2xl)",
    },
    // Se concatena con el default [/^bg-/]
    safelist: [/^p-/],
  },
};
```

La `safelist` controla qué clases se protegen del tree-shaking. Por defecto incluye `[/^bg-/]`. En top-level reemplaza, en `extend` se concatena. Acepta `RegExp` y `string`.

Si no se pasa `config` a `buildCSS()`, busca automáticamente `grisso.config.mjs` en el directorio de trabajo. Si no existe, usa los defaults.

Los defaults se pueden consultar importando `@hiscovega/grisso/config`.

## Design Tokens (CSS custom properties)

Grisso usa CSS custom properties para todos los valores. Copia `tokens-example.css` y adapta los valores a tu design system:

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
{breakpoint}-{propiedad}-{escala}
```

Ejemplos: `flex`, `tablet-flex`, `p-md`, `desktop-mt-lg`, `text-center`, `w-1/2`, `z-10`, `tracking-tight`

### Breakpoints (mobile-first)

| Prefijo         | Tamaño  |
| --------------- | ------- |
| _(sin prefijo)_ | 0px+    |
| `tablet-`       | 700px+  |
| `desktop-`      | 1024px+ |
| `ultrawide-`    | 1680px+ |

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
npm run build       # Compila TS + genera dist/grisso.css (~154 KB)
npm run typecheck   # Type-check sin emitir (tsc --noEmit)
npm run lint        # Lint con Biome
npm test            # Tests con Vitest
npm run test:watch  # Tests en modo watch
npm run playground  # Build + tree-shake + abre playground/index.html
```

### CLI

El CLI se usa internamente y está disponible para consumidores via `npx grisso build`. Ver [CLI](#cli) para detalles completos.

Con `--content`, se usa PurgeCSS para eliminar clases no usadas (~154 KB → ~4 KB en el playground).

## Desarrollo: Añadir nuevas utilities

1. Edita el partial correspondiente en `src/partials/{category}.ts`
2. Usa `simpleClass`, `complexClass` o `customClass` con los tokens del config
3. Ejecuta `npm run build`

```ts
// src/partials/layout.ts
import { simpleClass, complexClass } from "../generators.js";

// Clase simple — genera .flex + variantes responsive
simpleClass("flex", "display", "flex", breakpoints);

// Clase basada en tokens — genera .p-xs, .p-sm, etc. + variantes responsive
complexClass("p-", "padding", spacing, breakpoints);
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
