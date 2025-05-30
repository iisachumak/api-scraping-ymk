const { chromium } = require('playwright');
const XLSX = require('xlsx');

async function scraperCastillo() {
    const workbook = XLSX.readFile('busqueda.xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    //declaro el array donde tendre la lista de los productos scrapeados
    const products = [];

    for (const row of data) {
        //
        const id = row.ID_FRABRICANTE;
        //
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        //
        try {
            //
            await page.goto('https://www.castillo.com.ar')
            //
            await page.click('svg[viewBox="0 0 32 32"]', { timeout: 5000 });
            await page.waitForTimeout(2000);
            //
            const codigoPostal = 4000;
            await page.fill('[placeholder="Cód. postal"]',codigoPostal.toString())
            //
            await page.click('[class="castillo-common-components-0-x-buttonSendCode"]')
            await page.waitForTimeout(2000);
            //
            await page.fill('[placeholder="Buscar"]', id)
            await page.waitForTimeout(2000);
            //
            await page.click('[aria-label="Buscar Productos"]');
            await page.waitForTimeout(2000);
            //
            const urlElement = await page.$('[class="vtex-product-summary-2-x-clearLink vtex-product-summary-2-x-clearLink--m3-shelf-product vtex-product-summary-2-x-clearLink--search h-100 flex flex-column"]');
            //
            if(urlElement){
                const href = await urlElement.getAttribute('href');
                //
                await page.goto(`https://www.castillo.com.ar${href}`)
                //
                const product = {};
                // nombre producto
                product.product_name = await page.locator('[class="castillo-pdp-components-1-x-product-name"]').innerText();
                // precio antes
                await page.waitForSelector('[class="castillo-pdp-components-1-x-product-price-discount"]', {state:'visible'});
                product.older_price = await page.locator('[class="castillo-pdp-components-1-x-product-price-discount"]').first().innerText();
                // precio actual
                await page.waitForSelector('[class="castillo-pdp-components-1-x-produce-price-value"]', {state:'visible'})
                product.current_price = await page.locator('[class="castillo-pdp-components-1-x-produce-price-value"]').first().innerText();
                // descuento
                await page.waitForSelector('[class="vtex-product-price-1-x-savingsPercentage vtex-product-price-1-x-savingsPercentage--saving-price-badge"]', {state:'visible'})
                product.off = await page.locator('[class="vtex-product-price-1-x-savingsPercentage vtex-product-price-1-x-savingsPercentage--saving-price-badge"]').first().innerText();
                // cuotas
                const raw_rules = await page.textContent('[class="vtex-flex-layout-0-x-flexColChild pb0"]');
                product.rules = raw_rules.replace(/\s+/g, ' ').trim();
                // valor envio
                // click en el collapsed
                await page.click('[class="b vtex-rich-text-0-x-strong vtex-rich-text-0-x-strong--shippment-button"]')
                await page.waitForTimeout(2000);
                // llenamos con nuestro codigo postal
                const codigoPostal = 4000
                await page.waitForSelector('[id="postal-code"]', { state: 'visible' });
                await page.fill('[id="postal-code"]', codigoPostal.toString());

                await page.waitForTimeout(2000);
                await page.click('button:has-text("Calcular")');
                await page.waitForTimeout(2000);

                await page.waitForSelector('[class="castillo-pdp-components-1-x-shipping-estimate-results"]', { state: 'visible' });
                product.shipping = await page.locator('[class="castillo-pdp-components-1-x-shipping-estimate-results"]').first().innerText();

                // 
                products.push(product)
            }

        } catch (err) {
            console.log(`Error scraping ID ${id}:`, err.message);
        } finally {
            await browser.close();
        }

    }

    return products;

}

module.exports = { scraperCastillo };