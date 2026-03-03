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

```bash
npm install @griddo/grisso
```

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

Sin `content`, se incluye todo el CSS (útil en desarrollo):

```js
require("@griddo/grisso/plugin")()
```

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

| Prefijo | Tamaño |
|---|---|
| *(sin prefijo)* | 0px+ |
| `tablet-` | 700px+ |
| `desktop-` | 1024px+ |
| `ultrawide-` | 1680px+ |

### Categorías

| Categoría | Ejemplos |
|---|---|
| **Layout** | `flex`, `block`, `hidden`, `relative`, `absolute`, `overflow-hidden` |
| **Flex/Grid** | `flex-col`, `flex-wrap`, `items-center`, `justify-between`, `gap-md` |
| **Spacing** | `p-sm`, `pt-lg`, `mx-auto`, `mt-xs`, `mb-md` |
| **Sizing** | `w-full`, `h-full`, `w-1/2`, `max-w-full` |
| **Tipografía** | `text-1`, `text-center`, `font-bold`, `leading-tight` |
| **Fondos** | `bg-1`, `bg-ui`, `bg-cover`, `bg-center` |
| **Bordes** | `border`, `border-2`, `rounded`, `outline-none` |
| **Efectos** | `shadow-md`, `opacity-3`, `overlay-2` |
| **Iconos** | `icon-1`, `icon-3` |

## Build

```bash
npm run build    # Compila SCSS → dist/grisso.css
npm run watch    # Modo watch para desarrollo
npm run playground  # Build + abre playground/index.html en el navegador
```

## Desarrollo: Añadir nuevas utilities

1. Crea un partial en `src/partials/{category}/_name.scss`
2. Usa `grisso_simple_class` o `grisso_complex_class`
3. Importa el partial en `src/grisso.scss`
4. Ejecuta `npm run build`

```scss
// src/partials/layout/_display.scss
@include grisso_simple_class("flex", (display, flex));
// Genera: .flex, .tablet-flex, .desktop-flex, .ultrawide-flex

@include grisso_complex_class("p-", padding, $spacing);
// Genera: .p-xs, .p-sm, ..., .tablet-p-xs, .desktop-p-sm, ...
```

## grisso-reduce (tree-shaking alternativo)

`grisso-reduce/index.ts` es una herramienta alternativa de tree-shaking que escanea declaraciones `composes: ... from global` en archivos CSS y elimina clases no usadas del output.

---

Documentación en español — comentarios en el código SCSS en español.
