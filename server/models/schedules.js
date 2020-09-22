const db = require('../db')
const taskModel = require('./tasks')
const studentModel = require('./students')
const config = require('../config')
const sheets = require('../helpers/sheets')
const pdf = require('../helpers/pdf/pdf')

const getAll = async (query) => {
  let where = ''
  if (query.year > 0) {
    where = `WHERE year = ${query.year}`
  }
  if (query.month > 0 && query.year > 0) {
    where = `WHERE month = ${query.month} AND year = ${query.year}`
  }
  return await db.query(`SELECT * FROM schedules ${where} ORDER BY year DESC, month DESC`)
}

const getById = async (id) => {
  const schedules = await db.query('SELECT * FROM schedules WHERE id = ?', id)
  let schedule = schedules[0]
  schedule.tasks = []

  let tasks = await taskModel.getBySchedule(schedule.month, schedule.year)

  await tasks.mapAsync(async (task) => {
    let dup = false
    if (task.student_id > 0 && task.helper_id > 0) {
      dup = await taskModel.hasDuplicate(task.student_id, task.helper_id)
    }
    return { dup, ...task }
  })

  schedule.tasks = tasks

  return schedule
}

const createSchedule = async (newSchedule) => {
  const scheduleToInsert = {
    month: Number(newSchedule.month),
    year: Number(newSchedule.year),
    weeks: Number(newSchedule.weeks),
  }
  const scheduleWeeks = Array.from({ length: newSchedule.weeks }, (v, i) => i + 1)
  const scheduleTasks = newSchedule.tasks
  const scheduleMonth = scheduleToInsert.month
  const scheduleYear = scheduleToInsert.year
  const scheduleHalls = newSchedule.hall === 'All' ? ['A', 'B'] : [newSchedule.hall]
  // create new schedule
  const { insertId } = await db.query('INSERT INTO schedules SET ?', scheduleToInsert)
  newSchedule.id = insertId

  await scheduleWeeks.forEachAsync(async (week) => {
    if (scheduleTasks[week]) {
      await scheduleTasks[week].forEachAsync(async (task) => {
        let taskName = task
        let rvNumber = null
        if (task.includes('Return Visit')) {
          if (task !== 'Return Visit') {
            taskName = task.substring(3)
            rvNumber = Number(task[0])
          }
        }
        await scheduleHalls.forEachAsync(async (hall) => {
          // dont generate reading if 'reading only in main' checked
          const onlyMain =
            taskName === 'Reading' && hall === 'B' && newSchedule.hall === 'All' && newSchedule.readingMain
          if (!onlyMain) {
            // sorting and query options
            const sortingOpt = {
              taskName,
              hall,
              month: scheduleMonth,
              year: scheduleYear,
            }
            const students = await studentModel.getSortedAvailables('student', sortingOpt)
            if (students && students.length) {
              const limit = students.length > config.limit ? config.limit : students.length
              const flhsIndex = Math.floor(Math.random() * limit)
              const finalStudent = students[flhsIndex]
              // assign task
              const studentTask = {
                student_id: finalStudent.id,
                schedule_id: newSchedule.id,
                task: taskName,
                rv: rvNumber,
                week: Number(week),
                month: Number(newSchedule.month),
                year: Number(newSchedule.year),
                hall: hall,
              }

              const { insertId } = await taskModel.createTask(studentTask)

              const newTask = {
                ...studentTask,
                id: insertId,
                gender: finalStudent.gender,
              }

              if (taskName !== 'Reading' && taskName !== 'Talk') {
                // sorting and query options
                const sortingOpt = {
                  taskName,
                  gender: newTask.gender,
                  month: scheduleMonth,
                  year: scheduleYear,
                }
                const helpers = await studentModel.getSortedAvailables('helper', sortingOpt)

                if (helpers && helpers.length) {
                  const limit = helpers.length > config.limit ? config.limit : helpers.length
                  const flhsIndex = Math.floor(Math.random() * limit)
                  const finalHelper = helpers[flhsIndex]
                  // add helper to new task
                  const updatedHelper = {
                    helper_id: finalHelper.id,
                  }
                  await taskModel.updateTask(newTask.id, updatedHelper)
                }
              }
            }
          }
        })
      })
    }
  })
}

const removeSchedule = async (id) => {
  const schedule = await getById(id)

  await db.query('DELETE FROM schedules WHERE id = ?', schedule.id)

  await taskModel.removeBySchedule(schedule.month, schedule.year)
}

const generateXls = async (id, lang, t, res) => {
  const schedule = await getById(id)
  sheets.generateXls(schedule, lang, t, res)
}

const generatePdfs = async (id, beginsWith, lang, t, res) => {
  const schedule = await getById(id)
  pdf.generatePdfs(schedule, beginsWith, lang, t, res)
}

module.exports = {
  getAll,
  getById,
  createSchedule,
  removeSchedule,
  generateXls,
  generatePdfs,
}
