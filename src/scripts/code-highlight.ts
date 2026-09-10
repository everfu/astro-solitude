import { Solitude } from './core/api';
export async function initializeCodeBlocks(signal: AbortSignal) {
  const config = Solitude.config.highlight;
  if (!config?.enable) return;
  document
    .querySelectorAll<HTMLPreElement>('article pre:not(.chartjs-src)')
    .forEach((pre) => {
      if (pre.closest('.solitude-code')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'solitude-code';
      wrapper.dataset.lineNumbers = String(config.line_numbers !== false);
      wrapper.dataset.collapsed = 'true';
      wrapper.style.setProperty(
        '--code-max-height',
        `${config.max_height || 360}px`,
      );
      pre.replaceWith(wrapper);
      wrapper.append(pre);
      const toolbar = document.createElement('div');
      toolbar.className = 'code-toolbar';
      wrapper.prepend(toolbar);
      const label = document.createElement('span');
      label.textContent =
        pre.dataset.language ||
        pre.querySelector('code')?.className.replace('language-', '') ||
        'Code';
      toolbar.append(label);
      if (config.copy) {
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.textContent = 'Copy';
        copy.setAttribute('aria-label', 'Copy code');
        toolbar.append(copy);
        copy.addEventListener(
          'click',
          async () => {
            try {
              await navigator.clipboard.writeText(pre.textContent || '');
              copy.textContent = 'Copied';
            } catch {
              copy.textContent = 'Copy failed';
            }
          },
          { signal },
        );
      }
      if (pre.scrollHeight > (config.max_height || 360)) {
        const expand = document.createElement('button');
        expand.type = 'button';
        expand.textContent = 'Expand';
        expand.setAttribute('aria-expanded', 'false');
        wrapper.append(expand);
        expand.addEventListener(
          'click',
          () => {
            const open = wrapper.dataset.collapsed === 'true';
            wrapper.dataset.collapsed = String(!open);
            expand.setAttribute('aria-expanded', String(open));
            expand.textContent = open ? 'Collapse' : 'Expand';
          },
          { signal },
        );
      }
    });
}
