const express = require('express')
const model = require('../models/territories')

const router = express.Router()

router.get('/', (req, res) => {
  model.getAll(req.query, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  model.getById(id, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    if (!data) {
      res.status(404).send('Record not found.')
    }
    res.send(data)
  })
})

router.post('/', (req, res) => {
  const body = req.body
  model.createTerritory(body, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.patch('/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  model.updateTerritory(id, body, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.delete('/:id', (req, res) => {
  const id = req.params.id
  model.removeTerritory(id, (err) => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(204).end()
  })
})

router.post('/:id/history', (req, res) => {
  const id = req.params.id
  const body = req.body
  model.createAssignment(id, body, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.patch('/:id/history', (req, res) => {
  const id = req.params.id
  const body = req.body
  model.updateAssignment(id, body, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

module.exports = router
