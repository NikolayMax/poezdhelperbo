import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: {
            js
        },
        rules: {
            // Запрещает все комментарии
            "no-inline-comments": "error",

            // Запрещает многострочные комментарии /* */
            "no-multi-str": "error",

            // Запрещает комментарии в виде строк (которые можно принять за код)
            "no-sparse-arrays": "error",
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    "selector": "interface",
                    "format": ["PascalCase"],
                    "prefix": ["I"]
                }
            ]
        },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser }
    },
    tseslint.configs.recommended,
]);