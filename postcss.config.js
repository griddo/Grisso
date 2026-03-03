/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require("path");

module.exports = {
	plugins: [
		require("postcss-preset-env")({
			features: { "nesting-rules": true },
			autoprefixer: { flexbox: "no-2009" },
			stage: 1,
			importFrom: [join(__dirname, "../css/.themes/global-theme.css")],
		}),
		require("postcss-combine-duplicated-selectors")({
			removeDuplicatedProperties: true,
		}),
		require("postcss-discard-empty"),
		require("postcss-sort-media-queries"),
		require("postcss-minify"),
	],
};
