const express = require('express')
const fs = require('fs')
const appConfig = require('../appConfig.json')

const router = express.Router()

router.get('/', (req, res) => {
  res.send(appConfig)
})

router.post('/', (req, res, next) => {
  delete req.body.username
  const settings = {
    ...appConfig,
    terWarning: req.body.terWarning,
    terDanger: req.body.terDanger,
    flhsIndex: req.body.flhsIndex,
  }
  fs.writeFile(`${__dirname}/../appConfig.json`, JSON.stringify(settings), (err) => {
    if (err) {
      return next(err)
    }
    res.status(200).end()
  })
})

module.exports = router
