/*const dbTools = require('./index')*/
require('dotenv').config();
let mysql = require('mysql2');

let connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})

connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('Connected to the MySQL server.');
});

let itemTitle = ''
try {
  connection.query('SELECT * FROM `vitamins-and-supplements`',[], function (err, sourceRow){

    for(let i = 0; i < sourceRow.length; i++){
      const currRow = sourceRow[i];
      itemTitle = currRow['Title'] === "" ? itemTitle : currRow['Title']
      //If there's no Option name it means this row is just an image, since we can't use the csv to upload images we skip it
      if (!currRow['Option1 Value']){
        continue;
      }

      currRow['Variant SKU'] = currRow['Variant SKU'] || null
      currRow['Variant Barcode'] = currRow['Variant Barcode'] || null
      currRow['Variant Price'] = currRow['Variant Price'] || null
      currRow['Option1 Name'] = currRow['Option1 Name'] || null
      currRow['Option1 Value'] = currRow['Option1 Value'] || null
      currRow['Cost per item'] = currRow['Cost per item'] || null
      currRow['Vendor']= currRow['Vendor'] || null


      connection.execute('INSERT INTO `new-square-products` (`Item Name`, SKU, Description, GTIN, Price, `Variation Name`, `Default Unit Cost`, `Default Vendor Name`) VALUES (?,?,?,?,?,?,?,?)'
        ,[itemTitle,currRow['Variant SKU'],currRow['Body (HTML)'], currRow['Variant Barcode'], currRow['Variant Price'], currRow['Option1 Value'], currRow['Cost per item'], currRow['Vendor']], function (err, result){

        })
    }
  })
} catch (e){
  console.log(e)
}



/*dbTools.insertByMultipleKeys(
  'vitamins-and-supplements',
  'new-square-products',
  ['Title','Option1 Value'],
  ['Item Name','Variation Name'],
  'Title',
  'Item Name'
)

dbTools.insertByMultipleKeys(
  'vitamins-and-supplements',
  'new-square-products',
  ['Title','Option1 Value'],
  ['Item Name','Variation Name'],
  'Title',
  'Item Name'
)


dbTools.insertByMultipleKeys(
  'vitamins-and-supplements',
  'new-square-products',
  ['Title','Option1 Value'],
  ['Item Name','Variation Name'],
  'Variant Barcode',
  'GTIN'
)*/
