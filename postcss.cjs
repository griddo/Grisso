/**
 * Wrapper CommonJS del plugin PostCSS de Grisso.
 * Carga dinámicamente el módulo ESM — funciona porque el hook Once es async.
 */
let _mod;

const plugin = function (opts) {
	let delegate;
	return {
		postcssPlugin: "grisso-apply",
		async Once(root, helpers) {
			if (!_mod) _mod = await import("./lib/postcss.js");
			if (!delegate) delegate = _mod.default(opts);
			return delegate.Once(root, helpers);
		},
	};
};
plugin.postcss = true;
module.exports = plugin;
