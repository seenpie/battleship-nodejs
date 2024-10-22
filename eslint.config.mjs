import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier
    },
    ignores: ["dist", "*.config.*", "node_modules"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "module",

      parserOptions: {
        project: "./tsconfig.json"
      }
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json"
        }
      }
    },
    rules: {
      "prettier/prettier": "warn",
      "@typescript-eslint/no-explicit-any": "error",

      "no-console": [
        "warn",
        {
          allow: ["warn", "error"]
        }
      ],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ]
    }
  }
];