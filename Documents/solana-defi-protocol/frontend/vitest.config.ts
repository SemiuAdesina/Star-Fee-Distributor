import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      reporter: ["text", "lcov"],
      thresholds: {
        statements: 0.8,
        branches: 0.8,
        functions: 0.8,
        lines: 0.8
      }
    },
    setupFiles: ["./vitest.setup.ts"]
  }
});

