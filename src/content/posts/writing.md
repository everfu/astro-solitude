---
title: 用 Markdown 和 MDX 写作
date: '2026-08-24T10:00:00+08:00'
slug: writing
description: 用 Markdown 和 MDX 写作：Solitude Astro 主题的可运行示例。
categories:
- 主题指南
tags:
- MDX
- Solitude
series:
- 主题入门
cover: /img/demo/cover-shortcodes-v2.webp
---

# 用 Markdown 和 MDX 写作

欢迎使用 **Astro Solitude**。本篇是通用演示内容，可以直接替换为自己的文章。

## 内容与表达

主题把内容、配置和页面组件分开。文章保留在 `src/content/posts`，站点配置位于 `src/site.config.ts`。

> 让内容自然成为主角。

## 开始创作

- 使用 Markdown 编写文字。
- 使用 MDX 组合提示、图库与媒体。
- 在明暗主题下阅读相同内容。

```typescript
const message: string = "Hello, Solitude";
console.log(message);
```

### 下一步

访问 [组件示例](/p/components/) 或 [全部文章](/archives/)。

## 数学公式

行内公式 $E = mc^2$。

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 长代码与复制

超过配置高度的代码块可以展开，复制按钮始终复制完整内容。

```ts
const steps = [
  'Create a repository',
  'Install dependencies',
  'Configure the site',
  'Choose a language',
  'Set the time zone',
  'Write a title',
  'Add a description',
  'Choose a cover',
  'Add categories',
  'Add tags',
  'Create a series',
  'Write in Markdown',
  'Use an MDX component',
  'Preview the page',
  'Check the navigation',
  'Check the search',
  'Try dark mode',
  'Try a narrow screen',
  'Check the table of contents',
  'Read the RSS feed',
  'Check old URLs',
  'Configure comments',
  'Verify your service',
  'Run the type checker',
  'Build static files',
  'Run tests',
  'Review the output',
  'Choose a static host',
  'Publish your own site',
];
for (const step of steps) console.log(step);
```
