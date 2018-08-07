const { getDb } = require('../db')

exports.getAll = (filters, cb) => {
  getDb().query('SELECT * FROM schedules', cb);
};

exports.getById = (id, cb) => {
  getDb().query('SELECT * FROM schedules WHERE id =', id, cb);
}

exports.createSchedule = (newSchedule, cb) => {
  const scheduleToInsert = {
    month: Number(newSchedule.month),
    year: Number(newSchedule.year)
  }
  getDb().query('INSERT INTO schedules SET ?', scheduleToInsert, cb);
}

exports.updateSchedule = (id, schedule, cb) => {
  const scheduleToUpdate = {
    month: Number(schedule.month),
    year: Number(schedule.year)
  }
  getDb().query('UPDATE schedules SET ? WHERE id = ?', [scheduleToUpdate, id], cb);

}

exports.removeSchedule = (id, cb) => {
  getDb().query('DELETE FROM schedules WHERE id = ?', id, cb)

}