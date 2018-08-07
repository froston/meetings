const { MongoClient } = require('mongodb')
const config = require("./config");

let _db;

const initDb = (callback) => {
  if (_db) {
    console.warn("Trying to init DB again!");
    return callback(null, _db);
  }
  MongoClient.connect(config.dbHost, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      callback(err);
    } else {
      _db = client.db(config.dbName);
      console.log(`DB connected - '${config.dbName}'`)
      callback(null, _db)
    }
  })
}

const getDb = () => {
  if (_db) {
    return _db
  } else {
    console.error("DB not connected. Call `initDb()` first.")
  }
}

module.exports = {
  initDb,
  getDb
}