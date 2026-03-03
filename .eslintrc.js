/** @type {import("eslint").Linter.Config} */
module.exports = {
	settings: {
		react: { version: "detect" },
	},
	env: {
		browser: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:jsx-a11y/recommended",
	],
	parserOptions: {
		ecmaFeatures: { jsx: true },
		ecmaVersion: 12,
		sourceType: "module",
	},
	parser: "@typescript-eslint/parser",
	plugins: ["react", "import", "jsx-a11y"],
	rules: {
		// plugins
		"react/react-in-jsx-scope": "off",
		"react/prop-types": 0,
		"react/destructuring-assignment": 1,
		"react/self-closing-comp": 1,
		"react/jsx-boolean-value": 1,
		"import/order": [
			"error",
			{
				"newlines-between": "always",
				groups: [
					["builtin"],
					["external"],
					["parent", "internal", "sibling", "index", "unknown"],
				],
				alphabetize: {
					order: "asc",
					caseInsensitive: true,
				},
			},
		],
		// plugins typescript
		"@typescript-eslint/array-type": ["error", { default: "generic" }],
		"@typescript-eslint/no-empty-function": "off",

		// error prevention
		"array-callback-return": ["error", { checkForEach: true }],
		"no-await-in-loop": "error",
		"no-constant-binary-expression": "error",
		"no-constructor-return": "error",
		"no-promise-executor-return": "error",
		"no-self-compare": "error",
		"no-template-curly-in-string": "error",
		"no-unmodified-loop-condition": "error",
		"no-unreachable-loop": "error",
		"no-unused-private-class-members": "error",
		"no-use-before-define": [
			"error",
			{
				functions: false,
				classes: true,
				variables: true,
				allowNamedExports: false,
			},
		],
		"require-atomic-updates": "error",

		// Good practises
		eqeqeq: "error",
		"new-cap": ["error", { capIsNew: false }],
		"no-array-constructor": "error",
		"no-console": "error",
		"no-else-return": ["error", { allowElseIf: false }],
		"no-lonely-if": "error",
		"no-param-reassign": "error",
		"no-return-assign": "error",
		"no-var": "error",
		"prefer-const": "error",
		"prefer-rest-params": "error",
		"prefer-spread": "error",
		"prefer-template": "error",
		"no-restricted-syntax": [
			"error",
			{
				selector:
					"ImportDeclaration[source.value='react'][specifiers.0.type='ImportDefaultSpecifier']",
				message: "Default React import not allowed",
			},
		],

		// style
		curly: "error",
		"no-unneeded-ternary": ["error", { defaultAssignment: false }],
		"linebreak-style": ["error", "unix"],
		"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
	},
};
