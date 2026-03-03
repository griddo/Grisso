# Grisso

> Griddo CSS utility library.

- [ Tipos de clases ](#tipos-de-clases)
- [ Crear Clases ](#tipos-de-clases)
- [ Build del SCSS -> CSS](#build)
- [ Archivos GRISSO](#archivos-de-grisso)
- [ Snippet para VSC y WebStorm](#snippets-para-vsc-y-webstorm)

## Tipos de clases

**Esencialmente hay dos maneras de generar utilities de manera automática con las funciones provistas por GRISSO. Después hay algunas que están configuradas de manera aislada, como la utility `_width` que usa sus propios mixins.**

### 1 Utilidades simples breakpoint + name:

`flex`, `tablet--flex`, `desktop--flex`, etc..

### 2 Utilidades complejas normalmente desde una escala de valores: breakpoint + name + scale:

`p`, `p-sm`, `p-xl`, `tablet-p`, `tablet-p-xl`

---

## Crear clases

### Cómo añadir una nueva utility simple, por ejemplo un `display: flex`:

Por emeplo en un archivo `_display.css` que importaremos en `grisso.scss` usando la función `grisso_simple_class`.

```scss
// _display.scss

@include grisso_simple_class("flex", (display, flex));
```

Esto genera

```css
.flex {
	display: flex;
}

@media (min-width: 700px) {
	.tablet-flex {
		display: flex;
	}
}

@media (min-width: 1024) {
	.desktop-flex {
		display: flex;
	}
}

/* etc ... */
```

### Cómo añadir una nueva utility compleja por ejemplo un padding.

Por emeplo en un archivo `_padding.css` que importaremos en `grisso.scss` usamos la función `grisso_complex_class`.

```scss
// _padding.scss

@include grisso_complex_class("p-", padding, $spacing);
```

Esto genera

```css
.p {
	display: flex;
}
.p-sm {
	display: flex;
}
.p-md {
	display: flex;
}
.p-lg {
	display: flex;
}
... @media (min-width: 700px) {
	.tablet-p {
		display: flex;
	}
	.tablet-p-sm {
		display: flex;
	}
	.tablet-p-md {
		display: flex;
	}
	.tablet-p-lg {
		display: flex;
	}
}

@media (min-width: 700px) {
	.desktop-p {
		display: flex;
	}
	.desktop-p-sm {
		display: flex;
	}
	.desktop-p-md {
		display: flex;
	}
	.desktop-p-lg {
		display: flex;
	}
}

/* etc ... */
```

## Build

- `yarn grisso:build` Crear `src/css/.grisso/grisso.css`

- `yarn grisso:watch` El modo watch por si estamos trabajando constantemente (es un poco lento porque optimiza etc..)

## Archivos de Grisso

### `grisso.config.scss`

Archivo de configuración los `breakpoints`, `breakpoint-sizes` y otras `primitives`.

TODO: Utilizar las que hay en `src/themes/`

### `grisso.scss`

Archivo index para importar todos los partials y generar un `grisso.css` con todas las utiliti classes.

### `partials`

Todas las utility classes escritas en SASS

### `partials/mixigs`

Funciones y mixings para generar las utility classes.

## Snippets para Visual Studio Code (y compatibles) y WebStorm

Para agilizar y facilitar el rellenado de clases dentro de _composes:_, hay una utilidad de autocompletado que muestra las clases que existen en el ecosistema Grisso. Son un snippet para VSC y un Live Templata para WebStorm. Se activa escribiendo _grisso_ en los archivos scss. Como las clases de Grisso van evolucionando con el proyecto, estos snippets deben autogenerarse.

- El snippet de Visual Studio Code se genera con el script npm **grisso:snippets**, que se lanza en cada build. Es un snippet que va asociado al proyecto, por lo que va en seguimiento en git, en **/.vscode/grisso.code-snippets**.
- En el caso de WebStorm, es un Live Template. Como tal, va asociado al usuario, y hay que generarlo manualmente e importarlo cuando se necesecite.

El comando que genera el snippet y live template es el siguiente:

```bash
# Este genera solo la versión de VSC en la carpeta **/.vscode/grisso.code-snippets** es e
npx tsx scripts/grisso-vsc-snippet-generator
# es lo mismo que npm run grisso:snippets

# Para generar la versión también de WebStorm
npx tsx scripts/grisso-vsc-snippet-generator --webstorm
```
