import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  console.info({ command, mode });

  return {
    test: {
      globals: true,
      setupFiles: "./setupTests.ts",
      environment: "jsdom",
      dangerouslyIgnoreUnhandledErrors: true,
    },
  };
});
