// eslint.config.js
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "next/core-web-vitals",
    "next",
    "next/typescript"
  ),
];
