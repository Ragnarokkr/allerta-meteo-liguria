import jsConfig from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tsConfig from "typescript-eslint";

export default [
  jsConfig.configs.recommended,
  ...tsConfig.configs.recommended,
  eslintConfigPrettier,
];
