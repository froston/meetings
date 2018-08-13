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

exports.sortStudents = (taskName, hall) => {
  return (a, b) => {
    const aTasks = a.tasks
    const bTasks = b.tasks
    const aTasksFiltered = aTasks.filter(task => task.task == taskName)
    const bTasksFiltered = bTasks.filter(task => task.task == taskName)
    // LAST TASKS FROM ALL
    const aLastTaskAll = aTasks[0]
    const bLastLastAll = bTasks[0]
    const aLastTaskAllSum = aLastTaskAll
      ? aLastTaskAll.week + aLastTaskAll.month + aLastTaskAll.year
      : 0
    const bLastTaskAllSum = bLastLastAll
      ? bLastLastAll.week + bLastLastAll.month + bLastLastAll.year
      : 0
    // LAST TASK BY POINT
    const aLastTaskPoint = aTasksFiltered[0]
    const bLastTaskPoint = bTasksFiltered[0]
    const aLastTaskPointSum = aLastTaskPoint
      ? aLastTaskPoint.week + aLastTaskPoint.month + aLastTaskPoint.year
      : 0
    const bLastTaskPointSum = bLastTaskPoint
      ? bLastTaskPoint.week + bLastTaskPoint.month + bLastTaskPoint.year
      : 0
    /* 
      LAST TASK DATE GIVEN EVER
    */
    if (aLastTaskAllSum > bLastTaskAllSum) {
      return 1
    }
    if (bLastTaskAllSum > aLastTaskAllSum) {
      return -1
    }
    /* 
      LAST HALL TASK IN
    */
    if (aLastTaskAll && bLastLastAll) {
      if (aLastTaskAll.hall === hall && bLastLastAll.hall !== hall) {
        return 1
      }
      if (aLastTaskAll.hall !== hall && bLastLastAll.hall === hall) {
        return -1
      }
    }
    /* 
      LATEST TASK AND POINT DATE
    */
    if (
      aLastTaskAllSum > bLastTaskAllSum &&
      aLastTaskPointSum > bLastTaskPointSum
    ) {
      return 1
    }
    if (
      bLastTaskAllSum > aLastTaskAllSum &&
      bLastTaskPointSum > aLastTaskPointSum
    ) {
      return -1
    }
    /* 
      AMOUNT OF TASKS GIVEN IN TOTAL
    */
    if (aTasks.length > bTasks.length) {
      return 1
    }
    if (bTasks.length > aTasks.length) {
      return -1
    }
    /* 
      HAVE WORKED ON THIS POINT ALREADY 
    */
    if (aTasksFiltered.length && !bTasksFiltered.length) {
      return 1
    }
    if (!aTasksFiltered.length && bTasksFiltered.length) {
      return -1
    }
    /* 
    AMOUNT OF TASKS GIVEN BY POINT
  */
    if (aTasksFiltered.length > bTasksFiltered.length) {
      return 1
    }
    if (bTasksFiltered.length > aTasksFiltered.length) {
      return -1
    }
    /* 
      LAST TIME TASK GIVEN BY POINT
    */
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
