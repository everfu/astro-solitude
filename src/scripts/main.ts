import { asideActions } from './features/aside';
import { initGalleryMasonry, initPostCoverTilt } from './features/media';
import { musicActions } from './features/music';
import {
  initAsideTagCloudOverflow,
  navigationActions,
  sidebarFn,
} from './features/navigation';
import { postActions, tabs } from './features/post';
import { percent, scrollFn } from './features/scroll';
import { themeActions } from './features/theme';
/** Browser behavior preserved from Solitude Hugo; typed boundary: core/api.ts. */
import { initActionDelegation } from './core/actions';
import { Solitude } from './core/api';
import { lifecycle } from './core/lifecycle';
import { initPreloader } from './core/preloader';
import { initToc } from './toc';
let coverColor: (music?: boolean) => void | Promise<void> = () => {};
let initializeMusicPlayer: () => void = () => {};
const loadFeatureModules = async () => {
  const signal = lifecycle.signal;
  const features = Solitude.config
    .feature_modules as import('./types').FeatureModules;
  const requests = [];
  if (features.search === 'local')
    requests.push(
      import('./search/local').then((module) => {
        if (!signal.aborted) module.initializeLocalSearch();
      }),
    );
  if (features.search === 'algolia') requests.push(import('./search/algolia'));
  if (features.search === 'docsearch')
    requests.push(import('./search/docsearch'));
  if (features.friend_links) requests.push(import('./friend_links'));
  if (features.keyboard) requests.push(import('./keyboard'));
  if (features.right_menu) requests.push(import('./right_menu'));
  if (features.translate) requests.push(import('./tw_cn'));
  if (features.music) {
    requests.push(
      import('./music').then((module) => {
        initializeMusicPlayer = module.initializeMusicPlayer;
      }),
    );
  }
  if (features.covercolor) {
    const coverColorLoaders = {
      local: () => import('./covercolor/local'),
      api: () => import('./covercolor/api'),
      ave: () => import('./covercolor/ave'),
    };
    const loader = coverColorLoaders[features.covercolor];
    if (loader)
      requests.push(
        loader().then((module) => {
          coverColor = module.coverColor;
          Solitude.coverColor = coverColor;
        }),
      );
  }
  await Promise.all(requests);
};
const initTooltip = () => {
  const tooltip =
    document.querySelector<HTMLElement>('.custom-tooltip') ||
    document.body.appendChild(
      Object.assign(document.createElement('div'), {
        className: 'custom-tooltip',
      }),
    );
  tooltip.style.opacity = '0';
  tooltip.style.backdropFilter = 'none';
  if (!window.matchMedia('(hover: hover)').matches) return;
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  document.querySelectorAll<HTMLElement>('[heotip]').forEach((element) => {
    if (element.dataset.tooltipInitialized === 'true') return;
    element.dataset.tooltipInitialized = 'true';
    lifecycle.listen(element, 'mouseenter', () => {
      tooltip.textContent = element.getAttribute('heotip');
      tooltip.style.left = '0';
      tooltip.style.top = '0';
      tooltip.style.backdropFilter = 'blur(10px)';
      tooltip.style.opacity = '1';
      const targetRect = element.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const gap = 10;
      const maxLeft = window.innerWidth - tooltipRect.width - rootFontSize;
      const centeredLeft =
        targetRect.left + (targetRect.width - tooltipRect.width) / 2;
      const left = Math.max(rootFontSize, Math.min(centeredLeft, maxLeft));
      const preferredTop =
        targetRect.top >= tooltipRect.height + gap
          ? targetRect.top - tooltipRect.height - gap
          : targetRect.bottom + gap;
      const maxTop = window.innerHeight - tooltipRect.height - rootFontSize;
      const top = Math.max(rootFontSize, Math.min(preferredTop, maxTop));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });
    lifecycle.listen(element, 'mouseleave', () => {
      tooltip.style.backdropFilter = 'none';
      tooltip.style.opacity = '0';
    });
  });
};
const initObserver = () => {
  const commentElement = document.getElementById('post-comment');
  const paginationElement = document.getElementById('pagination');
  const commentBarrageElement =
    document.querySelector<HTMLElement>('.comment-barrage');
  if (commentElement && paginationElement) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        paginationElement.classList.toggle('show-window', entry.isIntersecting);
        if (Solitude.config.comment?.commentBarrage && commentBarrageElement) {
          commentBarrageElement.style.bottom = entry.isIntersecting
            ? '-200px'
            : '';
        }
      });
    });
    observer.observe(commentElement);
    lifecycle.add(() => observer.disconnect());
  }
};
const addCopyright = () => {
  if (!Solitude.config.copyright) return;
  const { limit, author, link, source, info } = Solitude.config.copyright;
  document.body.addEventListener('copy', (e) => {
    e.preventDefault();
    const copyText = window.getSelection()?.toString() || '';
    const text =
      copyText.length > limit
        ? `${copyText}\n\n${author}\n${link}${window.location.href}\n${source}\n${info}`
        : copyText;
    e.clipboardData?.setData('text', text);
  });
};
const asideStatus = () => {
  const status = Solitude.saveToLocal.get('aside-status');
  document.documentElement.classList.toggle('hide-aside', status === 'hide');
};
export const actions = {
  ...musicActions,
  ...asideActions,
  ...navigationActions,
  ...postActions,
  ...themeActions,
};
Object.assign(Solitude, actions);
Solitude.toggleTheme = () => Solitude.switchDarkMode();
Solitude.refresh = async () => {
  lifecycle.disposePage();
  const signal = lifecycle.signal;
  const { is_home, is_page, page, is_post } = Solitude.page;
  const { runtime, lazyload, lightbox, randomlink, covercolor, expire } =
    Solitude.config;
  const timeSelector = '.datetime, .webinfo-item time, .post-meta-date time';
  document.body.setAttribute('data-type', page);
  document.body.setAttribute(
    'data-right-menu',
    String(Boolean(Solitude.config.right_menu)),
  );
  await loadFeatureModules();
  if (signal.aborted) return;
  Solitude.changeTimeFormat(document.querySelectorAll(timeSelector));
  runtime && Solitude.addRuntime();
  [
    scrollFn,
    sidebarFn,
    initAsideTagCloudOverflow,
    initTooltip,
    () => Solitude.addPhotoFigcaption(),
    () => Solitude.setTimeState(),
    () => Solitude.tagPageActive(),
    () => Solitude.categoriesBarActive(),
    () => Solitude.listenToPageInputPress(),
    () => Solitude.musicScrubberBind(),
    () => Solitude.musicBind(),
    () => Solitude.addNavBackgroundInit(),
    initGalleryMasonry,
    () => Solitude.refreshWaterFall(),
  ].forEach((fn) => fn());
  lazyload.enable && Solitude.lazyloadImg();
  lightbox &&
    Solitude.lightbox(
      document.querySelectorAll<HTMLImageElement>(
        '.article-container img:not(.flink-avatar,.gallery-group img, .no-lightbox), #bber .bber-content-img img',
      ),
    );
  randomlink && Solitude.randomLinksList?.();
  Solitude.config.friend_links.async && Solitude.friendLinks?.init();
  if (is_post) {
    initPostCoverTilt();
  }
  Solitude.switchComments();
  initObserver();
  if (is_home) {
    const { initHomeCenter, showTodayCard } = await import('./features/home');
    if (signal.aborted) return;
    showTodayCard();
    initHomeCenter();
    Solitude.homeTypeit();
  }
  typeof window.updatePostsBasedOnComments === 'function' &&
    window.updatePostsBasedOnComments();
  if (is_post || is_page) {
    if (document.querySelector('article pre')) {
      const { initializeCodeBlocks } = await import('./code-highlight');
      if (signal.aborted) return;
      void initializeCodeBlocks(signal);
    }
    tabs.init();
  }
  if (is_post && expire?.enable) {
    tabs.expireAddListener();
  }
  if (covercolor.enable) coverColor();
  if (Solitude.page.toc) initToc();
  if (page === 'music') {
    initializeMusicPlayer();
    lifecycle.add(() => Solitude.musicPlayer?.destroy?.());
  }
  if (page === 'archives') {
    const { archivePageController, initArchivePage } =
      await import('./archive-page');
    if (signal.aborted) return;
    initArchivePage();
    lifecycle.add(() => archivePageController.destroy());
  }
  if (document.getElementById('about-page')) {
    const { initAboutPage } = await import('./features/about');
    if (!signal.aborted) initAboutPage();
  }
};
export const initializeApp = async (isCurrent = () => true) => {
  initActionDelegation(Solitude);
  initPreloader(Solitude);
  addCopyright();
  await Solitude.refresh();
  if (!isCurrent()) return;
  asideStatus();
  window.onscroll = percent;
  Solitude.initConsoleState();
  lifecycle.emit('ready', { config: Solitude.config, page: Solitude.page });
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    Solitude.wasPageHidden = true;
  }
});
window.onkeydown = (e) => {
  const { code, ctrlKey, shiftKey } = e;
  if (
    code === 'F12' ||
    (ctrlKey && shiftKey && (code === 'KeyI' || code === 'KeyC'))
  ) {
    Solitude.snackbarShow(Solitude.config.lang.f12, false, 3000);
  }
  if (code === 'Escape') {
    Solitude.hideConsole();
  }
};
document.addEventListener('copy', () => {
  Solitude.snackbarShow(Solitude.config.lang.copy.success, false, 3000);
});
