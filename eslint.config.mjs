import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

// Root scripts only. apps/* bring their own config (ADR-0014).
const eslintConfig = defineConfig([
  globalIgnores(["apps/**", "supabase/**", ".agents/**"]),
  {
    files: ["scripts/**/*.mjs"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
]);

export default eslintConfig;
