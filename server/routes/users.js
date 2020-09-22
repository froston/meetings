const express = require('express')
const model = require('../models/users')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const data = await model.getAll()
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/:uid', async (req, res) => {
  const uid = req.params.uid
  try {
    const data = await model.getUserByUID(uid)
    if (!data) {
      res.status(404).send({ message: req.t('userNotFound') })
    }
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/', async (req, res) => {
  try {
    const data = await model.createUser(req.body)
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.patch('/:id', async (req, res) => {
  const id = req.params.id
  const body = req.body
  try {
    const data = await model.updateUser(id, body)
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  try {
    await model.removeUser(id)
    res.status(204).end()
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
