import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";

export default defineConfig([
    { ignores: ["dist/", "node_modules/", "coverage/", "data/", "*.config.*"] },
    {
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: { globals: { ...globals.node, ...globals.commonjs } },
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: {
            js
        },
        rules: {
            "no-inline-comments": "error",
            "no-multi-str": "error",
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
        extends: ["js/recommended"]
    },
    tseslint.configs.recommended,
    {
        files: ["**/*.{ts,mts,cts}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off"
        }
    },
    prettier
]);
