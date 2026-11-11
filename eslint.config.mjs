import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "./node_modules/eslint/node_modules/@eslint/eslintrc/dist/eslintrc.cjs";
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
export default defineConfig([...compat.extends("next/core-web-vitals", "next/typescript"), {files:["tests/**/*.cjs"],rules:{"@typescript-eslint/no-require-imports":"off"}}, globalIgnores([".next/**","node_modules/**","next-env.d.ts"]) ]);
