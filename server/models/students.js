const db = require('../db')
const taskModel = require('./tasks')
const consts = require('../helpers/consts')
const sorting = require('../helpers/sorting')

exports.getAll = async (filters) => {
  let like = 'WHERE 1 = 1 ' // to simplify dynamic conditions syntax
  like += filters.name ? `AND name LIKE "%${filters.name}%"` : ``
  like += !!filters.noParticipate ? `AND participate = "${filters.noParticipate}"` : ``
  like += filters.gender ? `AND gender = "${filters.gender}"` : ``

  const results = await db.query(`SELECT * FROM students ${like} ORDER BY name`)

  results.forEach((student) => {
    student.available = consts.getAvailable(student)
  })

  return results
}

exports.getById = async (id) => {
  const results = await db.query('SELECT * FROM students WHERE id = ?', id)
  results[0].available = consts.getAvailable(results[0])
  return results
}

exports.createStudent = async (newStudent) => {
  const studentToInsert = {
    name: newStudent.name,
    participate: newStudent.participate,
    gender: newStudent.gender,
    hall: newStudent.hall,
    notes: newStudent.notes,
    ...consts.setAvailable(newStudent.available),
  }
  return await db.query('INSERT INTO students SET ?', studentToInsert)
}

exports.updateStudent = async (id, student) => {
  const studentToUpdate = {
    name: student.name,
    participate: student.participate,
    gender: student.gender,
    hall: student.hall,
    notes: student.notes,
    ...consts.setAvailable(student.available),
  }
  return await db.query('UPDATE students SET ? WHERE id = ?', [studentToUpdate, id])
}

exports.removeStudent = async (id) => {
  await db.query('DELETE FROM students WHERE id = ?', id)
  taskModel.removeByStudent(id)
}

exports.getSortedAvailables = async (type, options) => {
  const taskName = options.taskName
  const gender = options.gender
  const hall = options.hall
  const month = options.month
  const year = options.year
  switch (type) {
    case 'student':
      return await getAvailableStudents(taskName, hall)
    case 'helper':
      const students = await getAvailableHelpers(gender, hall)
      return students.sort(sorting.sortHelpers(taskName, month, year))
    default:
      return []
  }
}

const getAvailableStudents = async (taskName, hall) => {
  let students = await db.query(
    `
    SELECT * FROM students 
    WHERE ${consts.getAvailableName(taskName)} IS TRUE AND 
    (hall = "All" OR hall = ?) AND
    participate IS TRUE
  `,
    [hall]
  )

  students = await Promise.all(
    students.map(async (student) => {
      const tasks = await taskModel.getStudentTasks(student.id)
      // distinguish reading task from other tasks
      if (taskName === 'Reading') {
        student.tasks = tasks.filter((t) => t.task === 'Reading')
      } else {
        student.tasks = tasks.filter((t) => t.task !== 'Reading')
      }
      student.helpTasks = await taskModel.getHelpTasks(student.id)

      return student
    })
  )

  return students
}

const getAvailableHelpers = async (gender, hall) => {
  const where = `WHERE (hall = "All" OR hall = ?) AND participate IS TRUE ${gender ? `AND gender = '${gender}'` : ''} `
  const students = await db.query(`SELECT * FROM students ${where}`, [hall])

  students = await Promise.all(
    students.map(async (student) => {
      student.tasks = await taskModel.getStudentTasks(student.id)
      student.helpTasks = await taskModel.getHelpTasks(student.id)

      return student
    })
  )

  return students
}
