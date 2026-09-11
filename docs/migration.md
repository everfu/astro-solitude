# 从 Hugo 导入内容

[文档首页](README.md) · [写作指南](writing.md)

导入器面向 Hugo Solitude 的配置与内容，正常使用 Astro 模板不需要 Hugo。源目录需要包含 `hugo.yaml`；自定义模板和构建管线需要单独迁移。

## 1. 预检

在 Astro 仓库根目录执行，替换路径：

```sh
pnpm migrate:hugo --source /path/to/hugo --dry-run
```

预检读取配置、内容和资源，输出预计文件数与问题列表，不修改源站。先解决报告中的问题，例如未知短代码、缺少文章日期和自定义模板。

## 2. 导出

```sh
pnpm migrate:hugo --source /path/to/hugo --out /path/to/export
```

输出必须与源目录分离，父目录必须存在。建议使用全新输出目录；工具遇到同名文件、符号链接或未解决问题时拒绝写入。不要直接把正在使用的 Astro 项目作为输出目录。

## 3. 合并到 Astro 模板

| 来源 | 导出结果 |
| --- | --- |
| `hugo.yaml` | `src/site.config.ts` |
| `content/` | `src/content/posts/`、`src/content/pages/` |
| 内容内媒体 | `public/hugo-content/`，同时改写识别到的引用 |
| `data/*.yaml`、JSON | `src/data/*.json` |
| `static/` | `public/` |
| `assets/css/custom.css` | `src/styles/custom.css` |

导出不是完整可运行的 Astro 项目。检查 `migration-report.json` 后，将结果合并到模板副本，逐项处理与示例内容的重名文件。

Hugo 短代码转换成对应 MDX 组件；普通文章保持 Markdown。地址优先使用原有显式 URL，导入器也处理可识别的 permalink 与 `.html` 地址。复杂模板表达式、未识别参数和自定义资产管线会进入问题报告。

## 4. 验证

```sh
pnpm check
pnpm build
pnpm preview
```

逐页抽查原站链接、图片、分类、系列、组件、公式和别名跳转；重新配置第三方服务。目录映射测试和组件示例构建不能替代你自己内容的验收。
