// spot-generator 専用 vitest config（メインの jsdom + React 環境を借りずに node で走らせる）
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["scripts/spot-generator/__tests__/**/*.test.mjs"],
  },
});
