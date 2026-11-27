import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // TODO (eslint-config-next 16.4 made this an error; 5 pre-existing sites):
      // fix them, then drop this override.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
