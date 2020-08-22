const express = require('express')
const model = require('../models/numbers')

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
  model.createNumber(req.body, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.patch('/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  model.updateNumber(id, body, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.delete('/:id', (req, res) => {
  const id = req.params.id
  model.removeNumber(id, (err) => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(204).end()
  })
})

router.get('/:id/history', (req, res) => {
  const id = req.params.id
  model.getNumberHist(id, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.delete('/:id/history/:history_id', (req, res) => {
  const id = req.params.id
  const history_id = req.params.history_id
  model.removeHistory(id, history_id, (err) => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(204).end()
  })
})

module.exports = router
