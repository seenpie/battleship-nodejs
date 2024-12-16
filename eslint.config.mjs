import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import importPlug from "eslint-plugin-import-x";
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
    "plugin:import-x/recommended",
    "plugin:import-x/typescript"
  ),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      importPlug,
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
      "import-x/resolver": {
        typescript: {
          project: "./tsconfig.json"
        }
      }
    },
    rules: {
      "prettier/prettier": "warn",
      "@typescript-eslint/no-explicit-any": "error",

      "import-x/no-cycle": "error",
      "import-x/no-extraneous-dependencies": "error",
      "import-x/no-self-import": "error",
      "import-x/no-useless-path-segments": "error",

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
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ]
    }
  }
];