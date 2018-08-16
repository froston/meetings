const express = require('express')
const model = require('../models/students')
const utils = require('../utils')

const router = express.Router()

router.get('/', (req, res) => {
  const name = req.query.name
  model.getAll(name, (err, students) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(students)
  })
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  model.getById(id, (err, student) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(student)
  })
})

router.get('/:id/available', (req, res) => {
  // const id = req.params.id // TODO: get all but this id
  const taskName = req.query.taskName
  const hall = req.query.hall
  const helper = req.query.helper === '1' ? true : false
  model.getAvailableStudents(taskName, hall, (err, students) => {
    if (helper) {
      students.sort(utils.sortHelpers(taskName))
    } else {
      students.sort(utils.sortStudents(taskName, hall))
    }
    if (err) {
      res.status(500).send(err)
    }
    res.send(students)
  })
})

router.post('/', (req, res) => {
  const newStudent = req.body
  model.createStudent(newStudent, (err, student) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(student)
  })
})

router.patch('/:id', (req, res) => {
  const id = req.params.id
  const studentToUpdate = req.body
  model.updateStudent(id, studentToUpdate, (err, student) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(student)
  })
})

router.delete('/:id', (req, res) => {
  const id = req.params.id
  model.removeStudent(id, err => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(204).end()
  })
})

module.exports = router
