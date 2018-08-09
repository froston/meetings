const { getDb } = require('../db')
const taskModel = require('./tasks')
const utils = require('../utils')

exports.getAll = (filter, cb) => {
  getDb().query('SELECT * FROM students', (err, results) => {
    if (err) throw err
    results.forEach(student => {
      student.available = utils.getAvailable(student)
    })
    cb(err, results)
  })
}

exports.getById = (id, cb) => {
  getDb().query('SELECT * FROM students WHERE id = ?', id, (err, results) => {
    if (err) throw err
    results[0].available = utils.getAvailable(results[0])
    cb(err, results)
  })
}

exports.createStudent = (newStudent, cb) => {
  const studentToInsert = {
    name: newStudent.name,
    gender: newStudent.gender,
    hall: newStudent.hall,
    nextPoint: newStudent.nextPoint,
    ...utils.setAvailable(newStudent.available)
  }
  getDb().query('INSERT INTO students SET ?', studentToInsert, cb)
}

exports.updateStudent = (id, student, cb) => {
  const studentToUpdate = {
    name: student.name,
    gender: student.gender,
    hall: student.hall,
    nextPoint: student.nextPoint,
    ...utils.setAvailable(student.available)
  }
  getDb().query('UPDATE students SET ? WHERE id = ?', [studentToUpdate, id], cb)
}

exports.removeStudent = (id, cb) => {
  getDb().query('DELETE FROM students WHERE id = ?', id, () => {
    getDb().query('DELETE FROM tasks WHERE student_id = ?', id, cb)
  })
}

const getAvailableStudents = (taskName, hall, gender = null, cb) => {
  const genderSql = gender ? ` AND gender = ${gender}` : ''
  getDb().query(
    `
    SELECT * FROM students 
    WHERE ${utils.getAvailableName(taskName)} IS TRUE AND 
    (hall = "All" OR hall = ?)
    ${genderSql} 
  `,
    [hall],
    cb
  )
}

exports.asyncGetFinalStudent = (
  limit,
  taskName,
  hall,
  helper = false,
  gender = null
) => {
  return new Promise((resolve, reject) => {
    getAvailableStudents(taskName, hall, gender, (err, students) => {
      if (err) reject(err)
      let finalStudent = {}
      const studentsCount = students.length
      if (studentsCount === 1) {
        finalStudent = students[0]
      } else {
        // sort students according to last task
        students.sort(async (a, b) => {
          const aLastTask = await taskModel.asyncGetLastTask(
            a.id,
            taskName,
            hall,
            helper
          )
          const bLastTask = await taskModel.asyncGetLastTask(
            b.id,
            taskName,
            hall,
            helper
          )
          if (aLastTask && !bLastTask) {
            return -1
          }
          if (!aLastTask && bLastTask) {
            return 1
          }
          const aSum = aLastTask.week + aLastTask.month + aLastTask.year
          const bSum = bLastTask.week + bLastTask.month + bLastTask.year
          if (aSum > bSum) {
            return -1
          }
          if (aSum < bSum) {
            return 1
          }
          return 0
        })
        const flhsIndex = Math.floor(Math.random() * studentsCount - 1)
        finalStudent = students[flhsIndex]
      }
      resolve(finalStudent)
    })
  })
}
