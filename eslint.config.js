// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const FORM_ONLY_IN_SIMULATED =
  'Render forms only through src/ui/SimulatedForm.tsx (Red Line 2: game forms never submit anywhere).';

export default tseslint.config(
  { ignores: ['dist/', 'dev-dist/', 'coverage/', 'playwright-report/', 'test-results/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Runtime game code: no network, no raw HTML, forms only via SimulatedForm.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/ui/SimulatedForm.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: "JSXOpeningElement[name.name='form']", message: FORM_ONLY_IN_SIMULATED },
        { selector: "JSXAttribute[name.name='action']", message: FORM_ONLY_IN_SIMULATED },
        { selector: "JSXAttribute[name.name='formAction']", message: FORM_ONLY_IN_SIMULATED },
        { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: 'Render content as text, never as HTML.' },
        { selector: "MemberExpression[property.name=/^(innerHTML|outerHTML)$/]", message: 'Render content as text, never as HTML.' },
        { selector: "MemberExpression[property.name='sendBeacon']", message: 'No tracking (Red Line 7).' },
        {
          selector:
            "MemberExpression[object.name=/^(window|globalThis|self|top|parent)$/][property.name=/^(fetch|XMLHttpRequest|WebSocket|EventSource|open)$/]",
          message: 'No runtime network calls or new windows; content is bundled at build time.',
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'No runtime network calls; content is bundled at build time.' },
        { name: 'XMLHttpRequest', message: 'No runtime network calls.' },
        { name: 'WebSocket', message: 'No runtime network calls.' },
        { name: 'EventSource', message: 'No runtime network calls.' },
      ],
    },
  },
);
