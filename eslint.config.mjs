import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // ← これがないと `import` がエラーになる
    },
  },
  ...compat.extends(
    "eslint:recommended",        // ← JavaScriptベースの基本設定
    "plugin:react/recommended",  // ← React推奨ルール
    "next/core-web-vitals",      // ← Next.js 用
    "next",                      // ← Next.js TS or JS 両対応
    "next/typescript"            // ← TS 用（TSファイルがあるなら）
  ),
];

export default eslintConfig;
