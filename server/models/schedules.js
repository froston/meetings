const async = require('async')
const { getDb } = require('../db')
const taskModel = require('./tasks')
const studentModel = require('./students')
const config = require('../config')
const sheets = require('../helpers/sheets')
const pdf = require('../helpers/pdf/pdf')

const getAll = (query, cb) => {
  let where = ''
  if (query.year > 0) {
    where = `WHERE year = ${query.year}`
  }
  if (query.month > 0 && query.year > 0) {
    where = `WHERE month = ${query.month} AND year = ${query.year}`
  }
  getDb().query(`SELECT * FROM schedules ${where} ORDER BY year DESC, month DESC`, cb)
}

const getById = (id, cb) => {
  getDb().query('SELECT * FROM schedules WHERE id = ?', id, (err, schedules) => {
    if (err) throw err
    let schedule = schedules[0]
    taskModel.getBySchedule(schedule.month, schedule.year, (err, tasks) => {
      if (err) throw err
      async.map(
        tasks,
        (task, done) => {
          if (task.student_id > 0 && task.helper_id > 0) {
            taskModel.hasDuplicate(task.student_id, task.helper_id, (err, dup) => {
              done(err, { dup, ...task })
            })
          } else {
            done(null, task)
          }
        },
        (err, tasks) => {
          schedule.tasks = tasks
          cb(err, schedule)
        }
      )
    })
  })
}

const createSchedule = (newSchedule, mainCB) => {
  const scheduleToInsert = {
    month: Number(newSchedule.month),
    year: Number(newSchedule.year),
    weeks: Number(newSchedule.weeks)
  }
  const scheduleWeeks = Array.from({ length: newSchedule.weeks }, (v, i) => i + 1)
  const scheduleTasks = newSchedule.tasks
  const scheduleMonth = scheduleToInsert.month
  const scheduleYear = scheduleToInsert.year
  const scheduleHalls = newSchedule.hall === 'All' ? ['A', 'B'] : [newSchedule.hall]
  // create new schedule
  getDb().query('INSERT INTO schedules SET ?', scheduleToInsert, (err, res) => {
    if (err) throw err
    newSchedule.id = res.insertId
    // generate tasks for all weeks, tasks and halls
    async.eachLimit(
      scheduleWeeks,
      1,
      (week, weekCB) => {
        async.eachLimit(
          scheduleTasks[week],
          1,
          (task, taskCB) => {
            const taskName = task.includes('Return Visit') ? task.substring(3) : task
            const rvNumber = task.includes('Return Visit') ? Number(task[0]) : null
            async.eachLimit(
              scheduleHalls,
              1,
              (hall, hallCB) => {
                async.waterfall(
                  [
                    callbackFinal => {
                      // dont generate reading if 'reading only in main' checked
                      const onlyMain =
                        taskName === 'Reading' && hall === 'B' && newSchedule.hall === 'All' && newSchedule.readingMain
                      if (!onlyMain) {
                        // sorting and query options
                        const sortingOpt = {
                          taskName,
                          hall,
                          month: scheduleMonth,
                          year: scheduleYear
                        }
                        studentModel.getSortedAvailables('student', sortingOpt, (err, students) => {
                          if (err) throw err
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
                              hall: hall
                            }
                            taskModel.createTask(studentTask, (err, res) => {
                              callbackFinal(err, {
                                ...studentTask,
                                id: res.insertId,
                                gender: finalStudent.gender
                              })
                            })
                          } else {
                            callbackFinal('No students!', {})
                          }
                        })
                      } else {
                        callbackFinal(null, {})
                      }
                    },
                    (newTask, callbackHelper) => {
                      if (taskName !== 'Reading' && taskName !== 'Talk') {
                        // sorting and query options
                        const sortingOpt = {
                          taskName,
                          gender: newTask.gender,
                          month: scheduleMonth,
                          year: scheduleYear
                        }
                        studentModel.getSortedAvailables('helper', sortingOpt, (err, helpers) => {
                          if (err) throw err
                          if (helpers && helpers.length) {
                            const limit = helpers.length > config.limit ? config.limit : helpers.length
                            const flhsIndex = Math.floor(Math.random() * limit)
                            const finalHelper = helpers[flhsIndex]
                            // add helper to new task
                            const updatedHelper = {
                              helper_id: finalHelper.id
                            }
                            taskModel.updateTask(newTask.id, updatedHelper, err => {
                              callbackHelper(err)
                            })
                          } else {
                            callbackHelper('No helpers!')
                          }
                        })
                      } else {
                        callbackHelper(null)
                      }
                    }
                  ],
                  hallCB
                )
              },
              taskCB
            )
          },
          weekCB
        )
      },
      () => {
        mainCB(err, scheduleToInsert)
      }
    )
  })
}

const removeSchedule = (id, cb) => {
  getById(id, (err, res) => {
    const schedule = res
    // delete schedule
    getDb().query('DELETE FROM schedules WHERE id = ?', res.id, (err, res) => {
      // delete all related tasks
      taskModel.removeBySchedule(schedule.month, schedule.year, cb)
    })
  })
}

const generateXls = (id, lang, t, res) => {
  getById(id, (err, schedule) => {
    if (err) throw err
    sheets.generateXls(schedule, lang, t, res)
  })
}

const generatePdfs = (id, beginsWith, lang, t, res) => {
  getById(id, (err, schedule) => {
    if (err) throw err
    pdf.generatePdfs(schedule, beginsWith, lang, t, res)
  })
}

module.exports = {
  getAll,
  getById,
  createSchedule,
  removeSchedule,
  generateXls,
  generatePdfs
}
