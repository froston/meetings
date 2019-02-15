const moment = require('moment')

const sumTask = task => (task ? Number(moment(`${task.week}/${task.month}/${task.year}`, 'D/M/YYYY').format('x')) : 0)

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
    if (hadTask(a.tasks[0], a.helpTasks[0], month, year) && !hadTask(b.tasks[0], b.helpTasks[0], month, year)) {
      return 1
    }
    if (!hadTask(a.tasks[0], a.helpTasks[0], month, year) && hadTask(b.tasks[0], b.helpTasks[0], month, year)) {
      return -1
    }
    /* LAST TIME GAVE TALK VS HELPER (ONLY SISTERS) */
    if (a.gender == 'S' && b.gender === 'S') {
      if (sumTask(a.helpTasks[0]) > sumTask(a.tasks[0]) && sumTask(b.helpTasks[0]) < sumTask(b.tasks[0])) {
        return -1
      }
      if (sumTask(a.helpTasks[0]) < sumTask(a.tasks[0]) && sumTask(b.helpTasks[0]) > sumTask(b.tasks[0])) {
        return 1
      }
    }
    /* LAST HALL TASK IN  (EXCEPT READING)*/
    if (aLastTaskAll && bLastLastAll && taskName != 'Reading') {
      if (aLastTaskAll.hall === hall && bLastLastAll.hall !== hall) {
        return 1
      }
      if (aLastTaskAll.hall !== hall && bLastLastAll.hall === hall) {
        return -1
      }
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
    if (hadTask(a.tasks[0], a.helpTasks[0], month, year) && !hadTask(b.tasks[0], b.helpTasks[0], month, year)) {
      return 1
    }
    if (!hadTask(a.tasks[0], a.helpTasks[0], month, year) && hadTask(b.tasks[0], b.helpTasks[0], month, year)) {
      return -1
    }
    /* LAST TIME GAVE TALK VS HELPER (ONLY SISTERS) */
    if (a.gender == 'S' && b.gender === 'S') {
      if (sumTask(a.helpTasks[0]) < sumTask(a.tasks[0]) && sumTask(b.helpTasks[0]) > sumTask(b.tasks[0])) {
        return -1
      }
      if (sumTask(a.helpTasks[0]) > sumTask(a.tasks[0]) && sumTask(b.helpTasks[0]) < sumTask(b.tasks[0])) {
        return 1
      }
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
    if (bTasksSum > aTasksSum) {
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
