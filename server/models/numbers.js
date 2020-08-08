const { getDb } = require('../db')

exports.getAll = (query, cb) => {
  let where = ''
  getDb().query(
    `
    SELECT H.*, N.*, H.id AS history_id FROM numbers N 
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
  getDb().query('INSERT INTO numbers SET ?', newNumber, (err, res) => {
    if (err) throw err
    const newHistroy = {
      number_id: res.insertId,
      status: data.status,
      details: data.details,
    }
    getDb().query('INSERT INTO numbers_hist SET ?', newHistroy, (err) => {
      if (err) throw err
      cb(null)
    })
  })
}

exports.updateNumber = (id, data, cb) => {
  const updatedNumber = {
    number: data.number,
    name: data.name,
    territory: data.territory,
  }
  getDb().query('UPDATE numbers SET ? WHERE id = ?', [updatedNumber, id], (err) => {
    if (err) throw err
    const updatedHist = {
      status: data.status,
      details: data.details,
    }
    getDb().query('UPDATE numbers_hist SET ? WHERE id = ?', [updatedHist, data.history_id], (err) => {
      if (err) throw err
      cb(null)
    })
  })
}

exports.removeNumber = (id, cb) => {
  getDb().query('DELETE FROM numbers WHERE id = ?', id, (err) => {
    if (err) throw err
    getDb().query('DELETE FROM numbers_hist WHERE number_id = ?', id, (err) => {
      if (err) throw err
      cb(null)
    })
  })
}
