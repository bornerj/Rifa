import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: [
      "src/**/*.{ts,tsx}",
      "scripts/**/*.ts",
      "next.config.ts",
      "tailwind.config.ts",
      "drizzle.config.ts",
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "no-console": ["error", { allow: ["info", "warn", "error"] }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "off",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "kernel/**", "memory/**", "docs/**"],
  },
];
