const { getDb } = require('../db')
const taskModel = require('./tasks')
const studentModel = require('./students')

const getAll = (filters, cb) => {
  getDb().query('SELECT * FROM schedules', cb);
};

const getById = (id, cb) => {
  getDb().query('SELECT * FROM schedules WHERE id = ?', id, (err, res) =>
    cb(err, res[0])
  );
}

const createSchedule = (newSchedule, cb) => {
  const scheduleToInsert = {
    month: Number(newSchedule.month),
    year: Number(newSchedule.year),
    weeks: Number(newSchedule.weeks)
  }
  const weekTasks = newSchedule.tasks
  // create new schedule
  getDb().query('INSERT INTO schedules SET ?', scheduleToInsert, (err, res) => {
    const scheduleId = res.insertId
    const hall = "A" // TODO
    // generate all selected weeks
    for (let week = 1; week <= newSchedule.weeks; week++) {
      weekTasks.length && weekTasks[week].forEach(async taskName => {
        const task = {
          schedule_id: scheduleId,
          task: taskName,
          week: Number(week),
          month: Number(newSchedule.month),
          year: Number(newSchedule.year),
          hall: hall,
          completed: false
        }
        // load all available students
        const availableStudents = await studentModel.asyncGetAvailableStudents(taskName, hall)
        console.log(availableStudents.length)
        if (availableStudents.length === 1) {
          const finalStudent = availableStudents[0]
          const newTask = {
            student_id: finalStudent.id,
            point: finalStudent.nextPoint + 1,
            ...task
          }
          await taskModel.asyncCreateTask(newTask)
        } else {
          //const finalStudent = await studentModel.asyncGetFinalUser(availableStudents)
          const finalStudent = { id: 999, nextPoint: 1 }
          const newTask = {
            student_id: finalStudent.id,
            point: finalStudent.nextPoint + 1,
            ...task
          }
          await taskModel.asyncCreateTask(newTask)
        }
      })
    }
    cb(err, res)
  });
}

const updateSchedule = (id, schedule, cb) => {
}

const removeSchedule = (id, cb) => {
  getById(id, (err, res) => {
    const schedule = res
    // delete schedule
    getDb().query('DELETE FROM schedules WHERE id = ?', res.id, (err, res) => {
      // delete all related tasks
      getDb().query('DELETE FROM tasks WHERE month = ? AND year = ?', [schedule.month, schedule.year], cb)
    })
  })
}

module.exports = {
  getAll,
  getById,
  createSchedule,
  updateSchedule,
  removeSchedule
}