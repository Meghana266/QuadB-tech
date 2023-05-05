const express = require('express');
const sqlite3 = require("sqlite3").verbose();
const axios = require('axios');
const app = express();
const port = 3000;
app.set('view engine','ejs');

app.use('/public', express.static('public'));

//connecting to the database
const db = new sqlite3.Database('./wazirx.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
});


const sql=`drop table tickers`
db.run(sql, err => {
  if (err) {
    return console.error(err.message);
  }
});

const sql_create = `CREATE TABLE IF NOT EXISTS tickers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  last_price REAL NOT NULL,
  buy_price REAL NOT NULL,
  sell_price REAL NOT NULL,
  volume REAL NOT NULL,
  base_unit TEXT NOT NULL
);`;

db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
});

// Make a request to the API
axios.get('https://api.wazirx.com/api/v2/tickers')
.then(response => 
{
  const tickers = response.data;

  // Insert the tickers data into the database
  (Object.values(tickers).slice(0,10)).forEach(ticker => {
      const { name, last, buy, sell, volume, base_unit, quote_unit } = ticker;
      db.run(`INSERT INTO tickers (name, last_price, buy_price, sell_price, volume, base_unit)
              VALUES (?, ?, ?, ?, ?, ?)`,
          [name, last, buy, sell, volume, base_unit], (err) => {
              if (err) {
              }
          });
  });
})
.catch(error => {
  console.error(error);
});

app.get('/',(req,res)=>{
  // Define the SQL query to retrieve data from the table
  const sql2 = 'SELECT * FROM tickers';

  // Execute the query and retrieve the results
  db.all(sql2, [], (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      if(rows)
      {
        res.render('display', { data: rows });
      }
    }
  });
})

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});