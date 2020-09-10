const mysql = require('mysql')
const config = require('../config')

let connection

const initDb = (cb) => {
  connection = mysql.createConnection({
    host: config.host,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
  })
  connection.connect((err, packet) => {
    if (err) throw err
    console.log('DB connected')
    cb(err, packet)
  })
}

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    if (connection) {
      connection.query(sql, params, (err, res) => {
        if (err) {
          reject(err)
          return
        }
        resolve(res)
      })
    } else {
      reject('DB not connected. Call `initDb()` first.')
    }
  })
}

const getDb = () => {
  if (connection) {
    return connection
  } else {
    console.error('DB not connected. Call `initDb()` first.')
  }
}

module.exports = {
  initDb,
  getDb,
  query,
}
