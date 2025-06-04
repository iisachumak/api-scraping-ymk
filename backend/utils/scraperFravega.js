const { chromium } = require('playwright');
const XLSX = require('xlsx');

async function scraperFravega(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const products = [];

  for (const row of data) {
    const id = row.ID_FRABRICANTE;

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('https://www.fravega.com/');

      await page.fill('[data-test-id="header-geo-location-form-postal-number"]', '4000');
      await page.click('[data-test-id="button-save-postal-code"]');
      await page.waitForSelector('[data-test-id="header-geo-location-form-postal-number"]', { state: 'detached' });

      await page.fill('[name="keyword"]', id);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);

      const urlElement = await page.$('.sc-87b0945d-3.dQujLs');

      if (urlElement) {
        const href = await urlElement.getAttribute('href');
        await page.goto(`https://www.fravega.com${href}`);

        const product = {};

        //URL ficha producto
        product.product_url = `https://www.fravega.com${href}`;

        //URL img product
        const producto_scr = await page.$('.imgSmall')
        if(producto_scr){
          product.product_img = await producto_scr.getAttribute('src')
        }
        // Nombre
        product.product_name = await getText(page, '[data-test-id="product-title"]');

        // Precio anterior
        product.older_price = await getText(page, '.sc-e081bce1-0.sc-fa5d09b0-4');

        // Precio actual
        product.current_price = await getText(page, '.sc-1d9b1d9e-0.sc-fa5d09b0-3');

        // Porcentaje OFF
        product.off = await getText(page, '.sc-e2aca368-0.sc-fa5d09b0-5');

        // Cuotas
        product.rules = await getText(page, '.sc-f6cfc5e5-4');

        // Envío
        const shipping = await getText(page, '.sc-e700c6db-1.iFxWcW');
        if (shipping) {
          const unwanted = "Ingresá código postal (sólo números)Calcular";
          product.shipping_price = shipping.replace(/\n/g, ' | ');
          product.shipping_price = shipping.replace(unwanted, '');
        } else {
          product.shipping_price = null;
        }

        products.push(product);
      }
    } catch (err) {
      console.error(`Error scraping ID ${id}:`, err.message);
    } finally {
      await browser.close();
    }
  }

  return products;
}

async function getText(page, selector) {
  try {
    const element = await page.$(selector);
    return element ? await element.textContent() : null;
  } catch {
    return null;
  }
}

module.exports = { scraperFravega };
