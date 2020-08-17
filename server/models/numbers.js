const { getDb } = require('../db')
const consts = require('../helpers/consts')

exports.getAll = (filters, cb) => {
  const query = filters.q ? filters.q.trim() : null
  let where = '' // to simplify dynamic conditions syntax
  where += query ? `AND (N.number LIKE "%${query}%" OR N.name LIKE "%${query}%" OR H.details LIKE "%${query}%")` : ``
  where += filters.status ? `AND H.status = "${filters.status}"` : ''
  let limit = ''
  limit += filters.offset && filters.limit ? `LIMIT ${filters.offset}, ${filters.limit}` : ''
  getDb().query(
    `SELECT H.*, N.*, H.id AS history_id
      FROM numbers N 
      LEFT JOIN numbers_hist H ON N.id = H.number_id
      WHERE (H.id = (
        SELECT MAX(H2.id) 
        FROM numbers_hist H2 
        WHERE H2.number_id = H.number_id
      ))
      ${where} 
      ORDER BY N.id DESC
      ${limit}`,
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

exports.createHistory = (data, cb) => {
  const newHistroy = {
    number_id: data.id,
    status: data.status,
    details: data.details,
  }
  getDb().query('INSERT INTO numbers_hist SET ?', newHistroy, (err) => {
    if (err) throw err
    cb(err)
  })
}

exports.updateHistory = (data, cb) => {
  const updatedHist = {
    status: data.status,
    details: data.details,
    changed_date: consts.getUpdateDate(),
  }
  getDb().query('UPDATE numbers_hist SET ? WHERE id = ?', [updatedHist, data.history_id], (err) => {
    if (err) throw err
    cb(null)
  })
}

exports.getNumberHist = (id, cb) => {
  getDb().query('SELECT * FROM numbers_hist WHERE number_id = ? ORDER BY id DESC', id, (err, hist) => {
    if (err) throw err
    cb(err, hist)
  })
}
