const moment = require('moment')

exports.getAvailable = (student) => {
  return [
    student.reading ? { value: 'Reading' } : undefined,
    student.initial_call ? { value: 'Initial Call' } : undefined,
    student.return_visit ? { value: 'Return Visit' } : undefined,
    student.study ? { value: 'Bible Study' } : undefined,
    student.talk ? { value: 'Talk' } : undefined,
  ]
}

exports.setAvailable = (available) => {
  return {
    reading: available.find((a) => a === 'Reading') ? true : false,
    initial_call: available.find((a) => a === 'Initial Call') ? true : false,
    return_visit: available.find((a) => a === 'Return Visit') ? true : false,
    study: available.find((a) => a === 'Bible Study') ? true : false,
    talk: available.find((a) => a === 'Talk') ? true : false,
  }
}

exports.getAvailableName = (taskName) => {
  let task = ''
  switch (taskName) {
    case 'Reading':
      task = 'reading'
      break
    case 'Initial Call':
      task = 'initial_call'
      break
    case 'Return Visit':
    case '1. Return Visit':
    case '2. Return Visit':
    case '3. Return Visit':
      task = 'return_visit'
      break
    case 'Bible Study':
      task = 'study'
      break
    case 'Talk':
      task = 'talk'
      break
  }
  return task
}

exports.formatDateTime = (date) => (date ? moment(date, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss') : null)

exports.getUpdateDate = () => moment().format('YYYY-MM-DD HH:mm:ss')
