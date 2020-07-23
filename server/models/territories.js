const { getDb } = require('../db')

const getAll = (query, cb) => {
  let where = ''
  getDb().query(`SELECT * FROM territories ${where} ORDER BY id DESC`, (err, ters) => {
    if (err) throw err
    cb(err, ters)
  })
}

const getById = (id, cb) => {
  getDb().query('SELECT * FROM territories WHERE id = ?', id, (err, ters) => {
    if (err) throw err
    cb(err, ters[0])
  })
}

module.exports = {
  getAll,
  getById,
}
