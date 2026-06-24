import { test, expect } from '@playwright/test';
import { Page } from 'playwright';

test('find lowest price product', async ({ page }) => {
  await page.goto('https://www.flipkart.com');
  await page.click('text="Login"');
  await page.fill('input[name="q"]', 'products under 100');
  await page.click('text="Search"');
  await page.waitForSelector('.bhgxx2');
  const products = await page.$$eval('.bhgxx2', (elements) => {
    return elements.map((element) => {
      const title = element.querySelector('div._4rR01T')?.textContent;
      const price = element.querySelector('div._30jeq3')?.textContent;
      return { title, price };
    });
  });
  const lowestPriceProduct = products.reduce((min, current) => {
    if (current.price && parseInt(current.price.replace('₹', '').replace(',', '')) < parseInt(min.price.replace('₹', '').replace(',', ''))) {
      return current;
    }
    return min;
  }, products[0]);
  console.log('Lowest price product:', lowestPriceProduct);
  expect(lowestPriceProduct.price).toBeLessThan('₹100');
});