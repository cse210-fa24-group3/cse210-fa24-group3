import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Start with recommended settings
  pluginJs.configs.recommended,

  // Then override any rules you want to ignore
  {
    languageOptions: { 
      globals: globals.browser
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "warn"
    }
  }
];