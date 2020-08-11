const async = require('async')
const { getDb } = require('../db')
const numberModel = require('./numbers')
const consts = require('../helpers/consts')

exports.getAll = (filters, cb) => {
  const query = filters.q ? filters.q.trim() : null

  let where = ''
  where += query ? `AND (T.number LIKE "%${query}%" OR H.assigned LIKE "%${query}%")` : ``
  where += filters.noAssigned
    ? `AND ((H.date_from IS NOT NULL AND H.date_to IS NOT NULL) OR (H.date_from IS NULL))`
    : ``

  let order
  switch (filters.orderBy) {
    case 'numberDesc':
      order = 'ORDER BY T.number DESC'
      break
    case 'numberAsc':
      order = 'ORDER BY T.number ASC'
      break
    case 'dateDesc':
      order = 'ORDER BY T.last_worked DESC'
      break
    case 'dateAsc':
      order = 'ORDER BY T.last_worked ASC'
      break
    default:
      order = 'ORDER BY T.id'
  }

  getDb().query(
    `SELECT H.*, T.*, H.id AS history_id
      FROM territories T
      LEFT JOIN territories_hist H ON T.id = H.territory_id
      WHERE H.id = (
        SELECT MAX(H2.id) 
        FROM territories_hist H2 
        WHERE H2.territory_id = H.territory_id
      )
      ${where}
      ${order}
    `,
    (err, ters) => {
      if (err) throw err

      async.map(
        ters,
        (ter, done) => {
          numberModel.getByTerritoryNumber(ter.number, (err, numbers) => {
            if (err) throw err
            ter.isAssigned = !!ter.date_from && !ter.date_to
            ter.numbers = numbers
            done(null, ter)
          })
        },
        cb
      )
    }
  )
}

exports.getById = (id, cb) => {
  getDb().query('SELECT * FROM territories WHERE id = ?', id, (err, ters) => {
    if (err) throw err
    cb(err, ters[0])
  })
}

exports.createTerritory = (data, cb) => {
  const obj = {
    number: data.number,
  }
  getDb().query('INSERT INTO territories SET ?', obj, (err, res) => {
    if (err) throw err
    const newHistroy = {
      territory_id: res.insertId,
      assigned: data.assigned,
      date_from: consts.formatDateTime(data.date_from),
    }
    getDb().query('INSERT INTO territories_hist SET ?', newHistroy, (err) => {
      if (err) throw err
      cb(null)
    })
  })
}

exports.updateTerritory = (id, data, cb) => {
  const updatedTer = {
    number: data.number,
  }
  getDb().query('UPDATE territories SET ? WHERE id = ?', [updatedTer, id], (err) => {
    if (err) throw err
    const updatedHist = {
      assigned: data.assigned,
      date_from: consts.formatDateTime(data.date_from),
      date_to: consts.formatDateTime(data.date_to),
    }
    getDb().query('UPDATE territories_hist SET ? WHERE id = ?', [updatedHist, data.history_id], (err) => {
      if (err) throw err
      cb(null)
    })
  })
}

exports.removeTerritory = (id, cb) => {
  getDb().query('DELETE FROM territories WHERE id = ?', id, (err) => {
    if (err) throw err
    getDb().query('DELETE FROM territories_hist WHERE territory_id = ?', id, (err) => {
      if (err) throw err
      cb(null)
    })
  })
}

exports.createAssignment = (id, data, cb) => {
  const newHistroy = {
    territory_id: id,
    assigned: data.assigned,
    date_from: consts.formatDateTime(data.date_from),
  }
  getDb().query('INSERT INTO territories_hist SET ?', newHistroy, (err) => {
    if (err) throw err
    cb(null)
  })
}

exports.updateAssignment = (history_id, data, cb) => {
  const updatedHist = {
    assigned: data.assigned,
    date_from: consts.formatDateTime(data.date_from),
  }
  getDb().query('UPDATE territories_hist SET ? WHERE id = ?', [updatedHist, history_id], (err) => {
    if (err) throw err
    cb(null)
  })
}

exports.workTerritory = (id, data, cb) => {
  const updatedTer = {
    last_worked: consts.formatDateTime(data.date_to),
  }
  getDb().query('UPDATE territories SET ? WHERE id = ?', [updatedTer, id], (err) => {
    if (err) throw err
    const updatedTerHist = {
      assigned: data.assigned,
      date_from: consts.formatDateTime(data.date_to),
      date_to: consts.formatDateTime(data.date_to),
    }
    getDb().query('UPDATE territories_hist SET ? WHERE id = ?', [updatedTerHist, data.history_id], (err) => {
      if (err) throw err
      async.each(
        data.numbers,
        (num, numCb) => {
          const newHistroy = {
            number_id: num.id,
            status: num.status,
            details: num.details,
          }
          getDb().query('INSERT INTO numbers_hist SET ?', newHistroy, (err) => {
            if (err) throw err
            numCb(err)
          })
        },
        cb
      )
    })
  })
}
