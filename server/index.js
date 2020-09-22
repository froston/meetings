const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const i18next = require('i18next')
const i18nextMiddleware = require('i18next-express-middleware')
const Backend = require('i18next-node-fs-backend')

const auth = require('./auth/firebase')
const config = require('./config')
const router = require('./router')
const { initDb } = require('./db')
require('./helpers/async')

const app = express()

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '../client/build')))
app.use('/locales', express.static(path.join(__dirname, 'locales')))

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
    },
    ns: ['common'],
    defaultNS: 'common',
    fallbackLng: 'es',
    preload: ['en', 'es', 'cs'],
    keySeparator: false, // we use content as keys
  })

app.use(i18nextMiddleware.handle(i18next))

initDb((err) => {
  if (err) throw err
  app.listen(config.port, (err) => {
    if (err) throw err
    console.log(`Server listening on ${config.port}`)
  })
})

app.use('/api', auth.validateToken, router)

app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../client/build/index.html`))
})
