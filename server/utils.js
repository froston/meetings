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

exports.sortStudents = taskName => {
  return (a, b) => {
    const aTasks = a.tasks
    const bTasks = b.tasks
    const aTasksFiltered = aTasks.filter(task => task.task == taskName)
    const bTasksFiltered = bTasks.filter(task => task.task == taskName)
    // LAST TASKS FROM ALL
    const aLastTaskAll = aTasks.sort((a, b) => b.week - a.week)[0]
    const bLastLastAll = aTasks.sort((a, b) => b.week - a.week)[0]
    const aLastTaskAllSum =
      aLastTaskAll.week + aLastTaskAll.month + aLastTaskAll.year
    const bLastTaskAllSum =
      bLastLastAll.week + bLastLastAll.month + bLastLastAll.year
    // LAST TASK BY POINT
    const aLastTaskPoint = aTasksFiltered.sort((a, b) => b.week - a.week)[0]
    const bLastTaskPoint = bTasksFiltered.sort((a, b) => b.week - a.week)[0]
    const aLastTaskPointSum =
      aLastTaskPoint.week + aLastTaskPoint.month + aLastTaskPoint.year
    const bLastTaskPointSum =
      bLastTaskPoint.week + bLastTaskPoint.month + bLastTaskPoint.year
    /* 
      HAVE WORKED ON THIS POINT ALREADY 
    */
    if (aTasksFiltered.length && !bTasksFiltered.length) {
      console.log('NEVER WORKED')
      return 1
    }
    if (!aTasksFiltered.length && bTasksFiltered.length) {
      console.log('HAD WORKED')
      return -1
    }
    if (!aTasksFiltered.length && !bTasksFiltered.length) {
      console.log('BOTH NEVER WORKED')
      return 0
    }
    /* 
      LATEST TASK AND POINT DATE
    */
    if (
      aLastTaskAllSum > bLastTaskAllSum &&
      aLastTaskPointSum > bLastTaskPointSum
    ) {
      console.log('LATEST TASKS')
      return 1
    }
    if (
      bLastTaskAllSum > aLastTaskAllSum &&
      bLastTaskPointSum > aLastTaskPointSum
    ) {
      console.log('SOONER TASKS')
      return -1
    }
    /* 
      AMOUNT OF TASKS GIVEN IN TOTAL
    */
    if (aTasks.length > bTasks.length) {
      console.log('LESS TOTAL TASKS')
      return 1
    }
    if (bTasks.length > aTasks.length) {
      console.log('MORE TOTAL TASKS')
      return -1
    }
    /* 
      LAST TIME TASK GIVEN BY POINT
    */
    if (aLastTaskPointSum > bLastTaskPointSum) {
      console.log('LATEST TASKS')
      return 1
    }
    if (bLastTaskPointSum > aLastTaskPointSum) {
      console.log('SOONER TASKS')
      return -1
    }
    /* 
      AMOUNT OF TASKS GIVEN BY POINT
    */
    if (aTasksFiltered.length > bTasksFiltered.length) {
      console.log('LESS TASKS')
      return 1
    }
    if (bTasksFiltered.length > aTasksFiltered.length) {
      console.log('MORE TASKS')
      return -1
    }
    /* 
      LAST TASK DATE GIVEN EVER
    */
    if (aLastTaskAllSum > bLastTaskAllSum) {
      console.log('LATEST TASKS ALL')
      return 1
    }
    if (bLastTaskAllSum > aLastTaskAllSum) {
      console.log('SOONER TASKS ALL')
      return -1
    }
    console.log('EMPATE')
    return 0
  }
}
