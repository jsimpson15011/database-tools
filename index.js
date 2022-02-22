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

function insertByMultipleKeys(sourceTable, targetTable, sourceKeys, targetKeys, sourceKeyToInsert, targetKeyToInsert){
  connection.execute('SELECT * FROM `'+sourceTable+'`',[], function (err, sourceRow){
    sourceRow.forEach(sourceRow => {
      itemTitle = sourceRow['Title'] === "" ? itemTitle : sourceRow['Title']
      let keyIndex = -1;
      const targetWhereClause = sourceRow['Option1 Value'] === 'Default Title' ? `\`Item Name\` = '${sourceRow['Title'].replace(/[']/g, "''")}'` : targetKeys.map(targetKey => {
        keyIndex++

        return sourceRow[sourceKeys[keyIndex]] ?
          `\`${targetKey}\` = '${sourceRow[sourceKeys[keyIndex]].replace(/[']/g,"''")}'` : `\`${targetKey}\` = '${itemTitle.replace(/[']/g,"''")}'`
      }).join(' AND ')

      if (targetWhereClause.includes("''")){console.log(targetWhereClause)}
      //console.log(sourceRow[sourceKeyToInsert])

      connection.execute(
        `UPDATE \`${targetTable}\` SET \`${targetKeyToInsert}\` = '${sourceRow[sourceKeyToInsert] ? sourceRow[sourceKeyToInsert].replace(/[']/g,"''") : ""}' WHERE ${targetWhereClause}`, function (err, result){
          if (err){
            console.log(err)
          }

          console.log(result)
        }
      )
      console.log()
    })
  })
}


/*insertByMultipleKeys(
  'shopify-most-recent-products',
  'square-most-recent-products',
  ['Title','Option1 Value'],
  ['Item Name','Variation Name'],
  'Variant Barcode',
  'GTIN'
)*/


/*insertByMultipleKeys(
  'shopify-most-recent-products',
  'square-2022-no-barcodes',
  ['Title','Option1 Value'],
  ['Item Name','Variation Name'],
  'Variant Barcode',
  'GTIN'
)*/

insertByMultipleKeys(
  'one-collection-by-title',
  'new-square-products',
  ['Product Title'],
  ['Item Name'],
  'Manual Collections',
  'Category'
)
