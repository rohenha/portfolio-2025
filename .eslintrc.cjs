module.exports = {
  root: true,
  env: { es2021: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json"
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:astro/recommended",
    "prettier"
  ],
  plugins: ["@typescript-eslint", "astro"],
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"]
      }
    },
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off"
      }
    }
  ],
  ignorePatterns: [
    "node_modules/", "dist/", "build/", "public/"
  ],
  rules: {
    // Sécurité et clarté TS
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/return-await": "error",
    // JS/Code style strict
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "no-var": "error",
    "prefer-const": "error",
    "prefer-template": "error",
    "no-duplicate-imports": "error",
    "no-console": "warn"
  }
};
