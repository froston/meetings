const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const config = require('./config')
const router = require('./router')
const { initDb } = require('./db')
const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, '../client/build')));

initDb(err => {
  if (err) {
    throw err;
  }
  const port = process.env.PORT || config.port;
  app.listen(port, err => {
    if (err) {
      throw err;
    }
    console.log(`Server listening on ${port}`)
  })
})

app.use('/api', router)

app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../client/build/index.html`));
});
