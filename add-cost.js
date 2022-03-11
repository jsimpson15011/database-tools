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
    const [sourceRow] = await connection.query("SELECT * FROM `cost-of-goods-from-shopify`",[]);

    for(let i = 0; i < sourceRow.length; i++){
        const currRow = sourceRow[i]
      if (Number.isFinite(parseFloat(currRow['Cost per item']))  && currRow['Option1 Value'] !== "1lb" && currRow['Option1 Value'] !== "1 lb"){
        itemTitle = currRow['Title'] ? currRow['Title'] : itemTitle

        const [rowsChanged] = await connection.execute(
          "UPDATE `break-into-brands` SET `Default Unit Cost` = ? WHERE (`Item Name` = ? AND (`Variation Name` = ? or `Variation Name` = ?)) AND (`Default Unit Cost` is null OR `Default Unit Cost` <= ?)"
          ,
          [currRow['Cost per item'], itemTitle, currRow['Option1 Value'],currRow['Standard Product Type'], currRow['Cost per item']])

        function addZeroes(num) {
          const dec = num.split('.')[1]
          const len = dec && dec.length > 2 ? dec.length : 2
          return Number(num).toFixed(len)
        }
        if (rowsChanged['affectedRows'] < 1){
          console.log(itemTitle + " " + currRow['Option1 Value'] + " Not Updated!" + "Cost =" + currRow['Cost per item'])
        }

        //update price if higher in shopify spreadsheet
        const [priceChanged] = await connection.execute(
          "UPDATE `break-into-brands` SET `Price` = ? WHERE (`Item Name` = ? AND (`Variation Name` = ? or `Variation Name` = ?)) AND (`Price` is null OR `Price` < ?)"
          ,
          [currRow['Variant Price'], itemTitle, currRow['Option1 Value'],currRow['Standard Product Type'], currRow['Variant Price']])

 /*       if (rowsChanged['affectedRows'] < 1){
          //If no rows were updated try it without a title
          const [newRowsChanged] = await connection.execute("UPDATE `break-into-brands` SET `Default Unit Cost` = ? WHERE `Item Name` = ? AND (`Default Unit Cost` is null OR `Default Unit Cost` < ?)",
            [currRow['Cost per item'], itemTitle, currRow['Cost per item']])

          if (newRowsChanged['affectedRows'] > 1){
            console.log("TOO MUCH", itemTitle)
          }
        }*/
      }





        }


        //console.log(updatedDescription)
        //console.log("-----------------")






  } catch (e){
    console.log("ERROR:")
    console.log(e)
  }
}

addBrand().then(res =>{
  console.log("all Done")
})

