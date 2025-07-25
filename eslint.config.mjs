import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // まず全ファイルを ESM + JSX 対応でパース
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        jsx: true,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // 推奨ルール群を FlatCompat で展開
  ...compat.extends(
    "eslint:recommended",        // JavaScript 一般向け
    "plugin:react/recommended",  // React 向け
    "next/core-web-vitals",      // Next.js + Core Web Vitals
    "next/typescript"            // Next.js + TypeScript
  ),
];
