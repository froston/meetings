const moment = require('moment')
const csv = require('csv-parser')
const path = require('path')
const fs = require('fs')

const db = require('../db')
const numbersModel = require('./numbers')
const territoriesModel = require('./territories')

exports.importNumbersCSV = () => {
  const pathname = path.join(__dirname, '../import.csv')
  fs.createReadStream(pathname)
    .pipe(csv(['number', 'territory', 'details']))
    .on('data', async (row) => {
      return await numbersModel.createNumber({
        number: row.number.replace(/-|\s/g, ''),
        territory: row.territory,
        status: null,
        details: row.details == '' ? null : row.details,
      })
    })
    .on('end', () => {
      console.log('CSV file successfully processed')
    })
}

exports.reduceTerritories = async (req) => {
  let count = 0
  const terNumCount = 25
  const numbers = await numbersModel.getAll({})
  await numbers.forEachAsync(async (number) => {
    if (number.status === 'FS') {
      await db.query('UPDATE numbers SET ? WHERE id = ?', [{ territory: null }, number.id])
      count++
    }
    if (number.status === 'X') {
      if (number.details.toLowerCase().includes('duplicado')) {
        await db.query('DELETE FROM numbers WHERE id = ?', [number.id])
        console.log('DELETED: ' + number.number + ' ' + number.details)
      }
    }
  })
  console.log('NUMBERS CHANGED: ' + count)

  const territories = await territoriesModel.getAll({})

  await territories.forEachAsync(async (res) => {
    let territory = await territoriesModel.getByNumber(res.number)

    if (!territory.isCompany) {
      let diff = terNumCount - (territory.numbers.length + 1)
      if (diff > 0) {
        console.log(`TERRITORY ${territory.number} - MISSING ${diff} (LW: ${territory.last_worked})`)
        const allNums = await db.query(`
          SELECT H.*, N.*, H.id AS history_id
          FROM numbers N 
          LEFT JOIN territories T ON T.number = N.territory
          LEFT JOIN numbers_hist H ON N.id = H.number_id
          WHERE (H.id = (
            SELECT MAX(H2.id) 
            FROM numbers_hist H2 
            WHERE H2.number_id = H.number_id
          ))
          AND H.status != 'FS' AND N.territory > ${territory.number} AND T.isCompany = 0
          ORDER BY N.territory DESC
        `)

        if (!!allNums.length) {
          allNums.sort((a, b) => {
            if (
              !moment(a.changed_date).isSame(territory.last_worked) &&
              moment(b.changed_date).isSame(territory.last_worked)
            ) {
              return 1
            }
            if (
              moment(a.changed_date).isSame(territory.last_worked) &&
              !moment(b.changed_date).isSame(territory.last_worked)
            ) {
              return -1
            }
            if (
              moment(a.changed_date).isAfter(territory.last_worked) &&
              moment(b.changed_date).isBefore(territory.last_worked)
            ) {
              return 1
            }
            if (
              moment(a.changed_date).isBefore(territory.last_worked) &&
              moment(b.changed_date).isAfter(territory.last_worked)
            ) {
              return -1
            }
            return 0
          })

          for (let count = 0; count <= diff; count++) {
            const finalNumber = allNums[count]
            if (finalNumber) {
              await db.query('UPDATE numbers SET ? WHERE id = ?', [{ territory: territory.number }, finalNumber.id])
              console.log(
                `TERRITORY ${territory.number} - ADDING ${finalNumber.number} (LW: ${finalNumber.changed_date})`
              )
            } else {
              console.log(`NO NUMBER!`)
            }
          }
        } else {
          console.log(`NO NUMBERS AT ALL! DELETING ${territory.number}`)
          await db.query('DELETE FROM territories WHERE id = ' + territory.id)
        }
      }
    }
  })
  return count
}
