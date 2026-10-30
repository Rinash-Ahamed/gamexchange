import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import { imageLoadingPlugin } from "./scripts/eslint-image-loading.mjs";

export default defineConfig([
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts", "playwright-report/**", "test-results/**"]),
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    plugins: { "@next/next": nextPlugin, "gamexchange-images": imageLoadingPlugin },
    rules: { ...nextPlugin.configs.recommended.rules, ...nextPlugin.configs["core-web-vitals"].rules, "gamexchange-images/explicit-intent": "error" },
  },
]);
