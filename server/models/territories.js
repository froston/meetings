const db = require('../db')
const numberModel = require('./numbers')
const consts = require('../helpers/consts')

const getAll = async (filters) => {
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

  const ters = await db.query(
    `SELECT H.*, T.*, H.id AS history_id
      FROM territories T
      LEFT JOIN territories_hist H ON T.id = H.territory_id
      WHERE H.id = (
        SELECT MAX(H2.id) 
        FROM territories_hist H2 
        WHERE H2.territory_id = H.territory_id
      )
      ${where}
      ${order}`
  )
  await ters.mapAsync(async (ter) => {
    const numbers = await numberModel.getByTerritoryNumber(ter.number)
    ter.isAssigned = !!ter.date_from && !ter.date_to
    ter.numbers = numbers
    return ter
  })
  return ters
}
const getById = async (id) => {
  const ters = await db.query('SELECT * FROM territories WHERE id = ?', id)
  let ter = ters[0]

  if (!ter) {
    return null
  }
  const hist = await getTerritoryHist(ter.id)
  ter = { ...hist[0], ...ter, history_id: hist[0].id }

  const numbers = await getTerritoryNumbers(ter.number)
  ter.isAssigned = !!ter.date_from && !ter.date_to
  ter.numbers = numbers

  return ter
}

const getByNumber = async (number) => {
  const ters = await db.query('SELECT * FROM territories WHERE number = ?', number)
  let ter = ters[0]

  if (!ter) {
    return null
  }
  const hist = await getTerritoryHist(ter.id)
  ter = { ...hist[0], ...ter, history_id: hist[0].id }

  const numbers = await getTerritoryNumbers(ter.number)
  ter.isAssigned = !!ter.date_from && !ter.date_to
  ter.numbers = numbers

  return ter
}

const createTerritory = async (data) => {
  const exists = await territoryExists(data.number)
  if (exists) {
    throw { alreadyExists: true }
  }
  const newTer = {
    number: data.number,
    isCompany: data.isCompany,
  }
  const res = await db.query('INSERT INTO territories SET ?', newTer)

  const newHistroy = {
    territory_id: res.insertId,
    assigned: data.assigned,
    date_from: consts.formatDateTime(data.date_from),
  }
  await db.query('INSERT INTO territories_hist SET ?', newHistroy)
}

const updateTerritory = async (id, data) => {
  const exists = await territoryExists(data.number, id)
  if (exists) {
    throw { alreadyExists: true }
  }
  const updatedTer = {
    number: data.number,
    isCompany: data.isCompany,
  }
  await db.query('UPDATE territories SET ? WHERE id = ?', [updatedTer, id])

  const updatedHist = {
    assigned: data.assigned,
    date_from: consts.formatDateTime(data.date_from),
    date_to: consts.formatDateTime(data.date_to),
  }
  await db.query('UPDATE territories_hist SET ? WHERE id = ?', [updatedHist, data.history_id])
}

const removeTerritory = async (id) => {
  await db.query('DELETE FROM territories WHERE id = ?', id)
  await db.query('DELETE FROM territories_hist WHERE territory_id = ?', id)
}

const createAssignment = async (id, data) => {
  const newHistroy = {
    territory_id: id,
    assigned: data.assigned,
    date_from: consts.formatDateTime(data.date_from),
  }
  await db.query('INSERT INTO territories_hist SET ?', newHistroy)
}

const updateAssignment = async (history_id, data) => {
  const updatedHist = {
    assigned: data.assigned,
    date_from: consts.formatDateTime(data.date_from),
  }
  await db.query('UPDATE territories_hist SET ? WHERE id = ?', [updatedHist, history_id])
}

const workTerritory = async (id, data) => {
  const updatedTer = {
    last_worked: consts.formatDateTime(data.date_to),
  }
  await db.query('UPDATE territories SET ? WHERE id = ?', [updatedTer, id])

  const terHist = {
    assigned: data.assigned,
    date_from: consts.formatDateTime(data.date_from),
    date_to: consts.formatDateTime(data.date_to),
  }
  if (data.history_id > 0) {
    await db.query('UPDATE territories_hist SET ? WHERE id = ?', [terHist, data.history_id])

    await data.numbers.forEachAsync(async (num) => {
      const history = await numberModel.getNumberHist(num.id)
      const prevHist = history[0]

      if (prevHist.status !== num.status) {
        await numberModel.createHistory(num)
      } else {
        num.history_id = prevHist.id
        await numberModel.updateHistory(num)
      }
    })
  } else {
    terHist.territory_id = id
    await db.query('INSERT INTO territories_hist SET ?', terHist)

    await data.numbers.forEachAsync(async (num) => {
      const history = await numberModel.getNumberHist(num.id)
      const prevHist = history[0]

      if (!prevHist || (prevHist && prevHist.status !== num.status)) {
        await numberModel.createHistory(num)
      } else {
        num.history_id = prevHist.id
        await numberModel.updateHistory(num)
      }
    })
  }
}

const getTerritoryHist = async (id) => {
  return await db.query('SELECT * FROM territories_hist WHERE territory_id = ? ORDER BY id DESC', id)
}

const removeHistory = async (id, history_id) => {
  await db.query('DELETE FROM territories_hist WHERE id = ?', history_id)

  const history = await getTerritoryHist(id)

  const updatedTer = {
    last_worked: consts.formatDateTime(history[0].date_to),
  }
  await db.query('UPDATE territories SET ? WHERE id = ?', [updatedTer, id])
}

const getTerritoryNumbers = async (terNum) => {
  const nums = await numberModel.getByTerritoryNumber(terNum)

  await nums.mapAsync(async (num) => {
    const hist = await numberModel.getNumberHist(num.id)
    return { ...hist[0], ...num }
  })

  return nums
}

const getSuggestions = async () => {
  const suggestions = await db.query('SELECT assigned FROM territories_hist GROUP BY assigned')
  await suggestions.mapAsync(async (sug) => sug.assigned)
  return suggestions
}

const territoryExists = async (number, id = null) => {
  const ters = await db.query(`SELECT * FROM territories WHERE number = ? AND id <> ?`, [number, Number(id)])
  return ters && ters[0] ? true : false
}

module.exports = {
  getAll,
  getById,
  getByNumber,
  createTerritory,
  removeTerritory,
  updateTerritory,
  createAssignment,
  updateAssignment,
  getTerritoryNumbers,
  removeHistory,
  getTerritoryHist,
  workTerritory,
  getSuggestions,
  territoryExists,
}
