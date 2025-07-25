// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // まずファイル種別とモジュール設定を登録
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",   // ← これがないと import が構文エラーになる
    },
  },
  // 続いて各種プリセットを読み込む
  ...compat.extends(
    "eslint:recommended",        // JavaScript の基本ルール
    "plugin:react/recommended",  // React 推奨ルール
    "next/core-web-vitals",      // Next.js コアWebバイタル
    "next",                      // Next.js の JS/TS 両対応設定
    "next/typescript"            // TypeScript 用追加設定
  ),
];
