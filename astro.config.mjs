import { defineConfig } from 'astro/config';
import site from './src/site.config.ts';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import outputLayout from './scripts/output-layout.mjs';
import { solitudeMarkdown, solitudeMath } from './scripts/markdown-plugin.mjs';

export default defineConfig({
  site: site.site,
  base: site.base,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx(), outputLayout()],
  markdown: {
    processor: satteri({
      features: { math: site.theme.katex.enable, headingAttributes: true },
      mdastPlugins: [solitudeMath(site)],
      hastPlugins: [solitudeMarkdown(site)],
    }),
    syntaxHighlight: site.theme.highlight.enable ? 'shiki' : false,
    shikiConfig: { themes: site.theme.highlight.themes, defaultColor: false },
  },
});
