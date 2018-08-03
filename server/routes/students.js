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
  const newUser = req.body
  model.createStudent(newUser, (err, student) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(student.ops)
  })
})

router.patch('/:id', (req, res) => {
  const id = req.params.id
  const userToUpdate = req.body
  model.updateStudent(id, userToUpdate, (err, student) => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(204).end()
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