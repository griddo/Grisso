/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import fs from "fs";
import path from "path";

// @ts-expect-error no types for css-byebye
import cssbyebye from "css-byebye";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const COMPILED_INPUT_FILE = "./src/themes/_css/grisso.css";
const OPTIMIZE_OUTPUT_FILE = "./src/themes/_css/grisso.min.css";
const PROTECTED_CLASESS: Array<string> = ["bg-"];

main().catch((error) => {
	console.error("Error in Grisso optimize -> main:", error);
});

async function main() {
	// Read Grisso CSS file as string
	const sourceGrissoFileContent = fs.readFileSync(COMPILED_INPUT_FILE, "utf8");
	// Return an array of grisso clasess as ["foo", "bar", "taz"]
	const allGrissoRules = await getAllRules(sourceGrissoFileContent);
	// Return an array of the class used in `composes: ... from global` ["foo", "taz"]
	// We add the protected class to avoid delete them from grisso main css.
	const reactProjectRules = [
		...(await parseAndInspectCSS("./src/ui")),
		...PROTECTED_CLASESS,
	];

	// Classes to remove
	const rulesToRemove = allGrissoRules
		.filter((grissoRule) => !reactProjectRules.includes(grissoRule))
		.map((v) => `.${v}`); // Añadimos el .

	// Remove non unsed classes
	const result = postcss(cssbyebye({ rulesToRemove })).process(
		sourceGrissoFileContent
	);

	// Write out the final css file
	fs.writeFileSync(
		OPTIMIZE_OUTPUT_FILE,
		`/* Grisso minified and reduced CSS file
   Import this file inside griddo.root.tsx file.
*/
${result.css}`
	);
}

async function getAllRules(src: string) {
	const cssFileContent = src;

	const classes: Array<string> = [];
	postcss()
		.process(cssFileContent, { from: undefined })
		.then((result) => {
			result.root.walkRules((rule) => {
				selectorParser((selectors) => {
					selectors.walkClasses((selector) => {
						classes.push(selector.value);
					});
				}).processSync(rule.selector);
			});
		})
		.catch((error) => {
			console.error("Error:", error);
		});

	return classes;
}

async function parseAndInspectCSS(
	rootFolderWithCSSFiles: string
): Promise<Array<string>> {
	const cssFileContent = await getAllCSSAsString(rootFolderWithCSSFiles);
	const result = await postcss([]).process(cssFileContent, { from: undefined });
	const composesClasses: Array<string> = [];
	result.root?.walkRules((rule) => {
		rule.walkDecls((decl) => {
			if (
				decl.prop.startsWith("composes") &&
				decl.value.endsWith("from global")
			) {
				composesClasses.push(decl.value);
			}
		});
	});

	const filteredComposesClasses = composesClasses
		.map((v) => v.split("from global"))
		.flat()
		.map((v) => v.split(" "))
		.flat()
		.filter(Boolean);

	const uniqueComposesClasses = [
		...new Set([...filteredComposesClasses.sort()]),
	];

	return uniqueComposesClasses;
}

async function getAllCSSAsString(dirPath: string) {
	let result = "";

	const files = await fs.promises.readdir(dirPath);

	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const stats = await fs.promises.stat(filePath);

		if (stats.isDirectory()) {
			result += await getAllCSSAsString(filePath);
		} else if (stats.isFile() && path.extname(filePath) === ".css") {
			const fileContent = await fs.promises.readFile(filePath, "utf-8");
			result += fileContent;
		}
	}

	return result;
}
