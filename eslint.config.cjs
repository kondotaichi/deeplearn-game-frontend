// eslint.config.cjs
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  // すべての JS/TS ファイルを ES モジュールとして扱う
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  // ESLint のベーシック＋React＋Next.js＋TypeScript 用プリセット
  ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "next/core-web-vitals",
    "next",
    "next/typescript"
  ),
];
