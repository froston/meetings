const express = require('express');
const path = require('path');
const config = require('./config')
const { initDb } = require('./db')
const router = require('./router')
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

initDb(err => {
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
  res.sendFile(path.join(`${__dirname}/client/build/index.html`));
});
