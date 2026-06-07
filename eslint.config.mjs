import { config } from "@repo/eslint-config/base.mjs";

export default [
  ...config,
  {
    ignores: [".lintstagedrc.mjs", "eslint.config.mjs"],
  },
];
