const { ObjectID } = require('mongodb')
const { getDb } = require('../db')

const studentsCollection = 'students'

exports.getTasksBySchedule = (month, year, cb) => {
  const collection = getDb().collection(studentsCollection)
  let tasks = []
  collection.find({
    "tasks": {
      $elemMatch: { month: month, year: year }
    }
  }).toArray((err, students) => {
    if (err) throw err
    students.forEach(student => {
      student.tasks.forEach(task => {
        if (task.month == month && task.year == year) {
          tasks.push({ studentId: student._id, name: student.name, ...task })
        }
      })
    })
    cb(err, tasks)
  })
}

exports.addTask = (studentId, newTask, cb) => {
  const collection = getDb().collection(studentsCollection)
  const _id = new ObjectID(studentId)
  collection.update({ _id }, { $push: { tasks: newTask } }, cb);
}
