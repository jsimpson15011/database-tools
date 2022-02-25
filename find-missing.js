/*const dbTools = require('./index')*/
const mysql = require("mysql2")
require('dotenv').config()

async function findMissing() {
  let mysql = require('mysql2/promise')

  let connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
  })

  function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime()//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16//random number between 0 and 16
      if (d > 0) {//Use timestamp until depleted
        r = (d + r) % 16 | 0
        d = Math.floor(d / 16)
      } else {//Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0
        d2 = Math.floor(d2 / 16)
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
  }


  await connection.connect()
  console.log('Connected')

  let itemTitle = ''
  let vendor = ''
  let numberOfMissing = 0
  try {
    const [sourceRow] = await connection.query("SELECT * FROM `staple-and-spice-shopify-products`", [])
    for (let i = 0; i < sourceRow.length; i++) {

      const item = sourceRow[i]
      itemTitle = sourceRow[i]['Title'] ? sourceRow[i]['Title'] : itemTitle
      vendor = sourceRow[i]['Vendor'] ? sourceRow[i]['Vendor'] : vendor
      const description = item['Body (HTML)'] ? item['Body (HTML)'].replace(/(<([^>]+)>)/gi, "") : ''
      const variationName = sourceRow[i]['Option1 Value']


      const [squareProductMatch] = await connection.query("SELECT * FROM `catalog-2022-02-24-2241` WHERE `Item Name` = ?", [itemTitle])

      if (squareProductMatch.length === 0) {
        const [collectionRow] = await connection.query("SELECT * FROM `one-collection-by-title` WHERE `Product Title` = ?", [itemTitle])
        const collection = collectionRow[0] ? collectionRow[0]['Manual Collections'] : ''
        const alcoholTax = collection === 'Alcohol Tax' ? 'Y' : 'N'

        await connection.query("INSERT INTO `square_missing` (Token, `Item Name`, `Variation Name`, SKU, Description, Category, GTIN, Price, `Default Vendor Name`, `Tax - Municipal Gross Receipts Tax (1%)`, `Tax - Rapid City Sales Tax (2%)`, `Tax - South Dakota Sales Tax (4.5%)`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
          [generateUUID(), itemTitle, variationName, item['Variant SKU'], description, collection, item['Variant Barcode'], item['Variant Price'], vendor, alcoholTax, 'Y', 'Y'])


        console.log("MISSING:", itemTitle, numberOfMissing)
        numberOfMissing++
      }

    }
  } catch (e) {
    console.log("ERROR:")
    console.log(e)
  }
}

findMissing().then(res => {
  console.log("all Done")
})
