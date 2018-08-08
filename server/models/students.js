const { getDb } = require('../db')
const taskModel = require('./tasks')

exports.getAll = (filter, cb) => {
  getDb().query('SELECT * FROM students', (err, results) => {
    if (err) throw err;
    results.forEach(student => {
      student.available = getAvailable(student)
    })
    cb(err, results)
  });
};

exports.getById = (id, cb) => {
  getDb().query('SELECT * FROM students WHERE id = ?', id, (err, results) => {
    if (err) throw err;
    results[0].available = getAvailable(results[0])
    cb(err, results)
  });
}

exports.createStudent = (newStudent, cb) => {
  const studentToInsert = {
    name: newStudent.name,
    gender: newStudent.gender,
    hall: newStudent.hall,
    nextPoint: newStudent.nextPoint,
    ...setAvailable(newStudent.available)
  }
  getDb().query('INSERT INTO students SET ?', studentToInsert, cb);
}

exports.updateStudent = (id, student, cb) => {
  const studentToUpdate = {
    name: student.name,
    gender: student.gender,
    hall: student.hall,
    nextPoint: student.nextPoint,
    ...setAvailable(student.available)
  }
  getDb().query('UPDATE students SET ? WHERE id = ?', [studentToUpdate, id], cb);
}

exports.removeStudent = (id, cb) => {
  getDb().query('DELETE FROM students WHERE id = ?', id, cb)
}

exports.getAvailableStudents = (limit, taskName, hall, gender = null, helper, cb) => {
  const genderSql = gender && ` AND gender = ${gender}`
  const helperSql = helper && ` AND helper IS TRUE`
  getDb().query(`
    SELECT TOP ${limit} * FROM students 
    WHERE ${getAvailableName(taskName)} IS TRUE AND 
    (hall = "All" OR hall = "${hall}") 
    ${genderSql} 
    ${helperSql} 
    INNER JOIN tasks ON students.id = tasks.student_id ORDER BY year DESC, month DESC, week DESC
  `, (err, res) => {
      if (err) throw err
      cb(res)
    })
}

exports.asyncGetFinalStudent = (limit, taskName, hall, helper = false, gender = null) => {
  return new Promise((resolve, reject) => {
    getAvailableStudents(limit, taskName, hall, helper, gender, (err, students) => {
      if (err) reject(err)
      let finalStudent = {}
      const studentsCount = students.length
      if (studentsCount === 1) {
        finalStudent = students[0]
      } else {
        // sort students according to last task
        students.sort(async (a, b) => {
          const aLastTask = a.tasks[0]
          const bLastTask = b.tasks[0]
          const aSum = aLastTask.week + aLastTask.month + aLastTask.year
          const bSum = bLastTask.week + bLastTask.month + bLastTask.year
          if (aSum > bSum) {
            return 1
          }
          if (aSum < bSum) {
            return -1
          }
          return 0;
        })
        const flhsIndex = Math.floor(Math.random() * studentsCount);
        finalStudent = students[flhsIndex]
      }
      resolve(finalStudent)
    })
  })
}

// helpers
getAvailable = (student) => {
  return [
    student.reading ? "Reading" : undefined,
    student.initialCall ? "Initial Call" : undefined,
    student.returnVisit ? "Return Visit" : undefined,
    student.study ? "Bible Study" : undefined,
    student.talk ? "Talk" : undefined
  ]
}
setAvailable = (available) => {
  return {
    reading: available.find(a => a === "Reading") ? true : false,
    initialCall: available.find(a => a === "Initial Call") ? true : false,
    returnVisit: available.find(a => a === "Return Visit") ? true : false,
    study: available.find(a => a === "Bible Study") ? true : false,
    talk: available.find(a => a === "Talk") ? true : false,
  }
}

getAvailableName = (taskName) => {
  let task = ""
  switch (taskName) {
    case "Reading":
      task = 'reading'
      break
    case "Initial Call":
      task = 'initialCall'
      break
    case "Return Visit":
      task = 'returnVisit'
      break
    case "Bible Study":
      task = 'study'
      break
    case "Talk":
      task = 'talk'
      break
  }
  return task
}