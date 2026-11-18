import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app.tsx';
import './styles/tokens.css';
import './global.css';

const root = document.getElementById('app');
if (root) render(<App />, root);

// Service worker precaches only the game's own build output (see vite.config.ts).
if (import.meta.env.PROD) registerSW({ immediate: true });
