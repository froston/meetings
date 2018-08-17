// helpers
exports.getAvailable = student => {
  return [
    student.reading ? 'Reading' : undefined,
    student.initial_call ? 'Initial Call' : undefined,
    student.return_visit ? 'Return Visit' : undefined,
    student.study ? 'Bible Study' : undefined,
    student.talk ? 'Talk' : undefined
  ]
}

exports.setAvailable = available => {
  return {
    reading: available.find(a => a === 'Reading') ? true : false,
    initial_call: available.find(a => a === 'Initial Call') ? true : false,
    return_visit: available.find(a => a === 'Return Visit') ? true : false,
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

const sumTask = task => (task ? task.week + task.month + task.year : 0)

const hadTask = (lastMain, lastHelper, month, year) => {
  if (lastMain && lastMain.month === month && lastMain.year === year) {
    return true
  }
  if (lastHelper && lastHelper.month === month && lastHelper.year === year) {
    return true
  }
  return false
}

exports.sortStudents = (taskName, hall, month, year) => {
  return (a, b) => {
    // ALL MAIN TASKS
    const aTasks = a.tasks
    const bTasks = b.tasks
    // TASKS FILTERED BY TASK NAME
    const aTasksFiltered = aTasks.filter(task => task.task == taskName)
    const bTasksFiltered = bTasks.filter(task => task.task == taskName)
    // TASKS EVER SUM
    const aLastTaskAll = aTasks[0]
    const bLastLastAll = bTasks[0]
    const aLastTaskAllSum = sumTask(aLastTaskAll)
    const bLastTaskAllSum = sumTask(bLastLastAll)
    // TASK BY POINT SUM
    const aLastTaskPoint = aTasksFiltered[0]
    const bLastTaskPoint = bTasksFiltered[0]
    const aLastTaskPointSum = sumTask(aLastTaskPoint)
    const bLastTaskPointSum = sumTask(bLastTaskPoint)
    /* HAD TASK THIS MONTH */
    if (hadTask(a.tasks[0], a.helpTasks[0], month, year)) {
      return 1
    }
    if (hadTask(b.tasks[0], b.helpTasks[0], month, year)) {
      return -1
    }
    /* LATEST TASK AND POINT DATE */
    if (aLastTaskAllSum > bLastTaskAllSum && aLastTaskPointSum > bLastTaskPointSum) {
      return 1
    }
    if (bLastTaskAllSum > aLastTaskAllSum && bLastTaskPointSum > aLastTaskPointSum) {
      return -1
    }
    /* LAST TASK DATE GIVEN EVER */
    if (aLastTaskAllSum > bLastTaskAllSum) {
      return 1
    }
    if (bLastTaskAllSum > aLastTaskAllSum) {
      return -1
    }
    /* LAST HALL TASK IN */
    if (aLastTaskAll && bLastLastAll) {
      if (aLastTaskAll.hall === hall && bLastLastAll.hall !== hall) {
        return 1
      }
      if (aLastTaskAll.hall !== hall && bLastLastAll.hall === hall) {
        return -1
      }
    }
    /* AMOUNT OF TASKS GIVEN IN TOTAL */
    if (aTasks.length > bTasks.length) {
      return 1
    }
    if (bTasks.length > aTasks.length) {
      return -1
    }
    /* HAVE WORKED ON THIS POINT ALREADY */
    if (aTasksFiltered.length && !bTasksFiltered.length) {
      return 1
    }
    if (!aTasksFiltered.length && bTasksFiltered.length) {
      return -1
    }
    /* AMOUNT OF TASKS GIVEN BY POINT */
    if (aTasksFiltered.length > bTasksFiltered.length) {
      return 1
    }
    if (bTasksFiltered.length > aTasksFiltered.length) {
      return -1
    }
    /* LAST TIME TASK GIVEN BY POINT  */
    if (aLastTaskPointSum > bLastTaskPointSum) {
      return 1
    }
    if (bLastTaskPointSum > aLastTaskPointSum) {
      return -1
    }
    // WELL ...
    return 0
  }
}
exports.sortHelpers = (taskName, month, year) => {
  return (a, b) => {
    // MAIN TASKS SUM
    const aTasksSum = sumTask(a.tasks[0])
    const bTasksSum = sumTask(b.tasks[0])
    // LAST TASKS FROM ALL
    const aHelperSum = sumTask(a.helpTasks[0])
    const bHelperSum = sumTask(b.helpTasks[0])
    // HELP TASKS FILTERED BY TASK NAME
    const aTasksFiltered = a.helpTasks.filter(task => task.task == taskName)
    const bTasksFiltered = b.helpTasks.filter(task => task.task == taskName)
    // LAST TIME HELPER
    const aLastHelperSum = sumTask(aTasksFiltered[0])
    const bLastHelperSum = sumTask(bTasksFiltered[0])
    /* HAD TASK THIS MONTH */
    if (hadTask(a.tasks[0], a.helpTasks[0], month, year)) {
      return 1
    }
    if (hadTask(b.tasks[0], b.helpTasks[0], month, year)) {
      return -1
    }
    /* LATEST TASK AND HELPER */
    if (aHelperSum > bHelperSum && aTasksSum > bTasksSum) {
      return 1
    }
    if (bHelperSum > aHelperSum && bTasksSum > aTasksSum) {
      return -1
    }
    /* LAST HELPER */
    if (aHelperSum > bHelperSum) {
      return 1
    }
    if (bHelperSum > aHelperSum) {
      return -1
    }
    /*  LAST TIME HELPER  */
    if (aLastHelperSum > bLastHelperSum) {
      return 1
    }
    if (bLastHelperSum > aLastHelperSum) {
      return -1
    }
    /*  LAST TASK  */
    if (aTasksSum > bTasksSum) {
      return 1
    }
    if (bLastTaskAllSum > aLastTaskAllSum) {
      return -1
    }
    /* AMOUNT OF HELP TASKS GIVEN IN TOTAL */
    if (aTasksFiltered.length > bTasksFiltered.length) {
      return 1
    }
    if (bTasksFiltered.length > aTasksFiltered.length) {
      return -1
    }
    // WELL ...
    return 0
  }
}
