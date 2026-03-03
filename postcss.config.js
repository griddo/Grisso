import postcssPresetEnv from "postcss-preset-env";
import combineDuplicatedSelectors from "postcss-combine-duplicated-selectors";
import discardEmpty from "postcss-discard-empty";
import sortMediaQueries from "postcss-sort-media-queries";
import minify from "postcss-minify";

export default {
	plugins: [
		postcssPresetEnv({
			features: { "nesting-rules": true },
			autoprefixer: { flexbox: "no-2009" },
			stage: 1,
		}),
		combineDuplicatedSelectors({
			removeDuplicatedProperties: true,
		}),
		discardEmpty,
		sortMediaQueries,
		minify,
	],
};
