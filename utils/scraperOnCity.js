//https://www.oncity.com/
const { chromium } = require('playwright');
const XLSX = require('xlsx');

async function scraperOnCity() {
    const workbook = XLSX.readFile('busqueda.xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const products = [];

    for (const row of data) {
        //
        const id = row.ID_FRABRICANTE;
        //
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        try {

            await page.goto('https://www.oncity.com/');

            await page.click('[class="aremsaprod-geo-location-0-x-statusShippingButton aremsaprod-geo-location-0-x-statusShippingButton--sdsdsd"]')
            await page.waitForTimeout(3000);

            const input = page.locator('input[placeholder="Ingresá tu código"]');

            // Enfoca el input
            await input.click();

            // Obtiene el valor actual
            const value = await input.inputValue();

            // Borra cada carácter
            for (let i = 0; i < value.length; i++) {
                await input.press('Backspace');
            }

            // Escribe el nuevo valor
            await input.fill('4000');
            await page.waitForTimeout(3000);

            await page.click('.ml3.aremsaprod-geo-location-0-x-ModalButton.aremsaprod-geo-location-0-x-ModalButton--sdsdsd')
            await page.waitForTimeout(3000);

            // escribimos el id del producto a buscar
            await page.fill('[id="downshift-0-input"]', id);
            await page.waitForTimeout(3000);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(3000);

            const product_href = await page.$('.vtex-product-summary-2-x-clearLink.vtex-product-summary-2-x-clearLink--product-summary-product.vtex-product-summary-2-x-clearLink--product-summary-product--plp.h-100.flex.flex-column')
            if (product_href){
                const href = await product_href.getAttribute('href');
                await page.goto(`https://www.oncity.com${href}`);
                await page.waitForTimeout(3000);

                const product = {};
                
                // url del producto
                product.product_url = `https://www.oncity.com${href}`;
                
                // img del producto
                const product_img_src = await page.$('[class="vtex-store-components-3-x-productImageTag vtex-store-components-3-x-productImageTag--pdp--image vtex-store-components-3-x-productImageTag--main vtex-store-components-3-x-productImageTag--pdp--image--main"]')
                product.product_img = await product_img_src.getAttribute('src')
                
                // nombre del producto
                product.product_name = await page.locator('[class="vtex-store-components-3-x-productBrand vtex-store-components-3-x-productBrand--pdp--title "]').innerText();

                // precio anterior
                await page.waitForSelector('[class="vtex-product-price-1-x-listPriceValue vtex-product-price-1-x-listPriceValue--summary strike"]', { state: 'visible' });
                product.older_price = await page.locator('[class="vtex-product-price-1-x-listPriceValue vtex-product-price-1-x-listPriceValue--summary strike"]').first().innerText();

                // precio actual
                await page.waitForSelector('[class="vtex-product-price-1-x-currencyContainer vtex-product-price-1-x-currencyContainer--mainShelf__sellingPrice"]', { state:'visible' });
                product.current_price = await page.locator('[class="vtex-product-price-1-x-currencyContainer vtex-product-price-1-x-currencyContainer--mainShelf__sellingPrice"]').first().innerText();

                // porcentaje de descuento
                await page.waitForSelector('[class="vtex-product-price-1-x-savingsPercentage vtex-product-price-1-x-savingsPercentage--mainShelf__savings"]', {state:'visible'});
                product.off = await page.locator('[class="vtex-product-price-1-x-savingsPercentage vtex-product-price-1-x-savingsPercentage--mainShelf__savings"]').first().innerText();

                // cuotas
                

                // envio

                products.push(product);
            }
        } catch (err) {
            console.error(`Error scraping ID ${id}`);
        } finally {
            await browser.close();
        }

    }

    return products;

}

module.exports = { scraperOnCity };