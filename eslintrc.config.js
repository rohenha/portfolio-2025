import eslintPluginAstro from 'eslint-plugin-astro'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import eslintConfigPrettier from "eslint-config-prettier/flat"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import AirbnbBase from 'eslint-config-airbnb-base'
export default [
  ...eslintPluginAstro.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  AirbnbBase,
  {
  env: {
    es2021: true,
    node: true
  },
  extends: ["airbnb-base", "prettier"],
  plugins: {
    "jsx-a11y": jsxA11y,
    ts: typescriptEslint,
  },
  "ignorePatterns": ["utils/**/*.js", "node_modules/**/*.js"],
  rules: {
    "prettier/prettier": "error",
    "no-param-reassign": 0,
    "complexity": ["error", 5]
  },
  globals: {
    "document": true,
    "window": true,
    "Image": true,
    "grecaptcha": true,
    "localStorage": true,
    "history": true,
    "FormData": true
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module"
  },
  settings: {
    jest: {
      version: 26
    },
    "import/resolver": {
      "alias": [
        // I have my actions folder in ./shared/actions
        ["@styles", "./sources/styles"],
        ["@scripts", "./sources/scripts"]
      ]
    }
  }
}]
