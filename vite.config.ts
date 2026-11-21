import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';
import { validateContent } from './scripts/lib/content.ts';
import { yamlModuleSource } from './scripts/lib/yaml-module.ts';
import { chapterChunkName } from './scripts/lib/chunks.ts';

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

/**
 * GitHub Pages fallback (T-4.9): Pages answers an unknown path such as /scam-atlas-europe/qr/<id> with 404.html.
 * The game has no URL router (QR routes are in-game payloads, never navigated to), so 404.html is a copy of the
 * built index.html: a deep link opens the start screen, as the service worker's navigateFallback already does
 * once installed. Asset URLs in it are absolute (base-prefixed), so it works at any depth. Not precached.
 */
function pagesFallbackPlugin(): Plugin {
  return {
    name: 'scam-atlas-pages-404',
    apply: 'build',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const index = bundle['index.html'];
        if (index?.type !== 'asset') this.error('pages-404: index.html missing from the bundle');
        this.emitFile({ type: 'asset', fileName: '404.html', source: index.source });
      },
    },
  };
}

/** One theme colour for the page (index.html) and the installed app (manifest); T-4.6 P4. */
const THEME_COLOR = '#fbf6ec'; // --p-paper-50, the light page background (tokens.css)

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    contentPlugin(),
    cspPlugin(),
    pagesFallbackPlugin(),
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      // The workbox glob already precaches the icons (T-4.6: no duplicate entries).
      includeManifestIcons: false,
      manifest: {
        name: 'Scam Atlas: Europe',
        short_name: 'Scam Atlas',
        description: 'Travel Europe and learn to spot scams before they spot you.',
        lang: 'en',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#0f1b2d',
        theme_color: THEME_COLOR,
        // T-4.6 P4: the SVG for any size, plus PNGs rendered from our own icon SVGs (scripts/build-icons.ts).
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache only the game's own build output. No runtimeCaching: nothing
        // from other origins is ever fetched or cached.
        // Icons are matched here; the plugin adds manifest.webmanifest itself (T-4.6: no duplicate entries).
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        // Story art is precached for offline play, except review material that the game never loads
        // (ART_DIRECTION §11, §12.1: art/samples and art/rig), and the GitHub Pages 404.html copy (T-4.9).
        globIgnores: ['**/art/samples/**', '**/art/rig/**', '404.html'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // T-4.6 P1: with skipWaiting (autoUpdate), the new worker also takes control of the open tab at once,
        // so a first visit can go offline in the same tab instead of depending on the HTTP cache.
        clientsClaim: true,
        runtimeCaching: [],
      },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: false,
    rolldownOptions: {
      // T-4.6 P1: one lazy chunk per chapter (scripts/lib/chunks.ts), budgets in tests/unit/bundle-guard.test.ts.
      output: { codeSplitting: { groups: [{ name: (id: string) => chapterChunkName(id) }] } },
    },
  },
});
