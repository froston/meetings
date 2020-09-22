const express = require('express')
const model = require('../models/users')

const router = express.Router()

router.get('/:uid', async (req, res) => {
  const uid = req.params.uid
  try {
    const data = await model.getUserByUID(uid)
    res.send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
