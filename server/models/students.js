const db = require('../db')
const taskModel = require('./tasks')
const consts = require('../helpers/consts')
const sorting = require('../helpers/sorting')

const getAll = async (filters) => {
  let like = 'WHERE 1 = 1 ' // to simplify dynamic conditions syntax
  like += filters.name ? `AND name LIKE "%${filters.name}%"` : ``
  like += !!filters.noParticipate ? `AND participate = "${filters.noParticipate}"` : ``
  like += filters.gender ? `AND gender = "${filters.gender}"` : ``

  const results = await db.query(`SELECT * FROM students ${like} ORDER BY name`)

  results.map((student) => {
    student.available = consts.getAvailable(student)
    return student
  })

  return results
}

const getById = async (id) => {
  const results = await db.query('SELECT * FROM students WHERE id = ?', id)
  results[0].available = consts.getAvailable(results[0])
  return results
}

const createStudent = async (newStudent) => {
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

const updateStudent = async (id, student) => {
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

const removeStudent = async (id) => {
  await db.query('DELETE FROM students WHERE id = ?', id)
  taskModel.removeByStudent(id)
}

const getSortedAvailables = async (type, options) => {
  const taskName = options.taskName
  const gender = options.gender
  const hall = options.hall
  const month = options.month
  const year = options.year
  switch (type) {
    case 'student':
      const students = await getAvailableStudents(taskName, hall, year)
      return students.sort(sorting.sortStudents(taskName, hall, month, year))
    case 'helper':
      const helpers = await getAvailableHelpers(gender, hall, year)
      return helpers.sort(sorting.sortHelpers(taskName, month, year))
    default:
      return []
  }
}

const getAvailableStudents = async (taskName, hall, year) => {
  let halls = [hall]
  if (hall === 'B' || hall === 'C') {
    halls = ['B', 'C']
  }
  let students = await db.query(
    `
    SELECT * FROM students 
    WHERE ${consts.getAvailableName(taskName)} IS TRUE AND 
    (hall = "All" OR hall IN (?)) AND
    participate IS TRUE
  `,
    [halls]
  )

  // FIX IT: to limit amount of queries, performance overhead
  let tasks = await taskModel.getAllTasksEver(year)

  students.map((student) => {
    let studentTasks = tasks.filter((t) => t.student_id === student.id)
    // keep all together for sorting
    student.allTasks = studentTasks

    // distinguish reading task from other tasks
    if (taskName === 'Reading') {
      student.tasks = studentTasks.filter((t) => t.task === 'Reading')
    } else {
      student.tasks = studentTasks.filter((t) => t.task !== 'Reading')
    }
    student.helpTasks = tasks.filter((t) => t.helper_id === student.id)

    return student
  })

  return students
}

const getAvailableHelpers = async (gender, hall, year) => {
  let halls = [hall]
  if (hall === 'B' || hall === 'C') {
    halls = ['B', 'C']
  }

  const where = `WHERE (hall = "All" OR hall IN (?)) AND participate IS TRUE ${
    gender ? `AND gender = '${gender}'` : ''
  } `
  const students = await db.query(`SELECT * FROM students ${where}`, [halls])

  // FIX IT: to limit amount of queries, performance overhead
  let tasks = await taskModel.getAllTasksEver(year)

  students.map((student) => {
    student.tasks = tasks.filter((t) => t.student_id === student.id)
    student.helpTasks = tasks.filter((t) => t.helper_id === student.id)
    return student
  })

  return students
}

module.exports = {
  getAll,
  getById,
  createStudent,
  updateStudent,
  removeStudent,
  getSortedAvailables,
  getSortedAvailables,
  getAvailableStudents,
  getAvailableHelpers,
}
