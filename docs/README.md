# Astro Solitude 使用文档

从一份模板开始，搭建属于自己的博客。

[创建我的博客](https://github.com/everfu/astro-solitude/generate) · [返回项目首页](../README.md) · [English overview](../README.en.md)

## 开始使用

| 你想做什么 | 阅读指南 |
| --- | --- |
| 创建仓库、启动预览、替换演示内容 | [快速开始](getting-started.md) |
| 修改名称、导航、颜色和首页布局 | [主题配置](configuration.md) |
| 发布文章、组织分类、使用自定义地址 | [写作指南](writing.md) |
| 编辑关于、友链、装备和短文页面 | [特色页面](pages.md) |
| 插入提示、图库、标签页与音视频 | [MDX 组件](components.md) |
| 将博客发布到自己的域名 | [部署指南](deployment.md) |

## 进阶使用

- [第三方集成](integrations.md)：评论、最新评论、弹幕、在线音乐与搜索。
- [Hugo 导入](migration.md)：先预检，再导出到独立目录。
- [常见问题](faq.md)：路径、草稿、资源加载和更新主题。
- [配置字段清单](configuration-inventory.md)：根据代码生成的完整基础默认值。
- [组件参数索引](component-inventory.md)：本地组件映射和参数摘要。
- [开发与验收](parity.md)：运行检查、测试范围和截图信息。

## 阅读约定

文档中的文件路径相对于仓库根目录；命令在仓库根目录执行。配置片段合并到现有 `defineSolitudeConfig({...})`，不要粘贴第二个 `export default`。除快速开始的完整配置外，示例只列出需要修改的部分。

基础默认值来自 `src/lib/defaults.json` 和 `src/lib/config.ts`；模板在 `src/site.config.ts` 中覆盖部分外观与交互选项。评论和在线音乐默认关闭，本地搜索可直接使用。详细文档目前为简体中文。
