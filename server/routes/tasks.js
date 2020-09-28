const express = require('express')
const model = require('../models/tasks')

const router = express.Router()

router.get('/:studentId', async (req, res, next) => {
  const studentId = req.params.studentId
  try {
    const data = await model.getAllTasks(studentId)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  const newTask = req.body
  const taskName = newTask.task
  if (taskName.includes('Return Visit')) {
    if (taskName !== 'Return Visit') {
      newTask.task = taskName.substring(3)
      newTask.rv = Number(taskName[0])
    }
  }
  try {
    const data = await model.createTask(newTask)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  const taskId = req.params.id
  const newTask = req.body
  delete newTask.username
  try {
    const data = await model.updateTask(taskId, newTask)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    await model.removeTask(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

module.exports = router
