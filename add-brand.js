/*const dbTools = require('./index')*/
const mysql = require("mysql2")
require('dotenv').config();

async function addBrand(){
  let mysql = require('mysql2/promise');

  let connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
  })



  await connection.connect();
  console.log('Connected')

  let itemTitle = ''
  try {
    const [sourceRow] = await connection.query("SELECT * FROM `bulk-update-all` WHERE `Variation Name` IN ('1 oz', '1oz')",[]);


    for(let i = 0; i < sourceRow.length; i++){
      if (sourceRow[i]['Unit and Precision']){//We only care about bulk products
        const currRow = sourceRow[i]
        let desc = currRow['Description']

        function addZeroes(num) {
          const dec = num.split('.')[1]
          const len = dec && dec.length > 2 ? dec.length : 2
          return Number(num).toFixed(len)
        }

        const [poundResult] = await connection.execute("SELECT * FROM `bulk-update-all` WHERE `Item Name` = ? AND `Variation Name` IN ('1lb', '1 lb')",[currRow['Item Name']])
        if (poundResult.length > 0){ //Check if there's a pound variant
          if(!desc){//if there isn't a description on the ounce variant we need to find the pound description
            desc = poundResult[0]['Description'] ? poundResult[0]['Description'] : ""
          }
          const priceToUse = addZeroes(String(currRow['Price']*16))

          if(priceToUse !== poundResult[0]['Price']){
            await connection.execute("INSERT INTO `updated-pound-price` (Token, `Product Name`, `Variant Name`, Price) VALUES (?,?,?,?)"
              ,[poundResult[0]['Token'], poundResult[0]['Item Name'], poundResult[0]['Variation Name'], priceToUse])
          }

          await connection.execute("DELETE FROM `bulk-update-all` WHERE Token = ?", [poundResult[0]['Token']]) //Delete the pound variant because we don't need it
        }

        let updatedDescription = desc + "\n$" + addZeroes(String(currRow['Price']*16)) +"lb/$"+currRow['Price']+"oz*" +
          "16 ounces = 1 pound\n" +
          "1 ounce = .06(1/16)lbs*\n" +
          "\n" +
          "*Prices and weights may vary due to rounding to two decimal places"

        //console.log(updatedDescription)
        //console.log("-----------------")




        await connection.execute("UPDATE `bulk-update-all` SET `Description` = ? WHERE Token = ?"
          ,[updatedDescription, currRow['Token']])


      }


      /*     connection.execute('INSERT INTO `new-square-products` (`Item Name`, SKU, Description, GTIN, Price, `Variation Name`, `Default Unit Cost`, `Default Vendor Name`) VALUES (?,?,?,?,?,?,?,?)'
             ,[itemTitle,currRow['Variant SKU'],currRow['Body (HTML)'], currRow['Variant Barcode'], currRow['Variant Price'], currRow['Option1 Value'], currRow['Cost per item'], currRow['Vendor']], function (err, result){

             })*/
    }
  } catch (e){
    console.log("ERROR:")
    console.log(e)
  }
}

addBrand().then(res =>{
  console.log("all Done")
})

