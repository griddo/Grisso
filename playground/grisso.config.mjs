/**
 * Ejemplo de configuración personalizada de Grisso.
 * Usa este archivo como referencia para tu propio grisso.config.mjs.
 *
 * - Top-level keys REEMPLAZAN los defaults completamente
 * - `extend` MERGEA con los defaults
 */
export default {
	extend: {
		// Añadir un nuevo color de fondo
		backgroundColors: {
			brand: "var(--brand-1)",
			foo: "var(--brand-foo)",
		},
		// Añadir una nueva escala de sombra
		shadows: {
			"2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
		},
		// Añadir un nuevo color de texto
		foregroundColors: {
			brand: "var(--brand-1)",
		},
	},
};
