const { getDb } = require('../db')

const getAll = (query, cb) => {
  let where = ''
  getDb().query(`SELECT * FROM numbers ${where} ORDER BY id DESC`, cb)
}

const getById = (id, cb) => {
  getDb().query('SELECT * FROM numbers WHERE id = ?', id, (err, nums) => {
    if (err) throw err
    cb(err, nums[0])
  })
}

module.exports = {
  getAll,
  getById,
}
