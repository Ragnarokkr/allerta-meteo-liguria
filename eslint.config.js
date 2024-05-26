import jsConfig from "@eslint/js";
import tsConfig from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  jsConfig.configs.recommended,
  ...tsConfig.configs.recommended,
  eslintConfigPrettier,
];
