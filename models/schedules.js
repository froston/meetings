const { ObjectID } = require('mongodb')

const scheduleCollection = 'schedules'

const getAll = (db, cb) => {
  const collection = db.collection(scheduleCollection)
  collection.find({}).toArray((err, users) => {
    return cb(err, users)
  })
};

module.exports = {
  getAll
}
