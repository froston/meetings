const express = require('express')
const fs = require('fs')
const path = require('path')
const appConfig = require('../appConfig.json')

const router = express.Router()

const appConfigPath = path.resolve(`${__dirname}/../appConfig.json`)

router.get('/', (req, res, next) => {
  fs.readFile(appConfigPath, 'utf8', function (err, data) {
    if (err) {
      return next(err)
    }
    res.send(JSON.parse(data))
  })
})

router.post('/', (req, res, next) => {
  delete req.body.username
  const settings = {
    ...appConfig,
    terWarning: req.body.terWarning,
    terDanger: req.body.terDanger,
    flhsIndex: req.body.flhsIndex,
  }
  fs.writeFile(appConfigPath, JSON.stringify(settings), (err) => {
    if (err) {
      return next(err)
    }
    res.status(200).end()
  })
})

module.exports = router
