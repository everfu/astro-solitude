# 配置字段清单 / Configuration inventory

原 Hugo `params.solitude.*` 对应 Astro `theme.*`。本表逐项列出完整默认配置，定位实现分组；自动检查只验证配置形状与构建，不代表每个外部服务已完成真实联调。功能验收证据与局限见 [parity.md](parity.md)。

| 字段 | 默认值 | 实现定位 |
| --- | --- | --- |
| `theme.site.name.class` | `"text"` | Header, Base |
| `theme.site.name.custom` | `"Solitude"` | Header, Base |
| `theme.site.icon` | `"/img/logo.png"` | Header, Base |
| `theme.nav.group` | `{}` | Header |
| `theme.nav.right.random` | `true` | Header |
| `theme.nav.right.custom` | `[]` | Header |
| `theme.hometop.enable` | `true` | HomeTop |
| `theme.hometop.banner.title` | `"Solitude"` | HomeTop |
| `theme.hometop.banner.desc` | `"A fast, elegant and feature-rich Astro theme"` | HomeTop |
| `theme.hometop.banner.icon` | `{}` | HomeTop |
| `theme.hometop.group` | `{}` | HomeTop |
| `theme.hometop.recommendList` | `[]` | HomeTop |
| `theme.aside.position` | `1` | Aside |
| `theme.aside.home.noSticky` | `"about"` | Aside |
| `theme.aside.home.Sticky` | `"allInfo"` | Aside |
| `theme.aside.post.noSticky` | `"about"` | Aside |
| `theme.aside.post.Sticky` | `"newestPost,allInfo"` | Aside |
| `theme.aside.page.noSticky` | `"about"` | Aside |
| `theme.aside.page.Sticky` | `"newestPost,allInfo"` | Aside |
| `theme.aside.my_card.author.img` | `"/img/logo.png"` | Aside |
| `theme.aside.my_card.author.emoji` | `null` | Aside |
| `theme.aside.my_card.author.sticker` | `null` | Aside |
| `theme.aside.my_card.description` | `"An Astro theme for expressive personal sites."` | Aside |
| `theme.aside.my_card.content` | `"Write, collect, and share with Solitude."` | Aside |
| `theme.aside.my_card.state.morning` | `"Good morning"` | Aside |
| `theme.aside.my_card.state.noon` | `"Good noon"` | Aside |
| `theme.aside.my_card.state.afternoon` | `"Good afternoon"` | Aside |
| `theme.aside.my_card.state.night` | `"Good evening"` | Aside |
| `theme.aside.my_card.state.goodnight` | `"Good night"` | Aside |
| `theme.aside.my_card.witty_words` | `[]` | Aside |
| `theme.aside.my_card.information` | `[]` | Aside |
| `theme.aside.toc.post` | `true` | Aside |
| `theme.aside.toc.page` | `true` | Aside |
| `theme.aside.toc.vague` | `true` | Aside |
| `theme.aside.tags.enable` | `true` | Aside |
| `theme.aside.tags.limit` | `20` | Aside |
| `theme.aside.tags.highlight_list` | `[]` | Aside |
| `theme.aside.siteinfo.postcount` | `true` | Aside |
| `theme.aside.siteinfo.wordcount` | `true` | Aside |
| `theme.aside.siteinfo.updatetime` | `true` | Aside |
| `theme.aside.siteinfo.runtimeenable` | `true` | Aside |
| `theme.aside.siteinfo.runtime` | `"2023-04-20 00:00:00"` | Aside |
| `theme.page.error` | `true` | routes, EntryPage |
| `theme.page.tags` | `true` | routes, EntryPage |
| `theme.page.categories` | `true` | routes, EntryPage |
| `theme.page.archives` | `0` | routes, EntryPage |
| `theme.page.links.async_threshold` | `200` | routes, EntryPage |
| `theme.page.default.cover` | `["/img/default.avif"]` | routes, EntryPage |
| `theme.post.default.cover` | `["/img/default.avif"]` | PostCard, PostMeta, Copyright |
| `theme.post.default.locate` | `"China"` | PostCard, PostMeta, Copyright |
| `theme.post.default.copyright.enable` | `true` | PostCard, PostMeta, Copyright |
| `theme.post.default.copyright.author` | `"/img/logo.png"` | PostCard, PostMeta, Copyright |
| `theme.post.default.copyright.author_background` | `""` | PostCard, PostMeta, Copyright |
| `theme.post.default.copyright.license` | `"CC BY-NC-SA 4.0"` | PostCard, PostMeta, Copyright |
| `theme.post.default.copyright.licenurl` | `"https://creativecommons.org/licenses/by-nc-sa/4.0/"` | PostCard, PostMeta, Copyright |
| `theme.post.meta.date` | `true` | PostCard, PostMeta, Copyright |
| `theme.post.meta.updated` | `true` | PostCard, PostMeta, Copyright |
| `theme.post.meta.locate` | `true` | PostCard, PostMeta, Copyright |
| `theme.post.meta.wordcount` | `true` | PostCard, PostMeta, Copyright |
| `theme.post.meta.readtime` | `true` | PostCard, PostMeta, Copyright |
| `theme.post.meta.pv` | `false` | PostCard, PostMeta, Copyright |
| `theme.post.meta.comment` | `false` | PostCard, PostMeta, Copyright |
| `theme.post.award.enable` | `false` | PostCard, PostMeta, Copyright |
| `theme.post.award.list` | `[]` | PostCard, PostMeta, Copyright |
| `theme.post.share.enable` | `false` | PostCard, PostMeta, Copyright |
| `theme.post.share.list` | `[]` | PostCard, PostMeta, Copyright |
| `theme.post.rss` | `"/index.xml"` | 兼容字段；订阅使用 RSS 端点与 footer.links |
| `theme.post.covercolor.enable` | `false` | PostCard, PostMeta, Copyright |
| `theme.post.covercolor.mode` | `"local"` | PostCard, PostMeta, Copyright |
| `theme.post.covercolor.api` | `"https://api.qjqq.cn/api/Imgcolor?img="` | PostCard, PostMeta, Copyright |
| `theme.post.covercolor.time` | `43200000` | PostCard, PostMeta, Copyright |
| `theme.theme_color.dark` | `"#ffc848"` | Base, tokens.css |
| `theme.theme_color.light` | `"#425aef"` | Base, tokens.css |
| `theme.theme_color.nav_hover_text.dark` | `"#1b1c20"` | Base, tokens.css |
| `theme.theme_color.nav_hover_text.light` | `"#ffffff"` | Base, tokens.css |
| `theme.display_mode.type` | `"auto"` | Base, main |
| `theme.font.font_size` | `"16px"` | Base, tokens.css |
| `theme.font.code_font_size` | `"16px"` | Base, tokens.css |
| `theme.font.font_family` | `"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"` | Base, tokens.css |
| `theme.font.code_font_family` | `"ui-monospace, SFMono-Regular, Menlo, monospace"` | Base, tokens.css |
| `theme.index_post_list.direction` | `"column"` | PostCard, astro.css |
| `theme.index_post_list.column` | `2` | PostCard, astro.css |
| `theme.index_post_list.cover` | `"both"` | PostCard, astro.css |
| `theme.related_post.enable` | `true` | EntryPage |
| `theme.related_post.limit` | `3` | EntryPage |
| `theme.related_post.date_type` | `"created"` | EntryPage |
| `theme.expire.enable` | `false` | main |
| `theme.expire.time` | `30` | main |
| `theme.expire.position` | `"top"` | main |
| `theme.expire.text_prev` | `"本文最后更新于"` | main |
| `theme.expire.text_next` | `"天前，部分内容可能已经失效。"` | main |
| `theme.right_menu.enable` | `true` | Overlays, right_menu |
| `theme.right_menu.exclude` | `["music"]` | Overlays, right_menu |
| `theme.right_menu.commentBarrage` | `false` | Overlays, right_menu |
| `theme.right_menu.ctrlOriginalMenu` | `false` | Overlays, right_menu |
| `theme.right_menu.translate` | `false` | Overlays, right_menu |
| `theme.right_menu.music` | `false` | Overlays, right_menu |
| `theme.right_menu.limit` | `50` | Overlays, right_menu |
| `theme.right_menu.author` | `"Author: "` | Overlays, right_menu |
| `theme.right_menu.link` | `"Link: "` | Overlays, right_menu |
| `theme.right_menu.source` | `"Source: Solitude"` | Overlays, right_menu |
| `theme.right_menu.info` | `""` | Overlays, right_menu |
| `theme.right_menu.img_error` | `"Unable to download image"` | Overlays, right_menu |
| `theme.right_menu.mode.dark` | `"Dark mode"` | Overlays, right_menu |
| `theme.right_menu.mode.light` | `"Light mode"` | Overlays, right_menu |
| `theme.right_menu.barrage.open` | `"Show comment barrage"` | Overlays, right_menu |
| `theme.right_menu.barrage.close` | `"Hide comment barrage"` | Overlays, right_menu |
| `theme.right_menu.custom_list` | `[]` | Overlays, right_menu |
| `theme.copy.enable` | `true` | main, utils |
| `theme.copy.copyright.enable` | `false` | main, utils |
| `theme.copy.copyright.limit` | `50` | main, utils |
| `theme.mermaid` | `true` | Shortcode, tag-runtime |
| `theme.chart` | `true` | Shortcode, tag-runtime |
| `theme.typeit` | `true` | assets, tag-runtime |
| `theme.console.enable` | `true` | Overlays, main |
| `theme.console.recentComment.enable` | `false` | Overlays, main |
| `theme.console.recentComment.storage` | `0.2` | Overlays, main |
| `theme.console.card.tags` | `true` | Overlays, main |
| `theme.console.card.archive` | `"month"` | Overlays, main |
| `theme.translate.enable` | `false` | tw_cn |
| `theme.translate.defaultEncoding` | `2` | tw_cn |
| `theme.translate.translateDelay` | `0` | tw_cn |
| `theme.rightside.enable` | `true` | Overlays, main |
| `theme.rightside.hide.enable` | `true` | Overlays, main |
| `theme.rightside.hide.translate` | `true` | Overlays, main |
| `theme.rightside.hide.mode` | `true` | Overlays, main |
| `theme.rightside.hide.aside` | `true` | Overlays, main |
| `theme.footer.randomlink` | `false` | Footer, friend_links |
| `theme.footer.information.author` | `"/img/logo.png"` | Footer, friend_links |
| `theme.footer.information.left` | `[]` | Footer, friend_links |
| `theme.footer.information.right` | `[]` | Footer, friend_links |
| `theme.footer.group` | `{}` | Footer, friend_links |
| `theme.footer.links` | `[]` | Footer, friend_links |
| `theme.footer.beian` | `[]` | Footer, friend_links |
| `theme.errorpage.img` | `"/img/404.avif"` | 404 |
| `theme.errorpage.text` | `"=awa= Page Not Found"` | 404 |
| `theme.errorpage.recommendList` | `true` | 404 |
| `theme.capsule.enable` | `false` | Capsule, music |
| `theme.capsule.id` | `""` | Capsule, music |
| `theme.capsule.server` | `"netease"` | Capsule, music |
| `theme.capsule.type` | `"playlist"` | Capsule, music |
| `theme.capsule.volume` | `0.8` | Capsule, music |
| `theme.music.enable` | `false` | EntryPage, music |
| `theme.music.id` | `""` | EntryPage, music |
| `theme.music.server` | `"netease"` | EntryPage, music |
| `theme.music.type` | `"playlist"` | EntryPage, music |
| `theme.music.volume` | `0.8` | EntryPage, music |
| `theme.music.mutex` | `true` | EntryPage, music |
| `theme.music.order` | `"list"` | EntryPage, music |
| `theme.meting_api` | `"https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&r=:r"` | assets |
| `theme.keyboard.enable` | `false` | keyboard |
| `theme.keyboard.list` | `[]` | keyboard |
| `theme.lazyload.enable` | `true` | assets, utils |
| `theme.lazyload.field` | `"site"` | assets, utils |
| `theme.lazyload.placeholder` | `""` | assets, utils |
| `theme.lazyload.errorimg` | `"/img/error_load.avif"` | assets, utils |
| `theme.loading.fullpage` | `false` | Base, preloader |
| `theme.loading.pace` | `true` | Base, preloader |
| `theme.highlight.enable` | `true` | astro.config, code-highlight |
| `theme.highlight.copy` | `true` | astro.config, code-highlight |
| `theme.highlight.line_numbers` | `true` | astro.config, code-highlight |
| `theme.highlight.themes.light` | `"github-light"` | astro.config, code-highlight |
| `theme.highlight.themes.dark` | `"github-dark"` | astro.config, code-highlight |
| `theme.highlight.max_height` | `360` | astro.config, code-highlight |
| `theme.lightbox` | `"fancybox"` | assets, utils |
| `theme.memorial.enable` | `false` | Base |
| `theme.memorial.date` | `[]` | Base |
| `theme.katex.enable` | `true` | markdown-plugin, assets |
| `theme.katex.per_page` | `true` | markdown-plugin, assets |
| `theme.katex.copytex` | `true` | markdown-plugin, assets |
| `theme.pwa.enable` | `false` | Base, manifest endpoints |
| `theme.pwa.manifest` | `"/manifest.json"` | Base, manifest endpoints |
| `theme.pwa.theme_color` | `"#425aef"` | Base, manifest endpoints |
| `theme.pwa.mask_icon` | `"/img/pwa/favicon.png"` | Base, manifest endpoints |
| `theme.pwa.apple_touch_icon` | `"/img/pwa/favicon.png"` | Base, manifest endpoints |
| `theme.pwa.favicon_32_32` | `"/img/pwa/favicon_32.png"` | Base, manifest endpoints |
| `theme.pwa.favicon_16_16` | `"/img/pwa/favicon_16.png"` | Base, manifest endpoints |
| `theme.pwa.bookmark_icon` | `"/img/pwa/favicon.png"` | Base, manifest endpoints |
| `theme.comment.use` | `""` | Comments, comments |
| `theme.comment.commentBarrage` | `false` | Comments, comments |
| `theme.comment.lazyload` | `false` | Comments, comments |
| `theme.comment.count` | `false` | Comments, comments |
| `theme.comment.sidebar` | `false` | Comments, comments |
| `theme.comment.pv` | `false` | Comments, comments |
| `theme.comment.avatar` | `"https://weavatar.com"` | Comments, comments |
| `theme.comment.hot_tip.enable` | `false` | Comments, comments |
| `theme.comment.hot_tip.count` | `3` | Comments, comments |
| `theme.comment.newest_comment.enable` | `false` | Comments, comments |
| `theme.comment.newest_comment.storage` | `0.5` | Comments, comments |
| `theme.comment.newest_comment.limit` | `5` | Comments, comments |
| `theme.twikoo.envId` | `""` | comments |
| `theme.twikoo.region` | `""` | comments |
| `theme.twikoo.style` | `true` | comments |
| `theme.twikoo.accessToken` | `""` | comments |
| `theme.twikoo.option` | `{}` | comments |
| `theme.waline.serverURL` | `""` | comments |
| `theme.waline.pageview` | `false` | comments |
| `theme.waline.option` | `{}` | comments |
| `theme.valine.appId` | `""` | comments |
| `theme.valine.appKey` | `""` | comments |
| `theme.valine.serverURLs` | `""` | comments |
| `theme.valine.avatar` | `"mp"` | comments |
| `theme.valine.visitor` | `false` | comments |
| `theme.valine.style` | `true` | comments |
| `theme.valine.option` | `{}` | comments |
| `theme.artalk.server` | `""` | comments |
| `theme.artalk.site` | `""` | comments |
| `theme.artalk.option` | `{}` | comments |
| `theme.giscus.repo` | `""` | comments |
| `theme.giscus.repo_id` | `""` | comments |
| `theme.giscus.category_id` | `""` | comments |
| `theme.giscus.mapping` | `"pathname"` | comments |
| `theme.giscus.theme.light` | `"light"` | comments |
| `theme.giscus.theme.dark` | `"dark"` | comments |
| `theme.giscus.option` | `{}` | comments |
| `theme.search.enable` | `true` | Search, search modules |
| `theme.search.type` | `"local"` | Search, search modules |
| `theme.search.tags` | `[]` | Search, search modules |
| `theme.search.local.preload` | `false` | Search, search modules |
| `theme.search.local.CDN` | `"/search.xml"` | Search, search modules |
| `theme.search.algolia.appId` | `""` | Search, search modules |
| `theme.search.algolia.apiKey` | `""` | Search, search modules |
| `theme.search.algolia.indexName` | `""` | Search, search modules |
| `theme.search.algolia.hits.per_page` | `6` | Search, search modules |
| `theme.search.docsearch.appId` | `""` | Search, search modules |
| `theme.search.docsearch.apiKey` | `""` | Search, search modules |
| `theme.search.docsearch.indexName` | `""` | Search, search modules |
| `theme.search.docsearch.placeholder` | `""` | Search, search modules |
| `theme.search.docsearch.option` | `{}` | Search, search modules |
| `theme.envelope.enable` | `false` | EntryPage, comments |
| `theme.envelope.line` | `10` | EntryPage, comments |
| `theme.envelope.speed` | `20` | EntryPage, comments |
| `theme.envelope.hover` | `true` | EntryPage, comments |
| `theme.envelope.loop` | `true` | EntryPage, comments |
| `theme.envelope.page` | `"/message/"` | EntryPage, comments |
| `theme.brevity.enable` | `false` | Brevity |
| `theme.brevity.home_mini` | `false` | Brevity |
| `theme.brevity.music` | `false` | Brevity |
| `theme.brevity.page` | `"/essay/"` | Brevity |
| `theme.brevity.style` | `1` | Brevity |
| `theme.brevity.strip` | `30` | Brevity |
| `theme.recent_comments.enable` | `false` | EntryPage, comments |
| `theme.recent_comments.limit` | `50` | EntryPage, comments |
| `theme.recent_comments.cache` | `0.2` | EntryPage, comments |
| `theme.recent_comments.page` | `"/recentcomments/"` | EntryPage, comments |
| `theme.verify_site` | `[]` | Base |
| `theme.extends.head` | `[]` | Base |
| `theme.extends.body` | `[]` | Base |
| `theme.cdn.fontawesome` | `"https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.3.0/css/all.min.css"` | assets, resources |
| `theme.cdn.snackbar` | `"https://cdn.jsdelivr.net/npm/node-snackbar@0.1.16/dist/snackbar.min.js"` | assets, resources |
| `theme.cdn.lazyload` | `"https://cdn.jsdelivr.net/npm/vanilla-lazyload@19.1.3/dist/lazyload.iife.min.js"` | assets, resources |
| `theme.cdn.fancyapps_css` | `"https://cdn.jsdelivr.net/npm/@fancyapps/ui@6.1.14/dist/fancybox/fancybox.css"` | assets, resources |
| `theme.cdn.fancyapps_js` | `"https://cdn.jsdelivr.net/npm/@fancyapps/ui@6.1.14/dist/fancybox/fancybox.umd.js"` | assets, resources |
| `theme.cdn.mermaid` | `"https://cdn.jsdelivr.net/npm/mermaid@11.16.0/dist/mermaid.min.js"` | assets, resources |
| `theme.cdn.chart` | `"https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js"` | assets, resources |
| `theme.cdn.abcjs` | `"https://cdn.jsdelivr.net/npm/abcjs@6.6.4/dist/abcjs-basic-min.js"` | assets, resources |
| `theme.cdn.typeit` | `"https://cdn.jsdelivr.net/npm/typeit@8.8.7/dist/index.umd.min.js"` | assets, resources |
| `theme.cdn.katex_css` | `"https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.css"` | assets, resources |
| `theme.cdn.katex_copytex` | `"https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/contrib/copy-tex.min.js"` | assets, resources |
| `theme.cdn.aplayer_css` | `"https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css"` | assets, resources |
| `theme.cdn.aplayer_js` | `"https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js"` | assets, resources |
| `theme.cdn.meting_js` | `"https://cdn.jsdelivr.net/npm/meting@2.0.2/dist/Meting.min.js"` | assets, resources |
| `theme.cdn.colorthief` | `"https://cdn.jsdelivr.net/npm/colorthief@3.4.0/dist/umd/color-thief.global.min.js"` | assets, resources |
| `theme.cdn.twikoo` | `"https://cdn.jsdelivr.net/npm/twikoo@1.6.44/dist/twikoo.all.min.js"` | assets, resources |
| `theme.cdn.waline_css` | `"https://cdn.jsdelivr.net/npm/@waline/client@3.6.0/dist/waline.css"` | assets, resources |
| `theme.cdn.waline` | `"https://cdn.jsdelivr.net/npm/@waline/client@3.6.0/dist/waline.umd.js"` | assets, resources |
| `theme.cdn.valine` | `"https://cdn.jsdelivr.net/npm/valine@1.5.3/dist/Valine.min.js"` | assets, resources |
| `theme.cdn.blueimp_md5` | `"https://cdn.jsdelivr.net/npm/blueimp-md5@2.19.0/js/md5.min.js"` | assets, resources |
| `theme.cdn.artalk_css` | `"https://cdn.jsdelivr.net/npm/artalk@2.9.1/dist/Artalk.css"` | assets, resources |
| `theme.cdn.artalk` | `"https://cdn.jsdelivr.net/npm/artalk@2.9.1/dist/Artalk.js"` | assets, resources |
| `theme.cdn.algoliasearch` | `"https://cdn.jsdelivr.net/npm/algoliasearch@5.46.3/dist/lite/builds/browser.umd.js"` | assets, resources |
| `theme.cdn.instantsearch_css` | `"https://cdn.jsdelivr.net/npm/instantsearch.css@8.9.0/themes/satellite-min.css"` | assets, resources |
| `theme.cdn.instantsearch` | `"https://cdn.jsdelivr.net/npm/instantsearch.js@4.84.0/dist/instantsearch.production.min.js"` | assets, resources |
| `theme.cdn.docsearch_css` | `"https://cdn.jsdelivr.net/npm/@docsearch/css@4.5.0/dist/style.css"` | assets, resources |
| `theme.cdn.docsearch_js` | `"https://cdn.jsdelivr.net/npm/@docsearch/js@4.5.0/dist/umd/index.js"` | assets, resources |
