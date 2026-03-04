/**
 * Escapa los `:` dentro de composes declarations para
 * compatibilidad con CSS Modules.
 *
 * Input:  composes: flex hover:bg-1 tablet:p-sm from global;
 * Output: composes: flex hover\:bg-1 tablet\:p-sm from global;
 */
export function escapeGrissoComposes(css: string): string {
	return css.replace(
		/composes:\s*([^;]+?)\s+from\s+global/g,
		(_match, classlist: string) => {
			const escaped = classlist
				.trim()
				.split(/\s+/)
				.map((cls) => cls.replace(/:/g, "\\:"))
				.join(" ");
			return `composes: ${escaped} from global`;
		},
	);
}
