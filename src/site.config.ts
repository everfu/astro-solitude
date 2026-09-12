import { defineSolitudeConfig } from './lib/config';

export default defineSolitudeConfig({
  site: 'https://example.org',
  title: 'Solitude',
  description:
    'Write and create with Astro. A thoughtful home for your stories.',
  locale: 'en',
  timeZone: 'UTC',
  author: { name: 'Solitude' },
  menus: [
    {
      name: 'Library',
      children: [
        { name: 'All posts', url: '/archives/', icon: 'fas fa-folder-closed' },
        { name: 'Categories', url: '/categories/', icon: 'fas fa-clone' },
        { name: 'Tags', url: '/tags/', icon: 'fas fa-tags' },
      ],
    },
    { name: 'Friends', url: '/links/' },
    {
      name: 'Explore',
      children: [
        { name: 'About the theme', url: '/about/' },
        { name: 'My equipment', url: '/equipment/' },
        { name: 'Short updates', url: '/brevity/' },
      ],
    },
  ],
  theme: {
    nav: {
      group: {
        Project: [
          {
            name: 'Astro Solitude',
            url: 'https://github.com/everfu/astro-solitude',
            icon: '/img/logo.png',
          },
        ],
      },
    },
    hometop: {
      banner: {
        title: 'Write and create with Solitude',
        desc: 'An Astro theme with guides, examples, and content components.',
      },
    },
    aside: {
      home: { noSticky: 'about', Sticky: 'allInfo' },
      post: { noSticky: 'about', Sticky: 'newestPost,allInfo' },
      page: { noSticky: 'about', Sticky: 'newestPost,allInfo' },
      my_card: {
        description: 'An expressive Astro theme for your personal blog.',
        content: 'Let your content take center stage.',
        witty_words: ['Capture life in words', 'Create something with code'],
        information: [
          {
            name: 'GitHub',
            url: 'https://github.com/everfu/astro-solitude',
            icon: 'fab fa-github',
          },
        ],
      },
    },
    footer: {
      information: {
        left: [
          {
            name: 'GitHub',
            url: 'https://github.com/everfu/astro-solitude',
            icon: 'fab fa-github',
          },
        ],
        right: [{ name: 'RSS', url: '/index.xml', icon: 'fas fa-rss' }],
      },
      group: {
        Explore: [
          { name: 'Posts', url: '/archives/' },
          { name: 'Categories', url: '/categories/' },
        ],
        About: [
          { name: 'Theme', url: '/about/' },
          { name: 'Friends', url: '/links/' },
        ],
      },
    },
    capsule: { enable: true, id: '7298728834454061071', type: 'playlist', server: 'qishui' },
    // See docs/integrations.md to configure a playlist or enable comments.
    post: {
      meta: { locate: false },
      covercolor: { enable: true, mode: 'local' },
    },
    brevity: { enable: true },
    keyboard: {
      enable: true,
      list: [
        { modifier: 'shift', key: 'D', action: 'toggleTheme' },
        { modifier: 'mod', key: 'F', action: 'openSearch' },
        { modifier: 'shift', key: 'K', action: 'toggleKeyboard' },
      ],
    },
    search: { tags: ['Astro', 'Solitude', 'MDX'], local: { preload: true } },
    pwa: { enable: true },
  },
});
