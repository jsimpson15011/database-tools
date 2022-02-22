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

connection.query('SELECT * FROM `collections-by-title`', function (err, result){
  for (let i = 0; i < result.length; i++){
    const curr = result[i];

    if (!curr['Manual Collections']) continue;

    const longestCat = curr['Manual Collections'].split(',').reduce((a, b) => {
      return a.length > b.length ? a : b
    },'').replace(/-/g, ' ').replace('1', '').split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    }).join(' ')

    console.log(longestCat)
    connection.execute('INSERT INTO `one-collection-by-title` (`Product Title`, `Manual Collections`) VALUES (?,?)',
      [curr['Product Title'], longestCat], function (err, result){
      console.log(result)
      })

  }
})
