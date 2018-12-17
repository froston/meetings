const { getDb } = require('../db')

exports.getBySchedule = (month, year, cb) => {
  getDb().query('SELECT * FROM tasks WHERE month = ? AND year = ?', [month, year], cb)
}

exports.getStudentTasks = (studentId, cb) => {
  getDb().query(
    `
    SELECT * FROM tasks 
    WHERE student_id = ?
    ORDER BY tasks.year DESC, tasks.month DESC, tasks.week DESC
  `,
    [studentId],
    cb
  )
}

exports.getHelperTasks = (helperId, cb) => {
  getDb().query(
    `
    SELECT * FROM tasks 
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
    student_name: task.student_name,
    helper_id: task.helper_id,
    helper_name: task.helper_name,
    schedule_id: task.schedule_id,
    task: task.task,
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

exports.removeBySchedule = (month, year, cb) => {
  getDb().query('DELETE FROM tasks WHERE month = ? && year = ?', [month, year], cb)
}
