import { Solitude } from './core/api';
import './utils';
import './comments';
import { prepareAssets } from './assets';
import { lifecycle } from './core/lifecycle';
let first = true;
let navigation = 0;
document.addEventListener('astro:before-swap', () => {
  navigation++;
  document.documentElement.dataset.solitudeRuntime = 'mounting';
  lifecycle.emit('beforeNavigate');
  lifecycle.disposePage();
  document.body.style.overflow = '';
  document.documentElement.classList.remove('search-open');
  window.Fancybox?.close?.();
});
async function mount() {
  const version = ++navigation;
  document.documentElement.dataset.solitudeRuntime = 'mounting';
  await prepareAssets();
  if (version !== navigation) return;
  const { initializeApp } = await import('./main');
  if (version !== navigation) return;
  if (first) {
    first = false;
    await initializeApp();
  } else {
    await Solitude.refresh();
    lifecycle.emit('afterNavigate', { page: Solitude.page });
  }
  await import('./tag-runtime');
  window.__solitudeShortcodeRuntime?.init();
  if (version === navigation) {
    document.documentElement.dataset.solitudeRuntime = 'ready';
    Solitude.endLoading?.();
  }
}
document.addEventListener('astro:page-load', () => {
  void mount().catch((error) => {
    document.documentElement.dataset.solitudeRuntime = 'error';
    console.error('Solitude initialization failed', error);
  });
});
