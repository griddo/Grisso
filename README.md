# Grisso

> Librería de utility CSS de Griddo — similar a Tailwind CSS pero con valores basados en CSS custom properties (design tokens).

## Instalación

```bash
npm install @griddo/grisso
```

## Uso

### Opción A: CSS directo

Importa el CSS pre-compilado directamente. Útil para desarrollo o cuando no usas PostCSS.

```css
/* En tu CSS global */
@import "@griddo/grisso";
```

O en HTML:

```html
<link rel="stylesheet" href="node_modules/@griddo/grisso/dist/grisso.css" />
```

### Opción B: PostCSS plugin (recomendado — con tree-shaking)

Añade el plugin a tu configuración de PostCSS. El CSS de Grisso se inyecta automáticamente y solo las clases usadas llegan al bundle final.

```js
// postcss.config.js
import grisso from "@griddo/grisso/plugin";

export default {
  plugins: [
    grisso({
      content: ["./src/**/*.{js,ts,jsx,tsx,css}"],
    }),
  ],
};
```

Sin `content`, se incluye todo el CSS (útil en desarrollo):

```js
grisso();
```

### Opción C: API programática (sin PostCSS)

Usa `buildCSS()` directamente desde Node.js. Genera, purga y optimiza CSS sin depender de PostCSS — ideal para scripts de build, herramientas custom o entornos donde PostCSS no está disponible.

```js
import { buildCSS } from "@griddo/grisso/build";

// Build completo (todo el CSS, minificado)
const css = await buildCSS();

// Build con tree-shaking
const css = await buildCSS({
  content: ["./src/**/*.{js,ts,jsx,tsx,css}"],
  config: "./grisso.config.mjs",
});

// Build sin minificar
const css = await buildCSS({ minify: false });
```

**Opciones de `buildCSS()`:**

| Opción | Tipo | Default | Descripción |
|---|---|---|---|
| `config` | `string` | — | Ruta a `grisso.config.mjs` personalizado |
| `content` | `string[]` | — | Globs de archivos a escanear para tree-shaking |
| `minify` | `boolean` | `true` | Minificar el CSS de salida |

Sin `content`, se incluye todo el CSS. Con `content`, se eliminan las clases no usadas via PurgeCSS.

## Configuración personalizada

Crea un `grisso.config.mjs` en la raíz de tu proyecto para extender o reemplazar los tokens por defecto. Sigue el patrón de Tailwind v3:

```js
// grisso.config.mjs
export default {
  // Las keys de primer nivel REEMPLAZAN los defaults completamente
  spacing: {
    sm: "8px",
    md: "16px",
    lg: "24px",
  },

  // `extend` MERGEA con los defaults
  extend: {
    foregroundColors: {
      5: "var(--text-5)",
    },
    shadows: {
      "2xl": "var(--box-shadow-2xl)",
    },
  },
};
```

Pasa la ruta al plugin:

```js
grisso({
  content: ["./src/**/*.{js,ts,jsx,tsx,css}"],
  config: "./grisso.config.mjs",
});
```

Si no se pasa `config`, el plugin busca automáticamente `grisso.config.mjs` en el directorio de trabajo. Si no existe, usa los defaults.

Los defaults se pueden consultar importando `@griddo/grisso/config`.

## Design Tokens (CSS custom properties)

Grisso usa CSS custom properties para todos los valores. Copia `tokens-example.css` y adapta los valores a tu design system:

```bash
cp node_modules/@griddo/grisso/tokens-example.css src/tokens.css
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
@import "@griddo/grisso"; /* o via plugin de PostCSS */
```

## Clases disponibles

### Nomenclatura

```
{breakpoint}-{propiedad}-{escala}
```

Ejemplos: `flex`, `tablet-flex`, `p-md`, `desktop-mt-lg`, `text-center`

### Breakpoints (mobile-first)

| Prefijo         | Tamaño  |
| --------------- | ------- |
| _(sin prefijo)_ | 0px+    |
| `tablet-`       | 700px+  |
| `desktop-`      | 1024px+ |
| `ultrawide-`    | 1680px+ |

### Categorías

| Categoría      | Ejemplos                                                             |
| -------------- | -------------------------------------------------------------------- |
| **Layout**     | `flex`, `block`, `hidden`, `relative`, `absolute`, `overflow-hidden` |
| **Flex/Grid**  | `flex-col`, `flex-wrap`, `items-center`, `justify-between`, `gap-md` |
| **Spacing**    | `p-sm`, `pt-lg`, `mx-auto`, `mt-xs`, `mb-md`                         |
| **Sizing**     | `w-full`, `h-full`, `w-1`, `max-w-full`                              |
| **Tipografía** | `text-1`, `text-center`, `font-bold`, `leading-tight`                |
| **Fondos**     | `bg-1`, `bg-ui`, `bg-cover`, `bg-center`                             |
| **Bordes**     | `border-sm`, `divide-x`, `outline-none`                              |
| **Efectos**    | `shadow-md`, `opacity-3`, `overlay-2`                                |
| **Iconos**     | `icon-1`, `icon-3`                                                   |

## Build

```bash
npm run build       # Compila TS + genera dist/grisso.css (~156 KB)
npm run typecheck   # Type-check sin emitir (tsc --noEmit)
npm run lint        # Lint con Biome
npm test            # Tests con Vitest
npm run test:watch  # Tests en modo watch
npm run playground  # Build + tree-shake + abre playground/index.html
```

### Build script

El script de build acepta flags opcionales:

```bash
node scripts/build.js                                                  # Full build → dist/grisso.css
node scripts/build.js --config grisso.config.mjs                       # Con config personalizada
node scripts/build.js --content "src/**/*.html" --output out.css       # Tree-shaken
node scripts/build.js --config conf.mjs --content "src/**" --output x  # Todo junto
```

Con `--content`, se usa PurgeCSS para eliminar clases no usadas (156 KB → ~4 KB en el playground).

## Desarrollo: Añadir nuevas utilities

1. Edita el partial correspondiente en `src/js/partials/{category}.ts`
2. Usa `simpleClass`, `complexClass` o `customClass` con los tokens del config
3. Ejecuta `npm run build`

```ts
// src/js/partials/layout.ts
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
