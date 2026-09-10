import { defineSolitudeConfig } from './lib/config';

export default defineSolitudeConfig({
  site: 'https://example.org',
  title: 'Solitude',
  description: '用 Astro 记录与创造。轻盈、优雅、完整的个人博客主题。',
  author: { name: 'Solitude' },
  menus: [
    {
      name: '文库',
      children: [
        { name: '全部文章', url: '/archives/', icon: 'fas fa-folder-closed' },
        { name: '分类', url: '/categories/', icon: 'fas fa-clone' },
        { name: '标签', url: '/tags/', icon: 'fas fa-tags' },
      ],
    },
    { name: '友链', url: '/links/' },
    {
      name: '探索',
      children: [
        { name: '关于主题', url: '/about/' },
        { name: '我的装备', url: '/equipment/' },
        { name: '音乐馆', url: '/music/' },
        { name: '即刻短文', url: '/brevity/' },
        { name: '留言板', url: '/message/' },
      ],
    },
  ],
  theme: {
    nav: {
      group: {
        项目: [
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
        title: '用 Solitude 记录与创造',
        desc: 'Astro 主题演示、配置指南与内容组件。',
      },
    },
    aside: {
      home: { noSticky: 'about', Sticky: 'newestPost,allInfo' },
      my_card: {
        description: '简洁、优雅、功能丰富的 Astro 主题。',
        content: '让内容自然成为主角。',
        witty_words: ['用文字记录生活', '用代码创造可能'],
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
        探索: [
          { name: '文章', url: '/archives/' },
          { name: '分类', url: '/categories/' },
        ],
        关于: [
          { name: '主题', url: '/about/' },
          { name: '留言', url: '/message/' },
        ],
      },
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
