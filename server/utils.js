// helpers
exports.getAvailable = student => {
  return [
    student.reading ? 'Reading' : undefined,
    student.initialCall ? 'Initial Call' : undefined,
    student.returnVisit ? 'Return Visit' : undefined,
    student.study ? 'Bible Study' : undefined,
    student.talk ? 'Talk' : undefined
  ]
}

exports.setAvailable = available => {
  return {
    reading: available.find(a => a === 'Reading') ? true : false,
    initialCall: available.find(a => a === 'Initial Call') ? true : false,
    returnVisit: available.find(a => a === 'Return Visit') ? true : false,
    study: available.find(a => a === 'Bible Study') ? true : false,
    talk: available.find(a => a === 'Talk') ? true : false
  }
}

exports.getAvailableName = taskName => {
  let task = ''
  switch (taskName) {
    case 'Reading':
      task = 'reading'
      break
    case 'Initial Call':
      task = 'initialCall'
      break
    case 'Return Visit':
      task = 'returnVisit'
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
