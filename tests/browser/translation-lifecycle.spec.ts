import { expect, test } from '@playwright/test';

test('disposing a page cancels its pending translation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  await page.evaluate(async () => {
    const template =
      document.querySelector<HTMLTemplateElement>('#site-config')!;
    const config = JSON.parse(template.content.textContent!) as {
      translate: {
        enable: boolean;
        defaultEncoding: number;
        translateDelay: number;
      };
      feature_modules: { translate: boolean };
    };
    config.translate = {
      enable: true,
      defaultEncoding: 2,
      translateDelay: 2000,
    };
    config.feature_modules.translate = true;
    template.content.textContent = JSON.stringify(config);
    window.Solitude.saveToLocal.set('translate-chn-cht', 1, 1);
    const button = document.createElement('button');
    button.id = 'menu-translate';
    button.textContent = 'Translate';
    document.body.append(button);
    await window.Solitude.refresh();
    window.Solitude.disposePage();
    const content = document.createElement('p');
    content.id = 'translation-cleanup-content';
    content.textContent = '网页测试';
    document.body.append(content);
  });
  await page.waitForTimeout(2200);
  await expect(page.locator('#translation-cleanup-content')).toHaveText(
    '网页测试',
  );
});
