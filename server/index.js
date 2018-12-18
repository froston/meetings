const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const passport = require('passport')
const config = require('./config')
const router = require('./router')
const { initDb } = require('./db')
const userModel = require('./models/users')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '../client/build')))

app.use(passport.initialize())
passport.use(userModel.basicAuth())

initDb(err => {
  if (err) throw err
  app.listen(config.port, err => {
    if (err) throw err
    console.log(`Server listening on ${config.port}`)
  })
})

app.get('/unauthorized', (req, res) => {
  res.status(401).send('Unauthorized')
})

app.use('/api', passport.authenticate('basic', { session: false, failureRedirect: '/unauthorized' }), router)

app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../client/build/index.html`))
})
