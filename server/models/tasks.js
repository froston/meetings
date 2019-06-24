const { getDb } = require('../db')

exports.getBySchedule = (month, year, cb) => {
  getDb().query(
    `
    SELECT 
      tasks.*,
      students.name as student_name,
      students.gender as student_gender,
      helpers.name as helper_name,
      helpers.gender as helper_gender
    FROM tasks 
    LEFT JOIN students students ON students.id = tasks.student_id
    LEFT JOIN students helpers ON helpers.id = tasks.helper_id
    WHERE month = ? AND year = ?`,
    [month, year],
    cb
  )
}

exports.getAllTasks = (studentId, cb) => {
  getDb().query(
    `
    SELECT 
      tasks.*,
      students.name as student_name,
      helpers.name as helper_name
    FROM tasks 
    LEFT JOIN students students ON students.id = tasks.student_id
    LEFT JOIN students helpers ON helpers.id = tasks.helper_id
    WHERE student_id = ? OR helper_id = ?
    ORDER BY tasks.year DESC, tasks.month DESC, tasks.week DESC
  `,
    [studentId, studentId],
    cb
  )
}

exports.getStudentTasks = (studentId, cb) => {
  getDb().query(
    `
    SELECT 
      tasks.*,
      students.name as student_name
    FROM tasks 
    LEFT JOIN students ON students.id = tasks.student_id
    WHERE student_id = ?
    ORDER BY tasks.year DESC, tasks.month DESC, tasks.week DESC
  `,
    [studentId],
    cb
  )
}

exports.getHelpTasks = (helperId, cb) => {
  getDb().query(
    `
    SELECT 
      tasks.*,
      students.name as helper_name
    FROM tasks 
    LEFT JOIN students ON students.id = tasks.helper_id
    WHERE helper_id = ?
    ORDER BY tasks.year DESC, tasks.month DESC, tasks.week DESC
  `,
    [helperId],
    cb
  )
}

exports.createTask = (task, cb) => {
  const taskToInsert = {
    student_id: task.student_id,
    helper_id: task.helper_id,
    schedule_id: task.schedule_id,
    task: task.task,
    rv: task.rv,
    hall: task.hall,
    week: task.week,
    month: task.month,
    year: task.year
  }
  getDb().query('INSERT INTO tasks SET ?', taskToInsert, cb)
}

exports.updateTask = (id, taskToUpdate, cb) => {
  getDb().query('UPDATE tasks SET ? WHERE id = ?', [taskToUpdate, id], cb)
}

exports.removeTask = (id, cb) => {
  getDb().query('DELETE FROM tasks WHERE id = ?', id, cb)
}

exports.removeByStudent = (studentId, cb) => {
  getDb().query('DELETE FROM tasks WHERE student_id = ?', studentId, cb)
}

exports.removeBySchedule = (month, year, cb) => {
  getDb().query('DELETE FROM tasks WHERE month = ? && year = ?', [month, year], cb)
}

exports.hasDuplicate = (studentId, helperId, cb) => {
  getDb().query(
    `
    SELECT COUNT(*) as dupCount
    FROM tasks
    WHERE (student_id = ? AND helper_id = ?) OR (helper_id = ? AND student_id = ?) 
  `,
    [studentId, helperId, studentId, helperId],
    (err, res) => {
      cb(err, res[0] && res[0].dupCount > 1)
    }
  )
}
