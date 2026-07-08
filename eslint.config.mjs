import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

// 근거: docs/design/next-eslint-rules.md
// nextVitals에 번들된 @next/next/* 21개 중 App Router에서 실제로 발동 가능한 9개만 켜고,
// pages/_document.tsx 전용(대상 없음) + 미사용 기능(구글폰트/GA/polyfill.io) 관련 12개는 끈다.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-document-import-in-page": "off",
      "@next/next/no-duplicate-head": "off",
      "@next/next/no-head-import-in-document": "off",
      "@next/next/no-script-component-in-head": "off",
      "@next/next/no-styled-jsx-in-document": "off",
      "@next/next/no-title-in-document-head": "off",
      "@next/next/no-page-custom-font": "off",
      "@next/next/no-before-interactive-script-outside-document": "off",
      "@next/next/google-font-display": "off",
      "@next/next/google-font-preconnect": "off",
      "@next/next/next-script-for-ga": "off",
      "@next/next/no-unwanted-polyfillio": "off",

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      eqeqeq: "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
