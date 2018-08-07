const { ObjectID } = require('mongodb')
const { getDb } = require('../db')
const tasksModel = require('./tasks')

const scheduleCollection = 'schedules'

exports.getAll = (filters, cb) => {
  const collection = getDb().collection(scheduleCollection)
  collection.find(filters).toArray(cb)
};

exports.getById = (id, cb) => {
  const db = getDb()
  const collection = db.collection(scheduleCollection)
  const _id = new ObjectID(id)
  collection.findOne({ _id }, (err, schedule) => {
    if (err) throw err
    tasksModel.getTasksBySchedule(schedule.month, schedule.year, (err, tasks) => {
      schedule.tasks = tasks
      cb(err, schedule)
    })
  })
}

exports.createSchedule = (newSchedule, cb) => {
  const collection = getDb().collection(scheduleCollection)
  collection.insert(newSchedule, cb);
}

exports.updateSchedule = (id, scheduleToUpdate, cb) => {
  const collection = getDb().collection(scheduleCollection)
  const _id = new ObjectID(id)
  collection.updateOne({ _id }, { $set: scheduleToUpdate }, cb);
}

exports.removeSchedule = (id, cb) => {
  const collection = getDb().collection(scheduleCollection)
  const _id = new ObjectID(id)
  collection.deleteOne({ _id }, cb);
}