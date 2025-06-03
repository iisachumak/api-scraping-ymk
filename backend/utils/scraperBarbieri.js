const { chromium } = require('playwright');
const XLSX = require('xlsx');

async function scraperBarbieri() {
    const workbook = XLSX.readFile('busqueda.xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const products = [];

    for (const row of data) {
        const id = row.ID_FRABRICANTE;

        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            await page.goto('https://www.oscarbarbieri.com/');

            await page.fill('[id="search"]', id)
            await page.click('[class="action search"]');
            await page.waitForTimeout(5000);

            const urlElement = await page.$('[class="product-item-link"]')

            if (urlElement) {
                const href = await urlElement.getAttribute('href')
                console.log(href);

                await page.goto(href);

                const product = {};
                
                //Ejemplo
                //await page.waitForSelector('#codigo_postal', { state: 'visible' });
                //await page.fill('#codigo_postal', codigoPostal.toString());

                // url del producto
                product.product_url = href;

                // image del producto
                const product_src = await page.$('.fotorama__img')

                if (product_src){
                    product.product_img = await product_src.getAttribute("src")
                }

                // nombre producto
                product.product_name = await page.textContent('[data-ui-id="page-title-wrapper"]');

                // precio antes
                await page.waitForSelector('.old-price', {state:'visible'});
                product.older_price = await page.locator('[class="old-price"]').first().innerText();

                // precio actual
                await page.waitForSelector('.price', {state:'visible'})
                product.current_price = await page.locator('[class="price"]').first().innerText();

                // procentaje de descuento
                product.off = await page.locator('[class="descuento"]').first().innerText();

                // cuotas
                const raw_rules = await page.textContent('[class="mejor-cuota"]');
                product.rules = raw_rules.replace(/\s+/g, ' ').trim();

                // valor del envio
                // click en el collapsed
                await page.click('[class="ed-ingresar-cp collapsed"]')
                await page.waitForTimeout(2000);
                // llenamos con nuestro codigo postal
                const codigoPostal = 4000
                await page.waitForSelector('#codigo_postal', { state: 'visible' });
                await page.fill('#codigo_postal', codigoPostal.toString());

                await page.waitForTimeout(3000);
                await page.click('[class="calcular-envio"]');

                await page.waitForTimeout(3000);
                await page.waitForSelector('.ed-cotizacion', { state: 'visible' });
                const shippingText = await page.locator('[class="ed-cotizacion"]').innerText();
                product.shipping_price = shippingText.replace(/\n/g, ' | ');

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

module.exports = { scraperBarbieri };
