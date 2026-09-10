import { test, expect } from '@playwright/test';
for (const provider of ['algolia', 'docsearch'])
  test(`${provider} initializes again after client navigation (mock service)`, async ({
    page,
  }) => {
    await page.route(/https:\/\//, async (route) => {
      const address = route.request().url();
      let body = '';
      if (address.includes('algoliasearch@'))
        body =
          'window.algoliasearch={algoliasearch:(appId,apiKey)=>({appId,apiKey})};';
      if (address.includes('instantsearch.js@'))
        body = `(()=>{window.__searchMounts=0;window.__searchDisposes=0;function create(){return{addWidgets(){},start(){window.__searchMounts++;const input=document.createElement('input');input.className='ais-SearchBox-input';document.querySelector('#algolia-search-input').append(input);input.addEventListener('input',()=>document.querySelector('#algolia-hits').textContent='Mock result: '+input.value);},dispose(){window.__searchDisposes++;},on(){}}};create.widgets=Object.fromEntries(['configure','searchBox','stats','hits','pagination'].map(k=>[k,options=>options]));window.instantsearch=create;})();`;
      if (address.includes('@docsearch/js@'))
        body = `window.__searchMounts??=0;window.docsearch=options=>{window.__searchMounts++;const trigger=document.createElement('button');trigger.className='DocSearch-Button';trigger.addEventListener('click',()=>{const dialog=document.createElement('div');dialog.className='DocSearch-Modal';dialog.textContent='Mock DocSearch';document.body.append(dialog);});document.querySelector(options.container).append(trigger);};`;
      await route.fulfill({
        contentType: address.includes('.css')
          ? 'text/css'
          : 'application/javascript',
        body,
      });
    });
    const base =
      provider === 'algolia'
        ? 'http://127.0.0.1:4333/sub'
        : 'http://127.0.0.1:4334';
    await page.goto(base + '/');
    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      provider === 'algolia' ? 'en' : 'es',
    );
    await expect
      .poll(() => page.evaluate(() => (window as any).__searchMounts))
      .toBe(1);
    await page.locator('#search-button a').click();
    if (provider === 'algolia') {
      await expect(page.locator('.ais-SearchBox-input')).toBeVisible();
      await page.locator('.ais-SearchBox-input').fill('Astro');
      await expect(page.locator('#algolia-hits')).toContainText(
        'Mock result: Astro',
      );
    } else await expect(page.locator('.DocSearch-Modal')).toBeVisible();
    const next = provider === 'algolia' ? '/sub/about/' : '/about/';
    await page.evaluate((url) => window.Solitude.navigate(url), next);
    await expect(page.locator('#about-page')).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => (window as any).__searchMounts))
      .toBe(2);
    await page.locator('#search-button a').click();
    if (provider === 'algolia')
      await expect(page.locator('.ais-SearchBox-input')).toBeVisible();
    else await expect(page.locator('.DocSearch-Modal')).toBeVisible();
  });
