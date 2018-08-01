const express = require('express');
const model = require('../models/students')

const router = express.Router();

router.get('/', (req, res) => {
  model.getAll(req.db, (err, users) => {
    if (err) {
      res.status(500).send(err)
    }
    if (users || users.length) {
      res.status(users.length ? 200 : 404).send(users)
    } else {
      res.status(404).end()
    }
  })
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  model.getById(req.db, id, (err, user) => {
    if (err) {
      throw err
    }
    res.send(user)
  })
})

router.post('/', (req, res) => {
  const user = req.params.user
  console.log(req.params)
  model.create(req.db, user, (user) => {
    res.status(201).send(user)
  })
})

router.patch('/:id', (req, res) => {
  const id = req.params.id
  const user = req.body
  model.update(req.db, id, user, (err, response) => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(200).send(response)
  })
})

router.delete('/:id', (req, res) => {
  const id = req.params.id
  model.remove(req.db, id, (err, response) => {
    if (err) {
      res.status(500).send(err)
    }
    res.status(200).send(response)
  })
})

module.exports = router;