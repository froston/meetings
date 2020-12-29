const db = require('../db')

exports.getBySchedule = async (month, year) => {
  return await db.query(
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
    WHERE month = ? AND year = ?
    ORDER BY FIELD(tasks.task, 'Reading', 'Initial Call', 'Return Visit', 'Bible Study', 'Talk')
    `,
    [month, year]
  )
}

exports.getAllTasks = async (studentId) => {
  return await db.query(
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
    [studentId, studentId]
  )
}

exports.getAllTasksEver = async (year) => {
  return await db.query(
    `SELECT 
      tasks.*,
      students.name as student_name,
      helpers.name as helper_name
    FROM tasks 
    LEFT JOIN students students ON students.id = tasks.student_id
    LEFT JOIN students helpers ON helpers.id = tasks.helper_id
    WHERE tasks.year = ? OR tasks.year = ?
    ORDER BY tasks.year DESC, tasks.month DESC, tasks.week DESC
  `,
    [year, year - 1]
  )
}

exports.createTask = async (task) => {
  const taskToInsert = {
    student_id: task.student_id,
    helper_id: task.helper_id,
    schedule_id: task.schedule_id,
    task: task.task,
    rv: task.rv,
    hall: task.hall,
    week: task.week,
    month: task.month,
    year: task.year,
  }
  return await db.query('INSERT INTO tasks SET ?', taskToInsert)
}

exports.updateTask = async (id, taskToUpdate) => {
  return await db.query('UPDATE tasks SET ? WHERE id = ?', [taskToUpdate, id])
}

exports.removeTask = async (id) => {
  return await db.query('DELETE FROM tasks WHERE id = ?', id)
}

exports.removeByStudent = async (studentId) => {
  return await db.query('DELETE FROM tasks WHERE student_id = ?', studentId)
}

exports.removeBySchedule = async (month, year) => {
  return await db.query('DELETE FROM tasks WHERE month = ? && year = ?', [month, year])
}

exports.hasDuplicate = async (studentId, helperId, year) => {
  const res = await db.query(
    `
    SELECT COUNT(*) as dupCount
    FROM tasks
    WHERE (student_id = ? AND helper_id = ?) OR (helper_id = ? AND student_id = ?) AND year >= ${year - 1}
  `,
    [studentId, helperId, studentId, helperId]
  )
  return res[0] && res[0].dupCount > 1
}
