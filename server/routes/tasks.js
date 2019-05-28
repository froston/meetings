const express = require('express')
const model = require('../models/tasks')

const router = express.Router()

router.get('/:studentId', (req, res) => {
  const studentId = req.params.studentId
  model.getAllTasks(studentId, (err, tasks) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(tasks)
  })
})

router.post('/', (req, res) => {
  const newTask = req.body
  const taskName = newTask.task
  if (taskName.includes('Return Visit')) {
    newTask.task = taskName.substring(3)
    newTask.rv = Number(taskName[0])
  }
  model.createTask(newTask, (err, task) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(task)
  })
})

router.patch('/:id', (req, res) => {
  const taskId = req.params.id
  const newTask = req.body
  model.updateTask(taskId, newTask, (err, task) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(task)
  })
})

router.delete('/:id', (req, res) => {
  const id = req.params.id
  model.removeTask(id, err => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(204).end()
  })
})

module.exports = router
