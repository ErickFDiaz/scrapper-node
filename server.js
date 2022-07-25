const puppeteer = require('puppeteer');

const randomUseragent = require('random-useragent');

const ExcelJS = require('exceljs');

const saveExcel = (data) => {
    const workbook = new ExcelJS.Workbook()
    const fileName = 'lista-productos-ecopal.xlsx'
    const sheet = workbook.addWorksheet('Resultados')

    const reColumns = [
        {header: 'Nombre', key: 'name'},
        {header: 'Precio', key: 'price'},
        {header: 'Image', key: 'image'}
    ]

    sheet.columns = reColumns

    sheet.addRows(data)

    workbook.xlsx.writeFile(fileName).then((e)=> {
        console.log('Creado Exitosamente');
    })
    .catch(()=>{
        console.log('Algo sucedio guardando el archivo Excel');
    })
    
}


const init = async () => {
    const header = randomUseragent.getRandom();

    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setUserAgent(header);

    await page.setViewport({width:1920, height: 1080});

    await page.goto('https://ecopal.com.pe/shop')

    // await page.screenshot({path: 'example.png'})

    await page.waitForSelector('.products')

    const listaDeItems = await page.$$('.product')

    let data = []
    
    for (const item of listaDeItems) {
        const objetoPrecio = await item.$('bdi')
        const objetoNombre = await item.$(".woocommerce-loop-product__title")
        const objetoImagen = await item.$(".attachment-woocommerce_thumbnail")
        const objetoEnlace = await item.$('.woocommerce-LoopProduct-link')
        
        const getPrice = await page.evaluate(objetoPrecio => objetoPrecio.innerText, objetoPrecio)
        const getName = await page.evaluate(objetoNombre => objetoNombre.innerText, objetoNombre)
        const getImage = await page.evaluate(objetoImagen => objetoImagen.getAttribute('src'), objetoImagen)
        const getLink = await page.evaluate(objetoEnlace => objetoEnlace.getAttribute('href'), objetoEnlace)


        

        data.push(
            {
                name:getName,
                price:getPrice,
                image:getImage,
            }
        )
        // console.log(getLink)
    }
    
    await browser.close();

    saveExcel(data);
};


init();