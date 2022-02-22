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

connection.query('SELECT * FROM `new-square-products`', function (err, result){
  for (let i = 0; i < result.length; i++){
    const curr = result[i];
    if (curr["GTIN"]){
      console.log(curr["GTIN"].replace(/\D/g,''));
       connection.execute('UPDATE `new-square-products` SET GTIN = ? WHERE ID = ?',[curr["GTIN"].replace(/\D/g,''), curr["ID"]], function (err, result){
         console.log(result)
       })
    }


    const desc = curr['Description']
    if (!desc) continue;

    const descSplit = desc.split('Descriptions:')
    if (descSplit.length > 2){
      connection.execute('UPDATE `new-square-products` SET Description = ? WHERE ID = ?',[descSplit[1], curr["ID"]], function (err, result){
        console.log(result)
      })
    }

  }
})

