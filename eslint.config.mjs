import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";

export default defineConfig([
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts", "playwright-report/**", "test-results/**"]),
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    plugins: { "@next/next": nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules, ...nextPlugin.configs["core-web-vitals"].rules },
  },
]);
