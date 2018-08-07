const mysql = require('mysql');
const config = require("./config");

let connection;

const initDb = (cb) => {
  connection = mysql.createConnection({
    host: config.host,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
  });
  connection.connect((err, packet) => {
    if (err) throw err
    console.log("DB connected")
    cb(err, packet)
  });
}

const getDb = () => {
  if (connection) {
    return connection
  } else {
    console.error("DB not connected. Call `initDb()` first.")
  }
}

module.exports = {
  initDb,
  getDb
}