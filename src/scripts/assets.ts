import { Solitude } from './core/api';
export async function prepareAssets() {
  const c = Solitude.config,
    cdn = c.cdn;
  window.meting_api = c.meting_api;
  const scripts: string[] = [],
    styles: string[] = [];
  if (c.lazyload.enable) scripts.push(cdn.lazyload);
  if (c.lightbox === 'fancybox') {
    scripts.push(cdn.fancyapps_js);
    styles.push(cdn.fancyapps_css);
  }
  if (
    c.capsule.enable ||
    (c.music.enable && Solitude.page.page === 'music') ||
    (c.brevity.music && Boolean(document.querySelector('#bber meting-js')))
  ) {
    styles.push(cdn.aplayer_css);
    await Solitude.loadScript(cdn.aplayer_js).catch(() => {});
    scripts.push(cdn.meting_js);
  }
  if (c.post.covercolor.enable && c.post.covercolor.mode === 'local')
    scripts.push(cdn.colorthief);
  if (c.search.enable && c.search.type === 'algolia') {
    await Solitude.loadScript(cdn.algoliasearch).catch(() => {});
    scripts.push(cdn.instantsearch);
    styles.push(cdn.instantsearch_css);
  }
  if (c.mermaid && document.querySelector('.mermaid'))
    scripts.push(cdn.mermaid);
  if (c.typeit && document.querySelector('[data-typeit]'))
    scripts.push(cdn.typeit);
  if (c.katex.enable && c.katex.copytex && document.querySelector('.katex'))
    scripts.push(cdn.katex_copytex);
  if (document.querySelector('.waterfall'))
    scripts.push(`${c.root}js/third_party/waterfall.min.js`);
  const outcomes = await Promise.allSettled([
    ...styles.filter(Boolean).map((s) => Solitude.loadStyle(s)),
    ...scripts.filter(Boolean).map((s) => Solitude.loadScript(s)),
  ]);
  outcomes.forEach((result) => {
    if (result.status === 'rejected')
      console.warn('Optional Solitude integration unavailable:', result.reason);
  });
}
