# 开发与验收

[文档首页](README.md) · [项目说明](../README.md)

## 本地检查

```sh
pnpm install --frozen-lockfile
pnpm docs:generate
pnpm docs:check
pnpm check
pnpm build
pnpm test
pnpm build:fixture
pnpm exec playwright install chromium
pnpm test:e2e
```

`docs:generate` 只写配置字段清单和组件参数索引，不覆盖手写指南，也不需要外部 Hugo 目录。`docs:check` 检查文档本地链接、锚点和参考清单是否过期；外部链接不纳入该自动检查。

`pnpm test` 中的输出测试依赖已生成的 `dist/`，因此先构建。浏览器测试依赖独立测试站构建，并由 Playwright 启动预览服务。

## 测试站与覆盖

| 测试站 | 地址 | 用途 |
| --- | --- | --- |
| 默认模板 | `http://127.0.0.1:4321` | 首页、文章、路由、搜索、明暗主题与响应式布局 |
| 集成配置 | `http://127.0.0.1:4332` | 评论挂载、音乐、资源生命周期 |
| Algolia | `http://127.0.0.1:4333/sub/` | 子目录与第三方搜索适配 |
| DocSearch | `http://127.0.0.1:4334` | DocSearch 与英文以外的界面语言 |
| 在线音乐 | `http://127.0.0.1:4336` | 汽水播放器、封面取色与移动端目录遮罩 |
| Valine 聚合 | `http://127.0.0.1:4335` | 最新评论、留言弹幕、文章参与者头像及样式恢复 |

第三方服务在测试中使用模拟响应或本地测试资源，测试标识不是线上账号。生产模板保持评论与在线音乐关闭，不以启用真实服务作为回归测试前提。

## 来源与保留内容

项目来自 Hugo Solitude 的 Astro 迁移。原始来源快照、提交和文件哈希保留在 [source-manifest.json](source-manifest.json)，版权和改动说明见 [NOTICE](../NOTICE) 与 [LICENSE](../LICENSE)。这些哈希描述迁移时的来源，不代表当前 Astro 文件内容。

本次发布保留现有功能成果。历史截图和旧比较统计不作为当前版本验收证据；新截图记录当前模板，见下节。

## 当前发布验证

2026-09-11 在 macOS、Node.js 24.16.0、pnpm 11.24.0、Chromium 下完成本地验证。Browser 插件未提供，使用项目现有 Playwright 流程。测试结果仅对应本次模板整理，不代表未来改动自动通过。

| 检查 | 结果 |
| --- | --- |
| 干净副本安装、启动首页与静态构建 | 通过，生成 37 个页面 |
| Astro 类型检查 | 0 errors、0 warnings；4 个非阻断 hints |
| 单元测试 | 21 / 21 通过 |
| 浏览器回归 | 51 / 51 通过 |
| 文档配置示例 | 10 段通过 TypeScript 检查 |
| 本地文档链接、锚点、参考清单 | 通过 `pnpm docs:check` |
| 默认服务配置 | 评论与在线音乐关闭；没有请求原评论服务或歌单 |
| 页面身份、可见内容、错误遮罩、页面脚本 | 截图页面标题正确，内容正常，无错误遮罩；无 pageerror |
| 截图布局 | 390、768、1440 像素，5 个视图无横向溢出 |

交互覆盖包括：首页 → 打开搜索 → 显示结果；进入文章 → 返回 → 恢复页面；切换主题；移动端目录的打开、焦点、关闭与定位；独立测试配置中的评论和音乐生命周期。

截图使用生产预览，尺寸与标题记录在 [截图数据](visual-results.json)。

- [桌面首页](screenshots/home-desktop.png)
- [深色首页](screenshots/home-desktop-dark.png)
- [移动端深色文章](screenshots/post-mobile-dark.png)
- [桌面关于页面](screenshots/about-desktop.png)
- [平板深色关于页面](screenshots/about-tablet-dark.png)

未验证真实评论账号、在线音乐服务可用性、Safari/Firefox 或用户自己的托管平台。公开模板无需部署在线演示站即可使用，仓库检查工作流不执行部署。GitHub 的持续检查覆盖 Node.js 22 与 24，最新状态以仓库 Actions 为准。
