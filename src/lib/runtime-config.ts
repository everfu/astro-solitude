import { cfg, config, t, url } from './site';
import { contentPath, type Post, type Page } from './content';
import links from '../data/links.json';
export function runtimeConfig(
  posts: Post[],
  pages: Page[],
  page: Record<string, any>,
) {
  const total = links.links.reduce((n, g) => n + g.link_list.length, 0);
  const right =
    cfg.right_menu.enable &&
    page.right_menu !== false &&
    !cfg.right_menu.exclude.includes(page.type);
  const labels = (keys: Record<string, string>) =>
    Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, t(v)]));
  return {
    ...cfg,
    root: config.base,
    runtime: cfg.aside.siteinfo.runtimeenable
      ? cfg.aside.siteinfo.runtime
      : false,
    localsearch: {
      preload: cfg.search.local.preload,
      path: url(cfg.search.local.CDN || '/search.xml'),
    },
    algolia: cfg.search.algolia,
    random_posts: posts
      .filter((p) => p.data.random)
      .map((p) => url(contentPath(p))),
    randomlink: cfg.footer.randomlink,
    lazyload: { ...cfg.lazyload, error: url(cfg.lazyload.errorimg) },
    friend_links: {
      async: total > cfg.page.links.async_threshold,
      path: url('/links.json'),
      total,
      placeholder: cfg.lazyload.placeholder,
      default_avatar: url('/img/default_avatar.avif'),
      more_url: url('/links/'),
      ...labels({
        loading: 'linksLoading',
        error: 'linksError',
        retry: 'retry',
        random: 'randomLink',
        to: 'visit',
        more: 'more',
        default_sort: 'defaultSort',
        random_sort: 'randomSort',
        sort_label: 'sortLinks',
        scroll_left: 'scrollLeft',
        scroll_right: 'scrollRight',
      }),
    },
    feature_modules: {
      search: cfg.search.enable ? cfg.search.type : false,
      friend_links: total > 0,
      keyboard: cfg.keyboard.enable,
      music: cfg.capsule.enable || cfg.music.enable,
      right_menu: right,
      translate: cfg.translate.enable,
      covercolor: cfg.post.covercolor.enable ? cfg.post.covercolor.mode : false,
    },
    lang: {
      theme: labels({ dark: 'themeDark', light: 'themeLight' }),
      copy: labels({ success: 'copySuccess', error: 'copyError' }),
      code: labels({ copy: 'codeCopy', expand: 'codeExpand' }),
      ...labels({
        backtop: 'backTop',
        day: 'dayUnit',
        f12: 'developerMode',
        totalk: 'commentHint',
      }),
      time: labels({
        day: 'timeDay',
        hour: 'timeHour',
        just: 'timeJust',
        min: 'timeMinute',
        month: 'timeMonth',
      }),
      search: labels({
        empty: 'searchEmpty',
        hit: 'searchHit',
        placeholder: 'searchPlaceholder',
        count: 'searchCount',
        loading: 'searchLoading',
      }),
      comments: labels({
        loading: 'commentsLoading',
        empty: 'commentsEmpty',
        error: 'commentsError',
        image: 'commentImage',
        link: 'commentLink',
        code: 'commentCode',
        emoji: 'commentEmoji',
        anonymous: 'commentAnonymous',
        participants: 'commentParticipants',
        moreParticipants: 'commentMoreParticipants',
      }),
      barrage: { title: t('comments') },
    },
    aside: {
      ...cfg.aside,
      state: cfg.aside.my_card.state,
      witty_words: cfg.aside.my_card.witty_words,
      witty_comment: { prefix: t('hello'), back: t('welcomeBack') },
    },
    covercolor: cfg.post.covercolor,
    comment_runtime: {
      routes: Object.fromEntries(
        [...posts, ...pages]
          .filter(
            (p) =>
              p.data.comment &&
              ![
                'about',
                'music',
                'tags',
                'categories',
                'links',
                'brevity',
                'recentcomment',
              ].includes(String(p.data.type)),
          )
          .map((p) => [url(contentPath(p)), p.data.title]),
      ),
      default_avatar: url('/img/default_avatar.avif'),
      barrage_script: url('/js/third_party/barrage.min.js'),
      envelope_script: url('/js/third_party/envelope.min.js'),
    },
    right_menu: right
      ? {
          ...cfg.right_menu,
          ctrlOriginalMenu: cfg.right_menu.ctrlOriginalMenu
            ? t('rightMenuCtrlOriginal')
            : false,
          img_error: t('rightMenuImageError'),
          mode: labels({ dark: 'rightMenuDark', light: 'rightMenuLight' }),
          barrage: labels({
            open: 'rightMenuBarrageOpen',
            close: 'rightMenuBarrageClose',
          }),
          music: cfg.capsule.enable
            ? labels({
                start: 'rightMenuMusicStart',
                stop: 'rightMenuMusicStop',
                back: 'rightMenuMusicBack',
                forward: 'rightMenuMusicForward',
                copyMusicName: 'rightMenuMusicCopy',
              })
            : false,
        }
      : false,
    translate: cfg.translate.enable ? cfg.translate : false,
  };
}
