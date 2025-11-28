import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

const typedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname
    }
  }
}));

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      ".next",
      "out",
      "coverage",
      "eslint.config.mjs",
      "next.config.mjs",
      "postcss.config.mjs",
      "vitest.config.ts",
      "vitest.setup.ts"
    ]
  },
  js.configs.recommended,
  ...typedConfigs,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": [
        "error",
        {
          allow: ["warn", "error"]
        }
      ]
    }
  },
  prettier
);

