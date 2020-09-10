const express = require('express')
const model = require('../models/users')

const router = express.Router()

router.get('/', (req, res) => {
  model.getAll((err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.get('/:uid', (req, res) => {
  const uid = req.params.uid
  model.getUserByUID(uid, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    if (!data) {
      res.status(404).send({ message: req.t('userNotFound') })
    }
    res.send(data)
  })
})

router.post('/', (req, res) => {
  model.createUser(req.body, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.patch('/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  model.updateUser(id, body, (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(data)
  })
})

router.delete('/:id', (req, res) => {
  const id = req.params.id
  model.removeUser(id, (err) => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(204).end()
  })
})

module.exports = router
