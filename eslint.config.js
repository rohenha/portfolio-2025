import tseslint from "@typescript-eslint/eslint-plugin"
import markdown from "@eslint/markdown"
import eslintPluginAstro from "eslint-plugin-astro"
import jsxA11y from "eslint-plugin-jsx-a11y"
import eslintConfigPrettier from "eslint-config-prettier/flat"

export default [
	eslintConfigPrettier,
	...eslintPluginAstro.configs.recommended,
	jsxA11y.flatConfigs.recommended,
	{
		ignores: ["node_modules/", "build/", "dist/", "public/"],
		plugins: { "@typescript-eslint": tseslint },
		rules: {
			"@typescript-eslint/no-unused-vars": "error",
		},
	},
	{
		files: ["**/*.md"],
		plugins: { markdown },
		language: "markdown/commonmark",
		extends: ["markdown/recommended"],
	},
]
