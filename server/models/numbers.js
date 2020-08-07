const { getDb } = require('../db')

exports.getAll = (query, cb) => {
  let where = ''
  getDb().query(
    `
    SELECT H.*, N.* FROM numbers N 
      LEFT JOIN numbers_hist H ON N.id = H.number_id
      ${where} 
      ORDER BY N.id DESC`,
    cb
  )
}

exports.getById = (id, cb) => {
  getDb().query('SELECT * FROM numbers WHERE id = ?', id, (err, nums) => {
    if (err) throw err
    cb(err, nums[0])
  })
}

exports.getByTerritoryNumber = (num, cb) => {
  getDb().query('SELECT * FROM numbers WHERE territory = ?', num, (err, nums) => {
    if (err) throw err
    cb(err, nums)
  })
}

exports.createNumber = (data, cb) => {
  const newNumber = {
    number: data.number,
    name: data.name,
    territory: data.territory,
  }
  getDb().query('INSERT INTO numbers SET ?', newNumber, cb)
}

exports.updateNumber = (id, data, cb) => {
  const updatedNumber = {
    number: data.number,
    name: data.name,
    territory: data.territory,
  }
  getDb().query('UPDATE numbers SET ? WHERE id = ?', [updatedNumber, id], cb)
}

exports.removeNumber = (id, cb) => {
  getDb().query('DELETE FROM numbers WHERE id = ?', id, cb)
}
