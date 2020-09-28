const express = require('express')
const model = require('../models/students')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const data = await model.getAll(req.query)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    const data = await model.getById(id)
    if (data) {
      res.send(data)
    } else {
      res.status(404).send(`Student #${id} not found.`)
    }
  } catch (err) {
    next(err)
  }
})

router.get('/:id/available', async (req, res, next) => {
  const helper = req.query.helper == 'true' ? true : false
  const sortingOpt = {
    taskName: req.query.taskName,
    hall: req.query.hall,
    month: Number(req.query.month),
    year: Number(req.query.year),
  }
  try {
    const data = await model.getSortedAvailables(helper ? 'helper' : 'student', sortingOpt)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  const newStudent = req.body
  try {
    const data = await model.createStudent(newStudent)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  const id = req.params.id
  const studentToUpdate = req.body
  try {
    const data = await model.updateStudent(id, studentToUpdate)
    res.send(data)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    await model.removeStudent(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

module.exports = router
