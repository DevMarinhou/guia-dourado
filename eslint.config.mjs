import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals, // inclui eslint-plugin-jsx-a11y
  ...nextTs,
  {
    // ADR-0002: o domínio é TypeScript puro (sem React, Next.js, adaptadores ou I/O).
    files: ['src/dominio/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['react', 'react-dom', 'next', 'next/*', 'next-intl', 'next-intl/*'], message: 'O domínio não pode depender de React/Next.' },
            { group: ['@/adaptadores/*', '@/funcionalidades/*', '@/componentes/*', '@/app/*', '@/lib/*'], message: 'O domínio não pode depender de camadas externas.' },
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'entrega/**', 'wireframes/**', 'ferramentas/**/*.mjs', 'public/mediapipe/**']),
]);

export default eslintConfig;
