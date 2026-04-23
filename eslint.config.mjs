import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Worktrees Claude Code — contiennent leurs propres .next/ et scripts
    // générés qui ne doivent pas être linted.
    ".claude/**",
    // Maquettes Claude Design — chargées via <script type="text/babel"> en
    // standalone, pas du code applicatif. Elles trippent no-require-imports
    // (Babel standalone inlined) et no-assign-module-variable (UMD).
    "maquettes/**",
    "design-system/**",
  ]),
]);

export default eslintConfig;
