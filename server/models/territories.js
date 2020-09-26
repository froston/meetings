const async = require('async')
const { getDb } = require('../db')
const numberModel = require('./numbers')
const consts = require('../helpers/consts')

exports.getAll = (filters, cb) => {
  const query = filters.q ? filters.q.trim() : null

  let where = ''
  where += query ? ` AND (T.number LIKE "%${query}%" OR H.assigned LIKE "%${query}%")` : ``
  where += filters.noAssigned
    ? ` AND ((H.date_from IS NOT NULL AND H.date_to IS NOT NULL) OR (H.date_from IS NULL))`
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
    let ter = ters[0]
    if (!ter) {
      return cb(err, null)
    }
    getTerritoryHist(ter.id, (err, hist) => {
      if (err) throw err
      ter = { ...hist[0], ...ter, history_id: hist[0].id }
      getTerritoryNumbers(ter.number, (err, numbers) => {
        if (err) throw err
        ter.isAssigned = !!ter.date_from && !ter.date_to
        ter.numbers = numbers
        cb(err, ter)
      })
    })
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
    const terHist = {
      assigned: data.assigned,
      date_from: consts.formatDateTime(data.date_to),
      date_to: consts.formatDateTime(data.date_to),
    }
    if (data.history_id > 0) {
      getDb().query('UPDATE territories_hist SET ? WHERE id = ?', [terHist, data.history_id], (err) => {
        if (err) throw err
        async.each(
          data.numbers,
          (num, numCb) => {
            numberModel.getNumberHist(num.id, (err, history) => {
              if (err) throw err
              const prevHist = history[0]
              if (prevHist.status !== num.status) {
                numberModel.createHistory(num, numCb)
              } else {
                num.history_id = prevHist.id
                numberModel.updateHistory(num, numCb)
              }
            })
          },
          cb
        )
      })
    } else {
      terHist.territory_id = id
      getDb().query('INSERT INTO territories_hist SET ?', terHist, (err) => {
        if (err) throw err
        async.each(
          data.numbers,
          (num, numCb) => {
            numberModel.getNumberHist(num.id, (err, history) => {
              if (err) throw err
              const prevHist = history[0]
              if (!prevHist || (prevHist && prevHist.status !== num.status)) {
                numberModel.createHistory(num, numCb)
              } else {
                num.history_id = prevHist.id
                numberModel.updateHistory(num, numCb)
              }
            })
          },
          cb
        )
      })
    }
  })
}

const getTerritoryHist = (id, cb) => {
  getDb().query('SELECT * FROM territories_hist WHERE territory_id = ? ORDER BY id DESC', id, (err, hist) => {
    if (err) throw err
    cb(err, hist)
  })
}

exports.getTerritoryHist = getTerritoryHist

exports.removeHistory = (id, history_id, cb) => {
  getDb().query('DELETE FROM territories_hist WHERE id = ?', history_id, (err) => {
    if (err) throw err
    getTerritoryHist(id, (err, history) => {
      if (err) throw err
      const updatedTer = {
        last_worked: consts.formatDateTime(history[0].date_to),
      }
      getDb().query('UPDATE territories SET ? WHERE id = ?', [updatedTer, id], (err) => {
        if (err) throw err
        cb(null)
      })
    })
  })
}

const getTerritoryNumbers = (terNum, cb) => {
  numberModel.getByTerritoryNumber(terNum, (err, nums) => {
    if (err) throw err
    async.map(
      nums,
      (num, done) => {
        numberModel.getNumberHist(num.id, (err, hist) => {
          if (err) throw err
          done(null, { ...hist[0], ...num })
        })
      },
      cb
    )
  })
}

exports.getTerritoryNumbers = getTerritoryNumbers

exports.getSuggestions = (cb) => {
  getDb().query('SELECT assigned FROM territories_hist GROUP BY assigned', (err, suggestions) => {
    if (err) throw err
    async.map(
      suggestions,
      (sug, done) => {
        done(null, sug.assigned)
      },
      cb
    )
  })
}
