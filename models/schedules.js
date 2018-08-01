const { getDb } = require('../db')

const scheduleCollection = 'schedules'

const getAll = (cb) => {
  const collection = getDb().collection(scheduleCollection)
  collection.find({}).toArray((err, users) => {
    return cb(err, users)
  })
};

module.exports = {
  getAll
}
