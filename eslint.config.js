// eslint.config.js
const { FlatCompat } = require("@eslint/eslintrc");
const { dirname } = require("path");
const { fileURLToPath } = require("url");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  // すべての JS / TS / JSX / TSX ファイルをモジュールとしてパース
  {
    files: ["**/*.[jt]s?(x)"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",       // ← import を許可
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  // Next.js＋React＋TypeScript 向けの推奨設定を全部まとめ読み
  ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "next/core-web-vitals",
    "next",
    "next/typescript"
  ),
];
