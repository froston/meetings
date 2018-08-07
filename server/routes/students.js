const express = require('express');
const model = require('../models/students')

const router = express.Router();

router.get('/', (req, res) => {
  const filter = req.query || {};
  model.getAll(filter, (err, students) => {
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
  model.removeStudent(id, (err) => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(204).end()
  })
})

module.exports = router;