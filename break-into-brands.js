//This looks for items that don't have cost of goods on them and then breaks it into brand tables

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
    const [allItemsWithoutCost] = await connection.query("SELECT * FROM `break-into-brands` WHERE `Default Unit Cost` is null",[]);
    const brandDict = new Map();

    for(let i = 0; i < allItemsWithoutCost.length; i++){
      const currItem = allItemsWithoutCost[i];
      const brand = currItem['Default Vendor Name'] ? currItem['Default Vendor Name'] : 'Missing Brand';
      if (brandDict.has(currItem['Default Vendor Name'])){
        const prev = brandDict.get(brand)
        prev.push(currItem);
        brandDict.set(brand, prev)
      }
      else{
        brandDict.set(brand, [currItem])
      }
    }

    function convertToSlug(Text) {
      return Text.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '');
    }

    for (const [brand, items] of brandDict){
      console.log(brand)
      const brandTableName = convertToSlug(brand)

      console.log(brandTableName)
      console.log('CREATE TABLE if not exists z'+ brandTableName +' LIKE `break-into-brands`')

      const [tableResult] = await connection.execute('CREATE TABLE if not exists z'+ brandTableName +' LIKE `break-into-brands`')



      for(const item of items){
        await connection.execute('INSERT INTO z'+ brandTableName +' (`Reference Handle`, Token, `Item Name`, `Variation Name`, `Unit and Precision`, SKU, Description, Category, GTIN, Price, `Option Name 1`, `Option Value 1`, `Default Unit Cost`, `Default Vendor Name`, `Default Vendor Code`, `Current Quantity Staple and Spice Market`, `New Quantity Staple and Spice Market`, `Stock Alert Enabled Staple and Spice Market`, `Stock Alert Count Staple and Spice Market`, `Tax - Municipal Gross Receipts Tax (1%)`, `Tax - Rapid City Sales Tax (2%)`, `Tax - South Dakota Sales Tax (4.5%)`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          [
            item[`Reference Handle`],
            item.Token,
            item[`Item Name`],
            item[`Variation Name`],
            item[`Unit and Precision`],
            item.SKU,
            item.Description,
            item.Category,
            item.GTIN,
            item.Price,
            item[`Option Name 1`],
            item[`Option Value 1`],
            item[`Default Unit Cost`],
            item[`Default Vendor Name`],
            item[`Default Vendor Code`],
            item[`Current Quantity Staple and Spice Market`],
            item[`New Quantity Staple and Spice Market`],
            item[`Stock Alert Enabled Staple and Spice Market`],
            item[`Stock Alert Count Staple and Spice Market`],
            item[`Tax - Municipal Gross Receipts Tax (1%)`],
            item[`Tax - Rapid City Sales Tax (2%)`],
            item[`Tax - South Dakota Sales Tax (4.5%)`]])




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

