const db = require('../db')
const consts = require('../helpers/consts')

const getAll = async (filters) => {
  const query = filters.q ? filters.q.trim() : null
  let where = '' // to simplify dynamic conditions syntax
  where += query ? `AND (N.number LIKE "%${query}%" OR H.details LIKE "%${query}%") ` : ``
  where += filters.status ? `AND H.status = "${filters.status}" ` : ''
  if (filters.territory == 0) {
    where += `AND N.territory IS NULL `
  } else if (filters.territory > 0) {
    where += `AND N.territory = ${filters.territory} `
  }

  let limit = ''
  limit += filters.offset && filters.limit ? `LIMIT ${filters.offset}, ${filters.limit}` : ''

  return await db.query(
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
      ${limit}`
  )
}

const getById = async (id) => {
  const nums = await db.query('SELECT * FROM numbers WHERE id = ?', id)
  return nums[0]
}

const getByTerritoryNumber = async (num) => {
  return await db.query('SELECT * FROM numbers WHERE territory = ?', num)
}

const createNumber = async (data) => {
  const exists = await numberExists(data.number)
  if (exists) {
    throw { alreadyExists: true }
  }
  const newNumber = {
    number: data.number,
    territory: data.territory,
    user: data.username,
  }
  const res = await db.query('INSERT INTO numbers SET ?', newNumber)

  const newHistroy = {
    number_id: res.insertId,
    status: data.status,
    details: data.details,
  }
  await db.query('INSERT INTO numbers_hist SET ?', newHistroy)
}

const updateNumber = async (id, data) => {
  const exists = await numberExists(data.number, id)
  if (exists) {
    throw { alreadyExists: true }
  }
  const updatedNumber = {
    number: data.number,
    territory: data.territory,
  }
  await db.query('UPDATE numbers SET ? WHERE id = ?', [updatedNumber, id])

  const history = await getNumberHist(id)

  const prevHist = history[0]

  if (prevHist.status !== data.status) {
    const newHistroy = {
      number_id: id,
      status: data.status,
      details: data.details,
    }
    await db.query('INSERT INTO numbers_hist SET ?', newHistroy)
  } else {
    const updatedHist = {
      status: data.status,
      details: data.details,
    }
    await db.query('UPDATE numbers_hist SET ? WHERE id = ?', [updatedHist, data.history_id])
  }
}

const removeNumber = async (id) => {
  await db.query('DELETE FROM numbers WHERE id = ?', id)
  await db.query('DELETE FROM numbers_hist WHERE number_id = ?', id)
}

const createHistory = async (data) => {
  const newHistroy = {
    number_id: data.id,
    status: data.status,
    details: data.details,
  }
  await db.query('INSERT INTO numbers_hist SET ?', newHistroy)
}

const updateHistory = async (data) => {
  const updatedHist = {
    status: data.status,
    details: data.details,
    changed_date: consts.getUpdateDate(),
  }
  await db.query('UPDATE numbers_hist SET ? WHERE id = ?', [updatedHist, data.history_id])
}

const getNumberHist = async (id) => {
  return await db.query('SELECT * FROM numbers_hist WHERE number_id = ? ORDER BY id DESC', id)
}

const removeHistory = async (id, history_id) => {
  await db.query('DELETE FROM numbers_hist WHERE id = ?', history_id)
}

const numberExists = async (number, id = null) => {
  const nums = await db.query(`SELECT * FROM numbers WHERE number = ? AND id <> ?`, [number, Number(id)])
  return nums && nums[0] ? true : false
}

const getSuggestions = async () => {
  const suggestions = await db.query(`
    SELECT H.details
    FROM numbers N 
    INNER JOIN numbers_hist H ON N.id = H.number_id
    WHERE (H.id = (
      SELECT MAX(H2.id) 
      FROM numbers_hist H2 
      WHERE H2.number_id = H.number_id
    ))
    AND H.status = "RV"
    GROUP BY details
  `)
  await suggestions.mapAsync(async (sug) => sug.details)
  return suggestions
}

module.exports = {
  getAll,
  getById,
  getByTerritoryNumber,
  createNumber,
  updateNumber,
  removeNumber,
  createHistory,
  updateHistory,
  getNumberHist,
  removeHistory,
  numberExists,
  getSuggestions,
}
