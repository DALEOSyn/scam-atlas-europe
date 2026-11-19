import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';
import { validateContent } from './scripts/lib/content.ts';
import { yamlModuleSource } from './scripts/lib/yaml-module.ts';

const CONTENT_DIR = resolve(import.meta.dirname, 'content');
const SCENARIOS_DIR = resolve(CONTENT_DIR, 'scenarios');

/**
 * Imports *.yaml as plain JSON data. Scenario files are validated (schema +
 * source/brand cross-references) at build start, so the runtime bundle
 * ships data only and needs no Zod. Scenario files are emitted with schema
 * defaults applied (scripts/lib/yaml-module.ts).
 */
function contentPlugin(): Plugin {
  return {
    name: 'scam-atlas-content',
    buildStart() {
      const report = validateContent(CONTENT_DIR);
      for (const w of report.warnings) this.warn(w);
      if (report.errors.length > 0) this.error(`content validation failed:\n${report.errors.join('\n')}`);
    },
    transform(code, id) {
      if (!/\.ya?ml$/.test(id)) return null;
      return { code: yamlModuleSource(id, code, SCENARIOS_DIR), map: null };
    },
  };
}

/**
 * Strict CSP for production builds only (Vite dev needs inline scripts/HMR).
 * form-action 'none' backs up Red Line 2: no game form can ever submit.
 *
 * Known limitation: a <meta> CSP cannot express frame-ancestors (browsers
 * ignore it there), and GitHub Pages cannot set response headers, so the
 * game can be framed by other sites. Accepted risk: the game holds no
 * accounts or secrets and its forms never submit, so clickjacking has no
 * target. Revisit if hosting moves somewhere that can send a
 * Content-Security-Policy: frame-ancestors 'none' header (decide by G4).
 */
function cspPlugin(): Plugin {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ');
  return {
    name: 'scam-atlas-csp',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' },
    ],
  };
}

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    contentPlugin(),
    cspPlugin(),
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Scam Atlas: Europe',
        short_name: 'Scam Atlas',
        description: 'Travel Europe and learn to spot scams before they spot you.',
        lang: 'en',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#0f1b2d',
        theme_color: '#0f1b2d',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        // Precache only the game's own build output. No runtimeCaching: nothing
        // from other origins is ever fetched or cached.
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
        // Story art is precached for offline play, except review material that the game never loads
        // (ART_DIRECTION §11, §12.1: art/samples and art/rig).
        globIgnores: ['**/art/samples/**', '**/art/rig/**'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [],
      },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});
