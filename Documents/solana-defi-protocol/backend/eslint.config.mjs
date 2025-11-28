import js from "@eslint/js";
import security from "eslint-plugin-security";
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
    ignores: ["dist", "node_modules"]
  },
  js.configs.recommended,
  ...typedConfigs,
  {
    files: ["**/*.ts"],
    plugins: {
      security
    },
    rules: {
      ...security.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true
        }
      ],
      "security/detect-object-injection": "off"
    }
  },
  prettier
);

